// Generates the 5 QR codes for print, each labelled under the code ("Pilier 1"… "Passeport"),
// as SVG (vector, for the printer) and PNG 4096 px wide, then checks each PNG by decoding it back.
// Usage: node qr/generate.mjs https://<user>.github.io/<repo>/
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const base = process.argv[2];
if (!base || !/^https:\/\/\S+$/.test(base)) {
  console.error('Please give the public address of the app, for example:\n  node qr/generate.mjs https://quality-passport.github.io/quality-passport/');
  process.exit(1);
}

const dir = fileURLToPath(new URL('.', import.meta.url));
const NAVY = '#000e56';
const targets = [1, 2, 3, 4].map((n) => {
  const u = new URL(base);
  u.searchParams.set('p', String(n));
  return { file: `pilier-${n}`, label: `Pilier ${n}`, url: u.href };
});
targets.push({ file: 'passeport', label: 'Passeport', url: new URL(base).href });

// Remove files from earlier runs (old names included) so the folder only holds the current set.
for (const f of readdirSync(dir)) if (/\.(png|svg)$/.test(f)) unlinkSync(dir + f);

/** QR modules + white quiet zone + label underneath, as one SVG. */
function labelledSvg(url, label) {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'M' });
  const n = qr.modules.size;
  const margin = 4;
  const size = n + margin * 2;
  const labelH = 7;
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (qr.modules.get(y, x)) d += `M${x + margin} ${y + margin}h1v1h-1z`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size + labelH}" shape-rendering="crispEdges">
<rect width="${size}" height="${size + labelH}" fill="#ffffff"/>
<path fill="${NAVY}" d="${d}"/>
<text x="${size / 2}" y="${size + labelH / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="4.2" fill="${NAVY}" shape-rendering="geometricPrecision">${label}</text>
</svg>`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 4 });
let failed = 0;
for (const { file, label, url } of targets) {
  const svg = labelledSvg(url, label);
  writeFileSync(`${dir}${file}.svg`, svg);
  // PNG 4096 px wide (about 35 cm at 300 dpi), rendered from the same SVG.
  await page.setContent(`<body style="margin:0"><div style="width:1024px">${svg.replace('<svg ', '<svg width="1024" ')}</div></body>`);
  const el = await page.$('svg');
  await el.screenshot({ path: `${dir}${file}.png` });
  const png = PNG.sync.read(readFileSync(`${dir}${file}.png`));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data;
  const ok = decoded === url;
  if (!ok) failed++;
  console.log(`${ok ? 'OK ' : 'ERR'} ${file}  "${label}"  ${png.width}x${png.height}  ->  ${decoded ?? '(unreadable)'}`);
}
await browser.close();
if (failed) {
  console.error(`${failed} QR code(s) do not decode to the expected address.`);
  process.exit(1);
}
console.log('All 5 QR codes decode to the expected addresses (labelled SVG + PNG in qr/).');
