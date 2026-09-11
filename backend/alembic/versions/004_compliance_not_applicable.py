"""Add not_applicable_count to compliance_audits

Revision ID: 004
Revises: 003
Create Date: 2026-09-11

Why this exists
----------------
The compliance auditor scored every embedded chunk of a regulation document
as a "clause" to check compliance against, with no distinction between real
operational requirements and pure definitions/gazette-masthead/table-of-
contents content. Indian gazette-style regulations front-load long
Definitions chapters, so any full-document audit was dominated by clauses no
operational document could ever "comply with" — two real audits scored 1.8%
and 0% this way, both because the operational SOP didn't restate legal
definitions for terms like "detonating fuse" or "ANFO".

clause_filter.py now short-circuits those clauses to a new "not_applicable"
status before the evidence search + LLM call, and overall_score is computed
excluding them from the denominator. This column persists the count so the
UI can show it as its own bucket rather than folding it into "missing" (a
real compliance gap) or silently dropping it from the total.
"""

from alembic import op

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE compliance_audits
        ADD COLUMN IF NOT EXISTS not_applicable_count INTEGER
        """
    )


def downgrade() -> None:
    op.execute(
        "ALTER TABLE compliance_audits DROP COLUMN IF EXISTS not_applicable_count"
    )
