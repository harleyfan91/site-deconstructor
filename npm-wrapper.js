#!/usr/bin/env node

/**
 * NPM wrapper that intercepts 'npm run dev' calls
 * and redirects them to the proper Express server startup
 */

const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);

// Check if this is 'npm run dev'
if (args.length >= 2 && args[0] === 'run' && args[1] === 'dev') {
  console.log('🔄 Intercepting npm run dev - starting Express server instead...');
  
  // Start the Express server using our working dev-server.cjs
  const devServerPath = path.join(__dirname, 'dev-server.cjs');
  const serverProcess = spawn('node', [devServerPath], {
    stdio: 'inherit',
    cwd: __dirname,
    env: process.env
  });

  // Handle process events
  serverProcess.on('close', (code) => {
    process.exit(code);
  });

  serverProcess.on('error', (error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => serverProcess.kill('SIGTERM'));
  process.on('SIGINT', () => serverProcess.kill('SIGINT'));

} else {
  // For all other npm commands, pass through to real npm
  const realNpm = '/nix/store/r1smm331j6crqs02mn986g06f7cpbggh-nodejs-22.17.0/bin/npm';
  const npmProcess = spawn(realNpm, args, {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env
  });

  npmProcess.on('close', (code) => {
    process.exit(code);
  });

  npmProcess.on('error', (error) => {
    console.error('NPM error:', error);
    process.exit(1);
  });
}