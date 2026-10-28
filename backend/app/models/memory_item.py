import uuid
from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class MemoryItem(Base):
    __tablename__ = "memory_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    memorial_id: Mapped[str] = mapped_column(String(36), ForeignKey("memorials.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Types: photograph, food, song, flower, object, written_memory, quote, candle
    item_type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    asset_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    external_link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    date_period: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    
    # Position and tiering on altar
    tier: Mapped[str] = mapped_column(String(50), default="middle") # top, middle, base
    position_x: Mapped[float | None] = mapped_column(Float, nullable=True)
    position_y: Mapped[float | None] = mapped_column(Float, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    rotation: Mapped[float] = mapped_column(Float, default=0.0) # subtle rotation for scrapbook feel

    # Link to related story
    story_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("stories.id", ondelete="SET NULL"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    memorial: Mapped["Memorial"] = relationship("Memorial", back_populates="items")
    story: Mapped["Story | None"] = relationship("Story", back_populates="linked_items")

