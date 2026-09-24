// Passport: progress on the path, one card per pillar, and what to do next.
import { CONFIG } from '../../config.js';
import { iconSvg } from '../icons.js';
import { renderPath } from '../path.js';
import { go, register } from '../router.js';
import { state, starCount, hasStar } from '../state.js';
import { T, starSvg } from '../ui.js';
import { $, fmt, fmtDate, pillar } from '../util.js';

function stamp(p, fresh) {
  const on = hasStar(p.id);
  const li = document.createElement('li');
  li.className = 'stamp' + (on ? ' on' : ' locked') + (fresh ? ' fresh' : '');
  const ring = document.createElement('div');
  ring.className = 'ring';
  if (on) ring.appendChild(iconSvg(p.icon));
  else { const q = document.createElement('span'); q.className = 'mystery'; q.textContent = '?'; ring.appendChild(q); }
  const text = document.createElement('div');
  text.className = 'stamp-text';
  const name = document.createElement('div');
  name.className = 'stamp-name';
  name.textContent = on ? p.name : T.toDiscover;
  const date = document.createElement('div');
  date.className = 'stamp-date';
  date.textContent = on ? fmtDate(state.stars[p.id], 'stamp') : T.scanHint;
  text.append(name, date);
  const star = starSvg(on);
  star.setAttribute('aria-label', on ? 'Star earned' : 'Not yet');
  star.setAttribute('role', 'img');
  li.append(ring, text, star);
  return li;
}

$('p-open-celebration').addEventListener('click', () => go('celebration'));

register('passport', {
  show({ earned = null, already = null } = {}) {
    const n = starCount();
    $('p-count').textContent = `${n}/4`;
    renderPath($('p-path'), { lit: hasStar, fresh: earned });
    $('stamps').replaceChildren(...CONFIG.PILLARS.map((p) => stamp(p, p.id === earned)));
    const msg = $('p-message');
    if (earned) msg.textContent = fmt(T.stampEarned, { pillar: pillar(earned).name });
    else if (already) msg.textContent = fmt(T.alreadyStamped, { pillar: pillar(already).name });
    msg.hidden = !earned && !already;
    $('p-next').hidden = n === 4;
    $('p-open-celebration').hidden = n !== 4;
  },
});
