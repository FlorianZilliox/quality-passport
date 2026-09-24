// Question: one open question per pillar. Any non-blank answer earns the star.
import { CONFIG } from '../../config.js';
import { dropPillarParam, IDS } from '../env.js';
import { flush } from '../queue.js';
import { go, register } from '../router.js';
import { state, recordAnswer, starCount, hasStar } from '../state.js';
import { iconSvg } from '../icons.js';
import { T, starSvg } from '../ui.js';
import { $, fmt, pillar } from '../util.js';

const answer = $('answer');
const submit = $('submit-btn');
const counter = $('answer-counter');
let current = null;

function update() {
  const v = answer.value;
  submit.disabled = v.trim().length < CONFIG.MIN_CHARS;
  const left = CONFIG.MAX_CHARS - v.length;
  counter.textContent = left <= 200 ? `${v.length} / ${CONFIG.MAX_CHARS}` : '';
}
answer.addEventListener('input', update);

$('question-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = answer.value.trim().slice(0, CONFIG.MAX_CHARS);
  if (!current || text.length < CONFIG.MIN_CHARS) return;
  const p = current;
  current = null;
  recordAnswer(p, text);
  dropPillarParam();
  if (starCount() === 4 && !state.celebrated) go('celebration');
  else go('passport', { earned: p });
  flush(); // background, never blocks the participant
});

document.querySelectorAll('[data-go="passport"]').forEach((el) => el.addEventListener('click', () => go('passport')));

register('question', {
  show({ pillar: id }) {
    const p = pillar(id);
    current = id;
    $('q-label').textContent = fmt(T.pillarLabel, { n: id });
    $('q-name').textContent = p.name;
    $('q-text').textContent = p.question;
    $('q-icon').replaceChildren(iconSvg(p.icon));
    $('q-mini-stars').replaceChildren(...IDS.map((i) => starSvg(hasStar(i))));
    answer.maxLength = CONFIG.MAX_CHARS;
    answer.value = '';
    update();
  },
});
