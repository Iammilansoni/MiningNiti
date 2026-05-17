"""
Security Module
JWT verification, authentication, and authorization utilities
"""

import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import httpx
from jose import jwt, JWTError, jwk
from jose.exceptions import ExpiredSignatureError
from functools import lru_cache

from app.config import settings
from app.core.exceptions import AuthenticationError

logger = logging.getLogger(__name__)


class JWKSClient:
    """
    JWKS (JSON Web Key Set) client for Clerk JWT verification.
    Caches keys to avoid repeated network requests.
    """
    
    def __init__(self, jwks_url: str):
        self.jwks_url = jwks_url
        self._keys: Dict[str, Any] = {}
        self._last_fetch: Optional[datetime] = None
        self._cache_duration = timedelta(hours=1)
    
    async def get_signing_key(self, kid: str) -> Optional[Dict[str, Any]]:
        """Get signing key by key ID (kid)"""
        await self._refresh_keys_if_needed()
        return self._keys.get(kid)
    
    async def _refresh_keys_if_needed(self, force: bool = False):
        """Refresh keys if cache is stale or force is True"""
        now = datetime.utcnow()
        
        if not force and self._last_fetch and (now - self._last_fetch) < self._cache_duration:
            return
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.jwks_url, timeout=10.0)
                response.raise_for_status()
                jwks_data = response.json()
                
                self._keys = {
                    key["kid"]: key 
                    for key in jwks_data.get("keys", [])
                }
                self._last_fetch = now
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


async def verify_jwt_token(token: str) -> Dict[str, Any]:
    """
    Verify JWT token from Clerk.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload with user information
        
    Raises:
        AuthenticationError: If token is invalid or expired
    """
    try:
        # Decode header to get key ID
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        
        if not kid:
            raise AuthenticationError("Invalid token: missing key ID")
        
        # Get signing key
        jwks_client = get_jwks_client()
        signing_key = await jwks_client.get_signing_key(kid)
        
        if not signing_key:
            # Force refresh and try again
            await jwks_client._refresh_keys_if_needed(force=True)
            signing_key = await jwks_client.get_signing_key(kid)
            
            if not signing_key:
                raise AuthenticationError("Invalid token: unknown signing key")
        
        # Verify and decode token
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            options={"verify_aud": False}  # Clerk doesn't always set audience
        )
        
        return payload
        
    except ExpiredSignatureError:
        raise AuthenticationError("Token has expired")
    except JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        raise AuthenticationError("Invalid token")
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise AuthenticationError("Authentication failed")


def extract_user_id(payload: Dict[str, Any]) -> str:
    """
    Extract user ID from JWT payload.
    Clerk uses 'sub' claim for user ID.
    """
    user_id = payload.get("sub")
    if not user_id:
        raise AuthenticationError("Invalid token: missing user ID")
    return user_id


def extract_user_email(payload: Dict[str, Any]) -> Optional[str]:
    """Extract email from JWT payload if available"""
    # Clerk may include email in different claims
    return (
        payload.get("email") or 
        payload.get("primary_email") or
        payload.get("email_addresses", [{}])[0].get("email_address")
    )
