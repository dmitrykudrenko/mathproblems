// «Most people get this wrong»: 160 gynaecologists, only 21% chose «about 1 in 10» (problems/false-positive #real;
// Gigerenzer et al., PSPI 2007). The short never says which option is right.
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'wrong',
  intro: 'A positive test',
  url: 'mathparadoxes.com/false-positive',
  cover: { beat: 0, hook: '4 in 5 *doctors* missed this' },
  beats: [
    { say: 'In two thousand seven, a hundred sixty gynaecologists got this question. Only about one in five chose the best answer.',
      show: { stat: '21%', label: 'of 160 gynaecologists chose the best answer', source: 'Gigerenzer et al., Psychological Science in the Public Interest, 2007' } },
    { say: 'One percent of the women screened have breast cancer. The test catches ninety percent of them, and gives a false alarm to nine percent of the healthy ones.',
      show: { compare: [{ value: '1%', label: 'ill' }, { value: '90%', label: 'of the ill test positive' }, { value: '9%', label: 'of the healthy test positive', color: 'accent' }] } },
    { say: 'A woman tests positive. What is the chance she has cancer?',
      show: { question: 'A woman tests positive. What is the chance she has cancer?', options: ['90%', '81%', 'about 1 in 10', '50%'], countdown: true } },
    { say: 'After a short training in counting people instead of percentages, most of the doctors got it. Write your answer in the comments, then try the trick on the site. The link is on screen.',
      show: { end: 'Your answer: 90%, 81%, 1 in 10 or 50%?', play: 'Count people, not percentages:' } },
  ],
});
