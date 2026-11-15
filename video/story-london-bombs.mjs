// «A true story»: V-1 hits on London, 1944, and R. D. Clarke's table two years later (glossary/poisson-process:
// 576 squares of 1/4 km², 537 hits, mean 0.93, variance/mean 1.04).
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'story',
  intro: 'The bombs that seemed to aim',
  url: 'mathparadoxes.com/glossary/poisson-process',
  cover: { beat: 1, hook: 'Were the bombs *aimed*?' },
  beats: [
    { say: 'Summer nineteen forty-four. German flying bombs are falling on London.',
      show: { title: 'London, summer 1944', sub: 'German V-1 flying bombs fall on the city.' } },
    { say: 'Some districts are hit again and again, others are spared. Londoners are sure: the bombs are aimed.',
      show: { title: 'Some districts hit again and again.', sub: 'Were the bombs aimed?' } },
    { say: 'Two years later the actuary R. D. Clarke splits south London into five hundred seventy-six small squares, and counts the hits: five hundred thirty-seven.',
      show: { compare: [{ value: '576', label: 'squares of ¼ km²' }, { value: '537', label: 'hits', color: 'accent' }] } },
    { say: 'If the bombs fell purely at random, how many squares would get no hit at all, and how many get four or five?',
      show: { question: 'Pure chance or aimed? What would random hits look like?', countdown: true, pause: 'Your guess' } },
    { say: "Clarke's table answered it. See it, and drop your own bombs, on the site. The link is on screen.",
      show: { end: 'Aimed, or just random clumps?', play: "Clarke's table and a simulation:" } },
  ],
});
