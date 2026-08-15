import * as fs from 'fs';
import * as path from 'path';
import { sections } from '../src/data/sections.ts';
import { FAQ_BY_SECTION } from '../src/data/faqs.ts';
import { glossary } from '../src/data/glossary.ts';
import { symptomCategories } from '../src/data/symptoms.ts';
import type { Severity } from '../src/data/symptoms.ts';
import { getCurrentMonthTip } from '../src/data/monthly-tips.ts';
import { checkCategories, checkItems } from '../src/data/variegated-checklist.ts';
import type { CheckCategory } from '../src/data/variegated-checklist.ts';
import { varieties, quizQuestions } from '../src/data/variety-quiz.ts';
import type { VarietyId } from '../src/data/variety-quiz.ts';
import { figureHtml } from '../src/figures-data.ts';
import { referencesHtml } from '../src/references.ts';
import { sectionIconSvg } from '../src/section-icons.ts';
import { ABOUT_CONTENT, PRIVACY_CONTENT } from '../src/data/static-pages.ts';

const ico = (name: string, size: number, color = '#2D5C3E') =>
  `<span style="color:${color};display:inline-flex;vertical-align:middle">${sectionIconSvg(name, size)}</span>`;

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
const BASE_URL = 'https://study-apps.com/monstera-info';

console.log('--- monstera-info SSG Pre-rendering ---');

if (!fs.existsSync(INDEX_HTML_PATH)) {
  console.error('Error: dist/index.html not found. Run "npm run build" first.');
  process.exit(1);
}

const templateHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');

// ── Markdown → HTML 変換（クライアントの parseContent と同等の出力） ──
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugifyAscii(_text: string, index: number): string {
  return `section-${index}`;
}

