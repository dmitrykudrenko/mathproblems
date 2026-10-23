#!/usr/bin/env python3
"""Build the mathproblems site into docs/ (served by GitHub Pages from main:/docs).

Each problem lives in problems/<slug>/:
    page.html   bilingual source: both languages side by side (class="uk" / class="en")
    meta.json   per-language SEO title, description, FAQ and catalogue card
    assets/     og-uk.png, og-en.png (1200x630) and any other static files

The build writes one page per language so search engines index a clean page per URL:

    docs/index.html, docs/en/index.html                 catalogue
    docs/<slug>/index.html, docs/<slug>/en/index.html   problem pages
    docs/feed.xml, docs/en/feed.xml                     RSS of the problems, newest first
    docs/sitemap.xml, docs/robots.txt, docs/favicon.svg

Usage:  python3 build.py [--base-url https://example.com/]
"""
import argparse
import html
import json
import re
import hashlib
import shutil
from datetime import date, datetime, timezone
from email.utils import format_datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).parent
PROBLEMS = ROOT / "problems"
HUB = ROOT / "hub"
SITE_CSS = ROOT / "site.css"
DOCS = ROOT / "docs"
DEFAULT_BASE = "https://mathparadoxes.com/"
CUSTOM_DOMAIN = "mathparadoxes.com"  # written to docs/CNAME for GitHub Pages
LANGS = ("uk", "en")
LANG_PATH = {"uk": "", "en": "en/"}
LOCALE = {"uk": "uk_UA", "en": "en_US"}
# hreflang x-default: the version for visitors whose language is neither; LANG_SCRIPT sends them to English too
X_DEFAULT = "en"
SITE_NAME = {"uk": "Математичні парадокси", "en": "Math paradoxes"}
# logo mark (three doors, the third one taken); the source files live in brand/
BRAND_MARK = '<svg class="brand-mark" viewBox="0 0 114 90" aria-hidden="true"><path d="M3 84V31A14 14 0 0 1 31 31V84" fill="none" stroke="currentColor" stroke-width="8"/><path d="M43 84V31A14 14 0 0 1 71 31V84" fill="none" stroke="currentColor" stroke-width="8"/><path d="M83 84V31A14 14 0 0 1 111 31V84Z" fill="var(--signal)" stroke="var(--signal)" stroke-width="8" stroke-linejoin="round"/><path d="M0 87H114" stroke="currentColor" stroke-width="8"/></svg>'
AUTHOR_NAME = {"uk": "Дмитро Кудренко", "en": "Dmytro Kudrenko"}
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

# Claspo widget script, placed once on every page right before </body> (set CLASPO_ID = "" to turn it off).
CLASPO_ID = "3C669B8434174669B9FC04D110EE78ED"
CLASPO = """<script>
    !function (t, e, c, n) {
        var s = e.createElement(c);
        s.async = 1, s.src = 'https://scripts.claspo.io/scripts/' + n + '.js';
        s.onerror = function () { t.claspoBlocked = true; t.dispatchEvent(new Event('claspo-blocked')); };
        var r = e.scripts[0];
        r.parentNode.insertBefore(s, r);
        var f = function () {
            f.c(arguments);
        };
        f.q = [];
        f.c = function () {
            f.q.push(arguments);
        };
        t['claspo'] = t['claspo'] || f;
    }(window, document, 'script', '%s');
</script><script>claspo('addVariables', { page_lang: '%%LANG%%' }); claspo('init');</script>""" % CLASPO_ID if CLASPO_ID else ""


def claspo_snippet(lang):
    """Claspo loader for one page. page_lang ('uk' / 'en') is read by the hidden field of the same
    name in the Claspo form and sent on to eSputnik as the contact's languageCode."""
    return CLASPO.replace("%LANG%", lang)

# Cloudflare Web Analytics beacon on every page, 404 included (set CF_ANALYTICS_TOKEN = "" to turn it off).
# No cookies, so no consent banner. The site is not proxied by Cloudflare, so the snippet is installed by hand.
CF_ANALYTICS_TOKEN = "adf9fd3e4773416fb45241d58aea741f"
CF_ANALYTICS = ("<script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' "
                "data-cf-beacon='{\"token\": \"%s\"}'></script>" % CF_ANALYTICS_TOKEN) if CF_ANALYTICS_TOKEN else ""

