// One-off icon generator: renders the SimRacer Hub checkered-flag mark to PNGs.
// Run: node scripts/gen-icons.mjs  (requires: npm i -D sharp)
import sharp from 'sharp'
import { mkdirSync } from 'fs'

const RED = '#e8322a'
const DARK = '#0f1117'
const WHITE = '#f8fafc'

// content spans the full canvas; pad = extra margin for maskable safe zone
function flagSvg({ size, bg, radius, pad = 0 }) {
  const s = 512 // design space
  const cell = 40
  const cols = 7, rows = 4
  const flagW = cols * cell // 280
  const flagH = rows * cell // 160
  const poleX = 108, poleY = 128, poleW = 18, poleH = 268
  const flagX = poleX + poleW, flagY = poleY + 8

  let checkers = ''
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 === 0) continue
      checkers += `<rect x="${flagX + c * cell}" y="${flagY + r * cell}" width="${cell}" height="${cell}" fill="${DARK}"/>`
    }
  }

  const scale = (s - pad * 2) / s
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" rx="${radius}" fill="${bg}"/>
  <g transform="translate(${pad} ${pad}) scale(${scale})">
    <rect x="${poleX}" y="${poleY}" width="${poleW}" height="${poleH}" rx="${poleW / 2}" fill="${WHITE}"/>
    <rect x="${flagX}" y="${flagY}" width="${flagW}" height="${flagH}" rx="10" fill="${WHITE}"/>
    ${checkers}
    <rect x="${flagX}" y="${flagY}" width="${flagW}" height="${flagH}" rx="10" fill="none" stroke="${WHITE}" stroke-width="8"/>
  </g>
</svg>`
}

mkdirSync('public/icons', { recursive: true })

const jobs = [
  // standard icons: red rounded square
  { file: 'public/icons/icon-192.png', size: 192, svg: flagSvg({ size: 192, bg: RED, radius: 96 }) },
  { file: 'public/icons/icon-512.png', size: 512, svg: flagSvg({ size: 512, bg: RED, radius: 96 }) },
  // maskable: full-bleed, content inside the 80% safe zone
  { file: 'public/icons/maskable-512.png', size: 512, svg: flagSvg({ size: 512, bg: RED, radius: 0, pad: 64 }) },
  // apple touch icon: no transparency, slight padding
  { file: 'public/icons/apple-touch-icon.png', size: 180, svg: flagSvg({ size: 180, bg: RED, radius: 0, pad: 24 }) },
]

for (const j of jobs) {
  await sharp(Buffer.from(j.svg)).resize(j.size, j.size).png().toFile(j.file)
  console.log('wrote', j.file)
}
