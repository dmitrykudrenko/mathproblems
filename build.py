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
# IndexNow key (Bing, Yandex and others): served as docs/<key>.txt, used by tools/indexnow.py
INDEXNOW_KEY = "8ade1159e80343c9902c820ee44bd4ce"
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
# The author's own browsers opt out: open any page once with ?notrack=1 (?notrack=0 undoes it).
# The flag lives in localStorage, the parameter is removed from the address bar right away.
CF_ANALYTICS_TOKEN = "adf9fd3e4773416fb45241d58aea741f"
CF_ANALYTICS = """<script>(function () {
  var q = new URLSearchParams(location.search).get('notrack'), off = false;
  try {
    if (q === '1') localStorage.setItem('mp-notrack', '1');
    if (q === '0') localStorage.removeItem('mp-notrack');
    off = localStorage.getItem('mp-notrack') === '1';
  } catch (e) {}
  if (q !== null) {
    var u = new URL(location.href); u.searchParams.delete('notrack');
    history.replaceState(null, '', u.pathname + u.search + u.hash);
  }
  if (off) return;
  var s = document.createElement('script');
  s.defer = true; s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', '{"token": "%s"}');
  document.body.appendChild(s);
})();</script>""" % CF_ANALYTICS_TOKEN if CF_ANALYTICS_TOKEN else ""

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


# One-click check of the maths level under the discussion intro: the vote goes to the stats worker as its own
# problem "<slug>-lvl" (so it never mixes with the answer stats) with the key "<vote>.<level>", which keeps votes
# apart if the level is changed later. One vote per browser, nothing is shown back but a thank-you.
LEVEL_VOTE_TEXT = {
    "uk": ("Рівень «%s» відповідає задачі?", (("harder", "Ні, складніше"), ("right", "Так"), ("easier", "Ні, простіше")),
           "Дякуємо! Це допоможе точніше ставити рівні."),
    "en": ("Is “%s” the right level for this puzzle?", (("harder", "No, harder"), ("right", "Yes"), ("easier", "No, easier")),
           "Thank you! This helps set the levels right."),
}
LEVEL_VOTE_SCRIPT = """<script>
(function () {
  var box = document.querySelector(".mp-lvote"), API = %s, SLUG = %s + "-lvl", LEVEL = %d, KEY = "mp-lvote:" + SLUG;
  if (!box || !window.fetch) return;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function done() { box.classList.add("done"); }
  if (get(KEY)) return done();
  box.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-vote]");
    if (!b) return;
    try { localStorage.setItem(KEY, b.dataset.vote); } catch (err) {}
    done();
    if (get("mp-notrack") === "1") return;
    fetch(API, { method: "POST", headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ s: SLUG, k: b.dataset.vote + "." + LEVEL, h: 0 }) }).catch(function () {});
  });
})();
</script>"""


def level_vote(lang, slug, level):
    if not STATS_API:
        return ""
    q, votes, thanks = LEVEL_VOTE_TEXT[lang]
    btns = "".join(f'<button type="button" data-vote="{k}">{t}</button>' for k, t in votes)
    return (f'\n    <div class="mp-lvote"><p>{e(q % LEVELS[level][lang][0])}</p><div class="mp-lvote-btns">{btns}</div>'
            f'<p class="mp-lvote-thanks">{thanks}</p></div>\n'
            + LEVEL_VOTE_SCRIPT % (json.dumps(STATS_API), json.dumps(slug), level))


def discuss_block(lang, slug, level):
    eyebrow, title, text = DISCUSS_TEXT[lang]
    g = GISCUS
    return f"""<section class="mp-discuss" id="discuss">
  <div class="mp-discuss-text">
    <span class="eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
    <p>{text}</p>{level_vote(lang, slug, level)}
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
# Theme filters on the home page; every problem lists one or more keys in meta.json "topics", in this order of chips
TOPICS = {
    "interview": {"uk": "Для співбесід", "en": "Interview puzzles"},
    "conditional": {"uk": "Умовна ймовірність", "en": "Conditional probability"},
    "chance": {"uk": "Комбінаторика й шанси", "en": "Counting and chance"},
    "stats": {"uk": "Статистика й упередження", "en": "Statistics and biases"},
    "games": {"uk": "Ігри та стратегії", "en": "Games and strategy"},
    "quick": {"uk": "Логіка й кмітливість", "en": "Logic and quick thinking"},
}
TOPICS_ALL = {"uk": "Усі", "en": "All"}
# How much maths a reader needs, meta.json "level": a small badge on the home card and in the problem hero.
# Judged on what the main path shows (hero, puzzle, rounds 1-4 with their charts), not on the optional
# "for those who love formulas" card, the "subtheory" blocks or round 5. It says nothing about how tricky
# the puzzle is. The badge hint links to the home page filtered by level (?l=); no second row of chips.
LEVELS = {
    1: {"uk": ("Для всіх", "Вистачить арифметики й логіки"), "en": ("For everyone", "Arithmetic and logic are enough")},
    2: {"uk": ("Шкільна математика", "Дроби, відсотки, проста ймовірність, степені"),
        "en": ("School maths", "Fractions, percentages, basic probability, powers")},
    3: {"uk": ("Поглиблено", "Сподівання, дисперсія, кореляція, логарифми, ряди"),
        "en": ("Advanced", "Expected value, variance, correlation, logarithms, series")},
}
LEVEL_LD = {1: "beginner", 2: "intermediate", 3: "advanced"}


LEVEL_LINK = {"uk": "Усі задачі цього рівня", "en": "All puzzles of this level"}
LIST_TEXT = {
    "uk": {"topic": "Тема", "all": "усі", "level": "Рівень", "any": "будь-який", "solved": "Розв'язано", "of": "з",
           "only": "Показати лише розв'язані", "every": "Показати всі задачі", "random": "Випадкова",
           "empty": "Тут нічого немає.", "reset": "Показати всі задачі", "new": "нове", "done": "розв'язано"},
    "en": {"topic": "Topic", "all": "all", "level": "Level", "any": "any", "solved": "Solved", "of": "of",
           "only": "Show only the solved ones", "every": "Show all puzzles", "random": "Random",
           "empty": "Nothing here.", "reset": "Show all puzzles", "new": "new", "done": "solved"},
}
# A click on the badge opens the hint (a click elsewhere or Esc closes it); on the home page the hint opens to
# the left when the card has no room on the right.
LEVEL_SCRIPT = """<script>
(function () {
  function close(b) { b.setAttribute("aria-expanded", "false"); b.nextElementSibling.hidden = true; }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".mp-level-btn");
    [].forEach.call(document.querySelectorAll('.mp-level-btn[aria-expanded="true"]'), function (b) { if (b !== btn) close(b); });
    if (!btn) return;
    if (btn.getAttribute("aria-expanded") === "true") return close(btn);
    var hint = btn.nextElementSibling, box = (btn.closest(".problem") || document.documentElement).getBoundingClientRect();
    btn.setAttribute("aria-expanded", "true"); hint.hidden = false;
    btn.parentNode.classList.toggle("flip", btn.getBoundingClientRect().left + hint.offsetWidth > box.right - 12);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") [].forEach.call(document.querySelectorAll('.mp-level-btn[aria-expanded="true"]'), close);
  });
})();
</script>"""


def level_badge(lang, n, hub_url):
    """Three bars, the first n filled, and the level name; a click shows what maths it takes and a link to the
    home page filtered to this level."""
    name, hint = LEVELS[n][lang]
    bars = '<i class="on"></i>' * n + "<i></i>" * (3 - n)
    return (f'<span class="mp-level"><button type="button" class="mp-level-btn" aria-expanded="false">'
            f'<span class="mp-bars" aria-hidden="true">{bars}</span>{e(name)}</button>'
            f'<span class="mp-level-hint" hidden>{e(hint)}<a href="{hub_url}?l={n}#all">{LEVEL_LINK[lang]} →</a></span></span>')


def list_controls(problems):
    """The line above the card grid: topic and level selects, then (once something is solved) "Solved 3 of 45",
    where 3 shows only the solved puzzles and 45 all of them, and a link to a random unsolved puzzle among those shown.
    Every label exists in both languages; the stripper keeps one."""
    def both(key):
        return "".join(f'<span class="{l}">{e(LIST_TEXT[l][key])}</span>' for l in LANGS)
    def opts(items):
        return "".join(f'<option class="{l}" value="{v}">{e(t[l])}</option>' for v, t in items for l in LANGS)
    topics = opts([("", {l: LIST_TEXT[l]["all"] for l in LANGS})] + [(k, t) for k, t in TOPICS.items()])
    levels = opts([("", {l: LIST_TEXT[l]["any"] for l in LANGS})] + [(str(n), {l: v[l][0] for l in LANGS}) for n, v in LEVELS.items()])
    return (f'<div class="pl-bar"><div class="pl-filt">'
            f'<label class="pl-sel"><span>{both("topic")}</span><select id="pl-t">{topics}</select></label>'
            f'<label class="pl-sel"><span>{both("level")}</span><select id="pl-l">{levels}</select></label></div>'
            f'<div class="pl-side"><span class="pl-prog" hidden>{both("solved")} '
            f'<button type="button" class="pl-num" id="pl-only" aria-pressed="false" title="{{{{LIST:only}}}}">0</button> {both("of")} '
            f'<button type="button" class="pl-num" id="pl-all" aria-pressed="true" title="{{{{LIST:every}}}}">{len(problems)}</button></span>'
            f'<button type="button" class="pl-rnd" id="pl-rnd">{both("random")} →</button></div></div>\n'
            f'<p class="pl-empty" hidden>{both("empty")} <button type="button" class="pl-reset">{both("reset")}</button></p>')


def problem_cards(problems):
    """The grid of all puzzles: the illustration from the problem's OG image on its tint, the name, the question
    (the spoiler-free `share` text) and the level. {{URL:slug}} and {{OG:slug}} are filled in per language."""
    out = []
    for slug, meta, _ in problems:
        m = re.search(r"--tint:\s*(#[0-9A-Fa-f]{6})", (PROBLEMS / slug / "page.html").read_text(encoding="utf-8"))
        tint = f' style="--tint: {m.group(1)}"' if m else ""
        n = meta["level"]
        bars = '<i class="on"></i>' * n + "<i></i>" * (3 - n)
        text = lambda f: "".join(f'<span class="{l}">{e(f(meta[l]))}</span>' for l in LANGS)
        flag = lambda key: "".join(f'<span class="{l}">{e(LIST_TEXT[l][key])}</span>' for l in LANGS)
        out.append(
            f'      <a class="pc" href="{{{{URL:{slug}}}}}" data-slug="{slug}" data-topics="{" ".join(meta["topics"])}" '
            f'data-level="{n}" data-pub="{meta["published"]}"{tint}>'
            f'<span class="pc-img"><span class="pc-art"><img src="{{{{OG:{slug}}}}}" alt="" width="1200" height="630" loading="lazy" decoding="async"></span>'
            f'<span class="pc-flag pc-new">{flag("new")}</span><span class="pc-flag pc-done">✓ {flag("done")}</span></span>'
            f'<span class="pc-txt"><h3>{text(lambda x: x["card"]["title"])}</h3><span class="pc-q">{text(lambda x: x["share"]["description"])}</span>'
            f'<span class="pc-lv"><span class="mp-bars" aria-hidden="true">{bars}</span>'
            + "".join(f'<span class="{l}">{e(LEVELS[n][l][0])}</span>' for l in LANGS) + '</span></span></a>')
    return "\n".join(out)


RELATED_COUNT = 6
RELATED_MAX_IN = 8
RELATED_MIN_IN = 3
RELATED_TEXT = {
    "uk": ("Ще задачі", "Інші парадокси", "Усі задачі"),
    "en": ("More puzzles", "Other paradoxes", "All puzzles"),
}


def pick_related(metas):
    """{slug: related slugs}. Problems sharing the most home-page topics (worth two tags each), then card tags
    (ignoring the ubiquitous "симуляція"), then the same level, then the next ones in site order. No problem is
    linked from more than RELATED_MAX_IN pages or fewer than RELATED_MIN_IN, so close neighbours do not hog
    the links and every page gets some."""
    order = [s for s, _ in metas]
    topics = {s: set(m["topics"]) for s, m in metas}
    tags = {s: set(m["uk"]["card"]["tags"]) - {"симуляція"} for s, m in metas}
    level = {s: m["level"] for s, m in metas}
    inbound = dict.fromkeys(order, 0)
    out = {}
    for i, slug in enumerate(order):
        others = order[i + 1:] + order[:i]
        score = lambda s: (2 * len(topics[s] & topics[slug]) + len(tags[s] & tags[slug]), level[s] == level[slug], -inbound[s])
        ranked = sorted(others, key=score, reverse=True)
        out[slug] = list(dict.fromkeys([s for s in ranked if inbound[s] < RELATED_MAX_IN] + ranked))[:RELATED_COUNT]
        for s in out[slug]:
            inbound[s] += 1
    # Second pass: a problem linked from fewer than RELATED_MIN_IN pages takes the last card of the pages
    # closest to it, where that card's own problem can spare a link.
    for slug in sorted(order, key=lambda s: inbound[s]):
        hosts = sorted((h for h in order if h != slug and slug not in out[h]),
                       key=lambda h: (2 * len(topics[h] & topics[slug]) + len(tags[h] & tags[slug]), level[h] == level[slug]),
                       reverse=True)
        for h in hosts:
            if inbound[slug] >= RELATED_MIN_IN:
                break
            if inbound[out[h][-1]] > RELATED_MIN_IN:
                inbound[out[h][-1]] -= 1
                out[h][-1] = slug
                inbound[slug] += 1
    return out


def related_block(lang, items, hub_url, glossary=None):
    """`items` is a list of (url, title, question); `glossary` is the glossary URL shown next to "all puzzles"."""
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
  <p class="mp-related-all"><a href="{hub_url}">{all_label} →</a>{f' <a href="{glossary}">{GLOSSARY_TEXT[lang][0]} →</a>' if glossary else ""}</p>
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


# Up to three hints at the end of round 1, from "hints" in meta.json: the visitor opens them one at a time,
# easy first. They belong to the guess, so they hide once the answer shows (sp-before). How many are open is
# remembered per problem in localStorage; hiding the answer again (data-unsolve) forgets it too.
HINT_TEXT = {
    "uk": ("Підказки", "Важко вирішити? Відкривайте підказки по одній: спочатку легка, далі сильніша.",
           ("легка", "середня", "сильна"), "Показати підказку %d з %d · %s"),
    "en": ("Hints", "Hard to decide? Open the hints one at a time: the easy one first, then stronger ones.",
           ("easy", "medium", "strong"), "Show hint %d of %d · %s"),
}
HINTS_SCRIPT = """<script>
(function () {
  var box = document.querySelector(".mp-hints"), KEY = "mp-hints:" + %s;
  if (!box) return;
  var items = [].slice.call(box.querySelectorAll(".mp-hint")), btn = box.querySelector(".mp-hint-next");
  var labels = JSON.parse(btn.getAttribute("data-labels")), open = 0;
  try { open = Math.min(items.length, +localStorage.getItem(KEY) || 0); } catch (e) {}
  function show() {
    items.forEach(function (li, i) { li.hidden = i >= open; });
    btn.hidden = open >= items.length;
    if (!btn.hidden) btn.textContent = labels[open];
  }
  btn.addEventListener("click", function () {
    open++; show();
    try { localStorage.setItem(KEY, open); } catch (e) {}
    items[open - 1].focus();
  });
  show();
})();
</script>"""


def with_hints(body, lang, slug, hints):
    """Put the hints block at the end of the round 1 section (id="guess"); pages without one get none."""
    m = re.search(r'<section class="round" id="guess">', body)
    if not hints or not m:
        return body
    i = body.index("</section>", m.end())
    kicker, intro, levels, label = HINT_TEXT[lang]
    texts = hints[lang]
    labels = [label % (n + 1, len(texts), levels[min(n, len(levels) - 1)]) for n in range(len(texts))]
    lis = "\n".join(f'    <li class="mp-hint" tabindex="-1" hidden><span class="mp-hint-n">{n + 1}</span><p>{t}</p></li>'
                    for n, t in enumerate(texts))
    block = (f'  <div class="mp-hints sp-before">\n    <span class="kicker">{kicker}</span>\n    <p class="mp-hints-intro">{intro}</p>\n'
             f'    <ol class="mp-hints-list">\n{lis}\n    </ol>\n'
             f'    <button type="button" class="btn ghost mp-hint-next" data-labels="{e(json.dumps(labels, ensure_ascii=False))}">{labels[0]}</button>\n'
             f'  </div>\n{HINTS_SCRIPT % json.dumps(slug)}\n')
    return body[:i] + block + body[i:]


# "Check it yourself in code" at the end of round 3 (id="sim"): problems/<slug>/sim.js and sim.py, the page's simulation
# in a few lines with no libraries, for the browser console or Node and for Python 3. Both files or neither. Comments and
# printed words are written ⟨Ukrainian|English⟩ and the build keeps one language. The block is sp-after: the code
# prints the answer. Opening it and each copy are counted by the stats worker as "mp-code" with the key
# "<slug>.open" or "<slug>.copy.js|py".
CODE_FILES = (("sim.js", "js", "JavaScript"), ("sim.py", "py", "Python"))
CODE_LANG = re.compile(r"⟨([^|⟨⟩]*)\|([^⟨⟩]*)⟩")
CODE_TEXT = {
    "uk": ("Перевірте самі в коді",
           "Та сама симуляція коротко і без бібліотек. JavaScript запускається в консолі браузера (F12) або в Node, "
           "Python потребує лише стандартної бібліотеки.",
           "Копіювати", "Скопійовано", "Після вашої відповіді тут з'явиться код симуляції, який можна запустити в себе."),
    "en": ("Check it yourself in code",
           "The same simulation, short and with no libraries. Run the JavaScript in your browser console (F12) or in Node; "
           "the Python needs only the standard library.",
           "Copy", "Copied", "Once you answer, the simulation code appears here so you can run it yourself."),
}
CODE_SCRIPT = """<script>
(function () {
  var API = %s, SLUG = %s, d = document.querySelector(".mp-code");
  if (!d) return;
  function count(k) {
    var off = false; try { off = localStorage.getItem("mp-notrack") === "1"; } catch (e) {}
    if (!API || off || !window.fetch) return;
    fetch(API, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ s: "mp-code", k: SLUG + "." + k, h: 0 }) }).catch(function () {});
  }
  d.addEventListener("toggle", function () { if (d.open) count("open"); });
  [].forEach.call(d.querySelectorAll(".mp-code-copy"), function (b) {
    var label = b.textContent;
    b.addEventListener("click", function () {
      var el = b.closest(".mp-code-file").querySelector("code");
      // without clipboard access the code gets selected, ready for Ctrl+C
      function select() { var r = document.createRange(), s = getSelection(); r.selectNodeContents(el); s.removeAllRanges(); s.addRange(r); }
      if (navigator.clipboard) navigator.clipboard.writeText(el.textContent).then(function () {
        b.textContent = b.dataset.done; setTimeout(function () { b.textContent = label; }, 1500);
      }, select);
      else select();
      count("copy." + b.dataset.k);
    });
  });
})();
</script>"""


def sim_code(slug, lang):
    """The problem's sim.js / sim.py in one language, or None; build fails on half a pair or a stray ⟨…⟩."""
    have = [(PROBLEMS / slug / f).exists() for f, _, _ in CODE_FILES]
    if not any(have):
        return None
    if not all(have):
        raise SystemExit(f"problems/{slug}: sim.js and sim.py go together")
    out = []
    for f, key, name in CODE_FILES:
        src = (PROBLEMS / slug / f).read_text(encoding="utf-8")
        code = CODE_LANG.sub(lambda mo: mo.group(1 if lang == "uk" else 2), src).strip() + "\n"
        if "⟨" in code or "⟩" in code:
            raise SystemExit(f"problems/{slug}/{f}: a ⟨…⟩ without '|'")
        out.append((key, name, code))
    return out


