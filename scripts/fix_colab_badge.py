#!/usr/bin/env python3
"""Keep the Colab badge link in a blog notebook's badge cell pointing at its
own current path.

Always rewrites the blob/main/<path>.ipynb portion of the badge href to match
the notebook's actual current location - handles both the template's
placeholder on first use, and a stale link left behind if the notebook is
later renamed or moved. No-op if the link already matches.
"""
import json
import re
import sys

LINK_RE = re.compile(r"(blob/main/)\S+?\.ipynb")


def main():
    if len(sys.argv) != 2:
        print("Usage: fix_colab_badge.py blog_notebooks/<year>/<month>/<slug>.ipynb", file=sys.stderr)
        sys.exit(1)

    notebook_path = sys.argv[1]

    with open(notebook_path) as f:
        nb = json.load(f)

    changed = False
    for cell in nb["cells"]:
        if cell.get("id") != "colab-badge":
            continue
        source = cell["source"]
        new_source = [LINK_RE.sub(r"\g<1>" + notebook_path, line) for line in source]
        if new_source != source:
            cell["source"] = new_source
            changed = True

    if changed:
        with open(notebook_path, "w") as f:
            json.dump(nb, f, indent=1)
            f.write("\n")
        print(f"Updated Colab badge link -> {notebook_path}")


if __name__ == "__main__":
    main()
