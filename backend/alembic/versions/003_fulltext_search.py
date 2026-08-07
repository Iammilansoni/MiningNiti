"""Replace trigram matching with real full-text lexical search

Revision ID: 003
Revises: 002
Create Date: 2026-08-05

Why this exists
---------------
The lexical half of "hybrid search" never returned anything. hybrid_search.py
matched with pg_trgm's `%` operator, which compares whole-string trigram
similarity between a ~1000 character chunk and a ~60 character question. That
score is structurally tiny — measured at 0.1385 for a well-matched mining
query against pg_trgm's default 0.3 threshold — so bm25_search() returned an
empty list on essentially every query and hybrid_search() silently fell back
to vector-only. Reciprocal Rank Fusion was fusing one list with nothing.

This adds a proper inverted index: a generated tsvector column over chunk_text
plus a GIN index, which is what lexical retrieval in PostgreSQL actually
means. Ranking uses ts_rank_cd (cover density), which rewards documents where
the query terms appear close together.

Note on naming: this is ts_rank_cd, not BM25. True BM25 in PostgreSQL needs an
extension such as pg_search/ParadeDB. The code and docs now say what it is.
"""

from alembic import op

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # The two-argument form of to_tsvector is IMMUTABLE (the one-argument form
    # depends on default_text_search_config and cannot be used in a generated
    # column).
    op.execute(
        """
        ALTER TABLE document_embeddings
        ADD COLUMN IF NOT EXISTS chunk_tsv tsvector
        GENERATED ALWAYS AS (to_tsvector('english', chunk_text)) STORED
        """
    )

    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_embeddings_chunk_tsv
        ON document_embeddings USING gin (chunk_tsv)
        """
    )

    # The trigram index on chunk_text backed the search this replaces. A GIN
    # trigram index over every chunk's full text is large and adds write
    # amplification on ingest, so it goes now that nothing reads it.
    op.execute("DROP INDEX IF EXISTS idx_embeddings_chunk_text_trgm")


def downgrade() -> None:
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_embeddings_chunk_text_trgm
        ON document_embeddings USING gin (chunk_text gin_trgm_ops)
        """
    )
    op.execute("DROP INDEX IF EXISTS idx_embeddings_chunk_tsv")
    op.execute("ALTER TABLE document_embeddings DROP COLUMN IF EXISTS chunk_tsv")
