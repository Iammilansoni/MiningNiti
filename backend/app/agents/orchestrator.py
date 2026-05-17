"""
Agent Orchestrator
Coordinates multi-agent document analysis pipeline
"""

import logging
import asyncio
from typing import Any, Dict, Optional
from datetime import datetime

from app.agents.classifier import ClassifierAgent
from app.agents.safety_analyzer import SafetyAnalyzerAgent
from app.agents.entity_extractor import EntityExtractorAgent
from app.agents.summarizer import SummarizerAgent

logger = logging.getLogger(__name__)


class AgentOrchestrator:
    """
    Multi-Agent Orchestrator for Document Intelligence.
    
    Coordinates the execution of specialized agents in a pipeline:
    1. Classifier Agent - Categorizes document
    2. Safety Analyzer Agent - Checks compliance (runs in parallel with 3 & 4)
    3. Entity Extractor Agent - Extracts entities (runs in parallel)
    4. Summarizer Agent - Creates summary (runs in parallel)
    
    The orchestrator optimizes execution by running independent agents
    concurrently while respecting dependencies.
    """
    
    def __init__(self):
        self.classifier = ClassifierAgent()
        self.safety_analyzer = SafetyAnalyzerAgent()
        self.entity_extractor = EntityExtractorAgent()
        self.summarizer = SummarizerAgent()
    
    async def analyze_document(self, text: str) -> Dict[str, Any]:
        """
        Run full multi-agent analysis pipeline on document.
        
        Args:
            text: Document text content
            
        Returns:
            Aggregated results from all agents:
            {
                "classification": {...},
                "safety": {...},
                "entities": {...},
                "summary": {...},
                "metadata": {...}
            }
        """
        start_time = datetime.utcnow()
        logger.info("Starting multi-agent document analysis")
        
        try:
            # Step 1: Classification (needed for context)
            logger.info("Running Classifier Agent...")
            classification = await self.classifier.analyze(text)
            
            category = classification.get("category")
            context = {"category": category.value if hasattr(category, 'value') else str(category)}
            
            # Step 2: Run remaining agents in parallel
            logger.info("Running parallel agents (Safety, Entity, Summary)...")
            
            safety_task = asyncio.create_task(
                self.safety_analyzer.analyze(text, context)
            )
            entity_task = asyncio.create_task(
                self.entity_extractor.analyze(text, context)
            )
            summary_task = asyncio.create_task(
                self.summarizer.analyze(text, context)
            )
            
            # Wait for all parallel tasks
            safety, entities, summary = await asyncio.gather(
                safety_task,
                entity_task,
                summary_task,
                return_exceptions=True
            )
            
            # Handle any exceptions
            if isinstance(safety, Exception):
                logger.error(f"Safety analysis failed: {safety}")
                safety = {"error": str(safety)}
            
            if isinstance(entities, Exception):
                logger.error(f"Entity extraction failed: {entities}")
                entities = {"error": str(entities)}
            
            if isinstance(summary, Exception):
                logger.error(f"Summarization failed: {summary}")
                summary = {"error": str(summary)}
            
            end_time = datetime.utcnow()
            processing_time_ms = int((end_time - start_time).total_seconds() * 1000)
            
            logger.info(f"Multi-agent analysis completed in {processing_time_ms}ms")
            
            return {
                "classification": classification,
                "safety": safety,
                "entities": entities,
                "summary": summary,
                "metadata": {
                    "processing_time_ms": processing_time_ms,
                    "agents_used": ["classifier", "safety_analyzer", "entity_extractor", "summarizer"],
                    "analyzed_at": end_time.isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Orchestrator failed: {e}")
            return {
                "error": str(e),
                "metadata": {
                    "failed": True,
                    "error_message": str(e)
                }
            }
    
    async def analyze_for_safety_only(self, text: str) -> Dict[str, Any]:
        """
        Quick safety-only analysis for real-time checks.
        """
        return await self.safety_analyzer.analyze(text)
    
    async def classify_only(self, text: str) -> Dict[str, Any]:
        """
        Quick classification only.
        """
        return await self.classifier.analyze(text)
