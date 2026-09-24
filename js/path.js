// The 4 pillars on the cyan line (programme slide look), reused on every screen.
import { CONFIG } from '../config.js';
import { iconSvg } from './icons.js';
import { T, starSvg } from './ui.js';

/**
 * opts.lit(id) -> bool   gold ring + star badge
 * opts.current           pillar being answered (glowing ring)
 * opts.fresh             pillar just earned (slam animation)
 * Pillars not lit stay hidden ("?"): they are discovered one QR code at a time.
 */
export function renderPath(el, { lit = () => false, current = null, fresh = null } = {}) {
  el.replaceChildren(...CONFIG.PILLARS.map((p) => {
    const on = lit(p.id);
    const shown = on || p.id === current;
    const node = document.createElement('div');
    node.className = 'node' + (p.id === current ? ' current' : '') + (p.id === fresh ? ' fresh' : '') + (shown ? '' : ' hidden-pillar');
    const ring = document.createElement('div');
    ring.className = 'ring' + (on ? ' on' : '');
    ring.appendChild(shown ? iconSvg(p.icon) : mystery());
    if (on) {
      const badge = starSvg(true);
      badge.classList.add('badge');
      ring.appendChild(badge);
    }
    const lbl = document.createElement('div');
    lbl.className = 'lbl';
    lbl.textContent = shown ? p.name : T.toDiscover;
    node.append(ring, lbl);
    return node;
  }));
}

function mystery() {
  const q = document.createElement('span');
  q.className = 'mystery';
  q.textContent = '?';
  return q;
}
