import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response, Query
from fastapi.responses import FileResponse, PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.config import settings
from app.models.memorial import Memorial
from app.models.story import Story
from app.models.memory_item import MemoryItem
from app.schemas.story import StoryCreate, StoryUpdate, StoryResponse
from app.services.transcription_service import transcription_service
from app.services.ollama_service import ollama_service

router = APIRouter(tags=["Stories & Audio Archive"])

SAFE_AUDIO_EXTENSIONS = {".webm", ".wav", ".mp3", ".m4a", ".ogg", ".aac", ".flac"}

@router.post("/memorials/{memorial_id}/stories", response_model=StoryResponse, status_code=201)
async def create_story(memorial_id: str, data: StoryCreate, db: AsyncSession = Depends(get_db)):
    """Create a new story entry in the family archive."""
    mem_res = await db.execute(select(Memorial).where(Memorial.id == memorial_id))
    if not mem_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Memorial not found")

    story = Story(
        memorial_id=memorial_id,
        title=data.title,
        description=data.description,
        audio_path=data.audio_path,
        audio_duration=data.audio_duration,
        transcript=data.transcript,
        transcript_segments=data.transcript_segments,
        recording_date=data.recording_date,
        teller_name=data.teller_name,
        transcription_status="completed" if data.transcript else "none"
    )
    db.add(story)
    await db.commit()
    await db.refresh(story)

    # Link item if requested
    if data.linked_item_id:
        item_res = await db.execute(select(MemoryItem).where(MemoryItem.id == data.linked_item_id))
        item = item_res.scalar_one_or_none()
        if item:
            item.story_id = story.id
            await db.commit()

    return story

@router.get("/stories/{id}", response_model=StoryResponse)
async def get_story(id: str, db: AsyncSession = Depends(get_db)):
    """Get story details, audio reference, and timestamped transcript."""
    res = await db.execute(
        select(Story).where(Story.id == id).options(selectinload(Story.linked_items))
    )
    story = res.scalar_one_or_none()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    resp = StoryResponse.model_validate(story)
    resp.linked_items_count = len(story.linked_items)
    return resp

@router.patch("/stories/{id}", response_model=StoryResponse)
async def update_story(id: str, data: StoryUpdate, db: AsyncSession = Depends(get_db)):
    """Update story title, description, transcript, or metadata."""
    res = await db.execute(
        select(Story).where(Story.id == id).options(selectinload(Story.linked_items))
    )
    story = res.scalar_one_or_none()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    update_dict = data.model_dump(exclude_unset=True)
    linked_item_id = update_dict.pop("linked_item_id", None)

    for key, value in update_dict.items():
        setattr(story, key, value)

    if linked_item_id is not None:
        if linked_item_id == "":
            # Unlink existing items
            for it in story.linked_items:
                it.story_id = None
        else:
            item_res = await db.execute(select(MemoryItem).where(MemoryItem.id == linked_item_id))
            item = item_res.scalar_one_or_none()
            if item:
                item.story_id = story.id

    await db.commit()
    await db.refresh(story)
    
    resp = StoryResponse.model_validate(story)
    resp.linked_items_count = len(story.linked_items)
    return resp

@router.delete("/stories/{id}", status_code=204)
async def delete_story(id: str, db: AsyncSession = Depends(get_db)):
    """Delete a story and safely delete its original audio recording file."""
    res = await db.execute(select(Story).where(Story.id == id))
    story = res.scalar_one_or_none()
    if not story:
        # Idempotent deletion: if already removed, treat as success
        return Response(status_code=204)

    if story.audio_path:
        clean_path = Path(story.audio_path.lstrip("/").replace("media/", str(settings.media_dir) + "/"))
        if clean_path.exists() and clean_path.is_file():
            try:
                clean_path.unlink()
            except Exception:
                pass

    await db.delete(story)
    await db.commit()
    return Response(status_code=204)

