#!/bin/bash
trap 'kill $(jobs -p)' EXIT

echo "Starting backend server..."
cd backend && npm run dev &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 5

echo "Starting frontend server..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "🚀 Application started successfully!"
echo "📱 Frontend: http://localhost:8080"
echo "🔗 Backend API: http://localhost:3000"
echo "📊 Health Check: http://localhost:3000/api/health"
echo ""
echo "Press Ctrl+C to stop all services"

wait
