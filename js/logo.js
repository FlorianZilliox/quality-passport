// Programme visuals: the full logo (home) and a square "Q" mark for round medallions.
// A missing file falls back to the other one, then to the drawn Q emblem.
import { CONFIG } from '../config.js';
import { Q_MARK_URI } from './icons.js';

const cache = {};

function load(src) {
  return new Promise((ok, ko) => {
    if (!src) return ko(new Error('no src'));
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = ko;
    img.src = src;
  });
}

/** kind: 'full' | 'mark'. Resolves to a loaded <img>, or null. */
export function loadLogo(kind = 'mark') {
  if (!cache[kind]) {
    const [first, second] = kind === 'full' ? [CONFIG.LOGO, CONFIG.LOGO_MARK] : [CONFIG.LOGO_MARK, CONFIG.LOGO];
    cache[kind] = load(first).catch(() => load(second)).catch(() => load(Q_MARK_URI)).catch(() => null);
  }
  return cache[kind];
}

/** Fills <img data-logo="full"> and <img data-logo> (mark). */
export async function applyLogo() {
  const [full, mark] = await Promise.all([loadLogo('full'), loadLogo('mark')]);
  document.querySelectorAll('img[data-logo]').forEach((el) => {
    const img = el.dataset.logo === 'full' ? full : mark;
    if (img) el.src = img.src;
  });
}