function parseInlineToHtml(text: string): string {
  let result = '';
  let remaining = text;
  const patterns: { re: RegExp; render: (m: RegExpExecArray) => string }[] = [
    {
      re: /\[([^\]]+)\]\(([^)]+)\)/,
      render: (m) => {
        const label = escapeHtml(m[1]);
        const href = m[2];
        const isExternal = /^https?:\/\//.test(href);
        const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${escapeHtml(href)}"${attrs}>${label}</a>`;
      },
    },
    { re: /\*\*(.+?)\*\*/, render: (m) => `<strong>${parseInlineToHtml(m[1])}</strong>` },
    { re: /`([^`]+)`/, render: (m) => `<code class="inline-code">${escapeHtml(m[1])}</code>` },
    {
      re: /\{\{term:([^|}]+)(?:\|([^}]+))?\}\}/,
      render: (m) => {
        const term = m[1];
        const label = m[2] ?? term;
        const entry = glossary.find((g) => g.term === term);
        if (!entry) return escapeHtml(label);
        return `<abbr title="${escapeHtml(entry.description)}" style="text-decoration:underline dotted #2D5C3E;text-underline-offset:3px;cursor:help;font-weight:700;color:#1E3F2A">${escapeHtml(label)}</abbr>`;
      },
    },
  ];

  while (remaining.length > 0) {
    let earliest: { idx: number; len: number; html: string } | null = null;
    for (const p of patterns) {
      const m = p.re.exec(remaining);
      if (m && (earliest === null || m.index < earliest.idx)) {
        earliest = { idx: m.index, len: m[0].length, html: p.render(m) };
      }
    }
    if (!earliest) {
      result += escapeHtml(remaining);
      break;
    }
    if (earliest.idx > 0) result += escapeHtml(remaining.slice(0, earliest.idx));
    result += earliest.html;
    remaining = remaining.slice(earliest.idx + earliest.len);
  }
  return result;
}

function markdownToHtml(content: string): string {
  const lines = content.split('\n');
  const out: string[] = [];
  let i = 0;
  let h2Index = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') { i++; continue; }

    if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3);
      const slug = slugifyAscii(text, h2Index++);
      out.push(`<h2 id="${slug}" class="content-h2">${parseInlineToHtml(text)}</h2>`);
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4);
      out.push(`<h3 class="content-h3">${parseInlineToHtml(text)}</h3>`);
      i++;
      continue;
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const rows = tableLines.map((r) => r.split('|').slice(1, -1).map((c) => c.trim()));
        const isSep = (r: string[]) => r.every((c) => /^[-:]+$/.test(c));
        const header = rows[0];
        const data = rows.slice(1).filter((r) => !isSep(r));
        const headerHtml = header.map((c) => `<th>${parseInlineToHtml(c)}</th>`).join('');
        const bodyHtml = data
          .map((row) => `<tr>${row.map((c) => `<td>${parseInlineToHtml(c)}</td>`).join('')}</tr>`)
          .join('');
        out.push(
          `<div class="content-table-wrap"><table class="content-table"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`
        );
      }
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      out.push(`<ol class="content-ol">${items.map((it) => `<li>${parseInlineToHtml(it)}</li>`).join('')}</ol>`);
      continue;
    }

    if (trimmed.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      out.push(`<ul class="content-ul">${items.map((it) => `<li>${parseInlineToHtml(it)}</li>`).join('')}</ul>`);
      continue;
    }

    if (trimmed.startsWith('💡 ')) {
      out.push(`<p class="callout callout-tip">${parseInlineToHtml(trimmed.slice(2).trim())}</p>`);
      i++; continue;
    }
    if (trimmed.startsWith('⚠️ ')) {
      out.push(`<p class="callout callout-warning">${parseInlineToHtml(trimmed.slice(2).trim())}</p>`);
      i++; continue;
    }
    if (trimmed.startsWith('📖 ')) {
      out.push(`<p class="callout callout-info">${parseInlineToHtml(trimmed.slice(2).trim())}</p>`);
      i++; continue;
    }
    if (trimmed.startsWith('✅ ')) {
      out.push(`<p class="callout callout-success">${parseInlineToHtml(trimmed.slice(2).trim())}</p>`);
      i++; continue;
    }

    if (trimmed === '---') {
      out.push('<hr>');
      i++; continue;
    }

    const figMatch = trimmed.match(/^\{\{figure:([a-z0-9-]+)\}\}$/);
    if (figMatch) {
      const html = figureHtml(figMatch[1]);
      if (html) out.push(html);
      i++; continue;
    }

    out.push(`<p class="content-p">${parseInlineToHtml(trimmed)}</p>`);
    i++;
  }

  return out.join('\n');
}

function buildTocHtml(toc: string[]): string {
  if (!toc.length) return '';
  const items = toc
    .map((it, idx) => `<li><a href="#${slugifyAscii(it, idx)}">${escapeHtml(it)}</a></li>`)
    .join('');
  return `<nav class="toc"><div class="toc-title">目次</div><ol class="toc-list">${items}</ol></nav>`;
}

// ── ルート index.html に静的フォールバック + JSON-LD を注入 ──
const PRERENDER_GROUPS: { label: string; icon: string; description: string; sectionIds: string[] }[] = [
  { label: '知る・選ぶ', icon: 'leaf', description: '迎える前にまず理解する基礎と、購入時のチェックポイント', sectionIds: ['basics', 'selection'] },
  { label: '育てる', icon: 'sun', description: '光・水・温度の基本から、季節ごとの管理・剪定・増やし方まで', sectionIds: ['growing', 'seasonal'] },
  { label: '守る', icon: 'shield', description: 'トラブルの早期発見と対処、ペットや家族と安全に暮らすための注意', sectionIds: ['troubles', 'safety'] },
];

const sectionListHtml = PRERENDER_GROUPS
  .map((group) => {
    const groupItems = group.sectionIds
      .map((id) => sections.find((s) => s.id === id))
      .filter((s): s is (typeof sections)[number] => Boolean(s))
      .map(
        (s) =>
          `<li style="margin-bottom:14px"><a href="/monstera-info/${s.id}/" style="color:#2D5C3E;font-weight:600;text-decoration:none">${escapeHtml(s.shortTitle)}</a><br><span style="color:#555;font-size:0.9rem">${escapeHtml(s.description)}</span></li>`
      )
      .join('\n');
    return `<div style="margin:24px 0 16px"><div style="font-size:0.78rem;color:#6b7280;font-weight:700;margin-bottom:4px;letter-spacing:0.05em">${ico(group.icon, 15)} ${escapeHtml(group.label)}</div><div style="font-size:0.85rem;color:#4b5563;margin-bottom:10px">${escapeHtml(group.description)}</div><ul style="list-style:none;padding:0;margin:0">${groupItems}</ul></div>`;
  })
  .join('\n');

const tip = getCurrentMonthTip();
const monthlyTipHtml = `<section style="background:#fff;border:1px solid #d4dfc8;border-left:5px solid #2D5C3E;border-radius:10px;padding:20px 22px;margin:0 0 24px"><div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px"><span style="font-size:2rem;line-height:1" aria-hidden="true">${tip.emoji}</span><div><div style="font-size:0.82rem;color:#6b7280;font-weight:600;margin-bottom:4px"><span style="background:#2D5C3E;color:#fff;padding:2px 10px;border-radius:999px;margin-right:8px">${tip.month}月</span><span>${escapeHtml(tip.season)}</span></div><h2 style="font-size:1.1rem;font-weight:700;color:#1f2937;margin:0;line-height:1.5">${escapeHtml(tip.headline)}</h2></div></div><ul style="list-style:none;margin:0;padding:0">${tip.points
  .map((p, i) => {
    const related = p.relatedSectionId ? sections.find((s) => s.id === p.relatedSectionId) : null;
    const link = related ? ` <a href="/monstera-info/${related.id}/" style="color:#2D5C3E;font-weight:600;font-size:0.85rem;text-decoration:none">${escapeHtml(related.shortTitle)} →</a>` : '';
    return `<li style="padding:10px 0;${i > 0 ? 'border-top:1px solid #d4dfc8' : ''}"><div style="font-weight:700;color:#1E3F2A;font-size:0.95rem;margin-bottom:2px">${escapeHtml(p.label)}</div><div style="font-size:0.9rem;color:#4b5563;line-height:1.75">${escapeHtml(p.detail)}${link}</div></li>`;
  })
  .join('')}</ul></section>`;

const rootStaticContent = `<article id="static-fallback" style="font-family:sans-serif;line-height:1.7;max-width:920px;margin:0 auto;padding:24px 16px">
  <h1 style="font-size:1.8rem;font-weight:700;border-bottom:2px solid #2D5C3E;padding-bottom:8px;margin-bottom:16px;color:#2D5C3E">モンステラの基本ガイド</h1>
  <p style="color:#444;margin-bottom:24px">人気観葉植物モンステラ（Monstera deliciosa）の総合情報サイト。基礎知識・育て方・剪定や増やし方・病害虫対処・選び方・ペット安全性まで、家庭で実践しやすい形でまとめています。</p>
  ${monthlyTipHtml}
  <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:12px">セクション一覧</h2>
  <ul style="list-style:none;padding:0">
