#!/usr/bin/env python3
"""
Database Initialization Script
Run this once to create all tables and seed default data.

Usage:
    python -m scripts.init_db
    # or from backend root:
    python scripts/init_db.py
"""

import logging
import sys
import os

# Add the parent directory to path so app imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    logger.info("Starting MiningNiti database initialization...")

    try:
        from app.config import settings
        from app.db.session import engine, init_db, check_db_connection

        # Check connection
        logger.info(f"Connecting to database...")
        if not check_db_connection():
            logger.error("❌ Cannot connect to database. Check your DATABASE_URL.")
            sys.exit(1)

        logger.info("✅ Database connection OK")

        # Try to enable pgvector extension
        try:
            from sqlalchemy import text
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                conn.commit()
            logger.info("✅ pgvector extension enabled")
        except Exception as e:
            logger.warning(f"⚠️  Could not enable pgvector extension: {e}")
            logger.warning("   Vector search will not work. Install pgvector or use Supabase.")

        # Create all tables
        logger.info("Creating database tables...")
        init_db()
        logger.info("✅ All tables created successfully")

        # Verify tables exist
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        logger.info(f"✅ Tables in database: {', '.join(sorted(tables))}")

        logger.info("\n🚀 MiningNiti database is ready!")

    except Exception as e:
        logger.error(f"❌ Initialization failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
