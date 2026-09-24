import { register } from '../router.js';
import { $ } from '../util.js';

register('loading', {
  show({ text = '' } = {}) { $('loading-text').textContent = text; },
});
