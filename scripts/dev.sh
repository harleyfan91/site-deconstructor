#!/bin/bash
# Development server for Website Analysis Tool
# Runs Express server with Vite integration on port 5000

echo "🚀 Starting Website Analysis Tool..."
export NODE_ENV=development
exec npx tsx server/index.ts