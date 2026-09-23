# Zaninettis API — Render deploy from monorepo root.
# Backend code lives in backend/; this file wraps it for deployment.

FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Render injects PORT at runtime
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}
