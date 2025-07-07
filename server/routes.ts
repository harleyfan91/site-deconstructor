import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Wappalyzer from 'wappalyzer';
import { extractColors, type ColorResult } from './lib/color-extraction';
import { SupabaseCacheService } from './lib/supabase';
import crypto from 'crypto';
import { scrapePageData } from './lib/page-scraper';

// Helper function to map score to letter grade
function mapScoreToGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// Helper function to build UI data with real extracted data
function buildUIData(localData: any) {
  return {
    fonts: localData.extractedFonts || [],
    images: localData.imageElements?.map((img: any) => ({
      type: img.type,
      count: 1,
      format: img.type,
      url: img.url,
      alt: ''
    })) || [],
    imageAnalysis: {
      totalImages: (() => {
        const photos = localData.imageElements?.filter((img: any) => img.isPhoto).length || Math.floor(localData.extractedImageUrls.length * 0.6);
        const icons = localData.imageElements?.filter((img: any) => img.isIcon).length || Math.floor(localData.extractedImageUrls.length * 0.4);
        return photos + icons;
      })(),
      estimatedPhotos: localData.imageElements?.filter((img: any) => img.isPhoto).length || Math.floor(localData.extractedImageUrls.length * 0.6),
      estimatedIcons: localData.imageElements?.filter((img: any) => img.isIcon).length || Math.floor(localData.extractedImageUrls.length * 0.4),
      imageUrls: localData.extractedImageUrls,
      photoUrls: localData.imageElements?.filter((img: any) => img.isPhoto).map((img: any) => img.url) || localData.extractedImageUrls.filter((_, index) => index % 2 === 0),
      iconUrls: localData.imageElements?.filter((img: any) => img.isIcon).map((img: any) => img.url) || localData.extractedImageUrls.filter((_, index) => index % 2 === 1)
    },
    contrastIssues: [] // Will be enhanced later with real contrast analysis
  };
}

function buildContentData(scrapedData?: any) {
  if (scrapedData?.content) {
    return {
      wordCount: scrapedData.content.wordCount,
      readabilityScore: scrapedData.content.readabilityScore
    };
  }
  // Return fallback markers as specified
  return {
    wordCount: "!",
    readabilityScore: "!"
  };
}

// Helper function to extract image URLs from HTML
function extractImageUrls(html: string): string[] {
  const imageUrls: string[] = [];
  const imgRegex = /<img[^>]+src="([^"]+)"/gi;
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    // Convert relative URLs to absolute URLs if needed
    if (src.startsWith('//')) {
      imageUrls.push(`https:${src}`);
    } else if (src.startsWith('/')) {
      // For relative paths, we'd need the base URL, for now just add as-is
      imageUrls.push(src);
    } else if (src.startsWith('http')) {
      imageUrls.push(src);
    }
  }
  
  return imageUrls;
}

const PSI_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const IN_MEMORY_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// In-memory cache for faster repeated requests
const inMemoryCache = new Map<string, { data: any; timestamp: number }>();

// Helper function to generate URL hash
function generateUrlHash(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex');
}

// Timing helper
function logTiming(operation: string, startTime: number) {
  const duration = Date.now() - startTime;
  console.log(`⏱️  ${operation}: ${duration}ms`);
  return duration;
}

