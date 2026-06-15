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

// 症状パネル: 葉身ベースに症状（変色/斑点/カスリ等）を重ねた模式図
const SYMPTOM_BLADE = 'M50 18 C71 18 86 33 86 56 C86 79 69 95 50 95 C31 95 14 79 14 56 C14 33 29 18 50 18 Z';
const SYMPTOM_SLITS = [
  'M86 51 L62 56 L86 61 Z', 'M14 51 L38 56 L14 61 Z',
];

function symptomLeafSvg(o: {
  label: string; sub: string;
  bladeFill?: string; edge?: string; blotches?: { cx: number; cy: number; r: number }[];
  stipple?: boolean;
}): string {
  const fill = o.bladeFill ?? '#3D7A52';
  const edge = o.edge ? `<path d="${SYMPTOM_BLADE}" fill="none" stroke="${o.edge}" stroke-width="7" stroke-linejoin="round"/>` : '';
  const blotches = (o.blotches ?? []).map(b => `<circle cx="${b.cx}" cy="${b.cy}" r="${b.r}" fill="#4a2c18" opacity="0.78"/>`).join('');
  let stip = '';
  if (o.stipple) {
    const pts: string[] = [];
    for (let gx = 26; gx <= 74; gx += 7) for (let gy = 30; gy <= 84; gy += 8) {
      if (Math.abs(gx - 50) + Math.abs(gy - 56) > 60) continue;
      const jx = gx + ((gx * gy) % 5) - 2, jy = gy + ((gx + gy) % 5) - 2;
      pts.push(`<circle cx="${jx}" cy="${jy}" r="1.1" fill="#d9d2a6" opacity="0.85"/>`);
    }
    stip = pts.join('');
  }
  // 症状図はクリップで葉の内側にだけ重ねる
  const clipId = `c_${o.label}`;
  return (
    `<figure class="leaf-panel">` +
    `<svg viewBox="0 0 100 110" width="100%" role="img" aria-label="${o.label}の葉">` +
    `<defs><clipPath id="${clipId}"><path d="${SYMPTOM_BLADE}"/></clipPath></defs>` +
    `<rect width="100" height="110" fill="${LEAF_BG}"/>` +
    `<path d="${SYMPTOM_BLADE}" fill="${fill}"/>` +
    `<g clip-path="url(#${clipId})">${blotches}${stip}</g>` +
    edge +
    SYMPTOM_SLITS.map(d => `<path d="${d}" fill="${LEAF_BG}"/>`).join('') +
    `<path d="M50 16 L50 96" stroke="#2c5b3c" stroke-width="1.2" opacity="0.5"/>` +
    `</svg>` +
    `<figcaption><strong>${o.label}</strong><span>${o.sub}</span></figcaption>` +
    `</figure>`
  );
}

const SYMPTOM_PANELS: string[] = [
  symptomLeafSvg({ label: '黄変', sub: '下葉から全体が黄色く', bladeFill: '#bcae3f' }),
  symptomLeafSvg({ label: '葉先の枯れ込み', sub: '縁が茶色くパリパリに', edge: '#7a4a23' }),
  symptomLeafSvg({ label: '葉焼け', sub: '褐色〜黒の斑点', blotches: [{ cx: 60, cy: 42, r: 6 }, { cx: 66, cy: 60, r: 4.5 }, { cx: 40, cy: 52, r: 5 }, { cx: 52, cy: 72, r: 4 }] }),
  symptomLeafSvg({ label: 'ハダニ被害', sub: '細かなカスリ状の白点', bladeFill: '#5f7a4e', stipple: true }),
];

