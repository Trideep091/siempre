import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ("healthy", "degraded")
        assert data["app"] == "Siempre"
        assert data["database_connected"] is True

@pytest.mark.asyncio
async def test_ai_status_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/ai/status")
        assert response.status_code == 200
        data = response.json()
        assert "ollama_available" in data
        assert "whisper_available" in data
        assert "configured_model" in data

@pytest.mark.asyncio
async def test_memorial_lifecycle_and_items():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Create Memorial
        create_payload = {
            "name": "Guillermo Navarro",
            "relationship_type": "Uncle",
            "birth_date": "1945",
            "remembrance_date": "2018",
            "short_description": "Master carpenter and storyteller",
            "theme_settings": {
                "palette": "warm-marigold",
                "paper_style": "aged-parchment",
                "layout": "traditional-ofrenda",
                "style_variant": "diadelosmuertos",
                "show_papel_picado": True,
                "show_candles": True,
                "show_marigolds": True
            }
        }
        res = await ac.post("/api/memorials", json=create_payload)
        assert res.status_code == 201
        memorial = res.json()
        mem_id = memorial["id"]
        assert memorial["name"] == "Guillermo Navarro"

        # 2. Add an Item (Food)
        item_payload = {
            "item_type": "food",
            "title": "Tamales de Dulce",
            "description": "Sweet pink tamales made with raisins and cinnamon every Christmas Eve.",
            "tier": "middle",
            "sort_order": 1,
            "tags": ["food", "tradition", "christmas"]
        }
        item_res = await ac.post(f"/api/memorials/{mem_id}/items", json=item_payload)
        assert item_res.status_code == 201
        item = item_res.json()
        assert item["title"] == "Tamales de Dulce"
        item_id = item["id"]

        # 3. Add a Story
        story_payload = {
            "title": "Building the Cedar Chest",
            "description": "Tío Guillermo carving cedar dovetails in the garage workshop.",
            "transcript": "He always told us: measure twice, carve with patience, and let the wood speak.",
            "teller_name": "Mateo (Nephew)",
            "linked_item_id": item_id
        }
        story_res = await ac.post(f"/api/memorials/{mem_id}/stories", json=story_payload)
        assert story_res.status_code == 201
        story = story_res.json()
        assert story["title"] == "Building the Cedar Chest"

        # 4. Search across archive
        search_res = await ac.get(f"/api/search?q=cedar&memorial_id={mem_id}")
        assert search_res.status_code == 200
        search_data = search_res.json()
        assert search_data["total_results"] >= 1
        assert any("cedar" in r["snippet"].lower() for r in search_data["results"])

        # 5. Export memorial JSON
        export_res = await ac.get(f"/api/memorials/{mem_id}/export")
        assert export_res.status_code == 200
        export_data = export_res.json()
        assert export_data["memorial"]["name"] == "Guillermo Navarro"
        assert len(export_data["memorial"]["items"]) >= 1

        # 6. Delete memorial
        del_res = await ac.delete(f"/api/memorials/{mem_id}")
        assert del_res.status_code == 204

        # 7. Verify deletion
        get_res = await ac.get(f"/api/memorials/{mem_id}")
        assert get_res.status_code == 404

@pytest.mark.asyncio
async def test_demo_seed_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/demo/seed")
        assert res.status_code == 200
        data = res.json()
        assert "Elena Rosales" in data["name"]
        assert len(data["items"]) >= 5
        assert len(data["stories"]) >= 1