# Newsletter block near the end of every page. The form itself is a Claspo inline widget placed
# inside #mp-subscribe. Until Claspo puts the form there, the slot shows a short placeholder,
# which disappears by itself once the form arrives.
SUBSCRIBE_TEXT = {
    "uk": ("Розсилка", "Нові задачі, пояснення й обговорення",
           "Я поступово додаю нові задачі, інші способи їх пояснити й розбори дискусій. Залиште email, і я напишу, коли з'явиться щось нове. Без спаму, відписатися можна в один клік.",
           "Форма підписки з'явиться тут найближчим часом."),
    "en": ("Newsletter", "New puzzles, explanations and discussions",
           "I keep adding new puzzles, new ways to explain them and write-ups of the discussions they start. Leave your email and I'll write when something new is out. No spam, one-click unsubscribe.",
           "The sign-up form will appear here soon."),
}
SUBSCRIBE = """<section class="mp-subscribe" id="subscribe">
  <div class="mp-subscribe-text">
    <span class="eyebrow">%s</span>
    <h2>%s</h2>
    <p>%s</p>
  </div>
  <div class="mp-subscribe-slot" id="mp-subscribe"><p class="mp-subscribe-wait">%s</p></div>
</section>
<script>
(function () {
  var box = document.getElementById("subscribe"), slot = document.getElementById("mp-subscribe");
  var wait = slot.querySelector(".mp-subscribe-wait"), done = false;
  // the form is a Claspo inline widget; drop the placeholder once it is inserted (inside the slot or next to it)
  function check() {
    if (done) return;
    var inSlot = [].some.call(slot.children, function (el) { return el !== wait; });
    var nextTo = [].some.call(box.children, function (el) { return !/mp-subscribe-(text|slot)/.test(el.className); });
    if (inSlot || nextTo) { done = true; if (wait) wait.remove(); }
  }
  // no form for this visitor (script blocked by an extension, or Claspo's display rules skip them):
  // hide the whole block instead of promising a form that will not come
  function giveUp() {
    if (done) return;
    done = true; box.hidden = true;
    if (window.console) console.info("Newsletter form did not load" + (window.claspoBlocked ? ": the Claspo script was blocked" : ""));
  }
  check();
  new MutationObserver(check).observe(box, { childList: true, subtree: true });
  if (window.claspoBlocked) giveUp();
  window.addEventListener("claspo-blocked", giveUp);
  setTimeout(giveUp, 10000);
})();
</script>"""


# Comments on every problem page via giscus (GitHub Discussions of this repo, category Announcements,
# so only giscus opens new threads). One thread per problem, shared by both languages.
GISCUS = {"repo": "dmitrykudrenko/mathproblems", "repo_id": "R_kgDOVP1Ehw",
          "category": "Announcements", "category_id": "DIC_kwDOVP1Eh84DJCIi"}
DISCUSS_TEXT = {
    "uk": ("Обговорення", "Що ви думаєте?",
           "Поділіться своїм поясненням, запереченням чи варіантом задачі. Для коментаря потрібен акаунт GitHub."),
    "en": ("Discussion", "What do you think?",
           "Share your own explanation, an objection or a variant of the puzzle. You need a GitHub account to comment."),
}


def discuss_block(lang, slug):
    eyebrow, title, text = DISCUSS_TEXT[lang]
    g = GISCUS
    return f"""<section class="mp-discuss" id="discuss">
  <div class="mp-discuss-text">
    <span class="eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
    <p>{text}</p>
  </div>
  <div class="mp-discuss-thread">
    <script src="https://giscus.app/client.js"
      data-repo="{g["repo"]}" data-repo-id="{g["repo_id"]}"
      data-category="{g["category"]}" data-category-id="{g["category_id"]}"
      data-mapping="specific" data-term="{slug}" data-strict="1"
      data-reactions-enabled="1" data-emit-metadata="0" data-input-position="top"
      data-theme="light" data-lang="{lang}" data-loading="lazy"
      crossorigin="anonymous" async></script>
  </div>
</section>"""


# "More puzzles" block on every problem page: links to related problems so readers (and crawlers)
# move between pages instead of only back to the catalogue. Cards show the spoiler-free share question.
RELATED_COUNT = 3
RELATED_TEXT = {
    "uk": ("Ще задачі", "Інші парадокси", "Усі задачі"),
    "en": ("More puzzles", "Other paradoxes", "All puzzles"),
}


def pick_related(slug, metas):
    """Problems sharing the most tags (ignoring the ubiquitous "симуляція"), then the next ones in site order."""
    order = [s for s, _ in metas]
    tags = {s: set(m["uk"]["card"]["tags"]) - {"симуляція"} for s, m in metas}
    i = order.index(slug)
    others = order[i + 1:] + order[:i]
    return sorted(others, key=lambda s: -len(tags[s] & tags[slug]))[:RELATED_COUNT]


def related_block(lang, items, hub_url):
    """`items` is a list of (url, title, question)."""
    eyebrow, title, all_label = RELATED_TEXT[lang]
    cards = "\n".join(f'    <a class="mp-related-card" href="{u}"><h3>{e(t)}</h3><p>{e(q)}</p></a>' for u, t, q in items)
    return f"""<section class="mp-related" id="related">
  <div class="mp-related-head">
    <span class="eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
  </div>
  <div class="mp-related-grid">
{cards}
  </div>
  <a class="mp-related-all" href="{hub_url}">{all_label} →</a>
</section>"""


# "What to read" block: 1-3 books that really discuss the problem, listed in meta.json as
#     "books": [{"id": "kahneman-tfs", "ch": 17}]          (or "where": {"uk": "...", "en": "..."} instead of "ch")
# Book details live once in books.json; "ua" is the Ukrainian edition, shown first on Ukrainian pages.
# Only chapter numbers, never chapter titles: a title can give the answer away.
BOOKS = ROOT / "books.json"
BOOKS_TEXT = {
    "uk": ("Що почитати", "Книжки, де є ця задача", "розділ", "англійською", "Усі книжки"),
    "en": ("Further reading", "Books that discuss this puzzle", "chapter", None, "All books"),
}


