// «What visitors chose»: first answers to round 1 of problems/duckweed-lake (a 1–30 day slider), grouped by the
// page's zones, from the stats worker on 2026-11-15: 5 | 15×3 | – | 29×2.
import { makeShort } from '../beats.mjs';

export default makeShort({
  format: 'poll',
  intro: 'Duckweed: the vote',
  url: 'mathparadoxes.com/duckweed-lake',
  cover: { beat: 2, hook: 'How the *first visitors* guessed' },
  beats: [
    { say: 'Duckweed doubles every day. One plant covers a lake in thirty days. How long do two plants take?',
      show: { question: 'Duckweed doubles every day. One plant covers a lake in 30 days. How long do two plants take?', options: ['a few days', 'about 15', 'well under 30', 'almost 30'], countdown: true } },
    { say: 'Our first six visitors answered like this.',
      show: { bars: [{ label: 'a few days', n: 1 }, { label: 'about half of 30', n: 3 }, { label: 'well under 30', n: 0 }, { label: 'almost 30', n: 2 }], note: 'First 6 answers on mathparadoxes.com, 15 Nov 2026' } },
    { say: 'Half chose about fifteen. Were they right? Add your vote and watch the lake grow on the site. The link is on screen.',
      show: { end: 'Half said 15. Were they right?', play: 'Vote, then watch it grow:' } },
  ],
});
