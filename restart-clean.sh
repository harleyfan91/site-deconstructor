
#!/bin/bash

echo "🧹 Performing clean restart..."

# Kill existing processes
pkill -f "node\|npm\|tsx" || true
sleep 2

# Clear database completely
echo "🗑️ Clearing database..."
curl -s http://localhost:5000/api/debug/nuclear-reset || echo "Server not running yet"

# Start fresh
echo "🚀 Starting clean..."
npm run dev &
sleep 3
npm run worker:dev &

echo "✅ Clean restart completed"
