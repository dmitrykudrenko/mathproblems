// «A costly mistake»: twenty winning A/B tests add up to +49% in the report, the holdout shows about +7%
// (glossary holdout, the page's own simulation; Lee & Shen, Airbnb, KDD 2018; Kohavi, Tang, Xu 2020).
import { makeShort } from './beats.mjs';

const wins = [3.1, 2.4, 1.9, 3.6, 2.2, 1.7, 2.8, 2.5, 1.6, 3.3, 2.0, 2.7, 1.8, 2.9, 2.3, 3.0, 2.1, 2.6, 1.7, 2.8];   // sums to 49

export default makeShort({
  format: 'cost',
  intro: 'Twenty wins, one year',
  url: 'mathparadoxes.com/glossary/holdout',
  cover: { beat: 1, hook: '20 wins. *+49%*. Really?', crop: [600, 1500], at: .97 },
  beats: [
    { say: 'Picture a shop that runs A/B tests all year. Twenty ideas win. Each lift goes into the annual report.',
      show: { stat: '20', label: 'winning A/B tests in a year' } },
    { say: 'In our simulation the report adds up to plus forty-nine percent. But a small random group of customers saw none of the changes. Their difference: about seven.',
      show: { visual: { kind: 'stack', pieces: wins, total: 52, right: 7, leftLabel: 'the report', leftValue: '+49%', rightLabel: 'the holdout', rightValue: '≈+7%' } } },
    { say: 'Wins are picked when noise helps. Changes chase the same buyer. And novelty fades. A single test sees none of this.',
      show: { steps: ['Wins are picked when noise helps', 'Changes chase the same buyer', 'Novelty fades'] } },
    { say: 'What did your year of wins really add? Tell us in the comments. Simulate a year on our site, link in the profile.',
      show: { end: 'What did your year of wins really add?', play: 'Simulate a year of tests:' } },
  ],
});
