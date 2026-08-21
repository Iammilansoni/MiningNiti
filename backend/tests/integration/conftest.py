"""
Integration test fixtures — real PostgreSQL, not SQLite.

Why this file exists
--------------------
The root conftest points every test at SQLite (``test.db``). That is fine for
unit tests, which never touch a dialect-specific column, but it does not work
for these API tests and never really did:

  * Every model uses ``sqlalchemy.dialects.postgresql.UUID`` primary keys. On
    SQLite those bind as ``CHAR(32)`` hex, and any place the app hands the
    driver a ``uuid.UUID`` (or a ``str`` where the other was expected) blows up
    with ``type 'UUID' is not supported`` / ``'str' object has no attribute
    'hex'``. That is what the five long-standing failures in
    ``test_chat_api.py`` were.
  * SQLite does not enforce the foreign keys to ``users.clerk_user_id`` by
    default, so these tests were silently not exercising them.
  * SQLite has no pgvector and no ``to_tsvector`` full-text search, so the two
    things the retrieval path is actually built on could never be covered.

Papering over the UUID binding with a type decorator would have kept the tests
green on a database the application never runs against. CI already starts a
``pgvector/pgvector:pg16`` service container and runs Alembic against it, so
the real database was sitting there unused — these fixtures point at it.

Running locally
---------------
    docker compose up -d postgres
    pytest tests/integration -v

The default URL matches the ``postgres`` service in ``docker-compose.yml``.
Override with ``TEST_DATABASE_URL`` to use a different server. When no server
is reachable the whole package skips with an explanatory message rather than
failing — same convention as ``tests/eval/test_retrieval_eval.py``.
"""

from __future__ import annotations

import os
from typing import Generator
from urllib.parse import urlsplit, urlunsplit

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.models.base import Base

# Matches the `postgres` service in docker-compose.yml. `miningniti_test` keeps
# the suite off the dev database; it is created on demand if missing.
DEFAULT_TEST_DB_URL = (
    "postgresql+psycopg2://postgres:postgres@localhost:5432/miningniti_test"
)

# connect_timeout keeps an unreachable-but-routable host from stalling the run
# for the driver's default before the skip fires.
_CONNECT_KWARGS = {"pool_pre_ping": True, "connect_args": {"connect_timeout": 5}}

SKIP_REASON = (
    "Integration tests need PostgreSQL. Start one with "
    "`docker compose up -d postgres`, or point TEST_DATABASE_URL at a server. "
    "Tried: {url}\nConnection error: {err}"
)


def _resolve_url() -> str:
    """
    Pick the PostgreSQL URL for the integration suite.

    TEST_DATABASE_URL wins. Otherwise DATABASE_URL is used when it is a
    PostgreSQL URL — that is the case in CI, where the workflow points it at
    the pgvector service container. The root conftest defaults DATABASE_URL to
    SQLite for unit tests, which is why a non-PostgreSQL value is ignored here.
    """
    explicit = os.environ.get("TEST_DATABASE_URL")
    if explicit:
        return explicit

    configured = os.environ.get("DATABASE_URL", "")
    if configured.startswith("postgresql"):
        return configured

    return DEFAULT_TEST_DB_URL


def _with_database(url: str, database: str) -> str:
    parts = urlsplit(url)
    return urlunsplit(
        (parts.scheme, parts.netloc, f"/{database}", parts.query, parts.fragment)
    )


def _ensure_database_exists(url: str) -> None:
    """
    CREATE DATABASE the target if it is missing.

    Only reached for the local default; in CI the service container already
    provisions the database and this connects, finds it, and returns.
    """
    target = urlsplit(url).path.lstrip("/")
    if not target:
        return

    admin = create_engine(
        _with_database(url, "postgres"), isolation_level="AUTOCOMMIT", **_CONNECT_KWARGS
    )
    try:
        with admin.connect() as conn:
            exists = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :name"),
                {"name": target},
            ).scalar()
            if not exists:
                # Identifier cannot be bound as a parameter; target comes from
                # our own URL, not user input.
                conn.execute(text(f'CREATE DATABASE "{target}"'))
    finally:
        admin.dispose()


@pytest.fixture(scope="session")
def test_engine() -> Generator[Engine, None, None]:
    """
    Session-scoped engine against real PostgreSQL.

    Overrides the SQLite engine of the same name in the root conftest for
    everything under tests/integration/. Skips the suite when no server is
    reachable.
    """
    url = _resolve_url()

    try:
        _ensure_database_exists(url)
        engine = create_engine(url, **_CONNECT_KWARGS)
        with engine.connect() as conn:
            # DocumentEmbedding.embedding is a pgvector column, so the type has
            # to exist before create_all(). In CI the Alembic migrations have
            # already done this and create_all() below is a no-op.
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            conn.commit()
    except Exception as exc:  # pragma: no cover - environment dependent
        pytest.skip(SKIP_REASON.format(url=url, err=exc))

    # checkfirst=True: leaves the Alembic-managed schema in CI untouched, and
    # bootstraps a bare database locally. Deliberately no drop_all() on
    # teardown — later CI steps (the retrieval eval) run against this same
    # database, and every test rolls its own writes back anyway.
    Base.metadata.create_all(bind=engine, checkfirst=True)

    yield engine

    engine.dispose()


@pytest.fixture(scope="function")
def db_session(test_engine: Engine) -> Generator[Session, None, None]:
    """
    Per-test session wrapped in a transaction that is always rolled back.

    ``join_transaction_mode="create_savepoint"`` is what makes this work
    against PostgreSQL: the API code under test calls ``session.commit()``, and
    without it that commit ends the outer transaction, leaking rows into the
    next test (on SQLite it produced the "transaction already deassociated"
    warnings). With savepoints, the app's commits are real as far as the test
    is concerned but the outer rollback below still undoes all of them.
    """
    connection = test_engine.connect()
    transaction = connection.begin()

    TestingSessionLocal = sessionmaker(
        bind=connection,
        autocommit=False,
        autoflush=False,
        join_transaction_mode="create_savepoint",
    )
    session = TestingSessionLocal()

    # The foreign keys from documents/chat_sessions to users.clerk_user_id are
    # enforced here, unlike on SQLite. The `client` fixture overrides
    # get_current_user_id, which is the dependency that would normally
    # provision this row (app/api/deps.py::_ensure_user_row), so the test has
    # to stand it up itself.
    from app.models.user import User

    session.add(User(clerk_user_id="test_user_001", is_active=True))
    session.commit()

    try:
        yield session
    finally:
        session.close()
        if transaction.is_active:
            transaction.rollback()
        connection.close()
