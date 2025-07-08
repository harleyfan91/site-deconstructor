/**
 * Comprehensive SEO data extraction using Playwright and PageSpeed Insights
 */
import { Browser, chromium } from 'playwright';

let browser: Browser | null = null;

export interface SEOMetaTags {
  title?: string;
  description?: string;
  canonical?: string;
  'og:title'?: string;
  'og:description'?: string;
  'og:image'?: string;
  'og:url'?: string;
  'og:type'?: string;
  'twitter:card'?: string;
  'twitter:title'?: string;
  'twitter:description'?: string;
  'twitter:image'?: string;
  keywords?: string;
  author?: string;
  robots?: string;
  [key: string]: any;
}

export interface KeywordDensity {
  keyword: string;
  count: number;
  density: number;
}

export interface HeadingHierarchy {
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  h5: number;
  h6: number;
}

export interface StructuredData {
  type: string;
  data: any;
}

export interface SEOCheck {
  name: string;
  status: 'good' | 'warning' | 'error';
  description: string;
}

export interface SEOData {
  score: number;
  metaTags: SEOMetaTags;
  keywords: KeywordDensity[];
  headings: HeadingHierarchy;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  structuredData: StructuredData[];
  checks: SEOCheck[];
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

async function initBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined
    });
  }
  return browser;
}

export async function extractSEOData(url: string): Promise<SEOData> {
  const browserInstance = await initBrowser();
  const page = await browserInstance.newPage();
  
  try {
    // Navigate to page with timeout
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Extract meta tags
    const metaTags = await extractMetaTags(page);
    
    // Extract heading hierarchy
    const headings = await extractHeadingHierarchy(page);
    
    // Extract structured data
    const structuredData = await extractStructuredData(page);
    
    // Extract page content for keyword analysis
    const textContent = await page.textContent('body') || '';
    const keywords = extractKeywordDensity(textContent);
    
    // Check for robots.txt and sitemap
    const baseUrl = new URL(url).origin;
    const hasRobotsTxt = await checkRobotsTxt(baseUrl);
    const hasSitemap = await checkSitemap(baseUrl, hasRobotsTxt);
    
    // Perform SEO checks
    const checks = performSEOChecks(metaTags, headings, structuredData, hasRobotsTxt, hasSitemap);
    
    // Calculate SEO score
    const score = calculateSEOScore(checks, metaTags, headings);
    
    // Generate recommendations
    const recommendations = generateRecommendations(checks, metaTags, headings);
    
    return {
      score,
      metaTags,
      keywords: keywords.slice(0, 10), // Top 10 keywords
      headings,
      hasRobotsTxt,
      hasSitemap,
      structuredData,
      checks,
      recommendations
    };
    
  } finally {
    await page.close();
  }
}

async function extractMetaTags(page: any): Promise<SEOMetaTags> {
  return await page.evaluate(() => {
    const metaTags: SEOMetaTags = {};
    
    // Title
    const titleElement = document.querySelector('title');
    if (titleElement) {
      metaTags.title = titleElement.textContent?.trim() || '';
    }
    
    // Meta tags
    const metaElements = document.querySelectorAll('meta');
    metaElements.forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      
      if (name && content) {
        metaTags[name] = content;
      }
    });
    
    // Canonical link
    const canonicalElement = document.querySelector('link[rel="canonical"]');
    if (canonicalElement) {
      metaTags.canonical = canonicalElement.getAttribute('href') || '';
    }
    
    return metaTags;
  });
}

async function extractHeadingHierarchy(page: any): Promise<HeadingHierarchy> {
  return await page.evaluate(() => {
    return {
      h1: document.querySelectorAll('h1').length,
      h2: document.querySelectorAll('h2').length,
      h3: document.querySelectorAll('h3').length,
      h4: document.querySelectorAll('h4').length,
      h5: document.querySelectorAll('h5').length,
      h6: document.querySelectorAll('h6').length,
    };
  });
}

