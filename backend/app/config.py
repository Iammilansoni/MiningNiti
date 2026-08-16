"""
Application Configuration
Centralized settings management using Pydantic Settings
"""

import os
from functools import lru_cache
from typing import List, Optional
from urllib.parse import urlparse

from pydantic import Field, field_validator
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
        default=["http://localhost:3000", "http://localhost:3001"],
        description="Exact allowed origins. Wildcards do NOT work here — "
        "Starlette compares these as literal strings. Use CORS_ORIGIN_REGEX "
        "for patterns.",
    )
    CORS_ORIGIN_REGEX: str = Field(
        default="",
        description="Regex for dynamic origins, e.g. Vercel preview deploys: "
        r"'^https://miningniti-[a-z0-9-]+\.vercel\.app$'. Scope it to your own "
        "project — a bare '.*\\.vercel\\.app' would let any site hosted on "
        "Vercel call this API with credentials.",
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

    @field_validator(
        "GEMINI_API_KEY", "GROQ_API_KEY", "MISTRAL_API_KEY", "CEREBRAS_API_KEY"
    )
    @classmethod
    def _api_key_must_not_contain_whitespace(cls, v: str) -> str:
        """
        Strip surrounding whitespace from an API key, and reject one that still
        contains whitespace inside.

        A trailing newline on a secret is invisible everywhere it matters — in
        the provider dashboard, in the HuggingFace Space secrets UI, in `echo
        $GROQ_API_KEY` — but it makes the Authorization header illegal. httpx
        refuses to put a newline on the wire and raises LocalProtocolError,
        which the OpenAI SDK then wraps as the maximally unhelpful:

            openai.APIConnectionError: Connection error.

        That happened in production. Retrieval succeeded and citations rendered,
        so the chat UI showed sources and then died with what looked like a
        network fault; the real cause was one byte at the end of a secret. Keys
        never legitimately contain whitespace, so strip what we can and refuse
        to boot on what we cannot.
        """
        v = v.strip()
        if any(ch.isspace() for ch in v):
            raise ValueError(
                "API key must not contain whitespace. This usually means a "
                "newline or space was included when the secret was pasted."
            )
        return v

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
    CLERK_ISSUER: str = Field(
        default="",
        description="Expected 'iss' claim. Defaults to the origin of "
        "CLERK_JWKS_URL, which is correct for standard Clerk setups.",
    )
    CLERK_AUTHORIZED_PARTIES: List[str] = Field(
        default=[],
        description="Allowed 'azp' claim values (your frontend origins). Clerk "
        "sets azp to the origin that requested the token; validating it stops a "
        "token minted for another site on the same Clerk instance from being "
        "replayed here. Empty disables the check (logged as a warning).",
    )

    @field_validator("CLERK_JWKS_URL")
    @classmethod
    def _jwks_url_must_be_absolute(cls, v: str) -> str:
        """
        Reject a JWKS URL that is not absolute, at startup.

        Without this, a value missing its scheme —
        "your-app.clerk.accounts.dev/.well-known/jwks.json" instead of
        "https://your-app.clerk.accounts.dev/.well-known/jwks.json" — lets the
        application boot normally and report healthy, while *every* authenticated
        request fails with a generic 401 and this in the logs:

            Failed to fetch JWKS: Request URL is missing an 'http://' or
            'https://' protocol.

        That happened in production. A service that cannot authenticate anyone
        is not healthy, so it should refuse to start rather than accept traffic
        it can only reject.
        """
        v = v.strip()
        if not v:
            raise ValueError("CLERK_JWKS_URL must not be empty")

        parsed = urlparse(v)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            raise ValueError(
                f"CLERK_JWKS_URL must be an absolute http(s) URL, got {v!r}. "
                f"Expected something like "
                f"'https://your-app.clerk.accounts.dev/.well-known/jwks.json'"
            )
        return v

    # Document Processing
    UPLOAD_DIR: str = Field(
        default=os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads"),
        description="Root directory for locally stored uploads. All storage:// "
        "URLs resolve inside this directory and may not escape it.",
    )
    # ── Durable object storage ────────────────────────────────────────────────
    # UPLOAD_DIR lives on the container filesystem, which is ephemeral on
    # HuggingFace Spaces: a restart returns it to the state baked into the
    # image, i.e. empty, while the Postgres rows describing those files
    # survive. Documents then appear healthy until something needs the
    # original bytes, at which point extraction fails with "Stored file no
    # longer exists". Setting these moves the bytes somewhere that outlives
    # the container; leaving them unset keeps the previous local-disk
    # behaviour so local development needs no cloud credentials.
    SUPABASE_URL: str = Field(
        default="",
        description="Supabase project URL, e.g. https://xxxx.supabase.co. "
        "Enables durable upload storage when set together with "
        "SUPABASE_SERVICE_KEY.",
    )
    SUPABASE_SERVICE_KEY: str = Field(
        default="",
        description="Supabase service role key. The uploads bucket is private "
        "and only this backend reads it, so the anon key is not sufficient.",
    )
    SUPABASE_STORAGE_BUCKET: str = Field(
        default="documents",
        description="Bucket name for uploaded documents. Create it as a "
        "private bucket in the Supabase dashboard.",
    )

    MAX_FILE_SIZE_MB: int = Field(default=50)
    ALLOWED_FILE_TYPES: List[str] = Field(
        default=[
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ]
    )
    CHUNK_SIZE: int = Field(default=1000, description="Target chunk size in words")
    CHUNK_OVERLAP: int = Field(default=200, description="Overlap in words")
    MAX_CHUNK_CHARS: int = Field(
        default=4000,
        description="Hard ceiling on characters per chunk, enforced after "
        "sentence grouping. CHUNK_SIZE alone cannot enforce this: a Markdown "
        "table contains no sentence-ending punctuation, so the whole table is "
        "one 'sentence' and is emitted regardless of size. Measured: a 400-row "
        "table produced a single 14,703-character chunk. "
        "gemini-embedding-001 accepts ~2048 tokens (~8000 chars), so an "
        "oversized chunk is silently truncated and most of the table is never "
        "indexed. 4000 leaves comfortable headroom.",
    )

    # ── Document extraction ───────────────────────────────────────────────────
    ENABLE_TABLE_EXTRACTION: bool = Field(
        default=True,
        description="Extract tables as Markdown alongside prose. Mining "
        "regulations and equipment manuals are largely tabular, and plain "
        "text extraction flattens a table into unreadable runs of numbers.",
    )
    ENABLE_OCR: bool = Field(
        default=True,
        description="Run OCR on pages that yield almost no extractable text "
        "(i.e. scanned pages). Degrades to a warning if Tesseract is not "
        "installed, so local development without the binary still works.",
    )
    OCR_MIN_CHARS: int = Field(
        default=100,
        description="A page with fewer extractable characters than this is "
        "treated as scanned and sent to OCR.",
    )
    OCR_LANGUAGE: str = Field(default="eng", description="Tesseract language code")
    OCR_DPI: int = Field(
        default=200,
        description="Rasterisation DPI for OCR. 200 is the accuracy/speed "
        "knee for document scans; 300 helps only on small or degraded type.",
    )
    OCR_MAX_PAGES: int = Field(
        default=50,
        description="Cap on pages OCR'd per document. OCR is ~1-3s/page, so "
        "an uncapped 500-page scan would occupy a worker for 20 minutes.",
    )

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
