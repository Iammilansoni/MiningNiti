"""
LLM Provider Initialization
Configures and exposes asynchronous clients for multiple AI providers.
"""

import google.generativeai as genai
from cerebras.cloud.sdk import AsyncCerebras
from openai import AsyncOpenAI

from app.config import settings

# Initialize Groq client using OpenAI compatibility wrapper
groq_client = AsyncOpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=settings.GROQ_API_KEY
)

# Initialize Mistral client using OpenAI compatibility wrapper
mistral_client = AsyncOpenAI(
    base_url="https://api.mistral.ai/v1",
    api_key=settings.MISTRAL_API_KEY
)

# Configure native Gemini API globally
genai.configure(api_key=settings.GEMINI_API_KEY)

def get_groq_client() -> AsyncOpenAI:
    return groq_client

def get_mistral_client() -> AsyncOpenAI:
    return mistral_client

# Initialize Cerebras client
cerebras_client = AsyncCerebras(
    api_key=settings.CEREBRAS_API_KEY
)

def get_cerebras_client() -> AsyncCerebras:
    return cerebras_client
