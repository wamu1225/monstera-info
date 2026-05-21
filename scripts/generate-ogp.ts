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

  <g transform="translate(820, 75) scale(7.5)">
    <path d="M 32 4 C 22 4, 14 10, 10 18 L 18 22 L 8 26 C 6 32, 8 38, 12 42 L 22 38 L 14 46 C 18 54, 24 58, 32 60 L 30 50 L 34 50 L 32 60 C 40 58, 46 54, 50 46 L 42 38 L 52 42 C 56 38, 58 32, 56 26 L 46 22 L 54 18 C 50 10, 42 4, 32 4 Z" fill="url(#leafGrad)" stroke="#1E3F2A" stroke-width="0.5" stroke-linejoin="round"/>
    <path d="M32 8 L32 56" stroke="#C9A14A" stroke-width="0.4" opacity="0.4"/>
    <ellipse cx="22" cy="24" rx="2.5" ry="3.5" fill="#eef4e8" opacity="0.75"/>
    <ellipse cx="42" cy="24" rx="2.5" ry="3.5" fill="#eef4e8" opacity="0.75"/>
    <ellipse cx="20" cy="36" rx="2.5" ry="3.5" fill="#eef4e8" opacity="0.75"/>
    <ellipse cx="44" cy="36" rx="2.5" ry="3.5" fill="#eef4e8" opacity="0.75"/>
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
