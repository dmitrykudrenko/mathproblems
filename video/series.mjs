// Every short belongs to a series: the puzzle shorts and the formats around them (beats.mjs). A series has its own
// deep background and label, shared by the intro sting (intro.mjs) and the cover (cover.mjs), so in a channel grid
// a puzzle, a word or a story can be told apart at a glance.
export const SERIES = {
  puzzle: { deep: '#141A30', light: '#A99BFF', label: { en: 'PUZZLE', uk: 'ЗАДАЧА' } },
  wrong:  { deep: '#5E1A10', light: '#FF8A73', label: { en: 'MOST GET IT WRONG', uk: 'БІЛЬШІСТЬ ПОМИЛЯЄТЬСЯ' } },
  word:   { deep: '#0A433D', light: '#5FD6C6', label: { en: 'GLOSSARY', uk: 'СЛОВНИК' } },
  story:  { deep: '#4A3000', light: '#F2B84B', label: { en: 'TRUE STORY', uk: 'ІСТОРІЯ' } },
  try:    { deep: '#1B420E', light: '#9BDB6F', label: { en: 'TRY IT', uk: 'ПЕРЕВІРТЕ' } },
  cost:   { deep: '#251863', light: '#B3A6FF', label: { en: 'COSTLY MISTAKE', uk: 'ДОРОГА ПОМИЛКА' } },
  poll:   { deep: '#11286B', light: '#8FA8FF', label: { en: 'THE VOTE', uk: 'ГОЛОСУВАННЯ' } },
};

// the series label as a pill: light fill, deep text
export function seriesLabel(ctx, series, lang, cx, cy, px) {
  const s = SERIES[series], t = s.label[lang] || s.label.en;
  ctx.save();
  ctx.font = `800 ${px}px Unbounded`;
  const w = ctx.measureText(t).width + px * 1.4, h = px * 1.9;
  ctx.fillStyle = s.light;
  ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2, w, h, h / 2); ctx.fill();
  ctx.fillStyle = s.deep; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(t, cx, cy + px * .06);
  ctx.restore();
}