def load_books():
    books = json.loads(BOOKS.read_text(encoding="utf-8")) if BOOKS.exists() else {}
    for k, b in books.items():
        missing = {"author", "title", "year"} - set(b)
        if missing:
            raise SystemExit(f"books.json: {k} lacks {sorted(missing)}")
    return books


def book_refs(slug, meta, books):
    refs = meta.get("books", [])
    for r in refs:
        if r["id"] not in books:
            raise SystemExit(f"{slug}/meta.json: unknown book {r['id']!r}")
    return refs


def ref_where(lang, ref):
    if "where" in ref:
        return ref["where"][lang]
    return f'{BOOKS_TEXT[lang][2]} {ref["ch"]}' if "ch" in ref else ""


def book_view(lang, ref, b):
    """(title, author, edition line, where, url, is_translation) for one book on a page in `lang`."""
    ua = b.get("ua") if lang == "uk" else None
    where = ref_where(lang, ref)
    if ua:
        return ua["title"], b["author"][lang], f'{ua["publisher"]}, {ua["year"]}', where, ua.get("url"), True
    edition = str(b["year"]) + (f", {BOOKS_TEXT[lang][3]}" if BOOKS_TEXT[lang][3] else "")
    return b["title"], b["author"][lang], edition, where, b.get("url"), False


def books_block(lang, refs, books, shelf_url):
    if not refs:
        return ""
    eyebrow, title, all_label = BOOKS_TEXT[lang][0], BOOKS_TEXT[lang][1], BOOKS_TEXT[lang][4]
    views = [book_view(lang, r, books[r["id"]]) for r in refs]
    views.sort(key=lambda v: not v[5])  # translated books first; sort is stable
    cards = []
    for t, a, ed, where, url, _ in views:
        tag, href = ("a", f' href="{e(url)}" rel="noopener" target="_blank"') if url else ("div", "")
        meta = " · ".join(e(x) for x in (ed, where) if x)
        cards.append(f'    <{tag} class="mp-book"{href}><h3>{e(t)}</h3><p class="mp-book-author">{e(a)}</p>'
                     f'<p class="mp-book-meta">{meta}</p></{tag}>')
    return f"""<section class="mp-books" id="books">
  <div class="mp-related-head">
    <span class="eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
  </div>
  <div class="mp-books-grid">
{chr(10).join(cards)}
  </div>
  <a class="mp-related-all" href="{shelf_url}">{all_label} →</a>
</section>"""


def book_ld(lang, b):
    """schema.org Book for the edition the reader sees."""
    ua = b.get("ua") if lang == "uk" else None
    ed = ua or b
    item = {"@type": "Book", "name": ed["title"], "author": [{"@type": "Person", "name": n} for n in b["author"][lang].split(", ")],
            "datePublished": str(ed["year"])}
    if ed.get("isbn"):
        item["isbn"] = ed["isbn"]
    if ua:
        item["publisher"] = {"@type": "Organization", "name": ua["publisher"]}
        item["translationOfWork"] = {"@type": "Book", "name": b["title"], "datePublished": str(b["year"])}
    return item


def books_ld(lang, refs, books):
    """The page's `citation`."""
    return [book_ld(lang, books[r["id"]]) for r in refs]


def with_books(body, block):
    """Put the reading block before the related problems (or before the discussion)."""
    if not block:
        return body
    i = body.find('<section class="mp-related"')
    if i == -1:
        i = body.find('<section class="mp-discuss"')
    return body[:i] + block + "\n\n" + body[i:]


def with_related(body, block):
    """Put the related block before the discussion block."""
    i = body.find('<section class="mp-discuss"')
    return body[:i] + block + "\n\n" + body[i:]


def with_discuss(body, lang, slug):
    """Put the discussion block before the newsletter block (or before the footer)."""
    i = body.find('<section class="mp-subscribe"')
    if i == -1:
        i = body.rfind("<footer")
    return body[:i] + discuss_block(lang, slug) + "\n\n" + body[i:]


def with_subscribe(body, lang):
    """Put the newsletter block right before the last <footer> of the page. Pages without a footer get it
    before the </div> that closes .wrap (the last one ahead of the page script), so it keeps the page width."""
    i = body.rfind("<footer")
    if i == -1:
        i = body.rfind("</div>", 0, body.rfind("\n<script>"))
    return body[:i] + subscribe_block(lang) + "\n\n" + body[i:] if i != -1 else body + subscribe_block(lang)


def subscribe_block(lang):
    return SUBSCRIBE % SUBSCRIBE_TEXT[lang]


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


