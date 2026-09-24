// Generates the 5 QR codes for print (SVG vector + PNG 4096 px) and checks each PNG by decoding it back.
// Usage: node qr/generate.mjs https://<user>.github.io/<repo>/
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const base = process.argv[2];
if (!base || !/^https:\/\/\S+$/.test(base)) {
  console.error('Please give the public address of the app, for example:\n  node qr/generate.mjs https://florianzilliox.github.io/quality-passport/');
  process.exit(1);
}

const dir = fileURLToPath(new URL('.', import.meta.url));
const targets = [1, 2, 3, 4].map((n) => {
  const u = new URL(base);
  u.searchParams.set('p', String(n));
  return { file: `pillar-${n}.png`, url: u.href };
});
targets.push({ file: 'passport.png', url: new URL(base).href });

let failed = 0;
for (const { file, url } of targets) {
  const path = dir + file;
  const opts = { margin: 4, errorCorrectionLevel: 'M', color: { dark: '#000e56', light: '#ffffff' } };
  // Print: SVG is vector (sharp at any size); PNG 4096 px = about 35 cm at 300 dpi.
  await QRCode.toFile(path, url, { ...opts, width: 4096 });
  await QRCode.toFile(path.replace(/\.png$/, '.svg'), url, { ...opts, type: 'svg' });
  const png = PNG.sync.read(readFileSync(path));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data;
  const ok = decoded === url;
  if (!ok) failed++;
  console.log(`${ok ? 'OK ' : 'ERR'} ${file}  ->  ${decoded ?? '(unreadable)'}`);
}
if (failed) {
  console.error(`${failed} QR code(s) do not decode to the expected address.`);
  process.exit(1);
}
console.log('All 5 QR codes decode to the expected addresses (PNG 4096 px + SVG in qr/).');
