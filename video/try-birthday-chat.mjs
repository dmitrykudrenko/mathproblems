// «Try it yourself»: the birthday paradox in your own group chat. No threshold on screen or in the voice.
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'try',
  intro: 'Your group chat',
  url: 'mathparadoxes.com/birthday',
  cover: { beat: 1, hook: 'Two people, *one birthday*?' },
  beats: [
    { say: "Open your biggest group chat. Work, school, family, your football team.",
      show: { title: 'Open your biggest group chat.', sub: 'Work, school, family, the team.' } },
    { say: 'Count the people in it. Then check their birthdays. Is there a pair born on the same day?',
      show: { steps: ['Count the people', 'Collect their birthdays', 'Look for a shared day'] } },
    { say: "Most people bet there won't be. A year has three hundred sixty-five days, after all.",
      show: { stat: '365', label: 'days in a year' } },
    { say: 'Before you check, guess: how big must a group be before a shared birthday is more likely than not?',
      show: { question: 'How big must a group be before a shared birthday is more likely than not?', countdown: true } },
    { say: 'Write in the comments: how many people, and did you find a match? The answer and a simulation are on the site. The link is on screen.',
      show: { end: 'Chat size? Match or no match?', play: 'Post yours, then check the maths:' } },
  ],
});
