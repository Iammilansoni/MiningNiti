# Build stage — compile dependencies
FROM python:3.14-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:0.9 /uv /uvx /bin/

WORKDIR /build

# Install build tools
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_NO_CACHE=1 \
    UV_PROJECT_ENVIRONMENT=/opt/venv \
    PATH="/opt/venv/bin:$PATH"

COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev

# ─────────────────────────────────────────────────────────────────────────────
# Runtime stage — minimal image
FROM python:3.14-slim AS runtime

# Install only runtime system libraries.
#   tesseract-ocr    — OCR engine for scanned documents (pytesseract wraps it)
#   poppler-utils    — pdftoppm, used by pdf2image to rasterise pages for OCR
# Without these, ingestion still works; scanned pages just yield no text.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libmagic1 \
    curl \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
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

# Create cache and upload directories.
#
# /app/uploads must exist and be writable *before* the app runs. WORKDIR
# creates /app owned by root, and `COPY --chown` only changes the ownership of
# the files copied into it — not the directory itself. So appuser could read
# /app but not create entries in it, and the upload endpoint died with:
#
#   PermissionError: [Errno 13] Permission denied: '/app/uploads'
#
# from os.makedirs() on the very first upload. Creating it here, and taking
# ownership of /app itself, fixes that.
RUN mkdir -p /app/.cache/huggingface /app/.cache/sentence-transformers /app/uploads \
    && chown -R appuser:appgroup /app

# Copy application code
COPY --chown=appuser:appgroup . .

# The entrypoint must be executable regardless of the checkout's file mode,
# which is not preserved on Windows clones.
RUN chmod +x /app/entrypoint.sh

# Re-assert ownership: the COPY above can reintroduce root-owned paths, and
# /app must stay writable for uploads.
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 8000

# Health check for Docker and orchestrators
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Migrations run first, then the server — see entrypoint.sh.
# Worker count is overridable via GUNICORN_WORKERS; each worker loads its own
# copy of the cross-encoder, so raising it costs roughly 400MB apiece.
CMD ["./entrypoint.sh"]
