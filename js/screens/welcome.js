// Welcome: email, asked once per browser. Then stars are restored from the backend.
import { EMAIL_RE } from '../env.js';
import { restoreStars, retryRestoreInBackground } from '../queue.js';
import { register, route } from '../router.js';
import { state, save } from '../state.js';
import { T } from '../ui.js';
import { $ } from '../util.js';

const input = $('email');
const error = $('email-error');
const btn = $('welcome-btn');

$('welcome-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = input.value.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    error.textContent = T.emailInvalid;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
    return;
  }
  input.removeAttribute('aria-invalid');
  error.textContent = '';
  state.email = email;
  save();
  btn.disabled = true;
  btn.textContent = T.checking;
  const ok = await restoreStars();
  btn.disabled = false;
  btn.textContent = T.continue;
  route();
  if (!ok) retryRestoreInBackground();
});

register('welcome', {
  show() {
    input.value = state.email || '';
    error.textContent = '';
  },
});
