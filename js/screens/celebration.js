// Celebration, "Hollywood premiere": searchlights, the 4 stars landing on the path,
// the holder's name engraved on a Walk of Fame star, then the passport card.
// Shown once at the 4th star, then reachable from the passport.
import { drawPassport } from '../passport/draw.js';
import { canShareFiles, downloadPassport, sharePassportFile, preloadPdf } from '../passport/pdf.js';
import { renderPath } from '../path.js';
import { go, register } from '../router.js';
import { shareAchievement } from '../share.js';
import { state, save } from '../state.js';
import { busy } from '../ui.js';
import { $, nameFromEmail } from '../util.js';

const screen = $('screen-celebration');
const holder = $('holder');
const preview = $('preview');
let previewTimer;

const holderName = () => holder.value.trim() || nameFromEmail(state.email);

async function renderPreview() {
  try { preview.src = (await drawPassport(holderName())).toDataURL('image/jpeg', 0.85); } catch { /* keep previous */ }
}

function renderName() {
  const name = holderName();
  const el = $('fame-name');
  el.textContent = name;
  el.style.fontSize = name.length > 22 ? '13px' : name.length > 14 ? '15px' : '17px';
}

/** Restarts every CSS animation of the screen (they run once per display). */
function replay() {
  screen.querySelectorAll('*').forEach((el) => {
    el.getAnimations?.().forEach((a) => { a.cancel(); a.play(); });
  });
}

holder.addEventListener('input', () => {
  state.holder = holder.value;
  save();
  renderName();
  clearTimeout(previewTimer);
  previewTimer = setTimeout(renderPreview, 250);
});

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
    renderPath($('c-path'), { lit: () => true });
    holder.value = state.holder || nameFromEmail(state.email);
    renderName();
    renderPreview();
    preloadPdf();
    $('save-share-btn').hidden = !canShareFiles();
    requestAnimationFrame(replay);
  },
});