// 斑入りパネル共通の葉body（デリシオーサ型・切れ込み付き）
const VARG_BLADE = 'M50 18 C72 18 88 34 88 56 C88 80 70 96 50 96 C30 96 12 80 12 56 C12 34 28 18 50 18 Z';
const VARG_SLITS = ['M88 51 L62 56 L88 61 Z', 'M12 51 L38 56 L12 61 Z'];
function vargFrame(label: string, sub: string, bladeFill: string, overlay: string): string {
  const clip = `vc_${label}`;
  return (
    `<figure class="leaf-panel">` +
    `<svg viewBox="0 0 100 110" width="100%" role="img" aria-label="${label}の葉">` +
    `<defs><clipPath id="${clip}"><path d="${VARG_BLADE}"/></clipPath></defs>` +
    `<rect width="100" height="110" fill="${LEAF_BG}"/>` +
    `<path d="${VARG_BLADE}" fill="${bladeFill}"/>` +
    `<g clip-path="url(#${clip})">${overlay}</g>` +
    VARG_SLITS.map(d => `<path d="${d}" fill="${LEAF_BG}"/>`).join('') +
    `<path d="M50 16 L50 96" stroke="#2c5b3c" stroke-width="1.2" opacity="0.5"/>` +
    `</svg>` +
    `<figcaption><strong>${label}</strong><span>${sub}</span></figcaption>` +
    `</figure>`
  );
}
function symptomVarg(label: string, sub: string, patches: { cx: number; cy: number; r: number }[]): string {
  const ov = patches.map(p => `<circle cx="${p.cx}" cy="${p.cy}" r="${p.r}" fill="#eef3df"/>`).join('');
  return vargFrame(label, sub, '#3D7A52', ov);
}
function symptomVargHalf(label: string, sub: string): string {
  return vargFrame(label, sub, '#3D7A52', `<rect x="50" y="0" width="50" height="110" fill="#eef3df"/>`);
}
function symptomVargGhost(label: string, sub: string): string {
  return vargFrame(label, sub, '#eef3df', `<path d="M30 70 C40 68 46 78 44 90 C36 86 30 80 30 70 Z" fill="#3D7A52" opacity="0.55"/>`);
}

// 剪定：節を守る位置の単体注釈図（茎の側面）
function pruningNodeSvg(): string {
  return (
    `<svg class="diagram-single" viewBox="0 0 300 210" width="100%" role="img" aria-label="剪定で切る位置と節・気根の関係図">` +
    `<rect width="300" height="210" fill="${LEAF_BG}"/>` +
    // 茎（下から上へ・やや斜め）
    `<path d="M120 196 L150 96 L150 40" stroke="#5a8a64" stroke-width="20" stroke-linecap="round" fill="none"/>` +
    // 下の節（ふくらみ）
    `<ellipse cx="135" cy="150" rx="15" ry="9" fill="#3D7A52" transform="rotate(-72 135 150)"/>` +
    // 上の節
    `<ellipse cx="150" cy="78" rx="15" ry="9" fill="#3D7A52"/>` +
    // 気根（下の節から下へ）
    `<path d="M132 154 C112 168 110 186 120 198" stroke="#9a7b53" stroke-width="5" fill="none" stroke-linecap="round"/>` +
    // 葉柄のあと（上の節から右へ）
    `<path d="M163 76 C182 70 192 74 200 70" stroke="#6b8f57" stroke-width="7" fill="none" stroke-linecap="round"/>` +
    // 潜伏芽（上の節の芽）
    `<circle cx="150" cy="70" r="4.5" fill="#c9a14a"/>` +
    // 切る位置（上の節の約1cm上・破線）
    `<line x1="118" y1="54" x2="184" y2="54" stroke="#c0392b" stroke-width="2.4" stroke-dasharray="6 4"/>` +
    `<text x="196" y="50" font-size="12" fill="#c0392b" font-weight="700">ここで切る</text>` +
    `<text x="196" y="63" font-size="10" fill="#c0392b">節の約1cm上</text>` +
    // ラベル（重なり回避のため要素に引出線を添える）
    `<line x1="150" y1="78" x2="178" y2="92" stroke="#1E3F2A" stroke-width="0.8"/>` +
    `<text x="181" y="96" font-size="11" fill="#1E3F2A" font-weight="700">節</text>` +
    `<text x="86" y="120" font-size="11" fill="#1E3F2A">節間</text>` +
    `<line x1="120" y1="186" x2="92" y2="190" stroke="#6b5836" stroke-width="0.8"/>` +
    `<text x="58" y="194" font-size="11" fill="#6b5836" font-weight="700">気根</text>` +
    `</svg>`
  );
}