@router.post("/stories/{id}/audio")
async def upload_audio(
    id: str,
    file: UploadFile = File(...),
    duration: float = Query(None, description="Audio duration in seconds"),
    db: AsyncSession = Depends(get_db)
):
    """Upload or record an original audio file for the story."""
    res = await db.execute(select(Story).where(Story.id == id))
    story = res.scalar_one_or_none()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    ext = Path(file.filename or "").suffix.lower()
    if not ext or ext not in SAFE_AUDIO_EXTENSIONS:
        # Default to .webm for browser mediaRecorder blob if unknown
        ext = ".webm"

    filename = f"audio_{story.id}_{uuid.uuid4().hex[:8]}{ext}"
    dest_path = settings.media_dir / "audio" / filename

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    story.audio_path = f"/media/audio/{filename}"
    if duration is not None:
        story.audio_duration = duration
    
    # Reset transcription status to none so user can transcribe
    if not story.transcript:
        story.transcription_status = "none"

    await db.commit()
    await db.refresh(story)

    return {
        "audio_path": story.audio_path,
        "audio_duration": story.audio_duration,
        "transcription_status": story.transcription_status
    }

@router.post("/stories/{id}/transcribe")
async def transcribe_story_audio(id: str, db: AsyncSession = Depends(get_db)):
    """Request local speech-to-text transcription of the story audio."""
    res = await db.execute(select(Story).where(Story.id == id))
    story = res.scalar_one_or_none()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    if not story.audio_path:
        raise HTTPException(status_code=400, detail="No audio file uploaded for this story")

    status = transcription_service.get_status()
    if not status["available"]:
        story.transcription_status = "unavailable"
        story.transcription_error = status["status_detail"]
        await db.commit()
        raise HTTPException(
            status_code=503,
            detail={
                "message": "Local speech recognition model or dependency is currently unavailable.",
                "reason": status["status_detail"],
                "suggestion": "You can type or paste the transcript directly into the editor below."
            }
        )

    # Local audio absolute path
    clean_path = str(Path(story.audio_path.lstrip("/").replace("media/", str(settings.media_dir) + "/")).resolve())
    
    story.transcription_status = "pending"
    story.transcription_error = None
    await db.commit()

    try:
        result = await transcription_service.transcribe_audio(clean_path)
        story.transcript = result.get("transcript", "")
        story.transcript_segments = result.get("segments", [])
        story.transcription_status = "completed"
        story.transcription_error = None
        if result.get("duration") and not story.audio_duration:
            story.audio_duration = result.get("duration")
        await db.commit()
        await db.refresh(story)
        return {
            "status": "completed",
            "transcript": story.transcript,
            "segments": story.transcript_segments
        }
    except Exception as e:
        story.transcription_status = "failed"
        story.transcription_error = str(e)
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@router.get("/stories/{id}/download-transcript")
async def download_transcript(id: str, format: str = "markdown", db: AsyncSession = Depends(get_db)):
    """Download transcript as Markdown or plain text."""
    res = await db.execute(select(Story).where(Story.id == id))
    story = res.scalar_one_or_none()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    if not story.transcript:
        raise HTTPException(status_code=404, detail="No transcript available for this story")

    if format == "text":
        return PlainTextResponse(
            content=story.transcript,
            headers={"Content-Disposition": f'attachment; filename="transcript_{story.id}.txt"'}
        )
    
    # Markdown with metadata
    md_content = f"# {story.title}\n\n"
    if story.teller_name:
        md_content += f"**Narrator / Teller:** {story.teller_name}\n"
    if story.recording_date:
        md_content += f"**Date Recorded:** {story.recording_date}\n"
    if story.description:
        md_content += f"\n> {story.description}\n"
    md_content += f"\n## Transcript\n\n{story.transcript}\n"

    if story.transcript_segments:
        md_content += "\n### Timestamped Segments\n\n"
        for seg in story.transcript_segments:
            start_sec = seg.get("start", 0)
            m = int(start_sec // 60)
            s = int(start_sec % 60)
            md_content += f"- **[{m:02d}:{s:02d}]** {seg.get('text', '')}\n"

    return PlainTextResponse(
        content=md_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="transcript_{story.id}.md"'}
    )

@router.get("/stories/{id}/download-audio")
async def download_audio(id: str, db: AsyncSession = Depends(get_db)):
    """Download original audio file."""
    res = await db.execute(select(Story).where(Story.id == id))
    story = res.scalar_one_or_none()
    if not story or not story.audio_path:
        raise HTTPException(status_code=404, detail="Audio file not found")

    clean_path = Path(story.audio_path.lstrip("/").replace("media/", str(settings.media_dir) + "/"))
    if not clean_path.exists():
        raise HTTPException(status_code=404, detail="File does not exist on disk")

    return FileResponse(
        path=clean_path,
        filename=f"{story.title.replace(' ', '_')}{clean_path.suffix}",
        media_type="application/octet-stream"
    )

