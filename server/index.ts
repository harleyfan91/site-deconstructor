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

// Queue-based website scraping endpoint
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