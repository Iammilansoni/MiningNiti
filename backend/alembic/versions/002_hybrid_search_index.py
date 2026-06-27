"""Add GIN trigram index on chunk_text for hybrid search

Revision ID: 002
Revises: 001_enable_pgvector
Create Date: 2025-01-01
"""

from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Ensure pg_trgm extension exists (for trigram similarity)
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # GIN trigram index on chunk_text for fast BM25-style keyword search
    # Enables: WHERE chunk_text % :query (trigram similarity match)
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_embeddings_chunk_text_trgm
        ON document_embeddings
        USING gin (chunk_text gin_trgm_ops)
        """
    )

    # GIN trigram index on document content for full-document keyword search
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_documents_content_trgm
        ON documents
        USING gin (content gin_trgm_ops)
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_embeddings_chunk_text_trgm")
    op.execute("DROP INDEX IF EXISTS idx_documents_content_trgm")
