"""
Database Session Management
SQLAlchemy engine and session configuration with connection pooling
"""

import logging
from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import QueuePool

from app.config import settings

# Use the single canonical Base so all models share the same metadata
from app.models.base import Base  # noqa: F401 - re-exported for convenience

logger = logging.getLogger(__name__)

# Configure engine with connection pooling
engine_args = {
    "pool_size": settings.DB_POOL_SIZE,
    "max_overflow": settings.DB_MAX_OVERFLOW,
    "pool_pre_ping": True,  # Verify connections before use
    "pool_recycle": 3600,  # Recycle connections after 1 hour
    "echo": False,  # Suppress excessive SQL query logging
}

# Add SSL config if certificate path provided
connect_args = {}
if settings.SSL_CERT_PATH:
    connect_args["sslmode"] = "require"
    connect_args["sslrootcert"] = settings.SSL_CERT_PATH

engine = create_engine(
    settings.DATABASE_URL, poolclass=QueuePool, connect_args=connect_args, **engine_args
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Connection event listeners for debugging
@event.listens_for(engine, "connect")
def on_connect(dbapi_conn, connection_record):
    logger.debug("Database connection established")


@event.listens_for(engine, "checkout")
def on_checkout(dbapi_conn, connection_record, connection_proxy):
    logger.debug("Database connection checked out from pool")


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for FastAPI endpoints.
    Yields a database session and ensures cleanup.

    Usage:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    """
    Context manager for database sessions outside of FastAPI.
    Useful for background workers and scripts.

    Usage:
        with get_db_context() as db:
            db.query(...)
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# Indexes that Base.metadata.create_all() cannot express: pgvector's HNSW index
# and the pg_trgm GIN indexes. They live in Alembic migrations 001/002, but the
# migration chain has no baseline revision (001 ALTERs tables it assumes already
# exist), so `alembic upgrade head` cannot bootstrap a fresh database and in
# practice the migrations never run.
#
# Until a proper baseline migration exists, these are applied here so a fresh
# deployment is not left doing sequential scans over every embedding — which is
# what "sub-5ms ANN search" silently degrades to without idx_embeddings_hnsw.
#
# All statements are IF NOT EXISTS, so this is safe to run on every startup and
# against a database that already has them.
_REQUIRED_INDEXES = (
    (
        "idx_embeddings_hnsw",
        """
        CREATE INDEX IF NOT EXISTS idx_embeddings_hnsw
        ON document_embeddings
        USING hnsw (embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 200)
        """,
    ),
    (
        "idx_embeddings_doc_chunk",
        """
        CREATE UNIQUE INDEX IF NOT EXISTS idx_embeddings_doc_chunk
        ON document_embeddings (document_id, chunk_index)
        """,
    ),
    # Lexical retrieval. Deliberately NOT a trigram index on chunk_text: that
    # is what migration 003 removed, because whole-string trigram similarity
    # between a long chunk and a short question never clears pg_trgm's
    # threshold. See alembic/versions/003_fulltext_search.py.
    (
        "chunk_tsv column",
        """
        ALTER TABLE document_embeddings
        ADD COLUMN IF NOT EXISTS chunk_tsv tsvector
        GENERATED ALWAYS AS (to_tsvector('english', chunk_text)) STORED
        """,
    ),
    (
        "idx_embeddings_chunk_tsv",
        """
        CREATE INDEX IF NOT EXISTS idx_embeddings_chunk_tsv
        ON document_embeddings USING gin (chunk_tsv)
        """,
    ),
    (
        "idx_documents_title_trgm",
        """
        CREATE INDEX IF NOT EXISTS idx_documents_title_trgm
        ON documents USING gin (title gin_trgm_ops)
        """,
    ),
    (
        "idx_documents_filename_trgm",
        """
        CREATE INDEX IF NOT EXISTS idx_documents_filename_trgm
        ON documents USING gin (file_name gin_trgm_ops)
        """,
    ),
)


def init_db():
    """Initialize database tables using the canonical Base from models.base"""
    # Import all models so they register their tables with Base.metadata
    from app.models import audit, chat, document, prompt, user  # noqa: F401
    from app.models.base import Base as ModelBase

    is_postgres = engine.dialect.name == "postgresql"

    if is_postgres:
        # Extensions must exist before tables with VECTOR columns are created.
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
            conn.commit()
        logger.info("pgvector and pg_trgm extensions ensured")

    ModelBase.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")

    if is_postgres:
        ensure_indexes()


def ensure_indexes():
    """
    Create the vector and trigram indexes if they are missing.

    Building the HNSW index on an already-large table takes time and holds a
    lock on document_embeddings. On a fresh or small database this is
    negligible; if you are adding it to a table with millions of rows, create
    it out of band with CREATE INDEX CONCURRENTLY instead of relying on this.
    """
    for name, ddl in _REQUIRED_INDEXES:
        try:
            with engine.connect() as conn:
                conn.execute(text(ddl))
                conn.commit()
            logger.debug(f"Index ensured: {name}")
        except Exception as e:
            # A missing index degrades performance; it must not stop the app.
            logger.warning(f"Could not create index {name}: {e}")


def check_db_connection() -> bool:
    """Check if database is reachable"""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False
