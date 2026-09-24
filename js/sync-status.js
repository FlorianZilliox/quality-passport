// Discreet sending indicator under the passport and the celebration:
// spinner while an answer is being sent, a check when saved, a reassuring note when queued.
import { T } from './ui.js';

const els = () => document.querySelectorAll('[data-sync]');
let hideTimer;

function render(status) {
  clearTimeout(hideTimer);
  els().forEach((el) => {
    el.className = `sync ${status}`;
    el.textContent = '';
    const icon = document.createElement('span');
    icon.className = 'sync-icon';
    icon.setAttribute('aria-hidden', 'true');
    if (status === 'saved') icon.textContent = '✓';
    const text = document.createElement('span');
    text.textContent = { sending: T.saving, saved: T.saved, waiting: T.waiting }[status] || '';
    el.append(icon, text);
    el.hidden = !status;
  });
  if (status === 'saved') hideTimer = setTimeout(() => els().forEach((el) => { el.classList.add('fade'); }), 2500);
}

export function initSyncStatus() {
  window.addEventListener('wqw:sync', (e) => render(e.detail));
}
