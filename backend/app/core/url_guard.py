"""
Outbound URL Guard — SSRF protection for user-supplied document URLs.

Any URL that arrives from a client (e.g. DocumentCreate.file_url) is attacker
controlled. Without validation, `GET <that url>` from inside the cluster is a
confused-deputy: it can reach cloud metadata endpoints (169.254.169.254),
internal admin ports, or — with a `file://` scheme — read the container's
filesystem.

This module enforces:
  * https only for remote fetches (no file://, gopher://, ftp://, data://)
  * every resolved A/AAAA record must be a public unicast address
  * redirects are followed manually so each hop is re-validated
  * responses are streamed with a hard byte ceiling

Files this application itself wrote are addressed with an internal
`storage://<key>` URL and resolved through `resolve_storage_path()`, which
confines them to UPLOAD_DIR. User input never reaches that path.

Residual risk: DNS rebinding (a host whose record flips to a private IP between
our resolution and httpx's). Closing that fully requires pinning the connection
to the validated IP while preserving TLS SNI. The exposure is narrow and the
mitigation is tracked separately; everything else is closed here.
"""

from __future__ import annotations

import ipaddress
import logging
import os
import socket
from typing import List, Tuple
from urllib.parse import urlparse, urlunparse

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# Scheme used for files this backend stored itself. Never accepted from clients.
STORAGE_SCHEME = "storage"

_ALLOWED_REMOTE_SCHEMES = {"https"}
_MAX_REDIRECTS = 3
_CONNECT_TIMEOUT = 10.0
_READ_TIMEOUT = 60.0


class UnsafeURLError(ValueError):
    """Raised when a URL is rejected by the SSRF guard."""


# ── IP address classification ──────────────────────────────────────────────────


def _normalize(ip: ipaddress._BaseAddress) -> ipaddress._BaseAddress:
    """Unwrap IPv4-mapped IPv6 (::ffff:169.254.169.254) to its IPv4 form."""
    if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped is not None:
        return ip.ipv4_mapped
    return ip


def _is_blocked(ip: ipaddress._BaseAddress) -> bool:
    """
    True for any address that is not a public unicast destination.

    `is_global` is the deny-by-default gate: it is False for RFC1918, loopback,
    link-local (169.254.169.254 metadata), CGNAT 100.64/10, TEST-NET, benchmark
    and reserved ranges alike. Note that `is_private` alone is NOT sufficient —
    on Python 3.11 it returns False for 100.64.0.0/10, which would let a request
    through to a carrier-grade NAT neighbour.

    The explicit flags are kept as belt-and-braces for multicast/unspecified,
    which some address classes report inconsistently across versions.
    """
    ip = _normalize(ip)
    return not ip.is_global or ip.is_multicast or ip.is_unspecified  # 0.0.0.0, ::


def _resolve_all(host: str, port: int) -> List[str]:
    """Resolve a hostname to every address it currently points at."""
    try:
        infos = socket.getaddrinfo(host, port, proto=socket.IPPROTO_TCP)
    except socket.gaierror as e:
        raise UnsafeURLError(f"Could not resolve host: {host}") from e
    return sorted({info[4][0] for info in infos})


# ── Public URL validation ──────────────────────────────────────────────────────


def validate_public_url(url: str) -> str:
    """
    Validate that `url` is safe for this server to fetch.

    Returns the normalized URL. Raises UnsafeURLError on anything suspicious.
    """
    try:
        parsed = urlparse(url)
    except Exception as e:
        raise UnsafeURLError("Malformed URL") from e

    if parsed.scheme not in _ALLOWED_REMOTE_SCHEMES:
        raise UnsafeURLError(
            f"URL scheme '{parsed.scheme}' is not allowed. Only https:// URLs "
            f"may be fetched."
        )

    host = parsed.hostname
    if not host:
        raise UnsafeURLError("URL is missing a hostname")

    if parsed.username or parsed.password:
        raise UnsafeURLError("Credentials in URLs are not allowed")

    port = parsed.port or 443

    # A literal IP in the URL is checked directly; a name is checked against
    # every address it resolves to, so a round-robin record cannot smuggle one
    # internal address through.
    for addr in _resolve_all(host, port):
        try:
            ip = ipaddress.ip_address(addr)
        except ValueError:
            raise UnsafeURLError(f"Unparseable address for host {host}: {addr}")
        if _is_blocked(ip):
            logger.warning(
                "SSRF guard rejected %s — resolves to non-public address %s",
                host,
                addr,
            )
            raise UnsafeURLError(
                "URL resolves to a non-public network address and cannot be fetched"
            )

    return urlunparse(parsed)


