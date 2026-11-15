// «A true story»: German tank output from serial numbers (problems/german-tank-problem #facts: Guardian 2006,
// 246 a month vs Speer's 245 vs intelligence ~1,400; Ruggles & Brodie, JASA 1947).
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'story',
  intro: 'Counting tanks by their numbers',
  url: 'mathparadoxes.com/german-tank-problem',
  cover: { beat: 2, hook: '*1,400* or 246 tanks a month?' },
  beats: [
    { say: 'Second World War. The Allies need to know how many tanks Germany builds every month.',
      show: { title: 'How many tanks does Germany build a month?' } },
    { say: 'Spies, aerial photos, interrogations. Conventional intelligence says: about fourteen hundred a month.',
      show: { stat: '≈1,400', label: 'a month: conventional intelligence' } },
    { say: 'Statisticians look at something else: the serial numbers on a few captured tanks. Their estimate: two hundred forty-six.',
      show: { stat: '246', label: 'a month: from serial numbers' } },
    { say: "After the war, the records of Speer's ministry are opened. The real figure: two hundred forty-five.",
      show: { compare: [{ value: '≈1,400', label: 'intelligence' }, { value: '246', label: 'serial numbers' }, { value: '245', label: 'the records', color: 'accent' }], source: 'The Guardian, 2006; Ruggles & Brodie, JASA, 1947' } },
    { say: 'How do a few serial numbers count a whole army? Try the method yourself on the site. The link is on screen.',
      show: { end: 'Four serial numbers. How many tanks?', play: 'Try the method yourself:' } },
  ],
});
