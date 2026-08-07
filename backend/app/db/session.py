"""
Database Session Management
SQLAlchemy engine and session configuration with connection pooling.

Two engines exist here on purpose:

  async_engine / AsyncSessionLocal
      What request handlers use. Every endpoint is `async def`, so a
      synchronous DB call inside one blocks the event loop for its whole
      duration — every other request served by that worker waits behind it.

  engine / SessionLocal  (synchronous)
      Retained for the things that genuinely are not async: Alembic, the
      migration runner, and startup schema checks. Also still used by the
      handlers that have not been converted yet; both paths work against the
      same database while the conversion proceeds module by module.
"""

import logging
from contextlib import asynccontextmanager, contextmanager
from typing import AsyncGenerator, Generator

from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool, QueuePool

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


# ── Async engine ───────────────────────────────────────────────────────────────


def _async_url(url: str) -> str:
    """
    Translate a sync DATABASE_URL to its async driver equivalent.

    Deployments set DATABASE_URL with a sync driver (Supabase hands you
    `postgresql://`, and this project's compose files use
    `postgresql+psycopg2://`). Rather than require every environment to be
    edited — including the HuggingFace Space, where a mistake means a failed
    boot — the async driver is substituted here.

    psycopg3 is used rather than asyncpg because `psycopg[binary,pool]` is
    already a dependency and psycopg3 speaks both sync and async, so the two
    engines share one driver.
    """
    if url.startswith("postgresql+psycopg2://"):
        return url.replace("postgresql+psycopg2://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    if url.startswith("postgres://"):  # legacy Heroku-style
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("sqlite://") and "+aiosqlite" not in url:
        return url.replace("sqlite://", "sqlite+aiosqlite://", 1)
    return url


def _is_transaction_pooler(url: str) -> bool:
    """
    Detect Supabase's transaction pooler (port 6543).

    PgBouncer in transaction mode multiplexes one server connection across
    clients, so server-side prepared statements leak between sessions and
    error with "prepared statement already exists". psycopg3 prepares
    automatically after a few executions, so it has to be told not to.
    """
    return ":6543" in url or "pgbouncer=true" in url.lower()


ASYNC_DATABASE_URL = _async_url(settings.DATABASE_URL)

_async_connect_args = dict(connect_args)
_async_engine_args = dict(engine_args)

if ASYNC_DATABASE_URL.startswith("postgresql+psycopg"):
    if _is_transaction_pooler(ASYNC_DATABASE_URL):
        # Disable prepared statements, and do not hold a client-side pool on
        # top of the server-side one — that is how you exhaust a pooler.
        _async_connect_args["prepare_threshold"] = None
        _async_engine_args = {"poolclass": NullPool, "echo": False}
        logger.info("Transaction pooler detected: prepared statements disabled")
elif ASYNC_DATABASE_URL.startswith("sqlite"):
    # SQLite (tests) supports none of the pool tuning above.
    _async_engine_args = {"echo": False}
    _async_connect_args = {}

async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    connect_args=_async_connect_args,
    **_async_engine_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    # Attributes stay usable after commit(); without this every commit
    # invalidates loaded objects and the next attribute read emits a lazy
    # refresh, which raises MissingGreenlet outside a greenlet context.
    expire_on_commit=False,
)


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


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for async FastAPI endpoints.

    Usage:
        @router.get("/items")
        async def get_items(db: AsyncSession = Depends(get_async_db)):
            result = await db.execute(select(Item))
            return result.scalars().all()

    The session is rolled back on an unhandled exception rather than left for
    the pool to reset, so a failed request cannot hand a dirty transaction to
    the next one that checks the connection out.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise


@asynccontextmanager
async def get_async_db_context() -> AsyncGenerator[AsyncSession, None]:
    """
    Async session for use outside FastAPI — background workers and scripts.

    Commits on clean exit, rolls back on exception.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


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
