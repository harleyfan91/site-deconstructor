/**
 * Comprehensive technical analysis using Playwright and Wappalyzer
 */

import { chromium, type Browser, type Page } from 'playwright';
// Using pattern-based detection instead of deprecated Wappalyzer
import * as crypto from 'crypto';
import PQueue from 'p-queue';

export interface TechStackItem {
  category: string;
  technology: string;
  version?: string;
  confidence?: number;
}

export interface ThirdPartyScript {
  url: string;
  type: 'analytics' | 'advertising' | 'social' | 'cdn' | 'unknown';
  name?: string;
}

export interface SecurityHeaders {
  csp: string;
  hsts: string;
  xfo: string; // X-Frame-Options
  xss: string; // X-XSS-Protection
  xcto: string; // X-Content-Type-Options
  referrer: string; // Referrer-Policy
}

export interface MinificationStatus {
  cssMinified: boolean;
  jsMinified: boolean;
  htmlMinified: boolean;
}

export interface SocialTags {
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasShareButtons: boolean;
  facebookPixel: boolean;
  googleAnalytics: boolean;
  linkedInInsight: boolean;
}

export interface CookieInfo {
  hasCookieScript: boolean;
  cookieConsentType: 'none' | 'banner' | 'popup' | 'overlay';
  cookieLibrary?: string;
}

export interface AdTags {
  hasGAM: boolean;
  hasAdSense: boolean;
  hasPrebid: boolean;
  hasAPS: boolean;
  hasIX: boolean;
  hasANX: boolean;
  hasOpenX: boolean;
  hasRubicon: boolean;
  hasPubMatic: boolean;
  hasVPAID: boolean;
  hasCriteo: boolean;
  hasTaboola: boolean;
  hasOutbrain: boolean;
  hasSharethrough: boolean;
  hasTeads: boolean;
  hasMoat: boolean;
  hasDV: boolean;
  hasIAS: boolean;
}

export interface TechnicalIssue {
  type: 'performance' | 'security' | 'accessibility' | 'seo';
  description: string;
  severity: 'high' | 'medium' | 'low';
  recommendation?: string;
}

export interface TechnicalAnalysis {
  techStack: TechStackItem[];
  thirdPartyScripts: ThirdPartyScript[];
  securityHeaders: SecurityHeaders;
  minification: MinificationStatus;
  social: SocialTags;
  cookies: CookieInfo;
  adTags: AdTags;
  issues: TechnicalIssue[];
  tlsVersion: string;
  cdn: boolean;
  gzip: boolean;
}

// Global browser instance and queue shared across tech analysis
let sharedBrowser: Browser | null = null;
const techQueue = new PQueue({ concurrency: 2 });

async function initBrowser(): Promise<Browser> {
  if (!sharedBrowser) {
    sharedBrowser = await chromium.launch({
      headless: true,
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions'
      ]
    });
  }
  return sharedBrowser;
}

