#!/usr/bin/env python3
"""Build the mathproblems site into docs/ (served by GitHub Pages from main:/docs).

Each problem lives in problems/<slug>/:
    page.html   bilingual source: both languages side by side (class="uk" / class="en")
    meta.json   per-language SEO title, description, FAQ and catalogue card
    assets/     og-uk.png, og-en.png (1200x630) and any other static files

The build writes one page per language so search engines index a clean page per URL:

    docs/index.html, docs/en/index.html                 catalogue
    docs/<slug>/index.html, docs/<slug>/en/index.html   problem pages
    docs/sitemap.xml, docs/robots.txt, docs/favicon.svg

Usage:  python3 build.py [--base-url https://example.com/]
"""
import argparse
import html
import json
import re
import hashlib
import shutil
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).parent
PROBLEMS = ROOT / "problems"
HUB = ROOT / "hub"
SITE_CSS = ROOT / "site.css"
DOCS = ROOT / "docs"
DEFAULT_BASE = "https://dmitrykudrenko.github.io/mathproblems/"
LANGS = ("uk", "en")
LANG_PATH = {"uk": "", "en": "en/"}
LOCALE = {"uk": "uk_UA", "en": "en_US"}
SITE_NAME = {"uk": "Математичні задачі", "en": "Math problems"}
AUTHOR_NAME = {"uk": "Дмитро Кудренко", "en": "Dmitry Kudrenko"}
AUTHOR_ORGS = [("Stripo", "https://stripo.email/"), ("Claspo", "https://claspo.io/"), ("Yespo", "https://yespo.io/"),
               ("Reteno", "https://reteno.com/"), ("eSputnik", "https://esputnik.com/")]


def author_ld(lang, base):
    """Schema.org Person for the author; pages point to it by @id."""
    return {"@type": "Person", "@id": base + "#author", "name": AUTHOR_NAME[lang],
            "alternateName": AUTHOR_NAME["en" if lang == "uk" else "uk"], "jobTitle": "Co-founder",
            "url": base + LANG_PATH[lang] + "#author", "image": base + "author.jpg",
            "worksFor": [{"@type": "Organization", "name": n, "url": u} for n, u in AUTHOR_ORGS]}
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">')
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
e = html.escape

# Problem pages were authored for the artifact viewer, which supplied these base styles.
RESET = """<style>
:root { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }
body { margin: 0; }
img { max-width: 100%; }
[hidden] { display: none !important; }
</style>"""


class LangStripper(HTMLParser):
    """Removes every element whose class list contains `drop`."""

    def __init__(self, text, drop):
        super().__init__(convert_charrefs=False)
        self.text, self.drop = text, drop
        self.line_starts = [0] + [m.end() for m in re.finditer("\n", text)]
        self.stack, self.active, self.ranges = [], None, []

    def src_pos(self):
        line, col = self.getpos()
        return self.line_starts[line - 1] + col

    def handle_starttag(self, tag, attrs):
        if tag in VOID:
            return
        classes = (dict(attrs).get("class") or "").split()
        if self.active is None and self.drop in classes:
            self.active = (self.src_pos(), len(self.stack))
        self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in VOID or tag not in self.stack:
            return
        while self.stack and self.stack.pop() != tag:
            pass
        if self.active and len(self.stack) == self.active[1]:
            end = self.text.index(">", self.src_pos()) + 1
            self.ranges.append((self.active[0], end))
            self.active = None

    def strip(self):
        self.feed(self.text)
        out, last = [], 0
        for a, b in self.ranges:
            out.append(self.text[last:a])
            last = b
        out.append(self.text[last:])
        return "".join(out)


