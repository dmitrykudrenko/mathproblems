// «What visitors chose»: first answers to round 1 of problems/hundred-prisoners (a 0–100% slider), grouped into the
// short's four options, from the stats worker on 2026-11-15: 0.05 | 7.6 | 25, 30×2 | 50.1 | 77.5×3, 100×3.
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'poll',
  intro: '100 prisoners: the vote',
  url: 'mathparadoxes.com/hundred-prisoners',
  cover: { beat: 2, hook: 'How *12 visitors* guessed' },
  beats: [
    { say: 'A hundred prisoners, a hundred boxes, each may open fifty. All go free only if every one finds their own number.',
      show: { title: '100 prisoners, 100 boxes, 50 tries each.', sub: 'All go free only if every one succeeds.' } },
    { say: 'With the best strategy, what are the odds they all go free?',
      show: { question: 'With the best strategy, what are the odds they all go free?', options: ['≈ 0%', 'up to 15%', '15–45%', 'over 45%'], countdown: true } },
    { say: 'Our first twelve visitors guessed like this.',
      show: { bars: [{ label: '≈ 0%', n: 1 }, { label: 'up to 15%', n: 1 }, { label: '15–45%', n: 3 }, { label: 'over 45%', n: 7 }], note: 'First 12 answers on mathparadoxes.com, 15 Nov 2026' } },
    { say: 'More than half went high. Were they right? Guess on the site and run ten thousand prisons. The link is on screen.',
      show: { end: 'Most went high. Were they right?', play: 'Guess, then run 10,000 prisons:' } },
  ],
});