def with_code(body, lang, slug):
    """Put the "check it yourself in code" block at the end of round 3."""
    files = sim_code(slug, lang)
    m = re.search(r'<section class="round" id="sim">', body)
    if not files:
        return body
    if not m:
        raise SystemExit(f"problems/{slug}: sim.js needs a section id=\"sim\"")
    i = body.index("</section>", m.end())
    title, intro, copy, done, wait = CODE_TEXT[lang]
    parts = "\n".join(
        f'    <div class="mp-code-file"><div class="mp-code-head"><span>{name}</span>'
        f'<button type="button" class="btn ghost mp-code-copy" data-k="{key}" data-done="{done}">{copy}</button></div>'
        f'<pre><code>{e(code)}</code></pre></div>' for key, name, code in files)
    block = (f'  <p class="note mp-code-wait sp-before">{wait}</p>\n'
             f'  <details class="card mp-code sp-after">\n    <summary><b>{title}</b></summary>\n'
             f'    <p class="note">{intro}</p>\n{parts}\n  </details>\n'
             f'{CODE_SCRIPT % (json.dumps(STATS_API), json.dumps(slug))}\n')
    return body[:i] + block + body[i:]


# Round 4 in three layers, simplest first: the page wraps its explanation cards in
#     <div class="mp-layer" data-layer="easy|strict|deep"> ... </div>
# and the build adds each layer's heading with a "hide on all puzzles" button and a one-line stub that brings it
# back. Hidden layers are remembered in localStorage (mp-layers-hidden) for every page; each hide and show is
# counted by the stats worker as "<slug>-layer" with the key "hide.<layer>" or "show.<layer>", so we can see
# whether readers use it. Pages without layers are left as they are.
LAYERS = ("easy", "strict", "deep")
LAYER_TEXT = {
    "uk": {"easy": ("На пальцях", "картинки, аналогії, маленькі числа"),
           "strict": ("Строго", "таблиці, графіки, формули"),
           "deep": ("Глибше", "узагальнення, теорія, історія"),
           "hide": "Сховати на всіх задачах", "stub": "Шар «%s» приховано на всіх задачах.", "show": "Показати"},
    "en": {"easy": ("In plain words", "pictures, analogies, small numbers"),
           "strict": ("Rigorous", "tables, charts, formulas"),
           "deep": ("Deeper", "generalisations, theory, history"),
           "hide": "Hide on all puzzles", "stub": "“%s” is hidden on all puzzles.", "show": "Show"},
}
LAYER_SCRIPT = """<script>
(function run() {
  if (document.readyState === "loading") return document.addEventListener("DOMContentLoaded", run);
  var API = %s, SLUG = %s + "-layer", KEY = "mp-layers-hidden";
  var layers = [].slice.call(document.querySelectorAll(".mp-layer"));
  if (!layers.length) return;
  function get() { try { return (localStorage.getItem(KEY) || "").split(" ").filter(Boolean); } catch (e) { return []; } }
  function put(a) { try { localStorage.setItem(KEY, a.join(" ")); } catch (e) {} }
  function paint() { var h = get(); layers.forEach(function (l) { l.classList.toggle("off", h.indexOf(l.dataset.layer) >= 0); }); }
  function count(k) {
    var off = false; try { off = localStorage.getItem("mp-notrack") === "1"; } catch (e) {}
    if (!API || off || !window.fetch) return;
    fetch(API, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ s: SLUG, k: k, h: 0 }) }).catch(function () {});
  }
  layers.forEach(function (l) {
    var name = l.dataset.layer;
    l.querySelector(".mp-layer-hide").addEventListener("click", function () {
      var h = get(); if (h.indexOf(name) < 0) { h.push(name); put(h); count("hide." + name); } paint();
    });
    l.querySelector(".mp-layer-show").addEventListener("click", function () {
      put(get().filter(function (x) { return x !== name; })); count("show." + name); paint();
      window.dispatchEvent(new Event("resize"));  // charts drawn while the layer was hidden had no width
    });
  });
  paint();
})();
</script>"""


def with_layers(body, lang, slug):
    """Head and stub for every round 4 layer, plus the script once; pages without layers are returned unchanged."""
    found = re.findall(r'<div class="mp-layer" data-layer="([a-z]+)">', body)
    if not found:
        return body
    if [x for x in found if x not in LAYERS] or found != sorted(found, key=LAYERS.index):
        raise SystemExit(f"{slug}: mp-layer must be {', '.join(LAYERS)}, in this order")
    t = LAYER_TEXT[lang]
    def head(m):
        name, desc = t[m.group(1)]
        return (m.group(0) + f'\n    <div class="mp-layer-head"><span class="mp-layer-name">{name}</span>'
                f'<span class="mp-layer-desc">{desc}</span><button type="button" class="mp-layer-hide">{t["hide"]}</button></div>'
                f'\n    <p class="mp-layer-stub">{e(t["stub"] % name)} <button type="button" class="mp-layer-show">{t["show"]}</button></p>')
    body = re.sub(r'<div class="mp-layer" data-layer="([a-z]+)">', head, body)
    i = body.index('<div class="mp-layer"')
    j = body.index("</section>", i)
    return body[:j] + LAYER_SCRIPT % (json.dumps(STATS_API), json.dumps(slug)) + "\n" + body[j:]


