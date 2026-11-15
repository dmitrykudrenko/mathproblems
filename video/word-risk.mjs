// «One word, 40 seconds»: relative vs absolute risk (glossary absolute-vs-relative-risk).
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'word',
  intro: 'Relative risk',
  url: 'mathparadoxes.com/glossary/absolute-vs-relative-risk',
  cover: { beat: 1, hook: '50% fewer deaths. *1%* more survivors?' },
  beats: [
    { say: 'A new operation lowers mortality from two percent to one percent.',
      show: { compare: [{ value: '2%', label: 'die: old operation' }, { value: '1%', label: 'die: new operation', color: 'accent' }] } },
    { say: 'Headline one: deaths fell by fifty percent. True.',
      show: { stat: '−50%', label: 'deaths' } },
    { say: 'Headline two: survivors went from ninety-eight to ninety-nine percent. Only one percent more. Also true.',
      show: { stat: '+1%', label: 'survivors: 98% → 99%' } },
    { say: 'The first is relative risk: how many times the risk changed. It tells how strong the treatment is.',
      show: { title: 'Relative risk', sub: 'How many times the risk changed: how strong the effect is.' } },
    { say: 'The second is absolute: how many people it actually changes things for. That is what matters to you.',
      show: { title: 'Absolute risk', sub: 'How many people it changes things for: what it means to you.' } },
    { say: 'Fifty percent without the starting risk says nothing. Play with both numbers on the site. The link is on screen.',
      show: { end: '“Minus 50%.” Of what?', play: 'One dot per person, try it:' } },
  ],
});
