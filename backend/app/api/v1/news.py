"""Legal updates API."""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

from app.core.locale import localize_item, localize_list, normalize_lang
from app.models.schemas import NewsArticle, NewsArticleCreate
from app.repositories.json_store import new_id, news_store

router = APIRouter(prefix="/news", tags=["news"])


@router.get("", response_model=list[NewsArticle])
def list_news(
    region: str | None = None,
    limit: int = 50,
    lang: str | None = Query(default=None),
) -> list[NewsArticle]:
    items = news_store.read_all()
    published = [i for i in items if i.get("status", "approved") == "approved"]
    if region:
        published = [i for i in published if i.get("region") == region]
    published.sort(key=lambda x: x.get("published_at", ""), reverse=True)
    localized = localize_list(published[:limit], normalize_lang(lang))
    return [NewsArticle.model_validate(i) for i in localized]


@router.get("/{article_id}", response_model=NewsArticle)
def get_news(article_id: str, lang: str | None = Query(default=None)) -> NewsArticle:
    locale = normalize_lang(lang)
    for item in news_store.read_all():
        if item["id"] == article_id:
            return NewsArticle.model_validate(localize_item(item, locale))
    raise HTTPException(status_code=404, detail="Article not found")


@router.post("", response_model=NewsArticle, status_code=201)
def create_news(payload: NewsArticleCreate) -> NewsArticle:
    now = datetime.now(timezone.utc).isoformat()
    record = {
        "id": new_id(),
        "status": "approved",
        "published_at": now,
        **payload.model_dump(mode="json"),
    }
    news_store.append(record)
    return NewsArticle.model_validate(record)