async function extractStructuredData(page: any): Promise<StructuredData[]> {
  return await page.evaluate(() => {
    const structuredData: StructuredData[] = [];
    
    // JSON-LD scripts
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    jsonLdScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '{}');
        if (data['@type']) {
          structuredData.push({
            type: data['@type'],
            data: data
          });
        }
      } catch (e) {
        // Invalid JSON-LD, skip
      }
    });
    
    // Microdata
    const itemScopes = document.querySelectorAll('[itemscope]');
    itemScopes.forEach(element => {
      const itemType = element.getAttribute('itemtype');
      if (itemType) {
        structuredData.push({
          type: itemType.split('/').pop() || 'Unknown',
          data: { itemtype: itemType }
        });
      }
    });
    
    return structuredData;
  });
}

function extractKeywordDensity(text: string): KeywordDensity[] {
  // Clean and normalize text
  const cleanText = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = cleanText.split(' ').filter(word => word.length > 3);
  const totalWords = words.length;
  
  // Count word frequency
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Convert to keyword density array
  const keywords = Object.entries(wordCount)
    .map(([keyword, count]) => ({
      keyword,
      count,
      density: Math.round((count / totalWords) * 10000) / 100 // Percentage with 2 decimals
    }))
    .filter(item => item.count > 2) // Only include words that appear more than twice
    .sort((a, b) => b.count - a.count);
  
  return keywords;
}

