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

Coal mining operations generate **thousands of critical documents** — MSHA regulations, equipment manuals, safety protocols, environmental impact assessments, and incident investigations. Information is scattered across PDFs, scanned forms, and siloed databases. Finding a specific clause across 500 pages of safety protocols takes hours, and missing a regulation update can mean violations, fines, or lives.

## The Solution

MiningNiti deploys **6 specialized AI agents** across 4 providers that understand mining domain context:

| Capability | Agent |
|---|---|
| **Auto-classify** documents into safety, equipment, regulatory, and geological categories | Classifier (Groq / Llama 3.3) |
| **Detect hazards** and flag compliance violations against MSHA/OSHA standards | Safety Analyzer (Mistral / Magistral) |
| **Extract entities** — equipment names, chemicals, regulations, personnel, locations | Entity Extractor (Cerebras / GPT-OSS-120B) |
| **Summarize** long documents with actionable key points | Summarizer (Cerebras / GPT-OSS-120B) |
| **Audit compliance** by cross-referencing operational docs against regulations | Compliance Auditor (Gemini) |
| **Answer questions** with page-level citations from your document corpus | RAG Chat (hybrid search + reranking) |

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

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | Next.js (App Router, Turbopack) · React · TypeScript · Tailwind CSS v4 · shadcn/ui · Clerk Auth · Zustand · TanStack React Query · Recharts | 16.x / 19.x / 5.x |
| **Backend** | FastAPI · Python · SQLAlchemy (async) · Pydantic v2 · slowapi Rate Limiting · sentence-transformers CrossEncoder | 0.128 / 3.11+ / 2.0 |
| **Database** | Supabase PostgreSQL + pgvector + pg_trgm (HNSW index) | 16+ |
| **AI Agents** | Groq (Llama 3.3) · Mistral (Magistral) · Cerebras (GPT-OSS-120B) · Gemini (2.5 Flash) | All free tiers |
| **Infrastructure** | Vercel (frontend) · HuggingFace Spaces (backend, Docker) · Supabase (DB) · Upstash (Redis) · Clerk (Auth) | All free tiers |

> **Total infrastructure cost: $0/month**

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
│   │   ├── api/v1/          # API endpoints (documents, chat, compliance, analytics, search)
│   │   ├── agents/          # 6 AI agents (classifier, safety, entity, summarizer, compliance, orchestrator)
│   │   ├── models/          # SQLAlchemy models (documents, chat, compliance, audit)
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # Business logic (RAG, hybrid search, reranker, compliance)
│   │   ├── core/            # Security, exceptions, config
│   │   └── db/              # SQLAlchemy engine + pgvector init
│   ├── tests/unit/          # 47 unit tests (SQLite in-memory)
│   ├── tests/integration/   # Integration tests (PostgreSQL + Redis)
│   └── Dockerfile           # Docker build for HuggingFace Spaces
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router (auth, dashboard, chat, documents, compliance, analytics)
│   │   ├── components/      # Landing (22 components), chat, documents, dashboard, analytics, settings, ui
│   │   ├── hooks/           # SSE streaming, typed API client
│   │   └── lib/             # API client with auth headers
│   └── package.json
├── docker-compose.yml
├── docker-compose.prod.yml
└── ARCHITECTURE.md
```

---

## Deployment

The entire application runs on **free-tier services** with zero infrastructure cost.

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Frontend   │────▶│     Backend      │────▶│   Database   │
│   Vercel     │     │ HuggingFace      │     │  Supabase    │
│              │     │ Spaces (Docker)  │     │  + pgvector  │
└──────────────┘     └──────────────────┘     └──────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │    Redis     │
                       │   Upstash    │
                       └──────────────┘
```

### Setup Steps