# Answers stay hidden until the visitor guesses or asks for them. Anything with class sp-after shows
# only inside a [data-spoil] element that has the class solved; sp-before is the other way round.
# A problem page is <html data-spoil>; on the home page each card is. The choice is remembered per
# problem in localStorage, so the card and the page agree. Elements with data-solve reveal on click.
# data-unsolve hides the answer again (for showing the site to someone from your own screen): on a page it
# reloads it clean, on a card it closes that card, data-unsolve="all" forgets every problem. The hide buttons
# are added here, under the hero buttons of a page and under each card's answer.
SPOIL_SCRIPT = """<script>
(function () {
  var d = document.documentElement, SLUG = %s;
  function key(s) { return "mp-solved:" + s; }
  function seen(s) { try { return !!localStorage.getItem(key(s)); } catch (e) { return false; } }
  function mark(s) { try { localStorage.setItem(key(s), "1"); } catch (e) {} }
  function forget(s) { try { localStorage.removeItem(key(s)); } catch (e) {} }
  function cards() { return [].slice.call(document.querySelectorAll("[data-spoil][id]")); }
  function some() { d.classList.toggle("some-solved", cards().some(function (c) { return c.classList.contains("solved"); })); }
  function hideBtn(cls) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "sp-skip sp-after " + cls; b.setAttribute("data-unsolve", "");
    b.textContent = d.dataset.lang === "en" ? "Hide the answer" : "Сховати відповідь";
    return b;
  }
  if (SLUG && seen(SLUG)) d.classList.add("solved");
  window.mpSolved = function () { return d.classList.contains("solved"); };
  window.mpSolve = function () {
    if (!SLUG || window.mpSolved()) return;
    d.classList.add("solved"); mark(SLUG);
    document.dispatchEvent(new Event("solved"));
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-solve], [data-unsolve]");
    if (!b) return;
    var card = b.closest("[data-spoil][id]"), hide = b.hasAttribute("data-unsolve");
    if (hide && b.getAttribute("data-unsolve") === "all") {
      cards().forEach(function (c) { c.classList.remove("solved"); forget(c.id); });
    } else if (card && card !== d) {
      card.classList.toggle("solved", !hide);
      if (hide) forget(card.id); else mark(card.id);
    } else if (hide) {
      // the page may already show a guess result or a played game, so start it over
      forget(SLUG); scrollTo(0, 0); location.replace(location.pathname);
      return;
    } else window.mpSolve();
    some();
  });
  document.addEventListener("DOMContentLoaded", function () {
    if (SLUG) {
      var go = document.querySelector(".hero .hero-go");
      if (go) { var w = document.createElement("div"); w.className = "hero-go sp-after"; w.appendChild(hideBtn("")); go.parentNode.insertBefore(w, go.nextSibling); }
      return;
    }
    cards().forEach(function (c) {
      if (seen(c.id)) c.classList.add("solved");
      var a = c.querySelector(".tz-ans");
      if (a) a.parentNode.insertBefore(hideBtn("tz-hide"), a.nextSibling);
    });
    some();
  });
})();
</script>"""


# Formula lines (.fx math, see site.css) wider than their row shrink to fit, down to 70% of their size,
# so a phone shows the whole line; anything still wider scrolls inside its row. Lines that scripts
# rewrite are refitted.
FX_SCRIPT = """<script>
(function () {
  function fit() {
    document.querySelectorAll(".fx math").forEach(function (m) {
      m.style.fontSize = "";
      var w = m.clientWidth, s = m.scrollWidth;
      if (s > w) m.style.fontSize = Math.max(0.7, (w - 2) / s) * parseFloat(getComputedStyle(m).fontSize) + "px";
    });
  }
  var t;
  function later() { clearTimeout(t); t = setTimeout(fit, 60); }
  document.addEventListener("DOMContentLoaded", function () {
    if (!document.querySelector(".fx")) return;
    fit();
    addEventListener("resize", later);
    if (document.fonts) document.fonts.ready.then(fit);
    document.querySelectorAll(".fx").forEach(function (f) { new MutationObserver(later).observe(f, { childList: true, subtree: true, characterData: true }); });
  });
})();
</script>"""

def lang_script(lang, urls, base):
    return LANG_SCRIPT % {"path": json.dumps(urlparse(base).path or "/"), "here": json.dumps(lang),
                          "alt": json.dumps({l: urlparse(u).path for l, u in urls.items()})}


def head(lang, urls, title, description, image, image_alt, ld, base, slug=None, share=None, robots="index, follow, max-image-preview:large"):
    """<head> tags shared by every page. `urls` maps each language to that page's URL.
    `share` (title, description) replaces them in link previews, so a shared link does not give the answer away."""
    other = "en" if lang == "uk" else "uk"
    st, sd = share or (title, description)
    return f"""<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{lang_script(lang, urls, base)}
{SPOIL_SCRIPT % json.dumps(slug)}
{FX_SCRIPT if slug else ""}
<title>{e(title)}</title>
<meta name="description" content="{e(description)}">
<meta name="robots" content="{robots}">
<meta name="author" content="{AUTHOR_NAME[lang]}">
<link rel="canonical" href="{urls[lang]}">
<link rel="alternate" hreflang="uk" href="{urls["uk"]}">
<link rel="alternate" hreflang="en" href="{urls["en"]}">
<link rel="alternate" hreflang="x-default" href="{urls[X_DEFAULT]}">
<meta name="theme-color" content="#2A3DD1">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="{base}favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="{SITE_NAME[lang]}" href="{base}{LANG_PATH[lang]}feed.xml">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{SITE_NAME[lang]}">
<meta property="og:title" content="{e(st)}">
<meta property="og:description" content="{e(sd)}">
<meta property="og:url" content="{urls[lang]}">
<meta property="og:locale" content="{LOCALE[lang]}">
<meta property="og:locale:alternate" content="{LOCALE[other]}">
<meta property="og:image" content="{image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{e(image_alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{e(st)}">
<meta name="twitter:description" content="{e(sd)}">
<meta name="twitter:image" content="{image}">
{FONTS}
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>"""


