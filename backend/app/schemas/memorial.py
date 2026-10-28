from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.schemas.memory_item import MemoryItemResponse
from app.schemas.story import StoryResponse

class MemorialBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    relationship_type: Optional[str] = None
    birth_date: Optional[str] = None
    remembrance_date: Optional[str] = None
    pronouns: Optional[str] = None
    portrait_path: Optional[str] = None
    short_description: Optional[str] = None
    remembrance_text: Optional[str] = None
    theme_settings: Dict[str, Any] = Field(default_factory=lambda: {
        "palette": "warm-marigold",
        "paper_style": "warm-paper",
        "layout": "traditional-ofrenda",
        "style_variant": "diadelosmuertos",
        "show_papel_picado": True,
        "show_candles": True,
        "show_marigolds": True,
    })

class MemorialCreate(MemorialBase):
    pass

class MemorialUpdate(BaseModel):
    name: Optional[str] = None
    relationship_type: Optional[str] = None
    birth_date: Optional[str] = None
    remembrance_date: Optional[str] = None
    pronouns: Optional[str] = None
    portrait_path: Optional[str] = None
    short_description: Optional[str] = None
    remembrance_text: Optional[str] = None
    theme_settings: Optional[Dict[str, Any]] = None

class MemorialSummary(MemorialBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    updated_at: datetime
    item_count: int = 0
    story_count: int = 0

class MemorialDetail(MemorialBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    updated_at: datetime
    items: List[MemoryItemResponse] = Field(default_factory=list)
    stories: List[StoryResponse] = Field(default_factory=list)