async function analyzeTechStack(page: Page, html: string, url: string): Promise<TechStackItem[]> {
  try {
    console.warn('Using comprehensive pattern-based tech detection (Wappalyzer deprecated)');
    
    const techStack: TechStackItem[] = [];
    const htmlLower = html.toLowerCase();
    const scripts = Array.from(await page.$$eval('script', scripts => 
      scripts.map(s => s.src || s.textContent || '')
    )).join(' ').toLowerCase();
    
    // JavaScript Frameworks
    if (htmlLower.includes('react') || scripts.includes('react')) {
      techStack.push({ category: 'JavaScript Frameworks', technology: 'React' });
    }
    if (htmlLower.includes('vue') || scripts.includes('vue')) {
      techStack.push({ category: 'JavaScript Frameworks', technology: 'Vue.js' });
    }
    if (htmlLower.includes('angular') || scripts.includes('angular')) {
      techStack.push({ category: 'JavaScript Frameworks', technology: 'Angular' });
    }
    if (htmlLower.includes('svelte') || scripts.includes('svelte')) {
      techStack.push({ category: 'JavaScript Frameworks', technology: 'Svelte' });
    }
    if (htmlLower.includes('next.js') || scripts.includes('next')) {
      techStack.push({ category: 'JavaScript Frameworks', technology: 'Next.js' });
    }
    
    // CSS Frameworks
    if (htmlLower.includes('bootstrap') || scripts.includes('bootstrap')) {
      techStack.push({ category: 'CSS Frameworks', technology: 'Bootstrap' });
    }
    if (htmlLower.includes('tailwind') || htmlLower.includes('tw-')) {
      techStack.push({ category: 'CSS Frameworks', technology: 'Tailwind CSS' });
    }
    if (htmlLower.includes('bulma')) {
      techStack.push({ category: 'CSS Frameworks', technology: 'Bulma' });
    }
    
    // JavaScript Libraries
    if (htmlLower.includes('jquery') || scripts.includes('jquery')) {
      techStack.push({ category: 'JavaScript Libraries', technology: 'jQuery' });
    }
    if (scripts.includes('lodash') || scripts.includes('underscore')) {
      techStack.push({ category: 'JavaScript Libraries', technology: 'Lodash' });
    }
    
    // Analytics & Tracking
    if (scripts.includes('google-analytics') || scripts.includes('gtag')) {
      techStack.push({ category: 'Analytics', technology: 'Google Analytics' });
    }
    if (scripts.includes('googletagmanager')) {
      techStack.push({ category: 'Tag Managers', technology: 'Google Tag Manager' });
    }
    if (scripts.includes('facebook') || scripts.includes('fbq')) {
      techStack.push({ category: 'Analytics', technology: 'Facebook Pixel' });
    }
    
    // CDNs
    if (scripts.includes('cdnjs') || scripts.includes('jsdelivr') || scripts.includes('unpkg')) {
      techStack.push({ category: 'CDN', technology: 'Public CDN' });
    }
    if (scripts.includes('cloudflare')) {
      techStack.push({ category: 'CDN', technology: 'Cloudflare' });
    }
    
    // CMS Detection
    if (htmlLower.includes('wp-content') || htmlLower.includes('wordpress')) {
      techStack.push({ category: 'CMS', technology: 'WordPress' });
    }
    if (htmlLower.includes('shopify')) {
      techStack.push({ category: 'E-commerce', technology: 'Shopify' });
    }
    
    // Always add HTML5
    techStack.push({ category: 'Markup Languages', technology: 'HTML5' });
    
    // Add HTTPS if secure
    if (url.startsWith('https://')) {
      techStack.push({ category: 'Security', technology: 'HTTPS' });
    }

    return techStack.length > 1 ? techStack : [{ category: 'Markup Languages', technology: 'HTML5' }];
  } catch (error) {
    console.warn('Tech stack analysis failed:', error);
    return [{ category: 'Markup Languages', technology: 'HTML5' }];
  }
}

async function analyzeThirdPartyScripts(page: Page): Promise<ThirdPartyScript[]> {
  try {
    const scripts = await page.evaluate(() => {
      const scriptElements = Array.from(document.querySelectorAll('script[src]'));
      return scriptElements.map(script => ({
        url: (script as HTMLScriptElement).src,
        async: (script as HTMLScriptElement).async,
        defer: (script as HTMLScriptElement).defer
      }));
    });

    return scripts
      .filter(script => {
        try {
          const scriptUrl = new URL(script.url);
          const pageUrl = new URL(page.url());
          return scriptUrl.hostname !== pageUrl.hostname;
        } catch {
          return false;
        }
      })
      .map(script => {
        const url = script.url.toLowerCase();
        let type: ThirdPartyScript['type'] = 'unknown';
        let name: string | undefined;

        if (url.includes('google-analytics') || url.includes('gtag') || url.includes('googletagmanager')) {
          type = 'analytics';
          name = 'Google Analytics';
        } else if (url.includes('googlesyndication') || url.includes('doubleclick')) {
          type = 'advertising';
          name = 'Google Ads';
        } else if (url.includes('facebook') || url.includes('twitter') || url.includes('linkedin')) {
          type = 'social';
          name = 'Social Media';
        } else if (url.includes('cdnjs') || url.includes('jsdelivr') || url.includes('unpkg')) {
          type = 'cdn';
          name = 'CDN';
        }

        return {
          url: script.url,
          type,
          name
        };
      });
  } catch (error) {
    console.warn('Third party script analysis failed:', error);
    return [];
  }
}

