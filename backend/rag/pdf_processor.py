"""
PDF Processor for MiningNiti RAG Pipeline
Handles PDF extraction, text chunking, and metadata tracking
"""

from typing import List, Dict, Any
from pypdf import PdfReader
import os
import hashlib


class PDFProcessor:
    """Process PDF files: extract text, chunk, and track metadata"""
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 150):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def extract_text_from_pdf(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Extract text from PDF with page-level metadata
        
        Returns:
            List of dicts with keys: text, page, file
        """
        reader = PdfReader(pdf_path)
        filename = os.path.basename(pdf_path)
        pages_data = []
        
        for page_num, page in enumerate(reader.pages, start=1):
            text = page.extract_text()
            if text and text.strip():
                pages_data.append({
                    "text": text.strip(),
                    "page": page_num,
                    "file": filename
                })
        
        return pages_data
    
    def chunk_text(self, pages_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Split text into overlapping chunks while preserving metadata
        
        Args:
            pages_data: List of page dicts from extract_text_from_pdf
            
        Returns:
            List of chunk dicts with keys: text, page, file, chunk_id
        """
        chunks = []
        
        for page_data in pages_data:
            text = page_data["text"]
            page = page_data["page"]
            file = page_data["file"]
            
            # Create overlapping chunks
            start = 0
            chunk_index = 0
            
            while start < len(text):
                end = start + self.chunk_size
                chunk_text = text[start:end]
                
                # Create unique chunk ID
                chunk_id = hashlib.md5(
                    f"{file}_{page}_{chunk_index}".encode()
                ).hexdigest()[:8]
                
                chunks.append({
                    "text": chunk_text,
                    "page": page,
                    "file": file,
                    "chunk_id": chunk_id
                })
                
                # Move start with overlap
                start = end - self.chunk_overlap
                chunk_index += 1
                
                # Prevent infinite loop for very small texts
                if end >= len(text):
                    break
        
        return chunks
    
    def process_pdf(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Full pipeline: extract text from PDF and chunk it
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            List of chunks with metadata
        """
        pages_data = self.extract_text_from_pdf(pdf_path)
        chunks = self.chunk_text(pages_data)
        return chunks


# Singleton instance for easy import
pdf_processor = PDFProcessor()
