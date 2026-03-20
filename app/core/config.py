from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
import os

class Settings(BaseSettings):
    """Platform settings and secrets"""
    
    # ElevenLabs
    ELEVENLABS_API_KEY: str
    
    # Security
    ADMIN_PASSWORD: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Storage
    STORAGE_PATH: str = "./storage"
    STATIONS: List[str] = ["Radio_Garda"]
    
    # Environment
    DEBUG: bool = False
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()

# Ensure storage directories exist
def ensure_storage():
    """Create initial storage directories if they don't exist"""
    os.makedirs(settings.STORAGE_PATH, exist_ok=True)
    os.makedirs(os.path.join(settings.STORAGE_PATH, "stations"), exist_ok=True)
    os.makedirs(os.path.join(settings.STORAGE_PATH, "public"), exist_ok=True)
    
    for station in settings.STATIONS:
        os.makedirs(os.path.join(settings.STORAGE_PATH, "stations", station), exist_ok=True)
        os.makedirs(os.path.join(settings.STORAGE_PATH, "public", station), exist_ok=True)

ensure_storage()
