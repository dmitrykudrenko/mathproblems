// «A true story»: the 1936 Literary Digest poll (glossary/sampling-bias: 10 million mailed, 2.4 million back,
// Landon 57% forecast, Roosevelt 60.8% and 46 of 48 states; Gallup ~50,000).
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'story',
  intro: 'The biggest poll ever, wrong',
  url: 'mathparadoxes.com/glossary/sampling-bias',
  cover: { beat: 2, hook: '*2.4 million* answers. Wrong.' },
  beats: [
    { say: 'Nineteen thirty-six. The magazine Literary Digest mails ten million ballots to Americans.',
      show: { stat: '10,000,000', label: 'ballots mailed, 1936' } },
    { say: 'Two point four million come back. Its forecast: Alf Landon wins with fifty-seven percent.',
      show: { compare: [{ value: '2.4M', label: 'ballots returned' }, { value: 'Landon 57%', label: 'the forecast', color: 'accent' }] } },
    { say: 'George Gallup asks about fifty thousand people. Almost fifty times fewer.',
      show: { stat: '≈50,000', label: 'people asked by George Gallup' } },
    { say: 'Election day: Franklin Roosevelt takes sixty point eight percent and forty-six of forty-eight states. Gallup named the right winner.',
      show: { compare: [{ value: '60.8%', label: 'Roosevelt' }, { value: '46 of 48', label: 'states', color: 'accent' }] } },
    { say: 'How do two million answers lose to fifty thousand? The answer is on the site. The link is on screen.',
      show: { end: '2.4 million vs 50,000. Why?', play: 'Who answers decides the result:' } },
  ],
});