def css_link(base):
    """Shared stylesheet; the content hash in the URL busts caches after every change."""
    v = hashlib.sha1(SITE_CSS.read_bytes()).hexdigest()[:8]
    return f'<link rel="stylesheet" href="{base}site.css?v={v}">'


def write(path, doc):
    left = re.findall(r"\{\{[A-Z_:a-z0-9-]+\}\}", doc)
    if left:
        raise SystemExit(f"{path}: unfilled placeholders {sorted(set(left))}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(doc, encoding="utf-8")
    print(f"{path.relative_to(DOCS)}  {len(doc) // 1024} KB")


def build_problem(slug, base, metas, books):
    src_dir = PROBLEMS / slug
    meta = dict(metas)[slug]
    related = pick_related(slug, metas)
    refs = book_refs(slug, meta, books)
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
                      f'<a class="brand" href="{hub[lang]}" style="text-decoration:none">{BRAND_MARK}{SITE_NAME[lang]}</a>', body, count=1)
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
                "datePublished": meta["published"],
                "dateModified": meta["updated"],
                "isPartOf": {"@type": "WebSite", "name": SITE_NAME[lang], "url": hub[lang]},
                "author": {"@id": base + "#author"},
                **({"citation": books_ld(lang, refs, books)} if refs else {}),
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
        h = head(lang, urls, m["title"], m["description"], page_base + f"og-{lang}.png", m["og_alt"], ld, base, slug,
                 (m["share"]["title"], m["share"]["description"]) if "share" in m else None)
        if "i.ytimg.com" in body:
            h += '\n<link rel="preconnect" href="https://i.ytimg.com">'
        body = with_discuss(with_subscribe(body, lang), lang, slug)
        items = []
        for s in related:
            rm = dict(metas)[s][lang]
            items.append((base + s + "/" + LANG_PATH[lang], rm["card"]["title"], rm.get("share", {}).get("description", rm["card"]["text"])))
        body = with_related(body, related_block(lang, items, hub[lang]))
        body = with_books(body, books_block(lang, refs, books, base + "books/" + LANG_PATH[lang]))
        doc = (f'<!doctype html>\n<html lang="{lang}" data-lang="{lang}" data-static data-spoil>\n<head>\n{h}\n{RESET}\n{style}\n{css_link(base)}\n'
               f'</head>\n<body>\n{body.strip()}\n{claspo_snippet(lang)}\n{CF_ANALYTICS}\n</body>\n</html>\n')
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
        blocks.append(f'<article class="problem" id="{slug}" data-spoil{tint}>\n' + teaser.replace("{{URL}}", "{{URL:%s}}" % slug) + "\n</article>")
    src = src.replace("<!--PROBLEMS-->", "\n".join(blocks))
    for lang in LANGS:
        m, other = meta[lang], ("en" if lang == "uk" else "uk")
        body = LangStripper(src, other).strip()
        for slug, _, purls in problems:
            body = body.replace("{{URL:%s}}" % slug, purls[lang])
        body = body.replace("{{BOOKS}}", base + "books/" + LANG_PATH[lang])
        body = body.replace("{{HOME_BASE}}", base).replace("{{HOME}}", urls[lang]).replace("{{FIRST}}", problems[0][2][lang])
        if lang == "en":
            body = body.replace('alt="Дмитро Кудренко" data-alt-en="Dmytro Kudrenko"', 'alt="Dmytro Kudrenko"')
        else:
            body = body.replace(' data-alt-en="Dmytro Kudrenko"', "")
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
        body = with_subscribe(body, lang)
        doc = (f'<!doctype html>\n<html lang="{lang}" data-lang="{lang}" data-static>\n<head>\n{h}\n{RESET}\n'
               f'{css_link(base)}\n{style}\n</head>\n<body>\n{body.strip()}\n{claspo_snippet(lang)}\n{CF_ANALYTICS}\n</body>\n</html>\n')
        write(DOCS / LANG_PATH[lang] / "index.html", doc)
    for f in (HUB / "assets").iterdir():
        if f.suffix in {".png", ".jpg"}:
            shutil.copy(f, DOCS / f.name)
    return urls


PAGES = ROOT / "pages"


