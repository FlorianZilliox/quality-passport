// Offline-first sync: answers are queued locally and sent in the background.
// A failed send stays in the queue and is retried later, silently.
import { backend } from './backend/index.js';
import { state, removePending, mergeStars } from './state.js';
import { withTimeout } from './util.js';

const RETRY_EVERY_MS = 30000;
let flushing = null;

/** Sends queued answers in order; stops at the first failure. */
export function flush() {
  if (flushing) return flushing;
  if (!state.pending.length) return Promise.resolve();
  const run = (async () => {
    await null; // always async, so `flushing` is set before the loop can finish
    try {
      while (state.pending.length) {
        const item = state.pending[0];
        const r = await backend.send(item);
        if (r === 'retry') break;
        removePending(item.id); // 'ok' or 'drop' (invalid for good)
      }
    } catch { /* retry later */ }
  })();
  flushing = run.finally(() => { flushing = null; });
  return flushing;
}

/** Retries on launch, on reconnection, on return to the tab, and every 30 s
 *  (event wifi often comes back without firing 'online'). */
export function startAutoFlush() {
  flush();
  window.addEventListener('online', flush);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) flush(); });
  setInterval(() => { if (state.pending.length) flush(); }, RETRY_EVERY_MS);
}

/** Restores stars earned in another browser. Offline: keeps the local state. */
export async function restoreStars() {
  try {
    mergeStars(await withTimeout(backend.stars(state.email), 8000));
  } catch { /* offline */ }
}