// シュウ酸カルシウム針状結晶（ラフィド）の刺激機構（2段階の模式図）
function raphideSvg(): string {
  // 細胞内の針束
  const needlesInCell: string[] = [];
  for (let k = -3; k <= 3; k++) {
    needlesInCell.push(`<line x1="${66 + k * 3}" y1="48" x2="${72 + k * 3}" y2="104" stroke="#dfe7ef" stroke-width="2"/>`);
  }
  // 粘膜に刺さる針
  const stuck: string[] = [];
  const xs = [196, 212, 228, 246, 262];
  for (const x of xs) stuck.push(`<line x1="${x}" y1="82" x2="${x + 6}" y2="120" stroke="#7b8a99" stroke-width="2.4"/>`);
  return (
    `<svg class="diagram-single" viewBox="0 0 300 168" width="100%" role="img" aria-label="シュウ酸カルシウム針状結晶が粘膜を刺激する仕組みの図">` +
    `<rect width="300" height="168" fill="${LEAF_BG}"/>` +
    // 左：細胞（idioblast）と針束
    `<ellipse cx="70" cy="78" rx="46" ry="40" fill="#eef3df" stroke="#3D7A52" stroke-width="2"/>` +
    needlesInCell.join('') +
    `<text x="70" y="142" font-size="11" fill="#1E3F2A" font-weight="700" text-anchor="middle">細胞の中の針の束</text>` +
    `<text x="70" y="156" font-size="10" fill="#4f7a3f" text-anchor="middle">（ラフィド）</text>` +
    // 中央：矢印「噛むと」
    `<text x="150" y="70" font-size="11" fill="#6b5836" text-anchor="middle">噛むと</text>` +
    `<path d="M126 80 L174 80" stroke="#6b5836" stroke-width="2.4"/>` +
    `<path d="M174 80 L166 75 M174 80 L166 85" stroke="#6b5836" stroke-width="2.4" fill="none"/>` +
    // 右：粘膜に刺さる
    `<rect x="180" y="116" width="100" height="14" fill="#f3c9c4"/>` +
    `<path d="M180 116 H280" stroke="#d98b82" stroke-width="2"/>` +
    stuck.join('') +
    `<text x="230" y="150" font-size="11" fill="#9b3a30" font-weight="700" text-anchor="middle">粘膜に刺さって刺激</text>` +
    `</svg>`
  );
}

