from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Optional

class MemoryItemBase(BaseModel):
    item_type: str = Field(..., description="photograph, food, song, flower, object, written_memory, quote, candle")
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    asset_path: Optional[str] = None
    external_link: Optional[str] = None
    date_period: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    tier: str = Field(default="middle", description="top, middle, base")
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    sort_order: int = 0
    rotation: float = 0.0
    story_id: Optional[str] = None

class MemoryItemCreate(MemoryItemBase):
    pass

class MemoryItemUpdate(BaseModel):
    item_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    asset_path: Optional[str] = None
    external_link: Optional[str] = None
    date_period: Optional[str] = None
    tags: Optional[List[str]] = None
    tier: Optional[str] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    sort_order: Optional[int] = None
    rotation: Optional[float] = None
    story_id: Optional[str] = None

class MemoryItemResponse(MemoryItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    memorial_id: str
    created_at: datetime
    updated_at: datetime

class MemoryItemPositionUpdate(BaseModel):
    id: str
    tier: Optional[str] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    sort_order: int
    rotation: Optional[float] = None
