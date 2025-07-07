import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Wappalyzer from 'wappalyzer';
import { extractColors, type ColorResult } from './lib/color-extraction.js';
import { SupabaseCacheService } from './lib/supabase.js';
import { analyzeAccessibility, extractSecurityHeaders } from '../client/src/lib/accessibility.js';
import crypto from 'crypto';
import { scrapePageData } from './lib/page-scraper';
import playwright from 'playwright';

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

// Helper function to analyze SEO and create checks
function analyzeSEO(html: string, url: string) {
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '';
  const description = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)?.[1] || '';
  const keywords = html.match(/<meta[^>]*name="keywords"[^>]*content="([^"]*)"[^>]*>/i)?.[1] || '';
  const h1Tags = (html.match(/<h1[^>]*>(.*?)<\/h1>/gi) || []).length;
  const imageTagsWithAlt = (html.match(/<img[^>]*alt="[^"]*"[^>]*>/gi) || []).length;
  const imageTags = (html.match(/<img[^>]*>/gi) || []).length;
  const viewport = html.match(/<meta[^>]*name="viewport"[^>]*>/i);
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*>/i);

  const checks = [
    {
      check: 'Title Tag',
      status: title && title.length >= 30 && title.length <= 60 ? 'good' : title ? 'warning' : 'error',
      description: title ? `Title: "${title}" (${title.length} characters)` : 'No title tag found',
      recommendation: title ? 
        (title.length < 30 ? 'Title is too short (< 30 chars)' : 
         title.length > 60 ? 'Title is too long (> 60 chars)' : 
         'Title length is optimal') : 'Add a descriptive title tag'
    },
    {
      check: 'Meta Description',
      status: description && description.length >= 120 && description.length <= 160 ? 'good' : description ? 'warning' : 'error',
      description: description ? `Description: "${description}" (${description.length} characters)` : 'No meta description found',
      recommendation: description ? 
        (description.length < 120 ? 'Description is too short (< 120 chars)' : 
         description.length > 160 ? 'Description is too long (> 160 chars)' : 
         'Description length is optimal') : 'Add a meta description'
    },
    {
      check: 'Heading Structure',
      status: h1Tags === 1 ? 'good' : h1Tags > 1 ? 'warning' : 'error',
      description: `Found ${h1Tags} H1 tag(s)`,
      recommendation: h1Tags === 1 ? 'H1 structure is correct' : 
        h1Tags > 1 ? 'Multiple H1 tags found - use only one per page' : 
        'Add an H1 tag to the page'
    },
    {
      check: 'Image Alt Text',
      status: imageTags === 0 ? 'good' : imageTagsWithAlt === imageTags ? 'good' : 
        imageTagsWithAlt > imageTags * 0.8 ? 'warning' : 'error',
      description: `${imageTagsWithAlt}/${imageTags} images have alt text`,
      recommendation: imageTags === 0 ? 'No images to check' :
        imageTagsWithAlt === imageTags ? 'All images have alt text' :
        `Add alt text to ${imageTags - imageTagsWithAlt} missing images`
    },
    {
      check: 'Mobile Viewport',
      status: viewport ? 'good' : 'error',
      description: viewport ? 'Viewport meta tag present' : 'No viewport meta tag found',
      recommendation: viewport ? 'Mobile viewport is configured' : 'Add viewport meta tag for mobile responsiveness'
    },
    {
      check: 'Canonical URL',
      status: canonical ? 'good' : 'warning',
      description: canonical ? 'Canonical link tag present' : 'No canonical URL found',
      recommendation: canonical ? 'Canonical URL is set' : 'Consider adding canonical link tag'
    }
  ];

  const goodChecks = checks.filter(c => c.status === 'good').length;
  const score = Math.round((goodChecks / checks.length) * 100);

  return {
    score,
    title,
    description,
    keywords,
    checks
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

  // Create HTTP server
  const server = createServer(app);

  // Quick analysis endpoint - returns overview data immediately from HTML analysis only
  app.get('/api/analyze/quick', async (req, res) => {
    try {
      const { url } = req.query;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      console.log('🚀 Quick analysis for:', url);

      // Generate cache key
      const urlHash = generateUrlHash(url);

      // Check in-memory cache first
      const inMemoryCached = inMemoryCache.get(`quick_${urlHash}`);
      if (inMemoryCached && Date.now() - inMemoryCached.timestamp < IN_MEMORY_CACHE_TTL) {
        console.log('⚡ Quick analysis from memory cache');
        return res.json(inMemoryCached.data);
      }

      // Try Supabase cache
      const cached = await SupabaseCacheService.get(urlHash);
      if (cached) {
        console.log('🗄️ Quick analysis from Supabase cache');
        inMemoryCache.set(`quick_${urlHash}`, { data: cached.analysis_data, timestamp: Date.now() });
        return res.json(cached.analysis_data);
      }

      // Fetch HTML for quick analysis
      const startTime = Date.now();
      const htmlResponse = await fetch(url, { 
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SiteAnalyzer/1.0)' },
        timeout: 10000
      });
      const html = await htmlResponse.text();
      logTiming('HTML fetch (quick)', startTime);

      // Extract basic data
      const extractedImageUrls = extractImageUrls(html);
      const ui = buildUIData({ extractedImageUrls });
      const seo = analyzeSEO(html, url);

      const quickData = {
        url,
        timestamp: new Date().toISOString(),
        data: {
          overview: {
            overallScore: Math.round((seo.score + 85) / 2), // Average of SEO score and estimated performance
            pageLoadTime: Math.round((Date.now() - startTime) / 1000 * 100) / 100,
            seoScore: seo.score,
            userExperienceScore: 85, // Estimated score for quick analysis
            coreWebVitals: {
              lcp: null,
              fid: null,
              cls: null,
              fcp: null,
              lcp_benchmark: 2.5,
              fid_benchmark: 100,
              cls_benchmark: 0.1,
              fcp_benchmark: 1.8
            }
          },
          performance: {
            score: null,
            metrics: {
              fcp: null,
              lcp: null,
              cls: null,
              fid: null,
              si: null,
              tbt: null
            }
          },
          seo,
          ui,
          accessibility: {
            violations: []
          },
          technical: {
            loadTime: Math.round((Date.now() - startTime) / 1000 * 100) / 100,
            responseTime: htmlResponse.headers.get('server-timing') || 'N/A'
          }
        }
      };

      // Cache the results
      inMemoryCache.set(`quick_${urlHash}`, { data: quickData, timestamp: Date.now() });
      
      res.json(quickData);

    } catch (error) {
      console.error('Error in quick analysis:', error);
      res.status(500).json({ error: 'Failed to analyze website' });
    }
  });

  // Full analysis endpoint - returns complete analysis with PSI data and caching
  app.get('/api/analyze/full', async (req, res) => {
    try {
      const { url } = req.query;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      console.log('🚀 Full analysis for:', url);

      // Generate cache key
      const urlHash = generateUrlHash(url);

      // Check in-memory cache first
      const inMemoryCached = inMemoryCache.get(`full_${urlHash}`);
      if (inMemoryCached && Date.now() - inMemoryCached.timestamp < IN_MEMORY_CACHE_TTL) {
        console.log('⚡ Full analysis from memory cache');
        return res.json(inMemoryCached.data);
      }

      // Try Supabase cache
      const cached = await SupabaseCacheService.get(urlHash);
      if (cached) {
        console.log('🗄️ Full analysis from Supabase cache');
        inMemoryCache.set(`full_${urlHash}`, { data: cached.analysis_data, timestamp: Date.now() });
        return res.json(cached.analysis_data);
      }

      // Perform full analysis with PSI data
      const startTime = Date.now();
      
      // Parallel fetch HTML and PSI data
      const [htmlResponse, psiData] = await Promise.all([
        fetch(url, { 
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SiteAnalyzer/1.0)' },
          timeout: 10000
        }),
        fetchPageSpeedOverview(url)
      ]);

      const html = await htmlResponse.text();
      logTiming('HTML + PSI fetch (full)', startTime);

      // Extract data
      const extractedImageUrls = extractImageUrls(html);
      const ui = buildUIData({ extractedImageUrls });
      const accessibility = analyzeAccessibility(html);
      const headers = Object.fromEntries(htmlResponse.headers.entries());
      const securityHeaders = extractSecurityHeaders(headers);
      const seo = analyzeSEO(html, url);

      // Override SEO score with PSI data if available
      if (psiData?.lighthouseResult?.categories?.seo?.score) {
        seo.score = Math.round(psiData.lighthouseResult.categories.seo.score * 100);
      }

      const performanceScore = psiData?.lighthouseResult?.categories?.performance?.score ? 
        Math.round(psiData.lighthouseResult.categories.performance.score * 100) : null;
      const accessibilityScore = psiData?.lighthouseResult?.categories?.accessibility?.score ? 
        Math.round(psiData.lighthouseResult.categories.accessibility.score * 100) : 
        Math.max(0, Math.round((1 - accessibility.length / 50) * 100));
      
      // Calculate overall score
      const scores = [performanceScore, seo.score, accessibilityScore].filter(s => s !== null);
      const overallScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 75;

      const fullData = {
        url,
        timestamp: new Date().toISOString(),
        data: {
          overview: {
            overallScore,
            pageLoadTime: Math.round((Date.now() - startTime) / 1000 * 100) / 100,
            seoScore: seo.score,
            userExperienceScore: accessibilityScore,
            coreWebVitals: {
              lcp: psiData?.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue || null,
              fid: psiData?.lighthouseResult?.audits?.['max-potential-fid']?.numericValue || null,
              cls: psiData?.lighthouseResult?.audits?.['cumulative-layout-shift']?.numericValue || null,
              fcp: psiData?.lighthouseResult?.audits?.['first-contentful-paint']?.numericValue || null,
              lcp_benchmark: 2.5,
              fid_benchmark: 100,
              cls_benchmark: 0.1,
              fcp_benchmark: 1.8
            }
          },
          performance: {
            score: performanceScore,
            metrics: {
              fcp: psiData?.lighthouseResult?.audits?.['first-contentful-paint']?.numericValue || null,
              lcp: psiData?.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue || null,
              cls: psiData?.lighthouseResult?.audits?.['cumulative-layout-shift']?.numericValue || null,
              fid: psiData?.lighthouseResult?.audits?.['max-potential-fid']?.numericValue || null,
              si: psiData?.lighthouseResult?.audits?.['speed-index']?.numericValue || null,
              tbt: psiData?.lighthouseResult?.audits?.['total-blocking-time']?.numericValue || null
            }
          },
          seo,
          ui,
          accessibility: {
            violations: accessibility,
            score: accessibilityScore
          },
          technical: {
            loadTime: Math.round((Date.now() - startTime) / 1000 * 100) / 100,
            responseTime: htmlResponse.headers.get('server-timing') || 'N/A',
            securityHeaders
          }
        }
      };

      // Cache the results
      await SupabaseCacheService.set(urlHash, url, fullData);
      inMemoryCache.set(`full_${urlHash}`, { data: fullData, timestamp: Date.now() });
      
      res.json(fullData);

    } catch (error) {
      console.error('Error in full analysis:', error);
      res.status(500).json({ error: 'Failed to analyze website' });
    }
  });

  // Legacy analysis endpoint (redirects to full analysis)
  app.get('/api/analyze', async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      // Redirect to full analysis
      const fullAnalysisUrl = `/api/analyze/full?url=${encodeURIComponent(url)}`;
      res.redirect(fullAnalysisUrl);
    } catch (error) {
      console.error('Error in legacy analysis:', error);
      res.status(500).json({ error: 'Failed to analyze website' });
    }
  });

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
      console.error('Error in colors endpoint:', error);
      res.status(500).json({ error: 'Failed to extract colors' });
    }
  });

  // Accessibility analysis endpoint with caching
  app.post('/api/accessibility', async (req, res) => {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      // Generate cache key for accessibility
      const urlHash = crypto.createHash('sha256').update(`accessibility:${url}`).digest('hex');

      // Try to get from cache first
      const cached = await SupabaseCacheService.get(urlHash);
      if (cached) {
        console.log(`🗄️  Returning cached accessibility for: ${url}`);
        return res.json(cached.analysis_data);
      }

      console.log(`Analyzing accessibility for: ${url}`);

      // Fetch HTML and run accessibility analysis
      const htmlResponse = await fetch(url, { 
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SiteAnalyzer/1.0)' }
      });
      const html = await htmlResponse.text();

      const violations = analyzeAccessibility(html);
      const headers = Object.fromEntries(htmlResponse.headers.entries());
      const securityHeaders = extractSecurityHeaders(headers);

      const accessibilityData = {
        violations,
        securityHeaders,
        score: Math.max(0, Math.round((1 - violations.length / 50) * 100))
      };

      console.log(`Found ${violations.length} accessibility violations`);

      // Cache the results
      await SupabaseCacheService.set(urlHash, url, accessibilityData);

      res.json(accessibilityData);

    } catch (error) {
      console.error('Error in accessibility endpoint:', error);
      res.status(500).json({ error: 'Failed to analyze accessibility' });
    }
  });

  // Font analysis endpoint with caching  
  app.post('/api/fonts', async (req, res) => {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      // Generate cache key for fonts
      const urlHash = crypto.createHash('sha256').update(`fonts:${url}`).digest('hex');

      // Try to get from cache first
      const cached = await SupabaseCacheService.get(urlHash);
      if (cached) {
        console.log(`🗄️  Returning cached fonts for: ${url}`);
        return res.json(cached.analysis_data);
      }

      console.log(`Analyzing fonts for: ${url}`);

      // Launch Playwright for font analysis
      const browser = await playwright.chromium.launch();
      const page = await browser.newPage();

      try {
        await page.goto(url, { waitUntil: 'networkidle' });

        // Extract fonts from the page
        const fonts = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('body *'));
          const seenFamilies = new Set();
          const results = [];

          for (const el of elements) {
            const styles = getComputedStyle(el);
            const { fontFamily, fontWeight } = styles;

            // Clean up font family name
            const cleanFontFamily = fontFamily.split(',')[0].replace(/['"]/g, '').trim();

            if (seenFamilies.has(cleanFontFamily) || !cleanFontFamily) continue;
            seenFamilies.add(cleanFontFamily);

            // Determine font category
            const lowerFamily = cleanFontFamily.toLowerCase();
            let category = 'display';
            if (['times', 'georgia', 'serif'].some(font => lowerFamily.includes(font))) {
              category = 'serif';
            } else if (['arial', 'helvetica', 'sans-serif'].some(font => lowerFamily.includes(font))) {
              category = 'sans-serif';
            } else if (['courier', 'monaco', 'monospace'].some(font => lowerFamily.includes(font))) {
              category = 'monospace';
            }

            // Determine usage context
            const tagName = el.tagName.toLowerCase();
            const fontSize = parseFloat(styles.fontSize);
            let usage = 'body';

            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
              usage = 'heading';
            } else if (fontSize > 24) {
              usage = 'display';
            } else if (fontSize < 14) {
              usage = 'caption';
            }

            results.push({
              name: cleanFontFamily,
              category,
              usage,
              weight: fontWeight,
              isLoaded: true, // If we can analyze it, it's loaded
              isPublic: ['Arial', 'Helvetica', 'Times', 'Georgia', 'Courier'].some(sys => 
                cleanFontFamily.toLowerCase().includes(sys.toLowerCase())
              )
            });
          }

          return results;
        });

        console.log(`Extracted ${fonts.length} unique fonts`);

        // Cache the results
        await SupabaseCacheService.set(urlHash, url, fonts);

        res.json(fonts);

      } finally {
        await browser.close();
      }

    } catch (error) {
      console.error('Error in fonts endpoint:', error);
      res.status(500).json({ error: 'Failed to analyze fonts' });
    }
  });

  return server;
};