# Anonymous answer stats at the end of round 1: the first guess a browser makes on a problem goes to the
# Cloudflare Worker in stats/ as a short key (no cookies, no IP, nothing else), and after the answer shows the
# visitor sees how many people answered and what share got it right. The number of hints opened before the guess
# goes along (for the author's queries only; the page shows totals). "poll" in meta.json says which keys are
# right: "right" lists [lo, hi] ranges for a number and exact strings for anything else, "each" gives a range per
# part of an array guess (keys "a|b|c"), "round" names the section when it is not id="guess". A browser that saw
# the answer before guessing never votes. Below POLL_MIN answers the block stays hidden. Empty STATS_API turns it off. "crowd": true is for a game with
# no right answer (guess 2/3 of the average): the block stays empty and the page gets the counts as an "mp-crowd" event.
STATS_API = "https://mathparadoxes-stats.dmitry-kudrenko.workers.dev/"
POLL_MIN = 30  # until a problem has this many answers the block stays hidden (a handful of votes would mislead)
POLL_TEXT = {
    "uk": {"kicker": "Як відповідають інші", "all": "Відповідей: {n}. Правильних серед них {p}.",
           "yes": "Ви серед тих, хто впорався.", "no": "Не засмучуйтеся: інтуїція підводить більшість.",
           "bar": "правильно", "note": "Рахуємо лише першу відповідь з кожного браузера, до того як він побачив розв'язок. Анонімно."},
    "en": {"kicker": "How others answer", "all": "Answers so far: {n}. {p} of them are right.",
           "yes": "You are among those who got it.", "no": "Don't worry: intuition fails most people here.",
           "bar": "right", "note": "Only the first answer from each browser counts, given before it saw the solution. Anonymous."},
}
POLL_SCRIPT = """<script>
(function () {
  var API = %s, SLUG = %s, RULE = %s, MIN = %d, T = %s, KEY = "mp-voted:" + SLUG;
  var box = document.querySelector(".mp-poll"), d = document.documentElement, en = d.dataset.lang === "en";
  if (!box || !window.fetch) return;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function key(g) {
    if (Array.isArray(g)) return g.map(key).join("|");
    return typeof g === "number" && isFinite(g) ? String(+g.toPrecision(4)) : String(g);
  }
  function inRange(r, k) { var x = +k; return Array.isArray(r) ? x >= r[0] && x <= r[1] : r === k; }
  function right(k) {
    if (RULE.each) { var p = k.split("|"); return p.length === RULE.each.length && RULE.each.every(function (r, i) { return inRange(r, p[i]); }); }
    return RULE.right.some(function (r) { return inRange(r, k); });
  }
  function fmt(x) { return x.toLocaleString(en ? "en-US" : "uk-UA"); }
  function show(data, mine) {
    // "crowd" pages have no right answer: they get the raw counts and draw their own block
    if (RULE.crowd) { document.dispatchEvent(new CustomEvent("mp-crowd", { detail: { k: data.k || {}, mine: mine } })); return; }
    var n = 0, ok = 0;
    Object.keys(data.k || {}).forEach(function (k) { n += data.k[k]; if (right(k)) ok += data.k[k]; });
    if (n < MIN) return;
    var p = Math.round(100 * ok / n), html = '<span class="kicker">' + T.kicker + '</span>';
    html += "<p>" + T.all.replace("{n}", fmt(n)).replace("{p}", '<b class="mp-poll-p">' + p + "%%</b>") +
        (mine ? " " + (right(mine) ? T.yes : T.no) : "") + "</p>" +
        '<div class="mp-poll-bar" role="img" aria-label="' + p + "%% " + T.bar + '"><i style="width:' + p + '%%"></i></div>';
    box.innerHTML = html + '<p class="mp-poll-note">' + T.note + "</p>";
    box.hidden = false;
  }
  function load(mine) {
    fetch(API + "?s=" + encodeURIComponent(SLUG)).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j) show(j, mine); }).catch(function () {});
  }
  // a browser that already saw the answer (before this feature, or via "show the answer") only reads the stats
  if (d.classList.contains("solved") && !get(KEY)) set(KEY, "seen");
  document.addEventListener("solved", function (e) {
    var g = e.detail && e.detail.guess;
    if (get(KEY) || g === undefined || g === null || get("mp-notrack") === "1") { if (!get(KEY)) set(KEY, "seen"); load(); return; }
    var k = key(g), h = Math.min(9, Math.max(0, parseInt(get("mp-hints:" + SLUG), 10) || 0));
    set(KEY, "1");
    fetch(API, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ s: SLUG, k: k, h: h }) })
      .then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j) show(j, k); }).catch(function () {});
  });
  if (d.classList.contains("solved")) load();
})();
</script>"""


def with_poll(body, lang, slug, poll):
    """Put the answer-stats block at the end of the round-1 section (sp-after: it shows once the answer does)."""
    if not STATS_API or not poll:
        return body
    m = re.search(r'<section class="round" id="%s">' % poll.get("round", "guess"), body)
    if not m:
        raise SystemExit(f"problems/{slug}/meta.json: \"poll\" has no section id=\"{poll.get('round', 'guess')}\"")
    i = body.index("</section>", m.end())
    rule = {k: poll[k] for k in ("right", "each", "crowd") if k in poll}
    block = ('  <div class="mp-poll sp-after" aria-live="polite" hidden></div>\n' +
             POLL_SCRIPT % (json.dumps(STATS_API), json.dumps(slug), json.dumps(rule), POLL_MIN,
                            json.dumps(POLL_TEXT[lang], ensure_ascii=False)) + "\n")
    return body[:i] + block + body[i:]


