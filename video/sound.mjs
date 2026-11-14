// Minimal sound design, synthesised: a quiet pad plus short UI sounds at the scene's cues.
// Returns a 16-bit stereo WAV buffer. No samples, no libraries.

const SR = 48000;

export function soundtrack(cues, duration) {
  const n = Math.round(duration * SR);
  const buf = new Float32Array(n);

  // pad: soft major-seventh chord, slow swell, fades at the end
  const chord = [130.81, 164.81, 196.0, 246.94];  // C3 E3 G3 B3
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 3) * Math.min(1, (duration - t) / 2.5);
    let s = 0;
    chord.forEach((f, k) => { s += Math.sin(2 * Math.PI * f * t + k) * (1 + .3 * Math.sin(2 * Math.PI * .1 * t + k)); });
    buf[i] += .022 * env * s;
  }

  let seed = 7;
  const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  const add = (t0, len, fn) => {
    const a = Math.round(t0 * SR), b = Math.min(n, a + Math.round(len * SR));
    for (let i = a; i < b; i++) buf[i] += fn((i - a) / SR);
  };
  const tone = (f, d, v) => t => v * Math.exp(-t / d) * Math.sin(2 * Math.PI * f * t) * Math.min(1, t * 400);

  const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5, 1567.98, 1760];
  for (const [t, kind, p = 0] of cues) {
    if (kind === 'tick') add(t, .35, tone(scale[p % scale.length], .08, .22));
    if (kind === 'pop') add(t, .4, t2 => tone(392 * 2 ** (p / 4), .09, .3)(t2) + tone(784 * 2 ** (p / 4), .05, .1)(t2));
    if (kind === 'beep') add(t, .5, tone(p ? 1046.5 : 659.25, p ? .18 : .1, .25));
    if (kind === 'pluck') add(t, .2, tone(1400 + 25 * p, .03, .05));
    if (kind === 'whoosh') {
      let lp = 0;
      add(t, .5, t2 => { lp += .08 * (noise() - lp); return lp * .5 * Math.sin(Math.PI * t2 / .5); });
    }
  }

  // soft limiter, then 16-bit stereo PCM
  const out = Buffer.alloc(44 + n * 4);
  out.write('RIFF', 0); out.writeUInt32LE(36 + n * 4, 4); out.write('WAVEfmt ', 8);
  out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
  out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34);
  out.write('data', 36); out.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.round(Math.tanh(buf[i] * 1.2) * 30000);
    out.writeInt16LE(v, 44 + i * 4); out.writeInt16LE(v, 46 + i * 4);
  }
  return out;
}