// 鉢の断面（用土の配合・根・鉢底の軽石・排水）
function potSoilSvg(): string {
  return (
    `<svg class="diagram-single" viewBox="0 0 300 200" width="100%" role="img" aria-label="鉢の断面と用土の配合の図">` +
    `<rect width="300" height="200" fill="${LEAF_BG}"/>` +
    // 鉢（台形）
    `<path d="M70 50 L210 50 L196 178 L84 178 Z" fill="#c8b09a" stroke="#8a6f57" stroke-width="2"/>` +
    // 用土
    `<path d="M74 56 L206 56 L195 158 L85 158 Z" fill="#6b4f3a"/>` +
    // 鉢底の軽石層
    `<path d="M85 158 L195 158 L191 172 L89 172 Z" fill="#cfd3d6"/>` +
    `${[100, 120, 140, 160, 180].map(x => `<circle cx="${x}" cy="165" r="2.4" fill="#9aa0a4"/>`).join('')}` +
    // 根（中央から下へ）
    `<path d="M140 56 C138 90 150 120 142 150 M140 80 C124 96 118 120 120 140 M140 80 C156 96 164 118 162 142" stroke="#e7d8b0" stroke-width="2" fill="none"/>` +
    // 茎
    `<path d="M140 56 L140 30" stroke="#5a8a64" stroke-width="6" stroke-linecap="round"/>` +
    `<path d="M140 38 C150 30 162 30 168 34 C160 42 148 44 140 40 Z" fill="#3D7A52"/>` +
    // 排水穴と水滴
    `<rect x="134" y="176" width="12" height="5" fill="#6b4f3a"/>` +
    `<path d="M140 184 C137 188 137 192 140 193 C143 192 143 188 140 184 Z" fill="#5b9bd5"/>` +
    // 配合バー（右）
    `<rect x="232" y="56" width="20" height="71" fill="#cdb48f" stroke="#8a6f57" stroke-width="1"/>` +
    `<rect x="232" y="127" width="20" height="31" fill="#5a4030" stroke="#8a6f57" stroke-width="1"/>` +
    `<text x="258" y="92" font-size="10" fill="#1E3F2A">赤玉土7</text>` +
    `<text x="258" y="146" font-size="10" fill="#1E3F2A">腐葉土3</text>` +
    // ラベル
    `<text x="150" y="192" font-size="10" fill="#6b5836" text-anchor="middle">鉢底に軽石・排水穴</text>` +
    `</svg>`
  );
}

// 年間サイクルのリング図（12か月・生育/休眠と作業適期）
function yearCycleSvg(): string {
  const cx = 150, cy = 150, R = 120, r = 78;
  // 月ごとの色（休眠=青灰 / 春=淡緑 / 生育=濃緑 / 秋=琥珀）
  const seasonColor = (m: number): string => {
    if (m === 12 || m <= 2) return '#aebfc9';
    if (m <= 4) return '#bfe0a8';
    if (m <= 9) return '#5a9e63';
    return '#e2b878';
  };
  const pol = (deg: number, rad: number) => {
    const a = (deg - 90) * Math.PI / 180;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  };
  let seg = '';
  for (let i = 0; i < 12; i++) {
    const m = i + 1;
    const a0 = i * 30, a1 = (i + 1) * 30;
    const [ox0, oy0] = pol(a0, R), [ox1, oy1] = pol(a1, R);
    const [ix1, iy1] = pol(a1, r), [ix0, iy0] = pol(a0, r);
    seg += `<path d="M${ox0.toFixed(1)} ${oy0.toFixed(1)} A${R} ${R} 0 0 1 ${ox1.toFixed(1)} ${oy1.toFixed(1)} L${ix1.toFixed(1)} ${iy1.toFixed(1)} A${r} ${r} 0 0 0 ${ix0.toFixed(1)} ${iy0.toFixed(1)} Z" fill="${seasonColor(m)}" stroke="#f3f7f0" stroke-width="1.5"/>`;
    const [lx, ly] = pol(a0 + 15, (R + r) / 2);
    const dark = m >= 5 && m <= 9;
    seg += `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" font-size="13" font-weight="700" text-anchor="middle" fill="${dark ? '#ffffff' : '#33433a'}">${m}</text>`;
  }
  // 肥料の適期リング（4〜9月）= 外周の弧
  const fa: string[] = [];
  for (let i = 3; i <= 8; i++) {
    const [x0, y0] = pol(i * 30 + 2, R + 9), [x1, y1] = pol((i + 1) * 30 - 2, R + 9);
    fa.push(`<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${R + 9} ${R + 9} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="#c9a14a" stroke-width="4" fill="none" stroke-linecap="round"/>`);
  }
  const [flx, fly] = pol(195, R + 9);
  return (
    `<svg class="diagram-single" viewBox="0 0 300 300" width="100%" role="img" aria-label="モンステラの1年の世話のサイクル図">` +
    `<rect width="300" height="300" fill="${LEAF_BG}"/>` +
    seg + fa.join('') +
    `<text x="${(flx - 6).toFixed(1)}" y="${fly.toFixed(1)}" font-size="10" fill="#a07a1f" text-anchor="end">肥料 4〜9月</text>` +
    // 中央
    `<circle cx="${cx}" cy="${cy}" r="${r - 4}" fill="#f3f7f0"/>` +
    `<text x="${cx}" y="${cy - 16}" font-size="13" font-weight="700" text-anchor="middle" fill="#1E3F2A">生育期</text>` +
    `<text x="${cx}" y="${cy}" font-size="12" text-anchor="middle" fill="#3D7A52">5〜9月</text>` +
    `<text x="${cx}" y="${cy + 20}" font-size="11" text-anchor="middle" fill="#6b7a82">休眠期 12〜2月</text>` +
    `<text x="${cx}" y="${cy + 36}" font-size="10" text-anchor="middle" fill="#9b7b3a">植替/剪定/挿木 5〜7月</text>` +
    `</svg>`
  );
}

