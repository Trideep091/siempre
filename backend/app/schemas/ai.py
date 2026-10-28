from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RemembranceGenerateRequest(BaseModel):
    memorial_id: str
    tone: str = Field(default="warm", description="warm, reflective, celebratory, poetic, formal, simple")
    format_type: str = Field(default="short_remembrance", description="short_remembrance, tribute, letter, family_history, photo_caption, ceremony_reading, memorial_inscription")
    selected_item_ids: List[str] = Field(default_factory=list, description="IDs of specific altar items or memories to draw from")
    selected_story_ids: List[str] = Field(default_factory=list, description="IDs of stories/transcripts to draw from")
    additional_context: Optional[str] = None
    use_words_closely: bool = Field(default=False, description="Strictly preserve original user phrasing and facts")

class RemembranceGenerateResponse(BaseModel):
    draft: str
    tone: str
    format_type: str
    source_items_used: List[Dict[str, Any]]
    source_stories_used: List[Dict[str, Any]]
    model_used: str
    is_draft: bool = True
    grounding_notes: Optional[str] = None

class StorySummaryRequest(BaseModel):
    story_id: str
    transcript_override: Optional[str] = None

class StorySummaryResponse(BaseModel):
    summary: str
    key_themes: List[str] = Field(default_factory=list)
    model_used: str

class AIStatusResponse(BaseModel):
    ollama_available: bool
    ollama_url: str
    configured_model: str
    model_installed: bool
    available_models: List[str]
    ollama_message: str
    
    whisper_available: bool
    whisper_engine: str
    whisper_model_size: str
    whisper_status_detail: str
    
    local_inference_ready: bool
    data_storage_path: str

