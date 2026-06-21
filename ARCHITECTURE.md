# MiningNiti Architecture

MiningNiti is a production-grade Document Intelligence and RAG Chat platform tailored for the Mining Industry. It utilizes an Agentic AI workflow to extract structured data, classify documents, identify safety hazards, and provide intelligent chat over a corpus of documents.

## High-Level System Architecture

```mermaid
graph TD
    subgraph Frontend [Next.js App Router]
        UI[React UI Components]
        Dash[Dashboard View]
        Doc[Document Explorer]
        Chat[RAG Chat Interface]
        Auth1[Clerk Auth Client]
        
        UI --> Dash
        UI --> Doc
        UI --> Chat
        UI --> Auth1
    end

    subgraph Backend [FastAPI Server]
        API[API Gateway / Router]
        Auth2[Clerk Auth Middleware]
        Serv[Services Layer]
        Agent[Agent Orchestrator]
        
        API --> Auth2
        Auth2 --> Serv
        Serv --> Agent
    end

    subgraph Data [Data & Storage]
        PG[(PostgreSQL)]
        Vect[(pgvector)]
        Redis[(Redis Cache)]
        Blob[(UploadThing)]
        
        PG --- Vect
    end

    subgraph External [External Services]
        Gemini[Google Gemini 2.0 API]
        Clerk[Clerk Identity Provider]
    end

    %% Connections
    Frontend -- HTTP/REST --> API
    Frontend -- SSE --> API
    Frontend -- Direct Upload --> Blob
    
    Serv -- Read/Write --> PG
    Serv -- Semantic Search --> Vect
    Serv -- Caching --> Redis
    
    Agent -- LLM Prompts --> Gemini
    Auth2 -- JWKS Verification --> Clerk
```

## AI Agent Workflow (Document Processing)

The core value of MiningNiti lies in its document processing pipeline. When a document is uploaded, it is passed to an Orchestrator that triggers a series of specialized AI agents.

```mermaid
sequenceDiagram
    participant User
    participant App as API Layer
    participant Orch as Agent Orchestrator
    participant Gemini as Gemini 2.0 API
    participant DB as PostgreSQL/pgvector

    User->>App: Upload Document (PDF/Text)
    App->>DB: Save raw document metadata
    App->>Orch: Trigger background processing
    
    Note over Orch: Parallel Agent Execution
    
    par Document Classification
        Orch->>Gemini: Run ClassifierAgent
        Gemini-->>Orch: Return Category & Confidence
    and Safety Analysis
        Orch->>Gemini: Run SafetyAnalyzerAgent
        Gemini-->>Orch: Return Hazards & Score
    and Entity Extraction
        Orch->>Gemini: Run EntityExtractorAgent
        Gemini-->>Orch: Return Equipment, Chemicals, etc.
    and Summarization
        Orch->>Gemini: Run SummarizerAgent
        Gemini-->>Orch: Return Executive Summary
    end
    
    Note over Orch: Chunking & Embedding
    
    Orch->>Gemini: Generate Embeddings
    Gemini-->>Orch: Return Vectors
    
    Orch->>DB: Save Analysis Results
    Orch->>DB: Save Chunk Vectors
    
    App-->>User: Document Processed Successfully
```

## AI Chat Workflow (Retrieval-Augmented Generation)

The Chat Interface provides an intelligent, context-aware conversational agent that cites its sources.

```mermaid
flowchart LR
    A[User Query] --> B[Generate Query Embedding]
    B --> C{Semantic Search}
    
    subgraph pgvector DB
    C --> D[Filter by User ID]
    D --> E[Calculate Cosine Similarity]
    E --> F[Return Top K Chunks]
    end
    
    F --> G[Format Context & Sources]
    G --> H[Construct LLM Prompt]
    H --> I[Stream Response via SSE]
    
    I --> J[User Interface]
```

## Security & Access Control

- **Authentication**: Managed entirely by Clerk via JSON Web Tokens (JWT).
- **Backend Verification**: FastAPI extracts the JWT from the `Authorization: Bearer` header and verifies it cryptographically against Clerk's JSON Web Key Set (JWKS).
- **Data Isolation**: Every database query (Documents, Chat Sessions, Analytics) filters by `user_id`. No user can ever read data belonging to another user.

## Deployment Topology

- **Frontend**: Deployed on Vercel Edge Network.
- **Backend**: Deployed as a Docker container on Render / Railway.
- **Database**: PostgreSQL 16+ instance with `pgvector` extension hosted on Neon / Supabase.
