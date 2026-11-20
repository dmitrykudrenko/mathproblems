// «A true story»: V-1 hits on London, 1944, and R. D. Clarke's table two years later (glossary/poisson-process:
// 576 squares of 1/4 km², 537 hits, mean 0.93, variance/mean 1.04: no clumps beyond chance). The payoff is the
// glossary's own hook, not a puzzle answer. The map is a random simulation, not the real hits.
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'story',
  intro: 'The bombs that seemed to aim',
  url: 'mathparadoxes.com/glossary/poisson-process',
  cover: { beat: 1, hook: 'Were the bombs *aimed*?', at: .95 },
  beats: [
    { say: 'Nineteen forty-four. Londoners were sure the German flying bombs were aimed at certain districts.',
      show: { title: 'London, 1944: were the bombs aimed?', size: 80 } },
    { say: 'Some streets were hit again and again, others never. Look at this map. It does look aimed.',
      show: { title: 'Some squares hit again and again', visual: { kind: 'scatter', cells: 24, hits: 537, seed: 1944, glow: true } } },
    { say: 'Two years later the actuary R. D. Clarke split south London into five hundred seventy-six squares and counted five hundred thirty-seven hits.',
      show: { compare: [{ value: '576', label: 'squares of ¼ km²' }, { value: '537', label: 'hits', color: 'accent' }] } },
    { say: 'His table matched pure chance almost perfectly. And that map you just saw? Random dots. Randomness simply looks clumpy.',
      show: { title: 'That map was pure chance.', sub: 'Random dots always form clumps.' } },
    { say: 'Next time you see a cluster, of illnesses, crimes or lucky streaks, ask first: is it just chance? Link in the profile.',
      show: { end: 'A cluster? First ask: is it just chance?', play: "Clarke's table and a simulation:" } },
  ],
});