# Runs before the page renders. A language the visitor picked (cookie) wins; otherwise
# Ukrainian for uk/ru/be browsers or a Ukrainian/neighbouring time zone, English for
# everyone else. Crawlers and link-preview bots are never redirected, so each URL
# stays indexable and hreflang does the work for search engines.
LANG_SCRIPT = """<script>
(function () {
  var COOKIE = "mp_lang", PATH = %(path)s, HERE = %(here)s, ALT = %(alt)s;
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[hreflang]");
    if (a && ALT[a.hreflang]) document.cookie = COOKIE + "=" + a.hreflang + "; path=" + PATH + "; max-age=31536000; SameSite=Lax";
  });
  if (/bot|crawl|spider|slurp|lighthouse|facebookexternalhit|embedly|preview|telegram|whatsapp|discord|vkshare/i.test(navigator.userAgent)) return;
  var m = document.cookie.match(/(?:^|; )mp_lang=(uk|en)/), want = m && m[1];
  if (!want) {
    // the first uk/ru/be or en entry in the browser's preference order decides
    var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < langs.length && !want; i++) {
      var p = String(langs[i]).toLowerCase().split("-")[0];
      if (p === "uk" || p === "ru" || p === "be") want = "uk";
      else if (p === "en") want = "en";
    }
    if (!want) {
      var tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (err) {}
      want = /Kyiv|Kiev|Zaporozhye|Uzhgorod|Simferopol|Moscow|Minsk/.test(tz) ? "uk" : "en";
    }
  }
  if (want !== HERE) location.replace(ALT[want] + location.hash);
})();
</script>"""


def lang_script(lang, urls, base):
    return LANG_SCRIPT % {"path": json.dumps(urlparse(base).path or "/"), "here": json.dumps(lang),
                          "alt": json.dumps({l: urlparse(u).path for l, u in urls.items()})}


def head(lang, urls, title, description, image, image_alt, ld, base):
    """<head> tags shared by every page. `urls` maps each language to that page's URL."""
    other = "en" if lang == "uk" else "uk"
    return f"""<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{lang_script(lang, urls, base)}
<title>{e(title)}</title>
<meta name="description" content="{e(description)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="{AUTHOR_NAME[lang]}">
<link rel="canonical" href="{urls[lang]}">
<link rel="alternate" hreflang="uk" href="{urls["uk"]}">
<link rel="alternate" hreflang="en" href="{urls["en"]}">
<link rel="alternate" hreflang="x-default" href="{urls["uk"]}">
<meta name="theme-color" content="#2A3DD1">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="{base}favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{SITE_NAME[lang]}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(description)}">
<meta property="og:url" content="{urls[lang]}">
<meta property="og:locale" content="{LOCALE[lang]}">
<meta property="og:locale:alternate" content="{LOCALE[other]}">
<meta property="og:image" content="{image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{e(image_alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{e(title)}">
<meta name="twitter:description" content="{e(description)}">
<meta name="twitter:image" content="{image}">
{FONTS}
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>"""


def css_link(base):
    """Shared stylesheet; the content hash in the URL busts caches after every change."""
    v = hashlib.sha1(SITE_CSS.read_bytes()).hexdigest()[:8]
    return f'<link rel="stylesheet" href="{base}site.css?v={v}">'


def write(path, doc):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(doc, encoding="utf-8")
    print(f"{path.relative_to(DOCS)}  {len(doc) // 1024} KB")


