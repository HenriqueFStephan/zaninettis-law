"""JSON-file backed data store for the demo phase."""

import hashlib
import json
import uuid
from pathlib import Path
from typing import Any

from app.core.config import BACKEND_ROOT
from app.core.text_encoding import repair_mojibake

SEED_DIR = BACKEND_ROOT / "data" / "seed"
DATA_DIR = BACKEND_ROOT / "data"
REVIEW_FILE = DATA_DIR / "review_queue.json"


def _file_sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class JsonStore:
    """Simple JSON persistence for list-based collections."""

    def __init__(self, path: Path, seed_path: Path | None = None):
        self.path = path
        self.seed_path = seed_path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if self._should_seed() and self.seed_path is not None:
            self.load_seed()
        elif not self.path.exists():
            self.path.write_text("[]", encoding="utf-8")
        else:
            self._write_seed_stamp()

    @property
    def _stamp_path(self) -> Path:
        return self.path.with_name(self.path.name + ".seedsha")

    def _write_seed_stamp(self) -> None:
        if self.seed_path and self.seed_path.exists():
            self._stamp_path.write_text(_file_sha(self.seed_path), encoding="utf-8")

    def _should_seed(self) -> bool:
        if not self.seed_path or not self.seed_path.exists():
            return False
        seed_hash = _file_sha(self.seed_path)
        if not self.path.exists():
            return True
        try:
            live = json.loads(self.path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return True
        if live == []:
            return True
        if self._stamp_path.exists():
            return self._stamp_path.read_text(encoding="utf-8").strip() != seed_hash
        try:
            seed = json.loads(self.seed_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return False
        return live != seed

    def load_seed(self) -> None:
        if not self.seed_path or not self.seed_path.exists():
            raise FileNotFoundError(f"No seed file for {self.path.name}")
        data = json.loads(self.seed_path.read_text(encoding="utf-8"))
        self.write_all(data)
        self._write_seed_stamp()

    def read_all(self) -> list[dict[str, Any]]:
        return repair_mojibake(json.loads(self.path.read_text(encoding="utf-8")))

    def write_all(self, items: list[dict[str, Any]]) -> None:
        cleaned = repair_mojibake(items)
        self.path.write_text(json.dumps(cleaned, indent=2, default=str, ensure_ascii=False), encoding="utf-8")

    def append(self, item: dict[str, Any]) -> dict[str, Any]:
        items = self.read_all()
        cleaned = repair_mojibake(item)
        items.append(cleaned)
        self.write_all(items)
        return cleaned


news_store = JsonStore(DATA_DIR / "news.json", SEED_DIR / "news.json")
blog_store = JsonStore(DATA_DIR / "blog.json", SEED_DIR / "blog.json")
services_store = JsonStore(DATA_DIR / "services.json", SEED_DIR / "services.json")
contact_store = JsonStore(DATA_DIR / "contact_messages.json")
consulting_store = JsonStore(DATA_DIR / "consulting_requests.json")


def get_review_queue() -> list[dict[str, Any]]:
    if not REVIEW_FILE.exists():
        REVIEW_FILE.write_text("[]", encoding="utf-8")
    return repair_mojibake(json.loads(REVIEW_FILE.read_text(encoding="utf-8")))


def save_review_queue(items: list[dict[str, Any]]) -> None:
    REVIEW_FILE.parent.mkdir(parents=True, exist_ok=True)
    REVIEW_FILE.write_text(
        json.dumps(repair_mojibake(items), indent=2, default=str, ensure_ascii=False),
        encoding="utf-8",
    )


def new_id() -> str:
    return str(uuid.uuid4())
