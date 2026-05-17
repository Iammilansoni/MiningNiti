"""
Application Configuration
Centralized settings management using Pydantic Settings
"""

import os
from typing import List, Optional
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "MiningNiti"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = Field(default=False)
    ENVIRONMENT: str = Field(default="development")
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "https://*.vercel.app"]
    )
    
    # Database
    DATABASE_URL: str = Field(..., description="PostgreSQL connection string")
    DB_POOL_SIZE: int = Field(default=5)
    DB_MAX_OVERFLOW: int = Field(default=10)
    
    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    
    # AI/ML - Gemini
    GEMINI_API_KEY: str = Field(..., description="Google Gemini API Key")
    GEMINI_MODEL: str = Field(default="gemini-2.0-flash")
    EMBEDDING_MODEL: str = Field(default="models/text-embedding-004")
    
    # Authentication - Clerk
    CLERK_JWKS_URL: str = Field(..., description="Clerk JWKS URL for JWT verification")
    
    # Document Processing
    MAX_FILE_SIZE_MB: int = Field(default=50)
    ALLOWED_FILE_TYPES: List[str] = Field(
        default=["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]
    )
    CHUNK_SIZE: int = Field(default=1000)
    CHUNK_OVERLAP: int = Field(default=200)
    
    # Mining AI Settings
    SAFETY_SCORE_THRESHOLD: float = Field(default=70.0)
    MAX_EMBEDDINGS_PER_QUERY: int = Field(default=5)
    
    # SSL
    SSL_CERT_PATH: Optional[str] = Field(default=None)
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache for performance - settings are loaded once.
    """
    return Settings()


# Convenience export
settings = get_settings()
