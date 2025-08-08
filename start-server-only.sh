#!/bin/bash

DATABASE_URL="postgresql://postgres.kdkuhrbaftksknfgjcch:lkFvjLVOXgPXWJ2S@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
echo "🔗 Using $DATABASE_URL"
echo "🚀 Starting server only (without worker)..."

# Start only the server
npm run dev -- --mode server-only
