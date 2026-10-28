from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from typing import List
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Siempre"
    VERSION: str = "1.0.0"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/siempre.db"
    MEDIA_STORAGE_PATH: str = "./data/media"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:3b"
    WHISPER_MODEL_SIZE: str = "base"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    ENVIRONMENT: str = "development"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def media_dir(self) -> Path:
        p = Path(self.MEDIA_STORAGE_PATH)
        p.mkdir(parents=True, exist_ok=True)
        (p / "portraits").mkdir(exist_ok=True)
        (p / "items").mkdir(exist_ok=True)
        (p / "audio").mkdir(exist_ok=True)
        return p

settings = Settings()
