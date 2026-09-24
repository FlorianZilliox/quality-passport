// Google Apps Script backend.
// POST as text/plain = "simple" request: no CORS preflight. fetch follows the
// redirect to script.googleusercontent.com, where the JSON answer lives.
import { CONFIG } from '../../config.js';

const TIMEOUT_MS = 20000;

/** Resolves to 'ok' (saved), 'drop' (rejected for good) or 'retry'. */
export async function send(item) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(CONFIG.SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ email: item.email, p: item.p, answer: item.answer, id: item.id }),
      signal: ctrl.signal,
    });
    const d = await r.json();
    if (d?.ok) return 'ok';
    return d?.error === 'invalid' ? 'drop' : 'retry';
  } catch {
    return 'retry';
  } finally {
    clearTimeout(timer);
  }
}

/** { pillarId: ISO date of first answer } for this email. */
export async function stars(email) {
  const url = new URL(CONFIG.SCRIPT_URL);
  url.searchParams.set('email', email);
  const r = await fetch(url);
  const d = await r.json();
  return d?.stars || {};
}
