# MiningNiti — Agent Instructions

## Project Layout

Two independent apps in a single repo (no monorepo tooling — root `package.json` is empty):

- **`backend/`** — FastAPI 0.128 + Python 3.11, SQLAlchemy + pgvector, multi-provider AI (Gemini, Groq, Mistral, Cerebras)
- **`frontend/`** — Next.js 16 (App Router), React 19, Clerk auth, Tailwind CSS v4, shadcn/ui

## Key Commands

### Backend (`backend/`)
```bash
# Run dev server (from backend/)
uvicorn app.main:app --reload --port 8000
# or
python run.py

# Install deps
pip install -r requirements.txt

# Tests (unit only — fast, uses SQLite in-memory)
pytest tests/unit/ -v -m unit

# Tests (integration — needs running PostgreSQL + Redis)
pytest tests/integration/ -v -m integration

# Lint/format
black --check app/ tests/
isort --check-only app/ tests/

# Type check (non-blocking in CI, gradual adoption)
mypy app/ --ignore-missing-imports
```

### Frontend (`frontend/`)
```bash
npm install
npm run dev     # dev server on port 3000
npm run build   # production build (standalone output)
npm run lint    # next lint
```

### Docker (full stack)
```bash
docker-compose up -d          # postgres, redis, backend, frontend
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Setup

1. Copy `backend/.env.example` → `backend/.env` (required: `DATABASE_URL`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `MISTRAL_API_KEY`, `CLERK_JWKS_URL`)
2. Frontend needs `NEXT_PUBLIC_API_BASE_URL` and Clerk keys (no `.env.local.example` exists — check `frontend/src/lib/api.ts` for defaults)

## Architecture Notes

- **API prefix**: All endpoints live under `/api/v1` (configured via `settings.API_V1_PREFIX`)
- **Auth**: Clerk JWT verified server-side via JWKS endpoint. User ID comes from JWT `sub` claim.
- **Database**: PostgreSQL 16 with `pgvector` extension. Tables auto-created on startup (`init_db()`). `pgvector` extension created via raw SQL if missing.
- **Agent pipeline**: Document upload → Orchestrator runs 4 agents in parallel (classifier, safety, entity extraction, summarizer) → chunks + embeddings saved to pgvector
- **Background work**: Uses FastAPI `BackgroundTasks` in dev; Celery worker available for production scaling (`celery -A app.workers.celery_app worker`)
- **Crash recovery**: On startup, documents stuck in `processing`/`analyzing` state are auto-reset to `PENDING`
- **LLM providers**: Groq, Mistral, and Cerebras all use the OpenAI-compatible client (`AsyncOpenAI` with custom `base_url`). Gemini uses the native `google-generativeai` SDK.

## Testing

- **Unit tests** (`tests/unit/`): Use SQLite in-memory, no external services needed. Fixtures in `tests/conftest.py` mock auth and inject test DB sessions.
- **Integration tests** (`tests/integration/`): Require running PostgreSQL (with pgvector) and Redis. Marked with `@pytest.mark.integration`.
- **pytest config**: `asyncio_mode = auto` — async tests run without explicit `@pytest.mark.asyncio`.
- **Test markers**: `unit`, `integration`, `slow`. Use `-m unit` to skip integration tests.
- **CI** runs unit tests with coverage, integration tests as non-blocking.

## Linting & Formatting

- **Backend**: `black` (formatter), `isort` (import order), `mypy` (type check, non-blocking)
- **Frontend**: `next lint` (ESLint with next/core-web-vitals + next/typescript). Several rules disabled: `no-unused-vars`, `no-explicit-any`, `ban-ts-comment`, `exhaustive-deps` — this is intentional for rapid development.
- **CI**: Lint/format checks are enforced; mypy and security scans are non-blocking (`continue-on-error: true`).

## Deployment

- **Production deploy**: Push to `main` triggers GitHub Actions → builds Docker image → pushes to AWS ECR → deploys to ECS
- **Frontend**: Vercel (uses `output: "standalone"` for Docker compatibility)
- **Backend Dockerfile**: Multi-stage build (builder + runtime), runs as non-root user `appuser`

## Gotchas

- Root `package.json` is `{}` — don't run `npm install` from root
- `DATABASE_URL` in docker-compose uses `psycopg2` driver format; the backend also needs `psycopg` (binary) for async
- Celery is commented out in `requirements.txt` — uncomment for production background workers
- The `frontend/.env.local` file is gitignored with no example file — check `frontend/src/lib/api.ts:5` for the `NEXT_PUBLIC_API_BASE_URL` fallback
- `pytest.ini` sets `asyncio_mode = auto` globally — don't add explicit async markers
