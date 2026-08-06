"""
Security Module
JWT verification, authentication, and authorization utilities.

Uses PyJWT rather than python-jose: python-jose 3.3.0 is affected by
CVE-2024-33663 (algorithm confusion allowing a token signed with an attacker's
key to validate) and CVE-2024-33664 (JWE decompression bomb). PyJWT is
maintained and rejects algorithm substitution by construction, because the
caller states the permitted algorithms and the header is never trusted to
choose the key type.
"""

import asyncio
import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

import httpx
import jwt
from jwt import PyJWK
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

from app.config import settings
from app.core.exceptions import AuthenticationError

logger = logging.getLogger(__name__)

# Clerk signs session tokens with RS256. Pinning this prevents an attacker from
# presenting an HS256 token whose "signature" is computed with the public key as
# the HMAC secret — the classic confusion attack.
_ALLOWED_ALGORITHMS = ["RS256"]


def _default_issuer() -> str:
    """
    Derive the expected issuer from the JWKS URL.

    A Clerk JWKS URL is <issuer>/.well-known/jwks.json, so the origin of that
    URL is the issuer. This keeps existing deployments working without adding a
    new required env var, while still enforcing the check.
    """
    if settings.CLERK_ISSUER:
        return settings.CLERK_ISSUER.rstrip("/")
    parsed = urlparse(settings.CLERK_JWKS_URL)
    if parsed.scheme and parsed.netloc:
        return f"{parsed.scheme}://{parsed.netloc}"
    return ""


class JWKSClient:
    """
    JWKS (JSON Web Key Set) client for Clerk JWT verification.
    Caches keys to avoid a network round trip on every request.
    """

    def __init__(self, jwks_url: str):
        self.jwks_url = jwks_url
        self._keys: Dict[str, Any] = {}
        self._last_fetch: Optional[datetime] = None
        self._cache_duration = timedelta(hours=1)
        # Serialises concurrent refreshes so a burst of requests with an unknown
        # kid triggers one fetch, not one per request.
        self._lock = asyncio.Lock()

    async def get_signing_key(self, kid: str) -> Optional[Dict[str, Any]]:
        """Get signing key by key ID (kid)"""
        await self._refresh_keys_if_needed()
        return self._keys.get(kid)

    async def _refresh_keys_if_needed(self, force: bool = False):
        """Refresh keys if the cache is stale or force is True"""
        now = datetime.now(timezone.utc)

        if (
            not force
            and self._last_fetch
            and (now - self._last_fetch) < self._cache_duration
        ):
            return

        async with self._lock:
            # Another coroutine may have refreshed while we waited for the lock.
            if (
                not force
                and self._last_fetch
                and (datetime.now(timezone.utc) - self._last_fetch)
                < self._cache_duration
            ):
                return

            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(self.jwks_url, timeout=10.0)
                    response.raise_for_status()
                    jwks_data = response.json()

                    self._keys = {key["kid"]: key for key in jwks_data.get("keys", [])}
                    self._last_fetch = datetime.now(timezone.utc)
                    logger.info(f"Refreshed JWKS keys: {len(self._keys)} keys loaded")

            except Exception as e:
                logger.error(f"Failed to fetch JWKS: {e}")
                if not self._keys:
                    raise AuthenticationError("Unable to verify authentication")


# Global JWKS client instance
_jwks_client: Optional[JWKSClient] = None


def get_jwks_client() -> JWKSClient:
    """Get or create JWKS client singleton"""
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = JWKSClient(settings.CLERK_JWKS_URL)
    return _jwks_client


def _verify_authorized_party(payload: Dict[str, Any]) -> None:
    """
    Check the 'azp' (authorized party) claim against the configured origins.

    Clerk sets azp to the origin that requested the token. Without this check,
    a token issued to any other application on the same Clerk instance is
    accepted here — the signature and issuer are identical, only azp differs.
    """
    allowed: List[str] = settings.CLERK_AUTHORIZED_PARTIES
    if not allowed:
        logger.warning(
            "CLERK_AUTHORIZED_PARTIES is empty — the 'azp' claim is not being "
            "verified. Set it to your frontend origin(s) in production."
        )
        return

    azp = payload.get("azp")
    if azp is None:
        # Templates can omit azp; fail closed once the operator opted in.
        raise AuthenticationError("Token is missing the authorized party claim")

    if azp not in allowed:
        logger.warning(f"Rejected token with unauthorized azp: {azp}")
        raise AuthenticationError("Token was not issued for this application")


async def verify_jwt_token(token: str) -> Dict[str, Any]:
    """
    Verify a Clerk-issued JWT.

    Validates, in order: signature (RS256 against the JWKS key matching the
    token's kid), expiry, not-before, issuer, and authorized party.

    Args:
        token: JWT token string

    Returns:
        Decoded token payload with user information

    Raises:
        AuthenticationError: If the token is invalid, expired, or foreign
    """
    try:
        # The header is used only to select a candidate key. The algorithm is
        # pinned separately, so a forged 'alg' cannot change how we verify.
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        if not kid:
            raise AuthenticationError("Invalid token: missing key ID")

        jwks_client = get_jwks_client()
        signing_key = await jwks_client.get_signing_key(kid)

        if not signing_key:
            # Unknown kid usually means Clerk rotated keys — refresh once.
            await jwks_client._refresh_keys_if_needed(force=True)
            signing_key = await jwks_client.get_signing_key(kid)

            if not signing_key:
                raise AuthenticationError("Invalid token: unknown signing key")

        issuer = _default_issuer()

        payload = jwt.decode(
            token,
            key=PyJWK.from_dict(signing_key).key,
            algorithms=_ALLOWED_ALGORITHMS,
            issuer=issuer or None,
            options={
                "require": ["exp", "sub"],
                "verify_signature": True,
                "verify_exp": True,
                "verify_nbf": True,
                "verify_iss": bool(issuer),
                # Clerk session tokens carry no 'aud' by default; authorization
                # is enforced through 'azp' below instead.
                "verify_aud": False,
            },
        )

        _verify_authorized_party(payload)

        return payload

    except ExpiredSignatureError:
        raise AuthenticationError("Token has expired")
    except AuthenticationError:
        raise
    except InvalidTokenError as e:
        logger.warning(f"JWT verification failed: {e}")
        raise AuthenticationError("Invalid token")
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise AuthenticationError("Authentication failed")


def extract_user_id(payload: Dict[str, Any]) -> str:
    """
    Extract user ID from JWT payload.
    Clerk uses the 'sub' claim for user ID.
    """
    user_id = payload.get("sub")
    if not user_id:
        raise AuthenticationError("Invalid token: missing user ID")
    return user_id


def extract_user_email(payload: Dict[str, Any]) -> Optional[str]:
    """Extract email from JWT payload if available"""
    # Clerk may include email in different claims
    return (
        payload.get("email")
        or payload.get("primary_email")
        or payload.get("email_addresses", [{}])[0].get("email_address")
    )
