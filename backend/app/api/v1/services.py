"""Practice areas and intake requests."""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

from app.core.config import get_settings
from app.core.locale import CONSULTING_SAVED, CONSULTING_SENT, localize_list, normalize_lang
from app.models.schemas import (
    ConsultingRequestCreate,
    ConsultingRequestResponse,
    ServiceOffering,
)
from app.repositories.json_store import consulting_store, new_id, services_store
from app.services.intake_email import intake_html_body, intake_subject, intake_text_body
from app.services.mailer import send_html_email

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=list[ServiceOffering])
def list_services(lang: str | None = Query(default=None)) -> list[ServiceOffering]:
    locale = normalize_lang(lang)
    return [
        ServiceOffering.model_validate(i)
        for i in localize_list(services_store.read_all(), locale)
    ]


@router.post("/consulting-request", response_model=ConsultingRequestResponse)
def submit_consulting_request(
    payload: ConsultingRequestCreate,
    lang: str | None = Query(default=None),
) -> ConsultingRequestResponse:
    offerings = {
        item["id"]: ServiceOffering.model_validate(item)
        for item in services_store.read_all()
    }
    unknown = [sid for sid in payload.service_ids if sid not in offerings]
    if unknown:
        raise HTTPException(status_code=422, detail=f"Unknown service ids: {unknown}")

    selected = [offerings[sid] for sid in payload.service_ids]
    service_titles = [svc.title for svc in selected]
    received_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    html_body = intake_html_body(
        name=payload.name,
        email=str(payload.email),
        company=payload.company,
        phone=payload.phone,
        services=service_titles,
        message=payload.message,
        received_at=received_at,
    )
    text_body = intake_text_body(
        name=payload.name,
        email=str(payload.email),
        company=payload.company,
        phone=payload.phone,
        services=service_titles,
        message=payload.message,
        received_at=received_at,
    )

    settings = get_settings()
    recipient = settings.consulting_notify_to or settings.author_email
    mail = send_html_email(
        to=recipient,
        subject=intake_subject(payload.name),
        html_body=html_body,
        text_body=text_body,
        reply_to=str(payload.email),
        slug="consulting-request",
    )

    consulting_store.append(
        {
            "id": new_id(),
            "received_at": received_at,
            "email_sent": mail.sent,
            **payload.model_dump(mode="json"),
        }
    )

    locale = normalize_lang(lang)
    return ConsultingRequestResponse(
        success=True,
        message=CONSULTING_SENT[locale] if mail.sent else CONSULTING_SAVED[locale],
        email_sent=mail.sent,
        email_error=mail.error,
    )
