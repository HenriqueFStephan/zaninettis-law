"""Contact form API — stores messages locally."""

from datetime import datetime, timezone

from fastapi import APIRouter, Query

from app.core.config import get_settings
from app.core.locale import CONTACT_OK, normalize_lang
from app.models.schemas import ContactMessageCreate, ContactMessageResponse
from app.repositories.json_store import contact_store, new_id

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=ContactMessageResponse)
def submit_contact(
    payload: ContactMessageCreate,
    lang: str | None = Query(default=None),
) -> ContactMessageResponse:
    settings = get_settings()
    record = {
        "id": new_id(),
        "received_at": datetime.now(timezone.utc).isoformat(),
        "notified_to": settings.author_email,
        **payload.model_dump(mode="json"),
    }
    contact_store.append(record)
    return ContactMessageResponse(success=True, message=CONTACT_OK[normalize_lang(lang)])