def build_subscribed(problems, base):
    """docs/subscribed/: where the "confirm your subscription" link of the newsletter leads. Not indexed,
    not in the sitemap, no Claspo form (the visitor has just subscribed). Suggests three puzzles."""
    src_dir = PAGES / "subscribed"
    meta = json.loads((src_dir / "meta.json").read_text(encoding="utf-8"))
    src = (src_dir / "page.html").read_text(encoding="utf-8")
    page_base = base + "subscribed/"
    urls = {l: page_base + LANG_PATH[l] for l in LANGS}
    home = {l: base + LANG_PATH[l] for l in LANGS}
    by_slug = {p[0]: p for p in problems}
    for lang in LANGS:
        m, other = meta[lang], ("en" if lang == "uk" else "uk")
        picks = "\n".join(
            f'      <a class="pick" href="{by_slug[s][2][lang]}"><b>{e(by_slug[s][1][lang]["card"]["title"])}</b>'
            f'<span>{e(by_slug[s][1][lang]["share"]["description"])}</span>'
            f'<i>{"Спробувати" if lang == "uk" else "Try it"} →</i></a>'
            for s in meta["picks"] if s in by_slug)
        body = LangStripper(src.replace("<!--PICKS-->", picks), other).strip()
        body = body.replace("{{HOME}}", home[lang]).replace("{{BRAND}}", BRAND_MARK + SITE_NAME[lang])
        body = body.replace('href="#uk" hreflang="uk"', f'href="{urls["uk"]}" hreflang="uk"')
        body = body.replace('href="#en" hreflang="en"', f'href="{urls["en"]}" hreflang="en"')
        style = body[:body.index("</style>") + len("</style>")]
        body = body[len(style):]
        ld = {"@context": "https://schema.org", "@type": "WebPage", "url": urls[lang], "name": m["title"], "inLanguage": lang}
        h = head(lang, urls, m["title"], m["description"], base + f"og-{lang}.png", m["title"], ld, base, robots="noindex")
        doc = (f'<!doctype html>\n<html lang="{lang}" data-lang="{lang}" data-static>\n<head>\n{h}\n{RESET}\n'
               f'{css_link(base)}\n{style}\n</head>\n<body>\n{body.strip()}\n{CF_ANALYTICS}\n</body>\n</html>\n')
        write(DOCS / "subscribed" / LANG_PATH[lang] / "index.html", doc)


SHELF_TEXT = {"uk": ("Є українською", "Лише англійською"), "en": (None, None)}


def build_books(problems, base, books):
    """docs/books/: every book from books.json with the puzzles it discusses (title and chapter, no answers).
    On the Ukrainian page books with a Ukrainian edition form the first group."""
    src_dir = PAGES / "books"
    meta = json.loads((src_dir / "meta.json").read_text(encoding="utf-8"))
    src = (src_dir / "page.html").read_text(encoding="utf-8")
    page_base = base + "books/"
    urls = {l: page_base + LANG_PATH[l] for l in LANGS}
    home = {l: base + LANG_PATH[l] for l in LANGS}
    cites = {}  # book id -> [(problem, ref)] in site order
    for p in problems:
        for r in p[1].get("books", []):
            cites.setdefault(r["id"], []).append((p, r))
    unused = set(books) - set(cites)
    if unused:
        raise SystemExit(f"books.json: not cited by any problem: {sorted(unused)}")
    for lang in LANGS:
        m, other = meta[lang], ("en" if lang == "uk" else "uk")
        order = sorted(cites, key=lambda k: (-len(cites[k]), books[k]["author"]["en"]))
        groups = [[k for k in order if books[k].get("ua")], [k for k in order if not books[k].get("ua")]] if lang == "uk" else [order]
        parts = []
        for heading, ids in zip(SHELF_TEXT[lang], groups):
            cards = []
            for k in ids:
                b = books[k]
                ua = b.get("ua") if lang == "uk" else None
                if ua:
                    title, meta_line = ua["title"], f'{ua["publisher"]}, {ua["year"]}'
                    orig = f'<p class="shelf-orig">{e(b["title"])}, {b["year"]}</p>'
                else:
                    title, meta_line, orig = b["title"], str(b["year"]), ""
                items = "\n".join(
                    f'          <li><a href="{p[2][lang]}">{e(p[1][lang]["card"]["title"])}</a>'
                    + (f' <span>· {e(ref_where(lang, r))}</span>' if ref_where(lang, r) else "") + "</li>"
                    for p, r in cites[k])
                cards.append(f"""      <li class="shelf-book" id="{k}">
        <h3>{e(title)}</h3>
        <p class="shelf-author">{e(b["author"][lang])}</p>
        <p class="shelf-meta">{e(meta_line)}</p>{orig}
        <ul class="shelf-puzzles">
{items}
        </ul>
      </li>""")
            head_html = f"\n    <h2>{heading}</h2>" if heading else ""
            parts.append(f'  <section class="shelf-group">{head_html}\n    <ul class="shelf">\n' + "\n".join(cards) + "\n    </ul>\n  </section>")
        body = LangStripper(src.replace("<!--SHELF-->", "\n".join(parts)), other).strip()
        body = body.replace("{{HOME}}", home[lang]).replace("{{BRAND}}", BRAND_MARK + SITE_NAME[lang])
        body = body.replace('href="#uk" hreflang="uk"', f'href="{urls["uk"]}" hreflang="uk"')
        body = body.replace('href="#en" hreflang="en"', f'href="{urls["en"]}" hreflang="en"')
        style = body[:body.index("</style>") + len("</style>")]
        body = body[len(style):]
        ld = {"@context": "https://schema.org", "@graph": [
            {"@type": "CollectionPage", "@id": urls[lang] + "#page", "url": urls[lang], "name": m["title"],
             "description": m["description"], "inLanguage": lang, "author": {"@id": base + "#author"},
             "isPartOf": {"@type": "WebSite", "name": SITE_NAME[lang], "url": home[lang]},
             "mainEntity": {"@type": "ItemList", "numberOfItems": len(order), "itemListElement": [
                 {"@type": "ListItem", "position": i + 1, "item": book_ld(lang, books[k])}
                 for i, k in enumerate([k for g in groups for k in g])]}},
            author_ld(lang, base),
            {"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": SITE_NAME[lang], "item": home[lang]},
                {"@type": "ListItem", "position": 2, "name": BOOKS_TEXT[lang][0], "item": urls[lang]}]},
        ]}
        h = head(lang, urls, m["title"], m["description"], base + f"og-{lang}.png", m["og_alt"], ld, base)
        doc = (f'<!doctype html>\n<html lang="{lang}" data-lang="{lang}" data-static>\n<head>\n{h}\n{RESET}\n'
               f'{css_link(base)}\n{style}\n</head>\n<body>\n{body.strip()}\n{CF_ANALYTICS}\n</body>\n</html>\n')
        write(DOCS / "books" / LANG_PATH[lang] / "index.html", doc)
    return urls


