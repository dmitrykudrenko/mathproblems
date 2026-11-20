// «One word, 40 seconds»: the logarithm (glossary/logarithm: 0.1 mm sheet, Moon 384,400 km, 42 folds → 439,805 km).
// Landmarks: 2^k · 0.1 mm — 10: 102 mm, 23: 839 m (Eiffel Tower 330 m), 27: 13.4 km (Everest 8.8 km),
// 32: 429 km (ISS orbit ~400 km), 42: 439,805 km.
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'word',
  intro: 'The logarithm',
  url: 'mathparadoxes.com/glossary/logarithm',
  cover: { beat: 1, hook: 'Fold paper to *the Moon*?', crop: [560, 1560] },
  beats: [
    { say: 'Fold a sheet of paper in half forty-two times, and it would be thicker than the distance to the Moon.',
      show: { title: 'Fold a sheet of paper 42 times…', size: 84 } },
    { say: 'A sheet is a tenth of a millimetre, and every fold doubles it. Ten folds: ten centimetres. Twenty-three: taller than the Eiffel Tower. Twenty-seven: higher than Everest. Forty-two: past the Moon.',
      show: { visual: { kind: 'tower', max: 42, marks: [{ k: 10, label: '10 cm' }, { k: 23, label: 'taller than the Eiffel Tower' }, { k: 27, label: 'higher than Everest' }, { k: 32, label: 'past the space station' }, { k: 42, label: 'past the Moon' }] } } },
    { say: 'How many doublings does it take? That question is the logarithm. From one sheet to the Moon, forty-two.',
      show: { stat: '42', label: 'doublings from a sheet to the Moon: the logarithm' } },
    { say: 'That is why anything that keeps doubling, a virus, a debt, a rumour, gets huge in so few steps.',
      show: { title: 'Anything that doubles gets huge in very few steps.', sub: 'A virus. A debt. A rumour.' } },
    { say: 'How many folds to the Sun? Guess in the comments. Count the doublings on our site, link in the profile.',
      show: { end: 'How many folds to the Sun?', play: 'Count the doublings:' } },
  ],
});
