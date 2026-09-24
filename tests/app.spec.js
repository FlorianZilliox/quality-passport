// End-to-end tests in mock mode (SCRIPT_URL empty). `npm test`
import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const EMAIL = 'helene.muller@ipsen.com';
const SHOTS = fileURLToPath(new URL('./screenshots/', import.meta.url));
mkdirSync(SHOTS, { recursive: true });

const sheet = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('wqw_mock_sheet') || '[]'));
const state = (page) => page.evaluate(() => window.__wqw.state());
const visible = (page, name) => expect(page.locator(`#screen-${name}`)).toBeVisible();

async function answer(page, p, text = `My answer for pillar ${p}`) {
  await page.goto(`?p=${p}`);
  await visible(page, 'question');
  await page.fill('#answer', text);
  await page.click('#submit-btn');
}

/** Seeds localStorage once, then loads `path`. */
async function seed(page, value, path = '') {
  await page.goto('');
  await page.evaluate((v) => { localStorage.clear(); Object.entries(v).forEach(([k, x]) => localStorage.setItem(k, JSON.stringify(x))); }, value);
  await page.goto(path);
}

const allStars = { 1: '2026-10-05T09:00:00Z', 2: '2026-10-05T10:00:00Z', 3: '2026-10-06T11:00:00Z', 4: '2026-10-06T12:00:00Z' };

test('1-4. full journey in any order, rescan, celebration', async ({ page }) => {
  // 1. First scan ?p=3: Welcome, invalid email refused, valid email leads to question 3
  await page.goto('?p=3');
  await visible(page, 'welcome');
  await page.fill('#email', 'not-an-email');
  await page.click('#welcome-btn');
  await expect(page.locator('#email-error')).not.toBeEmpty();
  await visible(page, 'welcome');
  await page.fill('#email', ' Helene.Muller@Ipsen.com ');
  await page.click('#welcome-btn');
  await visible(page, 'question');
  await expect(page.locator('#q-label')).toHaveText('Pillar 3 of 4');

  // 2. Empty answer: button disabled. Answer: passport with 1 star, row in the fake sheet
  await expect(page.locator('#submit-btn')).toBeDisabled();
  await page.fill('#answer', '   ');
  await expect(page.locator('#submit-btn')).toBeDisabled();
  await page.fill('#answer', 'Doing it right the first time.');
  await expect(page.locator('#submit-btn')).toBeEnabled();
  await page.click('#submit-btn');
  await visible(page, 'passport');
  await expect(page.locator('#p-count')).toHaveText('1/4');
  await expect.poll(async () => (await sheet(page)).length).toBe(1);
  const [row] = await sheet(page);
  expect(row.slice(1, 4)).toEqual([EMAIL, 3, 'Doing it right the first time.']);

  // 3. Rescan ?p=3: passport, not the question
  await page.goto('?p=3');
  await visible(page, 'passport');
  await expect(page.locator('#p-message')).toContainText('already');

  // 4. Pillars 1, 4, 2: celebration after the 4th
  await answer(page, 1);
  await visible(page, 'passport');
  await answer(page, 4);
  await visible(page, 'passport');
  await answer(page, 2);
  await visible(page, 'celebration');
  await expect(page.locator('#fame-name')).toHaveText('Helene Muller');
  await expect.poll(async () => (await sheet(page)).length).toBe(4);
  expect((await state(page)).celebrated).toBe(true);

  // Celebration shown once, then the passport; still reachable from it
  await page.goto('');
  await visible(page, 'passport');
  await page.click('#p-open-celebration');
  await visible(page, 'celebration');
});

