"""
RAG Chain for MiningNiti
Handles query processing with context retrieval and streaming LLM responses
"""

from typing import List, Dict, Any, AsyncGenerator
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import StrOutputParser
from .embeddings import vector_store
import os
from dotenv import load_dotenv

load_dotenv()


# System prompt for the RAG chain
SYSTEM_PROMPT = """You are MiningNiti AI, an expert assistant specialized in Indian mining regulations, 
safety guidelines, DGMS circulars, and mining compliance. 

Use the following context from official mining documents to answer the user's question.
If the context doesn't contain relevant information, say so honestly but try to provide 
general guidance based on your knowledge of mining regulations.

Be concise, accurate, and cite specific regulations when applicable.

Context:
{context}

Question: {question}

Answer:"""


class RAGChain:
    """RAG Chain with streaming support and source tracking"""
    
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0.7,
            streaming=True
        )
        
        self.prompt = ChatPromptTemplate.from_template(SYSTEM_PROMPT)
        self.output_parser = StrOutputParser()
    
    def _format_context(self, docs: List[Dict[str, Any]]) -> str:
        """Format retrieved documents as context string"""
        context_parts = []
        for i, doc in enumerate(docs, 1):
            context_parts.append(
                f"[Source {i}: {doc['file']}, Page {doc['page']}]\n{doc['content']}"
            )
        return "\n\n".join(context_parts)
    
    def _extract_sources(self, docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract unique sources from retrieved documents"""
        seen = set()
        sources = []
        for doc in docs:
            key = (doc["file"], doc["page"])
            if key not in seen:
                seen.add(key)
                sources.append({
                    "file": doc["file"],
                    "page": doc["page"]
                })
        return sources
    
    async def query_stream(self, question: str, k: int = 4) -> AsyncGenerator[str, None]:
        """
        Query the RAG system with streaming response
        
        Args:
            question: User's question
            k: Number of documents to retrieve
            
        Yields:
            Tokens as they are generated, followed by sources JSON
        """
        # Retrieve relevant documents
        docs = vector_store.similarity_search(question, k=k)
        
        if not docs:
            yield "I don't have any documents indexed yet. Please upload a PDF first to get started."
            yield "\n\n[SOURCES][]"
            return
        
        # Format context and sources
        context = self._format_context(docs)
        sources = self._extract_sources(docs)
        
        # Create the chain
        chain = self.prompt | self.llm | self.output_parser
        
        # Stream the response
        async for chunk in chain.astream({
            "context": context,
            "question": question
        }):
            yield chunk
        
        # Yield sources at the end (special format for frontend parsing)
        import json
        yield f"\n\n[SOURCES]{json.dumps(sources)}"
    
    def query(self, question: str, k: int = 4) -> Dict[str, Any]:
        """
        Non-streaming query (for testing)
        
        Returns:
            Dict with answer and sources
        """
        docs = vector_store.similarity_search(question, k=k)
        
        if not docs:
            return {
                "answer": "I don't have any documents indexed yet. Please upload a PDF first.",
                "sources": []
            }
        
        context = self._format_context(docs)
        sources = self._extract_sources(docs)
        
        chain = self.prompt | self.llm | self.output_parser
        
        answer = chain.invoke({
            "context": context,
            "question": question
        })
        
        return {
            "answer": answer,
            "sources": sources
        }


# Singleton instance
rag_chain = RAGChain()
