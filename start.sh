#!/usr/bin/env bash
# Siempre — A Living Digital Ofrenda
# Startup Script for Backend & Frontend

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "========================================================"
echo "   Siempre — A Living Digital Ofrenda"
echo "   Some stories deserve to stay."
echo "========================================================"
echo ""

# 1. Check Python runtime
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed on this system."
    echo "   Please install Python 3.10+ from python.org"
    exit 1
fi

# 2. Check Node & npm
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "❌ Error: Node.js and npm are required to run the frontend."
    echo "   Please install Node.js 18+ from nodejs.org"
    exit 1
fi

echo "✓ Detected Python: $(python3 --version)"
echo "✓ Detected Node.js: $(node -v)"
echo "✓ Detected npm: $(npm -v)"

# 3. Check / create Python virtual environment
VENV_DIR="$PROJECT_ROOT/backend/venv"
if [ ! -d "$VENV_DIR" ]; then
    echo "⚙️ Creating backend Python virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

# 4. Install backend dependencies
echo "⚙️ Verifying backend dependencies..."
"$VENV_DIR/bin/pip" install --quiet -r "$PROJECT_ROOT/backend/requirements.txt"

# 5. Check frontend node_modules
if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
    echo "⚙️ Installing frontend packages (first run)..."
    (cd "$PROJECT_ROOT/frontend" && npm install --silent)
fi

# 6. Check Ollama status
echo ""
echo "--- Local AI Status Check ---"
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✓ Local Ollama server is running at http://localhost:11434"
else
    echo "ℹ️  Ollama server is not currently running."
    echo "   To enable local remembrance writing:"
    echo "   1. Install Ollama: https://ollama.com"
    echo "   2. Run in terminal: ollama run llama3.2:3b"
    echo "   (Siempre runs normally even if Ollama is offline!)"
fi
echo ""

# 7. Start Backend in background
echo "🚀 Starting Siempre Backend on http://127.0.0.1:8000..."
export PYTHONPATH="$PROJECT_ROOT/backend"
"$VENV_DIR/bin/python3" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Trap signals to cleanly shut down both servers
cleanup() {
    echo ""
    echo "🛑 Shutting down Siempre servers..."
    kill $BACKEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 8. Wait for backend to be ready
echo "Waiting for backend health check..."
for i in {1..15}; do
    if curl -s http://127.0.0.1:8000/api/health > /dev/null 2>&1; then
        echo "✓ Backend is ready and healthy at http://127.0.0.1:8000"
        break
    fi
    sleep 0.5
done

# 9. Start Frontend dev server
echo "🚀 Starting Siempre Frontend on http://localhost:5173..."
cd "$PROJECT_ROOT/frontend"
npx vite --host 127.0.0.1 --port 5173

