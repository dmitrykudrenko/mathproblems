// «A costly mistake»: a weak A/B test that wins exaggerates (glossary statistical-power: a real +10% shows up as
// +24%; Gelman & Carlin 2014 type M error).
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'cost',
  intro: 'The A/B test that lied',
  url: 'mathparadoxes.com/glossary/statistical-power',
  cover: { beat: 1, hook: 'The test said *+24%*' },
  beats: [
    { say: 'Your team runs an A/B test on a new button. It wins. The dashboard says plus twenty-four percent.',
      show: { stat: '+24%', label: 'the winning lift on the dashboard' } },
    { say: 'Champagne, a slide for the board, a forecast for next year. Built on plus twenty-four.',
      show: { title: 'The plan is built on +24%.' } },
    { say: "Now the truth: the button really is better. By ten percent.",
      show: { compare: [{ value: '+24%', label: 'on the dashboard' }, { value: '+10%', label: 'the real effect', color: 'accent' }] } },
    { say: 'A small test is noisy. It only calls a winner when noise happened to push the number up. So every win from a weak test exaggerates.',
      show: { title: 'A weak test wins only when noise helps.', sub: 'So its wins come out inflated.' } },
    { say: 'Trust the direction, not the number. And size the test before you run it.',
      show: { steps: ['Trust the direction, not the number', 'Expect the next test to show less', 'Size the test before you run it'] } },
    { say: 'Watch two thousand tests of the same button on the site. The link is on screen.',
      show: { end: 'How big was your last “win”, really?', play: '2,000 tests of one button:' } },
  ],
});
