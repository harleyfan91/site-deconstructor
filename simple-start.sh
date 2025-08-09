#!/bin/bash

# Simple startup that ensures port 5000 opens
echo "🚀 Starting Website Analysis Tool..."

# Configure environment
PROJECT_ID=$(echo $VITE_SUPABASE_URL | sed 's/https:\/\///' | sed 's/\.supabase\.co//')
export DATABASE_URL="postgresql://postgres.${PROJECT_ID}:${SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

# Start server first, then worker
npx tsx server/index.ts &
SERVER_PID=$!

# Give server time to start
sleep 3

# Start worker
npx tsx worker/index.ts &
WORKER_PID=$!

# Keep both processes running
wait $SERVER_PID $WORKER_PID