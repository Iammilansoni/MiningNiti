"""
Application Configuration
Centralized settings management using Pydantic Settings
"""

import os
from functools import lru_cache
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


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

    # AI/ML - Multi-Provider Setup
    GEMINI_API_KEY: str = Field(..., description="Google Gemini API Key")
    GROQ_API_KEY: str = Field(
        ..., description="Groq API Key for Classifier & Entity Extractors"
    )
    MISTRAL_API_KEY: str = Field(..., description="Mistral API Key for Safety Analyzer")
    CEREBRAS_API_KEY: str = Field(default="", description="Cerebras API Key")

    GEMINI_MODEL: str = Field(default="gemini-1.5-flash")
    EMBEDDING_MODEL: str = Field(default="models/gemini-embedding-001")

    AGENT_PROVIDER_MAP: dict = {
        "embeddings": {"provider": "gemini", "model": "text-embedding-004"},
        "chat_service": {"provider": "gemini", "model": "gemini-1.5-flash"},
        "summarizer_agent": {"provider": "gemini", "model": "gemini-1.5-flash"},
        "classifier_agent": {"provider": "groq", "model": "llama-3.3-70b-versatile"},
        "entity_extractor": {"provider": "cerebras", "model": "llama-4-scout"},
        "safety_analyzer": {"provider": "mistral", "model": "magistral-small-latest"},
        "fallback": {"provider": "openrouter", "model": "deepseek/deepseek-r1:free"},
    }

    # Authentication - Clerk
    CLERK_JWKS_URL: str = Field(..., description="Clerk JWKS URL for JWT verification")

    # Document Processing
    MAX_FILE_SIZE_MB: int = Field(default=50)
    ALLOWED_FILE_TYPES: List[str] = Field(
        default=[
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ]
    )
    CHUNK_SIZE: int = Field(default=1000)
    CHUNK_OVERLAP: int = Field(default=200)

    # Mining AI Settings
    SAFETY_SCORE_THRESHOLD: float = Field(default=70.0)
    MAX_EMBEDDINGS_PER_QUERY: int = Field(default=5)

    # RAG Pipeline — Production Retrieval
    RERANK_MODEL: str = Field(
        default="cross-encoder/ms-marco-MiniLM-L-6-v2",
        description="Cross-encoder model for reranking retrieved chunks",
    )
    RERANK_OVER_FETCH: int = Field(
        default=20,
        description="How many chunks to fetch from vector+BM25 before reranking",
    )
    RERANK_TOP_K: int = Field(
        default=5,
        description="Final number of chunks after reranking",
    )
    SIMILARITY_THRESHOLD: float = Field(
        default=0.25,
        description="Minimum cosine similarity to include a chunk (0-1)",
    )
    ENABLE_HYBRID_SEARCH: bool = Field(
        default=True,
        description="Combine vector search with pg_trgm BM25 via RRF",
    )
    ENABLE_RERANKING: bool = Field(
        default=True,
        description="Apply cross-encoder reranking after retrieval",
    )
    RRF_K: int = Field(
        default=60,
        description="Reciprocal Rank Fusion constant (higher = less rank influence)",
    )

    # SSL
    SSL_CERT_PATH: Optional[str] = Field(default=None)

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
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
