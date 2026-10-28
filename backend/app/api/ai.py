from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.config import settings
from app.models.memorial import Memorial
from app.models.memory_item import MemoryItem
from app.models.story import Story
from app.schemas.ai import (
    AIStatusResponse,
    RemembranceGenerateRequest,
    RemembranceGenerateResponse,
    StorySummaryRequest,
    StorySummaryResponse
)
from app.services.ollama_service import ollama_service
from app.services.transcription_service import transcription_service

router = APIRouter(prefix="/ai", tags=["AI Remembrance Studio"])

@router.get("/status", response_model=AIStatusResponse)
async def get_ai_status():
    """Check health, availability, and configuration of local AI inference engines."""
    ollama_health = await ollama_service.check_health()
    whisper_health = transcription_service.get_status()

    return AIStatusResponse(
        ollama_available=ollama_health["available"],
        ollama_url=ollama_health["url"],
        configured_model=ollama_health["configured_model"],
        model_installed=ollama_health["model_installed"],
        available_models=ollama_health["available_models"],
        ollama_message=ollama_health["message"],
        
        whisper_available=whisper_health["available"],
        whisper_engine=whisper_health["engine"],
        whisper_model_size=whisper_health["model_size"],
        whisper_status_detail=whisper_health["status_detail"],
        
        local_inference_ready=bool(ollama_health["available"] and ollama_health["model_installed"]),
        data_storage_path=str(settings.media_dir)
    )

@router.post("/remembrance", response_model=RemembranceGenerateResponse)
async def generate_remembrance_draft(data: RemembranceGenerateRequest, db: AsyncSession = Depends(get_db)):
    """Generate a tribute or remembrance draft strictly grounded in user-provided memories."""
    # 1. Fetch memorial
    res = await db.execute(
        select(Memorial).where(Memorial.id == data.memorial_id).options(
            selectinload(Memorial.items),
            selectinload(Memorial.stories)
        )
    )
    memorial = res.scalar_one_or_none()
    if not memorial:
        raise HTTPException(status_code=404, detail="Memorial not found")

    # 2. Filter selected items
    source_items_used = []
    source_memories = []
    for it in memorial.items:
        if not data.selected_item_ids or it.id in data.selected_item_ids:
            it_dict = {
                "id": it.id,
                "title": it.title,
                "item_type": it.item_type,
                "description": it.description or ""
            }
            if it.item_type in ("written_memory", "quote"):
                source_memories.append(it_dict)
            else:
                source_items_used.append(it_dict)

    # 3. Filter selected stories
    source_stories_used = []
    for st in memorial.stories:
        if not data.selected_story_ids or st.id in data.selected_story_ids:
            source_stories_used.append({
                "id": st.id,
                "title": st.title,
                "description": st.description or "",
                "transcript": st.transcript or ""
            })

    # Validate that we have at least some grounding material
    if not source_memories and not source_items_used and not source_stories_used and not memorial.short_description:
        raise HTTPException(
            status_code=400,
            detail="Cannot generate remembrance without source material. Please add or select at least one memory, altar item, or story."
        )

    try:
        gen_result = await ollama_service.generate_remembrance(
            person_name=memorial.name,
            relationship=memorial.relationship_type,
            birth_date=memorial.birth_date,
            remembrance_date=memorial.remembrance_date,
            pronouns=memorial.pronouns,
            source_memories=source_memories,
            source_items=source_items_used,
            source_stories=source_stories_used,
            tone=data.tone,
            format_type=data.format_type,
            use_words_closely=data.use_words_closely,
            additional_context=data.additional_context
        )
        return RemembranceGenerateResponse(
            draft=gen_result["draft"],
            tone=data.tone,
            format_type=data.format_type,
            source_items_used=source_items_used + source_memories,
            source_stories_used=source_stories_used,
            model_used=gen_result["model_used"],
            is_draft=True,
            grounding_notes=gen_result["grounding_notes"]
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.post("/summarize-story", response_model=StorySummaryResponse)
async def summarize_story(data: StorySummaryRequest, db: AsyncSession = Depends(get_db)):
    """Summarize a story's transcript using the local language model."""
    res = await db.execute(select(Story).where(Story.id == data.story_id))
    story = res.scalar_one_or_none()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    text_to_summarize = data.transcript_override or story.transcript
    if not text_to_summarize or len(text_to_summarize.strip()) < 10:
        raise HTTPException(status_code=400, detail="Transcript is too short to summarize.")

    try:
        summary_result = await ollama_service.summarize_transcript(text_to_summarize)
        # Store summary in database
        story.ai_summary = summary_result["summary"]
        await db.commit()
        await db.refresh(story)
        return StorySummaryResponse(
            summary=summary_result["summary"],
            key_themes=summary_result["key_themes"],
            model_used=summary_result["model_used"]
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

