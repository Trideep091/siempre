#!/usr/bin/env bash
# Siempre — Production Single-Service Deployment Script
# Builds frontend static assets and serves both UI & API from a single FastAPI process.

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "=========================================================="
echo "   Siempre — Single-Process Production Deployment"
echo "   Some stories deserve to stay."
echo "=========================================================="

PORT="${PORT:-8000}"
HOST="${HOST:-0.0.0.0}"

# 1. Build frontend distribution if Node.js is present
if command -v npm &> /dev/null; then
    echo "📦 Building production frontend assets..."
    cd "$PROJECT_ROOT/frontend"
    npm install --silent
    npm run build
    cd "$PROJECT_ROOT"
    echo "✓ Frontend built successfully to frontend/dist"
else
    if [ ! -d "$PROJECT_ROOT/frontend/dist" ]; then
        echo "❌ Error: Node.js/npm not found and frontend/dist does not exist."
        exit 1
    else
        echo "ℹ️  Using existing frontend/dist build."
    fi
fi

# 2. Setup backend virtual environment
VENV_DIR="$PROJECT_ROOT/backend/venv"
if [ ! -d "$VENV_DIR" ]; then
    echo "⚙️ Creating backend Python virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

echo "⚙️ Ensuring backend dependencies..."
"$VENV_DIR/bin/pip" install --quiet -r "$PROJECT_ROOT/backend/requirements.txt"

# 3. Launch single unified production process
echo "🚀 Starting unified Siempre production server on http://$HOST:$PORT..."
echo "   - Frontend UI: http://$HOST:$PORT"
echo "   - API Health:  http://$HOST:$PORT/api/health"
echo "   - API Docs:    http://$HOST:$PORT/docs"
echo "=========================================================="

export PYTHONPATH="$PROJECT_ROOT/backend"
exec "$VENV_DIR/bin/python3" -m uvicorn app.main:app --host "$HOST" --port "$PORT"