async function analyzeSecurityHeaders(response: Response): Promise<SecurityHeaders> {
  return {
    csp: response.headers.get('content-security-policy') || '!',
    hsts: response.headers.get('strict-transport-security') || '!',
    xfo: response.headers.get('x-frame-options') || '!',
    xss: response.headers.get('x-xss-protection') || '!',
    xcto: response.headers.get('x-content-type-options') || '!',
    referrer: response.headers.get('referrer-policy') || '!'
  };
}

async function analyzeMinification(page: Page): Promise<MinificationStatus> {
  try {
    const analysis = await page.evaluate(() => {
      // Check CSS minification
      const styleSheets = Array.from(document.styleSheets);
      let cssMinified = false;
      
      try {
        for (const sheet of styleSheets) {
          if (sheet.href) {
            // Assume external CSS is minified if filename contains .min.
            cssMinified = sheet.href.includes('.min.') || cssMinified;
          }
        }
      } catch (e) {
        // Cross-origin stylesheets might throw errors
      }

      // Check JS minification
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const jsMinified = scripts.some(script => 
        (script as HTMLScriptElement).src.includes('.min.')
      );

      // Check HTML minification (basic heuristic)
      const htmlSource = document.documentElement.outerHTML;
      const hasExcessiveWhitespace = /\n\s{4,}/g.test(htmlSource);
      const htmlMinified = !hasExcessiveWhitespace;

      return {
        cssMinified,
        jsMinified,
        htmlMinified
      };
    });

    return analysis;
  } catch (error) {
    console.warn('Minification analysis failed:', error);
    return {
      cssMinified: false,
      jsMinified: false,
      htmlMinified: false
    };
  }
}

async function analyzeSocialTags(page: Page): Promise<SocialTags> {
  try {
    const analysis = await page.evaluate(() => {
      // Check Open Graph tags
      const ogTags = document.querySelectorAll('meta[property^="og:"]');
      const hasOpenGraph = ogTags.length > 0;

      // Check Twitter Card tags
      const twitterTags = document.querySelectorAll('meta[name^="twitter:"]');
      const hasTwitterCard = twitterTags.length > 0;

      // Check for share buttons
      const shareButtons = document.querySelectorAll('[class*="share"], [class*="social"], [data-share]');
      const hasShareButtons = shareButtons.length > 0;

      // Check for tracking pixels/scripts
      const scriptElement = document.querySelector('script');
      const facebookPixel = document.querySelector('script[src*="connect.facebook.net"]') !== null ||
                           (scriptElement && scriptElement.textContent?.includes('fbq')) || false;
      
      const googleAnalytics = document.querySelector('script[src*="google-analytics"]') !== null ||
                             document.querySelector('script[src*="gtag"]') !== null;

      const linkedInInsight = document.querySelector('script[src*="snap.licdn.com"]') !== null;

      return {
        hasOpenGraph,
        hasTwitterCard,
        hasShareButtons,
        facebookPixel,
        googleAnalytics,
        linkedInInsight
      };
    });

    return analysis;
  } catch (error) {
    console.warn('Social tags analysis failed:', error);
    return {
      hasOpenGraph: false,
      hasTwitterCard: false,
      hasShareButtons: false,
      facebookPixel: false,
      googleAnalytics: false,
      linkedInInsight: false
    };
  }
}

