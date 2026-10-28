from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db
from app.schemas.search import SearchResponse
from app.services.search_service import search_service

router = APIRouter(prefix="/search", tags=["Memory Search"])

@router.get("", response_model=SearchResponse)
async def search_memories(
    q: str = Query(..., min_length=1, description="Search query string"),
    memorial_id: Optional[str] = Query(None, description="Filter by memorial"),
    item_type: Optional[str] = Query(None, description="Filter by item type (food, song, photograph, etc.)"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    db: AsyncSession = Depends(get_db)
):
    """Search across memorials, altar items, written memories, and timestamped audio transcripts."""
    return await search_service.search(
        db=db,
        query=q,
        memorial_id=memorial_id,
        item_type=item_type,
        tag=tag
    )

