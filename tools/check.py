#!/usr/bin/env python3
"""Pre-commit checks for the site (the "Checks before commit" list in CLAUDE.md, minus the browser ones).

Builds the site into a temporary folder outside iCloud and checks it:
    - the build succeeds and docs/ matches it (sources and docs/ are committed together);
    - every inline script parses (one node process, like `node --check`), every JSON-LD block is valid JSON;
    - a uk page has no class="en", an en page has no class="uk";
    - <title> is at most 70 characters, the meta description at most 160;
    - meta.json "updated" is not earlier than "published";
    - no Finder/iCloud duplicates ("index 2.html", "meta 3.json") anywhere in the working tree.

Still by hand: no horizontal scroll at 375px and no console errors, in a browser via a local server.

Usage:  python3 tools/check.py      exits 1 and lists the problems if any check fails
"""
import html
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
TITLE_MAX, DESC_MAX = 70, 160
# "index 2.html", "CNAME 2", "og-uk 3.png": what Finder and iCloud leave next to a file they think conflicts
DUPLICATE = re.compile(r" \d+(\.[^/.]+)?$")
SCRIPT = re.compile(r"<script([^>]*)>(.*?)</script>", re.S)
# sitemap lastmod of the hub and the shelf is the build day, so it differs between runs
LASTMOD = re.compile(rb"<lastmod>[\d-]+</lastmod>")

NODE_PARSE = """
const vm = require("vm");
const out = [];
for (const [name, code] of JSON.parse(require("fs").readFileSync(0, "utf8"))) {
  try { new vm.Script(code, {filename: name}); } catch (e) { out.push(`${name}: ${e.message}`); }
}
console.log(JSON.stringify(out));
"""

errors = []


def fail(msg):
    errors.append(msg)


def check_duplicates():
    for p in ROOT.rglob("*"):
        if ".git" not in p.relative_to(ROOT).parts and DUPLICATE.search(p.name):
            fail(f"Finder/iCloud duplicate: {p.relative_to(ROOT)} (delete it)")


def check_meta():
    for m in sorted((ROOT / "problems").glob("*/meta.json")):
        meta = json.loads(m.read_text(encoding="utf-8"))
        if meta.get("updated", "") < meta.get("published", ""):
            fail(f"{m.relative_to(ROOT)}: \"updated\" is earlier than \"published\"")


def check_in_sync(built):
    def files(d):
        return {p.relative_to(d): p for p in d.rglob("*") if p.is_file() and not DUPLICATE.search(p.name)}

    new, old = files(built), files(DOCS)
    stale = sorted(str(k) for k in new.keys() ^ old.keys())
    for k in new.keys() & old.keys():
        a, b = new[k].read_bytes(), old[k].read_bytes()
        if k.name == "sitemap.xml":
            a, b = LASTMOD.sub(b"", a), LASTMOD.sub(b"", b)
        if a != b:
            stale.append(str(k))
    if stale:
        fail(f"docs/ is out of date, run python3 build.py ({len(stale)} files differ, e.g. {', '.join(sorted(stale)[:3])})")


def check_pages(built):
    scripts = []
    for page in sorted(built.rglob("*.html")):
        name = str(page.relative_to(built))
        doc = page.read_text(encoding="utf-8")
        lang = re.search(r'<html lang="(\w+)"', doc).group(1)
        other = {"uk": "en", "en": "uk"}[lang]
        leaks = doc.count(f'class="{other}"')
        if leaks:
            fail(f'{name}: {leaks}x class="{other}" on a {lang} page')
        title = re.search(r"<title>(.*?)</title>", doc, re.S)
        if title and len(html.unescape(title.group(1))) > TITLE_MAX:
            fail(f"{name}: title is {len(html.unescape(title.group(1)))} chars (max {TITLE_MAX})")
        desc = re.search(r'<meta name="description" content="(.*?)"', doc)
        if desc and len(html.unescape(desc.group(1))) > DESC_MAX:
            fail(f"{name}: description is {len(html.unescape(desc.group(1)))} chars (max {DESC_MAX})")
        for i, (attrs, code) in enumerate(SCRIPT.findall(doc)):
            if "src=" in attrs:
                continue
            # JSON-LD and data blocks such as the glossary terms (type="application/json")
            if "json" in attrs:
                try:
                    json.loads(code)
                except ValueError as e:
                    fail(f"{name}: JSON #{i} is not valid JSON: {e}")
            elif "type=" not in attrs or "javascript" in attrs or "module" in attrs:
                scripts.append((f"{name} script #{i}", code))
    res = subprocess.run(["node", "-e", NODE_PARSE], input=json.dumps(scripts), capture_output=True, text=True)
    if res.returncode:
        fail(f"node failed: {res.stderr.strip()}")
    else:
        for msg in json.loads(res.stdout):
            fail(f"syntax error in {msg}")
    return len(scripts)


def main():
    check_duplicates()
    check_meta()
    with tempfile.TemporaryDirectory() as tmp:
        built = Path(tmp) / "docs"
        res = subprocess.run([sys.executable, str(ROOT / "build.py"), "--out", str(built)], capture_output=True, text=True)
        if res.returncode:
            fail(f"build failed:\n{res.stderr or res.stdout}")
        else:
            check_in_sync(built)
            n = check_pages(built)
            print(f"built {sum(1 for _ in built.rglob('*.html'))} pages, parsed {n} inline scripts")
    for e in errors:
        print("✗", e)
    if errors:
        sys.exit(1)
    print("✓ all checks passed")


if __name__ == "__main__":
    main()
