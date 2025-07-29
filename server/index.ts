import express from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";

const app = express();
const server = createServer(app);

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Supabase configuration check
console.log('🔧 Supabase configuration check:');
console.log(`📍 VITE_SUPABASE_URL: ${process.env.VITE_SUPABASE_URL?.substring(0, 50)}...`);
console.log(`📍 SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 50)}...`);

// API Routes
console.log('🚀 Registering unified API routes...');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// UI Analysis endpoint
app.post('/api/analyze-ui', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`🎨 Starting UI analysis for: ${url}`);

    // Import services dynamically to avoid circular dependencies
    const { extractColors } = await import('./lib/color-extraction.js');
    const { UIScraperService } = await import('./services/uiScraper.js');

    // Run color extraction only for now (fonts handled by UIScraperService in other endpoints)
    const colorsResult = await extractColors(url).catch(err => {
      console.error('Color extraction failed:', err);
      return [];
    });

    const uiAnalysis = {
      colors: Array.isArray(colorsResult) ? colorsResult : [],
      fonts: [],  // Fonts handled by UIScraperService
      timestamp: new Date().toISOString(),
      url
    };

    console.log(`✅ UI analysis completed for ${url}`);

    res.json(uiAnalysis);
  } catch (error) {
    console.error('UI analysis error:', error);
    res.status(500).json({ 
      error: 'UI analysis failed',
      details: error.message 
    });
  }
});

// Main API endpoint for comprehensive website analysis
app.get('/api/overview', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        error: 'URL parameter is required',
        status: 'error' 
      });
    }

    // For now, return a basic response structure
    // TODO: Implement full analysis using existing backend services
    res.json({
      status: 'pending',
      url,
      message: 'Analysis infrastructure ready - backend services need integration'
    });

  } catch (error) {
    console.error('Overview API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      status: 'error' 
    });
  }
});

// Optimistic scan creation endpoint - Part 2/7 of refactor
app.post('/api/scans', async (req, res) => {
  try {
    const { url, taskTypes = ["tech", "colors", "seo", "perf"] } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        error: 'URL is required in request body',
        status: 'error' 
      });
    }

    // Import crypto and database modules
    const { randomUUID } = await import('crypto');
    const { db } = await import('./db.js');

    const scanId = randomUUID();

    // Insert into database tables optimistically using Drizzle
    try {
      const { scans, scanStatus, scanTasks } = await import('../shared/schema.js');

      // Insert scan record
      await db.insert(scans).values({
        id: scanId,
        url: url.trim(),
        userId: null,
        active: true,
        createdAt: new Date(),
        lastRunAt: null
      });

      // Insert scan status record
      await db.insert(scanStatus).values({
        id: randomUUID(),
        scanId: scanId,
        status: 'queued',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Insert scan tasks for each requested type
      for (const type of taskTypes) {
        await db.insert(scanTasks).values({
          taskId: randomUUID(),
          scanId: scanId,
          type: type as any,
          status: 'queued',
          createdAt: new Date(),
          result: null
        });
      }

      console.log('Scan created successfully:', scanId);

    } catch (dbError) {
      console.error('Database insertion failed:', dbError);
      throw new Error('Failed to create scan record');
    }

    res.status(201).json({
      scan_id: scanId,
      status: 'queued',
      url: url.trim(),
      task_types: taskTypes
    });

  } catch (error) {
    console.error('Scan creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create scan',
      status: 'error' 
    });
  }
});

// Scan status endpoint
app.get('/api/scans/:scanId/status', async (req, res) => {
  try {
    const { scanId } = req.params;

    // Import database modules
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const client = await pool.connect();

    try {
      // Get scan info
      const scanResult = await client.query(
        'SELECT id, url, active FROM scans WHERE id = $1',
        [scanId]
      );

      if (scanResult.rows.length === 0) {
        return res.status(404).json({ error: 'Scan not found' });
      }

      // Get scan status
      const statusResult = await client.query(
        'SELECT status, progress FROM scan_status WHERE scan_id = $1',
        [scanId]
      );

      const scan = scanResult.rows[0];
      const status = statusResult.rows[0] || { status: 'queued', progress: 0 };

      res.json({
        scanId,
        url: scan.url,
        status: status.status,
        progress: status.progress || 0,
      });

    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error('Error fetching scan status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Task data endpoint
app.get('/api/scans/:scanId/task/:type', async (req, res) => {
  try {
    const { scanId, type } = req.params;

    // Import database modules
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const client = await pool.connect();

    try {
      // Get task info
      const taskResult = await client.query(
        'SELECT task_id, type, status, payload FROM scan_tasks WHERE scan_id = $1 AND type = $2',
        [scanId, type]
      );

      if (taskResult.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const task = taskResult.rows[0];

      // If task is complete, try to get cached results
      let data = null;
      if (task.status === 'complete') {
        const crypto = await import('crypto');
        const scanInfo = await client.query('SELECT url FROM scans WHERE id = $1', [scanId]);
        if (scanInfo.rows.length > 0) {
          const url = scanInfo.rows[0].url;
          const urlHash = crypto.createHash('sha256').update(url).digest('hex');
          const cacheKey = `${type}_${urlHash}`;

          const cacheResult = await client.query(
            'SELECT audit_json FROM analysis_cache WHERE url_hash = $1',
            [cacheKey]
          );

          if (cacheResult.rows.length > 0) {
            data = cacheResult.rows[0].audit_json;
          }
        }
      }

      res.json({
        type,
        status: task.status,
        data,
        error: task.payload?.error || null,
      });

    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error('Error fetching task data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UI Analysis endpoint
app.get('/api/ui/scan', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        error: 'URL parameter is required',
        status: 'error' 
      });
    }

    // Import the UI scraper service
    const { UIScraperService } = await import('./services/uiScraper');

    // Get or create UI analysis
    const analysis = await UIScraperService.getOrCreateAnalysis(url);

    res.json({
      status: 'success',
      data: analysis,
      url
    });

  } catch (error) {
    console.error('UI Analysis API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      status: 'error',
      data: {
        colors: [],
        fonts: [],
        images: [],
        imageAnalysis: {
          totalImages: 0,
          estimatedPhotos: 0,
          estimatedIcons: 0,
          imageUrls: [],
          photoUrls: [],
          iconUrls: [],
          altStats: { withAlt: 0, withoutAlt: 0, emptyAlt: 0, totalImages: 0 }
        },
        contrastIssues: [],
        violations: [],
        accessibilityScore: 0
      }
    });
  }
});

// Keep existing scan endpoint for backward compatibility
app.post('/api/scan', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        error: 'URL is required in request body',
        status: 'error' 
      });
    }

    // For now, return a basic response structure
    // TODO: Implement queue-based scanning using existing backend services
    res.json({
      status: 'queued',
      url,
      message: 'Scan queued - backend integration needed'
    });

  } catch (error) {
    console.error('Scan API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      status: 'error' 
    });
  }
});

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }

  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});