def build_problem(slug, base):
    src_dir = PROBLEMS / slug
    meta = json.loads((src_dir / "meta.json").read_text(encoding="utf-8"))
    src = (src_dir / "page.html").read_text(encoding="utf-8")
    rest = src[src.index("<style>"):]
    page_base = base + slug + "/"
    urls = {l: page_base + LANG_PATH[l] for l in LANGS}
    hub = {l: base + LANG_PATH[l] for l in LANGS}
    for lang in LANGS:
        m, other = meta[lang], ("en" if lang == "uk" else "uk")
        body = LangStripper(rest, other).strip()
        body = body.replace('href="#uk" hreflang="uk"', f'href="{urls["uk"]}" hreflang="uk"')
        body = body.replace('href="#en" hreflang="en"', f'href="{urls["en"]}" hreflang="en"')
        # the brand line becomes a link back to the catalogue
        body = re.sub(r'<span class="brand">.*?</span>',
                      f'<a class="brand" href="{hub[lang]}" style="text-decoration:none">← {SITE_NAME[lang]}</a>', body, count=1)
        style = body[:body.index("</style>") + len("</style>")]
        body = body[len(style):]
        ld = {"@context": "https://schema.org", "@graph": [
            {
                "@type": ["WebPage", "LearningResource"],
                "@id": urls[lang] + "#page",
                "url": urls[lang],
                "name": m["title"],
                "description": m["description"],
                "inLanguage": lang,
                "isAccessibleForFree": True,
                "learningResourceType": ["interactive simulation", "game", "explanation"],
                "educationalLevel": "beginner",
                "about": {"@type": "Thing", **meta["about"]},
                "image": page_base + f"og-{lang}.png",
                "dateModified": date.today().isoformat(),
                "isPartOf": {"@type": "WebSite", "name": SITE_NAME[lang], "url": hub[lang]},
                "author": {"@id": base + "#author"},
                ("translationOfWork" if lang == "en" else "workTranslation"): {"@id": urls[other] + "#page"},
            },
            author_ld(lang, base),
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": SITE_NAME[lang], "item": hub[lang]},
                    {"@type": "ListItem", "position": 2, "name": m["card"]["title"], "item": urls[lang]},
                ],
            },
            {
                "@type": "FAQPage",
                "@id": urls[lang] + "#faq",
                "inLanguage": lang,
                "mainEntity": [{"@type": "Question", "name": f["q"],
                                "acceptedAnswer": {"@type": "Answer", "text": f["a"]}} for f in m["faq"]],
            },
        ]}
        h = head(lang, urls, m["title"], m["description"], page_base + f"og-{lang}.png", m["og_alt"], ld, base)
        if "i.ytimg.com" in body:
            h += '\n<link rel="preconnect" href="https://i.ytimg.com">'
        doc = (f'<!doctype html>\n<html lang="{lang}" data-lang="{lang}" data-static>\n<head>\n{h}\n{RESET}\n{style}\n{css_link(base)}\n'
               f'</head>\n<body>\n{body.strip()}\n</body>\n</html>\n')
        write(DOCS / slug / LANG_PATH[lang] / "index.html", doc)
    for f in (src_dir / "assets").iterdir() if (src_dir / "assets").exists() else []:
        if f.suffix in {".png", ".jpg", ".svg", ".webp"} and not f.name.startswith("og-src"):
            shutil.copy(f, DOCS / slug / f.name)
    return slug, meta, urls


