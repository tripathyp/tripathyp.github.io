#!/usr/bin/env python3
"""Auto-fill the Colab badge link in a blog notebook's badge cell.

Replaces the template's placeholder path with the notebook's actual path in the
repo, so nobody has to hand-edit the badge cell for each new post. No-op if the
placeholder isn't present (i.e. the badge is already filled in).
"""
import json
import sys

PLACEHOLDER = "REPLACE/WITH/PATH.ipynb"


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
        new_source = [line.replace(PLACEHOLDER, notebook_path) for line in source]
        if new_source != source:
            cell["source"] = new_source
            changed = True

    if changed:
        with open(notebook_path, "w") as f:
            json.dump(nb, f, indent=1)
            f.write("\n")
        print(f"Filled in Colab badge link -> {notebook_path}")


if __name__ == "__main__":
    main()
