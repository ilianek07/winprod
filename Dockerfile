# ── Stage 1 : Build React frontend ────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /build/frontend

# Install deps first (layer cache)
COPY app/frontend/package*.json ./
RUN npm ci --prefer-offline

COPY app/frontend/ ./
RUN npm run build:prod


# ── Stage 2 : Image de production Python ──────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Dépendances système minimales (asyncpg, cryptography, PyMuPDF ont des wheels binaires)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Installer les dépendances Python dans un venv isolé
COPY app/backend/requirements.txt ./
RUN python -m venv /venv \
    && /venv/bin/pip install --upgrade pip \
    && /venv/bin/pip install --no-cache-dir -r requirements.txt

ENV PATH="/venv/bin:$PATH"

# Copier le code backend
COPY app/backend/ ./

# Copier le frontend buildé dans static_frontend/ (servi par FastAPI)
COPY --from=frontend-builder /build/frontend/dist ./static_frontend

EXPOSE 8000

# Railway injecte $PORT ; fallback 8000 pour docker run local
CMD alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