# ── Guarded download ───────────────────────────────────────────────────────────


async def fetch_remote_file(url: str, max_bytes: int) -> bytes:
    """
    Fetch a validated https URL, streaming with a hard size ceiling.

    Redirects are resolved manually so every hop passes validate_public_url();
    httpx's own follow_redirects would jump to an internal address unchecked.
    """
    current = validate_public_url(url)
    timeout = httpx.Timeout(_READ_TIMEOUT, connect=_CONNECT_TIMEOUT)

    async with httpx.AsyncClient(timeout=timeout, follow_redirects=False) as client:
        for _ in range(_MAX_REDIRECTS + 1):
            async with client.stream("GET", current) as response:
                if response.is_redirect:
                    location = response.headers.get("location")
                    if not location:
                        raise UnsafeURLError("Redirect response without a Location")
                    # Re-validate the hop before following it.
                    current = validate_public_url(
                        str(httpx.URL(current).join(location))
                    )
                    continue

                response.raise_for_status()

                # Trust but verify: reject an oversized declared length early,
                # then enforce the real ceiling while streaming.
                declared = response.headers.get("content-length")
                if declared and declared.isdigit() and int(declared) > max_bytes:
                    raise UnsafeURLError(
                        f"Remote file exceeds the {max_bytes // (1024 * 1024)}MB limit"
                    )

                chunks: List[bytes] = []
                total = 0
                async for chunk in response.aiter_bytes():
                    total += len(chunk)
                    if total > max_bytes:
                        raise UnsafeURLError(
                            f"Remote file exceeds the "
                            f"{max_bytes // (1024 * 1024)}MB limit"
                        )
                    chunks.append(chunk)
                return b"".join(chunks)

    raise UnsafeURLError("Too many redirects")


# ── Internal storage resolution ────────────────────────────────────────────────


def build_storage_url(key: str) -> str:
    """Build the internal URL for a file this backend stored under UPLOAD_DIR."""
    return f"{STORAGE_SCHEME}://{key}"


def resolve_storage_path(file_url: str) -> str:
    """
    Resolve an internal storage:// URL (or a legacy file:// URL from before this
    guard existed) to a real path, confined to UPLOAD_DIR.

    Traversal attempts and symlinks pointing outside the upload root are
    rejected — realpath() is compared against the resolved upload root, so
    `storage://../../etc/passwd` cannot escape.
    """
    parsed = urlparse(file_url)

    if parsed.scheme == STORAGE_SCHEME:
        # storage://name.pdf parses as netloc='name.pdf', path=''
        raw = f"{parsed.netloc}{parsed.path}"
    elif parsed.scheme == "file":
        raw = parsed.path
        if os.name == "nt" and raw.startswith("/"):
            raw = raw[1:]
    else:
        raise UnsafeURLError(f"Not an internal storage URL: {parsed.scheme}")

    if not raw:
        raise UnsafeURLError("Storage URL is missing a key")

    upload_root = os.path.realpath(settings.UPLOAD_DIR)

    # Legacy file:// rows hold an absolute path; storage:// rows hold a bare key.
    candidate = raw if os.path.isabs(raw) else os.path.join(upload_root, raw)
    resolved = os.path.realpath(candidate)

    if not (resolved == upload_root or resolved.startswith(upload_root + os.sep)):
        logger.warning("Storage path escape attempt: %s -> %s", file_url, resolved)
        raise UnsafeURLError("Storage path resolves outside the upload directory")

    if not os.path.isfile(resolved):
        raise UnsafeURLError("Stored file no longer exists")

    return resolved


def is_internal_storage_url(file_url: str) -> bool:
    """True if this URL refers to a file this backend stored itself."""
    return urlparse(file_url).scheme in (STORAGE_SCHEME, "file")


def storage_key_from_url(file_url: str) -> str:
    """
    Extract the bare object key from an internal storage URL.

    This is the name used both for the file inside UPLOAD_DIR and for the
    object in durable storage, so the two stay addressable by the same value.
    Legacy file:// rows hold an absolute path; only its basename is meaningful
    as a key.
    """
    parsed = urlparse(file_url)

    if parsed.scheme == STORAGE_SCHEME:
        raw = f"{parsed.netloc}{parsed.path}"
    elif parsed.scheme == "file":
        raw = parsed.path
        if os.name == "nt" and raw.startswith("/"):
            raw = raw[1:]
    else:
        raise UnsafeURLError(f"Not an internal storage URL: {parsed.scheme}")

    key = os.path.basename(raw)
    if not key:
        raise UnsafeURLError("Storage URL is missing a key")

    return key