async function analyzeCookies(page: Page): Promise<CookieInfo> {
  try {
    const analysis = await page.evaluate(() => {
      const html = document.documentElement.innerHTML.toLowerCase();
      const scripts = Array.from(document.querySelectorAll('script')).map(s => s.textContent || '').join(' ').toLowerCase();

      // Common cookie consent libraries
      const cookieLibraries = [
        { name: 'CookieBot', patterns: ['cookiebot', 'cookieconsent.js'] },
        { name: 'OneTrust', patterns: ['onetrust', 'optanon'] },
        { name: 'Cookielaw', patterns: ['cookielaw', 'ot-sdk'] },
        { name: 'GDPR Cookie Consent', patterns: ['gdpr-cookie', 'cookie-consent'] },
        { name: 'Cookie Notice', patterns: ['cookie-notice', 'cn-'] },
        { name: 'Quantcast', patterns: ['quantcast', 'qc-cmp'] }
      ];

      let cookieLibrary: string | undefined;
      let hasCookieScript = false;

      for (const lib of cookieLibraries) {
        for (const pattern of lib.patterns) {
          if (html.includes(pattern) || scripts.includes(pattern)) {
            hasCookieScript = true;
            cookieLibrary = lib.name;
            break;
          }
        }
        if (hasCookieScript) break;
      }

      // General cookie-related terms
      if (!hasCookieScript) {
        const cookieTerms = ['cookie', 'gdpr', 'privacy policy', 'consent'];
        hasCookieScript = cookieTerms.some(term => html.includes(term) || scripts.includes(term));
      }

      // Determine consent type based on DOM elements
      let cookieConsentType: CookieInfo['cookieConsentType'] = 'none';
      
      if (hasCookieScript) {
        const bannerSelectors = ['[class*="cookie"]', '[id*="cookie"]', '[class*="consent"]', '[id*="consent"]'];
        const bannerElements = bannerSelectors.some(selector => document.querySelector(selector));
        
        if (bannerElements) {
          cookieConsentType = 'banner';
        }
      }

      return {
        hasCookieScript,
        cookieConsentType,
        cookieLibrary
      };
    });

    return analysis;
  } catch (error) {
    console.warn('Cookie analysis failed:', error);
    return {
      hasCookieScript: false,
      cookieConsentType: 'none'
    };
  }
}

async function analyzeAdTags(page: Page): Promise<AdTags> {
  try {
    const analysis = await page.evaluate(() => {
      const html = document.documentElement.innerHTML.toLowerCase();
      const scripts = Array.from(document.querySelectorAll('script')).map(s => s.textContent || '').join(' ').toLowerCase();
      const allContent = html + ' ' + scripts;

      return {
        hasGAM: allContent.includes('googletag') || allContent.includes('gpt.js'),
        hasAdSense: allContent.includes('googlesyndication') || allContent.includes('adsbygoogle'),
        hasPrebid: allContent.includes('prebid') || allContent.includes('pbjs'),
        hasAPS: allContent.includes('amazon-adsystem') || allContent.includes('aps.amazon'),
        hasIX: allContent.includes('casalemedia') || allContent.includes('indexexchange'),
        hasANX: allContent.includes('appnexus') || allContent.includes('adnxs'),
        hasOpenX: allContent.includes('openx') || allContent.includes('ox-d'),
        hasRubicon: allContent.includes('rubiconproject') || allContent.includes('fastlane'),
        hasPubMatic: allContent.includes('pubmatic') || allContent.includes('pubads'),
        hasVPAID: allContent.includes('vpaid') || allContent.includes('vmap') || allContent.includes('ima'),
        hasCriteo: allContent.includes('criteo') || allContent.includes('rtax'),
        hasTaboola: allContent.includes('taboola') || allContent.includes('trc'),
        hasOutbrain: allContent.includes('outbrain') || allContent.includes('zemanta'),
        hasSharethrough: allContent.includes('sharethrough') || allContent.includes('sfp-js'),
        hasTeads: allContent.includes('teads') || allContent.includes('cdn.teads'),
        hasMoat: allContent.includes('moatads') || allContent.includes('moat.js'),
        hasDV: allContent.includes('doubleverify') || allContent.includes('dvtps'),
        hasIAS: allContent.includes('integralads') || allContent.includes('adsafeprotected')
      };
    });

    return analysis;
  } catch (error) {
    console.warn('Ad tags analysis failed:', error);
    return {
      hasGAM: false,
      hasAdSense: false,
      hasPrebid: false,
      hasAPS: false,
      hasIX: false,
      hasANX: false,
      hasOpenX: false,
      hasRubicon: false,
      hasPubMatic: false,
      hasVPAID: false,
      hasCriteo: false,
      hasTaboola: false,
      hasOutbrain: false,
      hasSharethrough: false,
      hasTeads: false,
      hasMoat: false,
      hasDV: false,
      hasIAS: false
    };
  }
}

