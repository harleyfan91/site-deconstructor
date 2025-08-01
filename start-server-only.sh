#!/bin/bash

echo "🔗 Using $DATABASE_URL"
echo "🚀 Starting server only (without worker)..."

# Start only the server
npm run dev -- --mode server-only