def with_discuss(body, lang, slug, level):
    """Put the discussion block before the newsletter block (or before the footer)."""
    i = body.find('<section class="mp-subscribe"')
    if i == -1:
        i = body.rfind("<footer")
    return body[:i] + discuss_block(lang, slug, level) + "\n\n" + body[i:]


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
  if (want !== HERE) location.replace(ALT[want] + location.search + location.hash);
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
  function forget(s) { try { localStorage.removeItem(key(s)); localStorage.removeItem("mp-hints:" + s); } catch (e) {} }
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
  // a page passes the visitor's round-1 guess, if any; the answer-stats script reads it from the event
  window.mpSolve = function (guess) {
    if (!SLUG || window.mpSolved()) return;
    d.classList.add("solved"); mark(SLUG);
    document.dispatchEvent(new CustomEvent("solved", { detail: { guess: guess } }));
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

# The round-1 guess control: <mp-guess id="guess-n" min="0" max="100" step="1" value="50" unit="%"></mp-guess>.
# It behaves like an <input>: .value (a string), .min, .max, .disabled, and "input"/"change" events, so a page
# keeps its own `guessed = +guessIn.value` and mpSolve(guessed). The big number is a text field (type an exact
# value, comma or dot), −/+ step by `step`, the slider is the coarse control. Optional attributes:
#   fine="0.1"      precision of a typed value (default: step)
#   scale="p"       0–100 % with finer ends: 0–5 and 95–100 get a fifth of the track each, so 0.5% or 99% are easy
#   scale="log"     logarithmic between min and max (min > 0); the slider keeps two significant digits
#   zones="chance"  buttons under the track, one per zone (a click puts the guess mid-zone), named by the zone's middle
#                   as a frequency: 1 in 40 / 1 in 5 / 1 in 2 / 4 in 5 / 39 in 40, with the range below
#   zones="share"   the same, for shares (words like "rarely" would judge the answer, and some answers are the surprise)
#   ticks="1,10,100" numbers under the track (default: five even steps, or the zone edges); "0.1:1 мм|1 mm" gives one a label
# `unit` and tick labels may be "uk|en".
# Zones are the same on every page that uses them, so they cannot point at any page's answer.
# Defined in <head>, so the element upgrades while the page parses and its script finds a working control.
GUESS_SCRIPT = """<script>
(function () {
  if (!window.customElements || customElements.get("mp-guess")) return;
  var EN = document.documentElement.dataset.lang === "en";
  // each zone is named by its middle (2.5, 20, 50, 80, 97.5 %), the value a click on it sets
  var ODDS = EN ? ["1 in 40", "1 in 5", "1 in 2", "4 in 5", "39 in 40"] : ["1 з 40", "1 з 5", "1 з 2", "4 з 5", "39 з 40"];
  var ZONES = { chance: ODDS, share: ODDS };
  var EDGES = [0, 5, 35, 65, 95, 100], FIT = window.CSS && CSS.supports("field-sizing", "content");
  // track position t (0–1) against the share of the range, for scale="p": the five zones get equal room
  var KNOTS = [[0, 0], [0.2, 0.05], [0.8, 0.95], [1, 1]];
  function lerp(x, a, b) {
    for (var i = 1; i < a.length; i++) if (x <= a[i] || i === a.length - 1) return b[i - 1] + (b[i] - b[i - 1]) * (x - a[i - 1]) / (a[i] - a[i - 1]);
  }
  function tr(s) { s = String(s).split("|"); return s[EN && s.length > 1 ? 1 : 0]; }
  function dec(x) {
    var s = String(x).split("e-"), d = s[0].indexOf(".") < 0 ? 0 : s[0].length - s[0].indexOf(".") - 1;
    return d + (+s[1] || 0);
  }
  function snap(v, q) { return q > 0 ? +(Math.round(v / q) * q).toFixed(dec(q)) : v; }
  var uid = 0;
  class Guess extends HTMLElement {
    static get observedAttributes() { return ["min", "max", "step", "value", "disabled"]; }
    get min() { return this.getAttribute("min") || "0"; }
    set min(v) { this.setAttribute("min", v); }
    get max() { return this.getAttribute("max") || "100"; }
    set max(v) { this.setAttribute("max", v); }
    get value() { return String(this._v); }
    set value(v) { this._set(+v, false); }
    get disabled() { return this.hasAttribute("disabled"); }
    set disabled(v) { this.toggleAttribute("disabled", !!v); }
    attributeChangedCallback(name) {
      if (!this._r) return;
      if (name === "value") this._set(+this.getAttribute("value"), false);
      else if (name === "disabled") this._dis();
      else { this._lim(); this._marks(); this._set(this._v, false); }
    }
    connectedCallback() {
      if (this._r) return;
      var me = this, id = this.id || "mp-guess-" + (++uid);
      var unit = tr(this.getAttribute("unit") || ""), lab = this.id && document.querySelector('label[for="' + this.id + '"]');
      this.innerHTML = '<div class="mp-g-top"><span class="mp-g-val"><input class="mp-g-num" type="text" inputmode="decimal" autocomplete="off" spellcheck="false">' +
        (unit ? '<span class="mp-g-unit' + (/^\\s/.test(unit) ? " mp-g-word" : "") + '" aria-hidden="true">' + unit.trim() + "</span>" : "") + '</span>' +
        '<span class="mp-g-steps"><button type="button" class="mp-g-btn" data-d="-1">−</button><button type="button" class="mp-g-btn" data-d="1">+</button></span></div>' +
        '<div class="mp-g-slide"><i class="mp-g-bar"></i><i class="mp-g-bar mp-g-fill"></i><input class="mp-g-range" type="range"></div>' +
        '<div class="mp-g-marks" aria-hidden="true"></div><div class="mp-g-zones" role="group"></div>';
      var num = this._num = this.querySelector(".mp-g-num"), rng = this._rng = this.querySelector(".mp-g-range");
      num.id = id + "-num";
      this._lim();
      if (lab) { if (!lab.id) lab.id = id + "-label"; lab.htmlFor = num.id; rng.setAttribute("aria-labelledby", lab.id); }
      else if (this.getAttribute("aria-label")) { num.setAttribute("aria-label", this.getAttribute("aria-label")); rng.setAttribute("aria-label", this.getAttribute("aria-label")); }
      var bs = this.querySelectorAll(".mp-g-btn");
      bs[0].setAttribute("aria-label", EN ? "Less" : "Менше"); bs[1].setAttribute("aria-label", EN ? "More" : "Більше");
      this._r = true;
      this._marks();
      this._set(+(this.getAttribute("value") || this._lo), false);
      this._dis();
      // inner fields keep their own events; the element fires one "input" of its own after its value changed
      rng.addEventListener("input", function (e) { e.stopPropagation(); me._set(me._fromT(+rng.value), true, rng); });
      rng.addEventListener("change", function (e) { e.stopPropagation(); me._fire("change"); });
      rng.addEventListener("keydown", function (e) {
        if (me._sc === "lin") return;
        var d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
        if (d) { e.preventDefault(); me._step(d); me._fire("change"); }
      });
      num.addEventListener("input", function (e) {
        e.stopPropagation();
        var v = me._parse(num.value), ok = v !== null && v >= me._lo && v <= me._hi;
        num.toggleAttribute("aria-invalid", !ok && num.value.trim() !== "");
        me._size();
        if (ok) me._set(v, true, num);
      });
      num.addEventListener("change", function (e) { e.stopPropagation(); });
      num.addEventListener("focus", function () { num.value = me._raw(me._v); me._size(); num.select(); });
      num.addEventListener("blur", function () { me._commit(); });
      num.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); me._commit(); num.select(); }
        else if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); me._step(e.key === "ArrowUp" ? 1 : -1); num.value = me._raw(me._v); me._size(); }
      });
      bs.forEach(function (b) { b.addEventListener("click", function () { me._step(+b.dataset.d); me._fire("change"); }); });
      // a zone button puts the guess in the middle of its zone, to fine-tune from there
      this.querySelector(".mp-g-zones").addEventListener("click", function (e) {
        var b = e.target.closest(".mp-g-zone");
        if (!b || me.disabled) return;
        var span = me._hi - me._lo, i = +b.dataset.i;
        me._set(me._lo + span * (EDGES[i] + EDGES[i + 1]) / 200, true); me._fire("change");
      });
    }
    _lim() {
      this._lo = +this.min; this._hi = +this.max;
      this._q = +(this.getAttribute("step") || 1);
      this._fine = +(this.getAttribute("fine") || this._q);
      this._sc = this.getAttribute("scale") || "lin";
      if (this._sc === "log" && this._lo <= 0) this._sc = "lin";
      if (this._rng) {
        var lin = this._sc === "lin";
        this._rng.min = lin ? this._lo : 0; this._rng.max = lin ? this._hi : 1000; this._rng.step = lin ? this._q : 1;
      }
    }
    _f(v) { return (v - this._lo) / (this._hi - this._lo); }
    _toT(v) {
      if (this._sc === "log") return Math.log(v / this._lo) / Math.log(this._hi / this._lo);
      var f = this._f(v);
      return this._sc === "p" ? lerp(f, KNOTS.map(function (k) { return k[1]; }), KNOTS.map(function (k) { return k[0]; })) : f;
    }
    _fromT(t) {
      if (this._sc === "lin") return t;
      t /= 1000;
      if (this._sc === "log") {
        var v = this._lo * Math.pow(this._hi / this._lo, t), e = Math.pow(10, Math.floor(Math.log10(v)) - 1);
        return Math.max(this._q, snap(v, e));
      }
      var f = lerp(t, KNOTS.map(function (k) { return k[0]; }), KNOTS.map(function (k) { return k[1]; }));
      var w = f < 0.05 || f > 0.95 ? this._fine : this._q;
      return this._lo + snap(f * (this._hi - this._lo), w);
    }
    _parse(s) {
      s = String(s).replace(/[\\s\\u00a0\\u202f%]/g, "").replace(",", ".");
      return s === "" || isNaN(+s) ? null : +s;
    }
    _raw(v) { return String(v).replace(".", EN ? "." : ","); }
    _show(v) {
      return v.toLocaleString(EN ? "en-US" : "uk-UA", { maximumFractionDigits: Math.max(dec(this._fine), dec(this._q)) });
    }
    _clean(v) {
      if (isNaN(v)) v = this._lo;
      return snap(Math.min(this._hi, Math.max(this._lo, v)), Math.min(this._fine, this._q));
    }
    // from: the field the visitor is using, which is left as typed
    _set(v, user, from) {
      var old = this._v;
      v = this._clean(v);
      this._v = v;
      if (!this._r) return;
      if (from !== this._num && document.activeElement !== this._num) this._num.value = this._show(v);
      else if (from !== this._num) this._num.value = this._raw(v);
      if (from !== this._rng) this._rng.value = this._sc === "lin" ? v : Math.round(1000 * this._toT(v));
      this._num.removeAttribute("aria-invalid");
      this._size();
      var z = this._zone(v), unit = tr(this.getAttribute("unit") || "");
      this._rng.setAttribute("aria-valuetext", this._show(v) + unit.trim());
      this.querySelectorAll(".mp-g-zone").forEach(function (el, i) { el.setAttribute("aria-pressed", !!z && i === z.i); });
      this.style.setProperty("--t", (100 * this._toT(v)).toFixed(2) + "%");
      if (user && v !== old) this._fire("input");
    }
    _commit() {
      var v = this._parse(this._num.value);
      this._set(v === null ? this._v : v, true);
      this._num.value = document.activeElement === this._num ? this._raw(this._v) : this._show(this._v);
      this._size();
      this._fire("change");
    }
    _step(d) {
      var v = this._v, q = this._q;
      if (this._sc === "log") q = Math.max(q, Math.pow(10, Math.floor(Math.log10(Math.max(v, 1e-9) * (d < 0 ? 0.999 : 1))) - 1));
      var n = d > 0 ? Math.floor(v / q + 1e-9) * q + q : Math.ceil(v / q - 1e-9) * q - q;
      this._set(+n.toFixed(dec(q)), true);
    }
    _zone(v) {
      var names = ZONES[this.getAttribute("zones")];
      if (!names) return null;
      var p = 100 * this._f(v);
      for (var i = 0; i < 5; i++) if (p <= EDGES[i + 1] || i === 4) return { i: i, name: names[i] };
    }
    _size() { if (!FIT) this._num.style.width = Math.max(1, this._num.value.length) + 0.2 + "ch"; }
    _dis() {
      var d = this.disabled;
      this.querySelectorAll("input, button").forEach(function (el) { el.disabled = d; });
    }
    _fire(type) { this.dispatchEvent(new Event(type, { bubbles: true })); }
    // zones: gaps in the bar at the zone edges and a row of buttons, one per zone, each naming its range;
    // without zones: numbers under the bar
    _marks() {
      var me = this, box = this.querySelector(".mp-g-marks"), zb = this.querySelector(".mp-g-zones"), names = ZONES[this.getAttribute("zones")], html = "";
      if (!box) return;
      var at = function (v) { return (100 * me._toT(v)).toFixed(2) + "%"; };
      var span = this._hi - this._lo, ticks, unit = tr(this.getAttribute("unit") || "").trim();
      var edge = function (i) { return me._lo + span * EDGES[i] / 100; };
      zb.hidden = !names; box.hidden = !!names;
      if (names) {
        var mask = "linear-gradient(90deg, #000 0", cols = [];
        for (var i = 0; i < 5; i++) {
          html += '<button type="button" class="mp-g-zone" data-i="' + i + '" aria-pressed="false">' + names[i] +
            "<small>" + this._show(edge(i)) + "–" + this._show(edge(i + 1)) + unit + "</small></button>";
          cols.push((100 * (this._toT(edge(i + 1)) - this._toT(edge(i)))).toFixed(2) + "fr");
          if (i) mask += ", transparent 0 calc(" + at(edge(i)) + " + 2px), #000 0";
          mask += " calc(" + at(edge(i + 1)) + " - 2px)";
        }
        mask += ")";
        zb.innerHTML = html; zb.style.gridTemplateColumns = cols.join(" ");
        zb.setAttribute("aria-label", EN ? "Zones" : "Зони");
        this.querySelectorAll(".mp-g-bar").forEach(function (b) { b.style.webkitMaskImage = b.style.maskImage = mask; });
        this._dis();
        return;
      }
      if (this.getAttribute("ticks")) ticks = this.getAttribute("ticks").split(",");
      else ticks = [0, 1, 2, 3, 4].map(function (k) { return snap(me._lo + span * k / 4, me._q); });
      box.innerHTML = ticks.map(function (t, i) {
        var p = String(t).split(":"), v = +p[0];
        return '<span style="left:' + at(v) + '">' + (p[1] ? tr(p[1]) : me._show(v) + (i === ticks.length - 1 ? unit : "")) + "</span>";
      }).join("");
    }
  }
  customElements.define("mp-guess", Guess);
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


# Variant labels: a standalone Latin A, B or C in page text (variant B, players A and B) gets <span class="vl">, a thin
# frame from site.css, so that it doesn't read as the Ukrainian «а» or «в». Cyrillic labels are marked in the source
# by hand. In English a capital A before a capitalised word, or opening a text run before a lowercase word, is the article.
VL_INLINE = ("a", "b", "i", "em", "strong")  # tags inside a sentence; any other tag starts new text
VL_SKIP = ("script", "style", "svg", "canvas", "title", "textarea", "option", "select", "head", "code", "math", "sub", "sup")
VL_TOKEN = re.compile(r"(?<![\w/.°(|∩∪-])([ABC])(?![\w/()|∩∪-])")
VL_NOT = re.compile(r"\.\s+[A-Z]|\s+to\s+Z(?![A-Za-z])")  # an initial (C. R. Blake, Alan B. Krueger), "from A to Z"
# The same pass glues numbers so a line never breaks inside one: digit groups (10 000), a number and its unit
# (75 км, 10 $, 3 млн, 5 km) and, in Ukrainian, the space before a dash, so a line never starts with «—».
NB_GROUPS = re.compile(r"(?<![\d.,])\d{1,3}(?: \d{3})+(?!\d)")
NB_UNIT = re.compile(r"(\d) (%|‰|₴|\$|€|°|км|см|мм|м|кг|хв|год|с|грн|млн|млрд|тис\.|km|cm|mm|m|kg|min|h|s|million|billion)(?!\w)")


def mark_labels(doc, lang):
    # scripts and styles are cut out first: their "<" would read as tags
    raw = re.split(r"(<(script|style)\b.*?</\2>)", doc, flags=re.S | re.I)
    return "".join(x if i % 3 == 1 else "" if i % 3 == 2 else _mark_text(x, lang) for i, x in enumerate(raw))


def _mark_text(doc, lang):
    parts, out, skip, prev = re.split(r"(<[^>]+>)", doc), [], [], ""
    for k, part in enumerate(parts):
        if part.startswith("<"):
            m = re.match(r"<(/?)([a-zA-Z0-9]+)", part)
            if m:
                tag = m.group(2).lower()
                # skipped elements: raw ones by tag, formulas by class; a skip ends when its own tag closes
                if skip and tag == skip[-1][0] and not part.endswith("/>"):
                    skip[-1][1] += -1 if m.group(1) else 1
                    if not skip[-1][1]:
                        skip.pop()
                elif not m.group(1) and not part.endswith("/>") and (tag in VL_SKIP or re.search(r'class="[^"]*\b(formula|fx)\b', part)):
                    skip.append([tag, 1])
                if tag not in VL_INLINE:
                    prev = ""
            out.append(part)
            continue
        if skip or not part.strip():
            out.append(part)
            continue
        part = NB_UNIT.sub(r"\1&nbsp;\2", NB_GROUPS.sub(lambda mo: mo.group(0).replace(" ", "&nbsp;"), part))
        if lang == "uk":
            part = part.replace(" — ", "&nbsp;— ")
        # the text that follows this run, across inline tags (a term link, a bold word)
        nxt = "".join(x for x in parts[k + 1:k + 6] if not x.startswith("<"))
        def rep(mo, part=part, nxt=nxt, prev=prev):
            after, before = part[mo.end():] + nxt, prev + part[:mo.start()]
            if VL_NOT.match(after) or re.search(r"(^|\s)[A-Z]\.\s*$", before):
                return mo.group(0)
            if re.search(r"(Series|серія|серії)\s+$", before):
                return mo.group(0)
            if mo.group(1) == "A" and re.match(r"\s+[A-Z][a-z]", after) or lang == "uk" and re.match(r"\s+[a-z]{2}", after):
                return mo.group(0)  # the article in a title: "A Case Study", also quoted on Ukrainian pages
            if lang == "en" and mo.group(1) == "A":
                # the article: "A $3,000 order", or "A visitor" / "A 100-floor building" with no word before it in the sentence
                if re.match(r"\s+([A-Z][^\W\d_]|[$₴€£])", after):
                    return mo.group(0)
                b = before.rstrip()[-1:]
                if (re.match(r"\s+[a-z\d]", after) and not re.match(r"\s+[\d.,%]+\s+[BC]\b", after)  # "A 52, B 61" is a label
                        and not (b.isalnum() or (b and b in ",%"))):
                    return mo.group(0)
            return f'<span class="vl">{mo.group(1)}</span>'
        out.append(VL_TOKEN.sub(rep, part))
        prev = (prev + part)[-60:]
    return "".join(out)


# Site menu: every page with a top bar gets links to the puzzles, the courses and the glossary next to the language
# switch (a ☰ button on phones), plus "Continue" for the latest thing opened and not finished: a puzzle not solved
# yet, or a course with some but not all chapters done (it links to the first chapter left). The same links sit at
# the very bottom. Filled in by build() before anything is written.
SITE_NAV = {}
NAV_TEXT = {
    "uk": {"problems": "Задачі", "courses": "Курси", "glossary": "Словник", "continue": "Продовжити", "course": "Продовжити курс", "menu": "Меню", "nav": "Розділи"},
    "en": {"problems": "Puzzles", "courses": "Courses", "glossary": "Glossary", "continue": "Continue", "course": "Continue the course", "menu": "Menu", "nav": "Sections"},
}
NAV_SCRIPT = """<script>
(function () {
  var nav = document.querySelector(".mp-nav"), KEY = "mp-recent";
  if (!nav) return;
  var lang = document.documentElement.dataset.lang === "en" ? "en" : "uk", list = [];
  try { list = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) {}
  var me = nav.dataset.slug, T = JSON.parse(nav.dataset.t);
  // a puzzle or course page puts itself first in the list of recently opened ones
  if (me) {
    list = [JSON.parse(nav.dataset.me)].concat(list.filter(function (p) { return p.s !== me; })).slice(0, 20);
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  // a course item carries its chapter ids: the first one not done yet is where to go back to
  function left(p) {
    if (!p.c) return get("mp-solved:" + p.s) ? null : p.u[lang];
    var d = []; try { d = JSON.parse(get("mp-course:" + p.s.slice(7)) || "[]"); } catch (e) {}
    var rest = p.c.filter(function (c) { return d.indexOf(c) === -1; });
    return d.length && rest.length ? p.u[lang] + "#" + rest[0] : null;
  }
  var a = nav.querySelector(".mp-cont");
  for (var i = 0; i < list.length; i++) {
    var p = list[i], u = p.s !== me && left(p);
    if (u) { a.href = u; a.firstChild.textContent = (p.c ? T.course : T.cont) + ": "; a.querySelector("b").textContent = p.n[lang]; a.hidden = false; break; }
  }
  var btn = nav.querySelector(".mp-burger");
  function set(open) { nav.classList.toggle("open", open); btn.setAttribute("aria-expanded", open); }
  btn.addEventListener("click", function (e) { e.stopPropagation(); set(!nav.classList.contains("open")); });
  document.addEventListener("click", function (e) { if (!nav.contains(e.target)) set(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
})();
</script>"""


def with_site_nav(doc, lang, path):
    """The menu in the top bar and the links at the bottom of the page (see SITE_NAV)."""
    base, t = SITE_NAV["base"], NAV_TEXT[lang]
    rel = path.relative_to(DOCS).parts
    page = rel[1:] in (("index.html",), ("en", "index.html"))  # docs/<x>/index.html or docs/<x>/en/index.html
    home = rel in (("index.html",), ("en", "index.html"))
    me = SITE_NAV["problems"].get(rel[0]) if page else None
    if rel[0] == "courses" and rel[2:] in (("index.html",), ("en", "index.html")):
        me = SITE_NAV["courses"].get(rel[1])  # a course's own page, not its subpages
    here = "courses" if rel[0] == "courses" else "glossary" if rel[0] == "glossary" else "problems" if home or me else ""
    words = e(json.dumps({"cont": t["continue"], "course": t["course"]}, ensure_ascii=False))
    links = [("problems", base + LANG_PATH[lang] + "#all"), ("courses", course_url(base, lang)), ("glossary", glossary_url(base, lang))]
    items = "".join(f'<a href="{u}"{" aria-current=\"page\"" if k == here else ""}>{t[k]}</a>' for k, u in links)
    data = f' data-slug="{me["s"]}" data-me="{e(json.dumps(me, ensure_ascii=False))}"' if me else ""
    nav = (f'<nav class="mp-nav" aria-label="{t["nav"]}" data-t="{words}"{data}>'
           f'<button type="button" class="mp-burger" aria-expanded="false" aria-label="{t["menu"]}"><i></i><i></i><i></i></button>'
           f'<div class="mp-nav-list"><a class="mp-cont" href="#" hidden>{t["continue"]}: <b></b></a>{items}</div></nav>\n  ')
    doc, n = re.subn(r'(<div class="topbar">.*?)(<nav\b[^>]*\bid="lang")', lambda m: m.group(1) + nav + m.group(2), doc, count=1, flags=re.S)
    if not n:
        return doc
    foot = f'<nav class="mp-fnav" aria-label="{t["nav"]}">{items}</nav>\n{NAV_SCRIPT}\n'
    i = doc.rindex("</body>")
    return doc[:i] + foot + doc[i:]


def write(path, doc):
    left = re.findall(r"\{\{[A-Z_:a-z0-9-]+\}\}", doc)
    if left:
        raise SystemExit(f"{path}: unfilled placeholders {sorted(set(left))}")
    lm = re.search(r'<html lang="(uk|en)"', doc[:400])
    if path.suffix == ".html" and lm:
        doc = mark_labels(doc, lm.group(1))
        if SITE_NAV:
            doc = with_site_nav(doc, lm.group(1), path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(doc, encoding="utf-8")
    print(f"{path.relative_to(DOCS)}  {len(doc) // 1024} KB")


def build_problem(slug, base, metas, books, related):
    src_dir = PROBLEMS / slug
    meta = dict(metas)[slug]
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
        body = body.replace('<header class="hero">\n  <div>', '<header class="hero">\n  <div>\n    <div class="mp-meta">' + level_badge(lang, meta["level"], hub[lang]) + course_strip(lang, slug, base) + "</div>", 1)
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
                "educationalLevel": LEVEL_LD[meta["level"]],
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
        if "<mp-guess" in body:
            h += "\n" + GUESS_SCRIPT
        body = with_code(with_layers(body, lang, slug), lang, slug)
        body = with_discuss(with_subscribe(with_poll(with_hints(body, lang, slug, meta.get("hints")), lang, slug, meta.get("poll")), lang), lang, slug, meta["level"])
        items = []
        for s in related:
            rm = dict(metas)[s][lang]
            items.append((base + s + "/" + LANG_PATH[lang], rm["card"]["title"], rm.get("share", {}).get("description", rm["card"]["text"])))
        body = with_related(body, related_block(lang, items, hub[lang], glossary_url(base, lang)))
        body = with_books(body, books_block(lang, refs, books, base + "books/" + LANG_PATH[lang]))
        body = with_terms(body, lang, TERMS, base)  # last: its script must not be taken for the page script above
        doc = (f'<!doctype html>\n<html lang="{lang}" data-lang="{lang}" data-static data-spoil>\n<head>\n{h}\n{RESET}\n{style}\n{css_link(base)}\n'
               f'</head>\n<body>\n{body.strip()}\n{LEVEL_SCRIPT}\n{claspo_snippet(lang)}\n{CF_ANALYTICS}\n</body>\n</html>\n')
        write(DOCS / slug / LANG_PATH[lang] / "index.html", doc)
    for f in (src_dir / "assets").iterdir() if (src_dir / "assets").exists() else []:
        if f.suffix in {".png", ".jpg", ".svg", ".webp"} and not f.name.startswith("og-src"):
            shutil.copy(f, DOCS / slug / f.name)
    return slug, meta, urls


TEASER_LOADER = """<script>
(function () {
  // a panel's script loads when the panel nears the screen; hidden shelf panels wait until they are shown
  var arts = document.querySelectorAll("article[data-js]");
  function load(a) { var s = document.createElement("script"); s.src = a.getAttribute("data-js"); a.removeAttribute("data-js"); document.body.appendChild(s); }
  if (!("IntersectionObserver" in window)) { arts.forEach(load); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); load(e.target); } });
  }, { rootMargin: "600px 0px" });
  arts.forEach(function (a) { io.observe(a); });
})();
</script>"""


def lazy_teasers(body, base):
    """Moves each panel's inline script to docs/teasers/<slug>-<hash>.js and names it in the article's data-js."""
    def one(m):
        slug, art = m.group(1), m.group(0)
        code = "\n".join(re.findall(r"<script>(.*?)</script>", art, re.S))
        if not code:
            return art
        name = f"{slug}-{hashlib.sha1(code.encode()).hexdigest()[:8]}.js"
        (DOCS / "teasers").mkdir(parents=True, exist_ok=True)
        (DOCS / "teasers" / name).write_text(code, encoding="utf-8")
        art = re.sub(r"\s*<script>.*?</script>", "", art, flags=re.S)
        return art.replace(f'id="{slug}"', f'id="{slug}" data-js="{base}teasers/{name}"', 1)
    return re.sub(r'<article class="problem" id="([^"]+)".*?</article>', one, body, flags=re.S)


def build_hub(problems, base):
    """Catalogue page: hub/page.html with each problem's teaser.html dropped into <!--PROBLEMS-->."""
    meta = json.loads((HUB / "meta.json").read_text(encoding="utf-8"))
    src = (HUB / "page.html").read_text(encoding="utf-8")
    urls = {l: base + LANG_PATH[l] for l in LANGS}
    blocks = []
    problems_meta = [(p[0], p[1]) for p in problems]
    src = src.replace("<!--TOPICS-->", list_controls(problems)).replace("<!--CARDS-->", problem_cards(problems))
    src = src.replace("{{COUNT}}", str(len(problems)))
    for slug, _, _ in problems:
        teaser = (PROBLEMS / slug / "teaser.html").read_text(encoding="utf-8")
        # the stage on the home page uses the same tint as the problem page itself
        m = re.search(r"--tint:\s*(#[0-9A-Fa-f]{6})", (PROBLEMS / slug / "page.html").read_text(encoding="utf-8"))
        tint = f' style="--tint: {m.group(1)}"' if m else ""
        topics = " ".join(dict(problems_meta)[slug]["topics"])
        level = dict(problems_meta)[slug]["level"]
        # the level badge sits on the eyebrow line; it is filled in per language below
        teaser = re.sub(r'<span class="eyebrow">.*?</span></span>', lambda m: f'<div class="tz-top">{m.group(0)}{{{{LEVEL:{level}}}}}</div>', teaser, count=1)
        # the shelf shows three panels; without the script (or before it runs) these are the first three
        shown = "" if len(blocks) < 3 else " hidden"
        blocks.append(f'<article class="problem" id="{slug}" data-topics="{topics}" data-level="{level}" data-spoil{tint}{shown}>\n'
                      + teaser.replace("{{URL}}", "{{URL:%s}}" % slug) + "\n</article>")
    src = src.replace("<!--PROBLEMS-->", "\n".join(blocks))
    for lang in LANGS:
        m, other = meta[lang], ("en" if lang == "uk" else "uk")
        body = LangStripper(src, other).strip()
        for slug, _, purls in problems:
            body = body.replace("{{URL:%s}}" % slug, purls[lang]).replace("{{OG:%s}}" % slug, base + slug + f"/og-{lang}.png")
        for k in ("only", "every"):
            body = body.replace("{{LIST:%s}}" % k, e(LIST_TEXT[lang][k]))
        for n in LEVELS:
            body = body.replace("{{LEVEL:%d}}" % n, level_badge(lang, n, urls[lang]))
        body = body.replace("{{BOOKS}}", base + "books/" + LANG_PATH[lang])
        body = body.replace("{{GLOSSARY}}", glossary_url(base, lang))
        body = body.replace("<!--COURSES-->", courses_block(lang, base)).replace("{{COURSES}}", course_url(base, lang))
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
                     "inLanguage": lang, "isAccessibleForFree": True, "educationalLevel": LEVEL_LD[p[1]["level"]],
                     "image": base + p[0] + f"/og-{lang}.png"}}
                 for i, p in enumerate(problems)]}},
        ]}
        h = head(lang, urls, m["title"], m["description"], base + f"og-{lang}.png", m["og_alt"], ld, base)
        body = with_subscribe(body, lang)
        body = lazy_teasers(body, base)
        doc = (f'<!doctype html>\n<html lang="{lang}" data-lang="{lang}" data-static>\n<head>\n{h}\n{RESET}\n'
               f'{css_link(base)}\n{style}\n</head>\n<body>\n{body.strip()}\n{TEASER_LOADER}\n{LEVEL_SCRIPT}\n{claspo_snippet(lang)}\n{CF_ANALYTICS}\n</body>\n</html>\n')
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
        body = body.replace("{{GLOSSARY}}", glossary_url(base, lang))
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


