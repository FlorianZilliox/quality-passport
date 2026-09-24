// Entry point: theme, texts, sync, then the first screen.
import { applyLogo } from './logo.js';
import { drawPassport } from './passport/draw.js';
import { preloadPdf } from './passport/pdf.js';
import { restoreStars, startAutoFlush } from './queue.js';
import { go, route } from './router.js';
import { state, starCount, syncFromOtherTabs } from './state.js';
import { T, applyStaticText, applyTheme, checkConfig } from './ui.js';
import { nameFromEmail } from './util.js';
import './screens/loading.js';
import './screens/welcome.js';
import './screens/question.js';
import './screens/passport.js';
import './screens/celebration.js';

applyTheme();
applyStaticText();
checkConfig();
applyLogo();
startAutoFlush();
// Another tab (a new QR scan) saved: take its stars and queued answers in.
window.addEventListener('storage', (e) => { if (e.key === 'wqw_state') syncFromOtherTabs(); });

// Known email but no star here (new browser, cleared storage): ask the backend first.
if (state.email && starCount() === 0) {
  go('loading', { text: T.checking });
  restoreStars().then(route);
} else {
  route();
}

setTimeout(preloadPdf, 1500);

// Read-only hook for automated tests.
window.__wqw = {
  state: () => structuredClone(state),
  nameFromEmail,
  passportImage: async (name) => (await drawPassport(name)).toDataURL('image/jpeg', 0.9),
};
