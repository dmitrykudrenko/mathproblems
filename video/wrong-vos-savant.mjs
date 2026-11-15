// «Most people get this wrong»: Marilyn vos Savant's 1990 Parade column, ~10,000 letters, nearly 1,000 from PhDs
// (problems/monty-hall). Does not say who was right.
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'wrong',
  intro: '10,000 angry letters',
  url: 'mathparadoxes.com/monty-hall',
  cover: { beat: 1, hook: '*10,000* letters said she was wrong' },
  beats: [
    { say: 'In nineteen ninety, Marilyn vos Savant, then listed for the highest IQ in the Guinness Book, answered a puzzle in Parade magazine.',
      show: { title: '1990, Parade magazine', sub: 'Marilyn vos Savant answers a reader’s puzzle.' } },
    { say: 'About ten thousand readers wrote back to say she was wrong. Nearly a thousand of them had PhDs.',
      show: { compare: [{ value: '≈10,000', label: 'letters: “you’re wrong”' }, { value: '≈1,000', label: 'from PhDs', color: 'accent' }] } },
    { say: 'The puzzle: three doors, a car behind one. You pick a door. The host, who knows where the car is, opens another one with a goat. Should you switch?',
      show: { question: 'Three doors, one car. The host opens a goat door and offers a switch. Do you take it?', options: ['Stay', 'Switch', 'No difference'], countdown: true } },
    { say: 'Who was right: her, or the thousand PhDs? Vote in the comments, then play ten thousand games on the site. The link is on screen.',
      show: { end: 'Her, or the thousand PhDs?', play: 'Play it and run 10,000 games:' } },
  ],
});
