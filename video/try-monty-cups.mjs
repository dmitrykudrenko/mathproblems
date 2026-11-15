// «Try it yourself»: Monty Hall with three cups and a friend. Asks for scores, never gives the answer.
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'try',
  intro: 'Three cups and a coin',
  url: 'mathparadoxes.com/monty-hall',
  cover: { beat: 1, hook: 'Three cups. *Ten* rounds each.' },
  beats: [
    { say: "You've heard of the Monty Hall problem. Don't take anyone's word for it. Test it tonight.",
      show: { title: "Don't trust the answer. Test it.", size: 80 } },
    { say: 'You need three cups, a coin and a friend.',
      show: { compare: [{ value: '3', label: 'cups' }, { value: '1', label: 'coin' }, { value: '1', label: 'friend', color: 'accent' }] } },
    { say: 'Your friend hides the coin under one cup. You point at a cup. Your friend, who knows where the coin is, lifts one of the other cups: it is empty. Now you choose: stay or switch.',
      show: { steps: ['Friend hides the coin', 'You point at a cup', 'Friend lifts an empty one', 'Stay or switch?'] } },
    { say: 'Play ten rounds where you always stay, and ten where you always switch. Count your coins.',
      show: { compare: [{ value: '10', label: 'rounds: always stay' }, { value: '10', label: 'rounds: always switch', color: 'accent' }] } },
    { say: 'Write both scores in the comments. Then compare them with ten thousand games on the site. The link is on screen.',
      show: { end: 'Stay: ? of 10\nSwitch: ? of 10', play: 'Post your scores, then run 10,000 games:' } },
  ],
});