// 切れ込み・穴の役割（光を下葉へ通す／風雨を受け流す）の模式図
function fenestrationSvg(): string {
  // 上の大きな葉（穴あき）と、穴を通った光が届く下の小さな葉
  const holes = [{ x: 120, y: 78 }, { x: 158, y: 70 }, { x: 188, y: 84 }];
  const lightRays = holes.map(h =>
    `<line x1="${h.x - 14}" y1="26" x2="${h.x}" y2="${h.y}" stroke="#e6b800" stroke-width="1.6" stroke-dasharray="3 3"/>` +
    `<line x1="${h.x}" y1="${h.y}" x2="${h.x + 6}" y2="150" stroke="#e6b800" stroke-width="1.6" stroke-dasharray="3 3"/>`
  ).join('');
  return (
    `<svg class="diagram-single" viewBox="0 0 300 184" width="100%" role="img" aria-label="葉の切れ込みと穴が光を下の葉に通し風雨を受け流す仕組みの図">` +
    `<rect width="300" height="184" fill="${LEAF_BG}"/>` +
    // 太陽
    `<circle cx="40" cy="24" r="11" fill="#f4c430"/>` +
    `${[0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r = a * Math.PI / 180; return `<line x1="${(40 + 14 * Math.cos(r)).toFixed(1)}" y1="${(24 + 14 * Math.sin(r)).toFixed(1)}" x2="${(40 + 19 * Math.cos(r)).toFixed(1)}" y2="${(24 + 19 * Math.sin(r)).toFixed(1)}" stroke="#f4c430" stroke-width="2"/>`; }).join('')}` +
    `<text x="62" y="22" font-size="10" fill="#a07a1f">ひかり・風雨</text>` +
    // 光線（穴を通る）
    lightRays +
    // 上の大きな葉
    `<path d="M70 84 C70 58 110 44 150 44 C190 44 230 58 230 84 C230 104 195 116 150 116 C105 116 70 104 70 84 Z" fill="#3D7A52"/>` +
    `<path d="M230 80 L196 84 L230 88 Z" fill="${LEAF_BG}"/>` +
    `<path d="M70 80 L104 84 L70 88 Z" fill="${LEAF_BG}"/>` +
    holes.map(h => `<ellipse cx="${h.x}" cy="${h.y}" rx="5.5" ry="8" fill="${LEAF_BG}"/>`).join('') +
    // 風の矢印（切れ込みを抜ける）
    `<path d="M244 84 h16" stroke="#7fa8c9" stroke-width="2" fill="none"/><path d="M260 84 l-5 -3 M260 84 l-5 3" stroke="#7fa8c9" stroke-width="2" fill="none"/>` +
    // 下の小さな葉（木漏れ日が届く）
    `<path d="M120 158 C120 148 135 142 150 142 C165 142 180 148 180 158 C180 166 167 171 150 171 C133 171 120 166 120 158 Z" fill="#6aa57c"/>` +
    `<circle cx="146" cy="156" r="2" fill="#f4e3a1"/><circle cx="158" cy="159" r="2" fill="#f4e3a1"/>` +
    `<text x="150" y="182" font-size="10" fill="#1E3F2A" text-anchor="middle">下の葉にも光が届く</text>` +
    `</svg>`
  );
}

