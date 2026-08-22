#!/usr/bin/env python3
"""Inject the site's Google Analytics 4 snippet into a rendered Quarto HTML page.

Blog posts are standalone Quarto-rendered pages, not passed through Jekyll's
_includes/head.html, so the site-wide analytics include never reaches them.
Mirrors the same GA4 tracking ID used in _config.yml's analytics.google.tracking_id
so both halves of the site (Jekyll pages and Quarto posts) report to one property.
Idempotent: does nothing if already injected.
"""
import sys
from pathlib import Path

TRACKING_ID = "G-NQKJSGS08L"
MARKER = "gtag/js?id="

SNIPPET = f"""
<script async src="https://www.googletagmanager.com/gtag/js?id={TRACKING_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', '{TRACKING_ID}');
</script>
"""


def main():
    if len(sys.argv) != 2:
        print("Usage: inject_analytics.py <rendered.html>", file=sys.stderr)
        sys.exit(1)

    html_path = Path(sys.argv[1])
    html = html_path.read_text()

    if MARKER in html:
        return

    if "</head>" not in html:
        print(f"No </head> tag found in {html_path}, skipping", file=sys.stderr)
        return

    html = html.replace("</head>", SNIPPET + "</head>")
    html_path.write_text(html)
    print(f"Injected GA4 analytics -> {html_path}")


if __name__ == "__main__":
    main()
