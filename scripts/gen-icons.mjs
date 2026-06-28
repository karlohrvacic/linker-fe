// One-off: rasterize the brand-mark SVGs into the PWA PNG icons + favicon.ico.
// Run with: npm run gen:icons
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const jobs = [
  ['src/assets-src/icon.svg', 192, 'public/assets/icon-192.png'],
  ['src/assets-src/icon.svg', 512, 'public/assets/icon-512.png'],
  ['src/assets-src/icon-maskable.svg', 512, 'public/assets/icon-512-maskable.png'],
];

for (const [src, size, out] of jobs) {
  await sharp(readFileSync(src), { density: 384 })
    .resize(size, size)
    .png()
    .toFile(out);
  console.log('wrote', out);
}

// favicon.ico — a multi-size ICO (16/32/48) wrapping PNG entries, built from
// the brand favicon. Browsers auto-request /favicon.ico, so it must exist.
const fav = readFileSync('public/favicon.svg');
const sizes = [16, 32, 48];
const pngs = [];
for (const s of sizes) {
  pngs.push(await sharp(fav, { density: 384 }).resize(s, s).png().toBuffer());
}
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);       // reserved
header.writeUInt16LE(1, 2);       // type: icon
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = [];
pngs.forEach((png, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 0); // width
  e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 1); // height
  e.writeUInt8(0, 2);             // palette
  e.writeUInt8(0, 3);             // reserved
  e.writeUInt16LE(1, 4);          // color planes
  e.writeUInt16LE(32, 6);         // bits per pixel
  e.writeUInt32LE(png.length, 8); // size of image data
  e.writeUInt32LE(offset, 12);    // offset of image data
  offset += png.length;
  entries.push(e);
});
writeFileSync('public/favicon.ico', Buffer.concat([header, ...entries, ...pngs]));
console.log('wrote public/favicon.ico');
