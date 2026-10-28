from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Optional, Dict, Any

class StoryBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    audio_path: Optional[str] = None
    audio_duration: Optional[float] = None
    transcript: Optional[str] = None
    transcript_segments: List[Dict[str, Any]] = Field(default_factory=list)
    ai_summary: Optional[str] = None
    recording_date: Optional[str] = None
    teller_name: Optional[str] = None
    transcription_status: str = Field(default="none")
    transcription_error: Optional[str] = None

class StoryCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    audio_path: Optional[str] = None
    audio_duration: Optional[float] = None
    transcript: Optional[str] = None
    transcript_segments: List[Dict[str, Any]] = Field(default_factory=list)
    recording_date: Optional[str] = None
    teller_name: Optional[str] = None
    linked_item_id: Optional[str] = None

class StoryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    audio_path: Optional[str] = None
    audio_duration: Optional[float] = None
    transcript: Optional[str] = None
    transcript_segments: Optional[List[Dict[str, Any]]] = None
    ai_summary: Optional[str] = None
    recording_date: Optional[str] = None
    teller_name: Optional[str] = None
    transcription_status: Optional[str] = None
    transcription_error: Optional[str] = None
    linked_item_id: Optional[str] = None

class StoryResponse(StoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    memorial_id: str
    created_at: datetime
    updated_at: datetime
    linked_items_count: int = 0