# Glossary: a small sub-site of terms (median, expected value, correlation...) that readers meet in the explanations.
#   glossary/terms.json        one entry per term: names and word forms per language, a one-line definition, a hook
#                              (a small paradox around the term, never a site puzzle's answer), its article and puzzles
#   glossary/<page>/page.html  an article with a simulation; meta.json gives titles and the terms it explains
#   glossary/index.html        the contents page, cards go into <!--TERMS-->
#   glossary/index.json        its titles and "groups": themed sections with a why-it-matters line, each lists its term ids
#                              in reading order; every term belongs to exactly one group
# Problem pages get the first mention of every term in rounds 4-5 underlined; a click opens a card with the
# definition, the hook and a link to the article.
GLOSSARY = ROOT / "glossary"
TERMS = []  # filled by build() before the problem pages
GLOSSARY_TEXT = {
    "uk": ("Словник", "Спробувати на симуляції", "Де це трапляється", "Ще в темі «%s»", "Усі терміни"),
    "en": ("Glossary", "Try it in a simulation", "Where it shows up", "More on “%s”", "All terms"),
}
TERM_SCRIPT = """<script type="application/json" id="mp-terms">%s</script>
<script>
(function () {
  var data = JSON.parse(document.getElementById("mp-terms").textContent), pop = null, cur = null;
  function close() { if (pop) { pop.remove(); pop = null; } if (cur) { cur.setAttribute("aria-expanded", "false"); cur = null; } }
  function open(btn) {
    var t = data[btn.dataset.term]; close(); cur = btn; btn.setAttribute("aria-expanded", "true");
    pop = document.createElement("div"); pop.className = "mp-term-pop"; pop.setAttribute("role", "dialog");
    var h = document.createElement("b"); h.textContent = t.name;
    var d = document.createElement("p"); d.textContent = t.short;
    var k = document.createElement("p"); k.className = "mp-term-hook"; k.textContent = t.hook;
    var a = document.createElement("a"); a.href = t.url; a.textContent = t.link + " →";
    pop.append(h, d, k, a); document.body.appendChild(pop);
    var r = btn.getBoundingClientRect(), w = pop.offsetWidth;
    pop.style.left = Math.max(12, Math.min(r.left + scrollX, scrollX + document.documentElement.clientWidth - w - 12)) + "px";
    pop.style.top = (r.bottom + scrollY + 8) + "px";
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".mp-term");
    if (btn) { e.preventDefault(); if (btn === cur) close(); else open(btn); return; }
    if (pop && !pop.contains(e.target)) close();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
})();
</script>"""


def load_glossary():
    terms = json.loads((GLOSSARY / "terms.json").read_text(encoding="utf-8"))
    pages = {d.name: json.loads((d / "meta.json").read_text(encoding="utf-8"))
             for d in sorted(GLOSSARY.iterdir()) if (d / "page.html").exists()}
    for t in terms:
        if t["page"] not in pages:
            raise SystemExit(f"glossary/terms.json: {t['id']} points to a missing article {t['page']}")
    groups = json.loads((GLOSSARY / "index.json").read_text(encoding="utf-8"))["groups"]
    listed = [i for g in groups for i in g["terms"]]
    if sorted(listed) != sorted(t["id"] for t in terms):
        raise SystemExit("glossary/index.json: \"groups\" must list every term of terms.json exactly once")
    return terms, pages, groups


def glossary_url(base, lang, page=None):
    return base + "glossary/" + (page + "/" if page else "") + LANG_PATH[lang]


