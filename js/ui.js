// Shared UI helpers: static texts, theme, banners, toast, star icon.
import { CONFIG } from '../config.js';
import { IS_LOCAL, MOCK } from './env.js';
import { $ } from './util.js';

export const T = CONFIG.TEXT;

export function applyTheme() {
  const map = { primary: '--primary', accent: '--accent', surface: '--surface', star: '--star' };
  Object.entries(map).forEach(([k, v]) => {
    if (CONFIG.THEME?.[k]) document.documentElement.style.setProperty(v, CONFIG.THEME[k]);
  });
  if (CONFIG.THEME?.primary) document.querySelector('meta[name=theme-color]')?.setAttribute('content', CONFIG.THEME.primary);
}

/** Fills [data-t] with TEXT keys and [data-config] with CONFIG keys. */
export function applyStaticText() {
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = T[el.dataset.t] ?? ''; });
  document.querySelectorAll('[data-config]').forEach((el) => { el.textContent = CONFIG[el.dataset.config] ?? ''; });
}

/** Configuration checks, reported in the browser console only (developers), never on screen. */
export function checkConfig() {
  const problems = [];
  const placeholder = /\bTODO\b|lorem|ipsum/i;
  const ids = CONFIG.PILLARS.map((p) => p.id).sort().join(',');
  if (ids !== '1,2,3,4') problems.push('PILLARS must have ids 1 to 4');
  if (CONFIG.PILLARS.some((p) => placeholder.test(`${p.name} ${p.question}`))) problems.push('pillar texts are placeholders');
  if (MOCK) problems.push(IS_LOCAL ? 'mock mode: answers stay in this browser' : 'SCRIPT_URL is empty, answers are not saved');
  if (problems.length) console.warn('[Quality Passport] Config: ' + problems.join(' · '));
}

let toastTimer;
export function toast(msg, ms = 3500) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const STAR_PATH = 'M12 1.8l3.05 6.6 7.2.72-5.4 4.86 1.56 7.1L12 17.4l-6.4 3.7 1.55-7.1L1.75 9.1l7.2-.72z';

export function starSvg(lit) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'star-svg');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', STAR_PATH);
  path.setAttribute('stroke-linejoin', 'round');
  if (lit) {
    path.setAttribute('fill', 'var(--star)');
    path.setAttribute('stroke', 'var(--star-edge)');
    path.setAttribute('stroke-width', '1');
  } else {
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.4');
    path.setAttribute('stroke-dasharray', '2.2 1.6');
  }
  svg.appendChild(path);
  return svg;
}

export function fillStars(el, n, lit) {
  el.replaceChildren(...Array.from({ length: n }, (_, i) => starSvg(i < lit)));
}

/** Button label swap while an async action runs. */
export function busy(btn, on) {
  btn.disabled = on;
  btn.textContent = on ? T.preparing : T[btn.dataset.t];
}
