#!/usr/bin/env python3
"""Delete _blogs/*.md entries whose source notebook no longer exists.

Only touches entries that carry a `notebook:` front-matter field (i.e. ones
created by generate_blog_entry.py) - anything else is left alone, since it
wasn't created by this pipeline.
"""
import re
from pathlib import Path

NOTEBOOK_FIELD_RE = re.compile(r"^notebook:\s*(\S+)\s*$", re.MULTILINE)


def main():
    blogs_dir = Path("_blogs")
    if not blogs_dir.is_dir():
        return

    for entry_path in blogs_dir.glob("*.md"):
        text = entry_path.read_text()
        match = NOTEBOOK_FIELD_RE.search(text)
        if not match:
            continue

        notebook_path = Path(match.group(1))
        if not notebook_path.exists():
            entry_path.unlink()
            print(f"Pruned orphaned entry {entry_path} (missing {notebook_path})")


if __name__ == "__main__":
    main()
