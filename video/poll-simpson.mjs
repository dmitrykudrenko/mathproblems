// «What visitors chose»: real first answers to round 1 of problems/simpson-paradox, from the stats worker on
// 2026-11-15 (keys 0, 1, 2 = the three buttons). No option is marked right.
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'poll',
  intro: "Simpson's paradox: the vote",
  url: 'mathparadoxes.com/simpson-paradox',
  cover: { beat: 2, hook: 'The first *16* votes' },
  beats: [
    { say: 'We ask every visitor of our site to guess before they see the answer. Here is one of the puzzles.',
      show: { title: 'Guess first, then see the answer.' } },
    { say: 'Treatment A cures kidney stones in seventy-eight percent of cases, treatment B in eighty-three. Which would you choose for yourself?',
      show: { question: 'Treatment A cures kidney stones in 78% of cases, treatment B in 83%. Which do you choose?', options: ['A · open surgery', 'B · percutaneous', 'Not enough data'], countdown: true } },
    { say: 'The first sixteen visitors voted like this.',
      show: { bars: [{ label: 'open surgery', n: 14 }, { label: 'percutaneous', n: 1 }, { label: 'not enough data', n: 1 }], note: 'First 16 answers on mathparadoxes.com, 15 Nov 2026' } },
    { say: 'Was the crowd right? Add your vote on the site and see the data behind it. The link is on screen.',
      show: { end: 'Was the crowd right?', play: 'Vote, then see the split:' } },
  ],
});
