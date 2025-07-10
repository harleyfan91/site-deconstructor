import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Removed deprecated Wappalyzer - using pattern-based detection instead
import { extractColors, type ColorResult } from './lib/color-extraction';
import { SupabaseCacheService } from './lib/supabase';
import * as crypto from 'crypto';
import { scrapePageData } from './lib/page-scraper';
import { extractSEOData, type SEOData } from './lib/seo-extractor';
import { getTechnicalAnalysis, type TechnicalAnalysis } from './lib/tech-extractor';
import { getLighthouseSEO, getLighthousePerformance, getLighthouseBestPractices, getLighthousePageLoadTime } from './lib/lighthouse-service';
import { getAccessibilityAnalysis } from './lib/axe-integration';
import { getEnhancedTechAnalysis } from './lib/enhanced-tech-analysis';

// Helper function to map score to letter grade
function mapScoreToGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// Helper function to build UI data with real extracted data
function buildUIData(scrapedData: any) {
  try {
    // Adapt to the actual scraping data structure
    const fonts = Array.isArray(scrapedData?.fonts) ? scrapedData.fonts : [];
    const images = Array.isArray(scrapedData?.images) ? scrapedData.images : [];
    const imageUrls = images.length > 0 ? images.map((img: any) => img?.url || img || '') : [];
    
    return {
      fonts: fonts,
      images: images.map((img: any) => ({
        type: img?.type || 'unknown',
        count: 1,
        format: img?.type || 'unknown',
        url: img?.url || img || '',
        alt: img?.alt || ''
      })),
      imageAnalysis: {
        totalImages: images.length,
        estimatedPhotos: images.filter((img: any) => img?.isPhoto).length || Math.floor(images.length * 0.6),
        estimatedIcons: images.filter((img: any) => img?.isIcon).length || Math.floor(images.length * 0.4),
        imageUrls: imageUrls,
        photoUrls: images.filter((img: any) => img?.isPhoto).map((img: any) => img?.url || img || '') || [],
        iconUrls: images.filter((img: any) => img?.isIcon).map((img: any) => img?.url || img || '') || []
      },
      contrastIssues: Array.isArray(scrapedData?.contrastIssues) ? scrapedData.contrastIssues : []
    };
  } catch (error) {
    console.error('buildUIData error:', error);
    // Return safe fallback data
    return {
      fonts: [],
      images: [],
      imageAnalysis: {
        totalImages: 0,
        estimatedPhotos: 0,
        estimatedIcons: 0,
        imageUrls: [],
        photoUrls: [],
        iconUrls: []
      },
      contrastIssues: []
    };
  }
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

function buildSEOData(seoData?: SEOData, lhrData?: any) {
  if (!seoData) {
    return null; // Return null when no real data is available
  }

  // Enhance with Lighthouse SEO data if available
  let enhancedChecks = [...seoData.checks];
  let enhancedScore = seoData.score;
  
  if (lhrData?.categories?.seo) {
    const lighthouseSEOScore = Math.round(lhrData.categories.seo.score * 100);
    
    // Blend our score with Lighthouse score (weighted average)
    enhancedScore = Math.round((seoData.score * 0.7) + (lighthouseSEOScore * 0.3));
    
    // Add Lighthouse-specific checks
    if (lhrData.audits?.['document-title']?.score === 1) {
      const existingTitleCheck = enhancedChecks.find(c => c.name === 'Title Tag');
      if (existingTitleCheck && existingTitleCheck.status !== 'good') {
        existingTitleCheck.status = 'good';
        existingTitleCheck.description = 'Title tag is present and well-optimized (Lighthouse verified)';
      }
    }
    
    if (lhrData.audits?.['meta-description']?.score === 1) {
      const existingDescCheck = enhancedChecks.find(c => c.name === 'Meta Description');
      if (existingDescCheck && existingDescCheck.status !== 'good') {
        existingDescCheck.status = 'good';
        existingDescCheck.description = 'Meta description is present and well-optimized (Lighthouse verified)';
      }
    }
  }

  return {
    score: enhancedScore,
    checks: enhancedChecks,
    recommendations: seoData.recommendations,
    metaTags: seoData.metaTags,
    keywords: seoData.keywords,
    headings: seoData.headings,
    hasRobotsTxt: seoData.hasRobotsTxt,
    hasSitemap: seoData.hasSitemap,
    structuredData: seoData.structuredData
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

const LIGHTHOUSE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
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



export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Supabase cache service and create table if needed
  console.log('🚀 Initializing Supabase cache service...');
  await SupabaseCacheService.createTableIfNotExists();
  
  // Clean up expired entries on startup and then every 6 hours
  await SupabaseCacheService.cleanupExpired();
  setInterval(async () => {
    await SupabaseCacheService.cleanupExpired();
  }, 6 * 60 * 60 * 1000); // 6 hours
  
  // Performance analysis endpoint with Lighthouse page load times
  app.get('/api/performance', async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      console.log('⚡ Getting performance data for:', url);
      
      // Get page load times from Lighthouse (both desktop and mobile)
      const pageLoadTimeData = await getLighthousePageLoadTime(url);
      
      // Get Core Web Vitals from Lighthouse Performance analysis
      const lighthousePerformance = await getLighthousePerformance(url);
      
      const performanceData = {
        coreWebVitals: {
          lcp: lighthousePerformance.metrics.largestContentfulPaint?.numericValue / 1000 || 2.5,
          fid: lighthousePerformance.metrics.firstInputDelay?.numericValue || 100,
          cls: lighthousePerformance.metrics.cumulativeLayoutShift?.numericValue || 0.1
        },
        pageLoadTime: pageLoadTimeData
      };
      
      console.log(`✅ Performance data: PLT Desktop ${pageLoadTimeData.desktop}ms, Mobile ${pageLoadTimeData.mobile}ms`);
      res.json(performanceData);
      
    } catch (error) {
      console.error('Performance analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze website performance' });
    }
  });

  // Tech analysis endpoint - Enhanced with Lighthouse Best Practices
  app.post('/api/tech', async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required in request body' });
      }
      
      console.log('🔧 Running enhanced tech analysis (lightweight + Lighthouse) for:', url);
      
      // Use enhanced tech analysis combining lightweight and Lighthouse
      const { getEnhancedTechAnalysis } = await import('./lib/enhanced-tech-analysis');
      const technicalAnalysis = await getEnhancedTechAnalysis(url);
      
      res.json(technicalAnalysis);
    } catch (error) {
      console.error('Enhanced technical analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze website technology' });
    }
  });

  // Color extraction API route with caching
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
      const colorsCacheKey = `colors_${generateUrlHash(url)}`;
      
      // Check cache first
      const cachedColors = await SupabaseCacheService.get(colorsCacheKey);
      if (cachedColors) {
        console.log(`🎨 Color cache hit for: ${url}`);
        return res.json(cachedColors.analysis_data);
      }

      console.log(`🎨 Extracting colors for: ${url}`);
      const extractStartTime = Date.now();
      
      // Use original color extraction
      const { extractColors } = await import('./lib/color-extraction');
      const colors = await extractColors(url);
      
      // Format as expected by frontend
      const colorAnalysis = { colors };
      
      logTiming('Color extraction', extractStartTime);
      console.log(`Extracted ${colorAnalysis.colors.length} unique colors`);
      
      // Cache the results
      await SupabaseCacheService.set(colorsCacheKey, url, colorAnalysis);
      console.log(`✅ Cached color data for ${url}`);
      
      res.json(colorAnalysis);
      
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

  // Font analysis API route with caching
  app.post('/api/fonts', async (req, res) => {
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

      // Generate cache key for fonts
      const fontsCacheKey = `fonts_${generateUrlHash(url)}`;
      
      // Check cache first
      const cachedFonts = await SupabaseCacheService.get(fontsCacheKey);
      if (cachedFonts) {
        console.log(`🔤 Font cache hit for: ${url}`);
        return res.json(cachedFonts.analysis_data);
      }

      console.log(`🔤 Extracting fonts for: ${url}`);
      const extractStartTime = Date.now();
      
      // Extract fonts using the scrapePageData function
      const scrapedData = await scrapePageData(url);
      const fonts = scrapedData.fonts;
      
      logTiming('Font extraction', extractStartTime);
      console.log(`Extracted ${fonts.length} fonts`);
      
      // Cache the results
      await SupabaseCacheService.set(fontsCacheKey, url, fonts);
      console.log(`✅ Cached font data for ${url}`);
      
      res.json(fonts);
      
    } catch (error) {
      console.error('Font extraction failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('TimeoutError')) {
          return res.status(504).json({ error: 'Request timeout while extracting fonts' });
        }
        if (error.message.includes('net::ERR_') || error.message.includes('Navigation failed')) {
          return res.status(400).json({ error: 'Unable to access the provided URL' });
        }
      }
      
      res.status(500).json({ error: 'Font extraction failed' });
    }
  });

  // Content analysis endpoint
  app.post('/api/content', async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required in request body' });
      }

      console.log('📄 Extracting content data for:', url);
      
      const scrapedData = await scrapePageData(url);
      const contentData = buildContentData(scrapedData);
      
      console.log(`✅ Content data extracted: ${contentData.wordCount} words, readability score ${contentData.readabilityScore}`);
      res.json(contentData);
      
    } catch (error) {
      console.error('Content analysis failed:', error);
      res.status(500).json({ error: 'Content analysis failed' });
    }
  });

  // UI data extraction API route  
  app.get('/api/ui', async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      console.log(`🔍 Extracting UI data for: ${url}`);
      
      const scrapedData = await scrapePageData(url);
      const uiData = buildUIData(scrapedData);
      
      console.log(`✅ UI data extracted: ${uiData.fonts.length} fonts, ${uiData.images.length} images, ${uiData.contrastIssues.length} contrast issues`);
      res.json(uiData);
      
    } catch (error) {
      console.error('UI data extraction failed:', error);
      res.status(500).json({ error: 'UI data extraction failed' });
    }
  });

  // Overview aggregator endpoint - fetches data from specialized routes
  app.get('/api/overview', async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      console.log('📊 Aggregating overview data for:', url);
      
      // Call all specialized endpoints and handle failures gracefully
      const results = await Promise.allSettled([
        // SEO data
        extractSEOData(url).catch(error => {
          console.warn('⚠️  SEO analysis missing for overview:', error.message);
          return null;
        }),
        // Tech data  
        getEnhancedTechAnalysis(url).catch(error => {
          console.warn('⚠️  Tech analysis missing for overview:', error.message);
          return null;
        }),
        // Performance data (Core Web Vitals + Page Load Time)
        (async () => {
          try {
            const [pageLoadTimeData, lighthousePerformance] = await Promise.all([
              getLighthousePageLoadTime(url),
              getLighthousePerformance(url)
            ]);
            return {
              pageLoadTime: pageLoadTimeData,
              coreWebVitals: {
                lcp: lighthousePerformance.metrics.largestContentfulPaint?.numericValue / 1000 || 2.5,
                fid: lighthousePerformance.metrics.firstInputDelay?.numericValue || 100,
                cls: lighthousePerformance.metrics.cumulativeLayoutShift?.numericValue || 0.1
              }
            };
          } catch (error) {
            console.warn('⚠️  Performance analysis missing for overview:', error.message);
            return null;
          }
        })(),
        // UI data
        scrapePageData(url).then(data => buildUIData(data)).catch(error => {
          console.warn('⚠️  UI analysis missing for overview:', error.message);
          return null;
        }),
        // Content data
        scrapePageData(url).then(data => buildContentData(data)).catch(error => {
          console.warn('⚠️  Content analysis missing for overview:', error.message);
          return null;
        })
      ]);
      
      const [seoResult, techResult, performanceResult, uiResult, contentResult] = results;
      
      // Extract data from results, using "!" for missing data
      const seoData = seoResult.status === 'fulfilled' ? seoResult.value : null;
      const techData = techResult.status === 'fulfilled' ? techResult.value : null;
      const performanceData = performanceResult.status === 'fulfilled' ? performanceResult.value : null;
      const uiData = uiResult.status === 'fulfilled' ? uiResult.value : null;
      const contentData = contentResult.status === 'fulfilled' ? contentResult.value : null;
      
      // Build overview response with "!" for permanently missing data
      const overviewData = {
        overview: {
          overallScore: seoData?.score || "!",
          seoScore: seoData?.score || "!",
          pageLoadTime: performanceData?.pageLoadTime?.desktop || "!",
          coreWebVitals: performanceData?.coreWebVitals || { lcp: "!", fid: "!", cls: "!" },
          userExperienceScore: "!" // No reliable source for this metric
        },
        seo: seoData || { score: "!", checks: [] },
        tech: techData || { techStack: [{ category: "Unknown", technology: "!" }] },
        performance: {
          coreWebVitals: performanceData?.coreWebVitals || { lcp: "!", fid: "!", cls: "!" },
          pageLoadTime: performanceData?.pageLoadTime || { desktop: "!", mobile: "!" }
        },
        ui: uiData || { fonts: [], images: [], imageAnalysis: { totalImages: "!" } },
        content: contentData || { wordCount: "!", readabilityScore: "!" }
      };
      
      console.log('✅ Overview aggregation completed');
      res.json(overviewData);
      
    } catch (error) {
      console.error('Overview aggregation error:', error);
      res.status(500).json({ error: 'Failed to aggregate overview data' });
    }
  });

  // Deleted: performLocalAnalysis function removed as part of quick analysis deprecation

  // Main analysis endpoint - optimized for faster response
  app.get('/api/analyze/full', async (req, res) => {
    try {
      let { url, immediate } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      // Normalize URL by adding https:// if no protocol is specified
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }

      const isImmediate = immediate === 'true';
      console.log(`🔍 Starting ${isImmediate ? 'immediate' : 'comprehensive'} analysis for: ${url}`);
      console.log(`📱 Request source: ${req.get('User-Agent')?.includes('Mozilla') ? 'Web Browser' : 'API Call'}`);
      const totalStartTime = Date.now();
      
      // Step 1: HTML fetch and local analysis (immediate response)
      const htmlStartTime = Date.now();
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }

      const html = await response.text();
      logTiming('HTML fetch (immediate)', htmlStartTime);
      
      // If immediate=true, return just local scraped data quickly
      if (isImmediate) {
        console.log('⚡ Returning immediate local analysis only');
        
        // Do basic page scraping without heavy analysis
        const scrapedData = await scrapePageData(url);
        const immediateData = {
          ui: buildUIData(scrapedData),
          content: buildContentData(scrapedData),
          seo: { metaTags: scrapedData.metaTags || {} },
          overview: {
            overallScore: '!', // Marker for loading state
            seoScore: '!',
            performanceScore: '!',
            securityScore: '!',
            accessibilityScore: '!'
          }
        };
        
        const responseData = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          url,
          data: immediateData,
          title: scrapedData.title || url,
          description: scrapedData.metaTags?.description || `Analysis of ${url}`,
          loadingComplete: false,
          immediateDataReady: true
        };
        
        logTiming('⚡ Immediate analysis', totalStartTime);
        return res.json(responseData);
      }
      
      // Simplified full analysis - use aggregated data from specialized endpoints

      // Use the new aggregated approach via /api/overview
      console.log('🔄 Redirecting to aggregated overview endpoint');
      
      // Make internal call to overview aggregator
      const overviewResponse = await fetch(`http://localhost:5000/api/overview?url=${encodeURIComponent(url)}`);
      
      if (!overviewResponse.ok) {
        throw new Error('Overview aggregation failed');
      }
      
      const overviewData = await overviewResponse.json();
      
      // Format response to maintain backward compatibility
      const analysisResult = {
        id: crypto.randomUUID(),
        url,
        timestamp: new Date().toISOString(),
        status: 'complete',
        coreWebVitals: {
          lcp: overviewData.performance.coreWebVitals.lcp,
          fid: overviewData.performance.coreWebVitals.fid,
          cls: overviewData.performance.coreWebVitals.cls
        },
        securityHeaders: {
          csp: response.headers.get('content-security-policy') || '',
          hsts: response.headers.get('strict-transport-security') || '',
          xfo: response.headers.get('x-frame-options') || '',
          xcto: response.headers.get('x-content-type-options') || '',
          referrer: response.headers.get('referrer-policy') || ''
        },
        performanceScore: overviewData.overview.overallScore,
        seoScore: overviewData.overview.seoScore,
        readabilityScore: overviewData.content.readabilityScore,
        complianceStatus: overviewData.overview.overallScore >= 80 ? 'pass' : overviewData.overview.overallScore >= 60 ? 'warn' : 'fail',
        data: overviewData
      };

      logTiming('🔍 Total aggregated analysis', totalStartTime);
      res.json(analysisResult);

    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ 
        error: 'Analysis failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Legacy analysis endpoint - redirects to main analysis for backward compatibility
  app.get('/api/analyze', async (req, res) => {
    console.log('📍 Legacy /api/analyze called, using main analysis endpoint');
    
    try {
      // Direct forwarding to full analysis logic
      const { url } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      console.log(`🔄 Forwarding to main analysis for: ${url}`);
      const totalStartTime = Date.now();
      
      const [response, lighthousePerformance] = await Promise.all([
        fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0)',
          },
        }),
        getLighthousePerformance(url)
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
          lcp: lighthousePerformance.metrics.largestContentfulPaint?.numericValue / 1000 || 2.5,
          fid: lighthousePerformance.metrics.firstInputDelay?.numericValue || 100,
          cls: lighthousePerformance.metrics.cumulativeLayoutShift?.numericValue || 0.1
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
            pageLoadTime: 3.0, // Fallback value for legacy endpoint
            coreWebVitals: {
              lcpMs: lighthousePerformance.metrics.largestContentfulPaint?.numericValue || 2500,
              inpMs: lighthousePerformance.metrics.firstInputDelay?.numericValue || 100,
              cls: lighthousePerformance.metrics.cumulativeLayoutShift?.numericValue || 0.1
            },
            seoScore: localData.seoScore,
            userExperienceScore: localData.userExperienceScore
          },
          ui: buildUIData(localData),
          performance: {
            coreWebVitals: [
              { name: 'LCP', value: Number((lighthousePerformance.metrics.largestContentfulPaint?.numericValue / 1000 || 2.5).toFixed(1)), benchmark: 2.5 },
              { name: 'FID', value: lighthousePerformance.metrics.firstInputDelay?.numericValue || 100, benchmark: 100 },
              { name: 'CLS', value: lighthousePerformance.metrics.cumulativeLayoutShift?.numericValue || 0.1, benchmark: 0.1 }
            ],
            performanceScore: localData.overallScore,
            mobileResponsive: localData.mobileScore >= 50,
            recommendations: localData.mobileIssues.map(issue => ({
              type: 'warning' as const,
              title: issue.title,
              description: issue.description
            }))
          },
          // SEO data excluded from legacy endpoint - use dedicated /api/seo endpoint
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

  // SEO data extraction API route with caching
  app.post('/api/seo', async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required in request body' });
      }

      // Normalize URL
      let normalizedUrl = url.trim();
      if (!normalizedUrl.match(/^https?:\/\//)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      // Validate URL format
      try {
        new URL(normalizedUrl);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      console.log(`🔍 Starting SEO analysis for: ${normalizedUrl}`);
      const overallStartTime = Date.now();
      
      const urlHash = generateUrlHash(normalizedUrl);
      const seosCacheKey = `seo_${urlHash}`;
      
      // Check cache first
      const cachedSEO = await SupabaseCacheService.get(seosCacheKey);
      if (cachedSEO) {
        console.log(`🔍 SEO cache hit for: ${normalizedUrl}`);
        logTiming('🔍 Total SEO analysis (cached)', overallStartTime);
        return res.json(cachedSEO.analysis_data);
      }

      console.log(`🔍 Extracting SEO data for: ${normalizedUrl}`);
      const extractStartTime = Date.now();
      
      // Extract SEO data using Playwright + enhance with Lighthouse
      const [seoData, lighthouseSEO] = await Promise.all([
        extractSEOData(normalizedUrl),
        getLighthouseSEO(normalizedUrl)
      ]);
      
      // Enhance SEO data with Lighthouse scores
      const enhancedSEOData = {
        ...seoData,
        lighthouseScore: lighthouseSEO.score,
        // Blend scores with Lighthouse having 40% weight
        score: Math.round((seoData.score * 0.6) + (lighthouseSEO.score * 0.4)),
        lighthouseAudits: {
          documentTitle: lighthouseSEO.audits.documentTitle,
          metaDescription: lighthouseSEO.audits.metaDescription,
          httpStatusCode: lighthouseSEO.audits.httpStatusCode,
          isOnHttps: lighthouseSEO.audits.isOnHttps,
          viewport: lighthouseSEO.audits.viewport,
          canonicalUrl: lighthouseSEO.audits.canonicalUrl
        }
      };
      
      logTiming('SEO extraction', extractStartTime);
      console.log(`Extracted enhanced SEO data: Score ${enhancedSEOData.score} (Lighthouse: ${lighthouseSEO.score}), ${seoData.checks.length} checks, ${seoData.keywords.length} keywords`);
      
      // Cache the enhanced results
      await SupabaseCacheService.set(seosCacheKey, normalizedUrl, enhancedSEOData);
      console.log(`✅ Cached enhanced SEO data for ${normalizedUrl}`);
      
      logTiming('🔍 Total SEO analysis', overallStartTime);
      res.json(enhancedSEOData);
      
    } catch (error) {
      console.error('SEO extraction failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('TimeoutError')) {
          return res.status(504).json({ error: 'Request timeout while analyzing SEO' });
        }
        if (error.message.includes('net::ERR_') || error.message.includes('Navigation failed')) {
          return res.status(400).json({ error: 'Unable to access the provided URL' });
        }
      }
      
      res.status(500).json({ error: 'SEO analysis failed' });
    }
  });

  // Lighthouse SEO Analysis endpoint
  app.post('/api/lighthouse/seo', async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required in request body' });
      }

      // Normalize URL
      let normalizedUrl = url.trim();
      if (!normalizedUrl.match(/^https?:\/\//)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      console.log(`🔍 Running Lighthouse SEO analysis for: ${normalizedUrl}`);
      const seoData = await getLighthouseSEO(normalizedUrl);
      
      res.json(seoData);
    } catch (error) {
      console.error('Lighthouse SEO analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze SEO with Lighthouse' });
    }
  });

  // Lighthouse Performance Analysis endpoint
  app.post('/api/lighthouse/performance', async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required in request body' });
      }

      // Normalize URL
      let normalizedUrl = url.trim();
      if (!normalizedUrl.match(/^https?:\/\//)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      console.log(`⚡ Running Lighthouse Performance analysis for: ${normalizedUrl}`);
      const performanceData = await getLighthousePerformance(normalizedUrl);
      
      res.json(performanceData);
    } catch (error) {
      console.error('Lighthouse Performance analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze performance with Lighthouse' });
    }
  });

  // Lighthouse Best Practices Analysis endpoint
  app.post('/api/lighthouse/best-practices', async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required in request body' });
      }

      // Normalize URL
      let normalizedUrl = url.trim();
      if (!normalizedUrl.match(/^https?:\/\//)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      console.log(`📋 Running Lighthouse Best Practices analysis for: ${normalizedUrl}`);
      const bestPracticesData = await getLighthouseBestPractices(normalizedUrl);
      
      res.json(bestPracticesData);
    } catch (error) {
      console.error('Lighthouse Best Practices analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze best practices with Lighthouse' });
    }
  });

  // Enhanced Tech Analysis combining lightweight + Lighthouse Best Practices
  app.post('/api/enhanced-tech', async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required in request body' });
      }

      // Normalize URL
      let normalizedUrl = url.trim();
      if (!normalizedUrl.match(/^https?:\/\//)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      console.log(`🔧🔍 Running enhanced tech analysis (lightweight + Lighthouse) for: ${normalizedUrl}`);
      const enhancedTechData = await getEnhancedTechAnalysis(normalizedUrl);
      
      res.json(enhancedTechData);
    } catch (error) {
      console.error('Enhanced tech analysis error:', error);
      res.status(500).json({ error: 'Failed to perform enhanced tech analysis' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
