"""HTML body for a practice-area inquiry."""

from __future__ import annotations

import html


def intake_subject(name: str) -> str:
    return f"Zaninettis — consulta de {name.strip()}"


def intake_text_body(
    *,
    name: str,
    email: str,
    company: str,
    phone: str,
    services: list[str],
    message: str,
    received_at: str,
) -> str:
    lines = [
        f"Nome: {name}",
        f"E-mail: {email}",
        f"Organização: {company or '—'}",
        f"Telefone: {phone or '—'}",
        f"Áreas: {', '.join(services) if services else '—'}",
        f"Recebido: {received_at}",
        "",
        message,
    ]
    return "\n".join(lines)


def intake_html_body(
    *,
    name: str,
    email: str,
    company: str,
    phone: str,
    services: list[str],
    message: str,
    received_at: str,
) -> str:
    def esc(value: str) -> str:
        return html.escape(value or "—")

    areas = "".join(f"<li>{esc(item)}</li>" for item in services) or "<li>—</li>"
    return f"""<!doctype html>
<html lang="pt-BR"><body style="font-family:Georgia,serif;color:#1a1814;background:#f4efe6;padding:24px">
  <h1 style="font-weight:400;font-size:22px">Nova consulta — Zaninettis</h1>
  <p><strong>Nome:</strong> {esc(name)}<br>
  <strong>E-mail:</strong> {esc(email)}<br>
  <strong>Organização:</strong> {esc(company)}<br>
  <strong>Telefone:</strong> {esc(phone)}<br>
  <strong>Recebido:</strong> {esc(received_at)}</p>
  <p><strong>Áreas</strong></p>
  <ul>{areas}</ul>
  <p style="white-space:pre-wrap">{esc(message)}</p>
</body></html>"""
