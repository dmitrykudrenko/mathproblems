// «Most people get this wrong»: Marilyn vos Savant's 1990 Parade column, ~10,000 letters, nearly 1,000 from PhDs
// (problems/monty-hall). Does not say who was right.
import { makeShort } from './beats.mjs';

const letters = Array.from({ length: 12 }, (_, i) => ({ at: i * .18, hi: i === 11 }));

export default makeShort({
  format: 'wrong',
  intro: '10,000 angry letters',
  url: 'mathparadoxes.com/monty-hall',
  cover: { beat: 0, hook: '*10,000* letters: you’re wrong' },
  beats: [
    { say: 'Ten thousand people wrote to tell her she was wrong. Nearly a thousand of them had PhDs.',
      show: { title: '“You are wrong.”', visual: { kind: 'icons', icon: 'envelope', items: letters, cols: 4, cellH: 190, scale: .9, drop: true, counter: { to: 10000, unit: 'letters' } } } },
    { say: 'Nineteen ninety. Marilyn vos Savant, listed in Guinness for the highest IQ, answers a puzzle in Parade magazine.',
      show: { title: '1990, Parade magazine', sub: 'Marilyn vos Savant, listed in Guinness for the highest IQ, answers a reader’s puzzle.' } },
    { say: 'Three doors, a car behind one. You pick a door. The host, who knows where the car is, opens another one with a goat. Should you switch?',
      show: { question: 'Three doors, one car. The host opens a goat door and offers a switch. Do you take it?', options: ['Stay', 'Switch', 'No difference'], countdown: true } },
    { say: 'Her, or the thousand PhDs? Vote in the comments. Ten thousand games are on our site, link in the profile.',
      show: { end: 'Her, or the thousand PhDs?', play: 'Play it and run 10,000 games:' } },
  ],
});
