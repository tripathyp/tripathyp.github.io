#!/usr/bin/env bash
# Renders a blog_notebooks/<path>.ipynb into the matching blog_assets/<path>/ folder.
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

RELATIVE_DIR="$(dirname "${NOTEBOOK#blog_notebooks/}")"
OUTPUT_DIR="$REPO_ROOT/blog_assets/$RELATIVE_DIR"

mkdir -p "$OUTPUT_DIR"
python3 "$REPO_ROOT/scripts/fix_colab_badge.py" "$NOTEBOOK"
quarto render "$NOTEBOOK" --output-dir "$OUTPUT_DIR"

echo ""
echo "Rendered to: blog_assets/$RELATIVE_DIR/"
echo "Next: create/update _blogs/<slug>.md with:"
echo "  link: /blog_assets/$RELATIVE_DIR/$(basename "$NOTEBOOK" .ipynb).html"
