// Programme visual: CONFIG.LOGO if the file exists, otherwise the drawn Q emblem.
import { CONFIG } from '../config.js';
import { Q_MARK_URI } from './icons.js';

let resolved = null;

/** Resolves to a loaded <img> (the logo file or the fallback emblem). */
export function loadLogo() {
  if (!resolved) {
    const load = (src) => new Promise((ok, ko) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = ko;
      img.src = src;
    });
    resolved = (CONFIG.LOGO ? load(CONFIG.LOGO) : Promise.reject())
      .catch(() => load(Q_MARK_URI))
      .catch(() => null);
  }
  return resolved;
}

/** Fills every <img data-logo>. */
export async function applyLogo() {
  const img = await loadLogo();
  if (!img) return;
  document.querySelectorAll('img[data-logo]').forEach((el) => { el.src = img.src; });
}
