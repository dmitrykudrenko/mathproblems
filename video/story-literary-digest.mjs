// «A true story»: the 1936 Literary Digest poll (glossary/sampling-bias: 10 million mailed, 2.4 million back,
// Landon 57% forecast, Roosevelt 60.8% and 46 of 48 states; Gallup ~50,000).
import { makeShort } from './beats.mjs';

const ballots = Array.from({ length: 12 }, (_, i) => ({ at: i * .15 }));

export default makeShort({
  format: 'story',
  intro: 'The biggest poll ever, wrong',
  url: 'mathparadoxes.com/glossary/sampling-bias',
  cover: { beat: 1, hook: '*2.4 million* answers. Wrong.' },
  beats: [
    { say: 'The biggest poll in history got the American election completely wrong.',
      show: { title: 'The biggest poll in history got it wrong.', size: 84 } },
    { say: 'Nineteen thirty-six. The magazine Literary Digest mails ten million ballots. Two point four million come back.',
      show: { title: '1936: 10 million ballots mailed', visual: { kind: 'icons', icon: 'envelope', items: ballots, cols: 4, cellH: 170, scale: .85, drop: true, counter: { to: 2400000, unit: 'came back' } } } },
    { say: 'Forecast: Alf Landon wins with fifty-seven percent. George Gallup asks just fifty thousand people and says Roosevelt.',
      show: { compare: [{ value: '2.4M', label: 'Digest: Landon 57%' }, { value: '50,000', label: 'Gallup: Roosevelt', color: 'accent' }] } },
    { say: 'Roosevelt takes sixty point eight percent and forty-six of forty-eight states.',
      show: { stat: '46 of 48', label: 'states for Roosevelt, 60.8% of the vote' } },
    { say: 'How do two million answers lose to fifty thousand? Your guess in the comments. The answer is on our site, link in the profile.',
      show: { end: '2.4 million vs 50,000. Why?', play: 'Who answers decides the result:' } },
  ],
});
