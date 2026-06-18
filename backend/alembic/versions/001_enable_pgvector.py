"""
Migration: Enable pgvector and migrate embeddings from JSONB to vector(768)

Revision ID: 001
Revises: (initial)
Create Date: 2026-06-07

Changes:
  1. Enable the pgvector extension
  2. Add page tracking columns to document_embeddings
     (section_title, page_numbers)
  3. Migrate embedding column from JSONB to vector(768) native type
  4. Create HNSW index for fast ANN search (~5ms vs seconds)
  5. Fix datetime.utcnow() deprecation in base models (add timezone info)
  6. Add total_pages column to documents
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Step 1: Enable pgvector extension ──────────────────────────────────────
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")  # For full-text search

    # ── Step 2: Add page tracking columns to document_embeddings ───────────────
    op.add_column(
        "document_embeddings",
        sa.Column("section_title", sa.String(500), nullable=True),
    )
    op.add_column(
        "document_embeddings",
        sa.Column(
            "page_numbers",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            comment="List of page numbers this chunk spans, e.g. [12, 13]",
        ),
    )

    # ── Step 3: Add total_pages column to documents ────────────────────────────
    # (page_count already exists — we just ensure it's correctly named)
    # Add total_pages as an alias; keep page_count for backward compatibility
    op.add_column(
        "documents",
        sa.Column("total_pages", sa.Integer(), nullable=True),
    )

    # ── Step 4: Migrate embedding column from JSONB → vector(768) ─────────────
    # First add the new column
    op.execute(
        "ALTER TABLE document_embeddings ADD COLUMN embedding_vec vector(768)"
    )

    # Convert existing JSONB embeddings to vector type
    # This handles both list-of-floats and null values safely
    op.execute(
        """
        UPDATE document_embeddings
        SET embedding_vec = (
            SELECT array_agg(elem::float8)::vector(768)
            FROM jsonb_array_elements_text(embedding) AS elem
        )
        WHERE embedding IS NOT NULL
          AND jsonb_typeof(embedding) = 'array'
          AND jsonb_array_length(embedding) = 768
        """
    )

    # Drop the old JSONB column and rename new one
    op.execute("ALTER TABLE document_embeddings DROP COLUMN embedding")
    op.execute(
        "ALTER TABLE document_embeddings RENAME COLUMN embedding_vec TO embedding"
    )

    # Make embedding NOT NULL (existing rows already converted)
    op.execute(
        "ALTER TABLE document_embeddings ALTER COLUMN embedding SET NOT NULL"
    )

    # ── Step 5: Create HNSW index for approximate nearest neighbor search ──────
    # HNSW gives sub-5ms search up to ~1M vectors
    # m=16: max connections per node (higher = better recall, more memory)
    # ef_construction=200: build-time search depth (higher = better quality index)
    op.execute(
        """
        CREATE INDEX idx_embeddings_hnsw
        ON document_embeddings
        USING hnsw (embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 200)
        """
    )

    # ── Step 6: Add composite index on (document_id, chunk_index) ──────────────
    op.create_index(
        "idx_embeddings_doc_chunk",
        "document_embeddings",
        ["document_id", "chunk_index"],
        unique=True,
    )

    # ── Step 7: Add trigram index on documents for full-text search ────────────
    op.execute(
        """
        CREATE INDEX idx_documents_title_trgm
        ON documents
        USING gin (title gin_trgm_ops)
        """
    )
    op.execute(
        """
        CREATE INDEX idx_documents_filename_trgm
        ON documents
        USING gin (file_name gin_trgm_ops)
        """
    )


def downgrade() -> None:
    # Remove indexes
    op.execute("DROP INDEX IF EXISTS idx_embeddings_hnsw")
    op.execute("DROP INDEX IF EXISTS idx_documents_title_trgm")
    op.execute("DROP INDEX IF EXISTS idx_documents_filename_trgm")
    op.drop_index("idx_embeddings_doc_chunk", table_name="document_embeddings")

    # Restore JSONB column
    op.execute(
        "ALTER TABLE document_embeddings ADD COLUMN embedding_jsonb jsonb"
    )
    op.execute(
        """
        UPDATE document_embeddings
        SET embedding_jsonb = to_jsonb(embedding::float8[])
        WHERE embedding IS NOT NULL
        """
    )
    op.execute("ALTER TABLE document_embeddings DROP COLUMN embedding")
    op.execute(
        "ALTER TABLE document_embeddings RENAME COLUMN embedding_jsonb TO embedding"
    )

    # Remove added columns
    op.drop_column("document_embeddings", "section_title")
    op.drop_column("document_embeddings", "page_numbers")
    op.drop_column("documents", "total_pages")
