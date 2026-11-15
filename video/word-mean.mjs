// «One word, 40 seconds»: the mean (glossary/median-vs-mean: some people have fewer than two legs, nobody more).
import { makeShort } from './beats.mjs';

const crowd = Array.from({ length: 10 }, (_, i) => ({ legs: i === 6 ? 1 : 2, hi: i === 6 }));

export default makeShort({
  format: 'word',
  intro: 'The mean',
  url: 'mathparadoxes.com/glossary/median-vs-mean',
  cover: { beat: 0, hook: 'More legs than *average*?', crop: [690, 1460], at: .9 },
  beats: [
    { say: 'Almost everyone has more legs than average.',
      show: { title: 'Almost everyone has more legs than average.', visual: { kind: 'icons', icon: 'person', items: crowd, cols: 5, cellH: 330, scale: 1.1 } } },
    { say: 'Nobody has three legs, but some people have one, or none. So the average is a little under two.',
      show: { compare: [{ value: '2', label: 'legs: almost everyone' }, { value: '< 2', label: 'the average', color: 'accent' }] } },
    { say: 'A millionaire walks into a bar. The average income in the room shoots up. The median, the person in the middle, barely moves.',
      show: { title: 'A millionaire walks into a bar', compare: [{ value: 'mean', label: 'shoots up', color: 'accent' }, { value: 'median', label: 'barely moves' }] } },
    { say: 'So when the news says average salary, ask for the median. It is much closer to what a typical person earns.',
      show: { title: 'Hear “average”? Ask for the median.', size: 80 } },
    { say: 'Which number did your last salary survey quote? Tell us in the comments. Try both on our site, link in the profile.',
      show: { end: 'Mean or median: which did they quote?', play: 'Put a millionaire in the room:' } },
  ],
});
