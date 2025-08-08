#!/bin/bash

# Complete application startup script
# Starts both server and worker

echo "🚀 Starting Website Analysis Tool - Complete Setup"

DATABASE_URL="postgresql://postgres.kdkuhrbaftksknfgjcch:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
echo "🔗 Using $DATABASE_URL"

# Start both server and worker concurrently
echo "⚡ Starting Express server and background worker..."
concurrently "npx tsx server/index.ts" "npx tsx worker/index.ts" --names "server,worker" --prefix-colors "blue,green"