NOT_FOUND_TEXT = {
    "uk": ("Помилка 404", "Такої сторінки немає", "Можливо, адресу змінено або в ній помилка. Ось задачі, які точно існують:", "На головну"),
    "en": ("Error 404", "This page does not exist", "The address may have changed, or there may be a typo in it. Here are the puzzles that do exist:", "Go to the home page"),
}


def build_404(problems, base):
    """docs/404.html, which GitHub Pages serves for any missing URL. Both languages are in the page;
    a /en/ path or an English-first browser shows the English one. Not indexed."""
    parts = []
    for lang in LANGS:
        eyebrow, title, text, home = NOT_FOUND_TEXT[lang]
        links = "\n".join(f'      <li><a href="{p[2][lang]}">{e(p[1][lang]["card"]["title"])}</a></li>' for p in problems)
        parts.append(f"""<section class="nf {lang}">
    <span class="eyebrow">{eyebrow}</span>
    <h1>{title}</h1>
    <p class="lead">{text}</p>
    <ul class="nf-list">
{links}
    </ul>
    <p><a class="btn" href="{base + LANG_PATH[lang]}">{home}</a></p>
  </section>""")
    doc = f"""<!doctype html>
<html lang="uk" data-lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script>
(function () {{
  var d = document.documentElement, en = /\\/en(\\/|$)/.test(location.pathname);
  if (!en) {{
    var m = document.cookie.match(/(?:^|; )mp_lang=(uk|en)/), l = (navigator.languages || [navigator.language || ""])[0] || "";
    en = m ? m[1] === "en" : !/^(uk|ru|be)/i.test(l);
  }}
  if (en) {{ d.lang = "en"; d.dataset.lang = "en"; document.title = "Page not found · {SITE_NAME["en"]}"; }}
}})();
</script>
<title>Сторінку не знайдено · {SITE_NAME["uk"]}</title>
<meta name="robots" content="noindex">
<link rel="icon" href="{base}favicon.svg" type="image/svg+xml">
{FONTS}
{RESET}
<style>
:root:not([data-lang="en"]) .en, :root[data-lang="en"] .uk {{ display: none !important; }}
body {{ padding-inline: max(16px, env(safe-area-inset-left, 0px)); }}
.wrap {{ max-width: 860px; margin: 0 auto; padding-block: 20px 64px; }}
.nf {{ display: grid; gap: 18px; margin-top: 48px; }}
.nf-list {{ list-style: none; padding: 0; margin: 8px 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 8px 24px; }}
.nf-list a {{ font-weight: 600; }}
.btn {{ display: inline-block; background: var(--ink); color: #fff; text-decoration: none; border-radius: 999px; padding: 12px 22px; font-weight: 600; }}
</style>
{css_link(base)}
</head>
<body>
<div class="wrap">
  <a class="brand uk" href="{base}">{BRAND_MARK}{SITE_NAME["uk"]}</a>
  <a class="brand en" href="{base}en/">{BRAND_MARK}{SITE_NAME["en"]}</a>
  {parts[0]}
  {parts[1]}
</div>
{CF_ANALYTICS}
</body>
</html>
"""
    write(DOCS / "404.html", doc)


def rss_date(day):
    return format_datetime(datetime.fromisoformat(day).replace(tzinfo=timezone.utc))


