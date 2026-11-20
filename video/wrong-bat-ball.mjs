// «Most people get this wrong»: the bat and the ball (problems/cognitive-reflection; Frederick 2005).
// The site gives no percentage, so neither does the short. Never says the answer.
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'wrong',
  intro: 'The bat and the ball',
  url: 'mathparadoxes.com/cognitive-reflection',
  cover: { beat: 0, hook: 'You have *10 seconds*', crop: [800, 1480], at: .9 },
  beats: [
    { say: 'Ten seconds. A bat and a ball cost one dollar ten in total. The bat costs one dollar more than the ball.',
      show: { title: 'A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball.', size: 58,
        visual: { kind: 'icons', items: [{ label: 'bat' }, { label: 'ball' }], cellH: 420, scale: 1.4, mixed: ['bat', 'ball'] } } },
    { say: 'How much is the ball?',
      show: { question: 'How much is the ball?', options: ['10¢', '5¢', '1¢', '15¢'], countdown: true } },
    { say: 'Even at MIT, Harvard and Princeton, many students give the fast answer. And the fast answer is wrong.',
      show: { title: 'Even at MIT, Harvard and Princeton, many give the fast answer.', sub: 'Frederick, Journal of Economic Perspectives, 2005' } },
    { say: 'Check yours: is the bat really a dollar more? Answer in the comments. The full test is on our site, link in the profile.',
      show: { end: 'Is the bat really $1.00 more?', play: 'The full three-question test:' } },
  ],
});
