// «A costly mistake»: the 1995 British pill scare (glossary absolute-vs-relative-risk, Gigerenzer et al. 2008;
// Furedi 1999). Relative risk without the absolute one.
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'cost',
  intro: 'The 1995 pill scare',
  url: 'mathparadoxes.com/glossary/absolute-vs-relative-risk',
  cover: { beat: 1, hook: 'Risk *doubled*. Panic?' },
  beats: [
    { say: 'October 1995, Britain. An urgent warning goes to a hundred ninety thousand doctors and to the media.',
      show: { title: 'October 1995, Britain', sub: 'An urgent warning to 190,000 doctors and the press.' } },
    { say: 'The new contraceptive pills double the risk of blood clots. Plus one hundred percent.',
      show: { stat: '+100%', label: 'risk of blood clots on the new pills' } },
    { say: 'Many women simply stopped taking the pill. By one estimate, the next year brought about thirteen thousand more abortions in England and Wales.',
      show: { stat: '≈13,000', label: 'more abortions the next year, England and Wales', source: 'Furedi, Human Reproduction Update, 1999' } },
    { say: 'Here is the number nobody said out loud. About one woman in seven thousand had a clot on the old pills. On the new ones, two.',
      show: { compare: [{ value: '1', label: 'in 7,000: old pills' }, { value: '2', label: 'in 7,000: new pills', color: 'accent' }], source: 'Gigerenzer et al., Psychological Science in the Public Interest, 2008' } },
    { say: 'Doubled, yes. But one extra case in seven thousand. Always ask: out of how many?',
      show: { title: 'Plus 100%, or plus 1 in 7,000?', sub: 'Always ask: out of how many?' } },
    { say: 'Relative risk tells how strong an effect is. Absolute risk tells how much it matters to you. Play with both. The link is on screen.',
      show: { end: '“Twice the risk.” Out of how many?', play: 'See both numbers side by side:' } },
  ],
});
