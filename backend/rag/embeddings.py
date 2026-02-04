"""
Vector Store for MiningNiti RAG Pipeline
Handles FAISS indexing and similarity search
"""

from typing import List, Dict, Any, Optional
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.schema import Document
import os

# Directory for storing FAISS index
FAISS_INDEX_PATH = os.path.join(os.path.dirname(__file__), "..", "faiss_index")


class VectorStore:
    """FAISS-based vector store with HuggingFace embeddings"""
    
    def __init__(self):
        # Use a small, fast embedding model
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"}
        )
        self.vectorstore: Optional[FAISS] = None
        self._load_existing_index()
    
    def _load_existing_index(self):
        """Load existing FAISS index if available"""
        if os.path.exists(FAISS_INDEX_PATH):
            try:
                self.vectorstore = FAISS.load_local(
                    FAISS_INDEX_PATH, 
                    self.embeddings,
                    allow_dangerous_deserialization=True
                )
                print(f"✅ Loaded existing FAISS index from {FAISS_INDEX_PATH}")
            except Exception as e:
                print(f"⚠️ Could not load existing index: {e}")
                self.vectorstore = None
    
    def add_documents(self, chunks: List[Dict[str, Any]]) -> int:
        """
        Add document chunks to the vector store
        
        Args:
            chunks: List of chunk dicts with text and metadata
            
        Returns:
            Number of chunks added
        """
        # Convert chunks to LangChain Documents
        documents = [
            Document(
                page_content=chunk["text"],
                metadata={
                    "file": chunk["file"],
                    "page": chunk["page"],
                    "chunk_id": chunk["chunk_id"]
                }
            )
            for chunk in chunks
        ]
        
        if self.vectorstore is None:
            # Create new vector store
            self.vectorstore = FAISS.from_documents(documents, self.embeddings)
        else:
            # Add to existing vector store
            self.vectorstore.add_documents(documents)
        
        # Save the index
        self._save_index()
        
        return len(documents)
    
    def _save_index(self):
        """Persist FAISS index to disk"""
        if self.vectorstore:
            os.makedirs(FAISS_INDEX_PATH, exist_ok=True)
            self.vectorstore.save_local(FAISS_INDEX_PATH)
            print(f"✅ Saved FAISS index to {FAISS_INDEX_PATH}")
    
    def similarity_search(self, query: str, k: int = 4) -> List[Dict[str, Any]]:
        """
        Search for similar documents
        
        Args:
            query: Search query
            k: Number of results to return
            
        Returns:
            List of results with content and metadata
        """
        if self.vectorstore is None:
            return []
        
        docs = self.vectorstore.similarity_search(query, k=k)
        
        results = []
        for doc in docs:
            results.append({
                "content": doc.page_content,
                "file": doc.metadata.get("file", "unknown"),
                "page": doc.metadata.get("page", 0),
                "chunk_id": doc.metadata.get("chunk_id", "")
            })
        
        return results
    
    def get_retriever(self, k: int = 4):
        """Get a retriever for use with LangChain chains"""
        if self.vectorstore is None:
            raise ValueError("No documents indexed yet. Please upload a PDF first.")
        return self.vectorstore.as_retriever(search_kwargs={"k": k})
    
    def is_empty(self) -> bool:
        """Check if the vector store has any documents"""
        return self.vectorstore is None


# Singleton instance
vector_store = VectorStore()
