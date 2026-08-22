#!/usr/bin/env python3
"""Auto-generate a _blogs/<date>-<slug>.md entry from a blog notebook's front matter.

Only creates the file if it doesn't already exist, so hand edits (e.g. a
custom teaser sentence) made after the first run are never overwritten.
"""
import json
import re
import sys
from pathlib import Path

FRONTMATTER_ID = "frontmatter"
SKIP_CELL_IDS = {"frontmatter", "style", "colab-badge"}


def parse_frontmatter(source_lines):
    text = "".join(source_lines)
    title_match = re.search(r'^title:\s*"(.*)"\s*$', text, re.MULTILINE)
    date_match = re.search(r'^date:\s*"?(\d{4}-\d{2}-\d{2})"?\s*$', text, re.MULTILINE)
    if not title_match or not date_match:
        raise ValueError("Could not find title/date in front matter")
    return title_match.group(1), date_match.group(1)


def first_teaser_text(cells):
    for cell in cells:
        if cell.get("id") in SKIP_CELL_IDS:
            continue
        if cell["cell_type"] != "markdown":
            continue
        text = "".join(cell["source"]).strip()
        if text:
            text = re.sub(r"\s+", " ", text)
            if len(text) > 200:
                text = text[:197].rstrip() + "..."
            return text
    return "Read the full post for details."


def main():
    if len(sys.argv) != 2:
        print("Usage: generate_blog_entry.py blog_notebooks/<year>/<month>/<slug>.ipynb", file=sys.stderr)
        sys.exit(1)

    notebook_path = Path(sys.argv[1])
    with open(notebook_path) as f:
        nb = json.load(f)

    frontmatter_cell = next((c for c in nb["cells"] if c.get("id") == FRONTMATTER_ID), None)
    if frontmatter_cell is None:
        print(f"No front-matter cell found in {notebook_path}, skipping", file=sys.stderr)
        sys.exit(1)

    title, date = parse_frontmatter(frontmatter_cell["source"])

    # Quarto names the rendered HTML after the notebook's own filename (not a
    # stripped-down slug), so the link must use that exact stem to be correct.
    stem = notebook_path.stem

    # Avoid a redundant doubled-up date if the notebook's own filename already
    # starts with it (e.g. "2026-08-22-my-post.ipynb").
    entry_stem = stem if stem.startswith(f"{date}-") else f"{date}-{stem}"

    blogs_dir = Path("_blogs")
    blogs_dir.mkdir(exist_ok=True)
    entry_path = blogs_dir / f"{entry_stem}.md"

    if entry_path.exists():
        print(f"{entry_path} already exists, leaving it untouched")
        return

    # notebook_path looks like blog_notebooks/<year>/<month>/<slug>.ipynb
    relative_dir = notebook_path.parent.relative_to("blog_notebooks")
    link = f"/blog_assets/{relative_dir}/{stem}.html"

    teaser = first_teaser_text(nb["cells"])

    content = (
        "---\n"
        f'title: "{title}"\n'
        "collection: blogs\n"
        'type: "Blog Post"\n'
        'venue: "Personal Website"\n'
        f"date: {date}\n"
        'location: "Website"\n'
        f"link: {link}\n"
        "---\n"
        "\n"
        f"{teaser}\n"
    )
    entry_path.write_text(content)
    print(f"Created {entry_path}")


if __name__ == "__main__":
    main()
