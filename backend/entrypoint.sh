#!/bin/sh
# Container entrypoint: bring the schema up to date, then serve.
#
# Migrations run here rather than in the application's lifespan so that a
# failed migration stops the deploy instead of leaving a running API on top of
# a half-built schema.
set -e

echo "[entrypoint] Running database migrations..."
python -m scripts.migrate

echo "[entrypoint] Starting API server..."
exec gunicorn app.main:app \
    --worker-class uvicorn.workers.UvicornWorker \
    --workers "${GUNICORN_WORKERS:-2}" \
    --bind "0.0.0.0:${PORT:-8000}" \
    --timeout 120 \
    --keep-alive 5 \
    --access-logfile - \
    --error-logfile -
