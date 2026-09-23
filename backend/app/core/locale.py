"""Request-language helpers for public API payloads."""

from __future__ import annotations

from copy import deepcopy
from typing import Any

Lang = str  # "pt-BR" | "en"

PT_TO_EN_HEADINGS = (
    ("## O que mudou", "## What changed"),
    ("## Fonte oficial", "## Official source"),
    ("## Quem é afetado", "## Who is affected"),
    ("## Leitura prática", "## Practical reading"),
    ("## Fonte", "## Source"),
    ("## Referência", "## Reference"),
)

CONTACT_OK = {
    "pt-BR": "Mensagem recebida. Retornaremos em breve.",
    "en": "Message received. We will get back to you soon.",
}

CONSULTING_SENT = {
    "pt-BR": "Solicitação enviada. Retornaremos em breve.",
    "en": "Request sent. We will get back to you soon.",
}

CONSULTING_SAVED = {
    "pt-BR": "Solicitação registrada. Retornaremos em breve.",
    "en": "Request recorded. We will get back to you soon.",
}


def normalize_lang(value: str | None) -> Lang:
    """Map query/header values to the two supported site languages."""
    if not value:
        return "pt-BR"
    token = value.strip().lower().replace("_", "-").split(",")[0].split(";")[0]
    if token.startswith("en"):
        return "en"
    return "pt-BR"


def _translate_headings(markdown: str, lang: Lang) -> str:
    if lang != "en" or not markdown:
        return markdown
    out = markdown
    for src, dst in PT_TO_EN_HEADINGS:
        out = out.replace(src, dst)
    return out


def localize_item(item: dict[str, Any], lang: Lang) -> dict[str, Any]:
    """Return a copy of a stored record with `i18n.<lang>` overlays applied."""
    out = deepcopy(item)
    overlay = (out.pop("i18n", None) or {}).get(lang) or {}

    if lang == "pt-BR" and out.get("title_pt"):
        out["title"] = out["title_pt"]

    for key, value in overlay.items():
        if value not in (None, ""):
            out[key] = value

    if isinstance(out.get("content_markdown"), str):
        out["content_markdown"] = _translate_headings(out["content_markdown"], lang)

    return out


def localize_list(items: list[dict[str, Any]], lang: Lang) -> list[dict[str, Any]]:
    return [localize_item(item, lang) for item in items]
