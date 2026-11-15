// «Most people get this wrong»: the bat and the ball (problems/cognitive-reflection; Frederick 2005).
// The site gives no percentage, so neither does the short. Never says the answer.
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'wrong',
  intro: 'The bat and the ball',
  url: 'mathparadoxes.com/cognitive-reflection',
  cover: { beat: 1, hook: 'Harvard students *miss* this' },
  beats: [
    { say: 'Even at MIT, Harvard and Princeton, many students get this one wrong. You have ten seconds.',
      show: { title: 'Even at MIT, Harvard and Princeton, many get this wrong.', sub: 'Frederick, Journal of Economic Perspectives, 2005' } },
    { say: 'A bat and a ball cost one dollar ten in total. The bat costs one dollar more than the ball. How much is the ball?',
      show: { question: 'A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much is the ball?', options: ['10¢', '5¢', '1¢', '15¢'], countdown: true } },
    { say: 'Got a number? Check it: does the bat really cost a dollar more?',
      show: { title: 'Check your number: is the bat really $1.00 more?', size: 70 } },
    { say: 'The fast answer feels right, and that is the trap. Write yours in the comments, then take the full three-question test on the site. The link is on screen.',
      show: { end: 'Your answer for the ball?', play: 'The full three-question test:' } },
  ],
});
