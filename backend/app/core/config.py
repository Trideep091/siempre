from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from typing import List
import os

# Detect Vercel or serverless cloud environments
IS_VERCEL = bool(
    os.environ.get("VERCEL") 
    or os.environ.get("VERCEL_ENV") 
    or os.environ.get("AWS_LAMBDA_FUNCTION_NAME")
)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Siempre"
    VERSION: str = "1.0.0"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DATABASE_URL: str = "sqlite+aiosqlite:////tmp/siempre.db" if IS_VERCEL else "sqlite+aiosqlite:///./data/siempre.db"
    MEDIA_STORAGE_PATH: str = "/tmp/data/media" if IS_VERCEL else "./data/media"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:3b"
    WHISPER_MODEL_SIZE: str = "base"
    CORS_ORIGINS: str = "*" if IS_VERCEL else "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:8000"
    ENVIRONMENT: str = "production" if IS_VERCEL else "development"

    def model_post_init(self, __context):
        # Normalize sqlite URL if relative or missing prefix
        if self.DATABASE_URL.startswith("/tmp") and not self.DATABASE_URL.startswith("sqlite"):
            self.DATABASE_URL = f"sqlite+aiosqlite:///{self.DATABASE_URL}"

    @property
    def cors_origins_list(self) -> List[str]:
        if self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def media_dir(self) -> Path:
        p = Path(self.MEDIA_STORAGE_PATH)
        try:
            p.mkdir(parents=True, exist_ok=True)
            (p / "portraits").mkdir(exist_ok=True)
            (p / "items").mkdir(exist_ok=True)
            (p / "audio").mkdir(exist_ok=True)
            return p
        except OSError:
            # Fallback to /tmp if current directory is read-only (standard in Vercel serverless)
            fallback = Path("/tmp/data/media")
            fallback.mkdir(parents=True, exist_ok=True)
            (fallback / "portraits").mkdir(exist_ok=True)
            (fallback / "items").mkdir(exist_ok=True)
            (fallback / "audio").mkdir(exist_ok=True)
            return fallback

settings = Settings()

