<div align="center">

```
 ███╗   ███╗██╗███╗   ██╗██╗███╗   ██╗ ██████╗     ███╗   ██╗██╗████████╗██╗
 ████╗ ████║██║████╗  ██║██║████╗  ██║██╔════╝     ████╗  ██║██║╚══██╔══╝██║
 ██╔████╔██║██║██╔██╗ ██║██║██╔██╗ ██║██║  ███╗    ██╔██╗ ██║██║   ██║   ██║
 ██║╚██╔╝██║██║██║╚██╗██║██║██║╚██╗██║██║   ██║    ██║╚██╗██║██║   ██║   ██║
 ██║ ╚═╝ ██║██║██║ ╚████║██║██║ ╚████║╚██████╔╝    ██║ ╚████║██║   ██║   ██║
 ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚═╝  ╚═══╝╚═╝   ╚═╝   ╚═╝
```

### AI-Powered Document Intelligence for the Mining Industry

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16+-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/Supabase-pgvector-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

[Architecture](#architecture) · [Quick Start](#quick-start) · [API Reference](#api-endpoints) · [Deploy](#deployment) · [Contributing](#contributing)

---

<table>
  <tr>
    <td align="center" width="520">
      <img src="https://img.shields.io/badge/Smart_India_Hackathon_2023-Winning_Project-FFD700?style=for-the-badge&labelColor=1a1a2e" /><br/>
      <strong>Recognized by Coal India Limited & CMPDI</strong>
    </td>
  </tr>
</table>

</div>

---

MiningNiti is a full-stack AI platform that transforms how coal mining organizations manage safety documentation, regulatory compliance, and institutional knowledge. It combines a **multi-agent AI pipeline** (6 specialized agents across 4 AI providers) with **production-grade RAG** (hybrid search + cross-encoder reranking) and **real-time compliance auditing** — turning thousands of fragmented PDFs into an instantly queryable, citation-backed source of truth.

---

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Testing](#testing)
- [Security](#security)
- [Performance](#performance)
- [Contributing](#contributing)
- [License](#license)

---

## The Problem

Coal mining operations generate **thousands of critical documents** — MSHA regulations, equipment manuals, safety protocols, environmental impact assessments, and incident investigations. The core challenges:

- **Fragmentation**: Information is scattered across PDFs, scanned forms, and siloed databases
- **Compliance risk**: Missing a regulation update can mean violations, fines, or worse — lives
- **Slow retrieval**: Finding a specific clause across 500 pages of safety protocols takes hours
- **Knowledge drain**: Expertise leaves when experienced personnel retire

## The Solution

MiningNiti deploys **specialized AI agents** that understand mining domain context:

| Capability | How |
|---|---|
| **Auto-classify** documents into safety, equipment, regulatory, and geological categories | Classifier Agent (Groq / Llama 3.3) |
| **Detect hazards** and flag compliance violations against MSHA/OSHA standards | Safety Analyzer (Mistral / Magistral) |
| **Extract entities** — equipment names, chemicals, regulations, personnel, locations | Entity Extractor (Cerebras / GPT-OSS-120B) |
| **Summarize** long documents with actionable key points | Summarizer Agent (Cerebras / GPT-OSS-120B) |
| **Audit compliance** by cross-referencing operational docs against regulations | Compliance Auditor Agent (Gemini) |
| **Answer questions** with page-level citations from your document corpus | RAG Chat with hybrid search + reranking |

---

## Key Features

### Multi-Agent AI Pipeline

Six specialized agents orchestrated in parallel for maximum throughput:

```
Document Upload
       │
       ▼
  ┌─────────────┐
  │ Orchestrator │──── Runs 6 agents concurrently via asyncio
  └──────┬──────┘
         │
   ┌─────┼─────┬──────────┬──────────┬────────────┐
   ▼     ▼     ▼          ▼          ▼            ▼
Classifier Safety  Entity    Summarizer  Compliance
  Agent   Analyzer Extractor   Agent      Auditor
(Groq)  (Mistral) (Cerebras) (Cerebras) (Gemini)
   │     │     │          │          │            │
   └─────┴─────┴──────────┴──────────┴────────────┘
         │
         ▼
  Chunks + Embeddings → pgvector (HNSW index)
```

### Production RAG Pipeline

The retrieval system goes beyond basic vector search with a multi-stage pipeline:

```
Query → Embed → Hybrid Search (Vector + BM25) → RRF → Cross-Encoder Rerank → Top-5 → LLM
```

| Stage | What it does |
|---|---|
| **Hybrid Search** | pgvector cosine similarity + pg_trgm BM25 keyword matching combined via Reciprocal Rank Fusion |
| **Cross-Encoder Reranking** | `ms-marco-MiniLM-L-6-v2` reranks top-20 candidates for precise relevance scoring |
| **Similarity Threshold** | Filters irrelevant chunks before context formatting |
| **System Role Prompt** | Proper LLM message structure for better instruction following |

- Streaming responses token-by-token via Server-Sent Events (SSE)
- Every answer cites `[Document, Page X]` — no hallucination without source
- Multi-turn session management with full conversation history

### Compliance Auto-Auditor

- Cross-references operational documents against regulatory documents
- Generates per-clause compliance matrices (Pass / Fail / Not Addressed)
- Tracks audit status: Pending → In Progress → Completed
- Frontend dashboard with audit detail views

### Enterprise Dashboard

- Real-time document processing status with background task tracking
- Safety score visualizations and compliance trend analytics
- Category distribution charts powered by Recharts
- KPI grid, activity feed, and recent documents table

### Document Management

- Drag-and-drop upload with PDF, DOCX, TXT support
- Direct file upload to backend (no third-party CDN dependency)
- In-document AI chat — ask questions about a specific document
- PDF viewer modal for inline document review

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
│     Next.js 16 · React 19 · Tailwind v4 · shadcn/ui · Vercel      │
│        Clerk Auth · Framer Motion · Recharts · React-PDF            │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────────┐
│                        API GATEWAY                                   │
│    FastAPI 0.128 · Clerk JWT Auth · slowapi Rate Limiter            │
│    Pydantic v2 Validation · CORS · Audit Logging                    │
│    Deployed on: HuggingFace Spaces (Docker)                         │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
         ┌─────────────────┼──────────────────┐
         ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Documents   │  │  Chat (SSE)  │  │  Compliance  │
│  Upload + AI │  │  RAG Pipeline│  │  Audit APIs  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       └─────────────────┼──────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     RAG RETRIEVAL PIPELINE                           │
│                                                                     │
│   Query → Embed (Gemini) → Hybrid Search → RRF → Rerank → Top-5   │
│                                                                     │
│   ┌─────────────┐  ┌─────────────┐  ┌────────────────────────┐     │
│   │  pgvector   │  │ pg_trgm BM25│  │  Cross-Encoder Rerank  │     │
│   │  (semantic) │  │ (keyword)   │  │  (ms-marco-MiniLM)     │     │
│   └──────┬──────┘  └──────┬──────┘  └───────────┬────────────┘     │
│          └────────┬───────┘                      │                  │
│           Reciprocal Rank Fusion                 ▼                  │
│                                    Precise Top-5 Chunks             │
└──────────────────────────┬──────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       AI AGENT LAYER                                 │
│                                                                     │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐           │
│  │Classifier │ │  Safety   │ │  Entity   │ │Summarizer │           │
│  │  (Groq)   │ │ (Mistral) │ │(Cerebras) │ │(Cerebras) │           │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘           │
│                  ┌───────────┐ ┌───────────┐                        │
│                  │Compliance │ │ Orchestrator│                       │
│                  │ (Gemini)  │ │ (parallel) │                       │
│                  └───────────┘ └───────────┘                        │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
         ┌─────────────────┼──────────────────┐
         ▼                 ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Supabase     │  │  Upstash      │  │  AI Providers │
│  PostgreSQL   │  │  Redis        │  │               │
│  + pgvector   │  │  (Cache/Queue)│  │ Gemini · Groq │
│  (HNSW index) │  │               │  │ Mistral       │
│  (Free tier)  │  │  (Free tier)  │  │ Cerebras      │
└───────────────┘  └───────────────┘  └───────────────┘
```

---

## Tech Stack

### Frontend (Deployed on Vercel)

| Category | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.x |
| UI Library | React | 19.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS + tw-animate-css | v4 |
| Components | shadcn/ui (Radix primitives) | Latest |
| Auth | Clerk | 6.x |
| State | Zustand + TanStack React Query | 5.x |
| Animation | Framer Motion + Lenis | 12.x |
| Charts | Recharts | 2.15 |
| PDF | react-pdf | 10.x |
| Forms | React Hook Form + Zod | 7.x / 3.x |

### Backend (Deployed on HuggingFace Spaces)

| Category | Technology | Version |
|---|---|---|
| Framework | FastAPI + Uvicorn | 0.128 |
| Language | Python | 3.11+ |
| ORM | SQLAlchemy (async-capable) | 2.0 |
| Database | Supabase PostgreSQL + pgvector + pg_trgm | 16+ |
| Validation | Pydantic | v2.9 |
| Auth | Clerk JWT (JWKS) | - |
| Rate Limiting | slowapi | 0.1.9 |
| Reranking | sentence-transformers (CrossEncoder) | 3.x |
| Background Tasks | FastAPI BackgroundTasks | - |
| HTTP Client | httpx | 0.27.2 |
| Process Server | Uvicorn (HF Spaces) | - |

### AI Providers (All Free Tiers)

| Agent / Service | Provider | Model | Free Tier |
|---|---|---|---|
| Embeddings | Google Gemini | `text-embedding-004` | 1,500 req/day |
| RAG Chat | Groq (primary) / Cerebras (fallback) | `llama-3.3-70b-versatile` / `gpt-oss-120b` | 14,400 req/day |
| Classifier | Groq | `llama-3.3-70b-versatile` | 14,400 req/day |
| Entity Extractor | Cerebras | `gpt-oss-120b` | 1M tokens/day |
| Summarizer | Cerebras | `gpt-oss-120b` | 1M tokens/day |
| Safety Analyzer | Mistral | `magistral-small-latest` | Free tier |
| Compliance Auditor | Google Gemini | `gemini-2.5-flash` | 1,500 req/day |
| Reranker | Local (CPU) | `ms-marco-MiniLM-L-6-v2` | Free (runs locally) |

### Infrastructure (All Free Tiers)

| Service | Provider | Free Tier |
|---|---|---|
| Frontend Hosting | **Vercel** | Unlimited deploys, custom domain |
| Backend Hosting | **HuggingFace Spaces** | 16GB RAM, 2 vCPU, Docker support |
| Database | **Supabase** | 500MB PostgreSQL + pgvector, unlimited API calls |
| Cache / Queue | **Upstash** | 10,000 Redis commands/day |
| Authentication | **Clerk** | 10,000 monthly active users |
| File Upload | **Direct to Backend** | No third-party dependency |

> **Total infrastructure cost: $0/month** — all services run on free tiers.

---

## Quick Start

### Prerequisites

- **Python 3.11+** and **Node.js 18+**
- **Docker & Docker Compose** (recommended for local development)
- **Free accounts**: Supabase, Upstash, Clerk, Google AI Studio, Groq, Cerebras, Mistral

### 1. Clone & Configure

```bash
git clone https://github.com/Iammilansoni/MiningNiti.git
cd MiningNiti

cp backend/.env.example backend/.env
# Edit backend/.env with your API keys (see Environment Variables below)
```

### 2. Docker (Recommended)

```bash
docker-compose up -d
```

This starts PostgreSQL (with pgvector), Redis, backend, and frontend.

### 3. Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev                     # http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Supabase PostgreSQL connection string (use Transaction pooler, port 6543) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key from [aistudio.google.com](https://aistudio.google.com/apikey) |
| `GROQ_API_KEY` | Yes | Groq API key from [console.groq.com](https://console.groq.com) |
| `MISTRAL_API_KEY` | Yes | Mistral API key from [console.mistral.ai](https://console.mistral.ai) |
| `CEREBRAS_API_KEY` | Yes | Cerebras API key from [cloud.cerebras.ai](https://cloud.cerebras.ai) |
| `CLERK_JWKS_URL` | Yes | Clerk JWKS endpoint for JWT verification |
| `REDIS_URL` | Yes | Upstash Redis URL (with `?tls=true`) |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend URL for frontend (e.g. `https://your-space.hf.space`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key for frontend auth |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key for backend auth |
| `UPLOADTHING_TOKEN` | No | UploadThing token (optional, direct upload used by default) |

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Application info |
| GET | `/api/v1/health` | Health check with service status |

### Documents

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/documents` | List documents (paginated) |
| POST | `/api/v1/documents` | Create document from URL |
| POST | `/api/v1/upload` | Upload file directly (multipart) |
| GET | `/api/v1/documents/{id}` | Get document detail |
| DELETE | `/api/v1/documents/{id}` | Delete document |
| GET | `/api/v1/documents/{id}/analysis` | Get AI analysis results |
| POST | `/api/v1/documents/{id}/reanalyze` | Trigger re-analysis |

### Chat (Streaming)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/chat/sessions` | List chat sessions |
| POST | `/api/v1/chat/sessions` | Create new session |
| GET | `/api/v1/chat/sessions/{id}` | Get session with messages |
| PATCH | `/api/v1/chat/sessions/{id}` | Update session |
| DELETE | `/api/v1/chat/sessions/{id}` | Delete session |
| POST | `/api/v1/chat/send` | Send message (synchronous RAG) |
| POST | `/api/v1/chat/stream` | Stream response (SSE) |

### Compliance Audit

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/compliance/audits` | List audits |
| POST | `/api/v1/compliance/audits` | Create compliance audit |
| GET | `/api/v1/compliance/audits/{id}` | Get audit detail + matrix |
| PATCH | `/api/v1/compliance/audits/{id}` | Update audit status |

### Search, Analytics & More

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/search?q={query}` | Semantic vector search |
| GET | `/api/v1/analytics/dashboard` | Dashboard statistics |
| GET | `/api/v1/analytics/documents` | Document analytics |
| GET | `/api/v1/analytics/safety` | Safety compliance analytics |
| GET | `/api/v1/prompts` | List saved prompt templates |
| POST | `/api/v1/prompts` | Save prompt template |
| GET | `/api/v1/jobs` | List active background jobs |
| GET | `/api/v1/jobs/{id}` | Get job status |
| GET | `/api/v1/user/profile` | Get user profile |

---

## Project Structure

```
MiningNiti/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py                # Dependency injection (auth, DB)
│   │   │   └── v1/
│   │   │       ├── router.py          # Unified API router
│   │   │       ├── documents.py       # Document CRUD + processing
│   │   │       ├── upload.py          # Direct file upload endpoint
│   │   │       ├── chat.py            # RAG chat (sync)
│   │   │       ├── chat_stream.py     # RAG chat (SSE streaming)
│   │   │       ├── compliance.py      # Compliance audit endpoints
│   │   │       ├── analytics.py       # Dashboard analytics
│   │   │       ├── search.py          # Semantic vector search
│   │   │       ├── prompts.py         # Prompt template management
│   │   │       ├── jobs.py            # Background job tracking
│   │   │       ├── user.py            # User profile
│   │   │       └── health.py          # Health check
│   │   ├── agents/
│   │   │   ├── base.py                # Base agent interface with retry logic
│   │   │   ├── classifier.py          # Document classification (Groq)
│   │   │   ├── safety_analyzer.py     # Hazard detection (Mistral)
│   │   │   ├── entity_extractor.py    # Mining NER (Cerebras)
│   │   │   ├── summarizer.py          # Executive summaries (Cerebras)
│   │   │   ├── compliance_auditor.py  # Compliance cross-reference (Gemini)
│   │   │   └── orchestrator.py        # Parallel agent coordination
│   │   ├── models/
│   │   │   ├── document.py            # Document + DocumentEmbedding (pgvector)
│   │   │   ├── chat.py                # ChatSession + ChatMessage
│   │   │   ├── compliance.py          # ComplianceAudit + ComplianceMatrixRow
│   │   │   ├── audit.py               # Audit logging
│   │   │   ├── prompt.py              # Prompt templates
│   │   │   └── user.py                # User model
│   │   ├── schemas/                   # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── chat_service.py        # RAG pipeline (hybrid → rerank → generate)
│   │   │   ├── hybrid_search.py       # Vector + BM25 + Reciprocal Rank Fusion
│   │   │   ├── reranker.py            # Cross-encoder reranking (ms-marco-MiniLM)
│   │   │   ├── document_service.py    # Upload, extract, chunk, embed
│   │   │   ├── compliance_service.py  # Compliance audit logic
│   │   │   ├── chunking.py            # Text chunking with overlap
│   │   │   ├── extractors.py          # PDF/DOCX/TXT text extraction
│   │   │   ├── llm_provider.py        # Multi-provider AI client setup
│   │   │   └── queue.py               # Task queue management
│   │   ├── core/
│   │   │   ├── security.py            # JWT verification, CORS
│   │   │   └── exceptions.py          # Custom error handlers
│   │   ├── db/
│   │   │   ├── session.py             # SQLAlchemy engine + pgvector init
│   │   │   └── __init__.py
│   │   └── main.py                    # FastAPI app factory
│   ├── tests/
│   │   ├── unit/                      # 47 unit tests (SQLite in-memory)
│   │   └── integration/               # Integration tests (PostgreSQL + Redis)
│   ├── requirements.txt
│   ├── pyproject.toml                 # black + isort config
│   ├── Dockerfile                     # Docker build for HuggingFace Spaces
│   └── alembic/                       # Database migrations
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/                # Sign-in / Sign-up (Clerk)
│   │   │   ├── (dashboard)/           # Protected routes
│   │   │   │   ├── dashboard/         # Main dashboard
│   │   │   │   ├── chat/              # RAG chat interface
│   │   │   │   ├── documents/         # Document management + [id] detail
│   │   │   │   ├── compliance/        # Compliance audits + [id] detail
│   │   │   │   ├── analytics/         # Analytics dashboard
│   │   │   │   ├── prompts/           # Prompt template manager
│   │   │   │   └── settings/          # Profile, notifications, security
│   │   │   ├── about/                 # About page
│   │   │   ├── announcement/          # Announcement page
│   │   │   ├── blog/                  # Blog
│   │   │   ├── careers/               # Careers
│   │   │   ├── case-studies/          # Case studies
│   │   │   ├── contact/               # Contact
│   │   │   └── privacy/               # Privacy policy
│   │   ├── components/
│   │   │   ├── landing/               # 22 landing page components
│   │   │   ├── chat/                  # ChatMessage, PDFViewerModal
│   │   │   ├── documents/             # UploadModal, AskDocumentAI
│   │   │   ├── dashboard/             # KPI grid, StatCard, QuickActions
│   │   │   ├── analytics/             # Charts and visualizations
│   │   │   ├── settings/              # ProfileSettings, NotificationSettings
│   │   │   ├── layout/                # Header, Sidebar
│   │   │   ├── ui/                    # shadcn/ui + custom animated components
│   │   │   └── prompts/               # Prompt management UI
│   │   ├── hooks/
│   │   │   ├── use-chat-stream.ts     # SSE streaming hook
│   │   │   └── useApi.ts              # Typed API client hook
│   │   └── lib/
│   │       └── api.ts                 # API client with auth headers
│   ├── package.json
│   └── next.config.ts
├── docker-compose.yml
├── docker-compose.prod.yml
├── ARCHITECTURE.md
├── AGENTS.md
└── LICENSE
```

---

## Deployment

### Overview

The entire application runs on **free-tier services** with zero infrastructure cost:

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Frontend   │────▶│     Backend      │────▶│   Database   │
│   Vercel     │     │ HuggingFace      │     │  Supabase    │
│              │     │ Spaces (Docker)  │     │  PostgreSQL  │
└──────────────┘     └──────────────────┘     │  + pgvector  │
                             │                 └──────────────┘
                             ▼
                      ┌──────────────┐
                      │    Redis     │
                      │   Upstash    │
                      └──────────────┘
```

### Step 1: Setup Database (Supabase)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project (choose closest region)
3. Go to **Connect** → **Connection string** → **Transaction pooler** → Copy the URI
4. In **SQL Editor**, run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```
5. Use the connection string as `DATABASE_URL` (port 6543, with `?sslmode=require`)

### Step 2: Setup Redis (Upstash)

1. Create a free account at [upstash.com](https://upstash.com)
2. Create a Redis database (choose closest region)
3. Copy the Redis URL
4. Use as `REDIS_URL` (append `?tls=true`)

### Step 3: Setup Authentication (Clerk)

1. Create a free account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy the **Publishable Key** and **Secret Key**
4. Copy the **JWKS URL** from your Clerk dashboard

### Step 4: Get AI Provider Keys (All Free)

| Provider | Sign up at | What you get |
|---|---|---|
| Google Gemini | [aistudio.google.com](https://aistudio.google.com/apikey) | Embeddings + Chat |
| Groq | [console.groq.com](https://console.groq.com) | Ultra-fast LLM inference |
| Cerebras | [cloud.cerebras.ai](https://cloud.cerebras.ai) | 1M tokens/day free |
| Mistral | [console.mistral.ai](https://console.mistral.ai) | Safety analysis |

### Step 5: Deploy Backend (HuggingFace Spaces)

1. Create a free account at [huggingface.co](https://huggingface.co)
2. Create a new Space with **Docker** SDK
3. Clone the Space:
```bash
git clone https://huggingface.co/spaces/YOUR-USERNAME/miningniti-api
```
4. Copy backend files into the Space folder
5. Create `Dockerfile` and `README.md` (see `backend/Dockerfile.hf`)
6. Push to HuggingFace:
```bash
cd miningniti-api
git add .
git commit -m "Deploy MiningNiti API"
git push
```
7. In Space **Settings** → **Variables and Secrets**, add all environment variables
8. Wait for the build to complete (~5-10 minutes)

### Step 6: Deploy Frontend (Vercel)

1. Push frontend code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repository
3. Add environment variables:
   - `NEXT_PUBLIC_API_BASE_URL` → `https://YOUR-USERNAME-miningniti-api.hf.space`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → your Clerk publishable key
   - `CLERK_SECRET_KEY` → your Clerk secret key
4. Click **Deploy**

### Step 7: Run Database Migration

After backend is deployed, run the migration in Supabase SQL Editor:
```sql
-- From alembic/versions/001_enable_pgvector.py
-- (tables are auto-created on startup, but run manually if needed)
```

### Live URLs

| Service | URL |
|---|---|
| Frontend | `https://YOUR-USERNAME-miningniti-frontend.vercel.app` |
| Backend API | `https://YOUR-USERNAME-miningniti-api.hf.space` |
| API Docs | `https://YOUR-USERNAME-miningniti-api.hf.space/docs` |
| Database | `https://supabase.com/dashboard/project/YOUR-PROJECT` |
| Redis | `https://upstash.com/dashboard/YOUR-DATABASE` |

---

## Testing

```bash
cd backend

# Unit tests (fast, SQLite in-memory, no external services needed)
pytest tests/unit/ -v -m unit

# Integration tests (requires running PostgreSQL + Redis)
pytest tests/integration/ -v -m integration

# With coverage
pytest tests/unit/ --cov=app --cov-report=html
```

**47 unit tests** covering:
- All 5 AI agents (mocked LLM responses)
- RAG chat service (context formatting, prompt building, source citations)
- Hybrid search + reranking pipeline
- Text chunking (sequential indices, page tracking, overlap, edge cases)
- Document extractors (plain text processing)

**Linting:**
```bash
cd backend
python -m isort app/ tests/     # Sort imports
python -m black app/ tests/     # Format code
python -m black --check app/ tests/   # Verify formatting
```

**Frontend:**
```bash
cd frontend
npm run lint          # ESLint
npm run build         # Production build
```

---

## Security

| Layer | Implementation |
|---|---|
| **Authentication** | Clerk JWT verified via JWKS endpoint; user ID from `sub` claim |
| **Authorization** | User-scoped resource access — no cross-user data leakage |
| **Rate Limiting** | 120 requests/minute per IP (slowapi) |
| **Input Validation** | Pydantic v2 models on all request/response schemas |
| **SQL Injection** | SQLAlchemy ORM with parameterized queries |
| **Audit Logging** | All mutations logged with action, user, and timestamp |
| **CORS** | Configurable origins; auth errors propagate CORS headers |
| **Secrets** | Stored as HuggingFace/Vercel environment secrets, never committed |

---

## Performance

| Optimization | Detail |
|---|---|
| **Hybrid search** | Vector (pgvector) + keyword (pg_trgm) combined via Reciprocal Rank Fusion |
| **Cross-encoder reranking** | `ms-marco-MiniLM-L-6-v2` reranks top-20 candidates for precise relevance |
| **pgvector HNSW** | Sub-5ms nearest-neighbor search over document embeddings |
| **Parallel agents** | 6 AI agents run concurrently via `asyncio.gather()` |
| **SSE streaming** | Token-by-token response delivery (no wait for full answer) |
| **Background tasks** | Document processing runs asynchronously via FastAPI BackgroundTasks |
| **Crash recovery** | Stuck documents auto-reset to PENDING on server restart |
| **LLM fallback** | Groq → Cerebras automatic fallback with retry logic |
| **Model pre-download** | Cross-encoder reranker baked into Docker image (no cold start) |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Make your changes following the code style:
   - **Backend**: Run `isort` then `black` before committing
   - **Frontend**: Run `npm run lint` to check
4. Add tests for new functionality
5. Ensure all unit tests pass: `pytest tests/unit/ -v -m unit`
6. Commit with a descriptive message: `feat(backend): add amazing feature`
7. Push and open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built for the Mining Industry** · **Powered by 4 AI Providers** · **$0/month Infrastructure**

<br/>

[![Twitter](https://img.shields.io/badge/Twitter-@Iammilansoni-1DA1F2?style=flat-square&logo=twitter&logoColor=white)](https://twitter.com/Iammilansoni)
[![GitHub](https://img.shields.io/badge/GitHub-Iammilansoni-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Iammilansoni)

Smart India Hackathon 2023 — Winning Project · Recognized by Coal India Limited & CMPDI

</div>
