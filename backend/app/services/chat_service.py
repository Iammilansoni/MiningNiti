"""
Chat Service
RAG-powered conversation with document context
"""

import asyncio
import logging
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
from sqlalchemy.orm import Session

import google.generativeai as genai

from app.config import settings
from app.models.document import Document, DocumentEmbedding, DocumentStatus

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class ChatService:
    """
    Chat service with RAG (Retrieval Augmented Generation).
    Finds relevant document chunks and generates contextual responses.
    """
    
    def __init__(self):
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        self.embedding_model = settings.EMBEDDING_MODEL
        
        # Mining-focused system prompt
        self.system_prompt = """You are MiningNiti AI, an expert assistant specialized in the coal mining industry.

Your expertise includes:
- Mining safety regulations (MSHA, OSHA compliance)
- Equipment operation and maintenance
- Geological and environmental analysis
- Incident investigation and prevention
- Regulatory compliance and permits

When answering questions:
1. Always prioritize safety information
2. Reference specific regulations when applicable
3. Provide practical, actionable guidance
4. Cite your sources from the provided document context
5. If information is not in the context, clearly state that

You have access to the user's uploaded mining documents. Use the provided context to give accurate, helpful answers.
"""
    
    async def generate_response(
        self,
        query: str,
        user_id: str,
        document_ids: Optional[List[str]] = None,
        db: Session = None
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Generate AI response using RAG.
        
        Args:
            query: User's question
            user_id: Current user ID
            document_ids: Optional filter for specific documents
            db: Database session
            
        Returns:
            Tuple of (response_text, list_of_sources)
        """
        try:
            # Get query embedding
            query_embedding = await self._get_embedding(query)
            
            # Find relevant document chunks
            relevant_chunks = await self._find_relevant_chunks(
                query_embedding=query_embedding,
                user_id=user_id,
                document_ids=document_ids,
                db=db,
                top_k=5
            )
            
            # Format context
            context = self._format_context(relevant_chunks)
            
            # Build prompt
            prompt = f"""{self.system_prompt}

## Document Context:
{context}

## User Question:
{query}

## Instructions:
Provide a helpful, accurate answer based on the document context above. If the context doesn't contain relevant information, acknowledge this and provide general mining industry guidance.
"""
            
            # Generate response
            response = self.model.generate_content(prompt)
            answer = response.text
            
            # Format sources for response
            sources = [
                {
                    "document_id": chunk["document_id"],
                    "document_title": chunk["document_title"],
                    "chunk_text": chunk["text"][:300] + "..." if len(chunk["text"]) > 300 else chunk["text"],
                    "relevance_score": chunk["score"],
                    "page": chunk.get("page")
                }
                for chunk in relevant_chunks[:3]  # Top 3 sources
            ]
            
            return answer, sources
            
        except Exception as e:
            logger.error(f"Chat generation error: {e}")
            return (
                "I apologize, but I encountered an error processing your question. Please try again.",
                []
            )
    
    async def _get_embedding(self, text: str) -> List[float]:
        """Get embedding for text using Gemini"""
        try:
            result = await asyncio.to_thread(
                genai.embed_content,
                model=settings.EMBEDDING_MODEL,
                content=text
            )
            return result["embedding"]
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return []
    
    async def _find_relevant_chunks(
        self,
        query_embedding: List[float],
        user_id: str,
        document_ids: Optional[List[str]],
        db: Session,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Find most relevant document chunks using cosine similarity"""
        
        # Query embeddings from database
        query = db.query(DocumentEmbedding).join(Document).filter(
            Document.user_id == user_id,
            Document.status == DocumentStatus.COMPLETED
        )
        
        if document_ids:
            query = query.filter(Document.id.in_(document_ids))
        
        embeddings = query.all()
        
        if not embeddings:
            return []
        
        # Calculate similarities
        query_vec = np.array(query_embedding)
        results = []
        
        for emb in embeddings:
            try:
                stored_vec = np.array(emb.embedding)
                similarity = self._cosine_similarity(query_vec.tolist(), stored_vec.tolist())
                
                results.append({
                    "document_id": str(emb.document_id),
                    "document_title": emb.document.title,
                    "text": emb.chunk_text,
                    "score": float(similarity),
                    "page": emb.start_page
                })
            except Exception as e:
                logger.warning(f"Error processing embedding {emb.id}: {e}")
                continue
        
        # Sort by similarity and return top_k
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        if len(vec1) != len(vec2):
            return 0.0
        
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = sum(a * a for a in vec1) ** 0.5
        norm2 = sum(b * b for b in vec2) ** 0.5
        
        # Guard against division by zero
        if norm1 == 0.0 or norm2 == 0.0:
            return 0.0
        
        return dot_product / (norm1 * norm2)
    
    def _format_context(self, chunks: List[Dict[str, Any]]) -> str:
        """Format relevant chunks into context string"""
        if not chunks:
            return "No relevant document context found."
        
        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            context_parts.append(f"""
### Source {i}: {chunk['document_title']}
{chunk['text']}
---
""")
        
        return "\n".join(context_parts)
    
    def get_mining_suggestions(self) -> List[str]:
        """Get suggested mining-related questions"""
        return [
            "What are the MSHA requirements for underground coal mines?",
            "How often should mining equipment be inspected?",
            "What are the emergency evacuation procedures?",
            "What are the ventilation requirements for coal mines?",
            "How to conduct a proper safety audit?"
        ]
