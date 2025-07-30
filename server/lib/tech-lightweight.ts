/**
 * Lightweight technical analysis using HTTP requests and HTML parsing
 * Designed to avoid browser context conflicts while providing real data
 */
import * as crypto from 'crypto';

export interface TechStackItem {
  category: string;
  technology: string;
  version?: string;
  confidence?: number;
}

export interface SecurityHeaders {
  csp: string;
  hsts: string;
  xfo: string;
  xss: string;
  xcto: string;
  referrer: string;
}

export interface MinificationResult {
  cssMinified: boolean;
  jsMinified: boolean;
  htmlMinified: boolean;
}

export interface SocialAnalysis {
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasShareButtons: boolean;
  facebookPixel?: boolean;
  googleAnalytics?: boolean;
  linkedInInsight?: boolean;
}

export interface AdTagsAnalysis {
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
  // Enhanced tracking pixels
  hasGA4: boolean;
  hasGTM: boolean;
  hasMetaPixel: boolean;
  hasLinkedInInsight: boolean;
  hasTikTokPixel: boolean;
  hasTwitterPixel: boolean;
}

export interface TechnicalAnalysis {
  techStack: TechStackItem[];
  securityHeaders: SecurityHeaders;
  minification: MinificationResult;
  social: SocialAnalysis;
  adTags: AdTagsAnalysis;
  issues: Array<{
    type: string;
    description: string;
    severity: string;
    recommendation: string;
  }>;
  tlsVersion: string;
  cdn: boolean;
  gzip: boolean;
}

// Technology detection patterns
const TECH_PATTERNS = {
  frameworks: [
    { pattern: /react/i, name: 'React', category: 'JavaScript Framework' },
    { pattern: /vue\.js|vue/i, name: 'Vue.js', category: 'JavaScript Framework' },
    { pattern: /angular/i, name: 'Angular', category: 'JavaScript Framework' },
    { pattern: /next\.js|nextjs/i, name: 'Next.js', category: 'React Framework' },
    { pattern: /nuxt/i, name: 'Nuxt.js', category: 'Vue Framework' },
    { pattern: /gatsby/i, name: 'Gatsby', category: 'Static Site Generator' },
    { pattern: /svelte/i, name: 'Svelte', category: 'JavaScript Framework' }
  ],
  libraries: [
    { pattern: /jquery/i, name: 'jQuery', category: 'JavaScript Library' },
    { pattern: /lodash/i, name: 'Lodash', category: 'Utility Library' },
    { pattern: /moment\.js/i, name: 'Moment.js', category: 'Date Library' },
    { pattern: /chart\.js/i, name: 'Chart.js', category: 'Charting Library' },
    { pattern: /d3\.js|d3/i, name: 'D3.js', category: 'Data Visualization' }
  ],
  analytics: [
    { pattern: /google-analytics|gtag|ga\(/i, name: 'Google Analytics', category: 'Analytics' },
    { pattern: /mixpanel/i, name: 'Mixpanel', category: 'Analytics' },
    { pattern: /amplitude/i, name: 'Amplitude', category: 'Analytics' },
    { pattern: /hotjar/i, name: 'Hotjar', category: 'User Analytics' }
  ],
  cdn: [
    { pattern: /cloudflare/i, name: 'Cloudflare', category: 'CDN' },
    { pattern: /jsdelivr/i, name: 'jsDelivr', category: 'CDN' },
    { pattern: /unpkg/i, name: 'unpkg', category: 'CDN' },
    { pattern: /cdnjs/i, name: 'cdnjs', category: 'CDN' }
  ]
};

async function fetchPageData(url: string): Promise<{ html: string; headers: Headers }> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    return { html, headers: response.headers };
  } catch (error) {
    console.error('Failed to fetch page data:', error);
    throw error;
  }
}

function analyzeTechStack(html: string): TechStackItem[] {
  const detectedTech: TechStackItem[] = [];
  const allPatterns = [
    ...TECH_PATTERNS.frameworks,
    ...TECH_PATTERNS.libraries,
    ...TECH_PATTERNS.analytics,
    ...TECH_PATTERNS.cdn
  ];

  for (const { pattern, name, category } of allPatterns) {
    if (pattern.test(html)) {
      detectedTech.push({
        category,
        technology: name,
        confidence: 80
      });
    }
  }

  // Meta framework detection
  if (html.includes('__NEXT_DATA__')) {
    detectedTech.push({ category: 'React Framework', technology: 'Next.js', confidence: 95 });
  }
  
  if (html.includes('__nuxt')) {
    detectedTech.push({ category: 'Vue Framework', technology: 'Nuxt.js', confidence: 95 });
  }

  return detectedTech.length > 0 ? detectedTech : [{ category: 'Web Technology', technology: 'HTML', confidence: 100 }];
}

function analyzeSecurityHeaders(headers: Headers): SecurityHeaders {
  return {
    csp: headers.get('content-security-policy') || 'Not Set',
    hsts: headers.get('strict-transport-security') || 'Not Set',
    xfo: headers.get('x-frame-options') || 'Not Set',
    xss: headers.get('x-xss-protection') || 'Not Set',
    xcto: headers.get('x-content-type-options') || 'Not Set',
    referrer: headers.get('referrer-policy') || 'Not Set'
  };
}

function analyzeMinification(html: string): MinificationResult {
  // Simple heuristics for minification detection
  const cssMinified = /<style[^>]*>[^<]*{[^}]*}[^<]*<\/style>/i.test(html.replace(/\s+/g, ''));
  const jsMinified = /<script[^>]*>[^<]*\w+\([^)]*\)[^<]*<\/script>/i.test(html.replace(/\s+/g, ''));
  const htmlMinified = !/>\s+</.test(html);

  return {
    cssMinified,
    jsMinified,
    htmlMinified
  };
}

