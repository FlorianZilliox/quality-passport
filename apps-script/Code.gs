/**
 * Quality Passport — Google Apps Script backend.
 *
 * Paste this file in the Sheet: Extensions > Apps Script. Then:
 *   1. Run `setup` once (authorises the script, creates the Responses and Stars tabs).
 *      Stars is rebuilt by the script after each answer (values, no formulas).
 *   2. Deploy > New deployment > Web app: Execute as "Me", Access "Anyone".
 *   3. Copy the /exec URL into SCRIPT_URL in config.js.
 * To update later: Deploy > Manage deployments > Edit > New version (keeps the same URL).
 *
 * Routes
 *   POST (text/plain JSON {email, p, answer, id}) -> {ok:true} | {ok:false, error:'invalid'|'busy'}
 *   GET  ?email=...                                -> {stars: {"1": "ISO date of first answer", ...}}
 */

const RESPONSES = 'Responses';
const STARS = 'Stars';
const MAX_ANSWER = 2000;
// First character cannot start a spreadsheet formula (= + - @).
const EMAIL_RE = /^[^@\s=+\-][^@\s]*@[^@\s]+\.[^@\s]+$/;

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(10000)) return json({ ok: false, error: 'busy' });
    let d;
    try { d = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'invalid' }); }
    const email = String(d.email || '').trim().toLowerCase().slice(0, 254);
    const p = Number(d.p);
    let answer = String(d.answer || '').trim().slice(0, MAX_ANSWER);
    const id = String(d.id || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 40);
    if (!EMAIL_RE.test(email) || [1, 2, 3, 4].indexOf(p) === -1 || !answer) {
      return json({ ok: false, error: 'invalid' });
    }
    if (/^[=+\-@]/.test(answer)) answer = "'" + answer; // blocks formula injection
    const tabs = sheets_();
    // A resend (Google's reply was slow or lost, but the row was written) is not appended twice.
    if (id && alreadySaved_(tabs.responses, id)) return json({ ok: true, duplicate: true });
    tabs.responses.appendRow([new Date(), email, p, answer, id]);
    try { rebuildStars_(tabs); } catch (err) { /* the answer is saved; Stars catches up next time */ }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: 'busy' });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const email = String((e && e.parameter && e.parameter.email) || '').trim().toLowerCase();
  const stars = {};
  if (email) {
    const rows = sheets_().responses.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (String(r[1]).toLowerCase() !== email) continue;
      const p = Number(r[2]);
      const ts = r[0] instanceof Date ? r[0].toISOString() : String(r[0]);
      if ([1, 2, 3, 4].indexOf(p) !== -1 && (!stars[p] || ts < stars[p])) stars[p] = ts;
    }
  }
  return json({ stars: stars });
}

/** True when a row with this ClientId (column E) already exists. */
function alreadySaved_(responses, id) {
  const last = responses.getLastRow();
  if (last < 2) return false;
  const ids = responses.getRange(2, 5, last - 1, 1).getValues();
  for (let i = ids.length - 1; i >= 0; i--) if (String(ids[i][0]) === id) return true;
  return false;
}

/** Run once from the editor: authorises the script and creates both tabs. */
function setup() {
  rebuildStars_(sheets_());
  SpreadsheetApp.getActive().toast('Quality Passport: tabs Responses and Stars are ready.');
}

/** Menu in the Sheet: Quality Passport > Rebuild Stars. */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Quality Passport').addItem('Rebuild Stars', 'rebuildStars').addToUi();
}

function rebuildStars() {
  rebuildStars_(sheets_());
  SpreadsheetApp.getActive().toast('Stars rebuilt from Responses.');
}

/** Stars = one row per email, a star per pillar answered, and the total.
 *  Written as plain values (no formulas), so it works whatever the Sheet's language.
 *  Duplicates in Responses (a resend after a timeout) count once. */
function rebuildStars_(tabs) {
  const rows = tabs.responses.getDataRange().getValues();
  const byEmail = {};
  for (let i = 1; i < rows.length; i++) {
    const email = String(rows[i][1]).toLowerCase();
    const p = Number(rows[i][2]);
    if (!email || [1, 2, 3, 4].indexOf(p) === -1) continue;
    (byEmail[email] = byEmail[email] || {})[p] = true;
  }
  const out = Object.keys(byEmail).sort().map(function (email) {
    const s = byEmail[email];
    const cells = [1, 2, 3, 4].map(function (p) { return s[p] ? '★' : ''; });
    return [email].concat(cells, [cells.filter(String).length]);
  });
  const stars = tabs.stars;
  const last = stars.getLastRow();
  if (last > 1) stars.getRange(2, 1, last - 1, 6).clearContent();
  if (out.length) stars.getRange(2, 1, out.length, 6).setValues(out);
}

/** Returns the tabs, creating them (with headers) when missing. */
function sheets_() {
  const ss = SpreadsheetApp.getActive();
  let responses = ss.getSheetByName(RESPONSES);
  if (!responses) {
    responses = ss.insertSheet(RESPONSES, 0);
    responses.getRange(1, 1, 1, 5).setValues([['Timestamp', 'Email', 'Pillar', 'Answer', 'ClientId']]).setFontWeight('bold');
    responses.setFrozenRows(1);
    responses.setColumnWidth(4, 480);
    responses.getRange('D:D').setWrap(true);
  }
  let stars = ss.getSheetByName(STARS);
  if (!stars) {
    stars = ss.insertSheet(STARS, 1);
    stars.getRange(1, 1, 1, 6).setValues([['Email', 1, 2, 3, 4, 'Total']]).setFontWeight('bold');
    stars.setFrozenRows(1);
    stars.getRange('B:F').setHorizontalAlignment('center');
    stars.setColumnWidth(1, 280);
  }
  return { responses: responses, stars: stars };
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