def build_hub(problems, base):
    """Catalogue page: hub/page.html with each problem's teaser.html dropped into <!--PROBLEMS-->."""
    meta = json.loads((HUB / "meta.json").read_text(encoding="utf-8"))
    src = (HUB / "page.html").read_text(encoding="utf-8")
    urls = {l: base + LANG_PATH[l] for l in LANGS}
    blocks = []
    for slug, _, _ in problems:
        teaser = (PROBLEMS / slug / "teaser.html").read_text(encoding="utf-8")
        # the stage on the home page uses the same tint as the problem page itself
        m = re.search(r"--tint:\s*(#[0-9A-Fa-f]{6})", (PROBLEMS / slug / "page.html").read_text(encoding="utf-8"))
        tint = f' style="--tint: {m.group(1)}"' if m else ""
        blocks.append(f'<article class="problem" id="{slug}"{tint}>\n' + teaser.replace("{{URL}}", "{{URL:%s}}" % slug) + "\n</article>")
    src = src.replace("<!--PROBLEMS-->", "\n".join(blocks))
    for lang in LANGS:
        m, other = meta[lang], ("en" if lang == "uk" else "uk")
        body = LangStripper(src, other).strip()
        for slug, _, purls in problems:
            body = body.replace("{{URL:%s}}" % slug, purls[lang])
        body = body.replace("{{HOME_BASE}}", base).replace("{{HOME}}", urls[lang])
        if lang == "en":
            body = body.replace('alt="Дмитро Кудренко" data-alt-en="Dmitry Kudrenko"', 'alt="Dmitry Kudrenko"')
        else:
            body = body.replace(' data-alt-en="Dmitry Kudrenko"', "").replace("{{FIRST}}", problems[0][2][lang])
        body = body.replace('href="#uk" hreflang="uk"', f'href="{urls["uk"]}" hreflang="uk"')
        body = body.replace('href="#en" hreflang="en"', f'href="{urls["en"]}" hreflang="en"')
        style = body[:body.index("</style>") + len("</style>")]
        body = body[len(style):]
        ld = {"@context": "https://schema.org", "@graph": [
            {"@type": "WebSite", "@id": urls[lang] + "#site", "name": SITE_NAME[lang], "url": urls[lang],
             "inLanguage": lang, "description": m["description"], "author": {"@id": base + "#author"},
             "creator": {"@id": base + "#author"}},
            author_ld(lang, base),
            {"@type": "CollectionPage", "@id": urls[lang] + "#page", "url": urls[lang], "name": m["title"],
             "description": m["description"], "inLanguage": lang, "isPartOf": {"@id": urls[lang] + "#site"},
             "about": [{"@type": "Thing", **p[1]["about"]} for p in problems],
             "mainEntity": {"@type": "ItemList", "numberOfItems": len(problems), "itemListElement": [
                 {"@type": "ListItem", "position": i + 1, "item": {
                     "@type": "LearningResource", "@id": p[2][lang] + "#page", "url": p[2][lang],
                     "name": p[1][lang]["card"]["title"], "description": p[1][lang]["description"],
                     "inLanguage": lang, "isAccessibleForFree": True,
                     "image": base + p[0] + f"/og-{lang}.png"}}
                 for i, p in enumerate(problems)]}},
        ]}
        h = head(lang, urls, m["title"], m["description"], base + f"og-{lang}.png", m["og_alt"], ld, base)
        doc = (f'<!doctype html>\n<html lang="{lang}" data-lang="{lang}" data-static>\n<head>\n{h}\n{RESET}\n'
               f'{css_link(base)}\n{style}\n</head>\n<body>\n{body.strip()}\n</body>\n</html>\n')
        write(DOCS / LANG_PATH[lang] / "index.html", doc)
    for f in (HUB / "assets").iterdir():
        if f.suffix in {".png", ".jpg"}:
            shutil.copy(f, DOCS / f.name)
    return urls


def build(base, out=None):
    global DOCS
    if out:
        DOCS = Path(out).resolve()
    if DOCS.exists():
        shutil.rmtree(DOCS)
    # a problem is published only once all three source files exist (lets drafts sit in problems/)
    dirs = [p for p in PROBLEMS.iterdir() if all((p / f).exists() for f in ("page.html", "teaser.html", "meta.json"))]
    dirs.sort(key=lambda p: (json.loads((p / "meta.json").read_text(encoding="utf-8")).get("order", 99), p.name))
    problems = [build_problem(p.name, base) for p in dirs]
    hub = build_hub(problems, base)

    today = date.today().isoformat()
    entries = []
    for urls in [hub] + [p[2] for p in problems]:
        for lang in LANGS:
            alts = "".join(f'\n    <xhtml:link rel="alternate" hreflang="{h}" href="{urls[h]}"/>' for h in LANGS)
            alts += f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{urls["uk"]}"/>'
            entries.append(f"  <url>\n    <loc>{urls[lang]}</loc>\n    <lastmod>{today}</lastmod>{alts}\n  </url>")
    (DOCS / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + "\n".join(entries) + "\n</urlset>\n", encoding="utf-8")
    (DOCS / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {base}sitemap.xml\n", encoding="utf-8")
    shutil.copy(ROOT / "favicon.svg", DOCS / "favicon.svg")
    shutil.copy(SITE_CSS, DOCS / "site.css")
    (DOCS / ".nojekyll").write_text("")
    print(f"sitemap.xml ({len(entries)} URLs), robots.txt, favicon.svg")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default=DEFAULT_BASE, help="public URL of the site root, ending with /")
    ap.add_argument("--out", help="write the site here instead of docs/ (for local checks)")
    a = ap.parse_args()
    build(a.base_url if a.base_url.endswith("/") else a.base_url + "/", a.out)
