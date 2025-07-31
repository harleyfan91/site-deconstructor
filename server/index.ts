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

// Debug endpoint to clear all caches
app.get('/api/debug/clear-cache', async (req, res) => {
  try {
    const cacheModule = await import('./lib/cache.js');
    const cache = cacheModule.unifiedCache || cacheModule.default;

    const currentKeys = cache.listKeys ? cache.listKeys() : [];
    console.log('🔍 Current cache keys:', currentKeys);

    if (cache.clearAll) {
      cache.clearAll();
    }

    res.json({ 
      message: 'All caches cleared',
      clearedKeys: currentKeys.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({ error: 'Failed to clear cache', details: error.message });
  }
});

// Debug endpoint to reset failed tasks
app.get('/api/debug/reset-failed-tasks', async (req, res) => {
  try {
    const { db } = await import('./db.js');
    const { scanTasks } = await import('../shared/schema.js');
    const { eq } = await import('drizzle-orm');

    // Get all failed tasks
    const failedTasks = await db
      .select()
      .from(scanTasks)
      .where(eq(scanTasks.status, 'failed'));

    // Reset them to queued
    if (failedTasks.length > 0) {
      for (const task of failedTasks) {
        await db
          .update(scanTasks)
          .set({ 
            status: 'queued',
            payload: null 
          })
          .where(eq(scanTasks.taskId, task.taskId));
      }
    }

    res.json({ 
      message: `Reset ${failedTasks.length} failed tasks to queued`,
      resetCount: failedTasks.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Reset failed tasks error:', error);
    res.status(500).json({ error: 'Failed to reset tasks', details: error.message });
  }
});

// Debug endpoint to completely wipe all data
app.get('/api/debug/nuclear-reset', async (req, res) => {
  try {
    const { db } = await import('./db.js');
    const { scans, scanStatus, scanTasks, analysisCache } = await import('../shared/schema.js');

    console.log('🧹 Starting nuclear database reset...');

    // Delete everything in order (FK constraints)
    await db.delete(scanTasks);
    await db.delete(scanStatus);
    await db.delete(scans);
    await db.delete(analysisCache);

    // Clear memory cache too
    const cacheModule = await import('./lib/cache.js');
    const cache = cacheModule.unifiedCache || cacheModule.default;
    if (cache.clearAll) {
      cache.clearAll();
    }

    console.log('✅ Nuclear reset completed');

    res.json({ 
      message: 'All database tables cleared and memory cache reset',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Nuclear reset error:', error);
    res.status(500).json({ error: 'Failed to perform nuclear reset', details: error.message });
  }
});

// Debug endpoint to inspect cache contents
app.get('/api/debug/cache-info', async (req, res) => {
  try {
    const cacheModule = await import('./lib/cache.js');
    const cache = cacheModule.unifiedCache || cacheModule.default;

    const cacheKeys = cache.listKeys ? cache.listKeys() : [];

    res.json({ 
      cacheKeys,
      cacheSize: cacheKeys.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache info error:', error);
    res.status(500).json({ error: 'Failed to get cache info', details: error.message });
  }
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
    const { scans, scanStatus, scanTasks } = await import('../shared/schema.js');

    const scanId = randomUUID();

    // Insert into database tables optimistically using Drizzle
    try {

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
        scanId: scanId,
        status: 'queued',
        progress: 0
      });

      // Insert scan tasks for each requested type
      const crypto = await import('crypto');
      for (const type of taskTypes) {
        const taskId = crypto.randomUUID();
        await db.insert(scanTasks).values({
          taskId: taskId,
          scanId: scanId,
          type: type as any,
          status: 'queued',
          createdAt: new Date(),
          payload: null
        });
        console.log(`✅ Created ${type} task: ${taskId} for scan: ${scanId}`);
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
    console.error('❌ Scan creation error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ 
      error: 'Failed to create scan',
      details: error instanceof Error ? error.message : String(error),
      status: 'error' 
    });
  }
});

// Scan status endpoint
app.get('/api/scans/:scanId/status', async (req, res) => {
  try {
    const { scanId } = req.params;

    // Import database and schema modules
    const { db } = await import('./db.js');
    const { scans, scanStatus } = await import('../shared/schema.js');
    const { eq } = await import('drizzle-orm');

    // Get scan info using Drizzle
    const scanResult = await db.select().from(scans).where(eq(scans.id, scanId));

    if (scanResult.length === 0) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    // Get scan status
    const statusResult = await db.select().from(scanStatus).where(eq(scanStatus.scanId, scanId));

    const scan = scanResult[0];
    const status = statusResult[0] || { status: 'queued', progress: 0 };

    res.json({
      scanId,
      url: scan.url,
      status: status.status,
      progress: status.progress || 0,
    });
  } catch (error) {
    console.error('Error fetching scan status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Task data endpoint
app.get('/api/scans/:scanId/task/:type', async (req, res) => {
  try {
    const { scanId, type } = req.params;

    // Import database and schema modules
    const { db } = await import('./db.js');
    const { scanTasks, scans, analysisCache } = await import('../shared/schema.js');
    const { eq, and } = await import('drizzle-orm');

    // Get task info using Drizzle
    const taskResult = await db.select().from(scanTasks).where(
      and(eq(scanTasks.scanId, scanId), eq(scanTasks.type, type as any))
    );

    if (taskResult.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskResult[0];

    // If task is complete, try to get cached results
    let data = null;
    if (task.status === 'complete') {
      const crypto = await import('crypto');
      const scanInfo = await db.select({ url: scans.url }).from(scans).where(eq(scans.id, scanId));

      if (scanInfo.length > 0) {
        const url = scanInfo[0].url;
        const urlHash = crypto.createHash('sha256').update(url).digest('hex');
        const cacheKey = `${type}_${urlHash}`;

        const cacheResult = await db.select().from(analysisCache).where(eq(analysisCache.urlHash, cacheKey));

        if (cacheResult.length > 0) {
          data = cacheResult[0].auditJson as any;
        }
      }
    }

    res.json({
      type,
      status: task.status,
      data,
      error: (task.payload as any)?.error || null,
    });
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

// Debug endpoint to check database state
app.get('/api/debug/database-status', async (req, res) => {
  try {
    const { db, sql } = await import('./db.js');
    const { scans, scanStatus, scanTasks } = await import('../shared/schema.js');
    
    // Test basic connection
    await sql`SELECT 1 as test`;
    
    const allScans = await db.select().from(scans).limit(10);
    const allTasks = await db.select().from(scanTasks).limit(20);
    const allStatus = await db.select().from(scanStatus).limit(10);
    
    console.log('📊 Database status check:');
    console.log(`  Connection: ✅ Active`);
    console.log(`  Scans: ${allScans.length}`);
    console.log(`  Tasks: ${allTasks.length}`);
    console.log(`  Status: ${allStatus.length}`);
    
    const queuedTasks = allTasks.filter(t => t.status === 'queued');
    console.log(`  Queued tasks: ${queuedTasks.length}`);
    
    if (queuedTasks.length > 0) {
      console.log('  Queued task details:', queuedTasks.map(t => ({
        id: t.taskId,
        type: t.type,
        scanId: t.scanId,
        status: t.status
      })));
    }
    
    // Check if these are the same scans showing in console
    const suspiciousScans = allScans.filter(s => 
      s.id === '173ac327-8709-41ca-8821-3c8076e76dc0' || 
      s.id === '8c861fc6-98ce-4e0a-8715-35bc4599591d'
    );
    
    res.json({
      connection: 'active',
      scans: allScans.length,
      tasks: allTasks.length,
      status: allStatus.length,
      queuedTasks: queuedTasks.length,
      suspiciousScans: suspiciousScans.length,
      recentScans: allScans.slice(0, 3).map(s => ({
        id: s.id,
        url: s.url,
        createdAt: s.createdAt
      })),
      recentTasks: allTasks.slice(0, 5).map(t => ({
        id: t.taskId,
        type: t.type,
        status: t.status,
        scanId: t.scanId
      }))
    });
  } catch (error) {
    console.error('Database status check failed:', error);
    res.status(500).json({ 
      error: 'Database check failed', 
      details: error.message,
      connection: 'failed'
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

// Test endpoint to create a scan manually (GET for easy browser testing)
app.get('/api/test-scan', async (req, res) => {
  try {
    const url = req.query.url as string || 'https://linear.app';

    console.log(`🔄 Creating test scan for: ${url}`);

    // Import necessary modules
    const { db } = await import('./db.js');
    const schema = await import('../shared/schema.js');

    // Create scan record
    const scanResult = await db.insert(schema.scans).values({
      url: url,
      userId: null, // Anonymous scan
      createdAt: new Date(),
      active: true
    }).returning();

    const scanId = scanResult[0].id;
    console.log(`✅ Created scan with ID: ${scanId}`);

    // Create scan status
    await db.insert(schema.scanStatus).values({
      scanId: scanId,
      status: 'queued',
      progress: 0,
      startedAt: new Date()
    });

    // Create individual tasks
    const taskTypes = ['tech', 'colors', 'seo', 'perf'] as const;
    for (const taskType of taskTypes) {
      await db.insert(schema.scanTasks).values({
        scanId: scanId,
        type: taskType,
        status: 'queued'
      });
    }

    console.log(`✅ Created ${taskTypes.length} tasks for scan ${scanId}`);

    res.json({ 
      success: true, 
      scanId, 
      message: `Scan created with ${taskTypes.length} tasks`,
      note: 'Check your Supabase tables now!'
    });
  } catch (error) {
    console.error('❌ Error creating test scan:', error);
    res.status(500).json({ error: 'Failed to create scan', details: error.message });
  }
});

// POST version too
app.post('/api/test-scan', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`🔄 Creating test scan for: ${url}`);

    // Import necessary modules
    const { db } = await import('./db.js');
    const schema = await import('../shared/schema.js');

    // Create scan record
    const scanResult = await db.insert(schema.scans).values({
      url: url,
      userId: null, // Anonymous scan
      createdAt: new Date(),
      active: true
    }).returning();

    const scanId = scanResult[0].id;
    console.log(`✅ Created scan with ID: ${scanId}`);

    // Create scan status
    await db.insert(schema.scanStatus).values({
      scanId: scanId,
      status: 'queued',
      progress: 0,
      startedAt: new Date()
    });

    // Create individual tasks
    const taskTypes = ['tech', 'colors', 'seo', 'perf'] as const;
    for (const taskType of taskTypes) {
      await db.insert(schema.scanTasks).values({
        scanId: scanId,
        type: taskType,
        status: 'queued'
      });
    }

    console.log(`✅ Created ${taskTypes.length} tasks for scan ${scanId}`);

    res.json({ 
      success: true, 
      scanId, 
      message: `Scan created with ${taskTypes.length} tasks` 
    });
  } catch (error) {
    console.error('❌ Error creating test scan:', error);
    res.status(500).json({ error: 'Failed to create scan' });
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
    log(`Server running on http://0.0.0.0:${port}`);
    console.log(`🌐 Frontend accessible via Replit's webview`);
    console.log(`🔧 API endpoints available at /api/*`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});