#!/usr/bin/env python3
"""Inject a blog-post email-subscribe widget into a rendered Quarto HTML page.

Submits (via a hidden iframe, so the visitor never leaves the page or sees
Google's own form UI) to a Google Form's backend endpoint. A honeypot field
filters out simple bots. Idempotent: does nothing if the widget marker is
already present, so re-running on an already-injected page is a no-op.
"""
import re
import sys
from pathlib import Path

FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSfWv1VgDAg5JNeeQNQjMbC7M9n2U7b29XyRDF954ZVMRbp0ZA/formResponse"
EMAIL_ENTRY = "entry.1898607375"
MARKER = "subscribe-widget"

WIDGET_HTML = f"""
<div id="{MARKER}">
  <style>
    #{MARKER} {{
      position: fixed;
      top: 120px;
      right: 20px;
      width: 240px;
      padding: 1em;
      background-color: #f7f7f7;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.85em;
      line-height: 1.4;
      z-index: 100;
    }}
    #{MARKER} p {{ margin: 0 0 0.6em 0; }}
    #{MARKER} input[type="email"] {{
      width: 100%;
      box-sizing: border-box;
      padding: 0.4em;
      margin-bottom: 0.5em;
      font-size: 0.9em;
    }}
    #{MARKER} button {{
      width: 100%;
      padding: 0.4em;
      cursor: pointer;
      font-size: 0.9em;
    }}
    #{MARKER} .subscribe-honeypot {{ display: none !important; }}
    #{MARKER} .subscribe-thanks {{ display: none; margin: 0; }}
    @media screen and (max-width: 900px) {{
      #{MARKER} {{
        position: static;
        width: auto;
        margin: 2em 0;
      }}
    }}
  </style>
  <p>Want to be notified when similar blog posts come out? Leave your email below.</p>
  <form id="subscribe-form" action="{FORM_ACTION}" method="POST" target="subscribe-hidden-iframe">
    <input type="email" name="{EMAIL_ENTRY}" placeholder="you@example.com" required>
    <input type="text" name="website" class="subscribe-honeypot" tabindex="-1" autocomplete="off">
    <button type="submit">Notify me</button>
  </form>
  <p class="subscribe-thanks">Thanks - you're on the list!</p>
  <iframe name="subscribe-hidden-iframe" style="display:none"></iframe>
  <script>
  (function() {{
    var form = document.getElementById("subscribe-form");
    var thanks = document.querySelector("#{MARKER} .subscribe-thanks");
    form.addEventListener("submit", function(e) {{
      var honeypot = form.querySelector(".subscribe-honeypot");
      if (honeypot.value) {{
        e.preventDefault();
        return;
      }}
      setTimeout(function() {{
        form.style.display = "none";
        thanks.style.display = "block";
      }}, 300);
    }});
  }})();
  </script>
</div>
"""


def main():
    if len(sys.argv) != 2:
        print("Usage: inject_subscribe_widget.py <rendered.html>", file=sys.stderr)
        sys.exit(1)

    html_path = Path(sys.argv[1])
    html = html_path.read_text()

    if MARKER in html:
        return

    if "</body>" not in html:
        print(f"No </body> tag found in {html_path}, skipping", file=sys.stderr)
        return

    html = html.replace("</body>", WIDGET_HTML + "</body>")
    html_path.write_text(html)
    print(f"Injected subscribe widget -> {html_path}")


if __name__ == "__main__":
    main()
