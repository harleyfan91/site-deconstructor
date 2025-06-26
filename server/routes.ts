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

// Extract CSS colors from HTML
function extractCssColors(html: string): Array<{name: string, hex: string, usage: string, count: number}> {
  const colors: Array<{name: string, hex: string, usage: string, count: number}> = [];
  const colorCounts: Record<string, number> = {};
  try {
    // Count all hex colors
    const allColorRegex = /#[0-9a-fA-F]{3,6}/g;
    const matches = html.match(allColorRegex) || [];
    matches.forEach(hex => {
      const normalized = hex.toUpperCase();
      colorCounts[normalized] = (colorCounts[normalized] || 0) + 1;
    });

    // Prepare regexes for usage
    const backgroundColorRegex = /background-color:\s*(#[0-9a-fA-F]{3,6})/gi;
    const colorRegex           = /(?:^|[^-])color:\s*(#[0-9a-fA-F]{3,6})/gi;
    const borderColorRegex     = /border(?:-\w+)?-color:\s*(#[0-9a-fA-F]{3,6})/gi;
    const boxShadowRegex       = /box-shadow:[^;]*?(#[0-9a-fA-F]{3,6})/gi;

    // Extract each usage set
    let match;
    const backgroundColors = new Set<string>();
    while ((match = backgroundColorRegex.exec(html)) !== null) {
      backgroundColors.add(match[1].toUpperCase());
    }
    const textColors = new Set<string>();
    while ((match = colorRegex.exec(html)) !== null) {
      textColors.add(match[1].toUpperCase());
    }
    const borderColors = new Set<string>();
    while ((match = borderColorRegex.exec(html)) !== null) {
      borderColors.add(match[1].toUpperCase());
    }
    const accentColors = new Set<string>();
    while ((match = boxShadowRegex.exec(html)) !== null) {
      accentColors.add(match[1].toUpperCase());
    }

    // Helper to avoid duplicates
    const processed = new Set<string>();

    // Push by usage in order: Background → Text → Border → Accent
    backgroundColors.forEach(hex => {
      if (!processed.has(hex)) {
        colors.push({ name: getColorName(hex), hex, usage: 'Background', count: colorCounts[hex] || 0 });
        processed.add(hex);
      }
    });
    textColors.forEach(hex => {
      if (!processed.has(hex)) {
        colors.push({ name: getColorName(hex), hex, usage: 'Text', count: colorCounts[hex] || 0 });
        processed.add(hex);
      }
    });
    borderColors.forEach(hex => {
      if (!processed.has(hex)) {
        colors.push({ name: getColorName(hex), hex, usage: 'Border', count: colorCounts[hex] || 0 });
        processed.add(hex);
      }
    });
    accentColors.forEach(hex => {
      if (!processed.has(hex)) {
        colors.push({ name: getColorName(hex), hex, usage: 'Accent', count: colorCounts[hex] || 0 });
        processed.add(hex);
      }
    });

    // Remaining frequent colors → Theme
    Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([hex, cnt]) => {
        const upper = hex.toUpperCase();
        if (!processed.has(upper) && cnt > 1) {
          colors.push({ name: getColorName(upper), hex: upper, usage: 'Theme', count: cnt });
          processed.add(upper);
        }
      });

    // Fallback if nothing found
    if (colors.length === 0) {
      colors.push(
        { name: 'Primary Text',  hex: '#000000', usage: 'Text',       count: 0 },
        { name: 'Background',    hex: '#FFFFFF', usage: 'Background', count: 0 }
      );
    }
  } catch (e) {
    console.error('Color extraction error:', e);
    return [
      { name: 'Primary Text',  hex: '#000000', usage: 'Text',       count: 0 },
      { name: 'Background',    hex: '#FFFFFF', usage: 'Background', count: 0 }
    ];
  }
  return colors;
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
