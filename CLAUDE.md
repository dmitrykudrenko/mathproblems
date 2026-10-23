# mathparadoxes.com

Bilingual (uk/en) interactive explainers of math puzzles where intuition is wrong. Static site, no dependencies: `python3 build.py` writes `docs/`, which GitHub Pages serves at https://mathparadoxes.com. README.md (Ukrainian) documents structure, spoilers, giscus, Claspo and SEO in detail.

## Rules

- **No spoilers.** The answer is hidden until the visitor guesses (`sp-before`/`sp-after`, `data-solve`, `mpSolve()`). `share` in meta.json and OG images ask the question, never answer it. Only `<title>`/description may contain the answer.
- **Both languages always.** Every visible text exists as `class="uk"` and `class="en"`; the build strips the other language.
- **Math must be verified** independently (exact calculation in Python, simulation in node) before shipping.
- Duckweed lake stays second on the home page (`order: 2`).
- Author name in English: Dmytro Kudrenko. Magenta (`--signal`) marks the counter-intuitive answer only.
- Commit `docs/` together with the sources. Never push half-finished problem folders.
- `~/Documents` is iCloud-synced: ignore/delete Finder duplicates like `index 3.html`, never `git add -A` blindly.

## New problem

1. `problems/<slug>/page.html`, `teaser.html`, `meta.json` — copy the skeleton of an existing page: hero → puzzle → round 1 guess → round 2 play → round 3 simulation → round 4 why (+ formula card) → round 5 variants → 6 facts. One `<style>`, one `<script>`, no libraries, own `--tint`.
2. Texts in `tools/og.py`, run `python3 tools/og.py` (macOS).
3. `python3 build.py`.

`meta.json` needs `published` and `updated` (YYYY-MM-DD); bump `updated` after a real edit. They feed JSON-LD, sitemap and the RSS (`docs/feed.xml`, `docs/en/feed.xml`), whose items use only `share`, never `description`.

## Checks before commit

- build succeeds; `node --check` on every inline script of the uk and en builds and the hub;
- uk build has 0 `class="en"`, en build has 0 `class="uk"`;
- no horizontal scroll at 375px, no console errors (look at it in a browser via a local server);
- titles ≤ ~70 chars, descriptions ≤ 160.