${sectionListHtml}
  </ul>
  <nav style="margin-top:32px;border-top:1px solid #ddd;padding-top:16px;display:flex;gap:16px;flex-wrap:wrap">
    <a href="/monstera-info/about/" style="color:#2D5C3E">サイトについて</a>
    <a href="/monstera-info/privacy/" style="color:#2D5C3E">プライバシーポリシー</a>
  </nav>
  <p style="font-size:0.8rem;color:#888;margin-top:20px;border-top:1px solid #eee;padding-top:12px">※本サイトは一般的な情報を提供するもので、専門家の助言の代替ではありません。ペットの誤食など緊急時は獣医師にご相談ください。</p>
</article>`;

const homeWebSiteJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'モンステラの基本ガイド',
  url: `${BASE_URL}/`,
  description:
    'モンステラ（Monstera deliciosa）の基礎知識・育て方・剪定・増やし方・病害虫対処・選び方・ペット安全性まで網羅した総合情報サイト。',
  inLanguage: 'ja',
  publisher: {
    '@type': 'Organization',
    name: 'study-apps.com',
    url: 'https://study-apps.com/',
  },
});

const homeItemListJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'モンステラの基本ガイド：セクション一覧',
  itemListElement: sections.map((s, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: s.shortTitle,
    description: s.description,
    url: `${BASE_URL}/${s.id}/`,
  })),
});

let rootIndexHtml = templateHtml.replace('<div id="root"></div>', `<div id="root">${rootStaticContent}</div>`);
rootIndexHtml = rootIndexHtml.replace(
  '</head>',
  `<script type="application/ld+json">${homeWebSiteJsonLd}</script>\n  <script type="application/ld+json">${homeItemListJsonLd}</script>\n  </head>`
);
fs.writeFileSync(INDEX_HTML_PATH, rootIndexHtml);

// ── サブディレクトリ用テンプレート（アセットパスを ../ に書き換え） ──
const subDirTemplateHtml = templateHtml
  .replace(/href="\.\/assets\//g, 'href="../assets/')
  .replace(/src="\.\/assets\//g, 'src="../assets/')
  .replace(/href="\.\/favicon.svg"/g, 'href="../favicon.svg"');

let generatedCount = 0;

function buildFaqHtml(sectionId: string): string {
  const faqs = FAQ_BY_SECTION[sectionId];
  if (!faqs || faqs.length === 0) return '';
  const items = faqs
    .map(
      (qa) =>
        `<details style="background:#fff;border:1px solid #d4dfc8;border-radius:8px;margin-bottom:8px;padding:14px 18px"><summary style="cursor:pointer;font-weight:600;color:#1f2937">Q. ${escapeHtml(qa.question)}</summary><p style="margin:10px 0 0;color:#4b5563;line-height:1.85">A. ${escapeHtml(qa.answer)}</p></details>`
    )
    .join('');
  return `<section style="margin:40px 0;padding:24px;background:#eef4e8;border:1px solid #d4dfc8;border-radius:12px"><h3 style="margin:0 0 16px;color:#2D5C3E;font-size:1.05rem">❓ よくある質問</h3>${items}</section>`;
}

function formatDateJa(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${m[1]}年${parseInt(m[2], 10)}月${parseInt(m[3], 10)}日`;
}

