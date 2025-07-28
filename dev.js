#!/usr/bin/env node

/**
 * Development server startup script
 * This script ensures the Express server starts correctly on port 5000
 * with Vite middleware integrated
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Website Analysis Tool...');
console.log('📍 Server will start on port 5000');

// Set environment to development
process.env.NODE_ENV = 'development';

// Start the Express server with TypeScript support
const serverPath = join(__dirname, 'server', 'index.ts');
const serverProcess = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  cwd: __dirname,
  env: process.env
});

// Handle process events
serverProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Server shut down gracefully');
  } else {
    console.log(`❌ Server process exited with code ${code}`);
  }
  process.exit(code);
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// Handle graceful shutdown
const shutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  serverProcess.kill(signal);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

console.log('⚡ Development server starting...');