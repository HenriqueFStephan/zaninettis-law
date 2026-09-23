#!/usr/bin/env python3
"""Remind agents to update navigation docs after core edits. Hook: afterFileEdit."""

import json
import sys

WATCH_PREFIXES = (
    "backend/app/api/",
    "backend/app/services/",
    "agents/",
    "frontend/src/app/features/",
)


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        return 0

    file_path = (data.get("file_path") or data.get("path") or "").replace("\\", "/")
    if any(prefix in file_path for prefix in WATCH_PREFIXES):
        print(
            json.dumps(
                {
                    "additional_context": (
                        "Zaninettis: if you added a module, update docs/ARCHITECTURE.md. "
                        "Public routes live in frontend/src/app/app.routes.ts. "
                        "/studio stays out of the public nav."
                    )
                }
            )
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
