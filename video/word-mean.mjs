// «One word, 40 seconds»: the mean, from the glossary's own hook (glossary/terms.json, median-vs-mean).
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'word',
  intro: 'The mean',
  url: 'mathparadoxes.com/glossary/median-vs-mean',
  cover: { beat: 1, hook: 'More legs than *average*?' },
  beats: [
    { say: 'Almost everyone has more legs than average.',
      show: { title: 'Almost everyone has more legs than average.', size: 84 } },
    { say: "Sounds wrong? Count them. Nobody has three legs, but some people have one, or none. So the average comes out a little under two.",
      show: { compare: [{ value: '2', label: 'legs: almost everyone' }, { value: '< 2', label: 'the average', color: 'accent' }] } },
    { say: 'The mean is the total, shared out equally. A few small values pull it down. A few huge ones pull it up.',
      show: { title: 'Mean = total ÷ count', sub: 'A few extreme values move it.' } },
    { say: 'A millionaire walks into a bar. The average income in the room shoots up. The median, the person in the middle, barely moves.',
      show: { title: 'A millionaire walks into a bar', compare: [{ value: 'mean', label: 'shoots up', color: 'accent' }, { value: 'median', label: 'barely moves' }] } },
    { say: 'So when the news says average salary, ask for the median. It sits much closer to what a typical person earns.',
      show: { title: 'Hear “average”? Ask for the median.' } },
    { say: 'Try it yourself: put a millionaire in the room and watch both numbers. The link is on screen.',
      show: { end: 'Mean or median: which one fooled you last?', play: 'Play with both in the glossary:' } },
  ],
});
