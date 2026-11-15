// «A true story»: German tank output from serial numbers (problems/german-tank-problem #facts: Guardian 2006,
// 246 a month vs Speer's 245 vs intelligence ~1,400; Ruggles & Brodie, JASA 1947). The serials shown are the
// page's own puzzle numbers; the estimate from them is not given.
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'story',
  intro: 'Counting tanks by their numbers',
  url: 'mathparadoxes.com/german-tank-problem',
  cover: { beat: 1, hook: '*1,400* or 246 tanks a month?' },
  beats: [
    { say: 'Intelligence said fourteen hundred tanks a month. Statisticians said two hundred forty-six. Who was right?',
      show: { compare: [{ value: '1,400', label: 'intelligence' }, { value: '246', label: 'statisticians', color: 'accent' }] } },
    { say: 'Second World War. The statisticians never saw a factory. Only the serial numbers on a few captured German tanks.',
      show: { title: 'They only had serial numbers', visual: { kind: 'icons', icon: 'tank', items: [{ label: '#4' }, { label: '#10' }, { label: '#15' }, { label: '#60', hi: true }], cols: 2, cellH: 300, scale: 1.1 } } },
    { say: "After the war, the records of Speer's ministry were opened. The real figure: two hundred forty-five.",
      show: { compare: [{ value: '1,400', label: 'intelligence' }, { value: '246', label: 'serial numbers' }, { value: '245', label: 'the records', color: 'accent' }], source: 'The Guardian, 2006; Ruggles & Brodie, JASA, 1947' } },
    { say: 'Four serial numbers: four, ten, fifteen, sixty. How many tanks? Guess in the comments. The method is on our site, link in the profile.',
      show: { end: '#4, #10, #15, #60. How many tanks?', play: 'Try the method yourself:' } },
  ],
});