1. **Database** (Supabase): Create project, copy Transaction pooler connection string (port 6543), run `CREATE EXTENSION IF NOT EXISTS vector; CREATE EXTENSION IF NOT EXISTS pg_trgm;`
2. **Redis** (Upstash): Create Redis database, copy URL with `?tls=true`
3. **Auth** (Clerk): Create app, copy Publishable Key, Secret Key, and JWKS URL
4. **AI Keys** (all free): [Gemini](https://aistudio.google.com/apikey), [Groq](https://console.groq.com), [Cerebras](https://cloud.cerebras.ai), [Mistral](https://console.mistral.ai)
5. **Backend** (HuggingFace Spaces): Create Docker space, clone, copy `backend/` files, push, add env vars in Settings
6. **Frontend** (Vercel): Import repo, add `NEXT_PUBLIC_API_BASE_URL` (HF space URL) + Clerk keys, deploy

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Supabase PostgreSQL (Transaction pooler, port 6543) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `GROQ_API_KEY` | Yes | Groq API key |
| `MISTRAL_API_KEY` | Yes | Mistral API key |
| `CEREBRAS_API_KEY` | Yes | Cerebras API key |
| `CLERK_JWKS_URL` | Yes | Clerk JWKS endpoint |
| `REDIS_URL` | Yes | Upstash Redis URL (with `?tls=true`) |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend URL for frontend |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |

---

## Testing

```bash
cd backend
pytest tests/unit/ -v -m unit                           # 47 unit tests (SQLite in-memory)
pytest tests/integration/ -v -m integration              # Needs PostgreSQL + Redis
pytest tests/eval/test_rag_eval.py -v -m synthetic       # RAG eval (no DB, instant)
pytest tests/eval/test_rag_eval.py -v -m live            # RAG eval (full pipeline)
pytest tests/unit/ --cov=app --cov-report=html           # With coverage
```

**Unit tests** cover all 5 AI agents (mocked), RAG chat service, hybrid search + reranking, text chunking, and document extractors.

**Linting:** `isort` + `black` (backend), `npm run lint` (frontend).

---

## MLOps

### Guardrails

Input validation protecting the RAG pipeline from prompt injection and abuse. 20+ regex patterns cover instruction override, system prompt extraction, jailbreak, and role-play attacks. Queries exceeding 1500 characters or containing injection patterns are rejected (422/403).

### Observability

LangSmith tracing for end-to-end AI pipeline visibility — traces `AgentOrchestrator.analyze_document()`, `hybrid_search()`, and `ChatService.generate_response()` (sync + streaming). Falls back to no-op when langsmith is not installed.

### RAG Evaluation

Gemini-powered evaluation measuring answer quality:

| Metric | What it measures | Threshold |
|---|---|---|
| Faithfulness | Are all claims grounded in retrieved context? | 0.70 |
| Relevancy | Does the answer actually address the question? | 0.70 |

```bash
pytest tests/eval/test_rag_eval.py -v -m synthetic   # Quick check (no DB needed)
pytest tests/eval/test_rag_eval.py -v -m live         # Full pipeline test
```

---

## Security

Clerk JWT auth (JWKS) with user-scoped resource access. Rate limiting (120 req/min per IP), Pydantic v2 validation on all inputs, prompt injection guardrails, SQLAlchemy parameterized queries, audit logging on all mutations, configurable CORS, and secrets stored as environment variables (never committed).

---

## Performance

Hybrid search (pgvector + pg_trgm) with Reciprocal Rank Fusion, cross-encoder reranking (`ms-marco-MiniLM-L-6-v2`), sub-5ms HNSW nearest-neighbor search, 6 AI agents running concurrently via `asyncio.gather()`, SSE streaming for token-by-token delivery, async document processing via FastAPI BackgroundTasks, Groq→Cerebras automatic fallback, crash recovery (stuck docs auto-reset), and cross-encoder pre-baked in Docker image.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Make changes following code style: `isort` + `black` (backend), `npm run lint` (frontend)
4. Add tests, ensure unit tests pass: `pytest tests/unit/ -v -m unit`
5. Commit: `feat(backend): add amazing feature`
6. Push and open a Pull Request

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
