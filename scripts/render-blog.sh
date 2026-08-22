#!/usr/bin/env bash
# Renders a blog_notebooks/<path>.ipynb into the matching blogs/<path>/ folder.
#
# Usage: scripts/render-blog.sh blog_notebooks/2026/02/ptplot.ipynb

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 blog_notebooks/<year>/<month>/<slug>.ipynb"
  exit 1
fi

NOTEBOOK="$1"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

case "$NOTEBOOK" in
  blog_notebooks/*) ;;
  *)
    echo "Error: notebook must live under blog_notebooks/, got: $NOTEBOOK"
    exit 1
    ;;
esac

# Force the notebook's own filename to lowercase (Quarto names the rendered
# HTML after it, so this is what actually controls the live URL's case).
NOTEBOOK_DIR="$(dirname "$NOTEBOOK")"
NOTEBOOK_BASE="$(basename "$NOTEBOOK")"
LOWER_BASE="${NOTEBOOK_BASE,,}"
if [ "$NOTEBOOK_BASE" != "$LOWER_BASE" ]; then
  mv "$REPO_ROOT/$NOTEBOOK" "$REPO_ROOT/$NOTEBOOK_DIR/$LOWER_BASE"
  echo "Renamed to lowercase: $NOTEBOOK_DIR/$LOWER_BASE"
  NOTEBOOK="$NOTEBOOK_DIR/$LOWER_BASE"
fi

RELATIVE_DIR="$(dirname "${NOTEBOOK#blog_notebooks/}")"
OUTPUT_DIR="$REPO_ROOT/blogs/$RELATIVE_DIR"

mkdir -p "$OUTPUT_DIR"
python3 "$REPO_ROOT/scripts/fix_colab_badge.py" "$NOTEBOOK"
quarto render "$NOTEBOOK" --output-dir "$OUTPUT_DIR"
python3 "$REPO_ROOT/scripts/generate_blog_entry.py" "$NOTEBOOK"

RENDERED_HTML="$OUTPUT_DIR/$(basename "$NOTEBOOK" .ipynb).html"
python3 "$REPO_ROOT/scripts/inject_subscribe_widget.py" "$RENDERED_HTML"

# Quarto drops a stray .gitignore next to the notebook on every render; the
# top-level blog_notebooks/.gitignore already covers what it's for.
rm -f "$REPO_ROOT/$(dirname "$NOTEBOOK")/.gitignore"

echo ""
echo "Rendered to: blogs/$RELATIVE_DIR/"
