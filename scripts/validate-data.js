// Validates src/data/sections.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sectionsPath = path.join(__dirname, '..', 'src', 'data', 'sections.ts');

if (!fs.existsSync(sectionsPath)) {
  console.error('Error: src/data/sections.ts not found');
  process.exit(1);
}

const src = fs.readFileSync(sectionsPath, 'utf-8').replace(/\r/g, '');

// Extract each section object as a block (id, ..., end of object at "  },")
const sectionBlocks = [];
const blockRe = /\{\s*id:\s*'([^']+)'[\s\S]*?\n  \},\n/g;
let m;
while ((m = blockRe.exec(src)) !== null) {
  sectionBlocks.push({ id: m[1], block: m[0] });
}

const expected = ['basics', 'growing', 'seasonal', 'troubles', 'selection', 'safety'];
const ids = sectionBlocks.map((b) => b.id);

const missing = expected.filter((e) => !ids.includes(e));
if (missing.length) {
  console.error(`Error: missing required section ids: ${missing.join(', ')}`);
  process.exit(1);
}

const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupes.length) {
  console.error(`Error: duplicate section ids: ${dupes.join(', ')}`);
  process.exit(1);
}

// Check each section for content quality
const errors = [];
for (const { id, block } of sectionBlocks) {
  // Check lead is not placeholder
  if (/lead:\s*'\s*（準備中）\s*'/.test(block)) {
    errors.push(`[${id}] lead is still "（準備中）"`);
  }
  // Check content is not placeholder
  if (/content:\s*'\s*（コンテンツ準備中）\s*'/.test(block)) {
    errors.push(`[${id}] content is still "（コンテンツ準備中）"`);
  }
  // Check toc is not empty
  if (/toc:\s*\[\s*\]/.test(block)) {
    errors.push(`[${id}] toc is empty`);
  }
  // Check content length (minimum 1000 chars to avoid empty/stub content)
  const contentMatch = block.match(/content:\s*`([\s\S]*?)`,\s*updatedAt/);
  if (contentMatch) {
    const contentLen = contentMatch[1].length;
    if (contentLen < 1000) {
      errors.push(`[${id}] content is too short (${contentLen} chars, minimum 1000)`);
    }
  }
  // Check toc count matches h2 count in content
  const tocMatch = block.match(/toc:\s*\[([\s\S]*?)\],\s*content:/);
  if (tocMatch && contentMatch) {
    const tocItems = [...tocMatch[1].matchAll(/'([^']+)'/g)].length;
    const h2Items = (contentMatch[1].match(/^## /gm) || []).length;
    if (tocItems !== h2Items) {
      errors.push(`[${id}] TOC has ${tocItems} items but content has ${h2Items} h2 headings`);
    }
  }
}

// --- Render-smoke check (2026-05-26 追加) ---
// Bold + tooltip ネストが再帰パースされず生表示される不具合を再発させないため、
// parseInline 相当のロジックで sections.ts の lead/content を擬似展開し、
// 出力に未展開の {{term: や ** が残っていないかを検査する。
function renderSmoke(text) {
  let remaining = text;
  let out = '';
  const patterns = [
    /\[([^\]]+)\]\(([^)]+)\)/,           // link
    /\*\*(.+?)\*\*/,                      // bold (再帰対象)
    /`([^`]+)`/,                          // code (再帰しない)
    /\{\{term:([^|}]+)(?:\|([^}]+))?\}\}/, // tooltip
  ];
  while (remaining.length > 0) {
    let earliest = null;
    for (let i = 0; i < patterns.length; i++) {
      const m = patterns[i].exec(remaining);
      if (m && (earliest === null || m.index < earliest.idx)) {
        earliest = { idx: m.index, len: m[0].length, patternIdx: i, inner: m[1] };
      }
    }
    if (!earliest) {
      out += remaining;
      break;
    }
    out += remaining.slice(0, earliest.idx);
    // bold (idx 1) と link label (idx 0) は再帰展開、code (idx 2) はリテラル
    if (earliest.patternIdx === 1 || earliest.patternIdx === 0) {
      out += renderSmoke(earliest.inner);
    } else {
      out += earliest.inner;
    }
    remaining = remaining.slice(earliest.idx + earliest.len);
  }
  return out;
}

for (const { id, block } of sectionBlocks) {
  const leadMatch = block.match(/lead:\s*'([\s\S]*?)',\s*\n/);
  const contentMatch = block.match(/content:\s*`([\s\S]*?)`,\s*updatedAt/);
  const targets = [
    leadMatch && { field: 'lead', text: leadMatch[1] },
    contentMatch && { field: 'content', text: contentMatch[1] },
  ].filter(Boolean);
  for (const t of targets) {
    const rendered = renderSmoke(t.text);
    if (rendered.includes('{{term:')) {
      errors.push(`[${id}] ${t.field} に未展開の {{term:...}} が残っている（bold等のネストでパーサが取りこぼしている可能性）`);
    }
    if (/\*\*[^*\n]+\*\*/.test(rendered)) {
      errors.push(`[${id}] ${t.field} に未展開の **bold** が残っている`);
    }
    // {{figure:KEY}} は行頭ブロックでのみ展開される。インライン位置や未登録キーを検出
    const figs = [...t.text.matchAll(/\{\{figure:([a-z0-9-]+)\}\}/g)];
    for (const f of figs) {
      const lineOk = t.text.split('\n').some((ln) => ln.trim() === f[0]);
      if (!lineOk) errors.push(`[${id}] ${t.field} の {{figure:${f[1]}}} が行単独でない（ブロックとして展開されず生タグ露出する）`);
    }
  }
}

if (errors.length) {
  console.error('Validation errors:');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

console.log(`✓ validate-data: ${ids.length} sections (${ids.join(', ')}) + render-smoke OK`);
