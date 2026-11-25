"""
Unit Tests for Pillar 5: Centralizing Configuration & Environment Management

Verifies:
1. Default Settings instantiation and field boundaries.
2. API Key whitespace stripping and internal space rejection.
3. Clerk JWKS absolute URL validation.
4. JSON array and comma-separated string parsing for List[str] settings.
5. Bounds validation on SIMILARITY_THRESHOLD, CHUNK_SIZE, and CHUNK_OVERLAP.
6. Environment variable overrides.
7. Singleton caching via get_settings().
"""

import os
import unittest
from unittest.mock import patch

from pydantic import ValidationError

from app.config import Settings, get_settings

_BASE_REQUIRED = {
    "DATABASE_URL": "sqlite://",
    "GEMINI_API_KEY": "x",
    "GROQ_API_KEY": "x",
    "MISTRAL_API_KEY": "x",
    "CLERK_JWKS_URL": "https://clerk.example.com/.well-known/jwks.json",
}


class TestPillar5Config(unittest.TestCase):
    """Test suite for application configuration and environment validation."""

    def test_default_settings_instantiation(self):
        """Settings() should instantiate cleanly with standard defaults when unpolluted."""
        with patch.dict(os.environ, {}, clear=True):
            s = Settings(_env_file=None, **_BASE_REQUIRED)
            self.assertFalse(s.DEBUG)
            self.assertEqual(s.APP_NAME, "MiningNiti")
            self.assertEqual(s.APP_VERSION, "2.0.0")
            self.assertEqual(s.ENVIRONMENT, "development")
            self.assertEqual(s.CHUNK_SIZE, 1000)
            self.assertEqual(s.CHUNK_OVERLAP, 200)
            self.assertEqual(s.MAX_CHUNK_CHARS, 4000)
            self.assertEqual(s.SIMILARITY_THRESHOLD, 0.25)
            self.assertTrue(s.ENABLE_HYBRID_SEARCH)
            self.assertTrue(s.ENABLE_RERANKING)
            self.assertIn("application/pdf", s.ALLOWED_FILE_TYPES)
            self.assertIn("image/png", s.ALLOWED_FILE_TYPES)
            self.assertIn("image/jpeg", s.ALLOWED_FILE_TYPES)

    def test_api_key_whitespace_validator(self):
        """API keys must have surrounding whitespace stripped, but reject internal whitespace."""
        # Surrounding whitespace stripped cleanly
        s = Settings(
            _env_file=None,
            **{
                **_BASE_REQUIRED,
                "GEMINI_API_KEY": "  AIzaSyValidKey123\n  ",
                "GROQ_API_KEY": "\tgsk_valid_key_456  ",
                "MISTRAL_API_KEY": "  mis_valid_key_789  ",
            },
        )
        self.assertEqual(s.GEMINI_API_KEY, "AIzaSyValidKey123")
        self.assertEqual(s.GROQ_API_KEY, "gsk_valid_key_456")
        self.assertEqual(s.MISTRAL_API_KEY, "mis_valid_key_789")

        # Internal space raises ValidationError
        with self.assertRaises(ValidationError):
            Settings(
                _env_file=None,
                **{**_BASE_REQUIRED, "GEMINI_API_KEY": "AIza Sy Invalid Key"},
            )

        # Internal newline raises ValidationError
        with self.assertRaises(ValidationError):
            Settings(
                _env_file=None,
                **{**_BASE_REQUIRED, "GROQ_API_KEY": "gsk_invalid\nkey"},
            )

    def test_clerk_jwks_url_validator(self):
        """CLERK_JWKS_URL must be an absolute http(s) URL."""
        # Valid absolute URL
        s = Settings(
            _env_file=None,
            **{
                **_BASE_REQUIRED,
                "CLERK_JWKS_URL": "https://clerk.example.com/.well-known/jwks.json",
            },
        )
        self.assertEqual(
            s.CLERK_JWKS_URL, "https://clerk.example.com/.well-known/jwks.json"
        )

        # Missing protocol scheme raises ValidationError
        with self.assertRaises(ValidationError):
            Settings(
                _env_file=None,
                **{
                    **_BASE_REQUIRED,
                    "CLERK_JWKS_URL": "clerk.example.com/.well-known/jwks.json",
                },
            )

        # Empty string raises ValidationError
        with self.assertRaises(ValidationError):
            Settings(_env_file=None, **{**_BASE_REQUIRED, "CLERK_JWKS_URL": ""})

    def test_list_parsing_json_and_csv(self):
        """CORS_ORIGINS, CLERK_AUTHORIZED_PARTIES, and ALLOWED_FILE_TYPES accept JSON or CSV strings."""
        # JSON string array
        s1 = Settings(
            _env_file=None,
            **{
                **_BASE_REQUIRED,
                "CORS_ORIGINS": '["http://localhost:3000", "http://localhost:8000"]',
            },
        )
        self.assertEqual(
            s1.CORS_ORIGINS, ["http://localhost:3000", "http://localhost:8000"]
        )

        # Comma-separated string
        s2 = Settings(
            _env_file=None,
            **{
                **_BASE_REQUIRED,
                "CLERK_AUTHORIZED_PARTIES": "https://app.miningniti.com, https://preview.miningniti.com",
            },
        )
        self.assertEqual(
            s2.CLERK_AUTHORIZED_PARTIES,
            ["https://app.miningniti.com", "https://preview.miningniti.com"],
        )

        # Empty string yields empty list
        s3 = Settings(
            _env_file=None,
            **{**_BASE_REQUIRED, "CLERK_AUTHORIZED_PARTIES": ""},
        )
        self.assertEqual(s3.CLERK_AUTHORIZED_PARTIES, [])

        # Python list passes through untouched
        s4 = Settings(
            _env_file=None,
            **{**_BASE_REQUIRED, "CORS_ORIGINS": ["http://test.local"]},
        )
        self.assertEqual(s4.CORS_ORIGINS, ["http://test.local"])

        # Malformed JSON raises ValidationError
        with self.assertRaises(ValidationError):
            Settings(
                _env_file=None,
                **{**_BASE_REQUIRED, "CORS_ORIGINS": "[invalid-json-array"},
            )

    def test_bounds_validators(self):
        """SIMILARITY_THRESHOLD, positive integer fields, and CHUNK_OVERLAP enforce valid boundaries."""
        # Valid similarity threshold
        s = Settings(_env_file=None, **{**_BASE_REQUIRED, "SIMILARITY_THRESHOLD": 0.75})
        self.assertEqual(s.SIMILARITY_THRESHOLD, 0.75)

        # Negative similarity threshold rejected
        with self.assertRaises(ValidationError):
            Settings(_env_file=None, **{**_BASE_REQUIRED, "SIMILARITY_THRESHOLD": -0.1})

        # Similarity threshold > 1.0 rejected
        with self.assertRaises(ValidationError):
            Settings(_env_file=None, **{**_BASE_REQUIRED, "SIMILARITY_THRESHOLD": 1.5})

        # Negative or zero CHUNK_SIZE rejected
        with self.assertRaises(ValidationError):
            Settings(_env_file=None, **{**_BASE_REQUIRED, "CHUNK_SIZE": 0})
        with self.assertRaises(ValidationError):
            Settings(_env_file=None, **{**_BASE_REQUIRED, "CHUNK_SIZE": -100})

        # Negative CHUNK_OVERLAP rejected
        with self.assertRaises(ValidationError):
            Settings(_env_file=None, **{**_BASE_REQUIRED, "CHUNK_OVERLAP": -10})

        # CHUNK_OVERLAP >= CHUNK_SIZE rejected
        with self.assertRaises(ValidationError):
            Settings(
                _env_file=None,
                **{**_BASE_REQUIRED, "CHUNK_SIZE": 500, "CHUNK_OVERLAP": 500},
            )
        with self.assertRaises(ValidationError):
            Settings(
                _env_file=None,
                **{**_BASE_REQUIRED, "CHUNK_SIZE": 500, "CHUNK_OVERLAP": 600},
            )

    def test_environment_variable_overrides(self):
        """Settings should respect environment variable overrides."""
        env_vars = {
            **_BASE_REQUIRED,
            "DEBUG": "true",
            "ENVIRONMENT": "staging",
            "CHUNK_SIZE": "800",
            "SIMILARITY_THRESHOLD": "0.35",
            "CORS_ORIGINS": '["https://staging.miningniti.com"]',
        }
        with patch.dict(os.environ, env_vars, clear=True):
            s = Settings(_env_file=None)
            self.assertTrue(s.DEBUG)
            self.assertEqual(s.ENVIRONMENT, "staging")
            self.assertEqual(s.CHUNK_SIZE, 800)
            self.assertAlmostEqual(s.SIMILARITY_THRESHOLD, 0.35)
            self.assertEqual(s.CORS_ORIGINS, ["https://staging.miningniti.com"])

    def test_get_settings_caching(self):
        """get_settings() should cache the instance across calls."""
        get_settings.cache_clear()
        s1 = get_settings()
        s2 = get_settings()
        self.assertIs(s1, s2)


if __name__ == "__main__":
    unittest.main()
