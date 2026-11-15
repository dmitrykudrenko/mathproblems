// «A costly mistake»: twenty winning A/B tests add up to +49% in the report, the holdout shows about +7%
// (glossary holdout; Lee & Shen, Airbnb, KDD 2018).
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'cost',
  intro: 'Twenty wins, one year',
  url: 'mathparadoxes.com/glossary/holdout',
  cover: { beat: 1, hook: '20 wins. *+49%*. Really?' },
  beats: [
    { say: 'A shop runs A/B tests all year. Twenty ideas win. Each lift goes into the annual report.',
      show: { stat: '20', label: 'winning A/B tests in a year' } },
    { say: 'Add them up: about plus forty-nine percent. A great year.',
      show: { stat: '+49%', label: 'the sum in the annual report' } },
    { say: 'But a small random group of customers saw none of the changes all year. Compare them with everyone else.',
      show: { title: 'The holdout group', sub: 'A small random share that saw none of the changes.' } },
    { say: 'The real difference: about seven percent.',
      show: { compare: [{ value: '+49%', label: 'the report' }, { value: '≈+7%', label: 'the holdout', color: 'accent' }] } },
    { say: 'Wins are picked when noise helps. Changes chase the same buyer. And novelty fades. A single test sees none of this.',
      show: { steps: ['Wins are picked when noise helps', 'Changes chase the same buyer', 'Novelty fades'] } },
    { say: 'Run a year of tests yourself on the site. The link is on screen.',
      show: { end: 'What did your year of wins really add?', play: 'Simulate a year of tests:' } },
  ],
});
