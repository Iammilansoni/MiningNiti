# 🏔️ MiningNiti - AI Document Intelligence Engine

<div align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-0.115+-green?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/PostgreSQL-pgvector-blue?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/AI-Gemini_2.0-orange?style=for-the-badge&logo=google&logoColor=white" alt="AI Powered">
  <img src="https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
</div>

<div align="center">
  <h3>🚀 Enterprise-Grade AI Document Intelligence Platform for the Coal Mining Industry</h3>
  <p>Transform mining operations with intelligent document processing, safety compliance analysis, and AI-powered knowledge extraction using a multi-agent system.</p>
</div>

---

## 🎯 The Problem

Coal mining operations handle **thousands of critical documents**: MSHA regulations, equipment manuals, safety protocols, environmental reports, and incident investigations. Finding specific information quickly can be the difference between **compliance and violation**, or even **life and death**.

## 💡 The Solution

MiningNiti uses **Agentic AI** with specialized mining domain agents to:

- 📄 **Automatically classify** and extract insights from mining documents
- 🛡️ **Detect safety hazards** and compliance violations proactively
- 🔗 **Extract knowledge** linking equipment, incidents, and regulations
- 💬 **Provide instant answers** with citations through intelligent RAG chat

---

## ✨ Key Features

### 🤖 Multi-Agent AI System

| Agent | Purpose | Capabilities |
|-------|---------|--------------|
| **Classifier Agent** | Document Categorization | Identifies document type (Safety, Equipment, Regulatory, Geological, etc.) |
| **Safety Analyzer** | Compliance & Hazard Detection | MSHA/OSHA compliance checking, hazard identification, risk scoring |
| **Entity Extractor** | Mining NER | Extracts equipment, chemicals, locations, regulations, personnel, dates |
| **Summarizer Agent** | Executive Summaries | Generates concise summaries with key action items |
| **Orchestrator** | Pipeline Coordination | Runs agents in parallel for optimal performance |

### 📊 Enterprise Dashboard

- Real-time document processing status
- Safety score visualizations
- Compliance trend analytics
- Category distribution charts

### 💬 RAG-Powered Chat

- Context-aware conversations
- Document citations with sources
- Mining industry specialized responses
- Conversation history management

### 🔒 Enterprise Security

- JWT authentication via Clerk
- Role-based access control
- Comprehensive audit logging
- API rate limiting

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
│                FastAPI + JWT Auth + CORS                        │
└─────────────────────────────────────────────────────────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
    ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
    │  Document API │   │   Chat API    │   │ Analytics API │
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
│                     ▲                                            │
│                     │ Orchestrator                               │
└─────────────────────┼───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌───────────┐  ┌───────────┐  ┌───────────┐
│PostgreSQL │  │   Redis   │  │  Gemini   │
│ + pgvector│  │   Queue   │  │    AI     │
└───────────┘  └───────────┘  └───────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | Next.js + TypeScript | 15.x |
| **UI Components** | shadcn/ui + Tailwind | Latest |
| **Backend** | FastAPI + Python | 3.11+ |
| **Database** | PostgreSQL + pgvector | 16+ |
| **AI/LLM** | Google Gemini | 2.0 Flash |
| **Auth** | Clerk | 6.x |
| **Queue** | Redis + Celery | 7.x |
| **Container** | Docker + Docker Compose | Latest |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Google Cloud account (for Gemini API)
- Clerk account (for authentication)

### 1. Clone and Setup

```bash
git clone https://github.com/Iammilansoni/MiningNiti.git
cd miningniti

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Update with your API keys
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### 4. Docker Deployment (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📚 API Endpoints

### Health & Status
```
GET  /                    # Application info
GET  /health              # Health check
GET  /api/v1/health       # Detailed health with service status
```

### Documents
```
GET    /api/v1/documents              # List documents
POST   /api/v1/documents              # Upload document
GET    /api/v1/documents/{id}         # Get document
DELETE /api/v1/documents/{id}         # Delete document
GET    /api/v1/documents/{id}/analysis # Get AI analysis
POST   /api/v1/documents/{id}/reanalyze # Trigger re-analysis
```

### Chat
```
GET    /api/v1/chat/sessions              # List sessions
POST   /api/v1/chat/sessions              # Create session
GET    /api/v1/chat/sessions/{id}         # Get session with messages
PATCH  /api/v1/chat/sessions/{id}         # Update session
DELETE /api/v1/chat/sessions/{id}         # Delete session
POST   /api/v1/chat/send                  # Send message (with RAG)
```

### Analytics
```
GET  /api/v1/analytics/dashboard    # Dashboard stats
GET  /api/v1/analytics/documents    # Document analytics
GET  /api/v1/analytics/safety       # Safety compliance analytics
```

### Jobs
```
GET  /api/v1/jobs              # List active jobs
GET  /api/v1/jobs/{id}         # Get job status
```

---

## 📂 Project Structure

```
MiningNiti/
├── backend/
│   ├── app/
│   │   ├── api/               # REST API endpoints
│   │   │   └── v1/            # API version 1
│   │   ├── agents/            # AI agents
│   │   │   ├── base.py        # Base agent class
│   │   │   ├── classifier.py  # Document classifier
│   │   │   ├── safety_analyzer.py
│   │   │   ├── entity_extractor.py
│   │   │   ├── summarizer.py
│   │   │   └── orchestrator.py
│   │   ├── core/              # Security, exceptions
│   │   ├── db/                # Database session
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   ├── config.py          # Settings
│   │   └── main.py            # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js pages
│   │   ├── components/        # React components
│   │   └── lib/               # Utilities
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 📊 Document Categories

The AI automatically classifies documents into:

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

- **Authentication**: Clerk JWT verification with JWKS
- **Authorization**: User-based resource access control
- **Audit Logging**: All actions logged for compliance
- **CORS**: Configured for frontend domains
- **Input Validation**: Pydantic models for all requests
- **SQL Injection Prevention**: SQLAlchemy ORM

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

## 📈 Performance

- **Async Processing**: Document analysis runs in background
- **Parallel Agents**: AI agents execute concurrently
- **Connection Pooling**: Database connection optimization
- **Embedding Cache**: Vector embeddings cached in database
- **Redis Queue**: Celery for distributed task processing

---

## 🚀 Deployment

### Production Docker

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables (Production)

```env
ENVIRONMENT=production
DEBUG=false
DATABASE_URL=postgresql://...
GEMINI_API_KEY=...
CLERK_JWKS_URL=...
REDIS_URL=redis://redis:6379/0
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built for the Mining Industry 🏔️ | Powered by AI 🤖 | Enterprise Ready 🚀</strong>
</div>
