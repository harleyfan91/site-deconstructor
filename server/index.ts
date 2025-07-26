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
console.log(`📍 URL source (SUPABASE_SERVICE_ROLE_KEY): ${process.env.VITE_SUPABASE_URL?.substring(0, 20)}...`);
console.log(`📍 Key source (VITE_SUPABASE_URL): ${process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20)}...`);

// API Routes
console.log('🚀 Registering unified API routes...');

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
    const { Pool } = await import('pg');
    
    const scanId = randomUUID();

    // Insert into database tables optimistically
    try {
      // Create database connection
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });

      // Begin transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Insert scan record
        await client.query(
          'INSERT INTO scans (id, url, user_id, active, created_at) VALUES ($1, $2, NULL, true, NOW())',
          [scanId, url.trim()]
        );
        
        // Insert scan status record
        await client.query(
          'INSERT INTO scan_status (scan_id, status, progress) VALUES ($1, $2, 0)',
          [scanId, 'queued']
        );
        
        // Insert scan tasks for each requested type
        for (const type of taskTypes) {
          await client.query(
            'INSERT INTO scan_tasks (scan_id, type, status, created_at) VALUES ($1, $2, $3, NOW())',
            [scanId, type, 'queued']
          );
        }
        
        await client.query('COMMIT');
        console.log('Scan created successfully:', scanId);
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
        await pool.end();
      }
      
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