def build_feeds(metas, base):
    """RSS per language for newsletters and feed readers. Items carry only `share` (the question),
    never the description, because a feed preview must not give the answer away."""
    hub_meta = json.loads((HUB / "meta.json").read_text(encoding="utf-8"))
    items = sorted(metas, key=lambda sm: (sm[1]["published"], sm[1].get("order", 99)), reverse=True)
    for lang in LANGS:
        feed_url = base + LANG_PATH[lang] + "feed.xml"
        entries = []
        for slug, meta in items:
            m = meta[lang]
            url = base + slug + "/" + LANG_PATH[lang]
            img = base + slug + f"/og-{lang}.png"
            size = (DOCS / slug / f"og-{lang}.png").stat().st_size
            # editors that read images only from the item HTML get the illustration from here
            body = (f'<p><a href="{url}"><img src="{img}" alt="{e(m["og_alt"])}" width="1200" height="630"></a></p>'
                    f'<p>{e(m["share"]["description"])}</p>')
            tags = "".join(f"\n      <category>{e(t)}</category>" for t in m["card"]["tags"])
            entries.append(
                f"    <item>\n      <title>{e(m['share']['title'])}</title>\n      <link>{url}</link>\n"
                f"      <guid isPermaLink=\"true\">{url}</guid>\n"
                f"      <description>{e(m['share']['description'])}</description>\n"
                f"      <content:encoded><![CDATA[{body}]]></content:encoded>\n"
                f"      <pubDate>{rss_date(meta['published'])}</pubDate>\n"
                f"      <atom:updated>{meta['updated']}T00:00:00Z</atom:updated>{tags}\n"
                f"      <enclosure url=\"{img}\" length=\"{size}\" type=\"image/png\"/>\n"
                f"      <media:content url=\"{img}\" medium=\"image\" type=\"image/png\" width=\"1200\" height=\"630\">\n"
                f"        <media:description>{e(m['og_alt'])}</media:description>\n      </media:content>\n"
                f"      <media:thumbnail url=\"{img}\" width=\"1200\" height=\"630\"/>\n    </item>")
        last = max(meta["updated"] for _, meta in items)
        (DOCS / LANG_PATH[lang] / "feed.xml").write_text(
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:content="http://purl.org/rss/1.0/modules/content/">\n'
            f"  <channel>\n    <title>{SITE_NAME[lang]}</title>\n    <link>{base}{LANG_PATH[lang]}</link>\n"
            f"    <description>{e(hub_meta[lang]['description'])}</description>\n    <language>{lang}</language>\n"
            f"    <lastBuildDate>{rss_date(last)}</lastBuildDate>\n"
            f"    <atom:link href=\"{feed_url}\" rel=\"self\" type=\"application/rss+xml\"/>\n"
            f"    <image>\n      <url>{base}og-{lang}.png</url>\n      <title>{SITE_NAME[lang]}</title>\n"
            f"      <link>{base}{LANG_PATH[lang]}</link>\n    </image>\n"
            + "\n".join(entries) + "\n  </channel>\n</rss>\n", encoding="utf-8")
        print(f"{LANG_PATH[lang]}feed.xml ({len(entries)} items)")


def build(base, out=None):
    global DOCS
    if out:
        DOCS = Path(out).resolve()
    if DOCS.exists():
        shutil.rmtree(DOCS)
    # a problem is published only once all three source files exist (lets drafts sit in problems/)
    dirs = [p for p in PROBLEMS.iterdir() if all((p / f).exists() for f in ("page.html", "teaser.html", "meta.json"))]
    metas = [(p.name, json.loads((p / "meta.json").read_text(encoding="utf-8"))) for p in dirs]
    metas.sort(key=lambda sm: (sm[1].get("order", 99), sm[0]))
    for slug, meta in metas:
        for k in ("published", "updated"):
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", meta.get(k, "")):
                raise SystemExit(f"problems/{slug}/meta.json: \"{k}\" must be a YYYY-MM-DD date")
    books = load_books()
    problems = [build_problem(s, base, metas, books) for s, _ in metas]
    hub = build_hub(problems, base)
    build_404(problems, base)
    build_subscribed(problems, base)
    shelf = build_books(problems, base, books)
    build_feeds(metas, base)

    today = date.today().isoformat()
    entries = []
    for urls, mod in [(hub, today), (shelf, today)] + [(p[2], p[1]["updated"]) for p in problems]:
        for lang in LANGS:
            alts = "".join(f'\n    <xhtml:link rel="alternate" hreflang="{h}" href="{urls[h]}"/>' for h in LANGS)
            alts += f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{urls[X_DEFAULT]}"/>'
            entries.append(f"  <url>\n    <loc>{urls[lang]}</loc>\n    <lastmod>{mod}</lastmod>{alts}\n  </url>")
    (DOCS / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + "\n".join(entries) + "\n</urlset>\n", encoding="utf-8")
    (DOCS / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {base}sitemap.xml\n", encoding="utf-8")
    shutil.copy(ROOT / "favicon.svg", DOCS / "favicon.svg")
    shutil.copy(SITE_CSS, DOCS / "site.css")
    if CUSTOM_DOMAIN and base == DEFAULT_BASE:
        (DOCS / "CNAME").write_text(CUSTOM_DOMAIN + "\n")
    (DOCS / ".nojekyll").write_text("")
    print(f"sitemap.xml ({len(entries)} URLs), robots.txt, favicon.svg")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default=DEFAULT_BASE, help="public URL of the site root, ending with /")
    ap.add_argument("--out", help="write the site here instead of docs/ (for local checks)")
    a = ap.parse_args()
    build(a.base_url if a.base_url.endswith("/") else a.base_url + "/", a.out)