function analyzeTLSAndCompression(response: Response): { tlsVersion: string; cdn: boolean; gzip: boolean } {
  const server = response.headers.get('server') || '';
  const contentEncoding = response.headers.get('content-encoding') || '';
  
  // TLS version detection is limited from response headers
  // Most modern connections use TLS 1.2 or 1.3
  const tlsVersion = response.url.startsWith('https://') ? 'TLS 1.2+' : '!';
  
  // CDN detection
  const cdn = server.toLowerCase().includes('cloudflare') ||
              server.toLowerCase().includes('fastly') ||
              server.toLowerCase().includes('cloudfront') ||
              response.headers.get('cf-ray') !== null ||
              response.headers.get('x-served-by') !== null;

  // Compression detection
  const gzip = contentEncoding.includes('gzip') || contentEncoding.includes('br');

  return { tlsVersion, cdn, gzip };
}

export async function extractTechnicalData(url: string): Promise<TechnicalAnalysis> {
  return techQueue.add(async () => {
    let browserInstance: any = null;
    let context: any = null;
    let page: Page | null = null;
    
    try {
      browserInstance = await initBrowser();
      context = await browserInstance.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      page = await context.newPage();

      if (!page) {
        throw new Error('Failed to create page');
      }

      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });

      if (!response) {
        throw new Error('Failed to load page');
      }

      const html = await page.content();

      // Run all analyses in parallel for better performance
      const [
        techStack,
        thirdPartyScripts,
        securityHeaders,
        minification,
        social,
        cookies,
        adTags
      ] = await Promise.all([
        analyzeTechStack(page, html, url),
        analyzeThirdPartyScripts(page),
        analyzeSecurityHeaders(response as any),
        analyzeMinification(page),
        analyzeSocialTags(page),
        analyzeCookies(page),
        analyzeAdTags(page)
      ]);

    const { tlsVersion, cdn, gzip } = analyzeTLSAndCompression(response as any);

    // Generate technical issues based on findings
    const issues: TechnicalIssue[] = [];
    
    if (securityHeaders.csp === '!') {
      issues.push({
        type: 'security',
        description: 'Content Security Policy header missing',
        severity: 'medium',
        recommendation: 'Implement CSP to prevent XSS attacks'
      });
    }
    
    if (securityHeaders.hsts === '!') {
      issues.push({
        type: 'security',
        description: 'HSTS header missing',
        severity: 'medium',
        recommendation: 'Enable HSTS to enforce HTTPS connections'
      });
    }

    if (!minification.cssMinified) {
      issues.push({
        type: 'performance',
        description: 'CSS files are not minified',
        severity: 'low',
        recommendation: 'Minify CSS files to reduce page load time'
      });
    }

    if (!minification.jsMinified) {
      issues.push({
        type: 'performance',
        description: 'JavaScript files are not minified',
        severity: 'low',
        recommendation: 'Minify JavaScript files to improve performance'
      });
    }

    if (!gzip) {
      issues.push({
        type: 'performance',
        description: 'GZIP compression not enabled',
        severity: 'medium',
        recommendation: 'Enable GZIP compression to reduce transfer sizes'
      });
    }

    return {
      techStack,
      thirdPartyScripts,
      securityHeaders,
      minification,
      social,
      cookies,
      adTags,
      issues,
      tlsVersion,
      cdn,
      gzip
    };

  } catch (error) {
    console.error('Technical analysis error:', error);
    
    // Return fallback data structure with error indicators
    return {
      techStack: [{ category: 'Unknown', technology: '!' }],
      thirdPartyScripts: [],
      securityHeaders: {
        csp: '!',
        hsts: '!',
        xfo: '!',
        xss: '!',
        xcto: '!',
        referrer: '!'
      },
      minification: {
        cssMinified: false,
        jsMinified: false,
        htmlMinified: false
      },
      social: {
        hasOpenGraph: false,
        hasTwitterCard: false,
        hasShareButtons: false,
        facebookPixel: false,
        googleAnalytics: false,
        linkedInInsight: false
      },
      cookies: {
        hasCookieScript: false,
        cookieConsentType: 'none'
      },
      adTags: {
        hasGAM: false,
        hasAdSense: false,
        hasPrebid: false,
        hasAPS: false,
        hasIX: false,
        hasANX: false,
        hasOpenX: false,
        hasRubicon: false,
        hasPubMatic: false,
        hasVPAID: false,
        hasCriteo: false,
        hasTaboola: false,
        hasOutbrain: false,
        hasSharethrough: false,
        hasTeads: false,
        hasMoat: false,
        hasDV: false,
        hasIAS: false
      },
      issues: [],
      tlsVersion: '!',
      cdn: false,
      gzip: false
    };
    } finally {
      if (page) await page.close().catch(() => {});
      if (context) await context.close().catch(() => {});
      // Don't close the global browser, keep it for reuse
    }
  });
}

