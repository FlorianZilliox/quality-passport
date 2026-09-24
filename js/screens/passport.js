// Passport: progress on the track, the star just earned, and what to do next.
import { renderPath } from '../path.js';
import { go, register } from '../router.js';
import { state, starCount, hasStar } from '../state.js';
import { T, starSvg } from '../ui.js';
import { $, fmt, pillar } from '../util.js';

$('p-open-celebration').addEventListener('click', () => go('celebration'));

register('passport', {
  show({ earned = null, already = null } = {}) {
    const n = starCount();
    const count = $('p-count');
    count.textContent = fmt(T.count, { n });
    count.classList.toggle('done', n === 4);
    renderPath($('p-path'), { lit: hasStar, date: (id) => state.stars[id], fresh: earned });

    // The star just earned (or the one just rescanned), while the passport is not complete
    const focus = n < 4 ? (earned || already) : null;
    $('p-earned').hidden = !focus;
    if (focus) {
      $('p-earned-star').replaceChildren(starSvg(true));
      $('p-earned-label').textContent = earned ? T.starEarned : T.alreadyStamped;
      $('p-earned-name').textContent = pillar(focus).name;
    }
    $('p-next').hidden = n === 4;
    $('p-complete').hidden = n !== 4;
  },
});