function buildChapterNav(currentId: string): string {
  const idx = sections.findIndex((s) => s.id === currentId);
  if (idx === -1) return '';
  const prev = idx > 0 ? sections[idx - 1] : null;
  const next = idx < sections.length - 1 ? sections[idx + 1] : null;
  if (!prev && !next) return '';
  const prevHtml = prev
    ? `<a href="/monstera-info/${prev.id}/" style="display:block;flex:1;padding:14px 16px;background:#fff;border:1px solid #d4dfc8;border-radius:10px;text-decoration:none;color:#1f2937"><div style="font-size:0.78rem;color:#6b7280;margin-bottom:4px">← 前の章</div><div style="font-size:0.95rem;font-weight:700;color:#2D5C3E">${ico(prev.icon, 15)} ${escapeHtml(prev.shortTitle)}</div></a>`
    : `<span style="flex:1"></span>`;
  const nextHtml = next
    ? `<a href="/monstera-info/${next.id}/" style="display:block;flex:1;padding:14px 16px;background:#fff;border:1px solid #d4dfc8;border-radius:10px;text-decoration:none;color:#1f2937;text-align:right"><div style="font-size:0.78rem;color:#6b7280;margin-bottom:4px">次の章 →</div><div style="font-size:0.95rem;font-weight:700;color:#2D5C3E">${ico(next.icon, 15)} ${escapeHtml(next.shortTitle)}</div></a>`
    : `<span style="flex:1"></span>`;
  return `<nav style="display:flex;gap:10px;margin:32px 0">${prevHtml}${nextHtml}</nav>`;
}

function buildSectionFallback(s: (typeof sections)[number]): string {
  const tocHtml = buildTocHtml(s.toc);
  const contentHtml = markdownToHtml(s.content);
  const faqHtml = buildFaqHtml(s.id);
  const chapterNavHtml = buildChapterNav(s.id);
  const leadHtml = s.lead && s.lead !== '（準備中）'
    ? `<p class="lead" style="color:#555;font-size:1.05rem;margin:16px 0 24px">${parseInlineToHtml(s.lead)}</p>`
    : '';
  const isYMYL = s.id === 'safety';
  const disclaimerHtml = isYMYL
    ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-left:4px solid #dc2626;border-radius:6px;padding:14px 16px;margin:0 0 28px;font-size:0.92rem;color:#7f1d1d;line-height:1.75"><strong style="display:block;margin-bottom:4px">ペット・小児の誤食にご注意ください</strong>モンステラは不溶性シュウ酸カルシウムを含むため、犬・猫・小児が誤食すると口腔の刺激や嘔吐などを引き起こすことがあります。誤食が疑われる場合は速やかに獣医師または医療機関にご相談ください。本サイトの情報は獣医学的・医学的助言の代替ではありません。</div>`
    : '';

  return `<article style="font-family:'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic',Meiryo,sans-serif;line-height:1.85;max-width:920px;margin:0 auto;padding:24px 16px;color:#1f2937">
  <nav style="font-size:0.85rem;color:#6b7280;margin:0 0 16px"><a href="/monstera-info/" style="color:#2D5C3E;text-decoration:none">モンステラの基本ガイド</a> <span style="color:#9ca3af">›</span> <span style="color:#4b5563;font-weight:600">${escapeHtml(s.shortTitle)}</span></nav>
  <header style="margin-bottom:20px">
    <div style="line-height:1;margin-bottom:8px">${ico(s.icon, 32)}</div>
    <h1 style="font-size:1.7rem;color:#2D5C3E;border-bottom:2px solid #2D5C3E;padding-bottom:10px;margin:0 0 8px">${escapeHtml(s.title)}</h1>
    <div style="font-size:0.85rem;color:#6b7280;margin-top:10px">最終更新: ${formatDateJa(s.updatedAt)}</div>
  </header>
  ${leadHtml}
  ${disclaimerHtml}
  ${tocHtml}
  <div class="section-content">
${contentHtml}
  </div>
  ${faqHtml}
  ${referencesHtml(s.references)}
  ${chapterNavHtml}
  <p style="margin-top:32px"><a href="/monstera-info/" style="color:#2D5C3E">← トップへ戻る</a></p>
</article>`;
}

