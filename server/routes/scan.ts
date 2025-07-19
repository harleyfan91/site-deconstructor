import { Router } from 'express';
import { UIScraperService } from '../services/uiScraper';

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

/**
 * POST /api/scan - Trigger or enqueue website scraping
 * Body: { url: string, force?: boolean }
 * Returns: { status: 'queued' | 'running' | 'done', url: string }
 */
// API key authentication middleware for scan endpoint
function authenticateAPI(req: any, res: any, next: any) {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY;
  
  if (process.env.NODE_ENV === 'production' && (!apiKey || apiKey !== expectedKey)) {
    return res.status(401).json({ 
      error: 'Unauthorized - API key required',
      schemaVersion: '1.1.0'
    });
  }
  
  next();
}

router.post('/', authenticateAPI, async (req, res) => {
  try {
    const { url, force = false } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        error: 'URL is required in request body',
        status: 'error'
      });
    }

    const normalizedUrl = normalizeUrl(url);
    
    // Validate URL format
    try {
      new URL(normalizedUrl);
    } catch {
      return res.status(400).json({ 
        error: 'Invalid URL format',
        status: 'error'
      });
    }

    console.log(`🔄 Scan request for: ${normalizedUrl}, force: ${force}`);
    
    // Check if analysis already exists (unless force is true)
    if (!force) {
      const existingAnalysis = await UIScraperService.getCachedUI(normalizedUrl);
      if (existingAnalysis) {
        console.log(`✅ Analysis already exists for: ${normalizedUrl}`);
        return res.status(200).json({
          status: 'done',
          url: normalizedUrl,
          message: 'Analysis already available in cache'
        });
      }
    }
    
    // Trigger fresh scrape
    res.status(202).json({
      status: 'queued',
      url: normalizedUrl,
      message: 'Scraping initiated'
    });
    
    // Start scraping in background (don't await)
    UIScraperService.scrape(normalizedUrl, { force }).then(() => {
      console.log(`✅ Background scrape completed for: ${normalizedUrl}`);
    }).catch((error) => {
      console.error(`❌ Background scrape failed for: ${normalizedUrl}`, error);
    });
    
  } catch (error) {
    console.error('Scan trigger error:', error);
    res.status(500).json({ 
      error: 'Failed to trigger scan',
      status: 'error'
    });
  }
});

/**
 * GET /api/scan - Check scan status for a URL
 * Query: ?url=string
 * Returns: { status: 'not_found' | 'cached' | 'fresh', url: string }
 */
router.get('/', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const normalizedUrl = normalizeUrl(url);
    
    const cachedAnalysis = await UIScraperService.getCachedUI(normalizedUrl);
    
    if (cachedAnalysis) {
      const cacheAge = Date.now() - new Date(cachedAnalysis.scrapedAt || 0).getTime();
      const isFresh = cacheAge < (60 * 60 * 1000); // 1 hour = fresh
      
      res.json({
        status: isFresh ? 'fresh' : 'cached',
        url: normalizedUrl,
        cacheAge: Math.round(cacheAge / 1000), // seconds
        lastScraped: cachedAnalysis.scrapedAt
      });
    } else {
      res.json({
        status: 'not_found',
        url: normalizedUrl
      });
    }
    
  } catch (error) {
    console.error('Scan status check error:', error);
    res.status(500).json({ error: 'Failed to check scan status' });
  }
});

export default router;