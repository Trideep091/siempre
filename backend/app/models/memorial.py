import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Memorial(Base):
    __tablename__ = "memorials"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    relationship_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    birth_date: Mapped[str | None] = mapped_column(String(50), nullable=True)
    remembrance_date: Mapped[str | None] = mapped_column(String(50), nullable=True)
    pronouns: Mapped[str | None] = mapped_column(String(50), nullable=True)
    portrait_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    short_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    remembrance_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Theme configuration: color_palette, paper_style, layout, decorative_style (diadelosmuertos / serene)
    theme_settings: Mapped[dict] = mapped_column(
        JSON,
        default=lambda: {
            "palette": "warm-marigold",
            "paper_style": "warm-paper",
            "layout": "traditional-ofrenda",
            "style_variant": "diadelosmuertos",
            "show_papel_picado": True,
            "show_candles": True,
            "show_marigolds": True,
        }
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    items: Mapped[list["MemoryItem"]] = relationship(
        "MemoryItem",
        back_populates="memorial",
        cascade="all, delete-orphan",
        order_by="MemoryItem.sort_order"
    )
    stories: Mapped[list["Story"]] = relationship(
        "Story",
        back_populates="memorial",
        cascade="all, delete-orphan",
        order_by="Story.created_at.desc()"
    )

