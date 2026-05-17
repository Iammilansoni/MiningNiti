# MiningNiti Enterprise Backend

Production-ready AI Document Intelligence Engine for the Mining Industry.

## Structure

```
app/
├── api/          # REST API endpoints
├── agents/       # AI agents (LangGraph)
├── core/         # Security, config, exceptions
├── db/           # Database session & migrations
├── models/       # SQLAlchemy ORM models
├── schemas/      # Pydantic request/response schemas
├── services/     # Business logic layer
└── workers/      # Celery background tasks
```

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000

# Run Celery worker
celery -A app.workers.celery_app worker -l info
```