function analyzeSocialTags(html: string): SocialAnalysis {
  const hasOpenGraph = /property=["']og:/i.test(html);
  const hasTwitterCard = /name=["']twitter:/i.test(html);
  const hasShareButtons = /share|facebook|twitter|linkedin/i.test(html);
  const facebookPixel = /facebook.*pixel|fbq\(/i.test(html);
  const googleAnalytics = /google-analytics|gtag|ga\(/i.test(html);
  const linkedInInsight = /linkedin.*insight/i.test(html);

  return {
    hasOpenGraph,
    hasTwitterCard,
    hasShareButtons,
    facebookPixel,
    googleAnalytics,
    linkedInInsight
  };
}

function analyzeAdTags(html: string): AdTagsAnalysis {
  return {
    // Traditional ad networks
    hasGAM: /googletag|gpt\.js|doubleclick\.net/i.test(html),
    hasAdSense: /googlesyndication\.com|google_ads/i.test(html),
    hasPrebid: /prebid\.js|pbjs\./i.test(html),
    hasAPS: /amazon-adsystem\.com|apstag/i.test(html),
    hasIX: /casalemedia\.com|indexexchange/i.test(html),
    hasANX: /appnexus\.com|adnxs\.com/i.test(html),
    hasOpenX: /openx\.net|ox-d\.js/i.test(html),
    hasRubicon: /rubiconproject\.com|rpfl_\d+/i.test(html),
    hasPubMatic: /pubmatic\.com|pwt\.js/i.test(html),
    hasVPAID: /vpaid|video.*ad/i.test(html),
    hasCriteo: /criteo\.com|cto_bundle/i.test(html),
    hasTaboola: /taboola\.com|_taboola/i.test(html),
    hasOutbrain: /outbrain\.com|_ob_/i.test(html),
    hasSharethrough: /sharethrough\.com|sfp\.js/i.test(html),
    hasTeads: /teads\.tv|inread/i.test(html),
    hasMoat: /moatads\.com|moat\.js/i.test(html),
    hasDV: /doubleverify\.com|dvbs_src/i.test(html),
    hasIAS: /adsystem\.com|ias\.js/i.test(html),
    
    // Enhanced tracking pixels
    hasGA4: /gtag\(|GA_MEASUREMENT_ID|google-analytics\.com\/analytics\.js/i.test(html),
    hasGTM: /googletagmanager\.com|gtm\.js/i.test(html),
    hasMetaPixel: /connect\.facebook\.net|fbq\(|facebook\.com\/tr/i.test(html),
    hasLinkedInInsight: /snap\.licdn\.com|linkedin\.com\/px/i.test(html),
    hasTikTokPixel: /analytics\.tiktok\.com|ttq\./i.test(html),
    hasTwitterPixel: /static\.ads-twitter\.com|analytics\.twitter\.com|twq\(/i.test(html)
  };
}

function analyzeCDN(headers: Headers): boolean {
  const server = headers.get('server')?.toLowerCase() || '';
  const cfRay = headers.get('cf-ray');
  const xServedBy = headers.get('x-served-by');
  
  return server.includes('cloudflare') || 
         server.includes('fastly') || 
         server.includes('cloudfront') ||
         !!cfRay ||
         !!xServedBy;
}

function analyzeCompression(headers: Headers): boolean {
  const contentEncoding = headers.get('content-encoding')?.toLowerCase() || '';
  return contentEncoding.includes('gzip') || contentEncoding.includes('br');
}

export async function extractTechnicalData(url: string): Promise<TechnicalAnalysis> {
  try {
    console.log(`🔧 Starting lightweight technical analysis for: ${url}`);
    
    const { html, headers } = await fetchPageData(url);
    
    const techStack = analyzeTechStack(html);
    const securityHeaders = analyzeSecurityHeaders(headers);
    const minification = analyzeMinification(html);
    const social = analyzeSocialTags(html);
    const adTags = analyzeAdTags(html);
    const cdn = analyzeCDN(headers);
    const gzip = analyzeCompression(headers);
    
    // TLS version detection (simplified)
    const tlsVersion = headers.get('alt-svc') ? 'TLS 1.3' : 'TLS 1.2+';
    
    // Generate issues based on analysis
    const issues: Array<{
      type: string;
      description: string;
      severity: string;
      recommendation: string;
    }> = [];
    if (securityHeaders.csp === 'Not Set') {
      issues.push({
        type: 'security',
        description: 'Content Security Policy header missing',
        severity: 'medium',
        recommendation: 'Implement CSP to prevent XSS attacks'
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

    console.log(`✅ Lightweight technical analysis completed for: ${url} - Found ${techStack.length} technologies`);
    
    return {
      techStack,
      securityHeaders,
      minification,
      social,
      adTags,
      issues,
      tlsVersion,
      cdn,
      gzip
    };
  } catch (error) {
    console.error('Lightweight technical analysis error:', error);
    throw error;
  }
}

export async function getTechnicalAnalysis(url: string): Promise<TechnicalAnalysis> {
  try {
    const urlHash = crypto.createHash('sha256').update(url).digest('hex');
    const cacheKey = `tech_lightweight_${urlHash}`;


    console.log('🔍 Performing fresh lightweight technical analysis...');
    const analysis = await extractTechnicalData(url);

    
    return analysis;
  } catch (error) {
    console.error('Technical analysis service error:', error);
    throw error;
  }
}