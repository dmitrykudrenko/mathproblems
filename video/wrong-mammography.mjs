// «Most people get this wrong»: 160 gynaecologists, only 21% chose «about 1 in 10» (problems/false-positive #real;
// Gigerenzer et al., PSPI 2007). Shows only the 1% who are ill, never the positives: that would be the answer.
import { makeShort } from './beats.mjs';

export default makeShort({
  format: 'wrong',
  intro: 'A positive test',
  url: 'mathparadoxes.com/false-positive',
  cover: { beat: 0, hook: '4 in 5 *doctors* missed this' },
  beats: [
    { say: 'Four out of five doctors got this wrong. Can you?',
      show: { stat: '4 in 5', label: 'gynaecologists missed the best answer', source: '160 doctors · Gigerenzer et al., Psychological Science in the Public Interest, 2007' } },
    { say: 'A thousand women come for a mammogram. One percent of them, ten women, have breast cancer.',
      show: { title: '1,000 women are screened. 1% have cancer.', visual: { kind: 'dots', n: 1000, cols: 40, seed: 11, marks: [{ count: 10, at: .45, label: '10 have cancer' }] } } },
    { say: 'The test catches ninety percent of them. And it wrongly flags nine percent of the healthy women.',
      show: { compare: [{ value: '90%', label: 'of the ill test positive' }, { value: '9%', label: 'of the healthy test positive', color: 'accent' }] } },
    { say: 'A woman tests positive. What is the chance she has cancer?',
      show: { question: 'A woman tests positive. What is the chance she has cancer?', options: ['90%', '81%', 'about 1 in 10', '50%'], countdown: true } },
    { say: 'One simple trick made most of these doctors get it right. Answer in the comments. The trick is on our site, link in the profile.',
      show: { end: '90%, 81%, 1 in 10 or 50%?', play: 'The trick that fixed it:' } },
  ],
});
