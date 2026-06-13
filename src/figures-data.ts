// 自作SVG模式図のHTML文字列を一元管理する単一の真実源（SSOT）。
// React版（figures.tsx）と prerender（scripts/prerender.ts）の双方がここを使い、
// 二重レンダラの食い違い（生タグ露出）を防ぐ。写真は著作権リスクのため使わず模式図で補う。

const LEAF_BG = '#f3f7f0';

type Hole = { cx: number; cy: number; rx: number; ry: number; rot?: number };
type Panel = {
  label: string; sub: string; blade: string;
  slits?: string[]; holes?: Hole[]; variegation?: string[];
};

function leafSvg(p: Panel): string {
  const varg = (p.variegation ?? []).map(d => `<path d="${d}" fill="#e9f3d8" opacity="0.92"/>`).join('');
  const slits = (p.slits ?? []).map(d => `<path d="${d}" fill="${LEAF_BG}"/>`).join('');
  const holes = (p.holes ?? []).map(h =>
    `<ellipse cx="${h.cx}" cy="${h.cy}" rx="${h.rx}" ry="${h.ry}" fill="${LEAF_BG}"${h.rot ? ` transform="rotate(${h.rot} ${h.cx} ${h.cy})"` : ''}/>`
  ).join('');
  return (
    `<figure class="leaf-panel">` +
    `<svg viewBox="0 0 100 110" width="100%" role="img" aria-label="${p.label}の葉のかたち">` +
    `<rect width="100" height="110" fill="${LEAF_BG}"/>` +
    `<path d="${p.blade}" fill="#3D7A52"/>` + varg +
    `<path d="M50 16 L50 96" stroke="#2c5b3c" stroke-width="1.4" opacity="0.55"/>` +
    slits + holes +
    `</svg>` +
    `<figcaption><strong>${p.label}</strong><span>${p.sub}</span></figcaption>` +
    `</figure>`
  );
}

const VARIETY_PANELS: Panel[] = [
  {
    label: 'デリシオーサ', sub: '大きく ほぼ円形・深い切れ込み',
    blade: 'M50 18 C72 18 88 34 88 56 C88 80 70 96 50 96 C30 96 12 80 12 56 C12 34 28 18 50 18 Z',
    slits: ['M88 50 L60 56 L88 62 Z', 'M84 36 L58 50 L80 40 Z', 'M84 76 L58 62 L80 72 Z',
      'M12 50 L40 56 L12 62 Z', 'M16 36 L42 50 L20 40 Z', 'M16 76 L42 62 L20 72 Z', 'M50 96 L44 66 L56 66 Z'],
    holes: [{ cx: 64, cy: 56, rx: 4, ry: 7 }, { cx: 36, cy: 56, rx: 4, ry: 7 }],
  },
  {
    label: 'ボルシギアナ', sub: 'やや小さく 楕円形・節間が長い',
    blade: 'M50 16 C66 16 78 32 78 56 C78 82 64 98 50 98 C36 98 22 82 22 56 C22 32 34 16 50 16 Z',
    slits: ['M78 48 L56 56 L78 64 Z', 'M74 34 L54 50 L72 40 Z', 'M74 78 L54 62 L72 72 Z',
      'M22 48 L44 56 L22 64 Z', 'M26 34 L46 50 L28 40 Z', 'M26 78 L46 62 L28 72 Z'],
    holes: [{ cx: 62, cy: 56, rx: 3.4, ry: 6 }, { cx: 38, cy: 56, rx: 3.4, ry: 6 }],
  },
  {
    label: 'アダンソニー', sub: '縁は切れ込まず 葉内に窓が並ぶ',
    blade: 'M50 16 C68 16 82 32 82 56 C82 82 67 98 50 98 C33 98 18 82 18 56 C18 32 32 16 50 16 Z',
    holes: [{ cx: 64, cy: 40, rx: 4, ry: 9, rot: 18 }, { cx: 66, cy: 64, rx: 4, ry: 9, rot: -18 },
      { cx: 36, cy: 40, rx: 4, ry: 9, rot: -18 }, { cx: 34, cy: 64, rx: 4, ry: 9, rot: 18 },
      { cx: 50, cy: 80, rx: 4, ry: 7 }],
  },
  {
    label: '斑入り', sub: 'デリシオーサ型に白〜黄の斑',
    blade: 'M50 18 C72 18 88 34 88 56 C88 80 70 96 50 96 C30 96 12 80 12 56 C12 34 28 18 50 18 Z',
    slits: ['M88 50 L60 56 L88 62 Z', 'M84 36 L58 50 L80 40 Z', 'M84 76 L58 62 L80 72 Z',
      'M12 50 L40 56 L12 62 Z', 'M16 36 L42 50 L20 40 Z', 'M16 76 L42 62 L20 72 Z'],
    variegation: ['M50 20 C60 22 66 32 64 46 C58 40 54 34 50 22 Z',
      'M30 64 C40 62 48 70 46 84 C38 80 32 74 30 64 Z'],
    holes: [{ cx: 64, cy: 58, rx: 3.6, ry: 6 }, { cx: 36, cy: 56, rx: 3.6, ry: 6 }],
  },
];

// figure id → { caption, innerHtml }
const FIGURE_DATA: Record<string, { caption: string; inner: string }> = {
  'variety-leaves': {
    caption: '主要品種の葉のかたちの比較（模式図）。実際の葉は個体差がありますが、切れ込みと窓の入り方が見分けの手がかりになります。',
    inner: `<div class="leaf-grid">${VARIETY_PANELS.map(leafSvg).join('')}</div>`,
  },
};

export const FIGURE_KEYS = Object.keys(FIGURE_DATA);

// 図解ブロック全体のHTML文字列（React/prerender 共用）
export function figureHtml(id: string): string | null {
  const f = FIGURE_DATA[id];
  if (!f) return null;
  return `<div class="content-figure">${f.inner}<p class="figure-caption">${f.caption}</p></div>`;
}
