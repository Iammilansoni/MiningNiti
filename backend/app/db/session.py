"""
Database Session Management
SQLAlchemy engine and session configuration with connection pooling
"""

import logging
from typing import Generator
from contextlib import contextmanager

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, Session
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
    "pool_recycle": 3600,   # Recycle connections after 1 hour
    "echo": settings.DEBUG,  # Log SQL in debug mode
}

# Add SSL config if certificate path provided
connect_args = {}
if settings.SSL_CERT_PATH:
    connect_args["sslmode"] = "require"
    connect_args["sslrootcert"] = settings.SSL_CERT_PATH

engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    connect_args=connect_args,
    **engine_args
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
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


def init_db():
    """Initialize database tables using the canonical Base from models.base"""
    # Import all models so they register their tables with Base.metadata
    from app.models import user, document, chat, audit, prompt  # noqa: F401
    from app.models.base import Base as ModelBase

    ModelBase.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")


def check_db_connection() -> bool:
    """Check if database is reachable"""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False
