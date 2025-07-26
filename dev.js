#!/usr/bin/env node
// Simple dev script to start the Express server with Vite integration
import { exec } from 'child_process';

const server = exec('tsx server/index.ts', { stdio: 'inherit' });

server.stdout?.on('data', (data) => {
  console.log(data.toString());
});

server.stderr?.on('data', (data) => {
  console.error(data.toString());
});

server.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
  process.exit(code || 0);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down server...');
  server.kill('SIGTERM');
});