async function checkRobotsTxt(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/robots.txt`);
    return response.ok;
  } catch {
    return false;
  }
}

async function checkSitemap(baseUrl: string, hasRobotsTxt: boolean): Promise<boolean> {
  try {
    // Check common sitemap locations
    const sitemapUrls = [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap_index.xml`,
      `${baseUrl}/sitemap.txt`
    ];
    
    for (const url of sitemapUrls) {
      const response = await fetch(url);
      if (response.ok) return true;
    }
    
    // If robots.txt exists, check if it mentions sitemap
    if (hasRobotsTxt) {
      const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
      if (robotsResponse.ok) {
        const robotsText = await robotsResponse.text();
        return robotsText.toLowerCase().includes('sitemap:');
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

function performSEOChecks(
  metaTags: SEOMetaTags,
  headings: HeadingHierarchy,
  structuredData: StructuredData[],
  hasRobotsTxt: boolean,
  hasSitemap: boolean
): SEOCheck[] {
  const checks: SEOCheck[] = [];
  
  // Title tag check
  if (metaTags.title) {
    if (metaTags.title.length >= 30 && metaTags.title.length <= 60) {
      checks.push({
        name: 'Title Tag',
        status: 'good',
        description: 'Title tag is present and optimal length (30-60 characters)'
      });
    } else {
      checks.push({
        name: 'Title Tag',
        status: 'warning',
        description: `Title tag length is ${metaTags.title.length} characters (optimal: 30-60)`
      });
    }
  } else {
    checks.push({
      name: 'Title Tag',
      status: 'error',
      description: 'Missing title tag'
    });
  }
  
  // Meta description check
  if (metaTags.description) {
    if (metaTags.description.length >= 120 && metaTags.description.length <= 160) {
      checks.push({
        name: 'Meta Description',
        status: 'good',
        description: 'Meta description is present and optimal length (120-160 characters)'
      });
    } else {
      checks.push({
        name: 'Meta Description',
        status: 'warning',
        description: `Meta description length is ${metaTags.description.length} characters (optimal: 120-160)`
      });
    }
  } else {
    checks.push({
      name: 'Meta Description',
      status: 'error',
      description: 'Missing meta description'
    });
  }
  
  // H1 tag check
  if (headings.h1 === 1) {
    checks.push({
      name: 'H1 Tag',
      status: 'good',
      description: 'Exactly one H1 tag found'
    });
  } else if (headings.h1 === 0) {
    checks.push({
      name: 'H1 Tag',
      status: 'error',
      description: 'No H1 tag found'
    });
  } else {
    checks.push({
      name: 'H1 Tag',
      status: 'warning',
      description: `Multiple H1 tags found (${headings.h1})`
    });
  }
  
  // Open Graph check
  if (metaTags['og:title'] && metaTags['og:description']) {
    checks.push({
      name: 'Open Graph',
      status: 'good',
      description: 'Open Graph meta tags are present'
    });
  } else {
    checks.push({
      name: 'Open Graph',
      status: 'warning',
      description: 'Missing or incomplete Open Graph meta tags'
    });
  }
  
  // Twitter Card check
  if (metaTags['twitter:card']) {
    checks.push({
      name: 'Twitter Card',
      status: 'good',
      description: 'Twitter Card meta tags are present'
    });
  } else {
    checks.push({
      name: 'Twitter Card',
      status: 'warning',
      description: 'Missing Twitter Card meta tags'
    });
  }
  
  // Canonical URL check
  if (metaTags.canonical) {
    checks.push({
      name: 'Canonical URL',
      status: 'good',
      description: 'Canonical URL is specified'
    });
  } else {
    checks.push({
      name: 'Canonical URL',
      status: 'warning',
      description: 'Missing canonical URL'
    });
  }
  
  // Robots.txt check
  checks.push({
    name: 'Robots.txt',
    status: hasRobotsTxt ? 'good' : 'warning',
    description: hasRobotsTxt ? 'Robots.txt file is present' : 'Robots.txt file not found'
  });
  
  // Sitemap check
  checks.push({
    name: 'Sitemap',
    status: hasSitemap ? 'good' : 'warning',
    description: hasSitemap ? 'XML sitemap is present' : 'XML sitemap not found'
  });
  
  // Structured data check
  if (structuredData.length > 0) {
    checks.push({
      name: 'Structured Data',
      status: 'good',
      description: `${structuredData.length} structured data item(s) found`
    });
  } else {
    checks.push({
      name: 'Structured Data',
      status: 'warning',
      description: 'No structured data found'
    });
  }
  
  return checks;
}

function calculateSEOScore(checks: SEOCheck[], metaTags: SEOMetaTags, headings: HeadingHierarchy): number {
  let score = 0;
  const totalChecks = checks.length;
  
  checks.forEach(check => {
    switch (check.status) {
      case 'good':
        score += 10;
        break;
      case 'warning':
        score += 5;
        break;
      case 'error':
        score += 0;
        break;
    }
  });
  
  // Normalize to 100-point scale
  const maxPossibleScore = totalChecks * 10;
  return Math.round((score / maxPossibleScore) * 100);
}

function generateRecommendations(
  checks: SEOCheck[],
  metaTags: SEOMetaTags,
  headings: HeadingHierarchy
): Array<{ title: string; description: string; priority: 'high' | 'medium' | 'low' }> {
  const recommendations = [];
  
  // High priority recommendations
  if (!metaTags.title) {
    recommendations.push({
      title: 'Add Title Tag',
      description: 'Add a unique, descriptive title tag to every page',
      priority: 'high' as const
    });
  }
  
  if (!metaTags.description) {
    recommendations.push({
      title: 'Add Meta Description',
      description: 'Write compelling meta descriptions for better click-through rates',
      priority: 'high' as const
    });
  }
  
  if (headings.h1 === 0) {
    recommendations.push({
      title: 'Add H1 Tag',
      description: 'Include exactly one H1 tag on each page',
      priority: 'high' as const
    });
  }
  
  // Medium priority recommendations
  if (!metaTags['og:title'] || !metaTags['og:description']) {
    recommendations.push({
      title: 'Optimize Open Graph Tags',
      description: 'Add Open Graph meta tags for better social media sharing',
      priority: 'medium' as const
    });
  }
  
  if (!metaTags.canonical) {
    recommendations.push({
      title: 'Add Canonical URLs',
      description: 'Specify canonical URLs to prevent duplicate content issues',
      priority: 'medium' as const
    });
  }
  
  // Low priority recommendations
  if (!metaTags['twitter:card']) {
    recommendations.push({
      title: 'Add Twitter Card Tags',
      description: 'Enhance Twitter sharing with Twitter Card meta tags',
      priority: 'low' as const
    });
  }
  
  return recommendations;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}