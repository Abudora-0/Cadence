// Renders every app icon from one waveform mark.
// Run: node scripts/gen-icons.mjs  (or: npm run icons)

import sharp from "sharp";
import pngToIco from "png-to-ico";
import { mkdirSync, writeFileSync } from "node:fs";

const BARS = [
  { x: 4, y: 11, h: 10 },
  { x: 9.5, y: 7, h: 18 },
  { x: 15, y: 4, h: 24 },
  { x: 20.5, y: 8, h: 16 },
  { x: 26, y: 12, h: 8 },
];

function barRects(color) {
  return BARS.map(
    (b) =>
      `<rect x="${b.x}" y="${b.y}" width="2.4" height="${b.h}" rx="1.2" fill="${color}" />`,
  ).join("");
}

// Rounded-square badge, matches the in-app favicon.
function badgeSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 32 32">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7cf7d0"/><stop offset="100%" stop-color="#b8a6ff"/>
    </linearGradient></defs>
    <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8" fill="#14161d" stroke="#2c2f3a" stroke-width="1.2"/>
    <g>${barRects("url(#g)")}</g>
  </svg>`;
}

// Full-bleed variant with a safe zone, for maskable and Apple icons.
function bleedSvg(bg, scale) {
  const pad = (32 - 32 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 32 32">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7cf7d0"/><stop offset="100%" stop-color="#b8a6ff"/>
    </linearGradient></defs>
    <rect width="32" height="32" fill="${bg}"/>
    <g transform="translate(${pad} ${pad}) scale(${scale})">${barRects("url(#g)")}</g>
  </svg>`;
}

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png();

mkdirSync("public", { recursive: true });
mkdirSync("app", { recursive: true });

// Manifest icons.
await png(badgeSvg(), 192).toFile("public/icon-192.png");
await png(badgeSvg(), 512).toFile("public/icon-512.png");
await png(bleedSvg("#07070a", 0.6), 512).toFile("public/icon-maskable-512.png");

// Apple touch icon (iOS rounds the corners itself).
await png(bleedSvg("#0d0e13", 0.62), 180).toFile("app/apple-icon.png");

// SVG favicon for modern browsers.
writeFileSync("app/icon.svg", badgeSvg().replace(' width="512" height="512"', ""));
writeFileSync("public/icon.svg", badgeSvg().replace(' width="512" height="512"', ""));

// Legacy favicon.ico (16 / 32 / 48).
const icoSources = await Promise.all(
  [16, 32, 48].map((s) => png(badgeSvg(), s).toBuffer()),
);
writeFileSync("app/favicon.ico", await pngToIco(icoSources));

console.log("icons written: public/icon-{192,512}.png, icon-maskable-512.png,");
console.log("               public/icon.svg, app/icon.svg, app/apple-icon.png, app/favicon.ico");
