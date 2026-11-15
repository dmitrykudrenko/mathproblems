// «Try it yourself»: the German tank method on xkcd comic numbers (problems/german-tank-problem, #real).
// The numbers in the picture are made up for the example.
import { makeShort } from './beats.mjs';

const draws = ['#1271', '#406', '#2650', '#88', '#1904'].map((label, i) => ({ face: label, at: i * .25 }));

export default makeShort({
  format: 'try',
  intro: 'Count xkcd like a spy',
  url: 'mathparadoxes.com/german-tank-problem',
  cover: { beat: 0, hook: 'Five numbers. *How many* comics?', crop: [640, 1100], at: .9 },
  beats: [
    { say: 'Open the comic site xkcd and press Random five times. Write down the comic numbers.',
      show: { title: 'Open xkcd. Press Random 5 times.', visual: { kind: 'icons', icon: 'card', items: draws, cols: 5, cellH: 300, scale: .9, labelSize: 30 } } },
    { say: 'Now, without looking anywhere else: how many comics are there in total?',
      show: { question: 'From five random numbers: how many comics exist?', countdown: true, pause: 'Make your estimate' } },
    { say: "This is exactly how the Allies counted Germany's tanks in the Second World War. From the serial numbers of a few captured ones.",
      show: { title: 'The same trick counted German tanks', visual: { kind: 'icons', icon: 'tank', items: [{ label: '#4' }, { label: '#10' }, { label: '#15' }, { label: '#60' }], cols: 4, cellH: 260, scale: .8 } } },
    { say: 'Post your estimate, then check it against the latest comic. The method is on our site, link in the profile.',
      show: { end: 'Your estimate? How close did you get?', play: 'The method, and the tanks:' } },
  ],
});
