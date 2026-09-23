"""Review queue — agent discoveries awaiting a human decision."""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.models.schemas import ReviewDecision, ReviewItem
from app.repositories.json_store import (
    blog_store,
    get_review_queue,
    new_id,
    news_store,
    save_review_queue,
)

router = APIRouter(prefix="/review", tags=["review"])


@router.get("", response_model=list[ReviewItem])
def list_pending(status: str = "pending") -> list[ReviewItem]:
    items = [i for i in get_review_queue() if i.get("status") == status]
    return [ReviewItem.model_validate(i) for i in items]


@router.post("/{item_id}/decide")
def decide(item_id: str, decision: ReviewDecision) -> dict:
    items = get_review_queue()
    for item in items:
        if item.get("id") != item_id:
            continue
        item["status"] = decision.status
        item["decided_at"] = datetime.now(timezone.utc).isoformat()
        if decision.status == "approved":
            _publish(item)
        save_review_queue(items)
        return {"id": item_id, "status": decision.status}
    raise HTTPException(status_code=404, detail="Review item not found")


def _publish(item: dict) -> None:
    now = datetime.now(timezone.utc).isoformat()
    if item.get("kind") == "blog":
        slug = str(item.get("slug") or item["id"])
        blog_store.append(
            {
                "id": new_id(),
                "slug": slug,
                "title": item.get("title") or "Nota",
                "excerpt": item.get("summary") or "",
                "content_markdown": item.get("summary") or "",
                "tags": item.get("tags") or [],
                "published_at": now,
                "author_name": "Zaninettis",
                "source_url": item.get("source_url") or "",
            }
        )
        return
    news_store.append(
        {
            "id": new_id(),
            "title": item.get("title") or "Atualização",
            "summary": item.get("summary") or "",
            "content": item.get("summary") or "",
            "source_name": item.get("source_name") or "",
            "source_url": item.get("source_url") or "",
            "region": "BR",
            "status": "approved",
            "published_at": now,
            "tags": item.get("tags") or [],
        }
    )
