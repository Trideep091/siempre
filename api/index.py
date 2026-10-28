import os
import sys
from pathlib import Path

# Set Vercel serverless environment flag
os.environ["VERCEL"] = "1"

# Add backend directory to sys.path so app modules resolve cleanly
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

# Vercel Serverless Function entrypoint: app is exported as ASGI instance