export async function getTechnicalAnalysis(url: string): Promise<TechnicalAnalysis> {
  try {
    const urlHash = crypto.createHash('sha256').update(url).digest('hex');
    const cacheKey = `tech_${urlHash}`;

    console.log('🔍 Performing fresh technical analysis...');
    const analysis = await extractTechnicalData(url);

    
    return analysis;
  } catch (error) {
    console.error('Technical analysis failed:', error);
    // Return fallback data with "!" markers
    return {
      techStack: [{ category: 'Unknown', technology: '!' }],
      thirdPartyScripts: [],
      securityHeaders: {
        csp: '!',
        hsts: '!',
        xfo: '!',
        xss: '!',
        xcto: '!',
        referrer: '!'
      },
      minification: {
        cssMinified: false,
        jsMinified: false,
        htmlMinified: false
      },
      social: {
        hasOpenGraph: false,
        hasTwitterCard: false,
        hasShareButtons: false,
        facebookPixel: false,
        googleAnalytics: false,
        linkedInInsight: false
      },
      cookies: {
        hasCookieScript: false,
        cookieConsentType: 'none'
      },
      adTags: {
        hasGAM: false,
        hasAdSense: false,
        hasPrebid: false,
        hasAPS: false,
        hasIX: false,
        hasANX: false,
        hasOpenX: false,
        hasRubicon: false,
        hasPubMatic: false,
        hasVPAID: false,
        hasCriteo: false,
        hasTaboola: false,
        hasOutbrain: false,
        hasSharethrough: false,
        hasTeads: false,
        hasMoat: false,
        hasDV: false,
        hasIAS: false
      },
      issues: [],
      tlsVersion: '!',
      cdn: false,
      gzip: false
    };
  }
}

export async function closeBrowser(): Promise<void> {
  // Global browser management handled elsewhere
}