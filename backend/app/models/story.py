import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Story(Base):
    __tablename__ = "stories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    memorial_id: Mapped[str] = mapped_column(String(36), ForeignKey("memorials.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    audio_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    audio_duration: Mapped[float | None] = mapped_column(nullable=True)
    
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    transcript_segments: Mapped[list[dict]] = mapped_column(JSON, default=list) # [{start: 0.0, end: 3.5, text: "..."}]
    
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    recording_date: Mapped[str | None] = mapped_column(String(100), nullable=True)
    teller_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    # Transcription status: 'none', 'pending', 'completed', 'failed', 'unavailable'
    transcription_status: Mapped[str] = mapped_column(String(50), default="none")
    transcription_error: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    memorial: Mapped["Memorial"] = relationship("Memorial", back_populates="stories")
    linked_items: Mapped[list["MemoryItem"]] = relationship("MemoryItem", back_populates="story")

