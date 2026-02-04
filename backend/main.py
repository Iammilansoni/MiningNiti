"""
MiningNiti FastAPI Backend
RAG-powered API for mining regulations Q&A with streaming support
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import os
import shutil
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import RAG components
from rag.pdf_processor import pdf_processor
from rag.embeddings import vector_store
from rag.chain import rag_chain

# Create uploads directory
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize FastAPI app
app = FastAPI(
    title="MiningNiti API",
    description="RAG-powered API for Indian mining regulations",
    version="1.0.0"
)

# CORS configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "https://miningniti.vercel.app",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class ChatRequest(BaseModel):
    input_query: str
    source: Optional[str] = "database"  # database, internet, both


class ChatResponse(BaseModel):
    answer: str
    sources: list


class UploadResponse(BaseModel):
    success: bool
    message: str
    filename: str
    chunks_indexed: int


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "documents_indexed": not vector_store.is_empty()
    }


# Streaming chat endpoint
@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Chat endpoint with streaming response
    
    Returns Server-Sent Events with tokens and sources
    """
    async def generate():
        try:
            async for chunk in rag_chain.query_stream(request.input_query):
                yield chunk
        except Exception as e:
            yield f"\n\nError: {str(e)}"
    
    return StreamingResponse(
        generate(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


# Non-streaming chat (for backward compatibility)
@app.post("/chat/sync", response_model=ChatResponse)
async def chat_sync(request: ChatRequest):
    """Non-streaming chat endpoint"""
    result = rag_chain.query(request.input_query)
    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"]
    )


# PDF upload endpoint
@app.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF and index it for RAG
    
    - Extracts text from PDF
    - Chunks into 1000-char segments with 150 overlap
    - Creates embeddings and stores in FAISS
    """
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )
    
    # Save uploaded file
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Process and index the PDF
    try:
        # Extract and chunk
        chunks = pdf_processor.process_pdf(file_path)
        
        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from this PDF"
            )
        
        # Add to vector store
        num_indexed = vector_store.add_documents(chunks)
        
        return UploadResponse(
            success=True,
            message=f"Successfully indexed {num_indexed} chunks from {file.filename}",
            filename=file.filename,
            chunks_indexed=num_indexed
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process PDF: {str(e)}"
        )


# Legacy endpoint for PDF text extraction (backward compatibility)
@app.post("/extract_text_from_pdf")
async def extract_text_from_pdf(file: UploadFile = File(...)):
    """Legacy endpoint - extracts text from PDF"""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        pages = pdf_processor.extract_text_from_pdf(file_path)
        full_text = "\n\n".join([p["text"] for p in pages])
        
        return {"text": full_text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
