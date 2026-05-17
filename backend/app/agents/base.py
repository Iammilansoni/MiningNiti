"""
Base Agent
Abstract base class for all mining intelligence agents
"""

import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
import json
import re

import google.generativeai as genai

from app.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class BaseAgent(ABC):
    """
    Abstract base class for mining document intelligence agents.
    
    Each agent is responsible for a specific analysis task:
    - Classification
    - Safety Analysis
    - Entity Extraction
    - Summarization
    """
    
    def __init__(self, model_name: str = None):
        self.model = genai.GenerativeModel(model_name or settings.GEMINI_MODEL)
        self.name = self.__class__.__name__
    
    @abstractmethod
    async def analyze(self, text: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Analyze document text and return structured results.
        
        Args:
            text: Document text content
            context: Additional context (e.g., document category)
            
        Returns:
            Dictionary with agent-specific analysis results
        """
        pass
    
    @property
    @abstractmethod
    def system_prompt(self) -> str:
        """System prompt defining the agent's role and capabilities"""
        pass
    
    def _generate(self, prompt: str) -> str:
        """Generate response from LLM"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"{self.name} generation failed: {e}")
            raise
    
    def _parse_json(self, text: str) -> Dict[str, Any]:
        """Parse JSON from LLM response, handling markdown code blocks"""
        text = text.strip()
        
        # Remove markdown code blocks
        if text.startswith("```"):
            lines = text.split("\n")
            json_lines = []
            in_block = False
            for line in lines:
                if line.startswith("```"):
                    in_block = not in_block
                    continue
                json_lines.append(line)
            text = "\n".join(json_lines)
        
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Try to find JSON object in text
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except json.JSONDecodeError:
                    pass
            
            logger.warning(f"{self.name}: Failed to parse JSON response")
            return {}
    
    def _truncate_text(self, text: str, max_chars: int = 5000) -> str:
        """Truncate text to max characters for LLM context"""
        if len(text) <= max_chars:
            return text
        return text[:max_chars] + "\n\n[... document truncated for analysis ...]"
