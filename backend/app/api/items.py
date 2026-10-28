import uuid
import shutil
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings
from app.models.memorial import Memorial
from app.models.memory_item import MemoryItem
from app.schemas.memory_item import (
    MemoryItemCreate, MemoryItemUpdate, MemoryItemResponse, MemoryItemPositionUpdate
)

router = APIRouter(tags=["Altar Items"])

SAFE_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

@router.post("/memorials/{memorial_id}/items", response_model=MemoryItemResponse, status_code=201)
async def create_item(memorial_id: str, data: MemoryItemCreate, db: AsyncSession = Depends(get_db)):
    """Create a new item on the altar."""
    mem_res = await db.execute(select(Memorial).where(Memorial.id == memorial_id))
    if not mem_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Memorial not found")

    item = MemoryItem(
        memorial_id=memorial_id,
        item_type=data.item_type,
        title=data.title,
        description=data.description,
        asset_path=data.asset_path,
        external_link=data.external_link,
        date_period=data.date_period,
        tags=data.tags,
        tier=data.tier,
        position_x=data.position_x,
        position_y=data.position_y,
        sort_order=data.sort_order,
        rotation=data.rotation,
        story_id=data.story_id
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item

@router.patch("/items/{id}", response_model=MemoryItemResponse)
async def update_item(id: str, data: MemoryItemUpdate, db: AsyncSession = Depends(get_db)):
    """Update item details, position, or tier."""
    res = await db.execute(select(MemoryItem).where(MemoryItem.id == id))
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(item, key, value)

    await db.commit()
    await db.refresh(item)
    return item

@router.delete("/items/{id}", status_code=204)
async def delete_item(id: str, db: AsyncSession = Depends(get_db)):
    """Delete an item and remove any associated media file."""
    res = await db.execute(select(MemoryItem).where(MemoryItem.id == id))
    item = res.scalar_one_or_none()
    if not item:
        # Idempotent deletion: if already removed, treat as success
        return Response(status_code=204)

    if item.asset_path:
        clean_path = Path(item.asset_path.lstrip("/").replace("media/", str(settings.media_dir) + "/"))
        if clean_path.exists() and clean_path.is_file():
            try:
                clean_path.unlink()
            except Exception:
                pass

    await db.delete(item)
    await db.commit()
    return Response(status_code=204)

@router.post("/items/{id}/asset")
async def upload_item_asset(id: str, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    """Upload a photograph or artifact image for a specific altar item."""
    res = await db.execute(select(MemoryItem).where(MemoryItem.id == id))
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    ext = Path(file.filename or "").suffix.lower()
    if ext not in SAFE_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image type '{ext}'. Allowed: {', '.join(SAFE_IMAGE_EXTENSIONS)}"
        )

    filename = f"item_{item.id}_{uuid.uuid4().hex[:8]}{ext}"
    dest_path = settings.media_dir / "items" / filename

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    item.asset_path = f"/media/items/{filename}"
    await db.commit()
    await db.refresh(item)

    return {"asset_path": item.asset_path}

@router.post("/memorials/{memorial_id}/items/reorder")
async def reorder_items(memorial_id: str, positions: List[MemoryItemPositionUpdate], db: AsyncSession = Depends(get_db)):
    """Batch update sort order, tier, or coordinates of altar items."""
    for pos in positions:
        stmt = select(MemoryItem).where(
            MemoryItem.id == pos.id,
            MemoryItem.memorial_id == memorial_id
        )
        res = await db.execute(stmt)
        item = res.scalar_one_or_none()
        if item:
            item.sort_order = pos.sort_order
            if pos.tier is not None:
                item.tier = pos.tier
            if pos.position_x is not None:
                item.position_x = pos.position_x
            if pos.position_y is not None:
                item.position_y = pos.position_y
            if pos.rotation is not None:
                item.rotation = pos.rotation
    
    await db.commit()
    return {"status": "reordered", "count": len(positions)}

