"""Baseline schema: all tables, pgvector/pg_trgm extensions, and ANN indexes

Revision ID: 001
Revises:
Create Date: 2026-08-05

This revision replaces the previous 001, which could not run: it opened with
ALTER TABLE against document_embeddings on the assumption that the schema
already existed (created by Base.metadata.create_all at startup). That made
`alembic upgrade head` fail on any fresh database with
"relation document_embeddings does not exist", so the migrations never ran
anywhere and the HNSW / trigram indexes were never created in production.

This is now a true bootstrap revision: it creates the full schema from nothing.

For an EXISTING database whose tables were created by create_all(), do not run
this — mark it as already applied instead:

    alembic stamp head
"""

from alembic import op
import sqlalchemy as sa
import pgvector.sqlalchemy
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Extensions must exist before any table with a VECTOR column is created.
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    op.create_table('audit_logs',
    sa.Column('user_id', sa.String(length=255), nullable=True),
    sa.Column('user_email', sa.String(length=255), nullable=True),
    sa.Column('action', sa.String(length=100), nullable=False),
    sa.Column('resource_type', sa.String(length=50), nullable=True),
    sa.Column('resource_id', sa.String(length=255), nullable=True),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('details', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('timestamp', sa.DateTime(), nullable=False),
    sa.Column('ip_address', sa.String(length=50), nullable=True),
    sa.Column('user_agent', sa.Text(), nullable=True),
    sa.Column('success', sa.String(length=10), nullable=True),
    sa.Column('error_message', sa.Text(), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_action'), 'audit_logs', ['action'], unique=False)
    op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'], unique=False)
    op.create_index(op.f('ix_audit_logs_timestamp'), 'audit_logs', ['timestamp'], unique=False)
    op.create_index(op.f('ix_audit_logs_user_id'), 'audit_logs', ['user_id'], unique=False)
    op.create_table('users',
    sa.Column('clerk_user_id', sa.String(length=255), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=True),
    sa.Column('full_name', sa.String(length=255), nullable=True),
    sa.Column('avatar_url', sa.Text(), nullable=True),
    sa.Column('company_name', sa.String(length=255), nullable=True),
    sa.Column('company_role', sa.String(length=100), nullable=True),
    sa.Column('industry_focus', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('mine_sites', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('preferences', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('last_login', sa.DateTime(), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_clerk_user_id'), 'users', ['clerk_user_id'], unique=True)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=False)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_table('chat_sessions',
    sa.Column('user_id', sa.String(length=255), nullable=False),
    sa.Column('title', sa.String(length=500), nullable=False),
    sa.Column('document_context', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('system_prompt', sa.Text(), nullable=True),
    sa.Column('metadata', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.clerk_user_id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_chat_sessions_id'), 'chat_sessions', ['id'], unique=False)
    op.create_index(op.f('ix_chat_sessions_user_id'), 'chat_sessions', ['user_id'], unique=False)
    op.create_table('custom_prompts',
    sa.Column('user_id', sa.String(length=255), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('prompt_text', sa.Text(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('category', sa.String(length=100), nullable=True),
    sa.Column('is_default', sa.Boolean(), nullable=False),
    sa.Column('use_count', sa.Integer(), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.clerk_user_id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_custom_prompts_id'), 'custom_prompts', ['id'], unique=False)
    op.create_index(op.f('ix_custom_prompts_user_id'), 'custom_prompts', ['user_id'], unique=False)
    op.create_table('documents',
    sa.Column('user_id', sa.String(length=255), nullable=False),
    sa.Column('title', sa.String(length=500), nullable=False),
    sa.Column('file_name', sa.String(length=500), nullable=False),
    sa.Column('file_size', sa.Integer(), nullable=False),
    sa.Column('file_type', sa.String(length=100), nullable=False),
    sa.Column('file_url', sa.Text(), nullable=False),
    sa.Column('status', sa.Enum('PENDING', 'PROCESSING', 'ANALYZING', 'COMPLETED', 'FAILED', name='documentstatus'), nullable=False),
    sa.Column('processing_error', sa.Text(), nullable=True),
    sa.Column('processed_at', sa.DateTime(), nullable=True),
    sa.Column('content', sa.Text(), nullable=True),
    sa.Column('page_count', sa.Integer(), nullable=True),
    sa.Column('total_pages', sa.Integer(), nullable=True),
    sa.Column('word_count', sa.Integer(), nullable=True),
    sa.Column('category', sa.Enum('SAFETY_PROTOCOL', 'EQUIPMENT_MANUAL', 'REGULATORY', 'INCIDENT_REPORT', 'GEOLOGICAL', 'ENVIRONMENTAL', 'TRAINING', 'PERMIT', 'MAINTENANCE', 'OTHER', name='documentcategory'), nullable=True),
    sa.Column('subcategory', sa.String(length=100), nullable=True),
    sa.Column('classification_confidence', sa.Float(), nullable=True),
    sa.Column('summary', sa.Text(), nullable=True),
    sa.Column('key_points', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('safety_score', sa.Float(), nullable=True),
    sa.Column('compliance_status', sa.Enum('COMPLIANT', 'WARNING', 'VIOLATION', 'PENDING', 'NOT_APPLICABLE', name='compliancestatus'), nullable=True),
    sa.Column('hazards_detected', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('safety_recommendations', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('entities', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('metadata', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('tags', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.clerk_user_id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_documents_category'), 'documents', ['category'], unique=False)
    op.create_index(op.f('ix_documents_id'), 'documents', ['id'], unique=False)
    op.create_index(op.f('ix_documents_status'), 'documents', ['status'], unique=False)
    op.create_index(op.f('ix_documents_user_id'), 'documents', ['user_id'], unique=False)
    op.create_table('chat_messages',
    sa.Column('session_id', sa.UUID(), nullable=False),
    sa.Column('role', sa.String(length=20), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('sources', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('model_used', sa.String(length=100), nullable=True),
    sa.Column('tokens_used', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('response_time_ms', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.ForeignKeyConstraint(['session_id'], ['chat_sessions.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_chat_messages_id'), 'chat_messages', ['id'], unique=False)
    op.create_index(op.f('ix_chat_messages_session_id'), 'chat_messages', ['session_id'], unique=False)
    op.create_table('compliance_audits',
    sa.Column('user_id', sa.String(length=255), nullable=False),
    sa.Column('title', sa.String(length=500), nullable=False),
    sa.Column('regulation_doc_id', sa.UUID(), nullable=False),
    sa.Column('operational_doc_ids', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=False),
    sa.Column('status', sa.Enum('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', name='auditstatus'), nullable=False),
    sa.Column('total_clauses', sa.Integer(), nullable=True),
    sa.Column('processed_clauses', sa.Integer(), nullable=False),
    sa.Column('compliant_count', sa.Integer(), nullable=True),
    sa.Column('gap_count', sa.Integer(), nullable=True),
    sa.Column('missing_count', sa.Integer(), nullable=True),
    sa.Column('overall_score', sa.Float(), nullable=True),
    sa.Column('processing_error', sa.Text(), nullable=True),
    sa.Column('completed_at', sa.DateTime(), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['regulation_doc_id'], ['documents.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.clerk_user_id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_compliance_audits_id'), 'compliance_audits', ['id'], unique=False)
    op.create_index(op.f('ix_compliance_audits_status'), 'compliance_audits', ['status'], unique=False)
    op.create_index(op.f('ix_compliance_audits_user_id'), 'compliance_audits', ['user_id'], unique=False)
    op.create_table('document_embeddings',
    sa.Column('document_id', sa.UUID(), nullable=False),
    sa.Column('chunk_index', sa.Integer(), nullable=False),
    sa.Column('chunk_text', sa.Text(), nullable=False),
    sa.Column('embedding', pgvector.sqlalchemy.vector.VECTOR(dim=768), nullable=False),
    sa.Column('embedding_model', sa.String(length=100), nullable=True),
    sa.Column('section_title', sa.String(length=500), nullable=True),
    sa.Column('page_numbers', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('start_page', sa.Integer(), nullable=True),
    sa.Column('end_page', sa.Integer(), nullable=True),
    sa.Column('metadata', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_document_embeddings_document_id'), 'document_embeddings', ['document_id'], unique=False)
    op.create_index(op.f('ix_document_embeddings_id'), 'document_embeddings', ['id'], unique=False)
    op.create_table('compliance_matrix_rows',
    sa.Column('audit_id', sa.UUID(), nullable=False),
    sa.Column('clause_index', sa.Integer(), nullable=False),
    sa.Column('clause_text', sa.Text(), nullable=False),
    sa.Column('section_title', sa.String(length=500), nullable=True),
    sa.Column('status', sa.String(length=50), nullable=False),
    sa.Column('assessment', sa.Text(), nullable=False),
    sa.Column('confidence', sa.Float(), nullable=False),
    sa.Column('evidence_chunks', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('recommendations', sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), 'postgresql'), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.ForeignKeyConstraint(['audit_id'], ['compliance_audits.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_compliance_matrix_rows_audit_id'), 'compliance_matrix_rows', ['audit_id'], unique=False)
    op.create_index(op.f('ix_compliance_matrix_rows_id'), 'compliance_matrix_rows', ['id'], unique=False)
    # ── Vector + trigram indexes ───────────────────────────────────────────────
    # create_all() cannot express these; without idx_embeddings_hnsw every
    # similarity search degrades to a sequential scan over all embeddings.
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_embeddings_hnsw
        ON document_embeddings
        USING hnsw (embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 200)
        """
    )
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS idx_embeddings_doc_chunk
        ON document_embeddings (document_id, chunk_index)
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_documents_title_trgm
        ON documents USING gin (title gin_trgm_ops)
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_documents_filename_trgm
        ON documents USING gin (file_name gin_trgm_ops)
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_documents_filename_trgm")
    op.execute("DROP INDEX IF EXISTS idx_documents_title_trgm")
    op.execute("DROP INDEX IF EXISTS idx_embeddings_doc_chunk")
    op.execute("DROP INDEX IF EXISTS idx_embeddings_hnsw")

    op.drop_index(op.f('ix_compliance_matrix_rows_id'), table_name='compliance_matrix_rows')
    op.drop_index(op.f('ix_compliance_matrix_rows_audit_id'), table_name='compliance_matrix_rows')
    op.drop_table('compliance_matrix_rows')
    op.drop_index(op.f('ix_document_embeddings_id'), table_name='document_embeddings')
    op.drop_index(op.f('ix_document_embeddings_document_id'), table_name='document_embeddings')
    op.drop_table('document_embeddings')
    op.drop_index(op.f('ix_compliance_audits_user_id'), table_name='compliance_audits')
    op.drop_index(op.f('ix_compliance_audits_status'), table_name='compliance_audits')
    op.drop_index(op.f('ix_compliance_audits_id'), table_name='compliance_audits')
    op.drop_table('compliance_audits')
    op.drop_index(op.f('ix_chat_messages_session_id'), table_name='chat_messages')
    op.drop_index(op.f('ix_chat_messages_id'), table_name='chat_messages')
    op.drop_table('chat_messages')
    op.drop_index(op.f('ix_documents_user_id'), table_name='documents')
    op.drop_index(op.f('ix_documents_status'), table_name='documents')
    op.drop_index(op.f('ix_documents_id'), table_name='documents')
    op.drop_index(op.f('ix_documents_category'), table_name='documents')
    op.drop_table('documents')
    op.drop_index(op.f('ix_custom_prompts_user_id'), table_name='custom_prompts')
    op.drop_index(op.f('ix_custom_prompts_id'), table_name='custom_prompts')
    op.drop_table('custom_prompts')
    op.drop_index(op.f('ix_chat_sessions_user_id'), table_name='chat_sessions')
    op.drop_index(op.f('ix_chat_sessions_id'), table_name='chat_sessions')
    op.drop_table('chat_sessions')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_clerk_user_id'), table_name='users')
    op.drop_table('users')
    op.drop_index(op.f('ix_audit_logs_user_id'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_timestamp'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_id'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_action'), table_name='audit_logs')
    op.drop_table('audit_logs')
