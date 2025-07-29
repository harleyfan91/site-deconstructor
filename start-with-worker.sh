#!/bin/bash
# Start both the main application and the worker process

echo "🚀 Starting Website Analysis Tool with Worker..."

# Start the worker in the background
echo "📋 Starting background worker..."
npx tsx worker/index.ts &
WORKER_PID=$!

# Start the main application
echo "🌐 Starting main application..."
npm run dev:ui

# Cleanup when script exits
trap "echo '🛑 Shutting down...'; kill $WORKER_PID 2>/dev/null" EXIT

wait