// «A costly mistake»: the 1995 British pill scare (glossary absolute-vs-relative-risk, Gigerenzer et al. 2008;
// Furedi 1999). Relative risk without the absolute one.
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'cost',
  intro: 'The 1995 pill scare',
  url: 'mathparadoxes.com/glossary/absolute-vs-relative-risk',
  cover: { beat: 1, hook: 'Risk *doubled*. Panic?', crop: [700, 1320] },
  beats: [
    { say: 'A health warning in nineteen ninety-five led to thousands of extra abortions. Because of one missing number.',
      show: { title: 'One missing number. Thousands of abortions.', size: 80 } },
    { say: 'Britain. Doctors and newspapers get an urgent warning: the new contraceptive pills double the risk of blood clots.',
      show: { stat: '+100%', label: 'risk of blood clots on the new pills' } },
    { say: 'Many women simply stopped taking the pill. By one estimate, the next year brought about thirteen thousand more abortions in England and Wales.',
      show: { stat: '≈13,000', label: 'more abortions the next year', source: 'England and Wales · Furedi, Human Reproduction Update, 1999' } },
    { say: 'The missing number: out of seven thousand women, about one had a clot on the old pills. On the new ones, two. Can you even find them?',
      show: { title: '7,000 women', visual: { kind: 'dots', n: 7000, cols: 100, seed: 1995, marks: [{ count: 1, at: .35, label: '1 clot: old pills', color: 'ink' }, { count: 1, at: .7, label: '+1 clot: new pills' }] } } },
    { say: 'Doubled, yes. But one extra case in seven thousand. Always ask: out of how many? More on our site, link in the profile.',
      show: { end: '“Twice the risk.” Out of how many?', play: 'See both numbers side by side:' } },
  ],
});
