// Picks the backend: the Cloudflare Worker, or the mock (see MOCK in env.js).
import { MOCK } from '../env.js';
import * as real from './real.js';
import * as mock from './mock.js';

export const backend = MOCK ? mock : real;
