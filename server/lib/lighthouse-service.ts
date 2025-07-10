/**
 * Lighthouse-powered analysis service
 * Replaces PageSpeed Insights with comprehensive Lighthouse audits
 */
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { SupabaseCacheService } from './supabase';
import * as crypto from 'crypto';

export interface LighthouseSEOData {
  score: number;
  audits: {
    documentTitle: any;
    metaDescription: any;
    httpStatusCode: any;
    crawlableAnchors: any;
    isOnHttps: any;
    viewport: any;
    robotsTxt: any;
    hreflang: any;
    canonicalUrl: any;
  };
}

export interface LighthousePerformanceData {
  score: number;
  metrics: {
    firstContentfulPaint: any;
    largestContentfulPaint: any;
    firstInputDelay: any;
    cumulativeLayoutShift: any;
    speedIndex: any;
    totalBlockingTime: any;
    interactionToNextPaint: any;
  };
  opportunities: any[];
  pageLoadTime?: {
    desktop: number;
    mobile: number;
  };
}

export interface LighthouseBestPracticesData {
  score: number;
  audits: {
    isOnHttps: any;
    usesHttp2: any;
    usesTextCompression: any;
    usesOptimizedImages: any;
    usesWebpImages: any;
    usesResponsiveImages: any;
    efficientAnimatedContent: any;
    appcacheManifest: any;
    doctype: any;
    charset: any;
    noDocumentWrite: any;
    geolocationOnStart: any;
    notificationOnStart: any;
    vulnerabilities: any;
    noUnloadListeners: any;
    cspXss: any;
  };
}

async function runLighthouse(url: string, categories: string[], device: 'desktop' | 'mobile' = 'desktop'): Promise<any> {
  let chrome: any = null;
  try {
    console.log(`🔍 Running Lighthouse analysis for ${url} (categories: ${categories.join(', ')}, device: ${device})`);
    
    chrome = await launch({
      chromeFlags: [
        '--headless',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions'
      ]
    });

    const config = {
      port: chrome.port,
      output: 'json',
      onlyCategories: categories,
      throttlingMethod: 'simulate',
      throttling: device === 'mobile' ? {
        rttMs: 150,
        throughputKbps: 1.6 * 1024,
        cpuSlowdownMultiplier: 4,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      } : {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      },
      emulatedFormFactor: device
    } as any;

    const result = await lighthouse(url, config);

    console.log(`✅ Lighthouse analysis completed for ${url} (${device})`);
    return result?.lhr;
  } catch (error) {
    console.error('Lighthouse analysis failed:', error);
    throw error;
  } finally {
    if (chrome && chrome.kill) {
      await chrome.kill();
    }
  }
}

export async function getLighthouseSEO(url: string): Promise<LighthouseSEOData> {
  try {
    const urlHash = crypto.createHash('sha256').update(url).digest('hex');
    const cacheKey = `lighthouse_seo_${urlHash}`;

    // Try cache first
    const cached = await SupabaseCacheService.get(cacheKey);
    if (cached) {
      console.log('📦 Lighthouse SEO cache hit');
      return cached.analysis_data;
    }

    console.log('🔍 Performing fresh Lighthouse SEO analysis...');
    const lhr = await runLighthouse(url, ['seo']);
    
    const seoData: LighthouseSEOData = {
      score: Math.round((lhr.categories.seo?.score || 0) * 100),
      audits: {
        documentTitle: lhr.audits['document-title'],
        metaDescription: lhr.audits['meta-description'],
        httpStatusCode: lhr.audits['http-status-code'],
        crawlableAnchors: lhr.audits['crawlable-anchors'],
        isOnHttps: lhr.audits['is-on-https'],
        viewport: lhr.audits['viewport'],
        robotsTxt: lhr.audits['robots-txt'],
        hreflang: lhr.audits['hreflang'],
        canonicalUrl: lhr.audits['canonical']
      }
    };

    // Cache the results
    await SupabaseCacheService.set(cacheKey, url, seoData);
    
    return seoData;
  } catch (error) {
    console.error('Lighthouse SEO analysis error:', error);
    throw error;
  }
}

