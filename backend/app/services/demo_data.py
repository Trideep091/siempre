import uuid
import struct
import math
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.memorial import Memorial
from app.models.memory_item import MemoryItem
from app.models.story import Story
from app.core.config import settings

def generate_gentle_ambient_wav(file_path: Path, duration_seconds: int = 15):
    """Generate a gentle valid stereo PCM WAV audio file for the demo story player."""
    file_path.parent.mkdir(parents=True, exist_ok=True)
    sample_rate = 22050
    num_samples = int(sample_rate * duration_seconds)
    num_channels = 2
    bits_per_sample = 16
    byte_rate = sample_rate * num_channels * (bits_per_sample // 8)
    block_align = num_channels * (bits_per_sample // 8)
    data_size = num_samples * block_align

    # Soft soothing chime frequencies (F-major chord: F4, A4, C5)
    freqs = [349.23, 440.0, 523.25]

    with open(file_path, "wb") as f:
        # RIFF header
        f.write(b"RIFF")
        f.write(struct.pack("<I", 36 + data_size))
        f.write(b"WAVE")
        # fmt subchunk
        f.write(b"fmt ")
        f.write(struct.pack("<I", 16)) # Subchunk1Size
        f.write(struct.pack("<H", 1))  # AudioFormat (PCM)
        f.write(struct.pack("<H", num_channels))
        f.write(struct.pack("<I", sample_rate))
        f.write(struct.pack("<I", byte_rate))
        f.write(struct.pack("<H", block_align))
        f.write(struct.pack("<H", bits_per_sample))
        # data subchunk
        f.write(b"data")
        f.write(struct.pack("<I", data_size))

        for i in range(num_samples):
            t = float(i) / sample_rate
            # Gentle envelope
            envelope = math.sin(math.pi * t / duration_seconds) ** 0.5
            val = 0.0
            for idx, freq in enumerate(freqs):
                val += math.sin(2.0 * math.pi * freq * t + idx * 0.5) * 0.25
            sample_val = int(val * envelope * 24000.0)
            sample_val = max(-32768, min(32767, sample_val))
            # write stereo sample
            f.write(struct.pack("<hh", sample_val, sample_val))

async def seed_demo_memorial(db: AsyncSession) -> Memorial:
    """Seed the complete fictional demo ofrenda for Abuela Elena Rosales."""
    # Check if existing complete demo exists
    existing_stmt = select(Memorial).where(Memorial.name.like("%Elena Rosales%"))
    res = await db.execute(existing_stmt)
    existing = res.scalar_one_or_none()
    if existing:
        item_count_stmt = select(func.count(MemoryItem.id)).where(MemoryItem.memorial_id == existing.id)
        count_res = await db.execute(item_count_stmt)
        if (count_res.scalar() or 0) > 0:
            return existing
        else:
            await db.delete(existing)
            await db.commit()

    # Create demo audio asset
    demo_audio_filename = "demo_abuela_courtyard.wav"
    audio_path = settings.media_dir / "audio" / demo_audio_filename
    if not audio_path.exists():
        generate_gentle_ambient_wav(audio_path, duration_seconds=45)

    # 1. Create Memorial
    memorial = Memorial(
        name="Elena Rosales (Abuela)",
        relationship_type="Grandmother (Abuela)",
        birth_date="June 14, 1938",
        remembrance_date="November 2, 2021",
        pronouns="she/her",
        portrait_path="/artwork/demo-portrait-elena.svg",
        short_description="Beloved matriarch, master gardener of marigolds and jasmine, baker of pan de muerto, and heart of our family kitchen in Pátzcuaro, Michoacán.",
        remembrance_text=(
            "Abuela Elena lived a life measured not by possessions, but by the warmth of her kitchen, "
            "the height of her garden marigolds, and the joy of welcoming everyone who stepped through her wooden courtyard gate. "
            "Her hands carried the wisdom of generations—kneading pan de muerto at dawn, sewing prom dresses on her iron Singer, "
            "and slipping lemon drops into small eager hands. Some stories deserve to stay, and hers remains woven into everything we create."
        ),
        theme_settings={
            "palette": "warm-marigold",
            "paper_style": "warm-paper",
            "layout": "traditional-ofrenda",
            "style_variant": "diadelosmuertos",
            "show_papel_picado": True,
            "show_candles": True,
            "show_marigolds": True,
        }
    )
    db.add(memorial)
    await db.commit()
    await db.refresh(memorial)

    # 2. Create Story
    story = Story(
        memorial_id=memorial.id,
        title="Sunday Afternoons in the Courtyard",
        description="Fictional family memory recounting Abuela's patio garden, the brass gate bell, and her secret mole recipe.",
        audio_path=f"/media/audio/{demo_audio_filename}",
        audio_duration=45.0,
        teller_name="Carlos (Grandson)",
        recording_date="October 24, 2019",
        transcript=(
            "Every Sunday after morning mass, Abuela Elena's courtyard gate would swing open with that familiar brass creak. "
            "The kitchen would already be warm with the scent of toasted mulato chiles, cinnamon, and the radio softly playing Agustín Lara. "
            "She never measured with spoons—she measured with the cupped palm of her hand, saying 'the food knows when your heart is in it'. "
            "She taught all four of us grandchildren that no one ever leaves her table without a second plate and a pocket full of lemons. "
            "Her laughter filled the whole stone patio, louder than the bells of San Francisco church."
        ),
        transcript_segments=[
            {"start": 0.0, "end": 8.5, "text": "Every Sunday after morning mass, Abuela Elena's courtyard gate would swing open with that familiar brass creak."},
            {"start": 8.6, "end": 19.2, "text": "The kitchen would already be warm with the scent of toasted mulato chiles, cinnamon, and the radio softly playing Agustín Lara."},
            {"start": 19.3, "end": 31.0, "text": "She never measured with spoons—she measured with the cupped palm of her hand, saying 'the food knows when your heart is in it'."},
            {"start": 31.1, "end": 45.0, "text": "She taught all four of us that no one leaves her table without a second plate and a pocket full of lemons. Her laughter filled the patio."}
        ],
        ai_summary="Carlos reminisces about the sensory richness of Sunday mornings at Abuela Elena's home, celebrating her intuitive cooking, hospitality, and boundless laughter.",
        transcription_status="completed"
    )
    db.add(story)
    await db.commit()
    await db.refresh(story)

    # 3. Create Altar Items with artful asymmetric positions
    items_data = [
        {
            "item_type": "photograph",
            "title": "Abuela in her Rose & Marigold Garden (1964)",
            "description": "Standing next to the blooming cempasúchil beds she planted each autumn along the stone walkway.",
            "asset_path": "/artwork/demo-garden-photo.svg",
            "tier": "top",
            "position_x": 22.0,
            "position_y": 14.0,
            "rotation": -2.5,
            "sort_order": 1,
            "tags": ["photograph", "garden", "cempasuchil", "youth"]
        },
        {
            "item_type": "candle",
            "title": "Veladora de Esperanza (Vigil Candle)",
            "description": "Her daily glass candle lit on the kitchen windowsill at sunset, keeping watch over all travelers.",
            "asset_path": None,
            "tier": "top",
            "position_x": 78.0,
            "position_y": 12.0,
            "rotation": 0.0,
            "sort_order": 2,
            "tags": ["candle", "tradition", "light"]
        },
        {
            "item_type": "food",
            "title": "Abuela's Three-Day Mole Poblano",
            "description": "Rich dark mole made with toasted mulato, pasilla, and ancho chiles, Mexican chocolate, and toasted sesame. Recipe passed down from her mother.",
            "asset_path": "/artwork/item-mole-bowl.svg",
            "tier": "middle",
            "position_x": 18.0,
            "position_y": 48.0,
            "rotation": 3.0,
            "sort_order": 3,
            "story_id": story.id,
            "tags": ["food", "recipe", "tradition", "mole"]
        },
        {
            "item_type": "food",
            "title": "Pan de Muerto with Orange Blossom",
            "description": "Soft sweet bread dusted with fine sugar, flavored with orange peel and agua de azahar. She baked 40 loaves every October for the neighbors.",
            "asset_path": "/artwork/item-pan-muerto.svg",
            "tier": "middle",
            "position_x": 82.0,
            "position_y": 46.0,
            "rotation": -1.8,
            "sort_order": 4,
            "tags": ["food", "pan-de-muerto", "baking", "tradition"]
        },
        {
            "item_type": "song",
            "title": "Amor Eterno — Juan Gabriel",
            "description": "Her favorite song in the world. Whenever it played on the radio, she would stop stirring the pot and sing with her eyes closed.",
            "external_link": "https://www.youtube.com/watch?v=TyM8jRnhy-c",
            "tier": "middle",
            "position_x": 48.0,
            "position_y": 52.0,
            "rotation": 1.5,
            "sort_order": 5,
            "tags": ["song", "music", "juan-gabriel", "radio"]
        },
        {
            "item_type": "object",
            "title": "1954 Singer Cast-Iron Sewing Machine",
            "description": "Heavy black Singer machine with gold filigree. She sewed baptismal gowns, school uniforms, and quilted blankets for every newborn.",
            "asset_path": "/artwork/item-sewing-machine.svg",
            "tier": "base",
            "position_x": 20.0,
            "position_y": 80.0,
            "rotation": -3.0,
            "sort_order": 6,
            "story_id": story.id,
            "tags": ["object", "keepsake", "sewing", "craft"]
        },
        {
            "item_type": "flower",
            "title": "Fresh Cempasúchil (Marigolds)",
            "description": "The golden flower of remembrance whose petal scent guides loved ones home on Día de los Muertos.",
            "asset_path": None,
            "tier": "base",
            "position_x": 50.0,
            "position_y": 84.0,
            "rotation": 0.0,
            "sort_order": 7,
            "tags": ["flower", "marigold", "cempasuchil", "altar"]
        },
        {
            "item_type": "written_memory",
            "title": "Two Lemon Drops in the Apron Pocket",
            "description": "No matter the hour, whenever any child hugged her waist, her floral apron pocket held exactly two lemon hard candies.",
            "asset_path": None,
            "tier": "base",
            "position_x": 80.0,
            "position_y": 78.0,
            "rotation": 2.2,
            "sort_order": 8,
            "tags": ["memory", "candy", "apron", "grandkids"]
        }
    ]

    for item_data in items_data:
        item = MemoryItem(
            memorial_id=memorial.id,
            item_type=item_data["item_type"],
            title=item_data["title"],
            description=item_data["description"],
            asset_path=item_data.get("asset_path"),
            external_link=item_data.get("external_link"),
            tier=item_data["tier"],
            position_x=item_data["position_x"],
            position_y=item_data["position_y"],
            rotation=item_data["rotation"],
            sort_order=item_data["sort_order"],
            story_id=item_data.get("story_id"),
            tags=item_data["tags"]
        )
        db.add(item)

    await db.commit()
    await db.refresh(memorial)
    return memorial
