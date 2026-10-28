import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.config import settings
from app.core.database import init_db, AsyncSessionLocal
from app.api.memorials import router as memorials_router
from app.api.items import router as items_router
from app.api.stories import router as stories_router
from app.api.ai import router as ai_router
from app.api.search import router as search_router
from app.api.demo import router as demo_router
from app.services.demo_data import seed_demo_memorial

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables & media directories exist
    await init_db()
    # Optionally seed demo if database has no memorials
    try:
        async with AsyncSessionLocal() as session:
            await seed_demo_memorial(session)
    except Exception as e:
        print(f"Demo seeding check notice: {e}")
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Siempre — A Living Digital Ofrenda. Private, AI-powered digital memorial preserving memories, stories, traditions, photographs, favorite foods, songs, and personal objects.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local media directory for safe static file serving (portraits, audio, item photos)
settings.media_dir # ensures created
app.mount("/media", StaticFiles(directory=str(settings.media_dir)), name="media")

# Include API Routers under /api AND root (ensures compatibility whether path prefix is preserved or stripped)
for prefix in ["/api", ""]:
    app.include_router(memorials_router, prefix=prefix)
    app.include_router(items_router, prefix=prefix)
    app.include_router(stories_router, prefix=prefix)
    app.include_router(ai_router, prefix=prefix)
    app.include_router(search_router, prefix=prefix)
    app.include_router(demo_router, prefix=prefix)

@app.get("/api")
@app.get("/")
async def api_root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "tagline": "Some stories deserve to stay.",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health")
@app.get("/api/health")
async def health_check():
    """System health check endpoint verifying database connectivity and configuration."""
    db_ok = False
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
            db_ok = True
    except Exception as e:
        db_ok = False

    return JSONResponse({
        "status": "healthy" if db_ok else "degraded",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database_connected": db_ok,
        "media_storage_path": str(settings.media_dir),
        "ollama_base_url": settings.OLLAMA_BASE_URL,
        "configured_llm_model": settings.OLLAMA_MODEL,
        "whisper_model_size": settings.WHISPER_MODEL_SIZE,
    })

# Static Frontend mounting for unified production deployment
from pathlib import Path
from fastapi.responses import FileResponse

frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    if (frontend_dist / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")
    if (frontend_dist / "artwork").exists():
        app.mount("/artwork", StaticFiles(directory=str(frontend_dist / "artwork")), name="artwork")

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
    async def serve_spa(full_path: str):
        # Exclude /api and /media paths from SPA catch-all
        if full_path.startswith("api/") or full_path.startswith("media/"):
            return JSONResponse({"detail": "Not found"}, status_code=404)
        file_candidate = frontend_dist / full_path
        if full_path and file_candidate.is_file():
            return FileResponse(file_candidate)
        return FileResponse(frontend_dist / "index.html")