def link_terms(html, lang, terms, base, done, used, card):
    """Turn the first mention of each term (not yet in `done`) in the paragraphs of `html` into a link to its article.
    Text inside links, buttons and scripts is left alone. With `card` the link also opens the term card on click."""
    def link_text(text):
        for t in terms:
            if t["id"] in done:
                continue
            forms = sorted(t[lang]["forms"], key=len, reverse=True)
            m = re.search(r"(?<![\w-])(" + "|".join(map(re.escape, forms)) + r")(?![\w-])", text, re.I)
            if m:
                done.add(t["id"]); used[t["id"]] = t
                attrs = f' class="mp-term" data-term="{t["id"]}" aria-expanded="false"' if card else ' class="gl-term"'
                return (link_text(text[:m.start()])
                        + f'<a href="{glossary_url(base, lang, t["page"])}"{attrs}>{m.group(1)}</a>'
                        + link_text(text[m.end():]))
        return text
    def para(m):
        out, depth = [], 0
        for piece in re.split(r"(<[^>]+>)", m.group(2)):
            if piece.startswith("<"):
                if re.match(r"<(a|button)\b", piece): depth += 1
                elif re.match(r"</(a|button)>", piece): depth -= 1
                out.append(piece)
            else:
                out.append(piece if depth else link_text(piece))
        return m.group(1) + "".join(out) + "</p>"
    # scripts may hold "<p>" in strings; only the markup between them is touched
    parts = re.split(r"(<script\b.*?</script>)", html, flags=re.S)
    return "".join(x if x.startswith("<script") else re.sub(r"(<p\b[^>]*>)(.*?)</p>", para, x, flags=re.S) for x in parts)


def with_terms(body, lang, terms, base):
    """Link the first mention of each term in rounds 4 and 5 to its article; a click opens the term card instead."""
    done, used = set(), {}
    for sec in ("why", "scale"):
        i = body.find(f'id="{sec}"')
        if i == -1:
            continue
        j = body.index("</section>", i)
        body = body[:i] + link_terms(body[i:j], lang, terms, base, done, used, card=True) + body[j:]
    if not used:
        return body
    data = {k: {"name": t[lang]["name"], "short": t[lang]["short"], "hook": t[lang]["hook"],
                "url": glossary_url(base, lang, t["page"]), "link": GLOSSARY_TEXT[lang][1]} for k, t in used.items()}
    return body + "\n" + TERM_SCRIPT % json.dumps(data, ensure_ascii=False).replace("</", "<\\/")


def term_cards(lang, terms, base, skip=None):
    return "\n".join(
        f'      <li class="gl-card" id="{t["id"]}"><a href="{glossary_url(base, lang, t["page"])}"><h3>{e(t[lang]["name"])}</h3>'
        f'<p>{e(t[lang]["short"])}</p><p class="gl-hook">{e(t[lang]["hook"])}</p></a></li>'
        for t in terms if t["page"] != skip)


def term_groups(lang, terms, groups, base):
    """The contents page: a folded book-style contents (a column per theme, its terms as plain links to their cards),
    then each themed section with its why line and cards."""
    tmap = {t["id"]: t for t in terms}
    nav = "".join(
        f'<div class="gl-toc-col"><a class="gl-toc-lab" href="#{g["id"]}">{e(g[lang]["name"])}</a>'
        + "".join(f'<a href="#{i}">{e(tmap[i][lang]["name"])}</a>' for i in g["terms"]) + "</div>"
        for g in groups)
    secs = "\n".join(
        f'  <section class="gl-sec gl-group" id="{g["id"]}"><h2>{e(g[lang]["name"])}</h2><p>{e(g[lang]["why"])}</p>\n'
        f'    <ul class="gl-cards">\n{term_cards(lang, [tmap[i] for i in g["terms"]], base)}\n    </ul></section>'
        for g in groups)
    # folded into one quiet line (as the course dictionary), so the term names don't stand twice on screen
    names = " · ".join(e(g[lang]["name"]) for g in groups)
    return (f'<details class="gl-toc-box"><summary><b>{"Зміст" if lang == "uk" else "Contents"}</b><span class="words">{names}</span></summary>'
            f'<nav class="gl-toc" aria-label="{GLOSSARY_TEXT[lang][0]}">{nav}</nav></details>\n{secs}')


def build_glossary(problems, base):
    """docs/glossary/: the contents page and one article per glossary/<page>/. Returns [(urls, lastmod)] for the sitemap."""
    terms, pages, groups = load_glossary()
    tmap = {t["id"]: t for t in terms}
    pmeta = {p[0]: p for p in problems}
    home = {l: base + LANG_PATH[l] for l in LANGS}
    out = []
    for name, meta in pages.items():
        for s in meta["problems"]:
            if s not in pmeta:
                raise SystemExit(f"glossary/{name}/meta.json: unknown problem {s}")
        src = (GLOSSARY / name / "page.html").read_text(encoding="utf-8")
        urls = {l: glossary_url(base, l, name) for l in LANGS}
        for lang in LANGS:
            m, other = meta[lang], ("en" if lang == "uk" else "uk")
            gl, _, where, others, _ = GLOSSARY_TEXT[lang]
            probs = "\n".join(
                f'      <a class="mp-related-card" href="{pmeta[s][2][lang]}"><h3>{e(pmeta[s][1][lang]["card"]["title"])}</h3>'
                f'<p>{e(pmeta[s][1][lang].get("share", {}).get("description", pmeta[s][1][lang]["card"]["text"]))}</p></a>'
                for s in meta["problems"])
            body = with_layers(LangStripper(src, other).strip(), lang, "glossary-" + name)
            # first mentions of the other terms become plain links (this article's own terms are skipped)
            k = body.find('<section class="gl-layers">')
            if k != -1:
                own = {t["id"] for t in terms if t["page"] == name}
                body = body[:k] + link_terms(body[k:], lang, terms, base, set(own), {}, card=False)
            body = body.replace("<!--PROBLEMS-->", f'<section class="gl-sec"><h2>{where}</h2>\n    <div class="mp-related-grid">\n{probs}\n    </div></section>')
            # the other terms of this article's group, then a link to the whole glossary
            g = next(g for g in groups if any(tmap[i]["page"] == name for i in g["terms"]))
            body = body.replace("<!--TERMS-->", f'<section class="gl-sec"><h2>{e(others % g[lang]["name"])}</h2>\n    <ul class="gl-cards">\n'
                                f'{term_cards(lang, [tmap[i] for i in g["terms"]], base, skip=name)}\n    </ul>\n'
                                f'    <p class="gl-all"><a href="{glossary_url(base, lang)}#{g["id"]}">{GLOSSARY_TEXT[lang][4]} →</a></p></section>')
            body = body.replace("{{HOME}}", home[lang]).replace("{{BRAND}}", BRAND_MARK + SITE_NAME[lang])
            body = body.replace("{{GLOSSARY}}", glossary_url(base, lang))
            body = body.replace('href="#uk" hreflang="uk"', f'href="{urls["uk"]}" hreflang="uk"')
            body = body.replace('href="#en" hreflang="en"', f'href="{urls["en"]}" hreflang="en"')
            style = body[:body.index("</style>") + len("</style>")]
            body = body[len(style):]
            ld = {"@context": "https://schema.org", "@graph": [
                {"@type": ["WebPage", "LearningResource"], "@id": urls[lang] + "#page", "url": urls[lang], "name": m["title"],
                 "description": m["description"], "inLanguage": lang, "isAccessibleForFree": True,
                 "learningResourceType": ["interactive simulation", "explanation"],
                 "about": [{"@type": "DefinedTerm", "name": t[lang]["name"], "description": t[lang]["short"],
                            "inDefinedTermSet": glossary_url(base, lang)} for t in terms if t["page"] == name],
                 "datePublished": meta["published"], "dateModified": meta["updated"],
                 "author": {"@id": base + "#author"}, "isPartOf": {"@type": "WebSite", "name": SITE_NAME[lang], "url": home[lang]}},
                author_ld(lang, base),
                {"@type": "BreadcrumbList", "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": SITE_NAME[lang], "item": home[lang]},
                    {"@type": "ListItem", "position": 2, "name": gl, "item": glossary_url(base, lang)},
                    {"@type": "ListItem", "position": 3, "name": m["name"], "item": urls[lang]}]},
            ]}
            h = head(lang, urls, m["title"], m["description"], base + f"og-{lang}.png", m["og_alt"], ld, base)
            doc = (f'<!doctype html>\n<html lang="{lang}" data-lang="{lang}" data-static>\n<head>\n{h}\n{RESET}\n'
                   f'{style}\n{css_link(base)}\n</head>\n<body>\n{body.strip()}\n{CF_ANALYTICS}\n</body>\n</html>\n')
            write(DOCS / "glossary" / name / LANG_PATH[lang] / "index.html", doc)
        out.append((urls, meta["updated"]))
    src = (GLOSSARY / "index.html").read_text(encoding="utf-8")
    meta = json.loads((GLOSSARY / "index.json").read_text(encoding="utf-8"))
    urls = {l: glossary_url(base, l) for l in LANGS}
    for lang in LANGS:
        m, other = meta[lang], ("en" if lang == "uk" else "uk")
        body = LangStripper(src, other).strip()
        body = body.replace("<!--TERMS-->", term_groups(lang, terms, groups, base))
        body = body.replace("{{HOME}}", home[lang]).replace("{{BRAND}}", BRAND_MARK + SITE_NAME[lang])
        body = body.replace('href="#uk" hreflang="uk"', f'href="{urls["uk"]}" hreflang="uk"')
        body = body.replace('href="#en" hreflang="en"', f'href="{urls["en"]}" hreflang="en"')
        style = body[:body.index("</style>") + len("</style>")]
        body = body[len(style):]
        ld = {"@context": "https://schema.org", "@graph": [
            {"@type": ["CollectionPage", "DefinedTermSet"], "@id": urls[lang], "url": urls[lang], "name": m["title"],
             "description": m["description"], "inLanguage": lang, "author": {"@id": base + "#author"},
             "hasDefinedTerm": [{"@type": "DefinedTerm", "name": t[lang]["name"], "description": t[lang]["short"],
                                 "url": glossary_url(base, lang, t["page"])} for t in terms]},
            author_ld(lang, base),
        ]}
        h = head(lang, urls, m["title"], m["description"], base + f"og-{lang}.png", m["og_alt"], ld, base)
        doc = (f'<!doctype html>\n<html lang="{lang}" data-lang="{lang}" data-static>\n<head>\n{h}\n{RESET}\n'
               f'{style}\n{css_link(base)}\n</head>\n<body>\n{body.strip()}\n{CF_ANALYTICS}\n</body>\n</html>\n')
        write(DOCS / "glossary" / LANG_PATH[lang] / "index.html", doc)
    out.insert(0, (urls, max(p["updated"] for p in pages.values())))
    return out


