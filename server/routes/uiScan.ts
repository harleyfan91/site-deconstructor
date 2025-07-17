/**
 * Unified UI Scan Route - replaces /api/colors and /api/fonts
 */

import { Router } from 'express';
import { UIScraperService } from '../services/uiScraper';

const router = Router();

/**
 * POST /api/ui/scan - Unified UI analysis endpoint
 */
router.post('/scan', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        error: 'URL is required in request body',
        example: { url: 'https://example.com' }
      });
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Validate URL format
    try {
      new URL(normalizedUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`🔍 UI scan requested for: ${normalizedUrl}`);
    const startTime = Date.now();

    // Perform unified UI analysis
    const uiAnalysis = await UIScraperService.analyzeUI(normalizedUrl);

    const duration = Date.now() - startTime;
    console.log(`✅ UI scan completed in ${duration}ms for: ${normalizedUrl}`);

    res.json(uiAnalysis);

  } catch (error) {
    console.error('UI scan error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('TimeoutError')) {
        return res.status(504).json({ error: 'Request timeout while analyzing UI' });
      }
      if (error.message.includes('net::ERR_') || error.message.includes('Navigation failed')) {
        return res.status(400).json({ error: 'Unable to access the provided URL' });
      }
      if (error.message.includes('Invalid URL')) {
        return res.status(400).json({ error: 'Invalid URL provided' });
      }
    }

    res.status(500).json({ error: 'UI analysis failed' });
  }
});

/**
 * GET /api/ui/scan - Get cached UI analysis
 */
router.get('/scan', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    console.log(`📋 Checking UI cache for: ${normalizedUrl}`);

    // Try to get cached result
    const cachedUI = await UIScraperService.getCachedUI(normalizedUrl);
    
    if (cachedUI) {
      console.log(`✅ UI cache hit for: ${normalizedUrl}`);
      res.json(cachedUI);
    } else {
      console.log(`❌ UI cache miss for: ${normalizedUrl}`);
      res.status(404).json({ 
        error: 'No cached UI analysis found for this URL',
        suggestion: 'Use POST /api/ui/scan to perform fresh analysis'
      });
    }

  } catch (error) {
    console.error('UI cache lookup error:', error);
    res.status(500).json({ error: 'Failed to lookup cached UI analysis' });
  }
});

/**
 * DELETE /api/ui/scan - Invalidate cache for URL
 */
router.delete('/scan', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required in request body' });
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    console.log(`🗑️ Invalidating UI cache for: ${normalizedUrl}`);

    await UIScraperService.invalidateCache(normalizedUrl);

    res.json({ 
      message: 'UI cache invalidated successfully',
      url: normalizedUrl
    });

  } catch (error) {
    console.error('UI cache invalidation error:', error);
    res.status(500).json({ error: 'Failed to invalidate UI cache' });
  }
});

export default router;