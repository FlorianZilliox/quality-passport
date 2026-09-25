// Fake backend used when CONFIG.API_URL is empty, and always on localhost (unless ?live=1).
// Rows live in localStorage 'wqw_mock_sheet' with the Sheet's column order:
// [Timestamp, Email, Pillar, Answer, ClientId]. ?mockfail=1 makes every call fail.
import { CONFIG } from '../../config.js';
import { EMAIL_RE, IDS, MOCK_FAIL } from '../env.js';
import { sleep } from '../util.js';

const KEY = 'wqw_mock_sheet';
const LATENCY_MS = 800;

function rows() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

export async function send(item) {
  await sleep(LATENCY_MS);
  if (MOCK_FAIL) return 'retry';
  const email = String(item.email || '').trim().toLowerCase();
  const answer = String(item.answer || '').trim().slice(0, CONFIG.MAX_CHARS);
  if (!EMAIL_RE.test(email) || !IDS.includes(Number(item.p)) || !answer) return 'drop';
  const all = rows();
  all.push([new Date().toISOString(), email, Number(item.p), answer, item.id]);
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { return 'retry'; }
  return 'ok';
}

export async function stars(email) {
  await sleep(LATENCY_MS);
  if (MOCK_FAIL) throw new Error('mock failure');
  const out = {};
  rows().forEach(([ts, e, p]) => { if (e === email && !out[p]) out[p] = ts; });
  return out;
}

export function beacon() { /* the mock has nothing to deliver after the page closes */ }
