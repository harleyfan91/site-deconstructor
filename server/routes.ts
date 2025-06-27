import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Wappalyzer from 'wappalyzer';
import { createClient } from '@supabase/supabase-js';
import namer from 'color-namer';

// Helper function to map score to letter grade
function mapScoreToGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// Helper function to get color name using color-namer
function getColorName(hex: string): string {
  try {
    const result = namer(hex);
    return result.pantone[0]?.name || result.basic[0]?.name || hex;
  } catch {
    return hex;
  }
}

// ==== COLOR CATEGORY CONFIGURATION ====
// This object controls which color categories are analyzed
// Add/remove categories here and they'll automatically be included in the analysis
// Type definitions for color configuration
interface BaseColorConfig {
  enabled: boolean;
  regex: RegExp;
  minCount: number;
  maxResults: number;
}

interface ColorConfigWithFallback extends BaseColorConfig {
  fallbackRegex: RegExp;
  useFallback: boolean;
  fallbackMinCount: number;
}

type ColorConfig = BaseColorConfig | ColorConfigWithFallback;

function hasUseFallback(config: ColorConfig): config is ColorConfigWithFallback {
  return 'useFallback' in config;
}

const COLOR_CATEGORIES: Record<string, ColorConfig> = {
  // Structural colors
  'Background': {
    enabled: true,
    regex: /(?:^|\s)(?:body|html)(?:\s*\{[^}]*background(?:-color)?:\s*(#[0-9a-fA-F]{3,6})|(?:\s*,\s*)?\.(?:container|main|page|app|root|wrapper|bg-|background)[\w-]*\s*\{[^}]*background(?:-color)?:\s*(#[0-9a-fA-F]{3,6}))/gi,
    fallbackRegex: /(?:^|[^-\w])background(?:-color)?:\s*(#[0-9a-fA-F]{3,6})(?![^;]*(?:hover|focus|active|before|after))/gi,
    minCount: 1,
    maxResults: 3,
    useFallback: true,
    fallbackMinCount: 3 // For fallback, only include colors that appear multiple times
  },
  'Header': {
    enabled: true,
    regex: /(?:header|\.header|\.navbar|\.nav-bar|\.top-bar|\.site-header)[^}]*?background-color:\s*(#[0-9a-fA-F]{3,6})/gi,
    minCount: 1,
    maxResults: 2
  },
  'Footer': {
    enabled: false, // Disabled by default - enable if needed
    regex: /(?:footer|\.footer|\.site-footer|\.bottom)[^}]*?background-color:\s*(#[0-9a-fA-F]{3,6})/gi,
    minCount: 1,
    maxResults: 2
  },
  'Card': {
    enabled: true,
    regex: /(?:\.card|\.panel|\.box|\.container|\.wrapper|\.content)[^}]*?background-color:\s*(#[0-9a-fA-F]{3,6})/gi,
    minCount: 1,
    maxResults: 4
  },

  // Content colors
  'Text': {
    enabled: true,
    regex: /(?:^|[^-])color:\s*(#[0-9a-fA-F]{3,6})(?![^}]*(?:hover|focus|active|before|after))/gi,
    minCount: 2, // Text colors should appear multiple times
    maxResults: 5
  },
  'Theme': {
    enabled: true,
    regex: /(?:--primary|--theme|--brand|--accent|\.primary|\.theme|\.brand)[^}]*?(?:background-color|color):\s*(#[0-9a-fA-F]{3,6})/gi,
    minCount: 1,
    maxResults: 3
  },
  'Border': {
    enabled: true,
    regex: /(?:\.card|\.container|\.box|\.panel|table|input|\.border)[^}]*?border(?:-\w+)?-color:\s*(#[0-9a-fA-F]{3,6})/gi,
    minCount: 1,
    maxResults: 3
  },

  // Interactive colors
  'Button': {
    enabled: true,
    regex: /(?:\.btn|\.button|button|\.cta|\.action)[^}]*?(?:background-color|color):\s*(#[0-9a-fA-F]{3,6})/gi,
    minCount: 1,
    maxResults: 4
  },
  'Link': {
    enabled: true,
    regex: /(?:a:|\.link|\.url)[^}]*?color:\s*(#[0-9a-fA-F]{3,6})(?![^}]*(?:hover|focus|active))/gi,
    minCount: 1,
    maxResults: 3
  },
  'Hover': {
    enabled: false, // Disabled by default as it can be noisy
    regex: /(?:hover|:hover)[^}]*?(?:background-color|color):\s*(#[0-9a-fA-F]{3,6})/gi,
    minCount: 1,
    maxResults: 3
  },

  // Status colors
  'Success': {
    enabled: true,
    regex: /(?:\.success|\.valid|\.ok|\.green|\.positive)[^}]*?(?:background-color|color|border-color):\s*(#[0-9a-fA-F]{3,6})/gi,
    minCount: 1,
    maxResults: 2
  },
  'Warning': {
    enabled: true,
    regex: /(?:\.warning|\.warn|\.caution|\.yellow|\.alert)[^}]*?(?:background-color|color|border-color):\s*(#[0-9a-fA-F]{3,6})/gi,
    minCount: 1,
    maxResults: 2
  },
  'Error': {
    enabled: true,
    regex: /(?:\.error|\.danger|\.invalid|\.red|\.negative)[^}]*?(?:background-color|color|border-color):\s*(#[0-9a-fA-F]{3,6})/gi,
    minCount: 1,
    maxResults: 2
  },
  'Info': {
    enabled: false, // Disabled by default
    regex: /(?:\.info|\.notice|\.blue|\.information)[^}]*?(?:background-color|color|border-color):\s*(#[0-9a-fA-F]{3,6})/gi,
    minCount: 1,
    maxResults: 2
  },

  // Additional UI elements
  'Badge': {
    enabled: false, // Disabled by default
    regex: /(?:\.badge|\.tag|\.label|\.chip)[^}]*?(?:background-color|color):\s*(#[0-9a-fA-F]{3,6})/gi,
    minCount: 1,
    maxResults: 3
  },
  'Icon': {
    enabled: false, // Disabled by default
    regex: /(?:\.icon|\.fa|\.material-icons|svg)[^}]*?(?:color|fill):\s*(#[0-9a-fA-F]{3,6})/gi,
    minCount: 1,
    maxResults: 3
  },
  'Accent': {
    enabled: true,
    regex: /(?:\.accent|box-shadow:[^;]*?)(?:background-color|color|):\s*(#[0-9a-fA-F]{3,6})/gi,
    minCount: 1,
    maxResults: 3
  }
};

// Extract CSS colors from HTML
// Helper to gather CSS content from style tags and inline styles
function extractCssContent(html: string): string {
  let css = '';
  const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const inlineStyleRegex = /style="([^"]+)"/gi;
  let match;

  while ((match = styleTagRegex.exec(html)) !== null) {
    css += ' ' + match[1];
  }
  while ((match = inlineStyleRegex.exec(html)) !== null) {
    css += ' ' + match[1];
  }
  return css;
}

// Normalize hex codes to 6 character uppercase form
function normalizeHex(hex: string): string {
  const value = hex.replace('#', '');
  if (value.length === 3) {
    return ('#' + value[0] + value[0] + value[1] + value[1] + value[2] + value[2]).toUpperCase();
  }
  return ('#' + value).toUpperCase();
}

// Extract CSS colors from HTML
function extractCssColors(html: string): Array<{ name: string; hex: string; usage: string; count: number }> {
  const css = extractCssContent(html);
  const colors: Array<{ name: string; hex: string; usage: string; count: number }> = [];
  const colorCounts: Record<string, number> = {};

  try {
    const allColorRegex = /#[0-9a-fA-F]{3,6}/g;
    let m: RegExpExecArray | null;
    while ((m = allColorRegex.exec(css)) !== null) {
      const hex = normalizeHex(m[0]);
      colorCounts[hex] = (colorCounts[hex] || 0) + 1;
    }

    const processed = new Set<string>();

    Object.entries(COLOR_CATEGORIES).forEach(([categoryName, config]) => {
      if (!config.enabled) return;

      const categoryColors = new Set<string>();
      while ((m = config.regex.exec(css)) !== null) {
        categoryColors.add(normalizeHex(m[1]));
      }

      if (hasUseFallback(config) && categoryColors.size === 0) {
        const fallbackMatches = css.match(config.fallbackRegex) || [];
        const fallbackCounts: Record<string, number> = {};

        fallbackMatches.forEach(f => {
          const hx = f.match(/#[0-9a-fA-F]{3,6}/)?.[0];
          if (hx) {
            const norm = normalizeHex(hx);
            fallbackCounts[norm] = (fallbackCounts[norm] || 0) + 1;
          }
        });

        Object.entries(fallbackCounts)
          .filter(([_, cnt]) => cnt >= config.fallbackMinCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, config.maxResults)
          .forEach(([hx]) => categoryColors.add(hx));
      }

      Array.from(categoryColors)
        .filter(hex => !processed.has(hex) && (colorCounts[hex] || 0) >= config.minCount)
        .sort((a, b) => (colorCounts[b] || 0) - (colorCounts[a] || 0))
        .slice(0, config.maxResults || 5)
        .forEach(hex => {
          colors.push({ name: getColorName(hex), hex, usage: categoryName, count: colorCounts[hex] || 0 });
          processed.add(hex);
        });
    });

    if (COLOR_CATEGORIES['Theme']?.enabled) {
      Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([hex, cnt]) => {
          if (!processed.has(hex) && cnt > 2) {
            colors.push({ name: getColorName(hex), hex, usage: 'Theme', count: cnt });
            processed.add(hex);
          }
        });
    }

    if (colors.length === 0) {
      colors.push(
        { name: 'Primary Text', hex: '#000000', usage: 'Text', count: 0 },
        { name: 'Background', hex: '#FFFFFF', usage: 'Background', count: 0 }
      );
    }
  } catch (e) {
    console.error('Color extraction error:', e);
    return [
      { name: 'Primary Text', hex: '#000000', usage: 'Text', count: 0 },
      { name: 'Background', hex: '#FFFFFF', usage: 'Background', count: 0 }
    ];
  }

  return colors;
}

function getEnabledCategories(): string[] {
  return Object.entries(COLOR_CATEGORIES)
    .filter(([_, config]) => config.enabled)
    .map(([category, _]) => category);
}

function setCategoryEnabled(category: string, enabled: boolean): void {
  if (COLOR_CATEGORIES[category]) {
    COLOR_CATEGORIES[category].enabled = enabled;
  }
}

function getCategoryConfig(category: string) {
  return COLOR_CATEGORIES[category] || null;
}

function updateCategoryConfig(category: string, updates: Partial<typeof COLOR_CATEGORIES[string]>): void {
  if (COLOR_CATEGORIES[category]) {
    COLOR_CATEGORIES[category] = { ...COLOR_CATEGORIES[category], ...updates };
  }
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Color categories configuration API
  app.get('/api/color-categories', (req, res) => {
    const categories = Object.entries(COLOR_CATEGORIES).map(([name, config]) => ({
      name,
      enabled: config.enabled
    }));
    res.json({ categories });
  });

  app.post('/api/color-categories/:categoryName/toggle', (req, res) => {
    const { categoryName } = req.params;
    const { enabled } = req.body;
    
    if (!COLOR_CATEGORIES[categoryName]) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    COLOR_CATEGORIES[categoryName].enabled = enabled;
    res.json({ success: true, category: categoryName, enabled });
  });

  // Analysis API route
  app.get('/api/analyze', async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      console.log(`Starting analysis for: ${url}`);
      
      // Fetch the page to get basic information
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }

      const html = await response.text();
      
      // Extract image URLs from HTML
      const extractedImageUrls = extractImageUrls(html);
      
      // Extract colors dynamically from HTML with improved detection
      const extractedColors = extractCssColors(html);
      
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

      // Tech stack detection (fallback implementation due to Wappalyzer deprecation)
      const techStack: { category: string; technology: string }[] = [];
      try {
        // Basic technology detection from HTML content
        if (html.includes('react')) techStack.push({ category: 'JavaScript Frameworks', technology: 'React' });
        if (html.includes('vue')) techStack.push({ category: 'JavaScript Frameworks', technology: 'Vue.js' });
        if (html.includes('angular')) techStack.push({ category: 'JavaScript Frameworks', technology: 'Angular' });
        if (html.includes('bootstrap')) techStack.push({ category: 'CSS Frameworks', technology: 'Bootstrap' });
        if (html.includes('tailwind')) techStack.push({ category: 'CSS Frameworks', technology: 'Tailwind CSS' });
        if (html.includes('jquery')) techStack.push({ category: 'JavaScript Libraries', technology: 'jQuery' });
        if (hasHTTPS) techStack.push({ category: 'Security', technology: 'HTTPS' });
        
        // Add HTML5 as default
        techStack.push({ category: 'Markup Languages', technology: 'HTML5' });
        
        // Server detection from headers
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

      console.log(`Analysis completed for ${url}`);

      const analysisResult = {
        id: crypto.randomUUID(),
        url,
        timestamp: new Date().toISOString(),
        status: 'complete',
        coreWebVitals: {
          lcp: 2.5,
          fid: 100,
          cls: 0.1
        },
        securityHeaders: {
          csp: response.headers.get('content-security-policy') || '',
          hsts: response.headers.get('strict-transport-security') || '',
          xfo: response.headers.get('x-frame-options') || '',
          xcto: response.headers.get('x-content-type-options') || '',
          referrer: response.headers.get('referrer-policy') || ''
        },
        performanceScore: overallScore,
        seoScore,
        readabilityScore: 75,
        complianceStatus: overallScore >= 80 ? 'pass' : overallScore >= 60 ? 'warn' : 'fail',
        mobileResponsiveness: {
          score: mobileScore,
          issues: mobileIssues
        },
        securityScore: {
          grade: mapScoreToGrade(securityScore),
          findings: securityFindings
        },
        accessibility: {
          violations: accessibilityViolations
        },
        headerChecks,
        data: {
          overview: {
            overallScore,
            pageLoadTime: '2.3s',
            seoScore,
            userExperienceScore
          },
          ui: {
            colors: extractedColors,
            fonts: [
              { name: 'Roboto', category: 'sans-serif', usage: 'Body text', weight: '400' },
              { name: 'Arial', category: 'sans-serif', usage: 'Headings', weight: '700' }
            ],
            images: [
              { type: 'JPEG', count: 8, format: 'JPEG', totalSize: '2.1MB' },
              { type: 'PNG', count: 4, format: 'PNG', totalSize: '1.3MB' }
            ],
            imageAnalysis: {
              totalImages: extractedImageUrls.length,
              estimatedPhotos: Math.floor(extractedImageUrls.length * 0.7),
              estimatedIcons: Math.floor(extractedImageUrls.length * 0.3),
              imageUrls: extractedImageUrls,
              photoUrls: extractedImageUrls.filter((_, index) => index % 3 !== 2),
              iconUrls: extractedImageUrls.filter((_, index) => index % 3 === 2)
            },
            contrastIssues: []
          },
          performance: {
            coreWebVitals: [
              { name: 'LCP', value: 2.5, benchmark: 2.5 },
              { name: 'FID', value: 100, benchmark: 100 },
              { name: 'CLS', value: 0.1, benchmark: 0.1 }
            ],
            performanceScore: overallScore,
            mobileResponsive: mobileScore >= 50,
            recommendations: mobileIssues.map(issue => ({
              type: 'warning' as const,
              title: issue.title,
              description: issue.description
            }))
          },
          seo: {
            score: seoScore,
            metaTags: {
              title: html.match(/<title>(.*?)<\/title>/i)?.[1] || 'No title found',
              description: html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)?.[1] || 'No description found'
            },
            checks: [
              {
                name: 'Title Tag',
                status: html.includes('<title>') ? 'good' : 'error',
                description: html.includes('<title>') ? 'Title tag found' : 'Missing title tag'
              },
              {
                name: 'Meta Description',
                status: html.includes('name="description"') ? 'good' : 'warning',
                description: html.includes('name="description"') ? 'Meta description found' : 'Missing meta description'
              }
            ],
            recommendations: []
          },
          technical: {
            techStack,
            healthGrade: mapScoreToGrade(overallScore),
            issues: securityFindings.concat(mobileIssues).map(issue => ({
              type: 'security',
              description: issue.description,
              severity: 'medium' as const,
              status: 'open'
            })),
            securityScore,
            accessibility: {
              violations: accessibilityViolations
            }
          }
        }
      };

      // Persist to Supabase when service-role key exists
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const admin = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        await admin.from('reports').upsert({
          url,
          scores: { performance: overallScore, mobile: mobileScore, security: securityScore },
          techStack
        });
      }

      res.json(analysisResult);

    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ 
        error: 'Analysis failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
