"""
Unit tests for JWT verification.

Covers the guarantees that were missing before the PyJWT migration:
algorithm pinning, issuer validation, and authorized-party validation.
"""

import json
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa

from app.core.exceptions import AuthenticationError
from app.core.security import verify_jwt_token

pytestmark = pytest.mark.unit

ISSUER = "https://test-app.clerk.accounts.dev"
JWKS_URL = f"{ISSUER}/.well-known/jwks.json"
KID = "test-key-1"


@pytest.fixture
def rsa_key():
    return rsa.generate_private_key(public_exponent=65537, key_size=2048)


@pytest.fixture
def configured(monkeypatch, rsa_key):
    """Point the verifier at an in-memory JWKS built from our test key."""
    from app.config import settings
    from app.core import security

    monkeypatch.setattr(settings, "CLERK_JWKS_URL", JWKS_URL)
    monkeypatch.setattr(settings, "CLERK_ISSUER", "")
    monkeypatch.setattr(settings, "CLERK_AUTHORIZED_PARTIES", ["https://app.test"])

    jwk = json.loads(jwt.algorithms.RSAAlgorithm.to_jwk(rsa_key.public_key()))
    jwk["kid"] = KID
    jwk["alg"] = "RS256"

    client = security.JWKSClient(JWKS_URL)
    client._keys = {KID: jwk}
    client._last_fetch = datetime.now(timezone.utc)
    monkeypatch.setattr(security, "_jwks_client", client)
    return client


def make_token(rsa_key, *, alg="RS256", key=None, kid=KID, **claims):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": "user_abc123",
        "iss": ISSUER,
        "azp": "https://app.test",
        "iat": now,
        "exp": now + timedelta(minutes=5),
    }
    payload.update(claims)
    return jwt.encode(
        payload,
        key if key is not None else rsa_key,
        algorithm=alg,
        headers={"kid": kid},
    )


# ── Happy path ─────────────────────────────────────────────────────────────────


async def test_valid_token_is_accepted(configured, rsa_key):
    payload = await verify_jwt_token(make_token(rsa_key))
    assert payload["sub"] == "user_abc123"


# ── Signature / algorithm ──────────────────────────────────────────────────────


async def test_rejects_token_signed_by_another_key(configured, rsa_key):
    attacker = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    with pytest.raises(AuthenticationError):
        await verify_jwt_token(make_token(rsa_key, key=attacker))


async def test_rejects_alg_none(configured, rsa_key):
    """The unsigned-token attack: alg=none must never validate."""
    token = jwt.encode(
        {"sub": "user_abc123", "iss": ISSUER, "azp": "https://app.test"},
        key="",
        algorithm="none",
        headers={"kid": KID},
    )
    with pytest.raises(AuthenticationError):
        await verify_jwt_token(token)


async def test_rejects_unknown_kid(configured, rsa_key):
    with pytest.raises(AuthenticationError):
        await verify_jwt_token(make_token(rsa_key, kid="rotated-away"))


# ── Claims ─────────────────────────────────────────────────────────────────────


async def test_rejects_expired_token(configured, rsa_key):
    past = datetime.now(timezone.utc) - timedelta(hours=1)
    with pytest.raises(AuthenticationError, match="expired"):
        await verify_jwt_token(make_token(rsa_key, exp=past))


async def test_rejects_wrong_issuer(configured, rsa_key):
    with pytest.raises(AuthenticationError):
        await verify_jwt_token(make_token(rsa_key, iss="https://evil.clerk.dev"))


async def test_rejects_foreign_authorized_party(configured, rsa_key):
    """A valid Clerk token minted for a different site must not work here."""
    with pytest.raises(AuthenticationError):
        await verify_jwt_token(make_token(rsa_key, azp="https://other-app.test"))


async def test_rejects_missing_azp_when_configured(configured, rsa_key):
    token = make_token(rsa_key)
    decoded = jwt.decode(token, options={"verify_signature": False})
    decoded.pop("azp")
    stripped = jwt.encode(decoded, rsa_key, algorithm="RS256", headers={"kid": KID})
    with pytest.raises(AuthenticationError):
        await verify_jwt_token(stripped)


async def test_rejects_missing_sub(configured, rsa_key):
    token = make_token(rsa_key)
    decoded = jwt.decode(token, options={"verify_signature": False})
    decoded.pop("sub")
    stripped = jwt.encode(decoded, rsa_key, algorithm="RS256", headers={"kid": KID})
    with pytest.raises(AuthenticationError):
        await verify_jwt_token(stripped)


async def test_azp_check_skipped_when_unconfigured(configured, rsa_key, monkeypatch):
    """Backwards compatibility: empty allowlist warns but does not break."""
    from app.config import settings

    monkeypatch.setattr(settings, "CLERK_AUTHORIZED_PARTIES", [])
    payload = await verify_jwt_token(make_token(rsa_key, azp="https://anything.test"))
    assert payload["sub"] == "user_abc123"
