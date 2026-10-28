from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from pathlib import Path
from app.core.config import settings

# Ensure sqlite database parent folder exists
db_path = settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "")
if db_path.startswith("./"):
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False}
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

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    # Make sure media directories exist
    _ = settings.media_dir
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

