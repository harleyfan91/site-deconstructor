/**
 * Thin Colors Proxy - Routes /api/colors to cached UIScraperService
 * This replaces the heavy direct Playwright approach with cached unified analysis
 */

import type { Request, Response } from 'express';
import { UIScraperService } from '../services/uiScraper';

/**
 * Normalize URL with proper protocol
 */
function normalizeUrl(url: string): string {
  if (!url) return url;
  
  // Remove trailing slash
  url = url.trim().replace(/\/$/, '');
  
  // Add https:// if no protocol is specified
  if (!url.match(/^https?:\/\//)) {
    url = `https://${url}`;
  }
  
  return url;
}

/**
 * Fast proxy handler for /api/colors endpoint
 * Extracts only color-related data from unified UI analysis cache
 */
export async function colorsProxyHandler(req: Request, res: Response) {
  try {
    const { url } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required in request body' });
    }

    const normalizedUrl = normalizeUrl(url);
    
    // Validate URL format
    try {
      new URL(normalizedUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`🎨 Colors proxy: analyzing ${normalizedUrl}`);
    const startTime = Date.now();

    // Get or create unified UI analysis (uses cache automatically)
    const uiAnalysis = await UIScraperService.analyzeUI(normalizedUrl);
    
    // Extract colors-specific data in legacy format expected by frontend
    const response = {
      colors: uiAnalysis.colors || [],
      contrastIssues: uiAnalysis.contrastIssues || [],
      violations: uiAnalysis.violations || [],
      accessibilityScore: uiAnalysis.accessibilityScore || 0
    };

    const duration = Date.now() - startTime;
    console.log(`✅ Colors proxy completed in ${duration}ms: ${response.colors.length} colors, ${response.contrastIssues.length} contrast issues`);

    res.json(response);

  } catch (error) {
    console.error('Colors proxy error:', error);
    
    // Check for timeout or connection errors
    const isConnectionError = error?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' || 
                             error?.message?.includes('fetch failed') ||
                             error?.message?.includes('timeout');
    
    if (isConnectionError) {
      res.status(503).json({ 
        error: 'timeout',
        message: `Unable to connect to ${req.body.url}. Please try again.`
      });
    } else {
      res.status(500).json({ 
        error: 'analysis_failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
}