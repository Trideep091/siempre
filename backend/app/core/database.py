from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from pathlib import Path
from app.core.config import settings

# Safely ensure sqlite database parent folder exists
def ensure_db_dir():
    try:
        if "sqlite" in settings.DATABASE_URL:
            db_path = settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "")
            parent = Path(db_path).parent
            parent.mkdir(parents=True, exist_ok=True)
    except OSError:
        pass

ensure_db_dir()

connect_args = {}
if "sqlite" in settings.DATABASE_URL:
    connect_args["check_same_thread"] = False

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

class Base(DeclarativeBase):
    pass

_db_initialized = False

async def init_db():
    """Initializes tables and ensures media directory exists."""
    _ = settings.media_dir
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def ensure_db_initialized():
    """Lazy initialization helper ensuring tables and demo data exist in serverless environments."""
    global _db_initialized
    if not _db_initialized:
        await init_db()
        try:
            from app.services.demo_data import seed_demo_memorial
            async with AsyncSessionLocal() as session:
                await seed_demo_memorial(session)
        except Exception:
            pass
        _db_initialized = True

async def get_db():
    await ensure_db_initialized()
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


