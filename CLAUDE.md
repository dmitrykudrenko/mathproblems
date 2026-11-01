# mathparadoxes.com

Bilingual (uk/en) interactive explainers of math puzzles where intuition is wrong. Static site, no dependencies: `python3 build.py` writes `docs/`, which GitHub Pages serves at https://mathparadoxes.com. README.md (Ukrainian) documents structure, spoilers, giscus, Claspo and SEO in detail.

## Rules

- **No spoilers.** The answer is hidden until the visitor guesses (`sp-before`/`sp-after`, `data-solve`, `mpSolve()`). `share` in meta.json and OG images ask the question, never answer it. Only `<title>`/description may contain the answer.
- **Both languages always.** Every visible text exists as `class="uk"` and `class="en"`; the build strips the other language.
- **Math must be verified** independently (exact calculation in Python, simulation in node) before shipping.
- Variant labels (A, B, C) get a thin frame so they don't read as «а»/«в»: the build frames standalone Latin A/B/C in page text by itself; Cyrillic labels (А, Б, В) need `<span class="vl">А</span>` in the source.
- Author name in English: Dmytro Kudrenko. Magenta (`--signal`) marks the counter-intuitive answer only.
- Commit `docs/` together with the sources. Never push half-finished problem folders.
- `~/Documents` is iCloud-synced: ignore/delete Finder duplicates like `index 3.html`, never `git add -A` blindly.

## New problem

1. `problems/<slug>/page.html`, `teaser.html`, `meta.json` — copy the skeleton of an existing page: hero → puzzle → round 1 guess → round 2 play → round 3 simulation → round 4 why in layers `mp-layer` easy → strict → deep (plain words, then tables/charts/formula card, then theory/history; deep only if there is real content). The first easy card must let anyone grasp the core, even if incomplete (say so); simple cards always go to easy → round 5 variants → 6 facts. One `<style>`, one `<script>`, no libraries, own `--tint`.
2. Texts in `tools/og.py`, run `python3 tools/og.py` (macOS).
3. Set `level` only after the page is written: read its hero, puzzle and rounds 1–4 with chart captions (skip the formula card, "Підтеорія"/"Трохи теорії" blocks and round 5) and take the hardest thing a reader must follow there. Anchors: 1 for everyone = arithmetic and logic only (bridge-and-torch, pirates-gold, survivorship-bias); 2 school maths = fractions, %, simple probability, powers, roots, school geometry (monty-hall, poisoned-wine, rope-around-earth); 3 advanced = E[·], variance/SD, correlation, distributions/densities, logarithms, harmonic sums, series, integrals (friendship-paradox, berkson-paradox, inspection-paradox). A simple idea with an E[d²]/E[d] hero or a CV chart is still 3. Say which level you chose and why when reporting the new problem.
4. `python3 build.py`.

`meta.json` needs `published` and `updated` (YYYY-MM-DD) and `topics` (home-page filter keys from `TOPICS` in build.py) and `level` (1 for everyone, 2 school maths, 3 advanced: how much maths the main path through round 4 shows, charts included; the optional formula card and round 5 don't count; not how tricky it is), plus `poll` (which round-1 answers are right, for the answer stats; the page calls `mpSolve(guessed)`); bump `updated` after a real edit. They feed JSON-LD, sitemap and the RSS (`docs/feed.xml`, `docs/en/feed.xml`), whose items use only `share`, never `description`.

Optional `sim.js` + `sim.py` in a problem folder (always both): the round-3 simulation in a few lines with no libraries, comments and printed words as `⟨uk|en⟩`; the build adds a folded "Check it yourself in code" block (sp-after) to round 3. Run both language versions in node and python before shipping (README «Код симуляції для розробників»).

## Glossary

`glossary/` is a sub-site of terms (see README «Словник»): `terms.json` (word forms per language, one-line definition, a hook that is a small paradox, never a site puzzle's answer) and one article per `glossary/<page>/` with a simulation in the same spirit as the problems. The build underlines the first mention of each term in rounds 4–5 of every problem page. New terms need all word forms (Ukrainian cases) and verified maths like any problem.

## Courses

`courses/` holds themed paths for one audience (see README «Курси»): `courses/<name>/page.html` + `meta.json` (`audience`, `level`, `chapters` with the catalogue `problems` each chapter sends to). A course tells one story in chapters, adapts classic problems to the audience's world in short interactive cases, and links to catalogue problems (`<!--PROBLEM:slug-->`, `{{P:slug}}`) and glossary terms (`<!--TERMS:…-->`, auto-linked first mentions); it ends with a checklist. Never duplicate a catalogue problem as a new problem for a course: adapt it as a case and link the classic page. Takeaways that state a linked problem's answer go in `<div class="cs-after" data-after="slug">`. Every chapter opens its interactive part with a guess-first `.cs-quiz` that calls `mpCourseDone(chapterId)`; takeaways that depend on it go in `cs-after` with `data-after-ch`. Difficulty rises by parts (`part` in meta.json), parts end with a bridge, later chapters link back to the examples they reuse, and `needs` lists a chapter's real prerequisites (the build shows a «not done yet» note with links). Cases need verified maths like problems. The build adds the home-page "Courses" block, `/courses/`, and a "Course … · chapter k of N" grey line on each problem a course uses. OG image: an entry `course-<name>` in `tools/og.py`. `order` in meta.json is not the date added: whenever a course is added or changes, re-rank all courses (renumber their `order`) by grouping (related courses side by side), a logical sequence (foundations before the courses that build on them, general audiences before narrow ones) and, once stats exist, popularity (`course-<name>` `open` counts); say the new order in the report.

## Checks before commit

`python3 tools/check.py` automates all but the browser check (CI runs it on every PR and push to main):

- build succeeds; `node --check` on every inline script of the uk and en builds and the hub;
- uk build has 0 `class="en"`, en build has 0 `class="uk"`;
- no horizontal scroll at 375px, no console errors (look at it in a browser via a local server);
- titles ≤ ~70 chars, descriptions ≤ 160.
