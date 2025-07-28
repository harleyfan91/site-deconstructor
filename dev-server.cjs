#!/usr/bin/env node

// Development server launcher for the Website Analysis Tool
// This ensures the Express server runs properly with Vite integration

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Website Analysis Tool server...');

// Set environment
process.env.NODE_ENV = 'development';

// Start the tsx server directly
const serverPath = path.join(__dirname, 'server', 'index.ts');

const server = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  cwd: __dirname,
  env: { ...process.env, NODE_ENV: 'development' }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGTERM');
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
});