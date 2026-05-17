"""
Document Service
Document processing with AI agents for classification, safety analysis, and entity extraction
"""

import logging
import json
import tempfile
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional
import httpx

# Document processing
from pdfminer.high_level import extract_text as extract_pdf_text
from docx import Document as DocxDocument

import google.generativeai as genai
import numpy as np

from app.config import settings
from app.db.session import get_db_context
from app.models.document import Document, DocumentEmbedding, DocumentStatus, DocumentCategory, ComplianceStatus

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class DocumentService:
    """
    Document processing service with multi-agent AI analysis.
    
    Agents:
    1. Classifier Agent - Categorizes document type
    2. Safety Analyzer Agent - Checks safety compliance
    3. Entity Extractor Agent - Extracts mining entities
    4. Summarizer Agent - Creates document summary
    """
    
    def __init__(self):
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        self.embedding_model = settings.EMBEDDING_MODEL
    
    async def process_document(self, document_id: str) -> bool:
        """
        Full document processing pipeline.
        
        1. Extract text content
        2. Chunk text for embeddings
        3. Generate embeddings
        4. Run AI classification
        5. Run safety analysis
        6. Extract entities
        7. Generate summary
        """
        logger.info(f"Starting document processing: {document_id}")
        
        with get_db_context() as db:
            document = db.query(Document).filter(Document.id == document_id).first()
            
            if not document:
                logger.error(f"Document not found: {document_id}")
                return False
            
            try:
                # Update status
                document.status = DocumentStatus.PROCESSING
                db.commit()
                
                # Step 1: Download and extract text
                logger.info(f"Extracting text from: {document.file_url}")
                text_content = await self._download_and_extract(
                    document.file_url,
                    document.file_type
                )
                
                if not text_content:
                    raise ValueError("No text content extracted from document")
                
                document.content = text_content
                document.word_count = len(text_content.split())
                db.commit()
                
                # Step 2: Chunk text
                chunks = self._chunk_text(text_content)
                logger.info(f"Created {len(chunks)} chunks")
                
                # Step 3: Generate embeddings
                embeddings = await self._generate_embeddings(chunks)
                
                # Save embeddings
                for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                    doc_embedding = DocumentEmbedding(
                        document_id=document.id,
                        chunk_index=i,
                        chunk_text=chunk,
                        embedding=embedding
                    )
                    db.add(doc_embedding)
                
                db.commit()
                
                # Update status to analyzing
                document.status = DocumentStatus.ANALYZING
                db.commit()
                
                # Step 4: AI Analysis Pipeline (Multi-Agent)
                logger.info("Running AI analysis pipeline...")
                
                # Agent 1: Classification
                classification = await self._classify_document(text_content)
                document.category = classification.get("category")
                document.subcategory = classification.get("subcategory")
                document.classification_confidence = classification.get("confidence", 0.0)
                
                # Agent 2: Safety Analysis
                safety = await self._analyze_safety(text_content, document.category)
                document.safety_score = safety.get("score")
                document.compliance_status = safety.get("status")
                document.hazards_detected = safety.get("hazards", [])
                document.safety_recommendations = safety.get("recommendations", [])
                
                # Agent 3: Entity Extraction
                entities = await self._extract_entities(text_content)
                document.entities = entities
                
                # Agent 4: Summarization
                summary = await self._generate_summary(text_content, document.category)
                document.summary = summary.get("summary")
                document.key_points = summary.get("key_points", [])
                
                # Mark as completed
                document.status = DocumentStatus.COMPLETED
                document.processed_at = datetime.utcnow()
                db.commit()
                
                logger.info(f"Document processing completed: {document_id}")
                return True
                
            except Exception as e:
                logger.error(f"Document processing failed: {document_id} - {e}")
                document.status = DocumentStatus.FAILED
                document.processing_error = str(e)
                db.commit()
                return False
    
    async def _download_and_extract(self, file_url: str, file_type: str) -> str:
        """Download file and extract text content"""
        async with httpx.AsyncClient() as client:
            response = await client.get(file_url, timeout=60.0)
            response.raise_for_status()
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=self._get_extension(file_type)) as tmp:
                tmp.write(response.content)
                tmp_path = tmp.name
        
        try:
            if "pdf" in file_type.lower():
                return extract_pdf_text(tmp_path)
            elif "docx" in file_type.lower() or "word" in file_type.lower():
                doc = DocxDocument(tmp_path)
                return "\n".join([para.text for para in doc.paragraphs])
            else:
                # Plain text
                with open(tmp_path, "r", encoding="utf-8", errors="ignore") as f:
                    return f.read()
        finally:
            import os
            os.unlink(tmp_path)
    
    def _get_extension(self, file_type: str) -> str:
        """Get file extension from MIME type"""
        extensions = {
            "application/pdf": ".pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
            "text/plain": ".txt"
        }
        return extensions.get(file_type, ".tmp")
    
    def _chunk_text(
        self,
        text: str,
        chunk_size: int = None,
        overlap: int = None
    ) -> List[str]:
        """Split text into overlapping chunks"""
        chunk_size = chunk_size or settings.CHUNK_SIZE
        overlap = overlap or settings.CHUNK_OVERLAP
        
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk)
        
        return chunks
    
    async def _generate_embeddings(self, chunks: List[str]) -> List[List[float]]:
        """Generate embeddings for text chunks"""
        embeddings = []

        for i, chunk in enumerate(chunks):
            try:
                result = genai.embed_content(
                    model=self.embedding_model,
                    content=chunk,
                    task_type="retrieval_document"
                )
                embeddings.append(result["embedding"])
            except Exception as e:
                logger.warning(f"Embedding generation failed for chunk {i}: {e}")
                # Mark as failed embedding instead of zero vector
                embeddings.append(None)  # Downstream consumers should handle None

        return embeddings
    
    async def _classify_document(self, text: str) -> Dict[str, Any]:
        """Agent 1: Classify document into mining categories"""
        prompt = f"""You are a document classification agent for the mining industry.

Analyze this document and classify it into one of these categories:
- safety_protocol: Safety procedures, protocols, guidelines
- equipment_manual: Equipment operation, maintenance manuals
- regulatory: MSHA, OSHA, EPA regulations and compliance documents
- incident_report: Accident reports, incident investigations
- geological: Drill logs, assay reports, geological surveys
- environmental: Environmental impact, monitoring reports
- training: Training materials, certifications
- permit: Mining permits, licenses
- maintenance: Maintenance logs, schedules
- other: Documents that don't fit other categories

Document text (first 3000 chars):
{text[:3000]}

Respond in JSON format:
{{
  "category": "category_name",
  "subcategory": "more specific type if applicable",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}}
"""
        try:
            response = self.model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            
            # Map to enum
            category_map = {
                "safety_protocol": DocumentCategory.SAFETY_PROTOCOL,
                "equipment_manual": DocumentCategory.EQUIPMENT_MANUAL,
                "regulatory": DocumentCategory.REGULATORY,
                "incident_report": DocumentCategory.INCIDENT_REPORT,
                "geological": DocumentCategory.GEOLOGICAL,
                "environmental": DocumentCategory.ENVIRONMENTAL,
                "training": DocumentCategory.TRAINING,
                "permit": DocumentCategory.PERMIT,
                "maintenance": DocumentCategory.MAINTENANCE,
                "other": DocumentCategory.OTHER
            }
            
            return {
                "category": category_map.get(result.get("category"), DocumentCategory.OTHER),
                "subcategory": result.get("subcategory"),
                "confidence": float(result.get("confidence", 0.5))
            }
        except Exception as e:
            logger.error(f"Classification failed: {e}")
            return {"category": DocumentCategory.OTHER, "subcategory": None, "confidence": 0.0}
    
    async def _analyze_safety(self, text: str, category: DocumentCategory) -> Dict[str, Any]:
        """Agent 2: Analyze safety compliance and hazards"""
        prompt = f"""You are a mining safety analysis agent.

Analyze this mining document for safety concerns, compliance issues, and hazards.

Document category: {category.value if category else 'unknown'}
Document text (first 5000 chars):
{text[:5000]}

Evaluate:
1. Overall safety score (0-100, where 100 is perfectly safe/compliant)
2. Compliance status: "compliant", "warning", or "violation"
3. List any hazards or safety concerns mentioned
4. Provide safety recommendations

Respond in JSON format:
{{
  "score": 0-100,
  "status": "compliant|warning|violation",
  "hazards": [
    {{"type": "hazard type", "severity": "low|medium|high", "description": "details"}}
  ],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "reasoning": "explanation of analysis"
}}
"""
        try:
            response = self.model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            
            status_map = {
                "compliant": ComplianceStatus.COMPLIANT,
                "warning": ComplianceStatus.WARNING,
                "violation": ComplianceStatus.VIOLATION
            }
            
            return {
                "score": float(result.get("score", 50)),
                "status": status_map.get(result.get("status"), ComplianceStatus.PENDING),
                "hazards": result.get("hazards", []),
                "recommendations": result.get("recommendations", [])
            }
        except Exception as e:
            logger.error(f"Safety analysis failed: {e}")
            return {
                "score": None,
                "status": ComplianceStatus.PENDING,
                "hazards": [],
                "recommendations": []
            }
    
    async def _extract_entities(self, text: str) -> Dict[str, List[str]]:
        """Agent 3: Extract mining-specific named entities"""
        prompt = f"""You are a named entity extraction agent specialized in mining documents.

Extract the following types of entities from this mining document:
- equipment: Mining equipment names and models (e.g., "Caterpillar D11", "Joy 12CM")
- chemicals: Chemical compounds, gases, minerals (e.g., "methane", "coal dust", "H2S")
- locations: Mine names, sections, areas (e.g., "Section 4B", "North Portal")
- personnel: Names, roles, departments
- dates: Important dates, deadlines, schedules
- regulations: Cited regulations (e.g., "MSHA 30 CFR 75.400", "OSHA 1910.134")

Document text (first 4000 chars):
{text[:4000]}

Respond in JSON format:
{{
  "equipment": ["item1", "item2"],
  "chemicals": ["item1", "item2"],
  "locations": ["item1", "item2"],
  "personnel": ["item1", "item2"],
  "dates": ["item1", "item2"],
  "regulations": ["item1", "item2"]
}}
"""
        try:
            response = self.model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            
            return {
                "equipment": result.get("equipment", []),
                "chemicals": result.get("chemicals", []),
                "locations": result.get("locations", []),
                "personnel": result.get("personnel", []),
                "dates": result.get("dates", []),
                "regulations": result.get("regulations", [])
            }
        except Exception as e:
            logger.error(f"Entity extraction failed: {e}")
            return {
                "equipment": [],
                "chemicals": [],
                "locations": [],
                "personnel": [],
                "dates": [],
                "regulations": []
            }
    
    async def _generate_summary(self, text: str, category: DocumentCategory) -> Dict[str, Any]:
        """Agent 4: Generate document summary and key points"""
        prompt = f"""You are a document summarization agent for mining documents.

Create a concise summary and extract key points from this mining document.

Document category: {category.value if category else 'unknown'}
Document text (first 6000 chars):
{text[:6000]}

Provide:
1. A 2-3 paragraph executive summary
2. 5-7 key bullet points

Respond in JSON format:
{{
  "summary": "Executive summary paragraph(s)",
  "key_points": [
    "Key point 1",
    "Key point 2"
  ]
}}
"""
        try:
            response = self.model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            
            return {
                "summary": result.get("summary", "Summary not available."),
                "key_points": result.get("key_points", [])
            }
        except Exception as e:
            logger.error(f"Summarization failed: {e}")
            return {"summary": "Summary generation failed.", "key_points": []}
    
    def _parse_json_response(self, text: str) -> Dict:
        """Parse JSON from AI response, handling markdown code blocks"""
        # Remove markdown code blocks if present
        text = text.strip()
        if text.startswith("```"):
            # Find the end of the code block
            lines = text.split("\n")
            json_lines = []
            in_code_block = False
            for line in lines:
                if line.startswith("```"):
                    in_code_block = not in_code_block
                    continue
                if in_code_block:
                    json_lines.append(line)
            text = "\n".join(json_lines)
        
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Try to find JSON object in text
            import re
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                return json.loads(match.group())
            return {}


async def process_document_async(document_id: str):
    """Async wrapper for document processing (used with FastAPI BackgroundTasks)"""
    service = DocumentService()
    await service.process_document(document_id)
