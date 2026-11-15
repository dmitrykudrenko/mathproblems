// «One word, 40 seconds»: the logarithm, from the glossary hook (glossary/logarithm: 0.1 mm sheet,
// Moon 384,400 km, 42 folds → 439,805 km; a real sheet folds about twelve times).
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'word',
  intro: 'The logarithm',
  url: 'mathparadoxes.com/glossary/logarithm',
  cover: { beat: 1, hook: 'Fold paper to *the Moon*?' },
  beats: [
    { say: 'Fold a sheet of paper in half forty-two times, and it would be thicker than the distance to the Moon.',
      show: { title: 'Fold a sheet of paper 42 times…', size: 84 } },
    { say: 'A sheet is a tenth of a millimetre. The Moon is three hundred eighty-four thousand kilometres away.',
      show: { compare: [{ value: '0.1 mm', label: 'one sheet' }, { value: '384,400 km', label: 'to the Moon', color: 'accent' }] } },
    { say: 'Every fold doubles the thickness. Two, four, eight, sixteen. Doubling gets huge fast.',
      show: { steps: ['1 fold: 0.2 mm', '10 folds: about 10 cm', '20 folds: about 100 m', '42 folds: past the Moon'] } },
    { say: 'The logarithm runs it backwards: how many doublings to get there? For the Moon, forty-two.',
      show: { stat: '42', label: 'doublings: log₂ of the distance in sheets' } },
    { say: 'In reality a sheet folds about twelve times. But the logarithm is why big numbers are closer than they look.',
      show: { title: 'Big numbers are fewer steps away than they look.' } },
    { say: 'Fold it yourself, on the site. The link is on screen.',
      show: { end: 'How many folds to the Sun?', play: 'Count the doublings:' } },
  ],
});
