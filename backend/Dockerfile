# Build stage — compile dependencies
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build tools
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install PyTorch CPU-only first (smaller than GPU version)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ─────────────────────────────────────────────────────────────────────────────
# Runtime stage — minimal image
FROM python:3.11-slim AS runtime

# Install only runtime system libraries
RUN apt-get update && apt-get install -y \
    libpq5 \
    libmagic1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy installed packages from builder stage
COPY --from=builder /opt/venv /opt/venv

# Ensure scripts in venv are usable
ENV PATH="/opt/venv/bin:$PATH"

# sentence-transformers config: use CPU, limit memory
ENV TOKENIZERS_PARALLELISM=false
ENV TRANSFORMERS_CACHE=/app/.cache/huggingface
ENV SENTENCE_TRANSFORMERS_HOME=/app/.cache/sentence-transformers

# Create non-root user for security
RUN groupadd --gid 1001 appgroup \
    && useradd --uid 1001 --gid appgroup --shell /bin/sh --create-home appuser

# Create cache directory for model downloads
RUN mkdir -p /app/.cache/huggingface /app/.cache/sentence-transformers \
    && chown -R appuser:appgroup /app/.cache

# Copy application code
COPY --chown=appuser:appgroup . .

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 8000

# Health check for Docker and orchestrators
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Production: gunicorn with uvicorn workers
# Workers = (2 * CPU_COUNT) + 1 — override via GUNICORN_WORKERS env var
CMD ["sh", "-c", "gunicorn app.main:app \
    --worker-class uvicorn.workers.UvicornWorker \
    --workers ${GUNICORN_WORKERS:-2} \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --keep-alive 5 \
    --access-logfile - \
    --error-logfile -"]
