/**
 * Generates SVG placeholder artwork for seeding: products, categories, banners and a fake payment screenshot.
 * Everything is drawn from code, so the seed works offline and needs no downloaded images.
 * Real photos can replace any of these later from the admin panel.
 */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export type Shape = 'kurta' | 'dress' | 'lehenga' | 'bottom';

const PUBLIC_DIR = fileURLToPath(new URL('../uploads/seed/', import.meta.url));
const PRIVATE_DIR = fileURLToPath(new URL('../private-uploads/', import.meta.url));

// ---------- tiny colour helpers ----------
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const rgb = (hex: string): number[] => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = (c: number[]) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mix = (a: string, b: string, t: number) => { const x = rgb(a), y = rgb(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
const lighten = (hex: string, t: number) => mix(hex, '#ffffff', t);
const darken = (hex: string, t: number) => mix(hex, '#000000', t);
const luminance = (hex: string) => { const [r, g, b] = rgb(hex); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

const wrap = (text: string, max: number) => {
  const lines: string[] = [];
  let cur = '';
  for (const w of text.split(' ')) {
    if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
};

// ---------- garment silhouettes (drawn in a 600x800 box) ----------
const SHAPES: Record<Shape, { body: string; detail: string }> = {
  kurta: {
    body: 'M235 150 L190 175 L120 330 L168 352 L205 270 L195 560 L150 640 L450 640 L405 560 L395 270 L432 352 L480 330 L410 175 L365 150 Q300 215 235 150 Z',
    detail: 'M300 212 L300 430 M235 150 Q300 215 365 150 M165 600 L435 600',
  },
  dress: {
    body: 'M250 150 Q300 200 350 150 L385 180 L360 300 L520 700 L80 700 L240 300 L215 180 Z',
    detail: 'M240 300 L360 300 M250 150 Q300 200 350 150 M120 660 L480 660',
  },
  lehenga: {
    body: 'M240 150 Q300 200 360 150 L400 190 L380 300 L220 300 L200 190 Z M215 312 L385 312 L540 700 L60 700 Z',
    detail: 'M400 190 Q480 330 430 540 M110 655 L490 655 M240 150 Q300 200 360 150',
  },
  bottom: {
    body: 'M220 160 L380 160 L390 250 L470 700 L320 700 L300 330 L280 700 L130 700 L210 250 Z',
    detail: 'M220 160 L380 160 M300 330 L300 175 M150 650 L300 650 M310 650 L455 650',
  },
};

/** Map a category slug to a garment silhouette. */
export const shapeForCategory = (slug: string): Shape =>
  slug.includes('lehenga') ? 'lehenga'
  : slug.includes('bottom') ? 'bottom'
  : slug.includes('dress') || slug.includes('fusion') || slug.includes('anarkali') ? 'dress'
  : 'kurta';

const garment = (shape: Shape, hex: string, opts: { pattern?: boolean; id: string }) => {
  const s = SHAPES[shape];
  const stroke = darken(hex, 0.35);
  return `
  <defs>
    <linearGradient id="fab-${opts.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(hex, 0.14)}"/><stop offset="1" stop-color="${darken(hex, 0.14)}"/></linearGradient>
    <clipPath id="clip-${opts.id}"><path d="${s.body}"/></clipPath>
    <pattern id="dots-${opts.id}" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="14" cy="14" r="3.2" fill="#fff" fill-opacity="0.32"/></pattern>
  </defs>
  <path d="${s.body}" fill="url(#fab-${opts.id})" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
  ${opts.pattern ? `<rect width="600" height="800" fill="url(#dots-${opts.id})" clip-path="url(#clip-${opts.id})"/>` : ''}
  <path d="${s.detail}" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" opacity="0.65"/>`;
};

const svg = (w: number, h: number, inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${inner}</svg>\n`;

// ---------- products: 3 views per item (front, close-up, back) ----------
export const productSvg = (o: { hex: string; shape: Shape; colourName: string; view: 0 | 1 | 2 }) => {
  const light = luminance(o.hex) > 0.78;
  const bgTop = light ? '#ebe5dd' : lighten(o.hex, 0.9);
  const bgBot = light ? '#d2c9bd' : lighten(o.hex, 0.64);
  const tf = o.view === 1 ? 'translate(300 440) scale(1.32) translate(-300 -440)' : o.view === 2 ? 'translate(600 0) scale(-1 1)' : '';
  return svg(600, 800, `
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bgTop}"/><stop offset="1" stop-color="${bgBot}"/></linearGradient></defs>
  <rect width="600" height="800" fill="url(#bg)"/>
  <g transform="${tf}">
    <ellipse cx="300" cy="712" rx="210" ry="14" fill="#000" opacity="0.08"/>
    ${garment(o.shape, o.hex, { pattern: o.view !== 0, id: 'g' })}
  </g>
  <text x="300" y="772" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="17" letter-spacing="3" fill="#000" fill-opacity="0.45">PLACEHOLDER · ${esc(o.colourName.toUpperCase())} · VIEW ${o.view + 1}</text>`);
};

// ---------- homepage category tile (displayed ~386x265) ----------
export const categorySvg = (o: { name: string; hex: string; shape: Shape }) => {
  const lines = wrap(o.name.toUpperCase(), 11);
  const fontSize = Math.max(...lines.map((l) => l.length)) > 9 ? 42 : 56; // long words must not touch the garment
  const dark = darken(o.hex, 0.45);
  return svg(772, 530, `
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(o.hex, 0.88)}"/><stop offset="1" stop-color="${lighten(o.hex, 0.55)}"/></linearGradient></defs>
  <rect width="772" height="530" fill="url(#bg)"/>
  <circle cx="620" cy="130" r="210" fill="#fff" opacity="0.28"/>
  <g transform="translate(320 -70) scale(0.8)">${garment(o.shape, o.hex, { id: 'c' })}</g>
  ${lines.map((l, i) => `<text x="52" y="${230 - (lines.length - 1) * 32 + i * 64}" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="bold" letter-spacing="2" fill="${dark}">${esc(l)}</text>`).join('')}
  <text x="54" y="${230 - (lines.length - 1) * 32 + (lines.length - 1) * 64 + 54}" font-family="Arial, Helvetica, sans-serif" font-size="20" letter-spacing="4" fill="${dark}" opacity="0.8">SHOP NOW  →</text>
  <text x="386" y="508" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" letter-spacing="3" fill="#000" fill-opacity="0.35">PLACEHOLDER</text>`);
};

// ---------- hero slide (1440x650; the transparent header overlays the top ~140px) ----------
export const heroSvg = (o: { hex: string; accent: string; title: string; subtitle: string; cta: string; shapes: [Shape, Shape] }) => {
  const deep = darken(o.hex, 0.3);
  return svg(1440, 650, `
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stop-color="${deep}"/><stop offset="1" stop-color="${o.hex}"/></linearGradient></defs>
  <rect width="1440" height="650" fill="url(#bg)"/>
  <circle cx="1130" cy="330" r="360" fill="#fff" opacity="0.07"/>
  <circle cx="1280" cy="120" r="170" fill="#fff" opacity="0.06"/>
  <circle cx="90" cy="600" r="220" fill="#fff" opacity="0.05"/>
  <g transform="translate(790 120) scale(0.78)" opacity="0.92">${garment(o.shapes[0], lighten(o.hex, 0.55), { id: 'a' })}</g>
  <g transform="translate(1010 180) scale(0.66)" opacity="0.92">${garment(o.shapes[1], o.accent, { id: 'b' })}</g>
  <text x="120" y="330" font-family="Georgia, 'Times New Roman', serif" font-size="92" font-weight="bold" fill="#fff">${esc(o.title)}</text>
  <text x="124" y="398" font-family="Arial, Helvetica, sans-serif" font-size="28" letter-spacing="2" fill="#fff" fill-opacity="0.9">${esc(o.subtitle)}</text>
  <rect x="124" y="440" width="230" height="58" fill="${o.accent}"/>
  <text x="239" y="477" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="bold" letter-spacing="2" fill="#222">${esc(o.cta)}</text>
  <text x="720" y="628" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" letter-spacing="4" fill="#fff" fill-opacity="0.4">PLACEHOLDER BANNER</text>`);
};

// ---------- editorial banner (1248x503) ----------
export const editorialSvg = (o: { title: string; subtitle: string }) =>
  svg(1248, 503, `
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e7da"/><stop offset="1" stop-color="#e8c3aa"/></linearGradient></defs>
  <rect width="1248" height="503" fill="url(#bg)"/>
  <circle cx="900" cy="250" r="300" fill="#fff" opacity="0.3"/>
  <g transform="translate(620 40) scale(0.56)">${garment('lehenga', '#b51f2a', { id: 'e1' })}</g>
  <g transform="translate(850 80) scale(0.5)">${garment('kurta', '#f3bf43', { id: 'e2', pattern: true })}</g>
  <g transform="translate(1000 70) scale(0.46)">${garment('dress', '#2f7d4f', { id: 'e3' })}</g>
  <text x="90" y="220" font-family="Georgia, 'Times New Roman', serif" font-size="64" font-weight="bold" fill="#6e1423">${esc(o.title)}</text>
  <text x="94" y="282" font-family="Arial, Helvetica, sans-serif" font-size="22" letter-spacing="2" fill="#6e1423" fill-opacity="0.85">${esc(o.subtitle)}</text>
  <rect x="94" y="320" width="220" height="56" fill="#b51f2a"/>
  <text x="204" y="356" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="21" font-weight="bold" letter-spacing="2" fill="#fff">SHOP THE EDIT</text>
  <text x="624" y="486" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" letter-spacing="4" fill="#000" fill-opacity="0.35">PLACEHOLDER BANNER</text>`);

// ---------- "shop by colour" card (297x407) ----------
export const colourCardSvg = (o: { name: string; hex: string; shape: Shape }) => {
  const light = luminance(o.hex) > 0.7;
  const textColour = light ? '#333' : '#fff';
  return svg(594, 814, `
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(o.hex, 0.35)}"/><stop offset="1" stop-color="${darken(o.hex, 0.25)}"/></linearGradient></defs>
  <rect width="594" height="814" fill="url(#bg)"/>
  <circle cx="297" cy="330" r="230" fill="#fff" opacity="0.14"/>
  <g transform="translate(27 -5) scale(0.9)">${garment(o.shape, light ? darken(o.hex, 0.12) : lighten(o.hex, 0.25), { id: 'k', pattern: true })}</g>
  <text x="297" y="740" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="54" font-weight="bold" letter-spacing="6" fill="${textColour}">${esc(o.name.toUpperCase())}</text>
  <text x="297" y="786" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" letter-spacing="4" fill="${textColour}" fill-opacity="0.6">PLACEHOLDER</text>`);
};

// ---------- fake bank-app payment screenshot (private; used by demo PayID orders) ----------
export const proofSvg = (o: { amount: string; reference: string; receipt: string; when: string }) => {
  const row = (y: number, k: string, v: string) =>
    `<text x="32" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="#777">${esc(k)}</text><text x="358" y="${y}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="bold" fill="#222">${esc(v)}</text><line x1="32" y1="${y + 16}" x2="358" y2="${y + 16}" stroke="#eee"/>`;
  return svg(390, 760, `
  <rect width="390" height="760" fill="#f5f5f7"/>
  <rect width="390" height="230" fill="#1f7a4d"/>
  <circle cx="195" cy="92" r="34" fill="#fff"/><path d="M178 92 l12 13 l24 -27" fill="none" stroke="#1f7a4d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="195" y="170" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#fff">Payment successful</text>
  <text x="195" y="205" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="bold" fill="#fff">${esc(o.amount)}</text>
  <rect x="16" y="250" width="358" height="330" fill="#fff"/>
  ${row(290, 'To (PayID)', 'Nepbelle')}${row(340, 'From', 'Demo Shopper')}${row(390, 'Reference', o.reference)}${row(440, 'Receipt number', o.receipt)}${row(490, 'Date', o.when)}${row(540, 'Method', 'Fast payment')}
  <text x="195" y="720" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" letter-spacing="3" fill="#999">DEMO SCREENSHOT · NOT A REAL PAYMENT</text>`);
};

// ---------- file output ----------
export const resetPlaceholderFiles = () => {
  fs.rmSync(PUBLIC_DIR, { recursive: true, force: true });
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.mkdirSync(PRIVATE_DIR, { recursive: true });
  for (const f of fs.readdirSync(PRIVATE_DIR)) if (f.startsWith('seed-proof-')) fs.unlinkSync(PRIVATE_DIR + f);
};

/** Writes into server/uploads/seed and returns the public URL the storefront will request. */
export const writePublic = (name: string, content: string) => {
  fs.writeFileSync(PUBLIC_DIR + name, content);
  return `/uploads/seed/${name}`;
};

/** Writes into server/private-uploads (never publicly served) and returns the stored file name. */
export const writePrivate = (name: string, content: string) => {
  fs.writeFileSync(PRIVATE_DIR + name, content);
  return name;
};
