#!/bin/bash

# Extract project ID from Supabase URL
PROJECT_ID=$(echo $VITE_SUPABASE_URL | sed 's/https:\/\///' | sed 's/\.supabase\.co//')

# Set DATABASE_URL for Drizzle
export DATABASE_URL="postgresql://postgres.${PROJECT_ID}:${SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

echo "🔗 DATABASE_URL set to: postgresql://postgres.${PROJECT_ID}:****@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
echo "🚀 Starting server only (without worker)..."

# Start only the server
npm run dev -- --mode server-only