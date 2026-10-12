"""Tests for AI agent trigger gating."""

from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "scripts"))

from run_issue_solver_agents import (  # noqa: E402
    Issue,
    build_prompt,
    skip_reason,
)
from run_law_research import (  # noqa: E402
    MONITORING_PROMPT_PATH,
    build_monitoring_prompt,
    build_prompt as research_prompt,
    extract_report_markdown,
    write_site_report,
)


def make_issue(**overrides) -> Issue:
    defaults = {
        "number": 42,
        "title": "Fix the header",
        "body": "Change the header copy.",
        "html_url": "https://github.com/org/repo/issues/42",
        "labels": ["solve"],
    }
    defaults.update(overrides)
    return Issue(**defaults)


def test_skip_reason_solve_ignores_law_research():
    digest = make_issue(
        title="[RESEARCH] Pesquisa jurídica — trabalhista 2026-09-23",
        labels=["law-research", "research"],
    )
    assert skip_reason(digest, trigger="solve") == "label law-research"
    assert skip_reason(digest, trigger="post") is None


def test_skip_reason_post_requires_law_research_label():
    reason = skip_reason(make_issue(labels=["solve"]), trigger="post")
    assert reason is not None and "law-research" in reason


def test_solve_prompt_uses_issue_as_task():
    prompt = build_prompt(make_issue(), "org/repo", "main", trigger="solve")
    assert "this labeled `solve` issue is the task" in prompt
    assert "Fix the header" in prompt


def test_law_research_prompt_names_the_branch():
    prompt = research_prompt("trabalhista", "updates", "2026-09-23", 4, [])
    assert "trabalhista" in prompt
    assert "planalto.gov.br" in prompt
    assert "solve" not in prompt.lower()


def test_monitoring_prompt_loads_from_file():
    assert MONITORING_PROMPT_PATH.is_file()
    prompt = build_monitoring_prompt("2026-10-12")
    assert "MONITORAMENTO JURÍDICO E REGULATÓRIO" in prompt
    assert "BOLETIM DE INTELIGÊNCIA JURÍDICA" in prompt
    assert "2026-10-12" in prompt
    assert "15 dias" in prompt
    assert "Markdown" in prompt
    assert "/report" in prompt
    assert "não abra issue" in prompt.lower()


def test_site_report_is_markdown_for_the_page(tmp_path: Path):
    wrapped = "```markdown\n# BOLETIM\n\nTexto do relatório.\n```"
    target = tmp_path / "latest.md"
    write_site_report(target, wrapped)
    saved = target.read_text(encoding="utf-8")
    assert saved == "# BOLETIM\n\nTexto do relatório.\n"
    assert "[POST]" not in saved
    assert extract_report_markdown("  # Título\n") == "# Título\n"
