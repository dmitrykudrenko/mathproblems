# Shorts plan

English first: YouTube [@mathparadoxes](https://www.youtube.com/@mathparadoxes) (channel with a Ukrainian translation) and TikTok [@mathparadoxes](https://www.tiktok.com/@mathparadoxes); Instagram once its review clears. Ukrainian versions (Telegram t.me/mathparadoxes, UA accounts) come later.

## Rhythm

- Three shorts on the first day, so a profile visitor sees a channel, not one clip; then one a day.
- YouTube: upload ahead and schedule. TikTok: at most two a day while the account is new.
- Post around 13:00–18:00 Lisbon (8:00–13:00 US Eastern).
- After two weeks: keep the hooks and problems with the best watch-to-end rate and comments, make more like them.

## How a problem gets picked for the next short

1. **Level 1–2** (CLAUDE.md anchors): arithmetic, simple probability, a picture. Level 3 only for a famous name (100 prisoners, German tank).
2. **Known name people search for** ("… explained", "… paradox"): Shorts are searchable.
3. **One picture carries the hint** in 35–55 s: a rope round the Earth, a coin rolling round a coin, a square that goes missing.
4. **People get it wrong on the site**: answer stats from `stats/` (right / all). Small numbers are a hint, not a fact; never put a percentage on screen until a problem has 100+ answers.
5. **Splits the comments**: two-children, Sleeping Beauty, Monty Hall.

## Queue

Answer stats as of 2026-11-15 (right / answers): tiny samples, only a direction.

| # | Problem | Level | Site stats | Why |
|---|---|---|---|---|
| ✓ | monty-hall | 2 | 4/6 | the classic, splits comments |
| ✓ | birthday | 2 | 0/5 | famous, everyone wrong so far |
| ✓ | hundred-prisoners | 3 | 2/12 | famous, most answered after Simpson |
| ✓ | duckweed-lake | 2 | 2/6 | school-level, quick |
| ✓ | simpson-paradox | 2 | 15/16 | famous name, real medical data |
| 1 | rope-around-earth | 2 | 0/4 | one picture, nobody right so far |
| 2 | two-children | 2 | 0/5 | comment wars, nobody right so far |
| 3 | cognitive-reflection | 1 | – | bat and ball: the best-known wrong intuition |
| 4 | missing-square | 2 | 0/1 | purely visual |
| 5 | coin-rotation | 2 | 0/1 | purely visual, famous SAT question |
| 6 | potato-paradox | 2 | – | one line of arithmetic, big surprise |
| 7 | survivorship-bias | 1 | 0/1 | Wald's planes, an iconic picture |
| 8 | secretary-problem | 2 | 0/3 | "the 37% rule" is a searchable hook |
| 9 | false-positive | 2 | 3/4 | everyday relevance (medical tests) |
| 10 | hilbert-hotel | 1 | 1/1 | infinity, easy to draw |

Next: coin-streaks, german-tank-problem, inspection-paradox, braess-paradox, sleeping-beauty, two-envelopes, zeno-paradox, st-petersburg-paradox, bridge-and-torch, pirates-gold. Leave the A/B-testing and auction pages (ab-test, multiple-testing, revenue-equivalence, ergodicity) for LinkedIn and courses: too much to fit in 50 s.

## Published

| Short | YouTube | TikTok |
|---|---|---|
| monty-hall | [FdN56yiHgYU](https://youtube.com/shorts/FdN56yiHgYU), 2026-11-15 | 2026-11-15 |
| birthday | [KkCBrfnris0](https://youtube.com/shorts/KkCBrfnris0), 2026-11-15 | 2026-11-15 |
| hundred-prisoners | [6EewRMW1mJk](https://youtube.com/shorts/6EewRMW1mJk), 2026-11-15 | 2026-11-15 |
| duckweed-lake | [s-s07-Y8zSo](https://youtube.com/shorts/s-s07-Y8zSo), scheduled 2026-11-16 17:00 Lisbon | scheduled 2026-11-16 17:00 |
| simpson-paradox | scheduled 2026-11-17 17:00 Lisbon | scheduled 2026-11-17 17:00 |

Covers (`cover.mjs`) are on TikTok. YouTube takes custom covers only after the channel is verified by phone (the same step makes description links clickable): upload them then.

## Formats around the puzzles

Besides the puzzle shorts (question → options → pause → hint), six more formats, built with `beats.mjs` (a short is a list of spoken lines with what the screen shows) and `visuals.mjs` (animated pictures: dots, a map, a doubling tower, icons, a stack, a histogram). Each format has its own colour and kicker, and with the puzzles each is a series (`series.mjs`): its own deep background and label (PUZZLE, MOST GET IT WRONG, GLOSSARY, TRUE STORY, TRY IT, COSTLY MISTAKE, THE VOTE) on the sting and the cover.

| Format | Kicker | What it does | Ends with |
|---|---|---|---|
| wrong | MOST PEOPLE GET THIS WRONG | a sourced figure of how many get it wrong, then the question | the guess in the comments |
| word | ONE WORD, 40 SECONDS | a glossary hook, why, where it hits you; gives the full payoff | a question for the comments |
| story | A TRUE STORY | a real story with its numbers | «how did they do it?» → the page |
| try | TRY IT YOURSELF | a real-world experiment | «post your result» |
| cost | A COSTLY MISTAKE | a case where the wrong number cost money or harm | «what did yours cost?» |
| poll | WHAT VISITORS CHOSE | real first votes from the site, none marked right | waits for 100+ answers per problem (`later/`) |

Rules: facts only from the site with its source on screen; never a site puzzle's answer; simulations say they are simulations; the first line is the most surprising fact (no dates first); end with the comments and «link in the profile», since links in Shorts are not clickable; 25–45 s.

## Queue: formats (English), one a day at 17:00 Lisbon

Status 2026-11-16. The YouTube channel is phone-verified (2026-11-16): no ~10-a-day upload cap, and every YouTube short has its custom cover from `out/<id>-en-cover.png`. Links in Shorts descriptions are never clickable on YouTube; the clickable path to the site is the channel header link. TikTok schedules at most 10 days ahead. Titles, descriptions, tags and TikTok captions for every short are in `captions.json`.

| Date | Short | YouTube | TikTok |
|---|---|---|---|
| 11-18 | story-german-tanks | scheduled, cover | scheduled, cover |
| 11-19 | word-mean | scheduled, cover | scheduled, cover |
| 11-20 | cost-pill-scare | scheduled, cover | scheduled, cover |
| 11-21 | wrong-vos-savant | scheduled, cover | scheduled, cover |
| 11-22 | word-logarithm | scheduled, cover | scheduled, cover |
| 11-23 | wrong-mammography | scheduled, cover | scheduled, cover |
| 11-24 | story-literary-digest | scheduled, cover | scheduled, cover |
| 11-25 | wrong-bat-ball | scheduled, cover | scheduled, cover |
| 11-26 | word-combinatorics | scheduled, cover | scheduled, cover |
| 11-27 | story-london-bombs | scheduled, cover | scheduled, cover |
| 11-28 | try-birthday-chat | scheduled, cover | from 11-18 |
| 11-29 | try-xkcd-tanks | scheduled, cover | from 11-19 |
| 11-30 | try-monty-cups | scheduled, cover | from 11-20 |
| 12-01 | cost-ab-power | scheduled, cover | from 11-21 (also LinkedIn) |
| 12-02 | cost-holdout | scheduled, cover | from 11-22 (also LinkedIn) |

Two shorts about one problem stay at least a week apart (birthday 11-15 / 11-28, Monty Hall 11-15 / 11-21 / 11-30, tanks 11-18 / 11-29).

## Captions (English)

No answer anywhere: the title and description ask, the site answers. No emoji. The page link goes in the YouTube description (not clickable in Shorts, still read) and in the TikTok caption as text.

| Short | YouTube title | TikTok caption |
|---|---|---|
| monty-hall | The Monty Hall problem: would you switch? #shorts | Stay, switch, or no difference? Write your answer, then check it: mathparadoxes.com/monty-hall #math #probability #montyhall #puzzle |
| birthday | How many people until two share a birthday? #shorts | 23, 57, 183 or 253? Write your guess, then check it: mathparadoxes.com/birthday #math #probability #birthdayparadox #puzzle |
| hundred-prisoners | The 100 prisoners problem: what are the odds? #shorts | 100 prisoners, 100 boxes, 50 tries each. Almost zero, or better? Guess, then check: mathparadoxes.com/hundred-prisoners #math #probability #puzzle #riddle |
| duckweed-lake | One plant covers a lake in 30 days. Two plants? #shorts | One plant covers the lake in 30 days. How long for two? Guess, then check: mathparadoxes.com/duckweed-lake #math #puzzle #exponential #riddle |
| simpson-paradox | 78% or 83%: which treatment would you choose? #shorts | 78% or 83%, or not enough data? Pick one, then check: mathparadoxes.com/simpson-paradox #math #statistics #simpsonsparadox #data |

YouTube description: the question in one or two sentences, "Pause, guess, and write your answer in the comments.", then "Play it, simulate it and see why: https://mathparadoxes.com/<slug>", then 4–5 hashtags.
