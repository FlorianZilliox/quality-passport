/**
 * Quality Passport — Google Apps Script backend.
 *
 * Paste this file in the Sheet: Extensions > Apps Script. Then:
 *   1. Run `setup` once (authorises the script, creates the Responses and Stars tabs).
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
    sheets_().responses.appendRow([new Date(), email, p, answer, id]);
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

/** Run once from the editor: authorises the script and creates both tabs. */
function setup() {
  sheets_();
  SpreadsheetApp.getActive().toast('Quality Passport: tabs Responses and Stars are ready.');
}

/** Returns the tabs, creating them (headers + formulas) when missing. */
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
    stars.getRange('A2').setFormula('=SORT(UNIQUE(FILTER(Responses!B2:B, Responses!B2:B<>"")))');
    ['B', 'C', 'D', 'E'].forEach(function (col) {
      stars.getRange(col + '2').setFormula(
        '=ARRAYFORMULA(IF($A2:$A="",,IF(COUNTIFS(Responses!$B:$B,$A2:$A,Responses!$C:$C,' + col + '$1)>0,"★","")))');
    });
    stars.getRange('F2').setFormula('=ARRAYFORMULA(IF($A2:$A="",,(B2:B="★")+(C2:C="★")+(D2:D="★")+(E2:E="★")))');
    stars.getRange('B:F').setHorizontalAlignment('center');
    stars.setColumnWidth(1, 280);
  }
  return { responses: responses, stars: stars };
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