# ---------- courses ----------
# courses/<name>/page.html + meta.json: a path for one audience through catalogue problems and glossary terms,
# with its own short cases. The build fills <!--PROBLEM:slug--> (a card with the question and a solved chip),
# <!--TERMS:a,b--> (glossary cards), <!--PROGRESS-->, <!--MORE-->, {{P:slug}} (problem URL), {{HOME}}, {{BRAND}},
# {{COURSES}} and {{GLOSSARY}}. A <div class="cs-after" data-after="slug"> stays hidden until that problem is solved.
COURSES = ROOT / "courses"
COURSE_LIST = []  # [(name, meta)], filled by build() before the problem pages
COURSE_TEXT = {
    "uk": {"courses": "Курси", "course": "Курс", "chapter": "розділ %d з %d", "solved": "розв'язано ✓", "todo": "ще не розв'язано",
           "progress": "Пройдено <b>0</b> з %d розділів", "problems": "Задач з каталогу розв'язано: <b>0</b> з %d",
           "reset": "Почати курс спочатку", "show": "Показати висновок", "resume": "Продовжити з розділу",
           "needs": "Тут знадобиться те, що ви ще не пройшли:", "needs_ch": "розділ %d «%s»",
           "gate": "Висновок відкриється, коли ви розв'яжете задачу вище. Або", "gate_ch": "Висновок відкриється після вашої відповіді вище. Або",
           "more": "Що далі", "all": "Усі курси",
           "glossary": "Словник термінів", "catalogue": "Усі задачі", "chapters": "%d розділів · %d задач з каталогу",
           "hub": "Тематичні шляхи для різних читачів: історія, адаптовані кейси, задачі з каталогу і терміни зі словника."},
    "en": {"courses": "Courses", "course": "Course", "chapter": "chapter %d of %d", "solved": "solved ✓", "todo": "not solved yet",
           "progress": "Done <b>0</b> of %d chapters", "problems": "Catalogue puzzles solved: <b>0</b> of %d",
           "reset": "Start the course over", "show": "Show the takeaway", "resume": "Continue from chapter",
           "needs": "This builds on what you haven't done yet:", "needs_ch": "chapter %d, “%s”",
           "gate": "The takeaway opens once you solve the puzzle above. Or", "gate_ch": "The takeaway opens once you answer above. Or",
           "more": "What next", "all": "All courses",
           "glossary": "Glossary of terms", "catalogue": "All puzzles", "chapters": "%d chapters · %d catalogue puzzles",
           "hub": "Themed paths for different readers: a story, adapted cases, puzzles from the catalogue and terms from the glossary."},
}
# Progress lives in localStorage: "mp-course:<name>" holds the ids of chapters the reader has answered (the page calls
# mpCourseDone(id) after its own check question); catalogue problems use the site's "mp-solved:<slug>".
# .cs-after[data-after="slug"] waits for a solved problem, .cs-after[data-after-ch="ch-3"] for an answered chapter.
COURSE_SCRIPT = """<script>
(function () {
  var T = %s, API = %s, P = document.querySelector(".cs-progress"), NAME = P ? P.dataset.course : "", KEY = "mp-course:" + NAME;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  // anonymous counters in the answer-stats worker, once per browser and key: "open", "<chapter>.r|w", page-defined events
  window.mpCourseEvent = function (k) {
    var mark = "mp-cev:" + NAME + ":" + k;
    if (!API || !NAME || !window.fetch || get(mark) || get("mp-notrack") === "1") return;
    set(mark, "1");
    fetch(API, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ s: "course-" + NAME, k: k, h: 0 }) }).catch(function () {});
  };
  mpCourseEvent("open");
  function solved(s) { try { return !!localStorage.getItem("mp-solved:" + s); } catch (e) { return false; } }
  function done() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
  window.mpCourseDone = function (id, right) {
    var d = done(); if (d.indexOf(id) === -1) { d.push(id); set(KEY, JSON.stringify(d)); if (right !== undefined) mpCourseEvent(id + (right ? ".r" : ".w")); }
    paint();
  };
  window.mpCourseIsDone = function (id) { return done().indexOf(id) !== -1; };
  document.querySelectorAll(".cs-after").forEach(function (el) {
    var g = document.createElement("p"); g.className = "cs-gate";
    var b = document.createElement("button"); b.type = "button"; b.textContent = T.show;
    b.addEventListener("click", function () { el.classList.add("open"); g.hidden = true; });
    g.append((el.dataset.afterCh ? T.gate_ch : T.gate) + " ", b); el.before(g); el._gate = g;
  });
  function paint() {
    var d = done();
    document.querySelectorAll(".cs-status").forEach(function (el) {
      var ok = solved(el.dataset.slug); el.textContent = ok ? T.solved : T.todo; el.classList.toggle("ok", ok);
    });
    document.querySelectorAll(".cs-after").forEach(function (el) {
      var ok = el.dataset.afterCh ? d.indexOf(el.dataset.afterCh) !== -1 : solved(el.dataset.after);
      if (ok) { el.classList.add("open"); el._gate.hidden = true; }
    });
    document.querySelectorAll(".cs-back").forEach(function (el) {
      var miss = 0;
      el.querySelectorAll("a[data-need]").forEach(function (a) { var ok = d.indexOf(a.dataset.need) !== -1; a.hidden = ok; if (!ok) miss++; });
      el.hidden = !miss;
    });
    document.querySelectorAll(".cs-toc a").forEach(function (a) { a.classList.toggle("done", d.indexOf(a.getAttribute("href").slice(1)) !== -1); });
    if (P) {
      var ch = P.dataset.chapters.split(" "), n = ch.filter(function (c) { return d.indexOf(c) !== -1; }).length;
      var sl = P.dataset.slugs ? P.dataset.slugs.split(" ") : [], m = sl.filter(solved).length;
      P.querySelector(".cs-pc b").textContent = n; P.querySelector(".cs-bar i").style.width = (100 * n / ch.length) + "%%";
      var q = P.querySelector(".cs-pp b"); if (q) q.textContent = m;
      var next = ch.filter(function (c) { return d.indexOf(c) === -1; })[0], res = P.querySelector(".cs-resume");
      if (res) {
        res.hidden = !n || !next;
        if (next) { var a = document.querySelector('.cs-toc a[href="#' + next + '"]'); res.href = "#" + next; res.textContent = T.resume + " " + (a ? a.textContent.replace(/^\\s*(\\d+)\\s*/, "$1 · ") : next) + " →"; }
      }
    }
  }
  var r = P && P.querySelector(".cs-reset");
  if (r) r.addEventListener("click", function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); });
  paint();
  window.addEventListener("pageshow", paint);
  window.addEventListener("storage", paint);
})();
</script>"""


def load_courses():
    if not COURSES.exists():
        return []
    out = [(d.name, json.loads((d / "meta.json").read_text(encoding="utf-8")))
           for d in sorted(COURSES.iterdir()) if (d / "page.html").exists() and (d / "meta.json").exists()]
    out.sort(key=lambda c: (c[1].get("order", 99), c[0]))
    return out


def course_url(base, lang, name=None):
    return base + "courses/" + (name + "/" if name else "") + LANG_PATH[lang]


def other_course(mo, lang, base, where):
    """{{C:name}}: the URL of another course, e.g. a link from one course to a chapter of another."""
    if not (COURSES / mo.group(1) / "meta.json").exists():
        raise SystemExit(f"{where}: unknown course {mo.group(1)}")
    return course_url(base, lang, mo.group(1))


def course_slugs(meta):
    """Catalogue problems of a course in chapter order, each once."""
    seen = []
    for ch in meta["chapters"]:
        for s in ch.get("problems", []):
            if s not in seen:
                seen.append(s)
    return seen


def course_strip(lang, slug, base):
    """'Course «…» · chapter k of N →' lines for a problem page, one per course that sends readers to it."""
    out = []
    for name, meta in COURSE_LIST:
        chs = meta["chapters"]
        for i, ch in enumerate(chs):
            if slug in ch.get("problems", []):
                t = COURSE_TEXT[lang]
                out.append(f'<a class="mp-course" href="{course_url(base, lang, name)}#{ch["id"]}">'
                           f'<b>{t["course"]} «{e(meta[lang]["name"])}»</b> · {t["chapter"] % (i + 1, len(chs))} →</a>')
                break
    return "".join(out)


def course_card(lang, name, meta, base):
    t = COURSE_TEXT[lang]
    n = sum(1 for ch in meta["chapters"] if ch["id"] != "checklist")
    m = re.search(r"--tint:\s*(#[0-9A-Fa-f]{6})", (COURSES / name / "page.html").read_text(encoding="utf-8"))
    tint = f' style="--tint: {m.group(1)}"' if m else ""
    return (f'<a class="mp-course-card" href="{course_url(base, lang, name)}"{tint}>'
            f'<span class="eyebrow">{t["course"]} · {e(meta["audience"][lang])}</span>'
            f'<h3>{e(meta[lang]["card"]["title"])}</h3><p>{e(meta[lang]["card"]["text"])}</p>'
            f'<span class="mp-course-meta">{t["chapters"] % (n, len(course_slugs(meta)))}</span></a>')


def courses_block(lang, base):
    """The 'Courses' strip on the home page, above the catalogue."""
    if not COURSE_LIST:
        return ""
    t = COURSE_TEXT[lang]
    cards = "\n".join(course_card(lang, n, m, base) for n, m in COURSE_LIST)
    return (f'<section class="mp-courses" id="courses">\n  <div class="mp-courses-head"><h2>{t["courses"]}</h2><p>{t["hub"]}</p></div>\n'
            f'  <div class="mp-course-grid">\n{cards}\n  </div>\n</section>')


COURSE_EVENT_SCRIPT = """<script>
(function () {
  var API = %s, NAME = %s;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  window.mpCourseEvent = function (k) {
    var mark = "mp-cev:" + NAME + ":" + k;
    if (!API || !window.fetch || get(mark) || get("mp-notrack") === "1") return;
    set(mark, "1");
    fetch(API, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ s: "course-" + NAME, k: k, h: 0 }) }).catch(function () {});
  };
})();
</script>"""


def build_course_subpages(name, cmeta, pmeta, base):
    """courses/<name>/<sub>/page.html + meta.json: a tool or extra page of a course, at /courses/<name>/<sub>/.
    Placeholders as on the course page, plus {{COURSE}} (the course URL) and {{CH:ch-N}} (a chapter link).
    The page may call mpCourseEvent(key) for anonymous counters under the course."""
    home = {l: base + LANG_PATH[l] for l in LANGS}
    out = []
    for d in sorted((COURSES / name).iterdir()):
        if not (d.is_dir() and (d / "page.html").exists() and (d / "meta.json").exists()):
            continue
        meta = json.loads((d / "meta.json").read_text(encoding="utf-8"))
        src = (d / "page.html").read_text(encoding="utf-8")
        curl = {l: course_url(base, l, name) for l in LANGS}
        urls = {l: base + "courses/" + name + "/" + d.name + "/" + LANG_PATH[l] for l in LANGS}
        for lang in LANGS:
            m, other, t = meta[lang], ("en" if lang == "uk" else "uk"), COURSE_TEXT[lang]
            body = LangStripper(src, other).strip()
            used = {}
            k = body.find("</header>")
            if k != -1:
                body = body[:k] + link_terms(body[k:], lang, TERMS, base, set(), used, card=True)
            def purl(mo):
                if mo.group(1) not in pmeta:
                    raise SystemExit(f"courses/{name}/{d.name}/page.html: unknown problem {mo.group(1)}")
                return pmeta[mo.group(1)][2][lang]
            body = re.sub(r"\{\{P:([\w-]+)\}\}", purl, body)
            # /*PUZZLES:a,b*/ inside the script: those catalogue problems as JSON (url, title and question from "share", level, hints)
            def puzzles(mo):
                out = []
                for s_ in [x.strip() for x in mo.group(1).split(",") if x.strip()]:
                    if s_ not in pmeta or not pmeta[s_][1].get("hints"):
                        raise SystemExit(f"courses/{name}/{d.name}/page.html: PUZZLES needs a known problem with hints, not {s_}")
                    pm = pmeta[s_][1]
                    out.append({"s": s_, "url": pmeta[s_][2][lang], "title": pm[lang]["share"]["title"], "q": pm[lang]["share"]["description"],
                                "level": pm["level"], "hints": pm["hints"][lang]})
                return json.dumps(out, ensure_ascii=False).replace("</", "<\\/")
            body = re.sub(r"/\*PUZZLES:([\w,\s-]+)\*/", puzzles, body)
            body = re.sub(r"\{\{CH:([\w-]+)\}\}", lambda mo: curl[lang] + "#" + mo.group(1), body)
            body = re.sub(r"\{\{C:([\w/-]+)\}\}", lambda mo: other_course(mo, lang, base, f"courses/{name}/{d.name}/page.html"), body)
            body = body.replace("{{BOOKS}}", base + "books/" + LANG_PATH[lang])
            body = body.replace("{{HOME}}", home[lang]).replace("{{BRAND}}", BRAND_MARK + SITE_NAME[lang])
            body = body.replace("{{COURSES}}", course_url(base, lang)).replace("{{COURSE}}", curl[lang])
            body = body.replace("{{GLOSSARY}}", glossary_url(base, lang))
            body = body.replace('href="#uk" hreflang="uk"', f'href="{urls["uk"]}" hreflang="uk"')
            body = body.replace('href="#en" hreflang="en"', f'href="{urls["en"]}" hreflang="en"')
            style = body[:body.index("</style>") + len("</style>")]
            body = body[len(style):]
            img = urls[lang] + f"og-{lang}.png" if (d / "assets" / f"og-{lang}.png").exists() else (
                curl[lang] + f"og-{lang}.png" if (COURSES / name / "assets" / f"og-{lang}.png").exists() else base + f"og-{lang}.png")
            ld = {"@context": "https://schema.org", "@graph": [
                {"@type": "WebPage", "@id": urls[lang] + "#page", "url": urls[lang], "name": m["title"], "description": m["description"],
                 "inLanguage": lang, "isAccessibleForFree": True, "author": {"@id": base + "#author"}, "image": img,
                 "datePublished": meta["published"], "dateModified": meta["updated"],
                 "isPartOf": {"@type": "Course", "@id": curl[lang] + "#course", "name": cmeta[lang]["name"], "url": curl[lang]}},
                author_ld(lang, base),
                {"@type": "BreadcrumbList", "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": SITE_NAME[lang], "item": home[lang]},
                    {"@type": "ListItem", "position": 2, "name": t["courses"], "item": course_url(base, lang)},
                    {"@type": "ListItem", "position": 3, "name": cmeta[lang]["name"], "item": curl[lang]},
                    {"@type": "ListItem", "position": 4, "name": m["name"], "item": urls[lang]}]},
            ]}
            h = head(lang, urls, m["title"], m["description"], img, m["og_alt"], ld, base)
            script = COURSE_EVENT_SCRIPT % (json.dumps(STATS_API), json.dumps(name))
            if used:
                data = {k2: {"name": v[lang]["name"], "short": v[lang]["short"], "hook": v[lang]["hook"],
                             "url": glossary_url(base, lang, v["page"]), "link": GLOSSARY_TEXT[lang][1]} for k2, v in used.items()}
                script += "\n" + TERM_SCRIPT % json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
            doc = (f'<!doctype html>\n<html lang="{lang}" data-lang="{lang}" data-static>\n<head>\n{h}\n{RESET}\n'
                   f'{style}\n{css_link(base)}\n</head>\n<body>\n{script}\n{body.strip()}\n{claspo_snippet(lang)}\n{CF_ANALYTICS}\n</body>\n</html>\n')
            write(DOCS / "courses" / name / d.name / LANG_PATH[lang] / "index.html", doc)
        for f in (d / "assets").iterdir() if (d / "assets").exists() else []:
            if f.suffix == ".png" and f.name.startswith("og-"):
                shutil.copy(f, DOCS / "courses" / name / d.name / f.name)
        out.append((urls, meta["updated"]))
    return out