function writeSectionPage(s: (typeof sections)[number]) {
  const dir = path.join(DIST_DIR, s.id);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let html = subDirTemplateHtml
    .replace(/<title>.*?<\/title>/, `<title>${s.title} | モンステラの基本ガイド</title>`)
    .replace(
      /<meta name="description" content="[^"]*"/,
      `<meta name="description" content="${s.description}"`
    )
    .replace(
      /<meta property="og:title" content="[^"]*"/,
      `<meta property="og:title" content="${s.title}"`
    )
    .replace(
      /<meta property="og:description" content="[^"]*"/,
      `<meta property="og:description" content="${s.description}"`
    )
    .replace(
      /<meta property="og:type" content="[^"]*"/,
      `<meta property="og:type" content="article"`
    )
    .replace(
      /<meta property="og:url" content="[^"]*"/,
      `<meta property="og:url" content="${BASE_URL}/${s.id}/"`
    )
    .replace(
      /<link rel="canonical" href="[^"]*"/,
      `<link rel="canonical" href="${BASE_URL}/${s.id}/"`
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*"/,
      `<meta name="twitter:title" content="${s.title}"`
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*"/,
      `<meta name="twitter:description" content="${s.description}"`
    )
    .replace('<div id="root"></div>', `<div id="root">${buildSectionFallback(s)}</div>`);

  const articleJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: s.title,
    description: s.description,
    url: `${BASE_URL}/${s.id}/`,
    inLanguage: 'ja',
    datePublished: s.updatedAt,
    dateModified: s.updatedAt,
    author: { '@type': 'Organization', name: 'study-apps.com' },
    publisher: {
      '@type': 'Organization',
      name: 'study-apps.com',
      url: 'https://study-apps.com/',
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/${s.id}/` },
  });

  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'モンステラの基本ガイド', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: s.shortTitle, item: `${BASE_URL}/${s.id}/` },
    ],
  });

  const extraJsonLd: string[] = [];
  const faqList = FAQ_BY_SECTION[s.id];
  if (faqList && faqList.length) {
    const faqJsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqList.map((qa) => ({
        '@type': 'Question',
        name: qa.question,
        acceptedAnswer: { '@type': 'Answer', text: qa.answer },
      })),
    });
    extraJsonLd.push(`<script type="application/ld+json">${faqJsonLd}</script>`);
  }

  html = html.replace(
    '</head>',
    `<script type="application/ld+json">${articleJsonLd}</script>\n  <script type="application/ld+json">${breadcrumbJsonLd}</script>\n  ${extraJsonLd.join('\n  ')}\n  </head>`
  );

  fs.writeFileSync(path.join(dir, 'index.html'), html);
  generatedCount++;
}

for (const s of sections) writeSectionPage(s);

// ── About / Privacy 静的ページ ──
function writeStaticPage(id: string, title: string, description: string, bodyHtml: string, extraJsonLd: string[] = []) {
  const dir = path.join(DIST_DIR, id);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fallback = `<article style="font-family:'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic',Meiryo,sans-serif;line-height:1.85;max-width:920px;margin:0 auto;padding:24px 16px;color:#1f2937">
  <nav style="font-size:0.85rem;color:#6b7280;margin:0 0 16px"><a href="/monstera-info/" style="color:#2D5C3E;text-decoration:none">モンステラの基本ガイド</a> <span style="color:#9ca3af">›</span> <span style="color:#4b5563;font-weight:600">${escapeHtml(title)}</span></nav>
  <h1 style="font-size:1.7rem;color:#2D5C3E;border-bottom:2px solid #2D5C3E;padding-bottom:10px">${title}</h1>
  ${bodyHtml}
  <p style="margin-top:32px"><a href="/monstera-info/" style="color:#2D5C3E">← トップへ戻る</a></p>
</article>`;

  const pageJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: `${BASE_URL}/${id}/`,
    inLanguage: 'ja',
    isPartOf: { '@type': 'WebSite', name: 'モンステラの基本ガイド', url: `${BASE_URL}/` },
  });

  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'モンステラの基本ガイド', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: title, item: `${BASE_URL}/${id}/` },
    ],
  });

  let html = subDirTemplateHtml
    .replace(/<title>.*?<\/title>/, `<title>${title} | モンステラの基本ガイド</title>`)
    .replace(
      /<meta name="description" content="[^"]*"/,
      `<meta name="description" content="${description}"`
    )
    .replace(
      /<meta property="og:title" content="[^"]*"/,
      `<meta property="og:title" content="${title}"`
    )
    .replace(
      /<meta property="og:description" content="[^"]*"/,
      `<meta property="og:description" content="${description}"`
    )
    .replace(
      /<link rel="canonical" href="[^"]*"/,
      `<link rel="canonical" href="${BASE_URL}/${id}/"`
    )
    .replace(
      /<meta property="og:url" content="[^"]*"/,
      `<meta property="og:url" content="${BASE_URL}/${id}/"`
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*"/,
      `<meta name="twitter:title" content="${title}"`
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*"/,
      `<meta name="twitter:description" content="${description}"`
    )
    .replace('<div id="root"></div>', `<div id="root">${fallback}</div>`);

  const extraScripts = extraJsonLd.length
    ? extraJsonLd.map((j) => `<script type="application/ld+json">${j}</script>`).join('\n  ')
    : '';
  html = html.replace(
    '</head>',
    `<script type="application/ld+json">${pageJsonLd}</script>\n  <script type="application/ld+json">${breadcrumbJsonLd}</script>\n  ${extraScripts}\n  </head>`
  );

  fs.writeFileSync(path.join(dir, 'index.html'), html);
  generatedCount++;
}

function buildWebApplicationJsonLd(name: string, description: string, url: string): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    isAccessibleForFree: true,
    inLanguage: 'ja',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
  });
}

// 用語集ページ
const glossarySorted = [...glossary].sort((a, b) =>
  (a.reading || a.term).localeCompare(b.reading || b.term, 'ja')
);
const glossaryHtml = glossarySorted
  .map((g) => {
    const related = g.relatedSectionId ? sections.find((s) => s.id === g.relatedSectionId) : null;
    const relatedLink = related
      ? `<a href="/monstera-info/${related.id}/" style="display:inline-block;font-size:0.88rem;color:#2D5C3E;margin-top:4px">関連ページ：${escapeHtml(related.shortTitle)} →</a>`
      : '';
    const readingSpan = g.reading && g.reading !== g.term
      ? `<span style="color:#6b7280;font-size:0.9rem;font-weight:400">（${escapeHtml(g.reading)}）</span>`
      : '';
    return `<div style="border-bottom:1px solid #d4dfc8;padding:20px 0"><dt style="font-weight:700;color:#2D5C3E;font-size:1.1rem;margin-bottom:8px"><span style="margin-right:4px">${escapeHtml(g.term)}</span>${readingSpan}</dt><dd style="margin:0"><p style="margin:0 0 8px;line-height:1.85;color:#1f2937">${escapeHtml(g.description)}</p>${relatedLink}</dd></div>`;
  })
  .join('');

// ── 症状逆引き診断ページ ──
// 原因・対処データ（symptoms.ts の causes）はステップ式ウィザードの結果画面でのみ描画され、
// 静的HTMLには症状ラベルの一覧しか出ていなかった（原因・対処の本文が丸ごとクローラから不可視）。
// 診断ツールとしての核心情報のため、全症状・全原因を静的ページ本文にも展開する。
const sevLabel = (s: Severity): { text: string; className: string } => {
  switch (s) {
    case 'high': return { text: '緊急度：高', className: 'sev-high' };
    case 'medium': return { text: '緊急度：中', className: 'sev-medium' };
    case 'low': return { text: '緊急度：低', className: 'sev-low' };
  }
};

const diagnoseCategoriesHtml = symptomCategories
  .map((c) => {
    const symptomsHtml = c.symptoms
      .map((s) => {
        const causesHtml = s.causes
          .map((cause) => {
            const sev = sevLabel(cause.severity);
            const related = sections.find((sec) => sec.id === cause.relatedSectionId);
            const relatedLink = related
              ? `<a href="/monstera-info/${related.id}/" class="diagnose-cause-link">詳しく：${escapeHtml(related.shortTitle)} →</a>`
              : '';
            return `<div class="diagnose-cause"><div class="diagnose-cause-head"><span class="diagnose-sev ${sev.className}">${sev.text}</span><h4 class="diagnose-cause-title">${escapeHtml(cause.title)}</h4></div><p class="diagnose-cause-desc">${escapeHtml(cause.description)}</p><div class="diagnose-cause-action"><div class="diagnose-cause-action-label">すぐできる対処</div><p>${escapeHtml(cause.quickAction)}</p></div>${relatedLink}</div>`;
          })
          .join('');
        return `<div style="margin:18px 0"><h3 style="font-size:1rem;color:#1f2937;margin:0 0 8px">${escapeHtml(s.label)}</h3><div class="diagnose-causes">${causesHtml}</div></div>`;
      })
      .join('');
    return `<section style="margin:24px 0;padding:18px;background:#fff;border:1px solid #d4dfc8;border-radius:10px"><h2 style="font-size:1.15rem;color:#2D5C3E;margin:0 0 10px"><span aria-hidden="true">${c.emoji}</span> ${escapeHtml(c.label)}：${escapeHtml(c.description)}</h2>${symptomsHtml}</section>`;
  })
  .join('');

writeStaticPage(
  'diagnose',
  '症状逆引き診断',
  'モンステラの異変（葉色・葉先・茎・根の症状）から考えられる原因と対処を 2 ステップで絞り込む診断ツール。',
  `<p style="color:#555;font-size:1.05rem;margin:16px 0 16px">モンステラの異変から、考えられる原因と対処を絞り込みます。質問は 2 ステップで完了します。</p><div style="background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #f59e0b;border-radius:8px;padding:14px 16px;margin:0 0 24px;font-size:0.92rem;line-height:1.75;color:#78410f">これは確定診断ではなく、症状から推定される<strong>可能性の高い原因</strong>です。複数の症状が当てはまる場合は、複数の原因が重なっていることもあります。</div><p style="font-size:0.93rem;color:#4b5563;margin:0 0 16px">下記は全症状と考えられる原因・対処の一覧です。JavaScript が有効な環境では、ステップ式の診断ツールで絞り込めます。</p>${diagnoseCategoriesHtml}`,
  [buildWebApplicationJsonLd('モンステラ症状逆引き診断', 'モンステラの葉・茎・根・全体の異変から、考えられる原因と対処を 2 ステップで絞り込む無料診断ツール。', `${BASE_URL}/diagnose/`)]
);

// ── 斑入り苗チェックリストページ ──
const checkCategoriesHtml = (Object.keys(checkCategories) as CheckCategory[])
  .map((cat) => {
    const meta = checkCategories[cat];
    const items = checkItems.filter((i) => i.category === cat);
    if (items.length === 0) return '';
    const itemsHtml = items
      .map((item) => {
        const wtText = item.weight === 'critical' ? '必須' : item.weight === 'important' ? '重要' : '推奨';
        const wtColor = item.weight === 'critical' ? '#dc2626' : item.weight === 'important' ? '#f59e0b' : '#2D5C3E';
        const pointsHtml = item.checkPoints
          .map((pt) => `<li style="margin-bottom:4px;line-height:1.75">${escapeHtml(pt)}</li>`)
          .join('');
        return `<div style="background:#fff;border:1px solid #d4dfc8;border-radius:10px;padding:16px 18px;margin-bottom:12px"><div style="margin-bottom:6px"><span style="display:inline-block;font-size:0.72rem;font-weight:700;padding:3px 9px;border-radius:999px;background:${wtColor};color:white;margin-right:8px">${wtText}</span><strong style="font-size:0.97rem">${escapeHtml(item.question)}</strong></div><div style="font-size:0.88rem;color:#4b5563;line-height:1.75;margin:4px 0 10px">${escapeHtml(item.detail)}</div><ul style="background:#eef4e8;border-radius:6px;padding:10px 14px 10px 30px;margin:0;font-size:0.87rem;color:#1f2937">${pointsHtml}</ul></div>`;
      })
      .join('');
    return `<section style="margin:28px 0"><h2 style="font-size:1.15rem;color:#2D5C3E;margin:0 0 6px;padding-left:12px;border-left:4px solid #2D5C3E"><span aria-hidden="true">${meta.emoji}</span> ${escapeHtml(meta.label)}</h2><p style="font-size:0.9rem;color:#4b5563;margin:0 0 14px;padding-left:16px">${escapeHtml(meta.description)}</p>${itemsHtml}</section>`;
  })
  .join('');

// ── 品種判別ガイドページ ──
const varietiesListHtml = (Object.keys(varieties) as VarietyId[])
  .map((id) => {
    const v = varieties[id];
    const traitsHtml = v.traits.map((t) => `<li style="margin-bottom:4px;line-height:1.75">${escapeHtml(t)}</li>`).join('');
    return `<section style="background:#fff;border:1px solid #d4dfc8;border-radius:10px;padding:16px 18px;margin-bottom:14px"><h3 style="font-size:1.05rem;color:#2D5C3E;margin:0 0 4px"><span aria-hidden="true">${v.emoji}</span> ${escapeHtml(v.name)} <span style="font-size:0.85rem;color:#6b7280;font-weight:400">(${escapeHtml(v.scientificName)})</span></h3><p style="font-size:0.9rem;color:#4b5563;margin:0 0 10px;line-height:1.75">${escapeHtml(v.summary)}</p><ul style="margin:0 0 8px;padding-left:22px;font-size:0.87rem;color:#1f2937">${traitsHtml}</ul><p style="font-size:0.85rem;color:#6b7280;margin:8px 0 0;font-style:italic">${escapeHtml(v.notes)}</p></section>`;
  })
  .join('');

const quizQuestionsHtml = quizQuestions
  .map((q, idx) => {
    const optsHtml = q.options.map((o) => `<li style="margin-bottom:4px;line-height:1.75">${escapeHtml(o.label)}</li>`).join('');
    return `<div style="margin-bottom:16px"><div style="font-weight:700;color:#2D5C3E;margin-bottom:4px">Q${idx + 1}. ${escapeHtml(q.question)}</div>${q.hint ? `<div style="font-size:0.85rem;color:#6b7280;margin-bottom:6px">${escapeHtml(q.hint)}</div>` : ''}<ul style="margin:0;padding-left:22px;font-size:0.9rem;color:#1f2937">${optsHtml}</ul></div>`;
  })
  .join('');

writeStaticPage(
  'variety-check',
  '品種判別ガイド',
  '5 問の質問でモンステラの品種系統（デリシオーサ／ボルシギアナ／アダンソニー／ヒメモンステラ／コンパクタ）を推定する判別ガイド。',
  `<p style="color:#555;font-size:1.05rem;margin:16px 0 16px">あなたのモンステラがどの品種系統かを、5 問の質問で推定します。デリシオーサ／ボルシギアナ／アダンソニー／ヒメモンステラ／コンパクタを区別します。</p><div style="background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #f59e0b;border-radius:8px;padding:14px 16px;margin:0 0 24px;font-size:0.92rem;line-height:1.75;color:#78410f">これは確定的な同定ではなく、<strong>形態的特徴から推定される最も近い系統</strong>です。希少品種や交配種、別属（ラフィドフォラ等）の可能性もあります。JavaScript が有効な環境では、インタラクティブな質問形式で判定できます。</div><h2 style="font-size:1.15rem;color:#2D5C3E;margin:32px 0 10px;padding-left:12px;border-left:4px solid #2D5C3E">判別の対象品種</h2>${varietiesListHtml}<h2 style="font-size:1.15rem;color:#2D5C3E;margin:32px 0 10px;padding-left:12px;border-left:4px solid #2D5C3E">質問と選択肢</h2>${quizQuestionsHtml}`,
  [buildWebApplicationJsonLd('モンステラ品種判別ガイド', '5 問の質問でモンステラの品種系統（デリシオーサ・ボルシギアナ・アダンソニー・ヒメモンステラ・コンパクタ）を推定する無料判別ツール。', `${BASE_URL}/variety-check/`)]
);

writeStaticPage(
  'variegated-check',
  '斑入り苗チェックリスト',
  'モンステラの斑入り苗を購入する前に、株の状態・出品情報・受け入れ環境を 5 項目でチェックし、緑戻り・致死性白化のリスクを事前判定。',
  `<p style="color:#555;font-size:1.05rem;margin:16px 0 16px">斑入りモンステラは高額になりがちな一方、緑戻りや致死性白化のリスクがあります。購入前に株の状態・出品情報・受け入れ環境を 5 項目でチェックして、失敗のない購入判断を支援します。各項目には複数の確認ポイントが含まれます。</p><div style="background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #f59e0b;border-radius:8px;padding:14px 16px;margin:0 0 24px;font-size:0.92rem;line-height:1.75;color:#78410f">これは購入判断の補助ツールです。最終判断は購入者の責任で行ってください。JavaScript が有効な環境では、各項目に「はい／いいえ／不明」で回答してインタラクティブに判定できます。</div>${checkCategoriesHtml}`,
  [buildWebApplicationJsonLd('斑入りモンステラ苗チェックリスト', '斑入り苗の購入前に株の状態・出品情報・受け入れ環境を 5 項目でチェックし、緑戻り・致死性白化のリスクを事前判定する無料ツール。', `${BASE_URL}/variegated-check/`)]
);

writeStaticPage(
  'glossary',
  '用語集',
  'モンステラの関連用語（フェネストレーション、気根、節、斑入り、不溶性シュウ酸カルシウムなど）の解説。',
  `<p style="color:#555;font-size:1.05rem;margin:16px 0 24px">本サイトに登場する園芸用語をまとめました。気根、葉裂、斑入り、シュウ酸カルシウムなど、育て方や安全性の理解に役立ててください。</p><dl style="margin:0;padding:0">${glossaryHtml}</dl>`
);

// SSOT（src/data/static-pages.ts）から本文を読む（2026-08-10・O-2-15＝App.tsxとの二重管理を解消）
writeStaticPage(
  'about',
  'サイトについて',
  'モンステラの基本ガイドについて。本サイトの目的と情報源、免責事項を説明します。',
  markdownToHtml(ABOUT_CONTENT)
);

writeStaticPage(
  'privacy',
  'プライバシーポリシー',
  'モンステラの基本ガイドのプライバシーポリシー。Cookie・アクセス解析・広告の使用について。',
  markdownToHtml(PRIVACY_CONTENT)
);

// ── sitemap.xml を動的生成（lastmod 付き） ──
const today = new Date().toISOString().split('T')[0];
type SitemapEntry = { path: string; lastmod: string; changefreq: string; priority: string };
const sitemapEntries: SitemapEntry[] = [
  { path: '/', lastmod: today, changefreq: 'weekly', priority: '1.0' },
  { path: '/diagnose/', lastmod: today, changefreq: 'monthly', priority: '0.9' },
  { path: '/variety-check/', lastmod: today, changefreq: 'monthly', priority: '0.8' },
  { path: '/variegated-check/', lastmod: today, changefreq: 'monthly', priority: '0.8' },
  ...sections.map((s) => ({
    path: `/${s.id}/`,
    lastmod: s.updatedAt,
    changefreq: 'monthly',
    priority: '0.9',
  })),
  { path: '/glossary/', lastmod: today, changefreq: 'monthly', priority: '0.7' },
  { path: '/about/', lastmod: today, changefreq: 'yearly', priority: '0.3' },
  { path: '/privacy/', lastmod: today, changefreq: 'yearly', priority: '0.3' },
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
  .map(
    (e) => `  <url>
    <loc>${BASE_URL}${e.path}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml);
console.log(`✓ Generated sitemap.xml (${sitemapEntries.length} URLs, lastmod attached)`);

console.log(`✓ Generated ${generatedCount} static pages`);
console.log('--- Done ---');
