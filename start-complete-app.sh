#!/bin/bash

# Complete application startup script
# Sets DATABASE_URL properly and starts both server and worker

echo "🚀 Starting Website Analysis Tool - Complete Setup"

# Configure database connection
PROJECT_ID=$(echo $VITE_SUPABASE_URL | sed 's/https:\/\///' | sed 's/\.supabase\.co//')
export DATABASE_URL="postgresql://postgres.${PROJECT_ID}:${SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

echo "🔗 Database configured: postgresql://postgres.${PROJECT_ID}:****@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

# Start both server and worker concurrently
echo "⚡ Starting Express server and background worker..."
concurrently "npx tsx server/index.ts" "npx tsx worker/index.ts" --names "server,worker" --prefix-colors "blue,green"