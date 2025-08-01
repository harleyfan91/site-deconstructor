#!/bin/bash

# Complete application startup script
# Starts both server and worker

echo "🚀 Starting Website Analysis Tool - Complete Setup"

echo "🔗 Using $DATABASE_URL"

# Start both server and worker concurrently
echo "⚡ Starting Express server and background worker..."
concurrently "npx tsx server/index.ts" "npx tsx worker/index.ts" --names "server,worker" --prefix-colors "blue,green"
