import httpx
import json
import logging
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.prompts.remembrance_prompts import (
    SYSTEM_PROMPT_REMEMBRANCE,
    SYSTEM_PROMPT_SUMMARY,
    FORMAT_INSTRUCTIONS,
    TONE_INSTRUCTIONS,
)

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.default_model = settings.OLLAMA_MODEL

    async def check_health(self) -> Dict[str, Any]:
        """Check if Ollama server is reachable and inspect loaded models."""
        url = f"{self.base_url}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    is_configured_installed = any(
                        m == self.default_model or m.startswith(self.default_model + ":") or self.default_model.startswith(m)
                        for m in models
                    )
                    return {
                        "available": True,
                        "url": self.base_url,
                        "configured_model": self.default_model,
                        "model_installed": is_configured_installed,
                        "available_models": models,
                        "message": (
                            f"Ollama is running with model '{self.default_model}' ready."
                            if is_configured_installed
                            else f"Ollama is running, but model '{self.default_model}' is not installed yet. Run: ollama pull {self.default_model}"
                        )
                    }
                else:
                    return {
                        "available": False,
                        "url": self.base_url,
                        "configured_model": self.default_model,
                        "model_installed": False,
                        "available_models": [],
                        "message": f"Ollama server returned HTTP {res.status_code}"
                    }
        except httpx.ConnectError:
            return {
                "available": False,
                "url": self.base_url,
                "configured_model": self.default_model,
                "model_installed": False,
                "available_models": [],
                "message": f"Ollama is not running at {self.base_url}. Start Ollama locally with: ollama serve"
            }
        except Exception as e:
            return {
                "available": False,
                "url": self.base_url,
                "configured_model": self.default_model,
                "model_installed": False,
                "available_models": [],
                "message": f"Error connecting to Ollama: {str(e)}"
            }

    async def generate_remembrance(
        self,
        person_name: str,
        relationship: Optional[str],
        birth_date: Optional[str],
        remembrance_date: Optional[str],
        pronouns: Optional[str],
        source_memories: List[Dict[str, Any]],
        source_items: List[Dict[str, Any]],
        source_stories: List[Dict[str, Any]],
        tone: str = "warm",
        format_type: str = "short_remembrance",
        use_words_closely: bool = False,
        additional_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a grounded remembrance using the local Ollama LLM."""
        health = await self.check_health()
        if not health["available"]:
            raise RuntimeError(
                f"Local Ollama inference engine is offline. {health['message']}"
            )
        if not health["model_installed"]:
            raise RuntimeError(
                f"Configured model '{self.default_model}' is not pulled in local Ollama. "
                f"Please open your terminal and run: ollama pull {self.default_model}"
            )

        format_prompt = FORMAT_INSTRUCTIONS.get(format_type, FORMAT_INSTRUCTIONS["short_remembrance"])
        tone_prompt = TONE_INSTRUCTIONS.get(tone, TONE_INSTRUCTIONS["warm"])

        # Build user prompt with explicit source material
        prompt_parts = [
            f"SUBJECT OF REMEMBRANCE: {person_name}",
        ]
        if relationship:
            prompt_parts.append(f"Relationship: {relationship}")
        if birth_date or remembrance_date:
            prompt_parts.append(f"Dates: {birth_date or 'Unknown'} – {remembrance_date or 'Present'}")
        if pronouns:
            prompt_parts.append(f"Pronouns: {pronouns}")

        prompt_parts.append("\nAUTHENTIC SOURCE FACTS & MEMORIES (STRICT GROUNDING):")
        
        if source_memories:
            prompt_parts.append("-- Recorded Memories & Notes:")
            for m in source_memories:
                prompt_parts.append(f"• {m.get('title')}: {m.get('description', '')}")

        if source_items:
            prompt_parts.append("-- Altar Objects, Foods, Songs & Keepsakes:")
            for it in source_items:
                prompt_parts.append(f"• [{it.get('item_type', 'item')}] {it.get('title')}: {it.get('description', '')}")

        if source_stories:
            prompt_parts.append("-- Recorded Stories & Transcripts:")
            for st in source_stories:
                t_excerpt = (st.get('transcript') or st.get('description') or "")[:400]
                prompt_parts.append(f"• Story '{st.get('title')}': {t_excerpt}")

        if additional_context:
            prompt_parts.append(f"\nAdditional family guidance: {additional_context}")

        prompt_parts.append(f"\nFORMAT REQUIREMENT: {format_prompt}")
        prompt_parts.append(f"TONE REQUIREMENT: {tone_prompt}")
        
        if use_words_closely:
            prompt_parts.append("IMPORTANT: Use the user's exact phrases and specific wording wherever possible. Minimize embellishments.")

        prompt_parts.append("\nBegin the tribute now:")

        full_prompt = "\n".join(prompt_parts)

        payload = {
            "model": self.default_model,
            "prompt": full_prompt,
            "system": SYSTEM_PROMPT_REMEMBRANCE,
            "stream": False,
            "options": {
                "temperature": 0.4 if use_words_closely else 0.65,
                "top_p": 0.9,
            }
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(f"{self.base_url}/api/generate", json=payload)
                if res.status_code != 200:
                    raise RuntimeError(f"Ollama generation failed with status {res.status_code}: {res.text}")
                data = res.json()
                draft = data.get("response", "").strip()
                return {
                    "draft": draft,
                    "model_used": self.default_model,
                    "grounding_notes": f"Generated from {len(source_memories)} memories, {len(source_items)} altar items, and {len(source_stories)} audio stories."
                }
        except httpx.TimeoutException:
            raise RuntimeError(f"Ollama inference timed out after 60s. Model '{self.default_model}' may need more local compute or memory.")
        except Exception as e:
            if isinstance(e, RuntimeError):
                raise
            raise RuntimeError(f"Failed to communicate with Ollama: {str(e)}")

    async def summarize_transcript(self, transcript: str) -> Dict[str, Any]:
        """Summarize an audio transcript and extract key themes using Ollama."""
        health = await self.check_health()
        if not health["available"] or not health["model_installed"]:
            raise RuntimeError("Local Ollama service or model is unavailable.")

        user_content = f"TRANSCRIPT:\n{transcript[:3000]}\n\nProvide the JSON summary:"
        payload = {
            "model": self.default_model,
            "prompt": user_content,
            "system": SYSTEM_PROMPT_SUMMARY,
            "stream": False,
            "format": "json",
            "options": {"temperature": 0.3}
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(f"{self.base_url}/api/generate", json=payload)
                if res.status_code == 200:
                    raw = res.json().get("response", "{}")
                    try:
                        parsed = json.loads(raw)
                        return {
                            "summary": parsed.get("summary", ""),
                            "key_themes": parsed.get("key_themes", []),
                            "model_used": self.default_model
                        }
                    except Exception:
                        return {
                            "summary": raw.strip(),
                            "key_themes": [],
                            "model_used": self.default_model
                        }
                else:
                    raise RuntimeError(f"Ollama returned {res.status_code}")
        except Exception as e:
            raise RuntimeError(f"Ollama summary error: {str(e)}")

ollama_service = OllamaService()

