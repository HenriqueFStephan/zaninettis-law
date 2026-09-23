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
from run_law_research import build_prompt as research_prompt  # noqa: E402


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
