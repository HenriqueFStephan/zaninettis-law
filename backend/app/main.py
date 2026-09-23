"""
Zaninettis FastAPI application entry point.

Run: uvicorn app.main:app --reload --port 8000
"""

from fastapi import FastAPI

from app.api.v1 import blog, contact, news, review, services, studio
from app.core.config import get_settings
from app.core.cors import configure_cors
from app.models.schemas import HealthResponse
from app.repositories.json_store import blog_store, news_store, services_store

settings = get_settings()

app = FastAPI(
    title="Zaninettis API",
    description="Portfolio and practice site — updates, articles, services, contact.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

configure_cors(app)

API_PREFIX = "/api/v1"

app.include_router(news.router, prefix=API_PREFIX)
app.include_router(blog.router, prefix=API_PREFIX)
app.include_router(services.router, prefix=API_PREFIX)
app.include_router(contact.router, prefix=API_PREFIX)
app.include_router(review.router, prefix=API_PREFIX)
app.include_router(studio.router, prefix=API_PREFIX)


@app.get("/health", response_model=HealthResponse, tags=["health"])
def health() -> HealthResponse:
    current = get_settings()
    password = (current.smtp_password or "").replace(" ", "")
    github_ok = bool(current.resolved_github_token() and current.github_repo)
    studio_ok = bool(github_ok and (current.studio_access_token or "").strip())
    return HealthResponse(
        status="ok",
        environment=current.app_env,
        smtp_configured=bool(current.smtp_host and password),
        studio_configured=studio_ok,
    )


@app.get("/", tags=["health"])
def root() -> dict:
    return {
        "name": "Zaninettis API",
        "docs": "/docs",
        "health": "/health",
    }


@app.post("/api/v1/admin/reseed", tags=["admin"], include_in_schema=False)
def reseed_demo_stores() -> dict:
    """Reload news, articles, and services from committed seed JSON."""
    news_store.load_seed()
    blog_store.load_seed()
    services_store.load_seed()
    return {"status": "reseeded"}
