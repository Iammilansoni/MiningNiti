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
- **Database**: PostgreSQL 16 with `pgvector` + `pg_trgm`. Schema is owned by Alembic (`alembic upgrade head`, run automatically by `scripts/migrate.py` at container start). `init_db()` still runs `create_all()` as a safety net and calls `ensure_indexes()`, which idempotently creates the HNSW and GIN trigram indexes that `create_all()` cannot express.
  - `scripts/migrate.py` handles three cases: fresh DB, a legacy DB built by `create_all()` with no `alembic_version` (stamped at `001`, then indexes ensured), and a DB already under Alembic.
- **Agent pipeline**: Document upload → Orchestrator runs the classifier first (its category feeds the others), then safety, entity extraction and summarizer concurrently via `asyncio.gather` → chunks + embeddings saved to pgvector. A fifth agent, the compliance auditor, is **not** in this pipeline — it runs on demand from `compliance_service.py` when an audit is created.
- **Analysis cache**: `services/analysis_cache.py` keys completed analyses by SHA-256 of the extracted text plus `PIPELINE_VERSION`, so identical content skips all four LLM calls. Failed or partial analyses are never cached, which is what keeps re-analysis working after a quota error. No-ops when Redis is absent.
- **Agent retries**: Retry and provider-fallback live in `BaseAgent._generate_json` **only**. Do not add a second backoff layer in the orchestrator — one existed and multiplied with the inner one (up to 9 attempts and minutes of sleep per agent).
- **Background work**: An in-process `asyncio.Queue` (`services/queue.py`) with a worker started at app startup. There is no Celery and no `app/workers/` package. Queued work does not survive a restart or scale across replicas.
- **Crash recovery**: On startup, documents stuck in `processing`/`analyzing` state are auto-reset to `PENDING`
- **LLM providers**: Groq, Mistral, and Cerebras all use the OpenAI-compatible client (`AsyncOpenAI` with custom `base_url`). Gemini uses the native `google-generativeai` SDK.

## Testing

- **Unit tests** (`tests/unit/`): Use SQLite in-memory, no external services needed. Fixtures in `tests/conftest.py` mock auth and inject test DB sessions.
- **Integration tests** (`tests/integration/`): Require running PostgreSQL (with pgvector) and Redis. Marked with `@pytest.mark.integration`.
- **pytest config**: `asyncio_mode = auto` — async tests run without explicit `@pytest.mark.asyncio`.
- **Test markers**: `unit`, `integration`, `slow`, `synthetic`, `live`, `retrieval`, `uses_cache`. Use `-m unit` to skip integration tests.
- **Analysis cache in tests**: an autouse fixture in `conftest.py` disables it for every test, because `REDIS_URL` points at localhost and a live cache would let one test serve another's mocked result. Opt back in with `@pytest.mark.uses_cache`.
- **Mocking agents**: mock `agent.client` for Groq/Mistral/Cerebras agents and `agent.model` only for Gemini ones. Mocking the wrong attribute leaves the real client in place and the test silently hits the network.
- **CI** runs unit tests with coverage, integration tests as non-blocking.

## Linting & Formatting

- **Backend**: `black` (formatter), `isort` (import order), `mypy` (type check, non-blocking)
- **Frontend**: `next lint` (ESLint with next/core-web-vitals + next/typescript). Several rules disabled: `no-unused-vars`, `no-explicit-any`, `ban-ts-comment`, `exhaustive-deps` — this is intentional for rapid development.
- **CI**: Lint/format checks are enforced; mypy and security scans are non-blocking (`continue-on-error: true`).

## Deployment

- **Backend**: Push to `main` touching `backend/**` triggers `.github/workflows/deploy.yml`, which uploads `backend/` to a HuggingFace Docker Space. Requires the `HF_TOKEN` secret and the `HF_SPACE_ID` variable. Space config lives in `backend/README.md` frontmatter (`sdk: docker`, `app_port: 8000`).
  - There is no AWS/ECS deployment. The previous workflow referenced a `backend/task-definition.json` that never existed and failed on every push.
- **Frontend**: Vercel (uses `output: "standalone"` for Docker compatibility)
- **Backend Dockerfile**: Multi-stage build (builder + runtime), runs as non-root user `appuser`
- **Migrations run at container start** via `entrypoint.sh` → `python -m scripts.migrate`, before gunicorn binds. A failed migration stops the deploy rather than serving on a half-built schema.

## Gotchas

- Root `package.json` is `{}` — don't run `npm install` from root
- `DATABASE_URL` in docker-compose uses `psycopg2` driver format; the backend also needs `psycopg` (binary) for async
- There is no Celery integration despite the commented-out dependency in `requirements.txt`; background work is the in-process `asyncio.Queue` described above
- The `frontend/.env.local` file is gitignored with no example file — check `frontend/src/lib/api.ts:5` for the `NEXT_PUBLIC_API_BASE_URL` fallback
- `pytest.ini` sets `asyncio_mode = auto` globally — don't add explicit async markers
