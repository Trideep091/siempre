import uuid
import shutil
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.config import settings
from app.models.memorial import Memorial
from app.models.memory_item import MemoryItem
from app.models.story import Story
from app.schemas.memorial import (
    MemorialCreate, MemorialUpdate, MemorialSummary, MemorialDetail
)

router = APIRouter(prefix="/memorials", tags=["Memorials"])

SAFE_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

@router.get("", response_model=List[MemorialSummary])
async def list_memorials(db: AsyncSession = Depends(get_db)):
    """List all user memorials with item and story counts."""
    stmt = (
        select(
            Memorial,
            func.count(func.distinct(MemoryItem.id)).label("item_count"),
            func.count(func.distinct(Story.id)).label("story_count")
        )
        .outerjoin(MemoryItem, Memorial.id == MemoryItem.memorial_id)
        .outerjoin(Story, Memorial.id == Story.memorial_id)
        .group_by(Memorial.id)
        .order_by(Memorial.created_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()
    
    summaries = []
    for mem, it_count, st_count in rows:
        summary_data = MemorialSummary.model_validate(mem)
        summary_data.item_count = it_count
        summary_data.story_count = st_count
        summaries.append(summary_data)
    return summaries

@router.post("", response_model=MemorialDetail, status_code=201)
async def create_memorial(data: MemorialCreate, db: AsyncSession = Depends(get_db)):
    """Create a new memorial."""
    memorial = Memorial(
        name=data.name,
        relationship_type=data.relationship_type,
        birth_date=data.birth_date,
        remembrance_date=data.remembrance_date,
        pronouns=data.pronouns,
        portrait_path=data.portrait_path,
        short_description=data.short_description,
        remembrance_text=data.remembrance_text,
        theme_settings=data.theme_settings,
    )
    db.add(memorial)
    await db.commit()
    await db.refresh(memorial)
    
    # Return fresh detail
    stmt = select(Memorial).where(Memorial.id == memorial.id).options(
        selectinload(Memorial.items),
        selectinload(Memorial.stories)
    )
    res = await db.execute(stmt)
    return res.scalar_one()

@router.get("/{id}", response_model=MemorialDetail)
async def get_memorial(id: str, db: AsyncSession = Depends(get_db)):
    """Get full details of a memorial including altar items and stories."""
    stmt = (
        select(Memorial)
        .where(Memorial.id == id)
        .options(
            selectinload(Memorial.items),
            selectinload(Memorial.stories)
        )
    )
    res = await db.execute(stmt)
    memorial = res.scalar_one_or_none()
    if not memorial:
        raise HTTPException(status_code=404, detail="Memorial not found")
    return memorial

@router.patch("/{id}", response_model=MemorialDetail)
async def update_memorial(id: str, data: MemorialUpdate, db: AsyncSession = Depends(get_db)):
    """Update memorial details or theme configuration."""
    stmt = (
        select(Memorial)
        .where(Memorial.id == id)
        .options(
            selectinload(Memorial.items),
            selectinload(Memorial.stories)
        )
    )
    res = await db.execute(stmt)
    memorial = res.scalar_one_or_none()
    if not memorial:
        raise HTTPException(status_code=404, detail="Memorial not found")

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(memorial, key, value)

    await db.commit()
    await db.refresh(memorial)
    return memorial

@router.delete("/{id}", status_code=204)
async def delete_memorial(id: str, db: AsyncSession = Depends(get_db)):
    """Delete a memorial and all its associated media files."""
    stmt = (
        select(Memorial)
        .where(Memorial.id == id)
        .options(
            selectinload(Memorial.items),
            selectinload(Memorial.stories)
        )
    )
    res = await db.execute(stmt)
    memorial = res.scalar_one_or_none()
    if not memorial:
        # Idempotent deletion: if already removed, treat as success
        return Response(status_code=204)

    # Clean up associated files safely
    def safe_remove_file(rel_path: str | None):
        if not rel_path:
            return
        # prevent path traversal
        clean_path = Path(rel_path.lstrip("/").replace("media/", str(settings.media_dir) + "/"))
        if clean_path.exists() and clean_path.is_file():
            try:
                clean_path.unlink()
            except Exception:
                pass

    safe_remove_file(memorial.portrait_path)
    for it in memorial.items:
        safe_remove_file(it.asset_path)
    for st in memorial.stories:
        safe_remove_file(st.audio_path)

    await db.delete(memorial)
    await db.commit()
    return Response(status_code=204)

@router.post("/{id}/portrait")
async def upload_portrait(id: str, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    """Upload a portrait photo for the memorial."""
    stmt = select(Memorial).where(Memorial.id == id)
    res = await db.execute(stmt)
    memorial = res.scalar_one_or_none()
    if not memorial:
        raise HTTPException(status_code=404, detail="Memorial not found")

    ext = Path(file.filename or "").suffix.lower()
    if ext not in SAFE_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image type '{ext}'. Allowed extensions: {', '.join(SAFE_IMAGE_EXTENSIONS)}"
        )

    filename = f"portrait_{memorial.id}_{uuid.uuid4().hex[:8]}{ext}"
    dest_path = settings.media_dir / "portraits" / filename

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Store relative path served via /media
    memorial.portrait_path = f"/media/portraits/{filename}"
    await db.commit()
    await db.refresh(memorial)

    return {"portrait_path": memorial.portrait_path}

@router.get("/{id}/export")
async def export_memorial(id: str, db: AsyncSession = Depends(get_db)):
    """Export complete memorial data as a structured JSON object."""
    stmt = (
        select(Memorial)
        .where(Memorial.id == id)
        .options(
            selectinload(Memorial.items),
            selectinload(Memorial.stories)
        )
    )
    res = await db.execute(stmt)
    memorial = res.scalar_one_or_none()
    if not memorial:
        raise HTTPException(status_code=404, detail="Memorial not found")

    detail = MemorialDetail.model_validate(memorial).model_dump()
    return {
        "export_version": "1.0",
        "app": "Siempre — A Living Digital Ofrenda",
        "exported_at": str(func.now()),
        "memorial": detail
    }

