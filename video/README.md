# Video

Vertical shorts (1080×1920, 30 fps, uk + en) in the site's style, rendered from code: no video AI, so numbers and pictures stay exact. One file per video, the same renderer, sound, voice and intro for all.

## Files

- `<slug>.mjs`: one video. `INTRO` (title and colour for the sting), `VOICE` (narration per language), `setTimeline(d)` (fits the scenes to the spoken lines, `d[i]` = length of line i), `draw(ctx, t, lang)` (paints a frame), `cues()` (sound events). `birthday.mjs` is the skeleton to copy; `monty-hall`, `simpson-paradox`, `hundred-prisoners` and `duckweed-lake` show other signature objects and phrase options.
- `lib.mjs`: shared pieces: background in the problem's colour, kicker, answer cards (numbers or short phrases), the guess countdown, the end card (long links shrink to fit), easing and sound cues.
- `series.mjs`: the series every short belongs to (puzzle, wrong, word, story, try, cost, poll): its deep colour and its label (PUZZLE, MOST GET IT WRONG, GLOSSARY, TRUE STORY, TRY IT, COSTLY MISTAKE, THE VOTE), shared by the sting and the cover so the series tell apart in a grid. A puzzle short is `puzzle` unless its `INTRO.series` says otherwise.
- `intro.mjs`: 0.75 s branded sting before every short: the three-doors mark from `brand/`, the site name and the series label on the series' colour, already drawn on the first frame (the scroll-or-stay moment and the default cover), then the panel lifts off the first scene. No title: it would not be read in under a second.
- `cover.mjs`: `node cover.mjs <slug> all` writes `out/<slug>-<lang>-cover.png`, the cover for the channel grid and TikTok profile: the series' colour and label, the lockup, a short hook in big type (*starred* words in the problem's colour), a real frame of the short on a card, the «?» badge. Each scene's `COVER` sets the frame time, the rows to show and the hook in both languages; hooks ask, never answer.
- `beats.mjs` + `visuals.mjs`: shorts in the formats around the puzzles (PLAN.md «Formats»): a file like `word-mean.mjs` is `export default makeShort({ format, intro, url, cover, beats: [{ say, show }] })`, one spoken line per beat and what the screen shows (title, stat, compare, question, steps, end, and an animated `visual`). Parked shorts live in `later/`.
- `footage.mjs`: film footage for a beat (`show.clip`, the `movie` format, MOVIE MATHS): a few seconds of an official trailer, letterbox bars cropped, cut to the vertical frame, played and then held darkened under our own picture. Pictures only, never the trailer's sound. Trailers go in `footage/` (git-ignored, not ours); pick shots from a contact sheet (`ffmpeg … tile=6x6`) and cut points from scene detection (`select='gt(scene,0.3)'`). `movie-hunger-games.mjs` is the example.
- `render.mjs`: `node render.mjs <slug> all` writes `out/<slug>-uk.mp4` and `out/<slug>-en.mp4`; `node render.mjs <slug> uk --frames 3,16,27` writes stills for review.
- `voice.mjs`: a recording in `voice/<slug>-<lang>-<i>.(wav|m4a|mp3|aiff)` wins, then ElevenLabs (Dmytro's cloned voice), then the macOS system voice as a timing placeholder. ElevenLabs clips are cached in `out/tts/` by text, so re-renders are free and an edited line costs one call.
- `sound.mjs`: synthesised pad and UI sounds (`tick`, `pop`, `beep`, `pluck`, `chime`, `whoosh`).
- `voice-clone-script.md`: the text Dmytro read for the voice clone.

## Setup

`npm install` in `video/`, `brew install ffmpeg`. The ElevenLabs key and voice id live in `~/.config/mathparadoxes/video.env` (shared by every worktree, never in git; format in `.env.example`). Fonts are the site's (OFL, licences in `fonts/`).

## New video

1. Read the problem's `page.html` and `meta.json` (`share`, `hints`, round 1 options). The short follows: hook (1 line) → the question in `share` words → the round-1 options → «pause and guess» with a silent 4 s countdown → the page's own hint, animated → end card: question, options, «answer in the comments», the page URL on screen (English is the root, `mathparadoxes.com/<slug>`; Ukrainian is `mathparadoxes.com/uk/<slug>`). 35–55 s.
2. Copy `birthday.mjs` to `<slug>.mjs`. Set `INTRO.title` (the problem's name, uk/en) and `INTRO.tint` (a saturated version of the page's `--tint`, readable on ink), the colours `C` from the page's `:root`, and the full-frame background gradient from its tint, so each video has its own colour.
3. Write `VOICE` in both languages: short spoken sentences, numbers in words, no web address (say «the link is on screen»). Draw the problem's signature object from the page, not stock shapes.
4. Render stills of every scene (`VOICE=draft node render.mjs <slug> uk --frames …`: system voice, no ElevenLabs calls while the text changes) in both languages and look at them: text inside 80–1000 px across and 230–1540 px down (Shorts/Reels/TikTok cover the rest), nothing cut off, English lines wrap.
5. Add `COVER` (a frame with the signature object, a hook of 2–6 words) and render the covers; look at them next to the others: one series, each in its own colour.
6. Render both mp4s, check `max_volume` stays below 0 dB, and send them to Dmytro: he checks the Ukrainian stress and the voice by ear. A wrong word: rephrase the line or record it into `voice/`.
