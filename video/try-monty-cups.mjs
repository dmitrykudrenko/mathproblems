// «Try it yourself»: Monty Hall with three cups and a friend (problems/monty-hall #real: 10 games staying,
// 10 switching). Asks for scores, never gives the answer.
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'try',
  intro: 'Three cups and a coin',
  url: 'mathparadoxes.com/monty-hall',
  cover: { beat: 1, hook: 'Three cups. *Ten* rounds each.' },
  beats: [
    { say: "The Monty Hall problem. Don't take anyone's word for it. Test it tonight with three cups, a coin and a friend.",
      show: { title: "Don't trust the answer. Test it.", size: 80 } },
    { say: 'Your friend hides the coin. You point at a cup. Your friend, who knows where the coin is, lifts another cup: empty. Now: stay, or switch?',
      show: { title: 'Stay, or switch?', visual: { kind: 'icons', icon: 'cup', items: [{ label: 'your pick', hi: true }, { label: '', lift: .55 }, { label: '', coin: true }], cols: 3, cellH: 420, scale: 1.2 } } },
    { say: 'Play ten rounds where you always stay, and ten where you always switch. Count your coins.',
      show: { compare: [{ value: '10', label: 'rounds: always stay' }, { value: '10', label: 'rounds: always switch', color: 'accent' }] } },
    { say: 'Post both scores in the comments. Then compare them with ten thousand games on our site, link in the profile.',
      show: { end: 'Stay: ? of 10\nSwitch: ? of 10', play: 'Post your scores, then run 10,000 games:' } },
  ],
});
