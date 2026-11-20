// «Try it yourself»: the birthday paradox in your own group chat. No threshold on screen or in the voice.
import { makeShort } from './beats.mjs';

const chat = [
  { text: 'Anna · 12 March' }, { text: 'Max · 3 July' }, { text: 'Olena · 28 Sept' },
  { text: 'Tom · 9 Jan' }, { text: 'Ira · 3 July', hi: true }, { text: 'Leo · 17 Nov' },
];

export default makeShort({
  format: 'try',
  intro: 'Your group chat',
  url: 'mathparadoxes.com/birthday',
  cover: { beat: 1, hook: 'Two people, *one birthday*?' },
  beats: [
    { say: 'Open your biggest group chat. Work, school, family, your football team.',
      show: { title: 'Open your biggest group chat.', sub: 'Work, school, family, the team.' } },
    { say: 'Collect everyone’s birthday. Is there a pair born on the same day?',
      show: { title: 'Any two born on the same day?', visual: { kind: 'icons', icon: 'bubble', items: chat, cols: 1, cellH: 120, scale: 1.4 } } },
    { say: 'Feels unlikely. A year has three hundred sixty-five days, after all.',
      show: { stat: '365', label: 'days in a year' } },
    { say: 'Before you check, guess: how big must a group be before a shared birthday is more likely than not?',
      show: { question: 'How big must a group be before a shared birthday is more likely than not?', countdown: true } },
    { say: 'Write in the comments: how many people, and did you find a match? The answer and a simulation are on our site, link in the profile.',
      show: { end: 'Chat size? Match or no match?', play: 'Post yours, then check the maths:' } },
  ],
});
