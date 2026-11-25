"""
LLM Provider Initialization
Configures and exposes asynchronous clients for multiple AI providers.
"""

from typing import Optional

import google.generativeai as genai
from openai import AsyncOpenAI

from app.config import settings

NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"

# Initialize Groq client using OpenAI compatibility wrapper
groq_client = AsyncOpenAI(
    base_url="https://api.groq.com/openai/v1", api_key=settings.GROQ_API_KEY
)

# Initialize Mistral client using OpenAI compatibility wrapper
mistral_client = AsyncOpenAI(
    base_url="https://api.mistral.ai/v1", api_key=settings.MISTRAL_API_KEY
)

# Configure native Gemini API globally
genai.configure(api_key=settings.GEMINI_API_KEY)


def get_groq_client() -> AsyncOpenAI:
    return groq_client


def get_mistral_client() -> AsyncOpenAI:
    return mistral_client


_nvidia_client: Optional[AsyncOpenAI] = None
_nvidia_client_key: Optional[str] = None


def get_nvidia_client() -> AsyncOpenAI:
    """Return an OpenAI-compatible client for NVIDIA NIM (lazy init avoids empty-key errors)."""
    global _nvidia_client, _nvidia_client_key
    key = settings.NVIDIA_API_KEY or "not-configured"
    if _nvidia_client is None or _nvidia_client_key != key:
        _nvidia_client = AsyncOpenAI(base_url=NVIDIA_BASE_URL, api_key=key)
        _nvidia_client_key = key
    return _nvidia_client
