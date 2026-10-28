import re
import math
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.memorial import Memorial
from app.models.memory_item import MemoryItem
from app.models.story import Story
from app.schemas.search import SearchResultItem, SearchResponse
from app.core.config import settings
import httpx

class SearchService:
    def __init__(self):
        self.ollama_base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.default_model = settings.OLLAMA_MODEL

    def _tokenize(self, text: str) -> List[str]:
        if not text:
            return []
        return [w.lower() for w in re.findall(r'\b\w+\b', text)]

    def _extract_snippet(self, text: str, query_tokens: List[str], max_len: int = 160) -> str:
        if not text:
            return ""
        lower = text.lower()
        # Find earliest match of any query token
        match_idx = -1
        for t in query_tokens:
            idx = lower.find(t)
            if idx != -1 and (match_idx == -1 or idx < match_idx):
                match_idx = idx

        if match_idx == -1:
            return text[:max_len] + ("..." if len(text) > max_len else "")

        start = max(0, match_idx - 40)
        end = min(len(text), match_idx + max_len - 40)
        prefix = "..." if start > 0 else ""
        suffix = "..." if end < len(text) else ""
        return prefix + text[start:end].strip() + suffix

    def _calculate_score(self, text: str, query_tokens: List[str]) -> float:
        if not text or not query_tokens:
            return 0.0
        lower = text.lower()
        score = 0.0
        for token in query_tokens:
            occurrences = lower.count(token)
            if occurrences > 0:
                score += 1.0 + math.log(1.0 + occurrences)
        return score

    async def get_embedding_if_available(self, text: str) -> Optional[List[float]]:
        """Try fetching local embedding via Ollama /api/embeddings or /api/embed."""
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.post(
                    f"{self.ollama_base_url}/api/embeddings",
                    json={"model": self.default_model, "prompt": text[:500]}
                )
                if res.status_code == 200:
                    data = res.json()
                    return data.get("embedding")
        except Exception:
            return None
        return None

    async def search(
        self,
        db: AsyncSession,
        query: str,
        memorial_id: Optional[str] = None,
        item_type: Optional[str] = None,
        tag: Optional[str] = None
    ) -> SearchResponse:
        trimmed_query = query.strip()
        if not trimmed_query:
            return SearchResponse(query="", total_results=0, results=[], search_mode="keyword")

        query_tokens = self._tokenize(trimmed_query)
        results: List[SearchResultItem] = []

        # 1. Search Memorials
        mem_stmt = select(Memorial)
        if memorial_id:
            mem_stmt = mem_stmt.where(Memorial.id == memorial_id)
        mem_res = await db.execute(mem_stmt)
        memorials = {m.id: m for m in mem_res.scalars().all()}

        for m in memorials.values():
            searchable_text = f"{m.name} {m.relationship_type or ''} {m.short_description or ''} {m.remembrance_text or ''}"
            score = self._calculate_score(searchable_text, query_tokens)
            if score > 0:
                snippet = self._extract_snippet(
                    m.short_description or m.remembrance_text or f"Memorial for {m.name}",
                    query_tokens
                )
                results.append(SearchResultItem(
                    result_type="memorial",
                    id=m.id,
                    memorial_id=m.id,
                    memorial_name=m.name,
                    title=f"Memorial: {m.name}",
                    snippet=snippet,
                    score=round(score * 1.5, 2),
                    extra={"relationship": m.relationship_type}
                ))

        # 2. Search Memory Items
        item_stmt = select(MemoryItem)
        if memorial_id:
            item_stmt = item_stmt.where(MemoryItem.memorial_id == memorial_id)
        if item_type:
            item_stmt = item_stmt.where(MemoryItem.item_type == item_type)
        item_res = await db.execute(item_stmt)
        items = item_res.scalars().all()

        for it in items:
            tags_str = " ".join(it.tags or [])
            if tag and tag.lower() not in [t.lower() for t in (it.tags or [])]:
                continue
            
            searchable_text = f"{it.title} {it.description or ''} {it.item_type} {tags_str} {it.date_period or ''}"
            score = self._calculate_score(searchable_text, query_tokens)
            if score > 0:
                mem_name = memorials.get(it.memorial_id).name if it.memorial_id in memorials else "Memorial"
                snippet_source = ""
                for candidate in [it.description, it.title, " ".join(it.tags or [])]:
                    if candidate and any(t in candidate.lower() for t in query_tokens):
                        snippet_source = candidate
                        break
                if not snippet_source:
                    snippet_source = it.description or it.title

                snippet = self._extract_snippet(snippet_source, query_tokens)
                results.append(SearchResultItem(
                    result_type="item",
                    id=it.id,
                    memorial_id=it.memorial_id,
                    memorial_name=mem_name,
                    title=it.title,
                    snippet=snippet,
                    item_type=it.item_type,
                    date_period=it.date_period,
                    tags=it.tags or [],
                    score=round(score, 2),
                    extra={
                        "asset_path": it.asset_path,
                        "tier": it.tier,
                        "story_id": it.story_id
                    }
                ))

        # 3. Search Stories & Timestamped Transcripts
        story_stmt = select(Story)
        if memorial_id:
            story_stmt = story_stmt.where(Story.memorial_id == memorial_id)
        story_res = await db.execute(story_stmt)
        stories = story_res.scalars().all()

        for st in stories:
            # Check segments first for pinpoint timestamp navigation
            matched_time: Optional[float] = None
            matched_label: Optional[str] = None
            
            if st.transcript_segments:
                for seg in st.transcript_segments:
                    seg_text = seg.get("text", "")
                    if any(t in seg_text.lower() for t in query_tokens):
                        matched_time = float(seg.get("start", 0.0))
                        minutes = int(matched_time // 60)
                        seconds = int(matched_time % 60)
                        matched_label = f"{minutes:02d}:{seconds:02d}"
                        break

            searchable_text = f"{st.title} {st.description or ''} {st.transcript or ''} {st.teller_name or ''}"
            score = self._calculate_score(searchable_text, query_tokens)
            if score > 0:
                mem_name = memorials.get(st.memorial_id).name if st.memorial_id in memorials else "Memorial"
                # Select the best field containing the match for snippet
                snippet_source = ""
                for candidate in [st.transcript, st.description, st.title]:
                    if candidate and any(t in candidate.lower() for t in query_tokens):
                        snippet_source = candidate
                        break
                if not snippet_source:
                    snippet_source = st.transcript or st.description or st.title

                snippet = self._extract_snippet(snippet_source, query_tokens)
                results.append(SearchResultItem(
                    result_type="story",
                    id=st.id,
                    memorial_id=st.memorial_id,
                    memorial_name=mem_name,
                    title=st.title,
                    snippet=snippet,
                    score=round(score * 1.2, 2),
                    matched_timestamp=matched_time,
                    matched_timestamp_label=matched_label,
                    extra={
                        "audio_path": st.audio_path,
                        "teller_name": st.teller_name,
                        "recording_date": st.recording_date,
                        "has_transcript": bool(st.transcript)
                    }
                ))

        # Sort by relevance score descending
        results.sort(key=lambda r: r.score, reverse=True)

        return SearchResponse(
            query=query,
            total_results=len(results),
            results=results,
            search_mode="keyword"
        )

search_service = SearchService()