export async function getLighthousePerformance(url: string): Promise<LighthousePerformanceData> {
  try {
    const urlHash = crypto.createHash('sha256').update(url).digest('hex');
    const cacheKey = `lighthouse_performance_${urlHash}`;

    // Try cache first
    const cached = await SupabaseCacheService.get(cacheKey);
    if (cached) {
      console.log('📦 Lighthouse Performance cache hit');
      return cached.analysis_data;
    }

    console.log('🔍 Performing fresh Lighthouse Performance analysis...');
    const lhr = await runLighthouse(url, ['performance']);
    
    const performanceData: LighthousePerformanceData = {
      score: Math.round((lhr.categories.performance?.score || 0) * 100),
      metrics: {
        firstContentfulPaint: lhr.audits['first-contentful-paint'],
        largestContentfulPaint: lhr.audits['largest-contentful-paint'],
        firstInputDelay: lhr.audits['max-potential-fid'],
        cumulativeLayoutShift: lhr.audits['cumulative-layout-shift'],
        speedIndex: lhr.audits['speed-index'],
        totalBlockingTime: lhr.audits['total-blocking-time'],
        interactionToNextPaint: lhr.audits['interaction-to-next-paint']
      },
      opportunities: Object.values(lhr.audits)
        .filter((audit: any) => audit.details?.type === 'opportunity')
        .map((audit: any) => ({
          id: audit.id,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          numericValue: audit.numericValue,
          displayValue: audit.displayValue
        }))
    };

    // Cache the results
    await SupabaseCacheService.set(cacheKey, url, performanceData);
    
    return performanceData;
  } catch (error) {
    console.error('Lighthouse Performance analysis error:', error);
    throw error;
  }
}

export async function getLighthouseBestPractices(url: string): Promise<LighthouseBestPracticesData> {
  try {
    const urlHash = crypto.createHash('sha256').update(url).digest('hex');
    const cacheKey = `lighthouse_best_practices_${urlHash}`;

    // Try cache first
    const cached = await SupabaseCacheService.get(cacheKey);
    if (cached) {
      console.log('📦 Lighthouse Best Practices cache hit');
      return cached.analysis_data;
    }

    console.log('🔍 Performing fresh Lighthouse Best Practices analysis...');
    const lhr = await runLighthouse(url, ['best-practices']);
    
    const bestPracticesData: LighthouseBestPracticesData = {
      score: Math.round((lhr.categories['best-practices']?.score || 0) * 100),
      audits: {
        isOnHttps: lhr.audits['is-on-https'],
        usesHttp2: lhr.audits['uses-http2'],
        usesTextCompression: lhr.audits['uses-text-compression'],
        usesOptimizedImages: lhr.audits['uses-optimized-images'],
        usesWebpImages: lhr.audits['uses-webp-images'],
        usesResponsiveImages: lhr.audits['uses-responsive-images'],
        efficientAnimatedContent: lhr.audits['efficient-animated-content'],
        appcacheManifest: lhr.audits['appcache-manifest'],
        doctype: lhr.audits['doctype'],
        charset: lhr.audits['charset'],
        noDocumentWrite: lhr.audits['no-document-write'],
        geolocationOnStart: lhr.audits['geolocation-on-start'],
        notificationOnStart: lhr.audits['notification-on-start'],
        vulnerabilities: lhr.audits['no-vulnerable-libraries'],
        noUnloadListeners: lhr.audits['no-unload-listeners'],
        cspXss: lhr.audits['csp-xss']
      }
    };

    // Cache the results
    await SupabaseCacheService.set(cacheKey, url, bestPracticesData);
    
    return bestPracticesData;
  } catch (error) {
    console.error('Lighthouse Best Practices analysis error:', error);
    throw error;
  }
}

export async function getLighthousePageLoadTime(url: string): Promise<{ desktop: number; mobile: number }> {
  try {
    const urlHash = crypto.createHash('sha256').update(url).digest('hex');
    const cacheKey = `lighthouse_pageload_${urlHash}`;

    // Try cache first
    const cached = await SupabaseCacheService.get(cacheKey);
    if (cached) {
      console.log('📦 Lighthouse Page Load Time cache hit');
      return cached.analysis_data;
    }

    console.log('🔍 Performing fresh Lighthouse Page Load Time analysis (desktop & mobile)...');
    
    // Run analyses sequentially to avoid concurrency issues
    console.log('🔍 Running desktop performance analysis...');
    const desktopLhr = await runLighthouse(url, ['performance'], 'desktop');
    
    console.log('🔍 Running mobile performance analysis...');
    const mobileLhr = await runLighthouse(url, ['performance'], 'mobile');
    
    // Extract Time to Interactive (TTI) as page load time metric
    const desktopPageLoadTime = Math.round(desktopLhr.audits['interactive']?.numericValue || 3000);
    const mobilePageLoadTime = Math.round(mobileLhr.audits['interactive']?.numericValue || 4000);
    
    const pageLoadTimeData = {
      desktop: desktopPageLoadTime,
      mobile: mobilePageLoadTime
    };

    // Cache the results
    await SupabaseCacheService.set(cacheKey, url, pageLoadTimeData);
    
    console.log(`✅ Page Load Time: Desktop ${desktopPageLoadTime}ms, Mobile ${mobilePageLoadTime}ms`);
    return pageLoadTimeData;
  } catch (error) {
    console.error('Lighthouse Page Load Time analysis error:', error);
    throw error;
  }
}