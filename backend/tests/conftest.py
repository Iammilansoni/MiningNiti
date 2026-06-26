"""
Test Fixtures and Configuration
Shared pytest fixtures for unit and integration tests.
"""

import asyncio
import uuid
from typing import AsyncGenerator, Generator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

# ── Test database (SQLite in-memory for unit tests) ────────────────────────────
SQLITE_URL = "sqlite:///./test.db"

# We need to patch settings BEFORE importing app modules
import os

os.environ.setdefault("DATABASE_URL", SQLITE_URL)
os.environ.setdefault("GEMINI_API_KEY", "test-api-key-000000000000000000000000")
os.environ.setdefault("CLERK_JWKS_URL", "https://test.clerk.com/.well-known/jwks.json")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")

from app.models import (  # noqa: F401 — register tables
    audit,
    chat,
    document,
    prompt,
    user,
)
from app.models.base import Base

# ── Database fixtures ─────────────────────────────────────────────────────────


@pytest.fixture(scope="session")
def test_engine():
    """Create SQLite test engine (session-scoped for performance)."""
    engine = create_engine(
        SQLITE_URL,
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(test_engine) -> Generator[Session, None, None]:
    """
    Provide a clean database session for each test.
    Rolls back all changes after each test for isolation.
    """
    connection = test_engine.connect()
    transaction = connection.begin()

    TestingSessionLocal = sessionmaker(
        bind=connection, autocommit=False, autoflush=False
    )
    session = TestingSessionLocal()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


# ── Test client fixtures ───────────────────────────────────────────────────────


@pytest.fixture(scope="function")
def client(db_session: Session):
    """
    FastAPI test client with auth mocked and DB injected.
    """
    from app.api.deps import get_current_user_id
    from app.db.session import get_db
    from app.main import app

    def override_get_db():
        yield db_session

    def override_get_user_id():
        return "test_user_001"

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user_id] = override_get_user_id

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


# ── Model factory fixtures ─────────────────────────────────────────────────────


@pytest.fixture
def sample_user_id() -> str:
    return "test_user_001"


@pytest.fixture
def sample_document(db_session: Session, sample_user_id: str):
    """Create a sample document for tests."""
    from app.models.document import Document, DocumentCategory, DocumentStatus

    doc = Document(
        user_id=sample_user_id,
        title="Test Mining Safety Protocol",
        file_name="mining_safety.pdf",
        file_size=1024 * 100,  # 100KB
        file_type="application/pdf",
        file_url="https://example.com/mining_safety.pdf",
        status=DocumentStatus.COMPLETED,
        category=DocumentCategory.SAFETY_PROTOCOL,
        content="This document covers underground coal mine safety procedures...",
        total_pages=25,
        summary="A comprehensive guide to mining safety.",
        key_points=["Wear PPE", "Check ventilation", "Follow evacuation plan"],
        safety_score=82.5,
        classification_confidence=0.95,
    )
    db_session.add(doc)
    db_session.commit()
    db_session.refresh(doc)
    return doc


@pytest.fixture
def sample_embedding(db_session: Session, sample_document):
    """Create a sample document embedding for RAG tests."""
    from app.models.document import DocumentEmbedding

    embedding = DocumentEmbedding(
        document_id=sample_document.id,
        chunk_index=0,
        chunk_text="Underground coal mines require adequate ventilation to prevent methane buildup.",
        embedding=[0.1] * 768,  # Mock 768-dim vector
        page_numbers=[12, 13],
        section_title="Ventilation Requirements",
        start_page=12,
    )
    db_session.add(embedding)
    db_session.commit()
    db_session.refresh(embedding)
    return embedding


@pytest.fixture
def sample_chat_session(db_session: Session, sample_user_id: str):
    """Create a sample chat session."""
    from app.models.chat import ChatSession

    session = ChatSession(
        user_id=sample_user_id,
        title="Test Chat Session",
        document_context=[],
    )
    db_session.add(session)
    db_session.commit()
    db_session.refresh(session)
    return session


# ── Gemini mock fixtures ───────────────────────────────────────────────────────


@pytest.fixture
def mock_gemini_response():
    """Mock Gemini generate_content response."""
    mock = MagicMock()
    mock.text = '{"category": "safety_protocol", "confidence": 0.92, "reasoning": "Contains PPE requirements", "subcategory": "underground"}'
    return mock


@pytest.fixture
def mock_gemini_embedding():
    """Mock Gemini embedding response."""
    return {"embedding": [0.1] * 768}


@pytest.fixture
def mock_chat_response():
    """Mock chat generation response."""
    mock = MagicMock()
    mock.text = (
        "According to [mining_safety.pdf, Page 12], the ventilation requirements "
        "state that all underground coal mines must maintain methane levels below 1%."
    )
    return mock


# ── Sample text fixtures ───────────────────────────────────────────────────────

SAMPLE_PDF_TEXT = """
UNDERGROUND COAL MINE SAFETY PROTOCOL

1. VENTILATION REQUIREMENTS

All underground coal mines must maintain adequate ventilation to prevent the
accumulation of hazardous gases including methane (CH4), carbon monoxide (CO),
and hydrogen sulfide (H2S).

Minimum air velocity requirements per 30 CFR 75.321:
- Main intake airways: minimum 60 feet per minute
- Working sections: minimum 60,000 cubic feet per minute

2. PERSONAL PROTECTIVE EQUIPMENT

All personnel entering underground areas must wear:
- Approved hard hat with headlamp
- Self-rescuer device
- Safety boots with steel toe and anti-static properties

3. EMERGENCY EVACUATION

Evacuation routes must be clearly marked and tested quarterly.
Emergency drills must be conducted at least twice per year per MSHA regulation.
"""


@pytest.fixture
def sample_mining_text():
    return SAMPLE_PDF_TEXT
