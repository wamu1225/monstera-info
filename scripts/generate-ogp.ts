import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#eef4e8"/>
      <stop offset="100%" stop-color="#d4dfc8"/>
    </linearGradient>
    <radialGradient id="leafGrad" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#6FA37F"/>
      <stop offset="60%" stop-color="#3D7A52"/>
      <stop offset="100%" stop-color="#1E3F2A"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="12" height="630" fill="#2D5C3E"/>

  <g transform="translate(860, 60)">
    <path d="M150 30 C70 60 30 150 30 240 C30 360 110 480 200 510 C290 480 370 360 370 240 C370 150 330 60 250 30 Z" fill="url(#leafGrad)" stroke="#1E3F2A" stroke-width="2"/>
    <path d="M200 30 L200 510" stroke="#C9A14A" stroke-width="2" opacity="0.5"/>
    <path d="M80 110 L150 200 L80 220" fill="none" stroke="#1E3F2A" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M320 110 L250 200 L320 220" fill="none" stroke="#1E3F2A" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M50 220 L140 270 L50 310" fill="none" stroke="#1E3F2A" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M350 220 L260 270 L350 310" fill="none" stroke="#1E3F2A" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M90 360 L170 340 L130 420" fill="none" stroke="#1E3F2A" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M310 360 L230 340 L270 420" fill="none" stroke="#1E3F2A" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="120" cy="160" rx="14" ry="22" fill="#eef4e8" opacity="0.85"/>
    <ellipse cx="280" cy="160" rx="14" ry="22" fill="#eef4e8" opacity="0.85"/>
    <ellipse cx="110" cy="270" rx="16" ry="24" fill="#eef4e8" opacity="0.85"/>
    <ellipse cx="290" cy="270" rx="16" ry="24" fill="#eef4e8" opacity="0.85"/>
    <ellipse cx="150" cy="390" rx="12" ry="20" fill="#eef4e8" opacity="0.85"/>
    <ellipse cx="250" cy="390" rx="12" ry="20" fill="#eef4e8" opacity="0.85"/>
  </g>

  <text x="80" y="200" font-family="'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic',Meiryo,sans-serif" font-size="76" font-weight="700" fill="#2D5C3E">モンステラの基本ガイド</text>
  <text x="80" y="280" font-family="'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic',Meiryo,sans-serif" font-size="34" font-weight="600" fill="#1E3F2A">育て方・剪定・増やし方・トラブル対処</text>

  <text x="80" y="380" font-family="'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic',Meiryo,sans-serif" font-size="22" fill="#4b5563">人気観葉植物モンステラ（Monstera deliciosa）の</text>
  <text x="80" y="412" font-family="'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic',Meiryo,sans-serif" font-size="22" fill="#4b5563">基礎知識から安全性までを家庭目線で整理した総合情報サイト</text>

  <line x1="80" y1="500" x2="700" y2="500" stroke="#aec496" stroke-width="2"/>

  <text x="80" y="550" font-family="'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic',Meiryo,sans-serif" font-size="22" fill="#2D5C3E" font-weight="600">study-apps.com/monstera-info/</text>
</svg>`;

async function main() {
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const outPath = path.join(PUBLIC_DIR, 'ogp.png');
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log(`✓ Generated ogp.png (1200x630) at ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
