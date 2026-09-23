#!/usr/bin/env python3
"""
On-demand research for one branch of Brazilian law.

Launches a Cursor cloud agent, waits for a JSON digest, and opens a GitHub
issue labeled `law-research` and `research` (never `solve`). A later `[POST]`
comment on that issue is what publishes an item onto the site.
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import sys
import textwrap
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

SCRIPTS_DIR = Path(__file__).resolve().parent
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from run_issue_solver_agents import (  # noqa: E402
    CURSOR_API_BASE,
    GITHUB_API_BASE,
    ApiError,
    _http_json,
    ensure_label,
    github_headers,
    log,
)

DEFAULT_MODEL = "composer-2.5"
DEFAULT_LABELS = ("law-research", "research")
TERMINAL_STATUSES = {"FINISHED", "ERROR", "CANCELLED", "EXPIRED"}
REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CATALOG = REPO_ROOT / "agents" / "data" / "discovered_law.json"
OFFICIAL_SOURCES = (
    "https://www.planalto.gov.br",
    "https://portal.stf.jus.br",
    "https://www.stj.jus.br",
    "https://www.in.gov.br",
    "https://www.tst.jus.br",
)

FOCUS_NOTES = {
    "updates": "Recent statutes, provisional measures, regulations, and official gazette items.",
    "jurisprudence": "Recent decisions from STF, STJ, TST, or other competent courts. Cite the case number.",
    "doctrine": "Notable published commentary from identifiable authors and outlets. Mark it as commentary, not as a holding.",
}


def cursor_headers(cursor_api_key: str) -> dict[str, str]:
    token = base64.b64encode(f"{cursor_api_key}:".encode("utf-8")).decode("ascii")
    return {"Authorization": f"Basic {token}", "Accept": "application/json"}


def build_prompt(branch: str, focus: str, date_str: str, max_items: int, known_urls: list[str]) -> str:
    known = "\n".join(f"- {url}" for url in known_urls) or "- (none)"
    sources = "\n".join(f"- {url}" for url in OFFICIAL_SOURCES)
    return textwrap.dedent(
        f"""
        Research Brazilian law for the branch "{branch}" as of {date_str}.
        Focus: {focus}. {FOCUS_NOTES.get(focus, FOCUS_NOTES["updates"])}

        Prefer these official origins when they apply:
        {sources}

        Return at most {max_items} items. Skip anything whose URL is already known:
        {known}

        Rules:
        - Every item needs a real, openable source URL.
        - Do not invent case numbers, dates, or article numbers.
        - Write titles and summaries in Portuguese.
        - Do not modify repository files and do not open a pull request.
        - Your entire deliverable is one JSON object, optionally inside a ```json fence:

        {{
          "branch": "{branch}",
          "focus": "{focus}",
          "items": [
            {{
              "title": "",
              "source_name": "",
              "source_url": "https://...",
              "published": "YYYY-MM-DD",
              "summary": "",
              "why_it_matters": ""
            }}
          ]
        }}
        """
    ).strip()


def create_research_agent(**kwargs: Any) -> dict[str, Any]:
    headers = cursor_headers(kwargs["cursor_api_key"])
    payload = {
        "name": kwargs["run_name"],
        "prompt": {"text": kwargs["prompt"]},
        "model": {"id": kwargs["model"]},
        "repos": [{"url": kwargs["repo_url"], "startingRef": kwargs["base_ref"]}],
        "autoCreatePR": False,
    }
    result = _http_json("POST", f"{CURSOR_API_BASE}/agents", headers=headers, payload=payload)
    if not isinstance(result, dict):
        raise ApiError(f"Unexpected Cursor response: {type(result)}")
    return result


def wait_for_run(*, cursor_api_key: str, agent_id: str, run_id: str, poll_interval: int, timeout: int) -> dict[str, Any]:
    headers = cursor_headers(cursor_api_key)
    deadline = time.monotonic() + timeout
    last = ""
    while True:
        run = _http_json("GET", f"{CURSOR_API_BASE}/agents/{agent_id}/runs/{run_id}", headers=headers)
        if not isinstance(run, dict):
            raise ApiError(f"Unexpected Cursor run response: {type(run)}")
        status = str(run.get("status") or "").upper()
        if status != last:
            log(f"Run {run_id} status: {status or 'UNKNOWN'}")
            last = status
        if status in TERMINAL_STATUSES:
            return run
        if time.monotonic() >= deadline:
            raise ApiError(f"Timed out after {timeout}s waiting for run {run_id}")
        time.sleep(max(poll_interval, 1))


def extract_json_payload(text: str) -> dict[str, Any]:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end <= start:
        raise ValueError("Agent returned no JSON object")
    parsed = json.loads(text[start : end + 1])
    if not isinstance(parsed, dict):
        raise ValueError("Agent JSON was not an object")
    return parsed


def load_catalog(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"items": []}
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        return {"items": []}
    data.setdefault("items", [])
    return data


def render_issue(branch: str, focus: str, date_str: str, items: list[dict[str, Any]], agent_url: str) -> str:
    lines = [
        f"Pesquisa jurídica sob demanda — **{branch}** ({focus}) em {date_str}.",
        "",
        "Para publicar um item no site, comente nesta issue começando com `[POST]` e o título do item.",
        "Não adicione o rótulo `solve`: isto é pesquisa, não uma tarefa de código.",
        "",
    ]
    if agent_url:
        lines.append(f"Agente: {agent_url}")
        lines.append("")
    for index, item in enumerate(items, start=1):
        title = str(item.get("title") or "Sem título")
        url = str(item.get("source_url") or "")
        source = str(item.get("source_name") or "")
        published = str(item.get("published") or "")
        summary = str(item.get("summary") or "")
        why = str(item.get("why_it_matters") or "")
        lines.append(f"### {index}. {title}")
        if url:
            lines.append(f"- Fonte: [{source or url}]({url})")
        if published:
            lines.append(f"- Data: {published}")
        if summary:
            lines.append(f"- Resumo: {summary}")
        if why:
            lines.append(f"- Por que importa: {why}")
        lines.append("")
    return "\n".join(lines).strip() + "\n"


def publish_issue(*, repo: str, token: str, title: str, body: str, labels: list[str]) -> str:
    headers = github_headers(token)
    for name, color, description in (
        ("law-research", "1D4E89", "On-demand legal research digest"),
        ("research", "0E8A16", "Research note — not a coding task"),
    ):
        if name in labels:
            ensure_label(repo, headers, name, color, description)
    created = _http_json(
        "POST",
        f"{GITHUB_API_BASE}/repos/{repo}/issues",
        headers=headers,
        payload={"title": title, "body": body, "labels": labels},
    )
    if not isinstance(created, dict):
        raise ApiError("GitHub did not return an issue")
    return str(created.get("html_url") or "")


def main() -> int:
    parser = argparse.ArgumentParser(description="On-demand Brazilian law research via a Cursor cloud agent.")
    parser.add_argument("--repo", required=True)
    parser.add_argument("--repo-url", required=True)
    parser.add_argument("--base-ref", default="main")
    parser.add_argument("--branch-of-law", required=True, help="Practice area, e.g. trabalhista")
    parser.add_argument("--focus", choices=tuple(FOCUS_NOTES), default="updates")
    parser.add_argument("--date", default="")
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--max-items", type=int, default=8)
    parser.add_argument("--catalog", default=str(DEFAULT_CATALOG))
    parser.add_argument("--poll-interval", type=int, default=30)
    parser.add_argument("--timeout", type=int, default=3600)
    parser.add_argument("--output-dir", default="")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    branch = args.branch_of_law.strip()
    if not branch:
        log("--branch-of-law is required", error=True)
        return 2
    date_str = args.date.strip() or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    catalog_path = Path(args.catalog)
    catalog = load_catalog(catalog_path)
    known = [str(item.get("source_url")) for item in catalog.get("items", []) if isinstance(item, dict) and item.get("source_url")]
    prompt = build_prompt(branch, args.focus, date_str, args.max_items, known)

    if args.dry_run:
        log(f"[DRY RUN] Would research '{branch}' ({args.focus}) on {date_str}\n")
        log(prompt)
        return 0

    cursor_api_key = os.environ.get("CURSOR_API_KEY")
    github_token = os.environ.get("GITHUB_TOKEN")
    if not cursor_api_key:
        log("Missing required env var: CURSOR_API_KEY", error=True)
        return 2
    if not github_token:
        log("Missing required env var: GITHUB_TOKEN", error=True)
        return 2

    run_name = f"Law research {branch} {date_str}"
    response = create_research_agent(
        cursor_api_key=cursor_api_key,
        model=args.model,
        repo_url=args.repo_url,
        base_ref=args.base_ref,
        prompt=prompt,
        run_name=run_name,
    )
    agent = response.get("agent") if isinstance(response.get("agent"), dict) else {}
    run = response.get("run") if isinstance(response.get("run"), dict) else {}
    agent_id = str(agent.get("id") or response.get("id") or "")
    run_id = str(run.get("id") or agent.get("latestRunId") or "")
    if not agent_id or not run_id:
        log(f"Cursor did not return agent/run ids: {json.dumps(response)[:2000]}", error=True)
        return 1
    agent_url = str(agent.get("url") or f"https://cursor.com/agents/{agent_id}")
    log(f"Launched agent {agent_id} (run {run_id}) -> {agent_url}")

    final_run = wait_for_run(
        cursor_api_key=cursor_api_key,
        agent_id=agent_id,
        run_id=run_id,
        poll_interval=args.poll_interval,
        timeout=args.timeout,
    )
    status = str(final_run.get("status") or "").upper()
    if status != "FINISHED":
        log(f"Run {run_id} ended with status {status}", error=True)
        return 1

    payload = extract_json_payload(str(final_run.get("result") or ""))
    items = [item for item in payload.get("items", []) if isinstance(item, dict) and item.get("source_url")]
    if not items:
        log("No sourced items returned; skipping issue creation.")
        return 0

    title = f"[RESEARCH] Pesquisa jurídica — {branch} {date_str}"
    body = render_issue(branch, args.focus, date_str, items, agent_url)
    if args.output_dir:
        out = Path(args.output_dir)
        out.mkdir(parents=True, exist_ok=True)
        (out / f"{date_str}-{branch}.md").write_text(body, encoding="utf-8")

    url = publish_issue(repo=args.repo, token=github_token, title=title, body=body, labels=list(DEFAULT_LABELS))
    catalog["items"].extend(
        {
            "branch": branch,
            "focus": args.focus,
            "title": item.get("title"),
            "source_url": item.get("source_url"),
            "seen_on": date_str,
        }
        for item in items
    )
    catalog_path.parent.mkdir(parents=True, exist_ok=True)
    catalog_path.write_text(json.dumps(catalog, indent=2, ensure_ascii=False), encoding="utf-8")
    log(f"Opened {url}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
