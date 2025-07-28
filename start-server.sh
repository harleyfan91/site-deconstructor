#!/bin/bash
# Start the integrated Express + Vite server
echo "🚀 Starting Site Deconstructor server with Vite integration..."
echo "📍 Server will be available at: https://[replit-domain]/7-part-database-refactor/"
echo "📍 Direct access: http://localhost:5000"
echo ""

# Kill any existing processes
pkill -f "tsx.*server" || true
pkill -f "vite" || true

# Start the integrated server
PORT=5000 tsx server/index.ts