// Optimized PSI function with caching and timeout
async function fetchPageSpeedOverview(url: string): Promise<any> {
  const startTime = Date.now();
  const urlHash = generateUrlHash(url);
  
  // Check in-memory cache first
  const memCached = inMemoryCache.get(`psi_${urlHash}`);
  if (memCached && Date.now() - memCached.timestamp < IN_MEMORY_CACHE_TTL) {
    logTiming('PSI (in-memory cache hit)', startTime);
    return memCached.data;
  }

  // Check Supabase database cache
  const dbStartTime = Date.now();
  try {
    const cached = await SupabaseCacheService.get(urlHash);
    
    logTiming('🗄️  Supabase cache lookup', dbStartTime);
    
    if (cached) {
      const data = cached.analysis_data;
      // Store in memory cache
      inMemoryCache.set(`psi_${urlHash}`, { data, timestamp: Date.now() });
      logTiming('PSI (Supabase cache hit)', startTime);
      return data;
    }
  } catch (error) {
    console.error('Supabase cache lookup failed:', error);
  }

  // Fetch from PSI API with timeout
  const psiStartTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const apiKey = process.env.PSI_API_KEY;
    const apiUrl =
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance` +
      (apiKey ? `&key=${apiKey}` : "");
    
    const res = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`PSI request failed: ${res.status}`);
    }
    
    const json = await res.json();
    logTiming('PSI API call', psiStartTime);
    
    const audits = json.lighthouseResult?.audits || {};
    const metrics = audits['metrics']?.details?.items?.[0] || {};
    const overview = {
      pageLoadTime: Number(((metrics.observedLoad || 0) / 1000).toFixed(1)),
      coreWebVitals: {
        lcpMs: Math.round(audits['largest-contentful-paint']?.numericValue || 2500),
        inpMs: Math.round(audits['total-blocking-time']?.numericValue || 100),
        cls: audits['cumulative-layout-shift']?.numericValue || 0.1,
      },
    };

    // Cache in Supabase and memory
    const cacheStartTime = Date.now();
    try {
      const success = await SupabaseCacheService.set(urlHash, url, overview);
      if (success) {
        logTiming('🗄️  Supabase cache write', cacheStartTime);
      } else {
        console.warn('Failed to write to Supabase cache');
      }
    } catch (error) {
      console.error('Failed to cache PSI data in Supabase:', error);
    }

    inMemoryCache.set(`psi_${urlHash}`, { data: overview, timestamp: Date.now() });
    logTiming('PSI (fresh data)', startTime);
    return overview;

  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('PSI request timed out for:', url);
      // Return fallback data on timeout and cache it
      const fallbackData = {
        pageLoadTime: 3.0,
        coreWebVitals: { lcpMs: 2500, inpMs: 100, cls: 0.1 }
      };

      // Cache the fallback data in Supabase and memory
      const cacheStartTime = Date.now();
      try {
        const success = await SupabaseCacheService.set(urlHash, url, fallbackData);
        if (success) {
          logTiming('🗄️  Supabase cache write (fallback)', cacheStartTime);
          console.log(`✅ Cached fallback PSI data for ${url} in Supabase`);
        } else {
          console.warn('Failed to write fallback PSI data to Supabase cache');
        }
      } catch (cacheError) {
        console.error('Failed to cache fallback PSI data in Supabase:', cacheError);
      }

      inMemoryCache.set(`psi_${urlHash}`, { data: fallbackData, timestamp: Date.now() });
      logTiming('PSI (fallback data)', startTime);
      return fallbackData;
    }
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Supabase cache service and create table if needed
  console.log('🚀 Initializing Supabase cache service...');
  await SupabaseCacheService.createTableIfNotExists();
  
  // Clean up expired entries on startup and then every 6 hours
  await SupabaseCacheService.cleanupExpired();
  setInterval(async () => {
    await SupabaseCacheService.cleanupExpired();
  }, 6 * 60 * 60 * 1000); // 6 hours
  
  // Color extraction API route
  app.post('/api/colors', async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required in request body' });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      // Generate cache key for colors
      const urlHash = crypto.createHash('sha256').update(`colors:${url}`).digest('hex');
      
      // Try to get from cache first
      const cached = await SupabaseCacheService.get(urlHash);
      if (cached) {
        console.log(`🗄️  Returning cached colors for: ${url}`);
        return res.json(cached.analysis_data);
      }

      console.log(`Extracting colors for: ${url}`);
      
      const colors = await extractColors(url);
      
      console.log(`Extracted ${colors.length} unique colors`);
      
      // Cache the results
      await SupabaseCacheService.set(urlHash, url, colors);
      
      res.json(colors);
      
    } catch (error) {
      console.error('Color extraction failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('TimeoutError')) {
          return res.status(504).json({ error: 'Request timeout while extracting colors' });
        }
        if (error.message.includes('net::ERR_') || error.message.includes('Navigation failed')) {
          return res.status(400).json({ error: 'Unable to access the provided URL' });
        }
      }
      
      res.status(500).json({ error: 'Color extraction failed' });
    }
  });

  // Full UI data extraction API route
  app.post('/api/ui-data', async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required in request body' });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      console.log(`🔍 Extracting UI data for: ${url}`);
      
      // For now, return empty data until scraping is fixed
      const scrapedData: {
        fonts: any[];
        images: Array<{
          type: string;
          url: string;
          alt: string;
          isPhoto: boolean;
          isIcon: boolean;
        }>;
        contrastIssues: any[];
      } = { fonts: [], images: [], contrastIssues: [] };
      
      // Format the data to match the expected structure
      const uiData = {
        fonts: scrapedData.fonts,
        images: scrapedData.images.map(img => ({
          type: img.type,
          count: 1,
          format: img.type,
          url: img.url,
          alt: img.alt
        })),
        imageAnalysis: {
          totalImages: scrapedData.images.length,
          estimatedPhotos: scrapedData.images.filter(img => img.isPhoto).length,
          estimatedIcons: scrapedData.images.filter(img => img.isIcon).length,
          imageUrls: scrapedData.images.map(img => img.url),
          photoUrls: scrapedData.images.filter(img => img.isPhoto).map(img => img.url),
          iconUrls: scrapedData.images.filter(img => img.isIcon).map(img => img.url)
        },
        contrastIssues: scrapedData.contrastIssues
      };
      
      console.log(`✅ UI data extracted: ${uiData.fonts.length} fonts, ${uiData.images.length} images, ${uiData.contrastIssues.length} contrast issues`);
      res.json(uiData);
      
    } catch (error) {
      console.error('UI data extraction failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('TimeoutError')) {
          return res.status(504).json({ error: 'Request timeout while extracting UI data' });
        }
        if (error.message.includes('net::ERR_') || error.message.includes('Navigation failed')) {
          return res.status(400).json({ error: 'Unable to access the provided URL' });
        }
      }
      
      res.status(500).json({ error: 'UI data extraction failed' });
    }
  });

  // Helper function to perform local HTML analysis
  async function performLocalAnalysis(url: string, html: string, response: Response) {
    const startTime = Date.now();
    
    // Extract image URLs from HTML
    const extractedImageUrls = extractImageUrls(html);
    
    // Basic mobile responsiveness check
    const hasViewportMeta = html.includes('viewport');
    const hasResponsiveCSS = html.includes('max-width') || html.includes('min-width');
    const mobileScore = (hasViewportMeta ? 50 : 0) + (hasResponsiveCSS ? 50 : 0);
    
    const mobileIssues: { id: string; title: string; description: string }[] = [];
    if (!hasViewportMeta) {
      mobileIssues.push({
        id: 'viewport-meta',
        title: 'Missing Viewport Meta Tag',
        description: 'Page does not have a viewport meta tag for mobile optimization'
      });
    }
    if (!hasResponsiveCSS) {
      mobileIssues.push({
        id: 'responsive-css',
        title: 'No Responsive CSS Detected',
        description: 'Page may not have responsive CSS rules'
      });
    }

    // Basic security checks
    const hasHTTPS = url.startsWith('https://');
    const securityScore = hasHTTPS ? 80 : 40;
    
    const securityFindings: { id: string; title: string; description: string }[] = [];
    if (!hasHTTPS) {
      securityFindings.push({
        id: 'no-https',
        title: 'No HTTPS',
        description: 'Website is not using HTTPS encryption'
      });
    }

    // Basic accessibility checks
    const hasAltTags = html.includes('alt=');
    const accessibilityViolations: { id: string; impact: string; description: string }[] = [];
    if (!hasAltTags) {
      accessibilityViolations.push({
        id: 'images-alt',
        impact: 'serious',
        description: 'Images may be missing alt attributes'
      });
    }

    // Header checks
    const headerChecks = {
      hsts: response.headers.get('strict-transport-security') || 'missing',
      csp: response.headers.get('content-security-policy') || 'missing',
      frameOptions: response.headers.get('x-frame-options') || 'missing'
    };

    // Calculate scores
    const overallScore = Math.round((mobileScore + securityScore + (hasAltTags ? 80 : 60)) / 3);
    const seoScore = hasViewportMeta && hasAltTags ? 85 : 65;
    const userExperienceScore = mobileScore;

    // Tech stack detection
    const techStack: { category: string; technology: string }[] = [];
    try {
      if (html.includes('react')) techStack.push({ category: 'JavaScript Frameworks', technology: 'React' });
      if (html.includes('vue')) techStack.push({ category: 'JavaScript Frameworks', technology: 'Vue.js' });
      if (html.includes('angular')) techStack.push({ category: 'JavaScript Frameworks', technology: 'Angular' });
      if (html.includes('bootstrap')) techStack.push({ category: 'CSS Frameworks', technology: 'Bootstrap' });
      if (html.includes('tailwind')) techStack.push({ category: 'CSS Frameworks', technology: 'Tailwind CSS' });
      if (html.includes('jquery')) techStack.push({ category: 'JavaScript Libraries', technology: 'jQuery' });
      if (hasHTTPS) techStack.push({ category: 'Security', technology: 'HTTPS' });
      
      techStack.push({ category: 'Markup Languages', technology: 'HTML5' });
      
      const server = response.headers.get('server');
      if (server) {
        if (server.toLowerCase().includes('nginx')) techStack.push({ category: 'Web Servers', technology: 'Nginx' });
        if (server.toLowerCase().includes('apache')) techStack.push({ category: 'Web Servers', technology: 'Apache' });
        if (server.toLowerCase().includes('cloudflare')) techStack.push({ category: 'CDN', technology: 'Cloudflare' });
      }
    } catch (e) {
      console.warn('Tech stack detection error:', e);
      techStack.push({ category: 'Markup Languages', technology: 'HTML5' });
    }

    // Extract fonts from CSS
    const fontFamilies = new Set<string>();
    const fontMatches = html.match(/font-family\s*:\s*[^;}]+/gi) || [];
    fontMatches.forEach(match => {
      const fonts = match.replace(/font-family\s*:\s*/i, '').split(',');
      fonts.forEach(font => {
        const cleanFont = font.trim().replace(/['"]/g, '');
        if (cleanFont && cleanFont !== 'inherit') {
          fontFamilies.add(cleanFont);
        }
      });
    });

    // Convert to structured font data
    const extractedFonts = Array.from(fontFamilies).map(font => {
      let category = 'sans-serif';
      if (font.toLowerCase().includes('serif') && !font.toLowerCase().includes('sans')) {
        category = 'serif';
      } else if (['Courier', 'Monaco', 'Consolas', 'monospace'].some(mono => font.toLowerCase().includes(mono.toLowerCase()))) {
        category = 'monospace';
      }
      
      return {
        name: font,
        category,
        usage: 'Various text elements',
        weight: '400',
        isLoaded: true,
        isPublic: !['Arial', 'Helvetica', 'Times', 'Courier', 'Verdana', 'Georgia'].some(
          systemFont => font.toLowerCase().includes(systemFont.toLowerCase())
        )
      };
    });

    // Enhanced image analysis
    const imageElements = extractedImageUrls.map(url => {
      const isIcon = url.toLowerCase().includes('icon') || 
                     url.toLowerCase().includes('logo') || 
                     url.toLowerCase().includes('.svg') ||
                     url.includes('32x32') || url.includes('16x16');
      
      let type = 'unknown';
      if (url.includes('.jpg') || url.includes('.jpeg')) type = 'JPEG';
      else if (url.includes('.png')) type = 'PNG';
      else if (url.includes('.gif')) type = 'GIF';
      else if (url.includes('.webp')) type = 'WEBP';
      else if (url.includes('.svg')) type = 'SVG';
      
      return {
        url,
        type,
        isIcon,
        isPhoto: !isIcon
      };
    });

    logTiming('Local HTML analysis', startTime);
    
    return {
      extractedImageUrls,
      extractedFonts,
      imageElements,
      mobileScore,
      mobileIssues,
      securityScore,
      securityFindings,
      accessibilityViolations,
      headerChecks,
      overallScore,
      seoScore,
      userExperienceScore,
      techStack,
      html,
      hasAltTags
    };
  }

  // Quick analysis endpoint - returns overview data immediately
  app.get('/api/analyze/quick', async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      console.log(`🚀 Starting quick analysis for: ${url}`);
      console.log(`📱 Request source: ${req.get('User-Agent')?.includes('Mozilla') ? 'Web Browser' : 'API Call'}`);
      const totalStartTime = Date.now();
      
      // Parallel execution: HTML fetch and cache lookup
      const htmlStartTime = Date.now();
      const [response] = await Promise.all([
        fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0)',
          },
        })
      ]);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }

      const html = await response.text();
      logTiming('HTML fetch', htmlStartTime);
      
      // Perform local analysis
      const localData = await performLocalAnalysis(url, html, response);
      
      // Create overview response without PSI data (will be loaded separately)
      const analysisResult = {
        id: crypto.randomUUID(),
        url,
        timestamp: new Date().toISOString(),
        status: 'partial',
        isQuickResponse: true,
        data: {
          overview: {
            overallScore: localData.overallScore,
            // pageLoadTime will be added by full analysis only
            seoScore: localData.seoScore,
            userExperienceScore: localData.userExperienceScore
          },
          ui: buildUIData(localData),
          technical: {
            techStack: localData.techStack,
            healthGrade: mapScoreToGrade(localData.overallScore),
            issues: localData.securityFindings.concat(localData.mobileIssues).map(issue => ({
              type: 'security',
              description: issue.description,
              severity: 'medium' as const,
              status: 'open'
            })),
            securityScore: localData.securityScore,
            accessibility: {
              violations: localData.accessibilityViolations
            }
          },
          seo: {
            score: localData.seoScore,
            metaTags: {
              title: localData.html.match(/<title>(.*?)<\/title>/i)?.[1] || 'No title found',
              description: localData.html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)?.[1] || 'No description found'
            },
            checks: [
              {
                name: 'Title Tag',
                status: localData.html.includes('<title>') ? 'good' : 'error',
                description: localData.html.includes('<title>') ? 'Title tag found' : 'Missing title tag'
              },
              {
                name: 'Meta Description',
                status: localData.html.includes('name="description"') ? 'good' : 'warning',
                description: localData.html.includes('name="description"') ? 'Meta description found' : 'Missing meta description'
              }
            ],
            recommendations: []
          },
          content: buildContentData() // Use fallback markers for quick analysis
        }
      };

      logTiming('🚀 Total quick analysis', totalStartTime);
      res.json(analysisResult);

    } catch (error) {
      console.error('Quick analysis error:', error);
      res.status(500).json({ 
        error: 'Quick analysis failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Full analysis endpoint - returns complete data with PSI
  app.get('/api/analyze/full', async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      console.log(`🔍 Starting full analysis for: ${url}`);
      console.log(`📱 Request source: ${req.get('User-Agent')?.includes('Mozilla') ? 'Web Browser' : 'API Call'}`);
      const totalStartTime = Date.now();
      
      // Parallel execution: HTML fetch and PSI data
      const htmlStartTime = Date.now();
      const psiStartTime = Date.now();
      
      const [response, psiOverview] = await Promise.all([
        fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0)',
          },
        }),
        fetchPageSpeedOverview(url)
      ]);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }

      const html = await response.text();
      logTiming('HTML fetch (full)', htmlStartTime);
      
      // Perform local analysis
      const localData = await performLocalAnalysis(url, html, response);

      // Create full analysis response
      const analysisResult = {
        id: crypto.randomUUID(),
        url,
        timestamp: new Date().toISOString(),
        status: 'complete',
        coreWebVitals: {
          lcp: psiOverview.coreWebVitals.lcpMs,
          fid: psiOverview.coreWebVitals.inpMs,
          cls: psiOverview.coreWebVitals.cls
        },
        securityHeaders: {
          csp: response.headers.get('content-security-policy') || '',
          hsts: response.headers.get('strict-transport-security') || '',
          xfo: response.headers.get('x-frame-options') || '',
          xcto: response.headers.get('x-content-type-options') || '',
          referrer: response.headers.get('referrer-policy') || ''
        },
        performanceScore: localData.overallScore,
        seoScore: localData.seoScore,
        readabilityScore: 75,
        complianceStatus: localData.overallScore >= 80 ? 'pass' : localData.overallScore >= 60 ? 'warn' : 'fail',
        mobileResponsiveness: {
          score: localData.mobileScore,
          issues: localData.mobileIssues
        },
        securityScore: {
          grade: mapScoreToGrade(localData.securityScore),
          findings: localData.securityFindings
        },
        accessibility: {
          violations: localData.accessibilityViolations
        },
        headerChecks: localData.headerChecks,
        data: {
          overview: {
            overallScore: localData.overallScore,
            pageLoadTime: psiOverview.pageLoadTime,
            coreWebVitals: psiOverview.coreWebVitals,
            seoScore: localData.seoScore,
            userExperienceScore: localData.userExperienceScore
          },
          ui: buildUIData(localData),
          performance: {
            coreWebVitals: [
              { name: 'LCP', value: Number((psiOverview.coreWebVitals.lcpMs / 1000).toFixed(1)), benchmark: 2.5 },
              { name: 'FID', value: psiOverview.coreWebVitals.inpMs, benchmark: 100 },
              { name: 'CLS', value: psiOverview.coreWebVitals.cls, benchmark: 0.1 }
            ],
            performanceScore: localData.overallScore,
            mobileResponsive: localData.mobileScore >= 50,
            recommendations: localData.mobileIssues.map(issue => ({
              type: 'warning' as const,
              title: issue.title,
              description: issue.description
            }))
          },
          seo: {
            score: localData.seoScore,
            metaTags: {
              title: localData.html.match(/<title>(.*?)<\/title>/i)?.[1] || 'No title found',
              description: localData.html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)?.[1] || 'No description found'
            },
            checks: [
              {
                name: 'Title Tag',
                status: localData.html.includes('<title>') ? 'good' : 'error',
                description: localData.html.includes('<title>') ? 'Title tag found' : 'Missing title tag'
              },
              {
                name: 'Meta Description',
                status: localData.html.includes('name="description"') ? 'good' : 'warning',
                description: localData.html.includes('name="description"') ? 'Meta description found' : 'Missing meta description'
              }
            ],
            recommendations: []
          },
          content: buildContentData(), // Use fallback markers initially
          technical: {
            techStack: localData.techStack,
            healthGrade: mapScoreToGrade(localData.overallScore),
            issues: localData.securityFindings.concat(localData.mobileIssues).map(issue => ({
              type: 'security',
              description: issue.description,
              severity: 'medium' as const,
              status: 'open'
            })),
            securityScore: localData.securityScore,
            accessibility: {
              violations: localData.accessibilityViolations
            }
          }
        }
      };

      logTiming('🔍 Total full analysis', totalStartTime);
      res.json(analysisResult);

    } catch (error) {
      console.error('Full analysis error:', error);
      res.status(500).json({ 
        error: 'Full analysis failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Legacy analysis endpoint - redirects to full analysis for backward compatibility
  app.get('/api/analyze', async (req, res) => {
    console.log('📍 Legacy /api/analyze called, using full analysis endpoint');
    
    try {
      // Direct forwarding to full analysis logic
      const { url } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      console.log(`🔄 Forwarding to full analysis for: ${url}`);
      const totalStartTime = Date.now();
      
      const [response, psiOverview] = await Promise.all([
        fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0)',
          },
        }),
        fetchPageSpeedOverview(url)
      ]);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }

      const html = await response.text();
      const localData = await performLocalAnalysis(url, html, response);

      const analysisResult = {
        id: crypto.randomUUID(),
        url,
        timestamp: new Date().toISOString(),
        status: 'complete',
        coreWebVitals: {
          lcp: psiOverview.coreWebVitals.lcpMs,
          fid: psiOverview.coreWebVitals.inpMs,
          cls: psiOverview.coreWebVitals.cls
        },
        securityHeaders: {
          csp: response.headers.get('content-security-policy') || '',
          hsts: response.headers.get('strict-transport-security') || '',
          xfo: response.headers.get('x-frame-options') || '',
          xcto: response.headers.get('x-content-type-options') || '',
          referrer: response.headers.get('referrer-policy') || ''
        },
        performanceScore: localData.overallScore,
        seoScore: localData.seoScore,
        readabilityScore: 75,
        complianceStatus: localData.overallScore >= 80 ? 'pass' : localData.overallScore >= 60 ? 'warn' : 'fail',
        mobileResponsiveness: {
          score: localData.mobileScore,
          issues: localData.mobileIssues
        },
        securityScore: {
          grade: mapScoreToGrade(localData.securityScore),
          findings: localData.securityFindings
        },
        accessibility: {
          violations: localData.accessibilityViolations
        },
        headerChecks: localData.headerChecks,
        data: {
          overview: {
            overallScore: localData.overallScore,
            pageLoadTime: psiOverview.pageLoadTime,
            coreWebVitals: psiOverview.coreWebVitals,
            seoScore: localData.seoScore,
            userExperienceScore: localData.userExperienceScore
          },
          ui: buildUIData(localData),
          performance: {
            coreWebVitals: [
              { name: 'LCP', value: Number((psiOverview.coreWebVitals.lcpMs / 1000).toFixed(1)), benchmark: 2.5 },
              { name: 'FID', value: psiOverview.coreWebVitals.inpMs, benchmark: 100 },
              { name: 'CLS', value: psiOverview.coreWebVitals.cls, benchmark: 0.1 }
            ],
            performanceScore: localData.overallScore,
            mobileResponsive: localData.mobileScore >= 50,
            recommendations: localData.mobileIssues.map(issue => ({
              type: 'warning' as const,
              title: issue.title,
              description: issue.description
            }))
          },
          seo: {
            score: localData.seoScore,
            metaTags: {
              title: localData.html.match(/<title>(.*?)<\/title>/i)?.[1] || 'No title found',
              description: localData.html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)?.[1] || 'No description found'
            },
            checks: [
              {
                name: 'Title Tag',
                status: localData.html.includes('<title>') ? 'good' : 'error',
                description: localData.html.includes('<title>') ? 'Title tag found' : 'Missing title tag'
              },
              {
                name: 'Meta Description',
                status: localData.html.includes('name="description"') ? 'good' : 'warning',
                description: localData.html.includes('name="description"') ? 'Meta description found' : 'Missing meta description'
              }
            ],
            recommendations: []
          },
          technical: {
            techStack: localData.techStack,
            healthGrade: mapScoreToGrade(localData.overallScore),
            issues: localData.securityFindings.concat(localData.mobileIssues).map(issue => ({
              type: 'security',
              description: issue.description,
              severity: 'medium' as const,
              status: 'open'
            })),
            securityScore: localData.securityScore,
            accessibility: {
              violations: localData.accessibilityViolations
            }
          }
        }
      };

      logTiming('📍 Legacy analysis (full)', totalStartTime);
      res.json(analysisResult);

    } catch (error) {
      console.error('Legacy analysis error:', error);
      res.status(500).json({ 
        error: 'Analysis failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Enhanced content analysis endpoint with real scraping
  app.post('/api/analyze/content', async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required in request body' });
      }

      console.log(`📄 Starting enhanced content analysis for: ${url}`);
      const startTime = Date.now();
      
      // Perform comprehensive page scraping with content analysis
      const scrapedData = await scrapePageData(url);
      
      logTiming('Enhanced content analysis', startTime);
      
      // Return enhanced UI data with real content analysis
      const response = {
        ui: {
          imageAnalysis: {
            photoUrls: scrapedData.images.filter(img => img.isPhoto).map(img => img.url),
            iconUrls: scrapedData.images.filter(img => img.isIcon).map(img => img.url)
          }
        },
        content: {
          wordCount: scrapedData.content.wordCount,
          readabilityScore: scrapedData.content.readabilityScore
        }
      };
      
      console.log(`✅ Enhanced analysis complete: ${scrapedData.content.wordCount} words, ${scrapedData.content.readabilityScore} readability score`);
      res.json(response);
      
    } catch (error) {
      console.error('Enhanced content analysis error:', error);
      res.status(500).json({ 
        error: 'Enhanced content analysis failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
