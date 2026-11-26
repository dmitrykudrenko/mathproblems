// «Game theory at the movies»: The Hunger Games, for the blog article blog/hunger-games-game-theory, while
// «Sunrise on the Reaping» (2026-11-20) is in cinemas. Shots from the official trailers (video/footage/, not in git;
// pictures only, never their sound) open the beats; our own pictures go over the held frame.
// Story: the plates → the Cornucopia (section 2, hawk-dove for 24 tributes: equilibrium share V/D, payoff
// (V/2)(1 − V/D), shown as 4r(1 − r) of the best, 75% at r = 25%) → the whole arena (section 7, the simulator).
// The simulator's results (best start and mode, which stats pay) are folded on the page: never shown here.
// What is shown is the page's own open example, checked against its code (power = S + 0.6A + 2·wpn, +1 in the
// pack; win = lg(Δ/3); escape = 0.85·lg((speed_you − speed_them)/2), speed = P + 0.4A): all fives vs a Career
// S8 A8 P5 with a Horn weapon → fight 3.7% ≈ 4%, escape 30%, escape with speed 9 → 68%.
// Footage: Lionsgate Movies' official trailers on YouTube, video only, saved to video/footage/:
//   T1 = Official Trailer (fS35YSjopjE, 2026-04-13), T2 = Official Trailer 2 (lYXtL5TreOE, 2026-09-16).
// Shots picked from contact sheets, cut points from ffmpeg scene detection.
import { makeShort } from './beats.mjs';

const T1 = 'sunrise-on-the-reaping-trailer-1.mp4', T2 = 'sunrise-on-the-reaping-trailer.mp4';
const PLATES = { src: T1, at: 126.4, len: 3.6, x: .5, label: 'Haymitch rises to his plate' };
const RUN = { src: T2, at: 43.6, len: 3.2, x: .47, label: 'aerial: the ring of plates round the Cornucopia' };
const FIGHT = { src: T2, at: 53.0, len: 1.7, x: .45, label: 'two tributes fighting on the rocks' };
const ARENA = { n: 24, labels: { run: 'of 24 run in', ratio: 'loot ÷ cost of a fight', payoff: 'each tribute’s payoff, % of its best' } };
const FIVES = ['Strength', 'Speed', 'Agility', 'Stamina', 'Wits'].map(label => ({ label, v: 5 }));

export default makeShort({
  format: 'movie',
  intro: 'The Hunger Games and game theory',
  url: 'mathparadoxes.com/blog/hunger-games-game-theory',
  cover: { beat: 1, at: .85, hook: 'Run to the *Cornucopia*?' },
  beats: [
    { say: 'Twenty-four tributes, one winner. Sixty seconds on the plate. Run for the Cornucopia, or run away?',
      show: { clip: PLATES, title: 'Run for the Cornucopia, or run away?' } },
    { say: 'Game theory says: some run, some back off. The richer the prize in the middle, the more run into the fight.',
      show: { clip: RUN, title: 'The richer the horn, the more run in', visual: { kind: 'arena', from: .1, to: .5, ...ARENA } } },
    { say: 'And past a point, a richer Cornucopia leaves every tribute worse off. Only the audience wins.',
      show: { clip: { ...RUN, held: true }, title: 'A richer horn, poorer tributes', visual: { kind: 'arena', from: .5, to: .95, payoff: true, ...ARENA } } },
    { say: 'So we built the whole arena and played it two thousand times. You build your own tribute.',
      show: { clip: FIGHT, title: 'Build your tribute', visual: { kind: 'stats', rows: FIVES, total: 'age 15 · 25 points to spend' } } },
    { say: 'A Career with a weapon finds you. Fight: you win four times in a hundred. Run: thirty. With speed nine: sixty-eight.',
      show: { title: 'A Career with a weapon finds you', sub: 'You: fives in everything',
        compare: [{ value: '4%', label: 'you win the fight' }, { value: '30%', label: 'you get away' }, { value: '68%', label: 'get away with speed 9', color: 'accent' }] } },
    { say: 'At the start: the Cornucopia, the edge, or run? Which wins most often?',
      show: { question: 'All fives. Which start wins most often?', options: ['The Cornucopia', 'Grab from the edge', 'Run'], countdown: true } },
    { say: 'Then build your own tribute and play two thousand Games. The link is in the profile.',
      show: { end: 'Build a tribute,\nplay 2,000 Games', play: 'The simulator is in the article:' } },
  ],
});
