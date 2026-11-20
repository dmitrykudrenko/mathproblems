// «One word, 40 seconds»: combinatorics (glossary/combinatorics: about 8·10^67 orders of a deck; 8 billion people
// shuffling every second since the Big Bang make about 3.5·10^27 shuffles; each card multiplies the orders).
import { makeShort } from './beats.mjs';

const hand = ['A♠', 'K♥', '7♦', '2♣', 'Q♠', '9♥', 'J♣', '4♦'].map((face, i) => ({ face, at: i * .12 }));

export default makeShort({
  format: 'word',
  intro: 'Combinatorics',
  url: 'mathparadoxes.com/glossary/combinatorics',
  cover: { beat: 0, hook: 'A deck *nobody* has ever seen', crop: [720, 1320], at: .9 },
  beats: [
    { say: 'Shuffle a deck of cards well. Its order has almost certainly never existed before in history.',
      show: { title: 'Your shuffled deck has never existed before.', visual: { kind: 'icons', icon: 'card', items: hand, cols: 4, cellH: 240, scale: 1 } } },
    { say: 'Each new card does not add orders, it multiplies them. Fifty-two times fifty-one times fifty times, and so on, down to one.',
      show: { title: '52 × 51 × 50 × … × 1', sub: 'Every card multiplies the number of orders.' } },
    { say: 'That is about eight followed by sixty-seven zeros.',
      show: { stat: '8 · 10⁶⁷', label: 'possible orders of one deck' } },
    { say: 'If all eight billion people had shuffled a deck every second since the Big Bang, they would have covered almost none of them.',
      show: { compare: [{ value: '3.5 · 10²⁷', label: 'shuffles since the Big Bang' }, { value: '8 · 10⁶⁷', label: 'orders', color: 'accent' }] } },
    { say: 'Counting arrangements like this is combinatorics. How many cards before the age of the universe is not enough? Guess in the comments. Link in the profile.',
      show: { end: 'How many cards are enough to beat the universe?', play: 'Add cards one by one:' } },
  ],
});
