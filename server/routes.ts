import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Wappalyzer from 'wappalyzer';
import { createClient } from '@supabase/supabase-js';
import { extractColors, type ColorResult } from './lib/color-extraction';

// Helper function to map score to letter grade
function mapScoreToGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
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

const PSI_CACHE_TTL = 60 * 60 * 1000; // 1 hour
const psiCache = new Map<string, { overview: { pageLoadTime: number; coreWebVitals: { lcpMs: number; inpMs: number; cls: number; } }; expires: number }>();

async function fetchPageSpeedOverview(url: string) {
  const cached = psiCache.get(url);
  if (cached && cached.expires > Date.now()) {
    return cached.overview;
  }
  const apiKey = process.env.PSI_API_KEY;
  const apiUrl =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance` +
    (apiKey ? `&key=${apiKey}` : "");
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error(`PSI request failed: ${res.status}`);
  }
  const json = await res.json();
  const audits = json.lighthouseResult?.audits || {};
  const metrics = audits['metrics']?.details?.items?.[0] || {};
  const overview = {
    pageLoadTime: Number(((metrics.observedLoad || 0) / 1000).toFixed(1)),
    coreWebVitals: {
      lcpMs: Math.round(audits['largest-contentful-paint']?.numericValue || 0),
      inpMs: Math.round(audits['total-blocking-time']?.numericValue || 0),
      cls: audits['cumulative-layout-shift']?.numericValue || 0,
    },
  };
  psiCache.set(url, { overview, expires: Date.now() + PSI_CACHE_TTL });
  return overview;
}

export async function registerRoutes(app: Express): Promise<Server> {
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

      console.log(`Extracting colors for: ${url}`);
      
      const colors = await extractColors(url);
      
      console.log(`Extracted ${colors.length} unique colors`);
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

      const psiOverview = await fetchPageSpeedOverview(url);

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
            pageLoadTime: psiOverview.pageLoadTime,
            coreWebVitals: psiOverview.coreWebVitals,
            seoScore,
            userExperienceScore
          },
          ui: {
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
              { name: 'LCP', value: Number((psiOverview.coreWebVitals.lcpMs / 1000).toFixed(1)), benchmark: 2.5 },
              { name: 'FID', value: psiOverview.coreWebVitals.inpMs, benchmark: 100 },
              { name: 'CLS', value: psiOverview.coreWebVitals.cls, benchmark: 0.1 }
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
