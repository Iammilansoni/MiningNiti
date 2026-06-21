<div align="center">

```
███╗   ███╗██╗███╗   ██╗██╗███╗   ██╗ ██████╗     ███╗   ██╗██╗████████╗██╗
████╗ ████║██║████╗  ██║██║████╗  ██║██╔════╝     ████╗  ██║██║╚══██╔══╝██║
██╔████╔██║██║██╔██╗ ██║██║██╔██╗ ██║██║  ███╗    ██╔██╗ ██║██║   ██║   ██║
██║╚██╔╝██║██║██║╚██╗██║██║██║╚██╗██║██║   ██║    ██║╚██╗██║██║   ██║   ██║
██║ ╚═╝ ██║██║██║ ╚████║██║██║ ╚████║╚██████╔╝    ██║ ╚████║██║   ██║   ██║
╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚═╝  ╚═══╝╚═╝   ╚═╝   ╚═╝
```

**AI-powered document intelligence engine for the coal mining industry**

---

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15+-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini_2.0_Flash-FF6D00?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live_Demo-miningniti.vercel.app-000000?style=flat-square&logo=vercel&logoColor=white)](https://miningniti.vercel.app)

---

[Demo](https://miningniti.vercel.app) · [Docs](#-api-endpoints) · [Quick Start](#-quick-start) · [Architecture](#️-architecture) · [Stack](#️-technology-stack)

---

<table>
  <tr>
    <td align="center" width="520">
      <img src="https://img.shields.io/badge/🏆-Smart_India_Hackathon_2023-FFD700?style=for-the-badge&labelColor=1a1a2e" /><br/>
      <strong>Winning Project</strong><br/>
      <sub>Recognized by <strong>Coal India Limited</strong> &amp; <strong>CMPDI</strong></sub>
    </td>
  </tr>
</table>

</div>

---

MiningNiti transforms coal mining operations with intelligent document processing, safety compliance analysis, and AI-powered knowledge extraction — built with a production-grade multi-agent system on Google Gemini 2.0.

---

## 🎯 The Problem

Coal mining operations handle **thousands of critical documents**: MSHA regulations, equipment manuals, safety protocols, environmental reports, and incident investigations. Finding specific information quickly can be the difference between **compliance and violation**, or even **life and death**.

## 💡 The Solution

MiningNiti uses **Agentic AI** with specialized mining domain agents to:

- 📄 **Automatically classify** and extract insights from mining documents
- 🛡️ **Detect safety hazards** and compliance violations proactively
- 🔗 **Extract knowledge** linking equipment, incidents, and regulations
- 💬 **Provide instant answers** with citations through intelligent RAG chat
- 🔍 **Semantic search** across your entire document corpus via vector similarity

---

## ✨ Key Features

### 🤖 Multi-Agent AI System

| Agent | Purpose | Capabilities |
|-------|---------|--------------|
| **Classifier Agent** | Document Categorization | Identifies type: Safety, Equipment, Regulatory, Geological, etc. |
| **Safety Analyzer** | Compliance & Hazard Detection | MSHA/OSHA compliance, hazard identification, risk scoring |
| **Entity Extractor** | Mining NER | Equipment, chemicals, locations, regulations, personnel, dates |
| **Summarizer Agent** | Executive Summaries | Concise summaries with key action items |
| **Orchestrator** | Pipeline Coordination | Runs agents in parallel for optimal performance |

### 📊 Enterprise Dashboard
- Real-time document processing status
- Safety score visualizations & compliance trend analytics
- Category distribution charts and KPI grid

### 💬 RAG-Powered Chat
- Context-aware streaming conversations (SSE)
- Document citations with sources and token usage tracking
- Mining industry specialized responses
- Multi-turn session management

### 🔍 Semantic Search
- Vector similarity search across all document chunks
- pgvector-powered sub-second retrieval
- Filter by document, category, or date range

### 🔒 Enterprise Security
- JWT authentication via Clerk
- Rate limiting (120 req/min via slowapi)
- Comprehensive audit logging
- CORS-aware error responses for browser clients

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    Next.js 15 + shadcn/ui                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY                                │
│         FastAPI + Clerk JWT Auth + slowapi Rate Limiter         │
└─────────────────────────────────────────────────────────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
    ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
    │  Document API │   │   Chat API    │   │  Search API   │
    │  + Uploadthing│   │   (SSE)       │   │  (pgvector)   │
    └───────────────┘   └───────────────┘   └───────────────┘
            │                   │                   │
            └───────────────────┼───────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI AGENT LAYER                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │Classifier│ │ Safety   │ │ Entity   │ │Summarizer│           │
│  │  Agent   │ │ Analyzer │ │ Extractor│ │  Agent   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                     ▲ Orchestrator                               │
└─────────────────────┼───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌───────────┐  ┌───────────┐  ┌───────────┐
│PostgreSQL │  │   Redis   │  │  Gemini   │
│ + pgvector│  │   Cache   │  │  2.0 Flash│
└───────────┘  └───────────┘  └───────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | Next.js + TypeScript | 15.x |
| **UI Components** | shadcn/ui + Tailwind CSS | v4 |
| **Backend** | FastAPI + Python | 3.11+ |
| **Database** | PostgreSQL + pgvector | 16+ |
| **AI / LLM** | Google Gemini | 2.0 Flash |
| **Auth** | Clerk | 6.x |
| **Rate Limiting** | slowapi | 0.1.9 |
| **File Uploads** | UploadThing | Latest |
| **Cache / Queue** | Redis | 7.x |
| **Container** | Docker + Docker Compose | Latest |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Google Cloud account (Gemini API key)
- Clerk account (authentication)

### 1. Clone and Setup

```bash
git clone https://github.com/Iammilansoni/MiningNiti.git
cd MiningNiti

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Fill in your API keys in both files
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

### 4. Docker (Recommended)

```bash
# Start all services (postgres, redis, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 📚 API Endpoints

### Health & Status
```
GET  /                          # Application info
GET  /health                    # Health check
GET  /api/v1/health             # Detailed health with service status
```

### Documents
```
GET    /api/v1/documents                    # List documents (paginated)
POST   /api/v1/documents                    # Upload document
GET    /api/v1/documents/{id}               # Get document
DELETE /api/v1/documents/{id}               # Delete document
GET    /api/v1/documents/{id}/analysis      # Get AI analysis
POST   /api/v1/documents/{id}/reanalyze     # Trigger re-analysis
```

### Chat (Streaming)
```
GET    /api/v1/chat/sessions                # List sessions
POST   /api/v1/chat/sessions                # Create session
GET    /api/v1/chat/sessions/{id}           # Get session with messages
PATCH  /api/v1/chat/sessions/{id}           # Update session
DELETE /api/v1/chat/sessions/{id}           # Delete session
POST   /api/v1/chat/send                    # Send message (RAG)
POST   /api/v1/chat/stream                  # Stream response (SSE)
```

### Semantic Search
```
GET    /api/v1/search?q={query}             # Vector similarity search
```

### Analytics
```
GET  /api/v1/analytics/dashboard            # Dashboard stats
GET  /api/v1/analytics/documents            # Document analytics
GET  /api/v1/analytics/safety               # Safety compliance analytics
```

### Prompts & Jobs
```
GET  /api/v1/prompts                        # List saved prompts
POST /api/v1/prompts                        # Save prompt template
GET  /api/v1/jobs                           # List active jobs
GET  /api/v1/jobs/{id}                      # Get job status
```

---

## 📂 Project Structure

```
MiningNiti/
├── backend/
│   ├── app/
│   │   ├── api/v1/            # REST API endpoints
│   │   │   ├── chat.py        # Chat (sync)
│   │   │   ├── chat_stream.py # Chat (SSE streaming)
│   │   │   ├── documents.py   # Document CRUD
│   │   │   ├── search.py      # Semantic search
│   │   │   ├── analytics.py   # Analytics
│   │   │   └── prompts.py     # Prompt templates
│   │   ├── agents/            # AI agents
│   │   │   ├── classifier.py
│   │   │   ├── safety_analyzer.py
│   │   │   ├── entity_extractor.py
│   │   │   ├── summarizer.py
│   │   │   └── orchestrator.py
│   │   ├── db/                # Database session & pgvector init
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── main.py            # FastAPI app + rate limiter
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/   # Protected dashboard routes
│   │   │   │   ├── chat/      # AI chat
│   │   │   │   ├── documents/ # Document management + [id] detail
│   │   │   │   ├── search/    # Semantic search
│   │   │   │   ├── analytics/ # Analytics
│   │   │   │   ├── prompts/   # Prompt templates
│   │   │   │   └── settings/
│   │   │   └── (auth)/        # Sign-in / Sign-up
│   │   ├── components/
│   │   │   ├── dashboard/     # KPI grid, StatCard, ActivityFeed
│   │   │   ├── documents/     # UploadModal, AskDocumentAI
│   │   │   ├── landing/       # Hero, Navbar, FAQ, etc.
│   │   │   ├── layout/        # Header, Sidebar
│   │   │   └── ui/            # shadcn + custom animated components
│   │   ├── hooks/
│   │   │   └── use-chat-stream.ts  # SSE streaming hook
│   │   └── lib/
│   │       └── api.ts         # Typed API client
│   └── package.json
├── docker-compose.yml
├── ARCHITECTURE.md
└── README.md
```

---

## 📊 Document Categories

| Category | Description |
|----------|-------------|
| `safety_protocol` | Safety procedures, guidelines, emergency protocols |
| `equipment_manual` | Equipment operation guides, maintenance manuals |
| `regulatory` | MSHA, OSHA, EPA regulations, compliance documents |
| `incident_report` | Accident reports, incident investigations |
| `geological` | Drill logs, assay reports, geological surveys |
| `environmental` | Environmental impact assessments, monitoring |
| `training` | Training materials, certifications |
| `permit` | Mining permits, licenses, applications |
| `maintenance` | Maintenance schedules, repair logs |

---

## 🔒 Security

- **Authentication**: Clerk JWT verification with JWKS endpoint
- **Rate Limiting**: 120 requests/minute per IP via slowapi
- **Authorization**: User-scoped resource access control
- **Audit Logging**: All actions logged for compliance
- **CORS**: CORS headers propagated on auth errors so browsers see real error codes
- **Input Validation**: Pydantic v2 models for all requests
- **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries

---

## 📈 Performance

- **Async Processing**: Document analysis runs in background tasks
- **Parallel Agents**: AI agents execute concurrently via asyncio
- **SSE Streaming**: Token-by-token streaming response (no waiting for full answer)
- **Token Tracking**: Input/output token usage recorded per message
- **Connection Pooling**: SQLAlchemy database connection optimization
- **pgvector**: Sub-second semantic search over millions of document chunks
- **Crash Recovery**: Stuck documents auto-reset to `PENDING` on server restart

---

## 🚀 Deployment

### Frontend → Vercel
1. Connect your GitHub repository to Vercel
2. Set `NEXT_PUBLIC_API_BASE_URL` → your backend URL
3. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
4. Deploy!

### Backend → Render / Railway
1. Connect repository, choose **Dockerfile** deployment
2. Set environment variables:
   ```
   DATABASE_URL=postgresql+psycopg2://...
   GEMINI_API_KEY=...
   CLERK_JWKS_URL=...
   REDIS_URL=redis://...
   ```
3. Deploy!

### Self-Hosted (Production Docker)
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🧪 Testing

```bash
cd backend

# Run tests
pytest tests/ -v

# With coverage
pytest tests/ --cov=app --cov-report=html
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built for the Mining Industry 🏔️ &nbsp;·&nbsp; Powered by Gemini AI 🤖 &nbsp;·&nbsp; Enterprise Ready 🚀</strong>
  <br/><br/>
  <sub>🏆 Smart India Hackathon 2023 — Winning Project &nbsp;|&nbsp; Recognized by Coal India Limited &amp; CMPDI</sub>
</div>
