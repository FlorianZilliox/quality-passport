// Runs apps-script/Code.gs in Node against fake Google services.
// Covers validation, formula injection, duplicates, star restoration and tab creation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function load() {
  const tabs = {};
  const makeSheet = (name) => {
    const rows = [];
    const range = (r = 1, c = 1, nr = 1, nc = 1) => ({
      setValues(v) { v.forEach((vr, i) => { rows[r - 1 + i] = rows[r - 1 + i] || []; vr.forEach((x, j) => { rows[r - 1 + i][c - 1 + j] = x; }); }); return this; },
      clearContent() { for (let i = 0; i < nr; i++) if (rows[r - 1 + i]) for (let j = 0; j < nc; j++) rows[r - 1 + i][c - 1 + j] = ''; return this; },
      setFontWeight() { return this; }, setWrap() { return this; }, setHorizontalAlignment() { return this; },
    });
    return {
      rows,
      appendRow(r) { rows.push(r); },
      getLastRow() { let n = rows.length; while (n && (rows[n - 1] || []).every((x) => x === '' || x == null)) n--; return n; },
      getDataRange() { return { getValues: () => rows.map((r) => r.slice()) }; },
      getRange: (a, b, c, d) => (typeof a === 'string' ? range() : range(a, b, c, d)),
      setFrozenRows() {}, setColumnWidth() {},
    };
  };
  const ss = {
    getSheetByName: (n) => tabs[n] || null,
    insertSheet: (n) => (tabs[n] = makeSheet(n)),
    toast() {},
  };
  let locked = false;
  const ctx = {
    SpreadsheetApp: { getActive: () => ss },
    LockService: { getScriptLock: () => ({ tryLock: () => !locked, releaseLock() {} }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (s) => ({ body: s, setMimeType() { return this; } }),
    },
    Date,
  };
  vm.createContext(ctx);
  vm.runInContext(readFileSync(new URL('../apps-script/Code.gs', import.meta.url), 'utf8'), ctx);
  const post = (d) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(d) } }).body);
  const get = (email) => JSON.parse(ctx.doGet({ parameter: { email } }).body);
  return { ctx, tabs, post, get, lock: (v) => { locked = v; } };
}

test('valid answer is appended with a lower-cased email', () => {
  const { post, tabs } = load();
  assert.deepEqual(post({ email: ' Jean.Dupont@X.com ', p: 2, answer: ' hello ', id: 'abc-1' }), { ok: true });
  const row = tabs.Responses.rows[1];
  assert.equal(row[1], 'jean.dupont@x.com');
  assert.equal(row[2], 2);
  assert.equal(row[3], 'hello');
  assert.equal(row[4], 'abc-1');
});

test('invalid input is rejected with error "invalid"', () => {
  const { post, tabs } = load();
  for (const d of [
    { email: 'nope', p: 1, answer: 'a' },
    { email: 'a@b.co', p: 5, answer: 'a' },
    { email: 'a@b.co', p: 1, answer: '   ' },
    { email: '=cmd@b.co', p: 1, answer: 'a' },
  ]) assert.deepEqual(post(d), { ok: false, error: 'invalid' });
  assert.equal(tabs.Responses, undefined); // nothing written, not even the tab
});

test('formula injection is neutralised, ids are sanitised, answers capped', () => {
  const { post, tabs } = load();
  post({ email: 'a@b.co', p: 1, answer: '=HYPERLINK("x")', id: '=1+1' });
  post({ email: 'a@b.co', p: 3, answer: 'x'.repeat(5000) });
  assert.equal(tabs.Responses.rows[1][3], '\'=HYPERLINK("x")');
  assert.equal(tabs.Responses.rows[1][4], '11');
  assert.equal(tabs.Responses.rows[2][3].length, 2000);
});

test('busy lock answers "busy" so the client retries', () => {
  const { post, lock } = load();
  lock(true);
  assert.deepEqual(post({ email: 'a@b.co', p: 1, answer: 'a' }), { ok: false, error: 'busy' });
});

test('malformed body is "invalid"', () => {
  const { ctx } = load();
  assert.deepEqual(JSON.parse(ctx.doPost({ postData: { contents: '{oops' } }).body), { ok: false, error: 'invalid' });
});

test('GET restores stars with the first date, duplicates ignored', () => {
  const { post, get } = load();
  post({ email: 'a@b.co', p: 3, answer: 'first' });
  post({ email: 'a@b.co', p: 3, answer: 'retry duplicate' });
  post({ email: 'a@b.co', p: 1, answer: 'x' });
  post({ email: 'other@b.co', p: 4, answer: 'x' });
  const { stars } = get('A@B.CO');
  assert.deepEqual(Object.keys(stars).sort(), ['1', '3']);
  assert.match(stars[3], /^\d{4}-\d\d-\d\dT/);
  assert.deepEqual(get('').stars, {});
});

const plain = (x) => JSON.parse(JSON.stringify(x)); // arrays from the vm have another realm's prototype

test('setup creates both tabs with headers', () => {
  const { ctx, tabs } = load();
  ctx.setup();
  assert.deepEqual(plain(tabs.Responses.rows[0]), ['Timestamp', 'Email', 'Pillar', 'Answer', 'ClientId']);
  assert.deepEqual(plain(tabs.Stars.rows[0]), ['Email', 1, 2, 3, 4, 'Total']);
});

test('Stars is rebuilt after each answer: one row per email, duplicates count once', () => {
  const { post, tabs } = load();
  post({ email: 'b@x.co', p: 3, answer: 'x' });
  post({ email: 'a@x.co', p: 1, answer: 'x' });
  post({ email: 'a@x.co', p: 1, answer: 'resend after timeout' });
  post({ email: 'a@x.co', p: 4, answer: 'x' });
  const body = plain(tabs.Stars.rows.slice(1).filter((r) => r[0]));
  assert.deepEqual(body, [
    ['a@x.co', '★', '', '', '★', 2],
    ['b@x.co', '', '', '★', '', 1],
  ]);
});
