import { Router } from 'express';
import { UIScraperService } from '../services/uiScraper';
import { extractSEOData } from '../lib/seo-extractor';
import { getEnhancedTechAnalysis } from '../lib/enhanced-tech-analysis';
import { getLighthousePerformance, getLighthousePageLoadTime } from '../lib/lighthouse-service';
import { scrapePageData } from '../lib/page-scraper';

const router = Router();

// Helper function to normalize URLs
function normalizeUrl(url: string): string {
  if (!url) return url;
  
  url = url.trim().replace(/\/$/, '');
  
  if (!url.match(/^https?:\/\//)) {
    url = `https://${url}`;
  }
  
  return url;
}

// Helper function to build content data
function buildContentData(scrapedData: any) {
  return {
    wordCount: scrapedData?.wordCount || "!",
    readabilityScore: scrapedData?.readabilityScore || "!",
    contentDistribution: scrapedData?.contentDistribution || {},
    textElements: scrapedData?.textElements || []
  };
}

/**
 * GET /api/overview - Single unified endpoint for all analysis data
 * Returns: { ui: UIAnalysis, seo: SEOAnalysis, perf: PerfAnalysis, tech: TechAnalysis, content: ContentAnalysis, schemaVersion: '1.0.0' }
 */
router.get('/', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const normalizedUrl = normalizeUrl(url);
    console.log('📊 Aggregating overview data for:', normalizedUrl);
    
    // Ultra-fast cache check - memory first, then immediate pending
    const startTime = Date.now();
    const cachedUI = await UIScraperService.getCachedUI(normalizedUrl);
    const cacheCheckTime = Date.now() - startTime;
    
    if (!cachedUI) {
      // Cache miss - trigger background scrape and return instant pending response
      console.log(`⚡ Cache miss for ${normalizedUrl} (${cacheCheckTime}ms), returning instant pending`);
      
      // Fire-and-forget background analysis (no await)
      setImmediate(() => {
        UIScraperService.analyzeUI(normalizedUrl).catch(error => {
          console.error(`❌ Background UI analysis failed for ${normalizedUrl}:`, error.message);
        });
      });
      
      // Return ultra-fast pending response (target: <100ms)
      return res.json({ 
        status: 'pending',
        url: normalizedUrl,
        data: {
          ui: null,
          seo: null, 
          performance: null,
          tech: null,
          content: null,
          overview: null
        },
        schemaVersion: '1.1.0',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      });
    }
    
    const uiData = cachedUI;
    
    // Call all specialized endpoints and handle failures gracefully
    const results = await Promise.allSettled([
      // SEO data
      extractSEOData(normalizedUrl).catch(error => {
        console.warn('⚠️  SEO analysis missing for overview:', error.message);
        return null;
      }),
      // Tech data  
      getEnhancedTechAnalysis(normalizedUrl).catch(error => {
        console.warn('⚠️  Tech analysis missing for overview:', error.message);
        return null;
      }),
      // Performance data (Core Web Vitals + Page Load Time)
      (async () => {
        try {
          const [pageLoadTimeData, lighthousePerformance] = await Promise.all([
            getLighthousePageLoadTime(normalizedUrl),
            getLighthousePerformance(normalizedUrl)
          ]);
          return {
            pageLoadTime: pageLoadTimeData,
            coreWebVitals: {
              lcpMs: lighthousePerformance.metrics.largestContentfulPaint?.numericValue || 2500,
              inpMs: lighthousePerformance.metrics.firstInputDelay?.numericValue || 100,
              cls: lighthousePerformance.metrics.cumulativeLayoutShift?.numericValue || 0.1
            }
          };
        } catch (error) {
          console.warn('⚠️  Performance analysis missing for overview:', error.message);
          return null;
        }
      })(),
      // Content data
      scrapePageData(normalizedUrl).then(data => buildContentData(data)).catch(error => {
        console.warn('⚠️  Content analysis missing for overview:', error.message);
        return null;
      })
    ]);
    
    const [seoResult, techResult, performanceResult, contentResult] = results;
    
    // Extract data from results, using "!" for missing data
    const seoData = seoResult.status === 'fulfilled' ? seoResult.value : null;
    const techData = techResult.status === 'fulfilled' ? techResult.value : null;
    const performanceData = performanceResult.status === 'fulfilled' ? performanceResult.value : null;
    const contentData = contentResult.status === 'fulfilled' ? contentResult.value : null;
    
    // Build unified overview response with status
    const overviewResponse = {
      status: 'complete',
      url: normalizedUrl,
      timestamp: new Date().toISOString(),
      data: {
        ui: uiData, // This contains colors, fonts, images, accessibility
        seo: seoData || { score: "!", checks: [], recommendations: [], metaTags: {}, keywords: [], headings: [] },
        performance: performanceData || { 
          pageLoadTime: { desktop: "!", mobile: "!" },
          coreWebVitals: { lcpMs: "!", inpMs: "!", cls: "!" }
        },
        tech: techData || { techStack: [], overallScore: "!", minification: {}, securityHeaders: {} },
        content: contentData || { wordCount: "!", readabilityScore: "!", contentDistribution: {} },
        overview: {
          overallScore: seoData?.score || "!",
          seoScore: seoData?.score || "!",
          pageLoadTime: performanceData?.pageLoadTime?.desktop || "!",
          performanceScore: performanceData?.coreWebVitals ? Math.round((3000 - performanceData.pageLoadTime.desktop) / 30) : "!",
          securityScore: techData?.overallScore || "!",
          accessibilityScore: uiData?.accessibilityScore || "!"
        }
      },
      schemaVersion: '1.1.0'
    };
    
    console.log(`✅ Overview aggregation completed for ${normalizedUrl}`);
    res.json(overviewResponse);
    
  } catch (error) {
    console.error('Overview aggregation error:', error);
    res.status(500).json({ 
      error: 'Failed to aggregate analysis data',
      schemaVersion: '1.1.0'
    });
  }
});

export default router;