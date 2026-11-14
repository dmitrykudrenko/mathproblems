// Narration clips, one per VOICE line, in this order of preference:
// 1. a recording in voice/<scene>-<lang>-<i>.(wav|m4a|mp3|aiff);
// 2. ElevenLabs, when the environment, video/.env or ~/.config/mathparadoxes/video.env (shared by
//    all worktrees) has ELEVENLABS_API_KEY and a voice id
//    for the language (ELEVENLABS_VOICE_UK / ELEVENLABS_VOICE_EN); clips are cached by text;
// 3. the macOS system voice, a placeholder for checking the timing only.
import { execFileSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';

const SYSTEM = { uk: 'Lesya', en: 'Samantha' };
const MODEL = 'eleven_multilingual_v2';

const duration = f => Number(execFileSync('ffprobe',
  ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());

function env(dir) {
  const e = { ...process.env };
  for (const f of [`${dir}/.env`, `${os.homedir()}/.config/mathparadoxes/video.env`])
    if (fs.existsSync(f))
      for (const l of fs.readFileSync(f, 'utf8').split('\n')) {
        const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
        if (m && m[2] && !e[m[1]]) e[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
  return e;
}

async function eleven(key, voiceId, text, prev, next, file) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({
      text, model_id: MODEL,
      previous_text: prev, next_text: next,   // keeps intonation continuous across lines
      voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true },
    }),
  });
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 300)}`);
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
}

export async function clips(dir, name, lang, lines) {
  fs.mkdirSync(`${dir}/out/tts`, { recursive: true });
  const E = env(dir), key = E.ELEVENLABS_API_KEY, voiceId = E[`ELEVENLABS_VOICE_${lang.toUpperCase()}`];
  const out = [];
  for (const [i, line] of lines.entries()) {
    const base = `${dir}/voice/${name}-${lang}-${i}`;
    let file = ['wav', 'm4a', 'mp3', 'aiff'].map(e => `${base}.${e}`).find(f => fs.existsSync(f));
    let source = 'recorded';
    if (!file && key && voiceId) {
      const h = crypto.createHash('sha1').update([MODEL, voiceId, line].join('|')).digest('hex').slice(0, 10);
      file = `${dir}/out/tts/${name}-${lang}-${i}-${h}.mp3`;
      if (!fs.existsSync(file)) await eleven(key, voiceId, line, lines[i - 1] || '', lines[i + 1] || '', file);
      source = 'elevenlabs';
    }
    if (!file) {
      file = `${dir}/out/tts/${name}-${lang}-${i}.aiff`;
      execFileSync('say', ['-v', SYSTEM[lang], '-o', file, line]);
      source = 'system';
    }
    out.push({ file, dur: duration(file), source });
  }
  return out;
}
