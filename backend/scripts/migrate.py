"""
Migration runner used at container start.

Three situations have to be handled, because this project ran
Base.metadata.create_all() at startup for a long time and never ran Alembic:

  1. Fresh database, nothing in it
        -> upgrade to head normally.

  2. Existing database created by create_all(), no alembic_version table
        -> the tables already exist, so running the baseline revision would
           fail with "relation already exists". Adopt the schema by stamping
           it at the baseline, then apply anything newer.

  3. Database already under Alembic control
        -> upgrade to head normally.

Run directly:  python -m scripts.migrate
"""

import logging
import sys

from sqlalchemy import inspect

from alembic import command
from alembic.config import Config
from app.db.session import engine, ensure_indexes

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - migrate - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# The revision whose schema matches what create_all() produced.
BASELINE_REVISION = "001"


def _alembic_config() -> Config:
    cfg = Config("alembic.ini")
    cfg.set_main_option("sqlalchemy.url", str(engine.url))
    return cfg


def run() -> None:
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())

    cfg = _alembic_config()

    if "alembic_version" in tables:
        logger.info("Database is under Alembic control — upgrading to head")
        command.upgrade(cfg, "head")

    elif "documents" in tables:
        # Case 2: pre-Alembic schema built by create_all().
        logger.warning(
            "Found an existing schema with no alembic_version table. "
            "Adopting it at revision %s, then applying newer revisions.",
            BASELINE_REVISION,
        )
        command.stamp(cfg, BASELINE_REVISION)
        command.upgrade(cfg, "head")

        # Stamping marks the baseline as applied without running it, so the
        # indexes that revision creates are skipped. create_all() never made
        # them either — which is precisely why production has been doing
        # sequential scans instead of using idx_embeddings_hnsw. Create them
        # explicitly for adopted databases.
        logger.info("Ensuring vector/trigram indexes on the adopted schema")
        ensure_indexes()

    else:
        logger.info("Fresh database — creating schema from the baseline")
        command.upgrade(cfg, "head")

    logger.info("Migrations complete")


if __name__ == "__main__":
    try:
        run()
    except Exception as e:
        logger.error(f"Migration failed: {e}", exc_info=True)
        sys.exit(1)
