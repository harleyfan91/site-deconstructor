#!/usr/bin/env node

// Startup script for the Express server with Vite middleware
// This ensures the server starts on port 5000 as expected by the workflow

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Express server with Vite middleware...');

// Start the server using tsx to handle TypeScript
const serverPath = path.join(__dirname, 'server', 'index.ts');
const serverProcess = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  cwd: __dirname
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  serverProcess.kill('SIGINT');
});