test('5. offline queue: star lit, answer kept, sent after reload', async ({ page }) => {
  await seed(page, { wqw_state: { email: EMAIL, stars: {}, pending: [] } }, '?p=2&mockfail=1');
  await visible(page, 'question');
  await page.fill('#answer', 'Sent while offline');
  await page.click('#submit-btn');
  await visible(page, 'passport');
  await expect(page.locator('#p-count')).toHaveText('1/4');
  await page.waitForTimeout(1200); // mock latency + failure
  let s = await state(page);
  expect(s.pending).toHaveLength(1);
  expect(await sheet(page)).toHaveLength(0);

  await page.goto(''); // network back
  await expect.poll(async () => (await state(page)).pending.length, { timeout: 5000 }).toBe(0);
  const rows = await sheet(page);
  expect(rows).toHaveLength(1);
  expect(rows[0][3]).toBe('Sent while offline');
});

test('6. new browser, same email: stars restored', async ({ page, browser }, info) => {
  await seed(page, { wqw_state: { email: EMAIL, stars: {}, pending: [] } });
  await answer(page, 1);
  await visible(page, 'passport');
  await answer(page, 3);
  await visible(page, 'passport');
  await expect.poll(async () => (await sheet(page)).length).toBe(2);
  const rows = await sheet(page);

  // A different browser (in-app scanner): no local state, same "server" rows.
  const ctx = await browser.newContext({ ...info.project.use });
  const other = await ctx.newPage();
  await other.addInitScript((r) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('wqw_mock_sheet', JSON.stringify(r));
      sessionStorage.setItem('seeded', '1');
    }
  }, rows);
  await other.goto(new URL('?p=3', info.project.use.baseURL || 'http://localhost:4174/').href);
  await visible(other, 'welcome');
  await other.fill('#email', EMAIL);
  await other.click('#welcome-btn');
  await visible(other, 'passport'); // pillar 3 already done elsewhere: no question
  await expect(other.locator('#p-count')).toHaveText('2/4');
  await ctx.close();
});

test('7. passport download: non-empty PDF', async ({ page }) => {
  await seed(page, { wqw_state: { email: EMAIL, stars: allStars, pending: [], celebrated: false } });
  await visible(page, 'celebration');
  await page.fill('#holder', 'Hélène Müller');
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#download-btn')]);
  expect(download.suggestedFilename()).toBe('Quality-Passport.pdf');
  const path = await download.path();
  const buf = readFileSync(path);
  expect(buf.length).toBeGreaterThan(20000);
  expect(buf.subarray(0, 5).toString()).toBe('%PDF-');
});

for (const scheme of ['light', 'dark']) {
  test.describe(`8. screenshots (${scheme})`, () => {
    test.use({ colorScheme: scheme });
    test(`every screen, ${scheme}`, async ({ page }, info) => {
      const shot = (name) => page.screenshot({ path: `${SHOTS}${info.project.name.replace(/\s/g, '')}-${scheme}-${name}.png`, fullPage: true });
      await page.goto('?p=1');
      await visible(page, 'welcome');
      await page.waitForTimeout(900);
      await shot('1-welcome');
      await page.fill('#email', EMAIL);
      await page.click('#welcome-btn');
      await visible(page, 'question');
      await page.fill('#answer', 'Quality means doing it right the first time, every time.');
      await page.waitForTimeout(700);
      await shot('2-question');
      await page.click('#submit-btn');
      await visible(page, 'passport');
      await page.waitForTimeout(1200);
      await shot('3-passport');
      await seed(page, { wqw_state: { email: EMAIL, stars: allStars, pending: [], celebrated: false, holder: 'Hélène Müller' } });
      await visible(page, 'celebration');
      await page.waitForTimeout(4800);
      await shot('4-celebration');
      await expect(page.locator('#preview')).toHaveAttribute('src', /^data:image/);
      const src = await page.getAttribute('#preview', 'src');
      writeFileSync(`${SHOTS}${info.project.name.replace(/\s/g, '')}-${scheme}-5-passport-document.jpg`, Buffer.from(src.split(',')[1], 'base64'));
      await page.click('#close-btn');
      await visible(page, 'passport');
      await page.waitForTimeout(800);
      await shot('6-passport-complete');
    });
  });
}
