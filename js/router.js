// Screen registry and routing. Screens register themselves; navigation goes through go().
import { pillarParam } from './env.js';
import { state, starCount, hasStar } from './state.js';

const screens = {};

/** screen = { show(opts) } ; its DOM section is #screen-<name>. */
export function register(name, screen) { screens[name] = screen; }

/** Shows one screen, hides the others, moves focus to its title. */
export function go(name, opts) {
  document.querySelectorAll('.screen').forEach((s) => { s.hidden = s.id !== `screen-${name}`; });
  document.body.style.background = name === 'celebration' ? 'var(--ipsen-navy)' : '';
  screens[name]?.show(opts);
  window.scrollTo(0, 0);
  document.querySelector(`#screen-${name} h1`)?.focus({ preventScroll: true });
}

/** Decides the screen from the URL (?p=N) and the local state. */
export function route() {
  if (!state.email) return go('welcome');
  const p = pillarParam();
  if (p && !hasStar(p)) return go('question', { pillar: p });
  if (starCount() === 4 && !state.celebrated) return go('celebration');
  go('passport', { already: p });
}
