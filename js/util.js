import { CONFIG } from '../config.js';

export const $ = (id) => document.getElementById(id);
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 'Star earned: {pillar}' + {pillar: 'X'} -> 'Star earned: X' */
export function fmt(s, vars = {}) {
  return String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

export function pillar(id) {
  return CONFIG.PILLARS.find((p) => p.id === Number(id));
}

export function uid() {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function withTimeout(promise, ms) {
  return Promise.race([promise, sleep(ms).then(() => { throw new Error('timeout'); })]);
}

const DATE_FORMATS = {
  short: { day: 'numeric', month: 'short' },                  // 24 Sept
  stamp: { day: 'numeric', month: 'short', year: 'numeric' }, // 24 Sept 2026
  long: { day: 'numeric', month: 'long', year: 'numeric' },   // 24 September 2026
};
/** ISO string -> formatted date; format: 'short' | 'stamp' | 'long' (true = long). */
export function fmtDate(iso, format = 'short') {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-GB', DATE_FORMATS[format === true ? 'long' : format] || DATE_FORMATS.short);
}

/** 'jean.dupont2@x.com' -> 'Jean Dupont' */
export function nameFromEmail(email) {
  const local = String(email || '').split('@')[0].split('+')[0];
  return local.split(/[._-]+/)
    .map((w) => w.replace(/\d+/g, ''))
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