def build_courses(problems, base):
    """docs/courses/: the contents page and one page per course. Returns [(urls, lastmod)] for the sitemap."""
    pmeta = {p[0]: p for p in problems}
    tmap = {t["id"]: t for t in TERMS}
    home = {l: base + LANG_PATH[l] for l in LANGS}
    out = []
    for name, meta in COURSE_LIST:
        for ch in meta["chapters"]:
            for s in ch.get("problems", []):
                if s not in pmeta:
                    raise SystemExit(f"courses/{name}/meta.json: unknown problem {s}")
        src = (COURSES / name / "page.html").read_text(encoding="utf-8")
        urls = {l: course_url(base, l, name) for l in LANGS}
        slugs = course_slugs(meta)
        for lang in LANGS:
            m, other, t = meta[lang], ("en" if lang == "uk" else "uk"), COURSE_TEXT[lang]
            body = LangStripper(src, other).strip()
            # first mention of each glossary term in the chapters opens the term card; done before the problem and
            # term cards go in, since those are links themselves
            k = body.find('class="cs-ch')
            used = {}
            if k != -1:
                body = body[:k] + link_terms(body[k:], lang, TERMS, base, set(), used, card=True)
            def problem(mo):
                s = mo.group(1)
                if s not in pmeta:
                    raise SystemExit(f"courses/{name}/page.html: unknown problem {s}")
                pm = pmeta[s][1][lang]
                return (f'<a class="cs-problem" href="{pmeta[s][2][lang]}"><span class="cs-status" data-slug="{s}"></span>'
                        f'<h3>{e(pm["card"]["title"])}</h3><p>{e(pm.get("share", {}).get("description", pm["card"]["text"]))}</p></a>')
            body = re.sub(r"<!--PROBLEM:([\w-]+)-->", problem, body)
            def terms(mo):
                ids = [x.strip() for x in mo.group(1).split(",")]
                for i in ids:
                    if i not in tmap:
                        raise SystemExit(f"courses/{name}/page.html: unknown term {i}")
                return ('<ul class="gl-cards cs-terms">' + "".join(
                    f'<li class="gl-card"><a href="{glossary_url(base, lang, tmap[i]["page"])}"><h3>{e(tmap[i][lang]["name"])}</h3>'
                    f'<p>{e(tmap[i][lang]["short"])}</p></a></li>' for i in ids) + "</ul>")
            body = re.sub(r"<!--TERMS:([\w,\s-]+)-->", terms, body)
            def purl(mo):
                if mo.group(1) not in pmeta:
                    raise SystemExit(f"courses/{name}/page.html: unknown problem {mo.group(1)}")
                return pmeta[mo.group(1)][2][lang]
            body = re.sub(r"\{\{P:([\w-]+)\}\}", purl, body)
            # {{SUB:check}}: a subpage of this course (courses/<name>/check/)
            body = re.sub(r"\{\{SUB:([\w-]+)\}\}", lambda mo: base + "courses/" + name + "/" + mo.group(1) + "/" + LANG_PATH[lang], body)
            # {{C:ab-testing}}: another course or its subpage ({{C:ab-testing/check}}), for links like {{C:ab-testing}}#ch-5
            body = re.sub(r"\{\{C:([\w/-]+)\}\}", lambda mo: other_course(mo, lang, base, f"courses/{name}/page.html"), body)
            body = body.replace("{{BOOKS}}", base + "books/" + LANG_PATH[lang])
            num = {c["id"]: i + 1 for i, c in enumerate(meta["chapters"])}
            for c in meta["chapters"]:
                if not c.get("needs"):
                    continue
                for nid in c["needs"]:
                    if nid not in num:
                        raise SystemExit(f"courses/{name}/meta.json: {c['id']} needs unknown chapter {nid}")
                links = "".join(f'<a href="#{nid}" data-need="{nid}">{t["needs_ch"] % (num[nid], e(next(x for x in meta["chapters"] if x["id"] == nid)[lang]))}</a>'
                                for nid in c["needs"])
                note = f'<p class="cs-back" hidden>{t["needs"]} {links}</p>'
                body = re.sub(r'(<section class="cs-ch[^"]*" id="%s"[^>]*>\s*<div class="cs-ch-head">.*?</div>)' % re.escape(c["id"]),
                              lambda mo: mo.group(1) + "\n" + note, body, count=1, flags=re.S)
            chs = [c["id"] for c in meta["chapters"] if c.get("check", True)]
            body = body.replace("<!--PROGRESS-->", f'<div class="cs-progress" data-course="{name}" data-chapters="{" ".join(chs)}" data-slugs="{" ".join(slugs)}">'
                                                   f'<span class="cs-pc">{t["progress"] % len(chs)}</span><span class="cs-bar"><i></i></span>'
                                                   f'<span class="cs-pp">{t["problems"] % len(slugs)}</span>'
                                                   f'<a class="cs-resume" href="#" hidden></a><button type="button" class="cs-reset">{t["reset"]}</button></div>')
            more = (f'<section class="cs-ch cs-more"><h2>{t["more"]}</h2><p class="mp-related-all">'
                    f'<a href="{course_url(base, lang)}">{t["all"]} →</a><a href="{glossary_url(base, lang)}">{t["glossary"]} →</a>'
                    f'<a href="{home[lang]}#problems">{t["catalogue"]} →</a></p></section>')
            body = body.replace("<!--MORE-->", more)
            body = body.replace("{{HOME}}", home[lang]).replace("{{BRAND}}", BRAND_MARK + SITE_NAME[lang])
            body = body.replace("{{COURSES}}", course_url(base, lang)).replace("{{GLOSSARY}}", glossary_url(base, lang))
            body = body.replace('href="#uk" hreflang="uk"', f'href="{urls["uk"]}" hreflang="uk"')
            body = body.replace('href="#en" hreflang="en"', f'href="{urls["en"]}" hreflang="en"')
            style = body[:body.index("</style>") + len("</style>")]
            body = body[len(style):]
            img = urls[lang] + f"og-{lang}.png" if (COURSES / name / "assets" / f"og-{lang}.png").exists() else base + f"og-{lang}.png"
            ld = {"@context": "https://schema.org", "@graph": [
                {"@type": ["Course", "LearningResource"], "@id": urls[lang] + "#course", "url": urls[lang], "name": m["name"],
                 "description": m["description"], "inLanguage": lang, "isAccessibleForFree": True,
                 "educationalLevel": LEVEL_LD[meta["level"]], "audience": {"@type": "Audience", "audienceType": meta["audience"][lang]},
                 "provider": {"@id": base + "#author"}, "author": {"@id": base + "#author"}, "image": img,
                 "datePublished": meta["published"], "dateModified": meta["updated"],
                 "hasPart": [{"@type": "LearningResource", "name": pmeta[s][1][lang]["card"]["title"], "url": pmeta[s][2][lang]} for s in slugs],
                 "isPartOf": {"@type": "WebSite", "name": SITE_NAME[lang], "url": home[lang]}},
                author_ld(lang, base),
                {"@type": "BreadcrumbList", "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": SITE_NAME[lang], "item": home[lang]},
                    {"@type": "ListItem", "position": 2, "name": t["courses"], "item": course_url(base, lang)},
                    {"@type": "ListItem", "position": 3, "name": m["name"], "item": urls[lang]}]},
            ]}
            h = head(lang, urls, m["title"], m["description"], img, m["og_alt"], ld, base)
            script = COURSE_SCRIPT % (json.dumps({k2: t[k2] for k2 in ("solved", "todo", "show", "gate", "gate_ch", "resume")}, ensure_ascii=False), json.dumps(STATS_API))
            if used:
                data = {k2: {"name": v[lang]["name"], "short": v[lang]["short"], "hook": v[lang]["hook"],
                             "url": glossary_url(base, lang, v["page"]), "link": GLOSSARY_TEXT[lang][1]} for k2, v in used.items()}
                script += "\n" + TERM_SCRIPT % json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
            doc = (f'<!doctype html>\n<html lang="{lang}" data-lang="{lang}" data-static>\n<head>\n{h}\n{RESET}\n'
                   f'{style}\n{css_link(base)}\n</head>\n<body>\n{body.strip()}\n{script}\n{claspo_snippet(lang)}\n{CF_ANALYTICS}\n</body>\n</html>\n')
            write(DOCS / "courses" / name / LANG_PATH[lang] / "index.html", doc)
        for f in (COURSES / name / "assets").iterdir() if (COURSES / name / "assets").exists() else []:
            if f.suffix == ".png" and f.name.startswith("og-"):
                shutil.copy(f, DOCS / "courses" / name / f.name)
        out.append((urls, meta["updated"]))
        out += build_course_subpages(name, meta, pmeta, base)
    if not COURSE_LIST:
        return out
    src = (COURSES / "index.html").read_text(encoding="utf-8")
    meta = json.loads((COURSES / "index.json").read_text(encoding="utf-8"))
    urls = {l: course_url(base, l) for l in LANGS}
    for lang in LANGS:
        m, other = meta[lang], ("en" if lang == "uk" else "uk")
        body = LangStripper(src, other).strip()
        body = body.replace("<!--COURSES-->", '<div class="mp-course-grid">\n' + "\n".join(course_card(lang, n, cm, base) for n, cm in COURSE_LIST) + "\n</div>")
        body = body.replace("{{HOME}}", home[lang]).replace("{{BRAND}}", BRAND_MARK + SITE_NAME[lang])
        body = body.replace('href="#uk" hreflang="uk"', f'href="{urls["uk"]}" hreflang="uk"')
        body = body.replace('href="#en" hreflang="en"', f'href="{urls["en"]}" hreflang="en"')
        style = body[:body.index("</style>") + len("</style>")]
        body = body[len(style):]
        ld = {"@context": "https://schema.org", "@graph": [
            {"@type": "CollectionPage", "@id": urls[lang], "url": urls[lang], "name": m["title"], "description": m["description"],
             "inLanguage": lang, "author": {"@id": base + "#author"},
             "mainEntity": {"@type": "ItemList", "itemListElement": [
                 {"@type": "ListItem", "position": i + 1, "url": course_url(base, lang, n), "name": cm[lang]["name"]}
                 for i, (n, cm) in enumerate(COURSE_LIST)]}},
            author_ld(lang, base),
        ]}
        h = head(lang, urls, m["title"], m["description"], base + f"og-{lang}.png", m["og_alt"], ld, base)
        doc = (f'<!doctype html>\n<html lang="{lang}" data-lang="{lang}" data-static>\n<head>\n{h}\n{RESET}\n'
               f'{style}\n{css_link(base)}\n</head>\n<body>\n{body.strip()}\n{CF_ANALYTICS}\n</body>\n</html>\n')
        write(DOCS / "courses" / LANG_PATH[lang] / "index.html", doc)
    out.insert(0, (urls, max(cm["updated"] for _, cm in COURSE_LIST)))
    return out


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
    <p><a class="btn" href="{base + LANG_PATH[lang]}">{home}</a> &nbsp; <a href="{glossary_url(base, lang)}">{GLOSSARY_TEXT[lang][0]} →</a></p>
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
        if not meta.get("topics") or set(meta["topics"]) - set(TOPICS):
            raise SystemExit(f"problems/{slug}/meta.json: \"topics\" must list one or more of {', '.join(TOPICS)}")
        if meta.get("level") not in LEVELS:
            raise SystemExit(f"problems/{slug}/meta.json: \"level\" must be 1, 2 or 3 (see LEVELS in build.py)")
    books = load_books()
    global TERMS
    TERMS = load_glossary()[0]
    global COURSE_LIST
    COURSE_LIST = load_courses()
    for name, cm in COURSE_LIST:
        for k in ("published", "updated"):
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", cm.get(k, "")):
                raise SystemExit(f"courses/{name}/meta.json: \"{k}\" must be a YYYY-MM-DD date")
    SITE_NAV.update(base=base, problems={s: {"s": s, "n": {l: m[l]["card"]["title"] for l in LANGS},
                                               "u": {l: base + s + "/" + LANG_PATH[l] for l in LANGS}} for s, m in metas},
                    courses={c: {"s": "course:" + c, "n": {l: cm[l]["name"] for l in LANGS},
                                 "u": {l: course_url(base, l, c) for l in LANGS},
                                 "c": [ch["id"] for ch in cm["chapters"] if ch.get("check", True)]} for c, cm in COURSE_LIST})
    related = pick_related(metas)
    problems = [build_problem(s, base, metas, books, related[s]) for s, _ in metas]
    hub = build_hub(problems, base)
    build_404(problems, base)
    build_subscribed(problems, base)
    shelf = build_books(problems, base, books)
    glossary = build_glossary(problems, base)
    courses = build_courses(problems, base)
    build_feeds(metas, base)

    today = date.today().isoformat()
    entries = []
    for urls, mod in [(hub, today), (shelf, today)] + glossary + courses + [(p[2], p[1]["updated"]) for p in problems]:
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
    if INDEXNOW_KEY:
        (DOCS / f"{INDEXNOW_KEY}.txt").write_text(INDEXNOW_KEY)
    print(f"sitemap.xml ({len(entries)} URLs), robots.txt, favicon.svg")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default=DEFAULT_BASE, help="public URL of the site root, ending with /")
    ap.add_argument("--out", help="write the site here instead of docs/ (for local checks)")
    ap.add_argument("--stats-api", help="answer-stats endpoint instead of STATS_API (e.g. a local worker for checks)")
    a = ap.parse_args()
    if a.stats_api is not None:
        STATS_API = a.stats_api
    build(a.base_url if a.base_url.endswith("/") else a.base_url + "/", a.out)
