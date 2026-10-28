import asyncio
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class TranscriptionService:
    def __init__(self):
        self.model_size = settings.WHISPER_MODEL_SIZE
        self._faster_whisper_available = False
        self._model_instance = None
        self._check_dependencies()

    def _check_dependencies(self):
        try:
            import faster_whisper # type: ignore
            self._faster_whisper_available = True
        except ImportError:
            self._faster_whisper_available = False
        except Exception as e:
            logger.warning(f"faster-whisper dependency check issue: {e}")
            self._faster_whisper_available = False

    def get_status(self) -> Dict[str, Any]:
        """Check if local speech recognition engine is ready."""
        if self._faster_whisper_available:
            return {
                "available": True,
                "engine": "faster-whisper",
                "model_size": self.model_size,
                "status_detail": f"faster-whisper is installed with model '{self.model_size}' ready for local inference.",
                "offline_ready": True
            }
        else:
            return {
                "available": False,
                "engine": "faster-whisper",
                "model_size": self.model_size,
                "status_detail": (
                    "Local transcription engine (faster-whisper) is not installed in this Python environment "
                    "(typically requires ffmpeg and Python 3.10-3.12 compatible wheels). "
                    "All audio recordings and uploads are securely preserved locally, and you can edit transcripts manually or enable whisper."
                ),
                "offline_ready": False
            }

    async def transcribe_audio(self, audio_file_path: str) -> Dict[str, Any]:
        """
        Transcribe an audio file locally.
        Returns:
            {
                "transcript": "...",
                "segments": [{"start": 0.0, "end": 2.5, "text": "..."}],
                "language": "en"
            }
        """
        path = Path(audio_file_path)
        if not path.exists():
            raise FileNotFoundError(f"Audio file not found at: {audio_file_path}")

        status = self.get_status()
        if not status["available"]:
            raise RuntimeError(
                f"Speech-to-text dependency missing: {status['status_detail']}"
            )

        # Run transcription in a separate thread to keep async loop non-blocking
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self._transcribe_sync, str(path))

    def _transcribe_sync(self, file_path: str) -> Dict[str, Any]:
        from faster_whisper import WhisperModel # type: ignore
        if self._model_instance is None:
            # Device cpu, compute_type int8 for broad local laptop compatibility
            self._model_instance = WhisperModel(self.model_size, device="cpu", compute_type="int8")

        segments_generator, info = self._model_instance.transcribe(file_path, beam_size=5)
        
        segments: List[Dict[str, Any]] = []
        full_transcript_parts: List[str] = []

        for seg in segments_generator:
            text = seg.text.strip()
            if text:
                segments.append({
                    "start": round(seg.start, 2),
                    "end": round(seg.end, 2),
                    "text": text
                })
                full_transcript_parts.append(text)

        full_transcript = " ".join(full_transcript_parts)
        return {
            "transcript": full_transcript,
            "segments": segments,
            "language": info.language if hasattr(info, "language") else "auto",
            "duration": getattr(info, "duration", None)
        }

transcription_service = TranscriptionService()

