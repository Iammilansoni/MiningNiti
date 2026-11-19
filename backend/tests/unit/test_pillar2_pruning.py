"""
Unit Tests for Pillar 2: Pruning Dead & Legacy Code
Verifies that legacy shims, dead regex parsers, and misleading aliases have been cleanly pruned
without impacting application integrity.
"""

import sys
import unittest
from unittest.mock import MagicMock

from app.agents.base import BaseAgent
from app.services import hybrid_search


class TestPillar2Pruning(unittest.TestCase):
    def test_legacy_parse_json_is_removed_from_base_agent(self):
        """Verify the legacy regex-based _parse_json method is no longer present."""
        self.assertFalse(
            hasattr(BaseAgent, "_parse_json"),
            "BaseAgent still exposes legacy _parse_json. It should be removed in favor of structured outputs.",
        )

    def test_bm25_search_alias_is_removed_from_hybrid_search(self):
        """Verify the misleading bm25_search alias is removed from hybrid_search."""
        self.assertFalse(
            hasattr(hybrid_search, "bm25_search"),
            "hybrid_search still exposes bm25_search alias. It should be removed since true search is PostgreSQL tsvector.",
        )

    def test_hybrid_search_exports_authoritative_fulltext_search(self):
        """Verify hybrid_search cleanly exports fulltext_search and hybrid_search."""
        self.assertTrue(hasattr(hybrid_search, "fulltext_search"))
        self.assertTrue(hasattr(hybrid_search, "hybrid_search"))
        self.assertTrue(hasattr(hybrid_search, "vector_search"))
        self.assertTrue(hasattr(hybrid_search, "reciprocal_rank_fusion"))


if __name__ == "__main__":
    unittest.main()
