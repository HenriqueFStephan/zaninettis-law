"""SMTP HTML mailer with a local-file fallback when SMTP is not configured."""

from __future__ import annotations

import logging
import smtplib
from dataclasses import dataclass
from datetime import datetime, timezone
from email.message import EmailMessage
from email.utils import formataddr
from pathlib import Path

from app.core.config import DATA_DIR, get_settings

logger = logging.getLogger(__name__)
OUTBOUND_DIR = DATA_DIR / "outbound_emails"


@dataclass(frozen=True)
class SendResult:
    sent: bool
    placeholder_file: str | None = None
    error: str | None = None


def _from_address(settings) -> str:
    smtp_from = getattr(settings, "smtp_from", "") or ""
    if "@" in smtp_from:
        return smtp_from
    if settings.smtp_username and "@" in settings.smtp_username:
        return settings.smtp_username
    return settings.author_email


def _from_header(settings) -> str:
    name = getattr(settings, "author_name", "") or "Zaninettis"
    return formataddr((name, _from_address(settings)))


def _write_placeholder(html_body: str, slug: str) -> Path:
    OUTBOUND_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    path = OUTBOUND_DIR / f"{stamp}_{slug}.html"
    path.write_text(html_body, encoding="utf-8")
    return path


def send_html_email(
    *,
    to: str,
    subject: str,
    html_body: str,
    text_body: str,
    reply_to: str | None = None,
    slug: str = "message",
) -> SendResult:
    """Send an HTML email via SMTP when SMTP_HOST is set.

    Without SMTP, the HTML is saved under backend/data/outbound_emails/.
    """
    settings = get_settings()
    if not settings.smtp_host:
        path = _write_placeholder(html_body, slug)
        return SendResult(
            sent=False,
            placeholder_file=str(path),
            error="SMTP_HOST is not set",
        )
    password = (settings.smtp_password or "").replace(" ", "")
    if settings.smtp_username and not password:
        path = _write_placeholder(html_body, slug)
        return SendResult(
            sent=False,
            placeholder_file=str(path),
            error="SMTP_PASSWORD is not set",
        )

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = _from_header(settings)
    message["To"] = to
    if reply_to:
        message["Reply-To"] = reply_to
    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")

    try:
        if settings.smtp_port == 465:
            smtp: smtplib.SMTP = smtplib.SMTP_SSL(
                settings.smtp_host, settings.smtp_port, timeout=20
            )
        else:
            smtp = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20)
            smtp.ehlo()
            smtp.starttls()
            smtp.ehlo()
        with smtp:
            if settings.smtp_username:
                smtp.login(settings.smtp_username, password)
            smtp.send_message(message)
    except (OSError, smtplib.SMTPException) as exc:
        logger.warning("SMTP send failed: %s", exc)
        path = _write_placeholder(html_body, slug)
        return SendResult(sent=False, placeholder_file=str(path), error=str(exc))

    return SendResult(sent=True)
