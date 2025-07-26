#!/bin/bash
# Website Analysis Tool Development Server
echo "Starting Website Analysis Tool..."
export NODE_ENV=development
export PORT=5000

# Start Express server on port 5000 in background
echo "Starting Express server on port 5000..."
npx tsx server/index.ts &
SERVER_PID=$!

# Wait a moment for server to start
sleep 2

# Check if server started successfully
if kill -0 $SERVER_PID 2>/dev/null; then
    echo "Express server started successfully (PID: $SERVER_PID)"
    echo "Backend API available at http://localhost:5000"
    echo "Frontend will be available on the Vite port"
else
    echo "Failed to start Express server"
    exit 1
fi

# Keep script running and handle cleanup
cleanup() {
    echo "Shutting down servers..."
    kill $SERVER_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Wait for the server process
wait $SERVER_PID