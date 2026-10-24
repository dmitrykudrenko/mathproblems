#!/usr/bin/env python3
"""Tell IndexNow search engines (Bing, Yandex, Seznam, Naver…) which pages are new or changed.

Google does not use IndexNow: for Google, request indexing in Search Console.
The key is INDEXNOW_KEY in build.py; the build serves it as docs/<key>.txt, so deploy first.
URLs come from docs/sitemap.xml.

Usage:  python3 tools/indexnow.py                    every URL in the sitemap
        python3 tools/indexnow.py --since 2026-10-23 only URLs whose lastmod is on or after that date
        python3 tools/indexnow.py --dry-run          print the URLs, send nothing
"""
import argparse
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from build import DEFAULT_BASE, INDEXNOW_KEY  # noqa: E402

ENDPOINT = "https://api.indexnow.org/indexnow"

ap = argparse.ArgumentParser()
ap.add_argument("--since", help="YYYY-MM-DD: only URLs with lastmod on or after this date")
ap.add_argument("--dry-run", action="store_true")
a = ap.parse_args()

sitemap = (ROOT / "docs" / "sitemap.xml").read_text(encoding="utf-8")
urls = [loc for loc, mod in re.findall(r"<loc>(.*?)</loc>\s*<lastmod>(.*?)</lastmod>", sitemap)
        if not a.since or mod >= a.since]
print("\n".join(urls), f"\n{len(urls)} URLs", sep="")
if a.dry_run or not urls:
    sys.exit()

host = DEFAULT_BASE.split("/")[2]
body = json.dumps({"host": host, "key": INDEXNOW_KEY, "keyLocation": f"{DEFAULT_BASE}{INDEXNOW_KEY}.txt",
                   "urlList": urls}).encode()
req = urllib.request.Request(ENDPOINT, body, {"Content-Type": "application/json; charset=utf-8"})
with urllib.request.urlopen(req) as r:
    # 200 accepted, 202 accepted but the key is still being checked
    print("IndexNow:", r.status, r.reason)
