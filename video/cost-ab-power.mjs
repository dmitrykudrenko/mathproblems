// «A costly mistake»: a weak A/B test that wins exaggerates (glossary statistical-power: a real +10% shows up as
// +24%; Gelman & Carlin 2014). The histogram is a schematic of the page's simulation: lifts spread around the true
// +10%, wins only past the significance bar; their mean is about +23% with this spread.
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'cost',
  intro: 'The A/B test that lied',
  url: 'mathparadoxes.com/glossary/statistical-power',
  cover: { beat: 2, hook: 'The test said *+24%*', crop: [600, 1420], at: .95 },
  beats: [
    { say: 'Your A/B test wins. The dashboard says plus twenty-four percent. The plan for next year is built on it.',
      show: { stat: '+24%', label: 'the winning lift on the dashboard' } },
    { say: 'In our simulation we know the truth: the new button is better by ten percent. Not twenty-four.',
      show: { compare: [{ value: '+24%', label: 'on the dashboard' }, { value: '+10%', label: 'the real effect', color: 'accent' }] } },
    { say: 'Run the same small test two thousand times. Results scatter around plus ten. A test calls a winner only past the bar, when noise happened to help. So the wins come out inflated.',
      show: { title: 'The same test, 2,000 times', visual: { kind: 'histogram', from: -15, to: 45, mean: 10, sd: 9, bar: 18, winMean: 23, meanLabel: 'true +10%', barLabel: 'the bar', winLabel: 'wins ≈ +24%', axis: 'lift shown on the dashboard' } } },
    { say: 'Trust the direction, not the number. Expect the next test to show less. And size the test before you run it.',
      show: { steps: ['Trust the direction, not the number', 'Expect the next test to show less', 'Size the test before you run it'] } },
    { say: 'How big was your last win, really? Tell us in the comments. Run two thousand tests on our site, link in the profile.',
      show: { end: 'How big was your last “win”, really?', play: '2,000 tests of one button:' } },
  ],
});
