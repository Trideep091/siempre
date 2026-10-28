from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.memorial import Memorial
from app.schemas.memorial import MemorialDetail
from app.services.demo_data import seed_demo_memorial

router = APIRouter(prefix="/demo", tags=["Fictional Sample Memorial"])

@router.post("/seed", response_model=MemorialDetail)
async def seed_or_get_demo(db: AsyncSession = Depends(get_db)):
    """Seed or return the fictional demonstration memorial for Abuela Elena Rosales."""
    mem = await seed_demo_memorial(db)
    stmt = (
        select(Memorial)
        .where(Memorial.id == mem.id)
        .options(
            selectinload(Memorial.items),
            selectinload(Memorial.stories)
        )
    )
    res = await db.execute(stmt)
    return res.scalar_one()

