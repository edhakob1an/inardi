// Builds the final Each Pixel Matters logo as self-contained SVG (text converted to outlines).
// Output: JSON with every piece as path data (for the animated intro) + finished SVG files.
const fs = require('fs'), path = require('path'), opentype = require('opentype.js');
const OUT = process.argv[2] || './final';
fs.mkdirSync(OUT, { recursive: true });
const buf = fs.readFileSync(path.join(__dirname, 'node_modules/@fontsource/saira-semi-condensed/files/saira-semi-condensed-latin-600-normal.woff'));
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

const W = 272, MH = 253, GAP = 30, LEAD = .42, L2K = 1.12, TRACK = .06, SPACEK = .55;
const rect = (x0, y0, x1, y1) => `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
const MONO = {
  E: [[0, 0, 33, 253], [0, 0, 81, 34], [0, 94, 81, 128], [0, 220, 127, 253]],
  P: [[94, 0, 127, 207], [94, 0, 194, 34], [161, 0, 194, 128], [94, 94, 194, 128]],
  M: [[206, 62, 272, 174], [139, 140, 272, 174], [139, 140, 173, 253], [189, 140, 223, 207], [239, 140, 272, 253]],
  gold: [234, 0, 272, 38],
};
const PX = {
  P: ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X....', 'X....', 'X....'],
  I: ['XXX', '.X.', '.X.', '.X.', '.X.', '.X.', 'XXX'],
  X: ['X...X', 'X...X', '.X.X.', '..X..', '.X.X.', 'X...X', 'X...X'],
  E: ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'XXXXX'],
  L: ['X....', 'X....', 'X....', 'X....', 'X....', 'X....', 'XXXXX'],
};
const f3 = n => +n.toFixed(2);

// ---- metrics
const upm = font.unitsPerEm, capU = font.charToGlyph('H').getBoundingBox().y2;
const adv = (s, size) => font.getAdvanceWidth(s, size, { kerning: true });
const cap100 = capU / upm * 100;
let pxCols = -1; for (const ch of 'PIXEL') pxCols += PX[ch][0].length + 1;
const perH = adv('EACH', 100) / cap100 + 3 * TRACK + SPACEK + pxCols / 7;
const H = W / perH, size1 = H * 100 / cap100, cell = H / 7, H2 = H * L2K, size2 = size1 * L2K;
const y1 = MH + GAP, base1 = y1 + H, y2 = y1 + H * (1 + LEAD), base2 = y2 + H2;

// lay out a word glyph by glyph with extra spacing; returns per-letter path data, flush to x=0 on the left ink edge
function word(str, size, baseline, spacing) {
  const glyphs = font.stringToGlyphs(str), scale = size / upm;
  let x = 0; const parts = [];
  glyphs.forEach((g, i) => {
    parts.push({ ch: str[i], x, g });
    let a = g.advanceWidth * scale;
    if (i < glyphs.length - 1) a += font.getKerningValue(g, glyphs[i + 1]) * scale;
    x += a + spacing;
  });
  const first = parts[0], last = parts[parts.length - 1];
  const left = first.x + first.g.getBoundingBox().x1 * scale, right = last.x + last.g.getBoundingBox().x2 * scale;
  return { parts, left, right, scale, baseline, size };
}
function render(w, shift) {
  return w.parts.map(p => ({ ch: p.ch, d: p.g.getPath(p.x + shift, w.baseline, w.size).toPathData(2) }));
}
// line 1: EACH flush left
const each = word('EACH', size1, base1, TRACK * H), eachParts = render(each, -each.left);
// line 2: MATTERS spacing solved so the ink spans exactly 0..W
const m0 = word('MATTERS', size2, base2, 0), extra = (W - (m0.right - m0.left)) / 6;
const mat = word('MATTERS', size2, base2, extra), matParts = render(mat, -mat.left);
// PIXEL cells (flush right)
const px0 = W - pxCols * cell, cells = [];
let col = 0;
for (const ch of 'PIXEL') {
  PX[ch].forEach((row, r) => [...row].forEach((c, k) => { if (c === 'X') cells.push([col + k, r]); }));
  col += PX[ch][0].length + 1;
}
// traced outline of all cells (no seams)
function outline(cells) {
  const on = new Set(cells.map(c => c.join(','))), has = (i, j) => on.has(i + ',' + j), E = new Map();
  const add = (a, b) => { const k = a.join(','); (E.get(k) || E.set(k, []).get(k)).push(b); };
  for (const [i, j] of cells) {
    if (!has(i, j - 1)) add([i, j], [i + 1, j]);
    if (!has(i + 1, j)) add([i + 1, j], [i + 1, j + 1]);
    if (!has(i, j + 1)) add([i + 1, j + 1], [i, j + 1]);
    if (!has(i - 1, j)) add([i, j + 1], [i, j]);
  }
  const P = p => `${f3(px0 + p[0] * cell)} ${f3(y1 + p[1] * cell)}`;
  let d = '';
  while (E.size) {
    const sk = E.keys().next().value, s = sk.split(',').map(Number); let cur = s; d += 'M' + P(cur);
    for (let g = 0; g < 9999; g++) {
      const k = cur.join(','), l = E.get(k); if (!l) break;
      cur = l.pop(); if (!l.length) E.delete(k);
      if (cur[0] === s[0] && cur[1] === s[1]) break;
      d += 'L' + P(cur);
    }
    d += 'Z';
  }
  return d;
}
const pixelOutline = outline(cells);
const bottom = base2;

const logo = {
  W, H: bottom, mono: { E: MONO.E.map(r => rect(...r)).join(''), P: MONO.P.map(r => rect(...r)).join(''), M: MONO.M.map(r => rect(...r)).join(''), gold: rect(...MONO.gold) },
  each: eachParts, matters: matParts, pixel: { outline: pixelOutline, cells: cells.map(([i, j]) => [f3(px0 + i * cell), f3(y1 + j * cell)]), cell: f3(cell) },
};
fs.writeFileSync(path.join(OUT, 'logo.json'), JSON.stringify(logo));

// ---- finished SVG files
function svg({ ink, pixel, gold, bg, text = true, pad = 24 }) {
  const h = text ? bottom : MH, vb = `${-pad} ${-pad} ${W + 2 * pad} ${f3(h + 2 * pad)}`;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${(W + 2 * pad) * 4}" height="${f3((h + 2 * pad) * 4)}">`;
  if (bg) s += `<rect x="${-pad}" y="${-pad}" width="${W + 2 * pad}" height="${f3(h + 2 * pad)}" fill="${bg}"/>`;
  s += `<path fill="${ink}" d="${logo.mono.E}${logo.mono.P}${logo.mono.M}"/><path fill="${gold}" d="${logo.mono.gold}"/>`;
  if (text) s += `<path fill="${ink}" d="${eachParts.map(p => p.d).join('')}${matParts.map(p => p.d).join('')}"/><path fill="${pixel}" d="${pixelOutline}"/>`;
  return s + '</svg>\n';
}
const DARKBG = '#1A1A1A', INK = '#ECE8E1', GOLD = '#F2C14E', INK_L = '#2B2B2D', GOLD_L = '#E8B13A', PIX_L = '#E0A92C';
const files = {
  'each-pixel-matters-logo-for-dark-bg.svg': svg({ ink: INK, pixel: GOLD, gold: GOLD }),
  'each-pixel-matters-logo-on-dark.svg': svg({ ink: INK, pixel: GOLD, gold: GOLD, bg: DARKBG }),
  'each-pixel-matters-logo-for-light-bg.svg': svg({ ink: INK_L, pixel: PIX_L, gold: GOLD_L }),
  'each-pixel-matters-logo-on-white.svg': svg({ ink: INK_L, pixel: PIX_L, gold: GOLD_L, bg: '#FFFFFF' }),
  'epm-mark-for-dark-bg.svg': svg({ ink: INK, pixel: GOLD, gold: GOLD, text: false }),
  'epm-mark-for-light-bg.svg': svg({ ink: INK_L, pixel: PIX_L, gold: GOLD_L, text: false }),
};
// square icon: mark centered on dark
{
  const S = 400, k = 0.62, sc = (S * k) / MH, tx = (S - W * sc) / 2, ty = (S - MH * sc) / 2;
  files['epm-icon-1024.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="1024" height="1024"><rect width="${S}" height="${S}" fill="${DARKBG}"/><g transform="translate(${f3(tx)} ${f3(ty)}) scale(${f3(sc)})"><path fill="${INK}" d="${logo.mono.E}${logo.mono.P}${logo.mono.M}"/><path fill="${GOLD}" d="${logo.mono.gold}"/></g></svg>\n`;
}
for (const [n, c] of Object.entries(files)) fs.writeFileSync(path.join(OUT, n), c);
console.log('H', H.toFixed(2), 'cell', cell.toFixed(2), 'bottom', bottom.toFixed(1), 'files', Object.keys(files).length);
