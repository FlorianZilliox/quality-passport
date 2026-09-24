// Picks the backend: real Apps Script, or the mock when SCRIPT_URL is empty.
import { MOCK } from '../env.js';
import * as real from './real.js';
import * as mock from './mock.js';

export const backend = MOCK ? mock : real;
