// Generates the GitHub social preview card (1280x640) as a PNG.
// Run: node scripts/gen-social.mjs
// Then upload .github/social-preview.png in Settings > General > Social preview.

import sharp from "sharp";
import { mkdirSync } from "node:fs";

const W = 1280;
const H = 640;

const bars = [
  { h: 120, c: "#7cf7d0" },
  { h: 232, c: "#b8a6ff" },
  { h: 320, c: "#7cf7d0" },
  { h: 264, c: "#b8a6ff" },
  { h: 150, c: "#7cf7d0" },
]
  .map((b, i) => {
    const x = 82 + i * 46;
    const y = 60 + (320 - b.h);
    return `<rect x="${x}" y="${y}" width="26" height="${b.h}" rx="13" fill="${b.c}" />`;
  })
  .join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#07070a"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  ${bars}
  <text x="80" y="512" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="104" font-weight="700" fill="#f4f4f6" letter-spacing="-2">Cadence</text>
  <text x="82" y="566" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="38" fill="#a3a3ad">Type to a tempo. Tune out the rest.</text>
  <text x="82" y="612" font-family="'Consolas', 'Courier New', monospace" font-size="21" fill="#5a5b66" letter-spacing="7">FOCUS FIRST TYPING TRAINER</text>
</svg>`;

mkdirSync(".github", { recursive: true });
await sharp(Buffer.from(svg)).png().toFile(".github/social-preview.png");
console.log(".github/social-preview.png written");
