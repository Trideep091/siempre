from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SearchResultItem(BaseModel):
    result_type: str = Field(..., description="'item', 'story', 'memorial'")
    id: str
    memorial_id: str
    memorial_name: str
    title: str
    snippet: str
    item_type: Optional[str] = None
    date_period: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    score: float = 1.0
    matched_timestamp: Optional[float] = None
    matched_timestamp_label: Optional[str] = None
    extra: Dict[str, Any] = Field(default_factory=dict)

class SearchResponse(BaseModel):
    query: str
    total_results: int
    results: List[SearchResultItem]
    search_mode: str = "keyword" # "keyword" or "semantic_hybrid"
    notice: Optional[str] = None

