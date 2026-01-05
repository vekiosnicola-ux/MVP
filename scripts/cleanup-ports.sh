#!/bin/bash
# Cleanup script for killing stuck Next.js dev servers
# Run with: bash scripts/cleanup-ports.sh

echo "🧹 Cleaning up stuck Next.js processes..."

# Kill processes on specific ports
for port in 3000 3001 3002; do
  pid=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$pid" ]; then
    echo "  Killing process on port $port (PID: $pid)"
    kill -9 $pid 2>/dev/null
  fi
done

# Kill any Next.js dev processes
pkill -f "next dev" 2>/dev/null && echo "  Killed Next.js dev processes"

# Verify ports are free
echo ""
echo "📊 Port status:"
for port in 3000 3001 3002; do
  if lsof -i:$port >/dev/null 2>&1; then
    echo "  ❌ Port $port: Still in use"
  else
    echo "  ✅ Port $port: Free"
  fi
done

echo ""
echo "✨ Cleanup complete! You can now run: npm run dev"