// figure id → { caption, innerHtml }
const FIGURE_DATA: Record<string, { caption: string; inner: string }> = {
  'fenestration-why': {
    caption: '切れ込みと穴の役割（模式図）。穴を通った光が株の下のほうの葉にも届き、強い風雨は切れ込みを通り抜けて葉へのダメージを減らします。この構造は葉が開く前（筒状の新芽の段階）に作られます。',
    inner: `<div class="diagram-wrap">${fenestrationSvg()}</div>`,
  },
  'year-cycle': {
    caption: '1年の世話のサイクル（模式図）。濃い緑が生育期（5〜9月＝水やり・肥料をしっかり）、青灰が休眠期（12〜2月＝乾かし気味・保温）。外周の金色の弧は肥料の適期、植え替え・剪定・挿し木は5〜7月がねらいめです。地域・室内環境で前後します。',
    inner: `<div class="diagram-wrap">${yearCycleSvg()}</div>`,
  },
  'raphide-mechanism': {
    caption: '毒性の仕組み（模式図）。葉や茎の細胞には針状の結晶（不溶性シュウ酸カルシウム＝ラフィド）が束で詰まっており、噛むと飛び出して口の粘膜に刺さり、機械的に刺激します。体に吸収される全身毒ではなく、刺さった口まわりの局所的な刺激です。',
    inner: `<div class="diagram-wrap">${raphideSvg()}</div>`,
  },
  'pot-soil': {
    caption: '用土と鉢の断面（模式図）。基本は赤玉土7：完熟腐葉土3。鉢底に軽石を入れ、排水穴から余分な水が抜ける状態にすると根腐れを防げます。鉢は今より1サイズ大きい程度にとどめます。',
    inner: `<div class="diagram-wrap">${potSoilSvg()}</div>`,
  },
  'pruning-node': {
    caption: '剪定の基本は「節を残す」こと（模式図）。茎を間引くときは節の約1cm上を水平に切ります。節には芽・気根・葉柄が集まり、ここから先の成長が決まります。',
    inner: `<div class="diagram-wrap">${pruningNodeSvg()}</div>`,
  },
  'variegation-patterns': {
    caption: '斑の入り方のタイプ（模式図）。散り斑は安定しやすく、ハーフムーンや全斑は美しい一方で緑戻り・致死性白化のリスクが高まります。バランス型（白3〜5割）が育てやすい目安です。',
    inner: `<div class="leaf-grid">` + [
      symptomVarg('散り斑', '細かく散る・安定しやすい', [
        { cx: 40, cy: 44, r: 3 }, { cx: 60, cy: 40, r: 2.6 }, { cx: 52, cy: 58, r: 3.2 },
        { cx: 38, cy: 66, r: 2.4 }, { cx: 64, cy: 64, r: 2.8 }, { cx: 50, cy: 78, r: 2.6 }, { cx: 44, cy: 54, r: 2 },
      ]),
      symptomVargHalf('ハーフムーン', '半分が白・リスク高'),
      symptomVarg('バランス斑', '白3〜5割・育てやすい目安', [
        { cx: 60, cy: 40, r: 9 }, { cx: 64, cy: 62, r: 8 }, { cx: 54, cy: 78, r: 6 },
      ]),
      symptomVargGhost('全斑（幽霊葉）', 'ほぼ白・枯死リスク'),
    ].join('') + `</div>`,
  },
  'leaf-symptoms': {
    caption: 'よくある葉の不調の見え方（模式図）。黄変・葉先枯れ・葉焼け・ハダニ被害は原因も対処も異なるため、まず見た目で切り分けるのが近道です。',
    inner: `<div class="leaf-grid">${SYMPTOM_PANELS.join('')}</div>`,
  },
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
