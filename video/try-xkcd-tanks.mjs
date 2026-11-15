// «Try it yourself»: the German tank method on xkcd comic numbers (problems/german-tank-problem, #real).
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'try',
  intro: 'Count xkcd like a spy',
  url: 'mathparadoxes.com/german-tank-problem',
  cover: { beat: 1, hook: 'Five numbers. *How many* comics?' },
  beats: [
    { say: 'Open the comic site xkcd and press Random five times. Write down the comic numbers.',
      show: { title: 'Open xkcd. Press Random 5 times.', sub: 'Write down the comic numbers.' } },
    { say: 'Now, without looking anywhere else: how many comics are there in total?',
      show: { question: 'From five random numbers: how many comics exist?', countdown: true, pause: 'Make your estimate' } },
    { say: "This is exactly how the Allies counted Germany's tanks in the Second World War. From the serial numbers of a few captured ones.",
      show: { title: 'The same trick counted German tanks', sub: 'From the serial numbers of a few captured ones.' } },
    { say: 'Put your estimate in the comments, then check it against the latest comic. And learn the method on the site. The link is on screen.',
      show: { end: 'Your estimate? How close did you get?', play: 'The method, and the tanks:' } },
  ],
});
