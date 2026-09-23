"""Articles API."""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

from app.core.config import get_settings
from app.core.locale import localize_item, localize_list, normalize_lang
from app.models.schemas import BlogPost, BlogPostCreate
from app.repositories.json_store import blog_store, new_id

router = APIRouter(prefix="/blog", tags=["blog"])


def _sort_key(item: dict) -> str:
    return str(item.get("published_at") or "")


@router.get("", response_model=list[BlogPost])
def list_posts(
    tag: str | None = None,
    limit: int = 50,
    lang: str | None = Query(default=None),
) -> list[BlogPost]:
    items = localize_list(blog_store.read_all(), normalize_lang(lang))
    if tag:
        items = [i for i in items if tag in i.get("tags", [])]
    items.sort(key=_sort_key, reverse=True)
    return [BlogPost.model_validate(i) for i in items[:limit]]


@router.get("/slug/{slug}", response_model=BlogPost)
def get_by_slug(slug: str, lang: str | None = Query(default=None)) -> BlogPost:
    locale = normalize_lang(lang)
    for item in blog_store.read_all():
        if item["slug"] == slug:
            return BlogPost.model_validate(localize_item(item, locale))
    raise HTTPException(status_code=404, detail="Post not found")


@router.get("/{post_id}", response_model=BlogPost)
def get_post(post_id: str, lang: str | None = Query(default=None)) -> BlogPost:
    locale = normalize_lang(lang)
    for item in blog_store.read_all():
        if item["id"] == post_id:
            return BlogPost.model_validate(localize_item(item, locale))
    raise HTTPException(status_code=404, detail="Post not found")


@router.post("", response_model=BlogPost, status_code=201)
def create_post(payload: BlogPostCreate) -> BlogPost:
    now = datetime.now(timezone.utc).isoformat()
    record = {
        "id": new_id(),
        "author_name": get_settings().author_name or "Zaninettis",
        "published_at": now,
        **payload.model_dump(mode="json"),
    }
    blog_store.append(record)
    return BlogPost.model_validate(record)
