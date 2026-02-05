from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    
    # CORS settings
    cors_origins: str = "*"
    
    # API settings
    api_prefix: str = "/api/v1"
    
    # Speed test settings
    max_download_size: int = 50 * 1024 * 1024  # 50MB
    max_upload_size: int = 50 * 1024 * 1024  # 50MB
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
