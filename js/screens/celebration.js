// Celebration: four stars light up on a thin line, then the passport as a certificate.
// Shown once at the 4th star, then reachable from the passport.
import { CONFIG } from '../../config.js';
import { IDS } from '../env.js';
import { canShareFiles, downloadPassport, sharePassportFile, preloadPdf } from '../passport/pdf.js';
import { go, register } from '../router.js';
import { shareAchievement } from '../share.js';
import { state, save } from '../state.js';
import { T, busy, starSvg } from '../ui.js';
import { $, fmt, fmtDate, nameFromEmail } from '../util.js';

const holder = $('holder');
const holderName = () => holder.value.trim() || nameFromEmail(state.email);

function renderName() {
  $('cert-name').textContent = holderName();
}

function completedOn() {
  const dates = IDS.map((id) => state.stars[id]).filter(Boolean).sort();
  return dates.at(-1) || new Date().toISOString();
}

$('edit-name').addEventListener('click', () => {
  $('name-field').hidden = false;
  $('edit-name').hidden = true;
  holder.focus();
  holder.select();
});

holder.addEventListener('input', () => {
  state.holder = holder.value;
  save();
  renderName();
});
holder.addEventListener('keydown', (e) => { if (e.key === 'Enter') holder.blur(); });

$('download-btn').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  busy(btn, true);
  await downloadPassport(holderName());
  busy(btn, false);
});

$('save-share-btn').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  busy(btn, true);
  const ok = await sharePassportFile(holderName());
  busy(btn, false);
  if (!ok) $('download-btn').click();
});

$('share-btn').addEventListener('click', shareAchievement);
$('close-btn').addEventListener('click', () => go('passport'));

register('celebration', {
  show() {
    state.celebrated = true;
    save();
    $('c-stars').replaceChildren(...IDS.map(() => {
      const w = document.createElement('span');
      w.className = 'star-wrap';
      w.appendChild(starSvg(true));
      return w;
    }));
    $('cert-stars').replaceChildren(...IDS.map(() => starSvg(true)));
    holder.value = state.holder || nameFromEmail(state.email);
    $('name-field').hidden = true;
    $('edit-name').hidden = false;
    renderName();
    $('cert-line').textContent = fmt(T.docLine, { program: CONFIG.PROGRAM });
    $('cert-date').textContent = fmtDate(completedOn(), 'long');
    preloadPdf();
    $('save-share-btn').hidden = !canShareFiles();
  },
});
