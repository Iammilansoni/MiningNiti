"""
Unit tests for settings validation.

These exist because of a production incident: CLERK_JWKS_URL was set without
its scheme, the application booted normally and reported healthy, and then
every authenticated request failed with a generic 401. The only clue was a log
line buried among the request logs:

    Failed to fetch JWKS: Request URL is missing an 'http://' or 'https://'
    protocol.

A service that cannot authenticate anyone is not healthy. It should refuse to
start instead of accepting traffic it can only reject.
"""

import pytest
from pydantic import ValidationError

from app.config import Settings

pytestmark = pytest.mark.unit


BASE = dict(
    DATABASE_URL="sqlite://",
    GEMINI_API_KEY="x",
    GROQ_API_KEY="x",
    MISTRAL_API_KEY="x",
)


def build(**overrides) -> Settings:
    """Construct Settings in isolation, ignoring any .env on disk."""
    return Settings(_env_file=None, **{**BASE, **overrides})


# ── The incident ───────────────────────────────────────────────────────────────


def test_jwks_url_without_scheme_is_rejected():
    """The exact value that caused the outage."""
    with pytest.raises(ValidationError, match="absolute http"):
        build(
            CLERK_JWKS_URL="elegant-wahoo-58.clerk.accounts.dev/.well-known/jwks.json"
        )


def test_valid_jwks_url_is_accepted():
    s = build(
        CLERK_JWKS_URL="https://elegant-wahoo-58.clerk.accounts.dev/.well-known/jwks.json"
    )
    assert s.CLERK_JWKS_URL.startswith("https://")


# ── Other malformed values ─────────────────────────────────────────────────────


@pytest.mark.parametrize(
    "bad",
    [
        "",  # empty
        "   ",  # whitespace only
        "ftp://host/jwks.json",  # wrong scheme
        "//host/jwks.json",  # protocol-relative
        "https://",  # scheme but no host
        "not a url at all",
    ],
)
def test_malformed_jwks_urls_are_rejected(bad):
    with pytest.raises(ValidationError):
        build(CLERK_JWKS_URL=bad)


def test_surrounding_whitespace_is_stripped():
    """Copy-paste from a dashboard often drags whitespace along."""
    s = build(CLERK_JWKS_URL="  https://x.clerk.accounts.dev/.well-known/jwks.json  ")
    assert s.CLERK_JWKS_URL == "https://x.clerk.accounts.dev/.well-known/jwks.json"


def test_plain_http_is_allowed_for_local_development():
    s = build(CLERK_JWKS_URL="http://localhost:9999/.well-known/jwks.json")
    assert s.CLERK_JWKS_URL.startswith("http://")


# ── The failure is legible ─────────────────────────────────────────────────────


def test_error_message_names_the_variable_and_shows_an_example():
    """
    An operator reading a crashed container's last line should be able to fix
    this without going to the source.
    """
    with pytest.raises(ValidationError) as exc:
        build(CLERK_JWKS_URL="clerk.accounts.dev/jwks.json")

    message = str(exc.value)
    assert "CLERK_JWKS_URL" in message
    assert "https://" in message  # shows the expected shape
