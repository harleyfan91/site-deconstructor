#!/bin/bash

echo "🧪 Testing Part 3: Worker & Task Fan-out System"
echo "=============================================="

# Step 1: Start the Express server in background
echo "1️⃣ Starting Express server..."
PORT=5000 NODE_ENV=development npx tsx server/index.ts &
SERVER_PID=$!
echo "   Express server started (PID: $SERVER_PID)"
sleep 3

# Step 2: Create a scan via POST /api/scans
echo "2️⃣ Creating a new scan..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/scans \
  -H "Content-Type: application/json" \
  -d '{"url":"https://test-worker-example.com"}')

echo "   Response: $RESPONSE"
SCAN_ID=$(echo $RESPONSE | grep -o '"scan_id":"[^"]*"' | cut -d'"' -f4)
echo "   Generated scan ID: $SCAN_ID"

if [ -z "$SCAN_ID" ]; then
  echo "❌ Failed to create scan. Stopping test."
  kill $SERVER_PID 2>/dev/null
  exit 1
fi

# Step 3: Verify database has queued tasks
echo "3️⃣ Verifying database state..."
echo "   Checking for queued tasks..."

# Step 4: Start the worker
echo "4️⃣ Starting worker process..."
npx tsx worker/index.ts &
WORKER_PID=$!
echo "   Worker started (PID: $WORKER_PID)"

# Step 5: Monitor for 30 seconds
echo "5️⃣ Monitoring progress for 30 seconds..."
sleep 30

# Step 6: Cleanup
echo "6️⃣ Cleaning up processes..."
kill $WORKER_PID 2>/dev/null
kill $SERVER_PID 2>/dev/null

echo "✅ Test completed!"
echo ""
echo "📋 Expected behavior:"
echo "   - 4 tasks created (tech, colors, seo, perf)"
echo "   - Worker picks up tasks sequentially"
echo "   - Each task status: queued → running → complete"
echo "   - Analysis results stored in analysis_cache"
echo "   - Scan status updated to 'complete' when all tasks done"
echo ""
echo "🔍 To verify results manually:"
echo "   1. Check scan_tasks table for completed status"
echo "   2. Check analysis_cache table for cached results"
echo "   3. Check scan_status table for 'complete' status"