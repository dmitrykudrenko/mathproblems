# Video

Vertical shorts (1080×1920) in the site's style, rendered from code: no video AI, so numbers and pictures stay exact.

- `<scene>.mjs`: one video. `VOICE` holds the narration per language, `setTimeline()` fits the scenes to the spoken lines, `draw(ctx, t, lang)` paints a frame, `cues()` lists sound events. Shorts ask the question and give the page's hint, never the answer.
- `render.mjs`: `node render.mjs birthday all` writes `out/birthday-uk.mp4` and `out/birthday-en.mp4`; `--frames 3,16,27` writes stills for review.
- `voice.mjs`: a recording in `voice/<scene>-<lang>-<i>.(wav|m4a|mp3|aiff)` wins, then ElevenLabs (Dmytro's cloned voice; key and voice id in `.env`, see `.env.example`), then the macOS system voice as a timing placeholder. ElevenLabs clips are cached in `out/tts/` by text.
- `sound.mjs`: synthesised pad and UI sounds.

Setup: `npm install`, `brew install ffmpeg`. Fonts are the site's (OFL, licences in `fonts/`).
