import type { Express } from "express";
import { createServer, type Server } from "http";
import overviewRouter from './overview';
import scanRouter from './scan';

/**
 * Register unified routes - Phase 1 implementation
 * Only mounts overview and scan routes plus essential non-UI routes
 */
export async function registerRoutes(app: Express): Promise<Server> {
  console.log('🚀 Registering unified API routes...');
  
  // Mount the two main unified routes
  app.use('/api/overview', overviewRouter);
  app.use('/api/scan', scanRouter);
  
  // TODO: Phase 4-6 - Add rate limiting, auth, CORS hardening
  
  const server = createServer(app);
  return server;
}