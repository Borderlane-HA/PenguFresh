"""Prepare manifest metadata before the repository is published."""

from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent
MANIFEST = ROOT / "custom_components" / "pengufresh" / "manifest.json"


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python prepare_github.py YOUR_GITHUB_USERNAME")
        return 2

    username = sys.argv[1].strip().lstrip("@")
    if not username:
        print("GitHub username must not be empty")
        return 2

    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    repo = f"https://github.com/{username}/PenguFresh"
    data["codeowners"] = [f"@{username}"]
    data["documentation"] = repo
    data["issue_tracker"] = f"{repo}/issues"
    MANIFEST.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Updated manifest for @{username}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
