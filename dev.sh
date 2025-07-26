#!/bin/bash
# Website Analysis Tool Development Server
echo "Starting Website Analysis Tool on port 5000..."
export NODE_ENV=development
export PORT=5000
npx tsx server/index.ts