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

# Create cache directory for model downloads
RUN mkdir -p /app/.cache/huggingface /app/.cache/sentence-transformers \
    && chown -R appuser:appgroup /app/.cache

# Copy application code
COPY --chown=appuser:appgroup . .

# The entrypoint must be executable regardless of the checkout's file mode,
# which is not preserved on Windows clones.
RUN chmod +x /app/entrypoint.sh

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
