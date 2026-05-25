import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, List, ChevronRight, Menu, X, Calendar, AlertCircle, Stethoscope, Microscope, Dna } from 'lucide-react';
import { sections } from './data/sections';
import type { Section } from './data/sections';
import { FAQ_BY_SECTION } from './data/faqs';
import { glossary } from './data/glossary';
import { symptomCategories } from './data/symptoms';
import type { Severity } from './data/symptoms';
import { getCurrentMonthTip } from './data/monthly-tips';
import { checkCategories, checkItems } from './data/variegated-checklist';
import type { CheckCategory, Weight } from './data/variegated-checklist';
import { quizQuestions, varieties } from './data/variety-quiz';
import type { VarietyId } from './data/variety-quiz';
import './App.css';

const BASE = '/monstera-info';

const SECTION_GROUPS: { label: string; emoji: string; description: string; sectionIds: string[] }[] = [
  {
    label: '知る・選ぶ',
    emoji: '🪴',
    description: '迎える前にまず理解する基礎と、購入時のチェックポイント',
    sectionIds: ['basics', 'selection'],
  },
  {
    label: '育てる',
    emoji: '☀️',
    description: '光・水・温度の基本から、季節ごとの管理・剪定・増やし方まで',
    sectionIds: ['growing', 'seasonal'],
  },
  {
    label: '守る',
    emoji: '🛡️',
    description: 'トラブルの早期発見と対処、ペットや家族と安全に暮らすための注意',
    sectionIds: ['troubles', 'safety'],
  },
];


function getCurrentPath(): string {
  if (typeof window === 'undefined') return '/';
  const p = window.location.pathname;
  if (p.startsWith(BASE)) return p.slice(BASE.length) || '/';
  return p;
}

function navigateTo(path: string) {
  const full = BASE + (path.startsWith('/') ? path : '/' + path);
  window.history.pushState({}, '', full);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function slugify(_text: string, index: number): string {
  return `section-${index}`;
}

function GlossaryTooltip({ term, children }: { term: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const entry = glossary.find((g) => g.term === term);
  if (!entry) return <>{children}</>;
  const tooltipId = `tt-${encodeURIComponent(term)}`;
  return (
    <span className="glossary-tip-wrap">
      <button
        type="button"
        className="glossary-tip-trigger"
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </button>
      {open && (
        <span className="glossary-tip" id={tooltipId} role="tooltip">
          <span className="glossary-tip-term">{entry.term}</span>
          <span className="glossary-tip-desc">{entry.description}</span>
          {entry.relatedSectionId && (() => {
            const related = sections.find((s) => s.id === entry.relatedSectionId);
            return related ? (
              <a
                href={`${BASE}/${related.id}/`}
                className="glossary-tip-link"
                onClick={(e) => { e.preventDefault(); navigateTo(`/${related.id}/`); setOpen(false); }}
              >
                関連：{related.shortTitle} →
              </a>
            ) : null;
          })()}
        </span>
      )}
    </span>
  );
}

// ── 簡易マークダウンパーサ ──
function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const patterns: { re: RegExp; render: (m: RegExpExecArray) => ReactNode }[] = [
    {
      re: /\[([^\]]+)\]\(([^)]+)\)/,
      render: (m) => {
        const href = m[2];
        const isInternal = href.startsWith('/monstera-info/');
        if (isInternal) {
          return (
            <a
              key={key++}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', href);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
            >
              {m[1]}
            </a>
          );
        }
        const isExternal = /^https?:\/\//.test(href);
        return (
          <a
            key={key++}
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
          >
            {m[1]}
          </a>
        );
      },
    },
    { re: /\*\*(.+?)\*\*/, render: (m) => <strong key={key++}>{parseInline(m[1])}</strong> },
    { re: /`([^`]+)`/, render: (m) => <code key={key++} className="inline-code">{m[1]}</code> },
    {
      re: /\{\{term:([^|}]+)(?:\|([^}]+))?\}\}/,
      render: (m) => <GlossaryTooltip key={key++} term={m[1]}>{m[2] ?? m[1]}</GlossaryTooltip>,
    },
  ];

  while (remaining.length > 0) {
    let earliest: { idx: number; len: number; render: ReactNode } | null = null;
    for (const p of patterns) {
      const m = p.re.exec(remaining);
      if (m && (earliest === null || m.index < earliest.idx)) {
        earliest = { idx: m.index, len: m[0].length, render: p.render(m) };
      }
    }
    if (!earliest) {
      nodes.push(remaining);
      break;
    }
    if (earliest.idx > 0) nodes.push(remaining.slice(0, earliest.idx));
    nodes.push(earliest.render);
    remaining = remaining.slice(earliest.idx + earliest.len);
  }
  return nodes;
}

function parseContent(content: string): ReactNode[] {
  const lines = content.split('\n');
  const result: ReactNode[] = [];
  let i = 0;
  let key = 0;
  let h2Index = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 空行 → スキップ
    if (trimmed === '') { i++; continue; }

    // 見出し h2
    if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3);
      result.push(<h2 key={key++} id={slugify(text, h2Index++)} className="content-h2">{parseInline(text)}</h2>);
      i++;
      continue;
    }

    // 見出し h3
    if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4);
      result.push(<h3 key={key++} className="content-h3">{parseInline(text)}</h3>);
      i++;
      continue;
    }

    // テーブル
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const rows = tableLines.map(r => r.split('|').slice(1, -1).map(c => c.trim()));
        const isSep = (r: string[]) => r.every(c => /^[-:]+$/.test(c));
        const header = rows[0];
        const data = rows.slice(1).filter(r => !isSep(r));
        result.push(
          <div key={key++} className="content-table-wrap">
            <table className="content-table">
              <thead><tr>{header.map((c, ci) => <th key={ci}>{parseInline(c)}</th>)}</tr></thead>
              <tbody>
                {data.map((row, ri) => (
                  <tr key={ri}>{row.map((c, ci) => <td key={ci}>{parseInline(c)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // 番号付きリスト
    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      result.push(
        <ol key={key++} className="content-ol">
          {items.map((it, idx) => <li key={idx}>{parseInline(it)}</li>)}
        </ol>
      );
      continue;
    }

    // 箇条書きリスト
    if (trimmed.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      result.push(
        <ul key={key++} className="content-ul">
          {items.map((it, idx) => <li key={idx}>{parseInline(it)}</li>)}
        </ul>
      );
      continue;
    }

    // コールアウト 💡 ⚠️ 📖 ✅
    if (trimmed.startsWith('💡 ')) {
      result.push(<p key={key++} className="callout callout-tip">{parseInline(trimmed.slice(2).trim())}</p>);
      i++; continue;
    }
    if (trimmed.startsWith('⚠️ ')) {
      result.push(<p key={key++} className="callout callout-warning">{parseInline(trimmed.slice(2).trim())}</p>);
      i++; continue;
    }
    if (trimmed.startsWith('📖 ')) {
      result.push(<p key={key++} className="callout callout-info">{parseInline(trimmed.slice(2).trim())}</p>);
      i++; continue;
    }
    if (trimmed.startsWith('✅ ')) {
      result.push(<p key={key++} className="callout callout-success">{parseInline(trimmed.slice(2).trim())}</p>);
      i++; continue;
    }

    // 通常の段落
    result.push(<p key={key++} className="content-p">{parseInline(trimmed)}</p>);
    i++;
  }

  return result;
}

function Header() {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a
          href={`${BASE}/`}
          className="site-brand"
          onClick={(e) => { e.preventDefault(); navigateTo('/'); setNavOpen(false); }}
        >
          <svg className="brand-logo" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="ml" cx="50%" cy="55%" r="55%">
                <stop offset="0%" stopColor="#6FA37F"/>
                <stop offset="60%" stopColor="#3D7A52"/>
                <stop offset="100%" stopColor="#1E3F2A"/>
              </radialGradient>
            </defs>
            <path d="M 32 4 C 22 4, 14 10, 10 18 L 18 22 L 8 26 C 6 32, 8 38, 12 42 L 22 38 L 14 46 C 18 54, 24 58, 32 60 L 30 50 L 34 50 L 32 60 C 40 58, 46 54, 50 46 L 42 38 L 52 42 C 56 38, 58 32, 56 26 L 46 22 L 54 18 C 50 10, 42 4, 32 4 Z" fill="url(#ml)" stroke="#1E3F2A" strokeWidth="0.8" strokeLinejoin="round"/>
            <path d="M32 8 L32 56" stroke="#C9A14A" strokeWidth="0.6" opacity="0.4"/>
            <ellipse cx="22" cy="24" rx="2.5" ry="3.5" fill="#f8faf5" opacity="0.7"/>
            <ellipse cx="42" cy="24" rx="2.5" ry="3.5" fill="#f8faf5" opacity="0.7"/>
            <ellipse cx="20" cy="36" rx="2.5" ry="3.5" fill="#f8faf5" opacity="0.7"/>
            <ellipse cx="44" cy="36" rx="2.5" ry="3.5" fill="#f8faf5" opacity="0.7"/>
          </svg>
          <span>モンステラの基本ガイド</span>
        </a>
        <button
          className="nav-toggle"
          aria-label={navOpen ? 'メニューを閉じる' : 'メニューを開く'}
          onClick={() => setNavOpen(!navOpen)}
        >
          {navOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`site-nav ${navOpen ? 'open' : ''}`} aria-label="メインナビゲーション">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`${BASE}/${s.id}/`}
              onClick={(e) => { e.preventDefault(); navigateTo(`/${s.id}/`); setNavOpen(false); }}
            >
              <span className="nav-emoji">{s.emoji}</span>
              <span>{s.shortTitle}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function MonthlyTipCard() {
  const tip = getCurrentMonthTip();
  return (
    <section className="monthly-tip" aria-label={`${tip.month}月の管理ポイント`}>
      <div className="monthly-tip-header">
        <span className="monthly-tip-emoji" aria-hidden="true">{tip.emoji}</span>
        <div className="monthly-tip-head-text">
          <div className="monthly-tip-label">
            <span className="monthly-tip-month">{tip.month}月</span>
            <span className="monthly-tip-season">{tip.season}</span>
          </div>
          <h2 className="monthly-tip-headline">{tip.headline}</h2>
        </div>
      </div>
      <ul className="monthly-tip-points">
        {tip.points.map((p, i) => {
          const related = p.relatedSectionId ? sections.find((s) => s.id === p.relatedSectionId) : null;
          return (
            <li key={i} className="monthly-tip-point">
              <div className="monthly-tip-point-label">{p.label}</div>
              <div className="monthly-tip-point-detail">
                {p.detail}
                {related && (
                  <>
                    {' '}
                    <a
                      href={`${BASE}/${related.id}/`}
                      className="monthly-tip-link"
                      onClick={(e) => { e.preventDefault(); navigateTo(`/${related.id}/`); }}
                    >
                      {related.shortTitle} →
                    </a>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Home() {
  return (
    <>
      <div className="hero">
        <div className="hero-emoji" aria-hidden="true">🌿</div>
        <h1>モンステラの基本ガイド</h1>
        <p>
          人気観葉植物モンステラ（Monstera deliciosa）の総合情報サイト。<br />
          基礎知識・育て方・剪定や増やし方・病害虫対処・選び方・ペット安全性まで、
          家庭で実践しやすい形でまとめています。
        </p>
      </div>

      <div className="tool-cta-row tool-cta-row-3">
        <a
          href={`${BASE}/diagnose/`}
          className="tool-cta diagnose-cta"
          onClick={(e) => { e.preventDefault(); navigateTo('/diagnose/'); }}
        >
          <span className="tool-cta-icon-wrap" aria-hidden="true">
            <Stethoscope size={22} strokeWidth={2.2} />
          </span>
          <div className="tool-cta-text">
            <div className="tool-cta-title">症状から原因を診断</div>
            <div className="tool-cta-desc">2 ステップで切り分け</div>
          </div>
          <ChevronRight size={20} aria-hidden="true" />
        </a>
        <a
          href={`${BASE}/variety-check/`}
          className="tool-cta variety-cta"
          onClick={(e) => { e.preventDefault(); navigateTo('/variety-check/'); }}
        >
          <span className="tool-cta-icon-wrap" aria-hidden="true">
            <Microscope size={22} strokeWidth={2.2} />
          </span>
          <div className="tool-cta-text">
            <div className="tool-cta-title">うちのは何系？品種判別</div>
            <div className="tool-cta-desc">5 問で品種系統を推定</div>
          </div>
          <ChevronRight size={20} aria-hidden="true" />
        </a>
        <a
          href={`${BASE}/variegated-check/`}
          className="tool-cta variegated-cta"
          onClick={(e) => { e.preventDefault(); navigateTo('/variegated-check/'); }}
        >
          <span className="tool-cta-icon-wrap" aria-hidden="true">
            <Dna size={22} strokeWidth={2.2} />
          </span>
          <div className="tool-cta-text">
            <div className="tool-cta-title">斑入り苗 購入前チェック</div>
            <div className="tool-cta-desc">5 項目で購入リスクを判定</div>
          </div>
          <ChevronRight size={20} aria-hidden="true" />
        </a>
      </div>

      <MonthlyTipCard />

      <h2 className="home-section-title">セクション一覧</h2>
      {SECTION_GROUPS.map((group) => (
        <div key={group.label} className="section-group">
          <div className="section-group-head">
            <h3 className="section-group-label">
              <span className="section-group-emoji" aria-hidden="true">{group.emoji}</span>
              {group.label}
            </h3>
            <p className="section-group-desc">{group.description}</p>
          </div>
          <div className="section-grid">
            {group.sectionIds.map((id) => {
              const s = sections.find((sec) => sec.id === id);
              if (!s) return null;
              return (
                <a
                  key={s.id}
                  href={`${BASE}/${s.id}/`}
                  className="section-card"
                  onClick={(e) => { e.preventDefault(); navigateTo(`/${s.id}/`); }}
                >
                  <div className="section-card-emoji" aria-hidden="true">{s.emoji}</div>
                  <h2 className="section-card-title">{s.shortTitle}</h2>
                  <p className="section-card-desc">{s.description}</p>
                  <span className="section-card-cta">読む →</span>
                </a>
              );
            })}
          </div>
        </div>
      ))}

      <div className="home-trust">
        <h3>このサイトの方針</h3>
        <ul>
          <li><strong>家庭目線で噛み砕いて解説</strong>：専門用語は必ず補足、すぐ実践できる工夫を重視します</li>
          <li><strong>断定的な表現を避ける</strong>：植物の状態は個体差や環境で変わるため、目安として参考にしてください</li>
          <li><strong>ペットの安全性は獣医師の助言が優先</strong>：誤食が疑われる場合は速やかに獣医師に相談してください</li>
        </ul>
      </div>
    </>
  );
}

function TOC({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <nav className="toc">
      <div className="toc-title"><List size={16} /> 目次</div>
      <ol className="toc-list">
        {items.map((it, idx) => (
          <li key={it}>
            <a href={`#${slugify(it, idx)}`}>{it}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Breadcrumb({ currentTitle }: { currentTitle: string }) {
  return (
    <nav className="breadcrumb" aria-label="パンくずリスト">
      <a href={`${BASE}/`} onClick={(e) => { e.preventDefault(); navigateTo('/'); }}>モンステラの基本ガイド</a>
      <ChevronRight size={14} className="breadcrumb-sep" aria-hidden="true" />
      <span className="breadcrumb-current">{currentTitle}</span>
    </nav>
  );
}

function formatDate(iso: string): string {
  // 2026-05-18 → 2026年5月18日
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${m[1]}年${parseInt(m[2], 10)}月${parseInt(m[3], 10)}日`;
}

function ChapterNav({ currentId }: { currentId: string }) {
  const idx = sections.findIndex((s) => s.id === currentId);
  if (idx === -1) return null;
  const prev = idx > 0 ? sections[idx - 1] : null;
  const next = idx < sections.length - 1 ? sections[idx + 1] : null;
  if (!prev && !next) return null;
  return (
    <nav className="chapter-nav" aria-label="章ナビゲーション">
      {prev ? (
        <a
          href={`${BASE}/${prev.id}/`}
          className="chapter-nav-link chapter-nav-prev"
          onClick={(e) => { e.preventDefault(); navigateTo(`/${prev.id}/`); }}
        >
          <span className="chapter-nav-label"><ArrowLeft size={14} aria-hidden="true" /> 前の章</span>
          <span className="chapter-nav-title">{prev.emoji} {prev.shortTitle}</span>
        </a>
      ) : <span className="chapter-nav-spacer" />}
      {next ? (
        <a
          href={`${BASE}/${next.id}/`}
          className="chapter-nav-link chapter-nav-next"
          onClick={(e) => { e.preventDefault(); navigateTo(`/${next.id}/`); }}
        >
          <span className="chapter-nav-label">次の章 <ChevronRight size={14} aria-hidden="true" /></span>
          <span className="chapter-nav-title">{next.emoji} {next.shortTitle}</span>
        </a>
      ) : <span className="chapter-nav-spacer" />}
    </nav>
  );
}

function RelatedSections({ currentId }: { currentId: string }) {
  const related = sections.filter((s) => s.id !== currentId);
  return (
    <aside className="related-sections" aria-label="関連記事">
      <h3>📚 他のセクションも読む</h3>
      <div className="related-grid">
        {related.map((s) => (
          <a
            key={s.id}
            href={`${BASE}/${s.id}/`}
            className="related-card"
            onClick={(e) => { e.preventDefault(); navigateTo(`/${s.id}/`); }}
          >
            <span className="related-emoji" aria-hidden="true">{s.emoji}</span>
            <span className="related-title">{s.shortTitle}</span>
          </a>
        ))}
      </div>
    </aside>
  );
}


function FAQBlock({ sectionId }: { sectionId: string }) {
  const faqs = FAQ_BY_SECTION[sectionId];
  if (!faqs || faqs.length === 0) return null;
  return (
    <section className="faq-block" aria-label="よくある質問">
      <h3>❓ よくある質問</h3>
      {faqs.map((qa, i) => (
        <details key={i} className="faq-item">
          <summary>{qa.question}</summary>
          <p>{qa.answer}</p>
        </details>
      ))}
    </section>
  );
}

function SafetyDisclaimer() {
  return (
    <div className="safety-disclaimer">
      <strong>⚠️ ペット・小児の誤食にご注意ください</strong>：モンステラは不溶性シュウ酸カルシウムを含むため、犬・猫・小児が誤食すると口腔の刺激や嘔吐などを引き起こすことがあります。誤食が疑われる場合は速やかに獣医師または医療機関にご相談ください。本サイトの情報は獣医学的・医学的助言の代替ではありません。
    </div>
  );
}

function SectionPage({ section }: { section: Section }) {
  useEffect(() => {
    document.title = `${section.title} | モンステラの基本ガイド`;
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      requestAnimationFrame(() => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
        else window.scrollTo(0, 0);
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [section.id, section.title]);

  const isYMYL = section.id === 'safety';

  return (
    <>
      <Breadcrumb currentTitle={section.shortTitle} />
      <article className="section-page">
        <header className="article-header">
          <div className="article-emoji" aria-hidden="true">{section.emoji}</div>
          <h1>{section.title}</h1>
          <div className="article-meta">
            <span className="article-meta-item"><Calendar size={14} /> 最終更新: {formatDate(section.updatedAt)}</span>
          </div>
        </header>
        {section.lead && section.lead !== '（準備中）' && (
          <p className="lead">{section.lead}</p>
        )}
        {isYMYL && <SafetyDisclaimer />}
        <TOC items={section.toc} />
        <div className="section-content">
          {parseContent(section.content)}
        </div>
        <FAQBlock sectionId={section.id} />
        <ChapterNav currentId={section.id} />
        <RelatedSections currentId={section.id} />
        <div className="section-footer">
          <a
            href={`${BASE}/`}
            className="back-link"
            onClick={(e) => { e.preventDefault(); navigateTo('/'); }}
          >
            <ArrowLeft size={16} /> トップへ戻る
          </a>
        </div>
      </article>
    </>
  );
}

function VarietyCheck() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Partial<Record<VarietyId, number>>>({});
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState<{ scores: Partial<Record<VarietyId, number>> }[]>([]);

  useEffect(() => {
    document.title = '品種判別ガイド | モンステラの基本ガイド';
    window.scrollTo(0, 0);
  }, []);

  const total = quizQuestions.length;

  const handleAnswer = (optionScores: Partial<Record<VarietyId, number>>) => {
    setHistory((h) => [...h, { scores }]);
    const newScores: Partial<Record<VarietyId, number>> = { ...scores };
    for (const [vid, s] of Object.entries(optionScores)) {
      const id = vid as VarietyId;
      newScores[id] = (newScores[id] ?? 0) + (s ?? 0);
    }
    setScores(newScores);
    if (step + 1 >= total) {
      setShowResult(true);
      window.scrollTo(0, 0);
    } else {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setScores(last.scores);
    setHistory(history.slice(0, -1));
    setStep(Math.max(0, step - 1));
    window.scrollTo(0, 0);
  };

  const reset = () => {
    setStep(0);
    setScores({});
    setShowResult(false);
    setHistory([]);
    window.scrollTo(0, 0);
  };

  // 結果の算出：得点上位を取り、確信度を計算
  const sortedResults = (Object.keys(varieties) as VarietyId[])
    .map((id) => ({ id, score: scores[id] ?? 0 }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const topScore = sortedResults[0]?.score ?? 0;
  const second = sortedResults[1]?.score ?? 0;
  const gap = topScore - second;
  const confidence: '◎' | '○' | '△' =
    gap >= 4 ? '◎' : gap >= 2 ? '○' : '△';
  const confidenceText =
    confidence === '◎' ? '確信度：高' : confidence === '○' ? '確信度：中' : '確信度：低（候補が拮抗）';

  const current = quizQuestions[step];

  return (
    <>
      <Breadcrumb currentTitle="品種判別ガイド" />
      <article className="section-page">
        <header className="article-header">
          <div className="article-emoji" aria-hidden="true">🔬</div>
          <h1>品種判別ガイド</h1>
        </header>
        <p className="lead">
          あなたのモンステラがどの品種系統かを、5 問の質問で推定します。デリシオーサ／ボルシギアナ／アダンソニー／ヒメモンステラ／コンパクタを区別します。
        </p>

        <div className="diagnose-disclaimer">
          <AlertCircle size={18} aria-hidden="true" />
          <div>
            これは確定的な同定ではなく、<strong>形態的特徴から推定される最も近い系統</strong> です。希少品種や交配種、別属（ラフィドフォラ等）の可能性もあります。
          </div>
        </div>

        {!showResult && (
          <section className="variety-step">
            <div className="diagnose-step-num">STEP {step + 1} / {total}</div>
            <h2 className="diagnose-step-title">{current.question}</h2>
            {current.hint && <p className="variety-hint">{current.hint}</p>}
            <div className="variety-options">
              {current.options.map((opt, i) => (
                <button
                  key={i}
                  className="variety-option"
                  onClick={() => handleAnswer(opt.scores)}
                  type="button"
                >
                  <span>{opt.label}</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
            {step > 0 && (
              <button className="diagnose-back" onClick={handleBack} type="button">
                <ArrowLeft size={14} /> 前の質問に戻る
              </button>
            )}
          </section>
        )}

        {showResult && (
          <section className="variety-result">
            {sortedResults.length === 0 ? (
              <div className="check-verdict verdict-caution">
                <h2 className="check-verdict-title">判定できませんでした</h2>
                <p className="check-verdict-message">回答から特定の品種を絞り込めませんでした。もう一度試してみてください。</p>
              </div>
            ) : (
              <>
                <div className={`check-verdict verdict-${confidence === '◎' ? 'good' : confidence === '○' ? 'caution' : 'caution'}`}>
                  <div className="variety-confidence">{confidenceText}</div>
                  <h2 className="variety-top-name">
                    <span className="variety-top-emoji" aria-hidden="true">{varieties[sortedResults[0].id].emoji}</span>
                    {varieties[sortedResults[0].id].name}
                  </h2>
                  <div className="variety-scientific">{varieties[sortedResults[0].id].scientificName}</div>
                  <p className="check-verdict-message">{varieties[sortedResults[0].id].summary}</p>
                </div>

                <div className="variety-traits">
                  <h3 className="variety-traits-title">この品種の主な特徴</h3>
                  <ul>
                    {varieties[sortedResults[0].id].traits.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                  <p className="variety-notes">{varieties[sortedResults[0].id].notes}</p>
                </div>

                {sortedResults.length > 1 && (
                  <div className="variety-others">
                    <h3 className="variety-others-title">他の候補</h3>
                    {sortedResults.slice(1, 4).map((r) => (
                      <div key={r.id} className="variety-other">
                        <span className="variety-other-emoji" aria-hidden="true">{varieties[r.id].emoji}</span>
                        <div>
                          <div className="variety-other-name">{varieties[r.id].name}</div>
                          <div className="variety-other-summary">{varieties[r.id].summary}</div>
                        </div>
                        <div className="variety-other-score">{r.score} 点</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="check-result-actions">
              <button className="check-restart" onClick={reset} type="button">
                やり直す
              </button>
              <a
                href={`${BASE}/basics/`}
                className="check-related-link"
                onClick={(e) => { e.preventDefault(); navigateTo('/basics/'); }}
              >
                基礎知識を読む →
              </a>
            </div>
          </section>
        )}

        <div className="section-footer">
          <a
            href={`${BASE}/`}
            className="back-link"
            onClick={(e) => { e.preventDefault(); navigateTo('/'); }}
          >
            <ArrowLeft size={16} /> トップへ戻る
          </a>
        </div>
      </article>
    </>
  );
}

function weightLabel(w: Weight): { text: string; className: string } {
  switch (w) {
    case 'critical': return { text: '必須', className: 'wt-critical' };
    case 'important': return { text: '重要', className: 'wt-important' };
    case 'recommended': return { text: '推奨', className: 'wt-recommended' };
  }
}

type CheckAnswer = 'yes' | 'no' | 'unknown';

function VariegatedCheck() {
  const [answers, setAnswers] = useState<Record<string, CheckAnswer>>({});
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    document.title = '斑入り苗チェックリスト | モンステラの基本ガイド';
    window.scrollTo(0, 0);
  }, []);

  const setAnswer = (id: string, val: CheckAnswer) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const reset = () => {
    setAnswers({});
    setShowResult(false);
    window.scrollTo(0, 0);
  };

  // 判定ロジック
  const criticalItems = checkItems.filter((i) => i.weight === 'critical');
  const importantItems = checkItems.filter((i) => i.weight === 'important');
  const criticalFail = criticalItems.filter((i) => answers[i.id] === 'no').length;
  const criticalUnknown = criticalItems.filter((i) => answers[i.id] === 'unknown' || !answers[i.id]).length;
  const importantFail = importantItems.filter((i) => answers[i.id] === 'no').length;
  const importantUnknown = importantItems.filter((i) => answers[i.id] === 'unknown' || !answers[i.id]).length;

  let verdict: { level: 'good' | 'caution' | 'bad'; title: string; message: string };
  if (criticalFail > 0) {
    verdict = {
      level: 'bad',
      title: '購入は避けた方が無難です',
      message: '必須項目で「いいえ」がついています。緑戻り・致死性白化・致命的な健康問題のリスクがあり、高額な投資に見合わない可能性が高いです。別の苗を探すことをおすすめします。',
    };
  } else if (criticalUnknown > 0) {
    verdict = {
      level: 'caution',
      title: '必須項目を確認してください',
      message: '必須項目に「不明」が残っています。出品者に追加情報を求める、より詳しい写真の提示を依頼するなど、必ず確認した上で判断してください。',
    };
  } else if (importantFail > 0) {
    verdict = {
      level: 'caution',
      title: 'リスクを理解した上での購入を',
      message: '必須項目はクリアしていますが、重要項目に懸念があります。リスクを理解した上で、購入後の管理に万全を期せる場合のみおすすめします。',
    };
  } else {
    verdict = {
      level: 'good',
      title: '購入を検討して良さそうです',
      message: '必須項目をすべてクリアしており、重要項目もおおむね問題ありません。購入後 1〜2 週間の順化期間を必ず取って、丁寧に迎え入れてください。',
    };
  }

  const totalAnswered = Object.values(answers).filter((v) => v === 'yes' || v === 'no').length;
  const totalItems = checkItems.length;
  const progress = Math.round((totalAnswered / totalItems) * 100);

  return (
    <>
      <Breadcrumb currentTitle="斑入り苗チェックリスト" />
      <article className="section-page">
        <header className="article-header">
          <div className="article-emoji" aria-hidden="true">🧬</div>
          <h1>斑入り苗チェックリスト</h1>
        </header>
        <p className="lead">
          斑入りモンステラは高額になりがちな一方、緑戻りや致死性白化のリスクがあります。
          購入前に株の状態・出品情報・受け入れ環境を 5 項目でチェックして、失敗のない購入判断を支援します。各項目には複数の確認ポイントが含まれます。
        </p>

        <div className="diagnose-disclaimer">
          <AlertCircle size={18} aria-hidden="true" />
          <div>
            これは購入判断の補助ツールです。最終判断は購入者の責任で行ってください。
            判定結果は<strong>「必須」項目を最重視</strong>し、必須項目に「いいえ」があれば購入回避を推奨します。
          </div>
        </div>

        {!showResult && (
          <>
            <div className="check-progress">
              <div className="check-progress-bar">
                <div className="check-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="check-progress-label">{totalAnswered} / {totalItems} 回答済み</div>
            </div>

            {(Object.keys(checkCategories) as CheckCategory[]).map((cat) => {
              const items = checkItems.filter((i) => i.category === cat);
              const meta = checkCategories[cat];
              return (
                <section key={cat} className="check-category">
                  <h2 className="check-category-title">
                    <span aria-hidden="true">{meta.emoji}</span> {meta.label}
                  </h2>
                  <p className="check-category-desc">{meta.description}</p>
                  {items.map((item) => {
                    const wt = weightLabel(item.weight);
                    return (
                      <div key={item.id} className="check-item">
                        <div className="check-item-head">
                          <span className={`check-weight ${wt.className}`}>{wt.text}</span>
                          <div className="check-item-question">{item.question}</div>
                        </div>
                        <div className="check-item-detail">{item.detail}</div>
                        <ul className="check-item-points">
                          {item.checkPoints.map((pt, idx) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                        <div className="check-item-answers">
                          {(['yes', 'no', 'unknown'] as CheckAnswer[]).map((val) => (
                            <button
                              key={val}
                              className={`check-answer ${answers[item.id] === val ? 'active' : ''} answer-${val}`}
                              onClick={() => setAnswer(item.id, val)}
                              type="button"
                            >
                              {val === 'yes' ? 'はい' : val === 'no' ? 'いいえ' : '不明'}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </section>
              );
            })}

            <div className="check-submit-wrap">
              <button
                className="check-submit"
                disabled={totalAnswered === 0}
                onClick={() => { setShowResult(true); window.scrollTo(0, 0); }}
                type="button"
              >
                判定する（{totalAnswered} / {totalItems} 回答済み）
              </button>
              {totalAnswered === 0 && (
                <p className="check-submit-hint">1 つ以上の項目に回答してください</p>
              )}
            </div>
          </>
        )}

        {showResult && (
          <section className="check-result">
            <div className={`check-verdict verdict-${verdict.level}`}>
              <h2 className="check-verdict-title">{verdict.title}</h2>
              <p className="check-verdict-message">{verdict.message}</p>
            </div>

            <div className="check-summary">
              <div className="check-summary-item">
                <span className="check-summary-label">必須項目</span>
                <span className="check-summary-value">
                  「いいえ」{criticalFail} 件 / 「不明」{criticalUnknown} 件 / 全 {criticalItems.length} 件
                </span>
              </div>
              <div className="check-summary-item">
                <span className="check-summary-label">重要項目</span>
                <span className="check-summary-value">
                  「いいえ」{importantFail} 件 / 「不明」{importantUnknown} 件 / 全 {importantItems.length} 件
                </span>
              </div>
            </div>

            {(criticalFail > 0 || importantFail > 0) && (
              <div className="check-issues">
                <h3 className="check-issues-title">確認が必要な項目</h3>
                {checkItems
                  .filter((i) => answers[i.id] === 'no')
                  .map((item) => {
                    const wt = weightLabel(item.weight);
                    return (
                      <div key={item.id} className="check-issue">
                        <span className={`check-weight ${wt.className}`}>{wt.text}</span>
                        <div>
                          <div className="check-issue-question">{item.question}</div>
                          <div className="check-issue-why">{item.whyMatters}</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="check-result-actions">
              <button className="check-restart" onClick={reset} type="button">
                やり直す
              </button>
              <a
                href={`${BASE}/selection/`}
                className="check-related-link"
                onClick={(e) => { e.preventDefault(); navigateTo('/selection/'); }}
              >
                選び方の詳細を読む →
              </a>
            </div>
          </section>
        )}

        <div className="section-footer">
          <a
            href={`${BASE}/`}
            className="back-link"
            onClick={(e) => { e.preventDefault(); navigateTo('/'); }}
          >
            <ArrowLeft size={16} /> トップへ戻る
          </a>
        </div>
      </article>
    </>
  );
}

function severityLabel(s: Severity): { text: string; className: string } {
  switch (s) {
    case 'high': return { text: '緊急度：高', className: 'sev-high' };
    case 'medium': return { text: '緊急度：中', className: 'sev-medium' };
    case 'low': return { text: '緊急度：低', className: 'sev-low' };
  }
}

function Diagnose() {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [symptomId, setSymptomId] = useState<string | null>(null);

  useEffect(() => {
    document.title = '症状逆引き診断 | モンステラの基本ガイド';
    window.scrollTo(0, 0);
  }, [categoryId, symptomId]);

  const category = symptomCategories.find((c) => c.id === categoryId) ?? null;
  const symptom = category ? category.symptoms.find((s) => s.id === symptomId) ?? null : null;

  return (
    <>
      <Breadcrumb currentTitle="症状逆引き診断" />
      <article className="section-page">
        <header className="article-header">
          <div className="article-emoji" aria-hidden="true">🔍</div>
          <h1>症状逆引き診断</h1>
        </header>
        <p className="lead">
          モンステラの異変から、考えられる原因と対処を絞り込みます。質問は 2 ステップで完了します。
        </p>

        <div className="diagnose-disclaimer">
          <AlertCircle size={18} aria-hidden="true" />
          <div>
            これは確定診断ではなく、症状から推定される <strong>可能性の高い原因</strong> です。
            複数の症状が当てはまる場合は、複数の原因が重なっていることもあります。最終判断は株の状態を直接見て行ってください。
          </div>
        </div>

        {!category && (
          <section className="diagnose-step">
            <div className="diagnose-step-num">STEP 1 / 2</div>
            <h2 className="diagnose-step-title">どこに異変がありますか？</h2>
            <div className="diagnose-grid">
              {symptomCategories.map((c) => (
                <button
                  key={c.id}
                  className="diagnose-option"
                  onClick={() => setCategoryId(c.id)}
                >
                  <span className="diagnose-option-emoji" aria-hidden="true">{c.emoji}</span>
                  <span className="diagnose-option-label">{c.label}</span>
                  <span className="diagnose-option-desc">{c.description}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {category && !symptom && (
          <section className="diagnose-step">
            <div className="diagnose-step-num">STEP 2 / 2</div>
            <button
              className="diagnose-back"
              onClick={() => { setCategoryId(null); setSymptomId(null); }}
            >
              <ArrowLeft size={14} /> カテゴリを選び直す
            </button>
            <h2 className="diagnose-step-title">
              <span aria-hidden="true">{category.emoji}</span> {category.label}：当てはまる症状を選んでください
            </h2>
            <div className="diagnose-symptom-list">
              {category.symptoms.map((s) => (
                <button
                  key={s.id}
                  className="diagnose-symptom"
                  onClick={() => setSymptomId(s.id)}
                >
                  <span>{s.label}</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
        )}

        {category && symptom && (
          <section className="diagnose-result">
            <button
              className="diagnose-back"
              onClick={() => setSymptomId(null)}
            >
              <ArrowLeft size={14} /> 症状を選び直す
            </button>
            <div className="diagnose-result-header">
              <div className="diagnose-result-label">選択した症状</div>
              <h2 className="diagnose-result-symptom">
                <span aria-hidden="true">{category.emoji}</span> {symptom.label}
              </h2>
            </div>

            <h3 className="diagnose-result-title">考えられる原因（{symptom.causes.length}件）</h3>
            <div className="diagnose-causes">
              {symptom.causes.map((cause, idx) => {
                const sev = severityLabel(cause.severity);
                const related = sections.find((s) => s.id === cause.relatedSectionId);
                return (
                  <div key={idx} className="diagnose-cause">
                    <div className="diagnose-cause-head">
                      <span className={`diagnose-sev ${sev.className}`}>{sev.text}</span>
                      <h4 className="diagnose-cause-title">{cause.title}</h4>
                    </div>
                    <p className="diagnose-cause-desc">{cause.description}</p>
                    <div className="diagnose-cause-action">
                      <div className="diagnose-cause-action-label">すぐできる対処</div>
                      <p>{cause.quickAction}</p>
                    </div>
                    {related && (
                      <a
                        href={`${BASE}/${related.id}/`}
                        className="diagnose-cause-link"
                        onClick={(e) => { e.preventDefault(); navigateTo(`/${related.id}/`); }}
                      >
                        詳しく：{related.shortTitle} <ChevronRight size={14} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="diagnose-result-footer">
              <button
                className="diagnose-restart"
                onClick={() => { setCategoryId(null); setSymptomId(null); }}
              >
                別の症状を診断する
              </button>
            </div>
          </section>
        )}

        <div className="section-footer">
          <a
            href={`${BASE}/`}
            className="back-link"
            onClick={(e) => { e.preventDefault(); navigateTo('/'); }}
          >
            <ArrowLeft size={16} /> トップへ戻る
          </a>
        </div>
      </article>
    </>
  );
}

function NotFound() {
  return (
    <div className="section-page">
      <h1>ページが見つかりません</h1>
      <p>お探しのページは存在しないか、移動した可能性があります。</p>
      <a
        href={`${BASE}/`}
        onClick={(e) => { e.preventDefault(); navigateTo('/'); }}
      >
        トップへ戻る
      </a>
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <a
          href={`${BASE}/glossary/`}
          onClick={(e) => { e.preventDefault(); navigateTo('/glossary/'); }}
        >用語集</a>
        <a
          href={`${BASE}/about/`}
          onClick={(e) => { e.preventDefault(); navigateTo('/about/'); }}
        >サイトについて</a>
        <a
          href={`${BASE}/privacy/`}
          onClick={(e) => { e.preventDefault(); navigateTo('/privacy/'); }}
        >プライバシーポリシー</a>
        <a href="https://study-apps.com/">study-apps.com</a>
      </div>
      <div style={{ marginTop: 8 }}>
        本サイトは一般的な情報を提供するもので、専門家の助言の代替ではありません。ペットの誤食など緊急時は獣医師にご相談ください。
      </div>
    </footer>
  );
}

const ABOUT_CONTENT = `本サイト「モンステラの基本ガイド」は、観葉植物モンステラ（Monstera deliciosa）に興味を持った方が、まずひととおりの情報に触れられるようにまとめたリファレンスサイトです。植物としての基礎知識、育て方、季節管理、剪定や増やし方、病害虫対処、選び方、ペットを含む安全性までを家庭目線で紹介しています。

本サイトの内容は一般的な情報提供を目的としており、専門家による診断・処方・処置の代わりにはなりません。植物が深刻な病害虫被害を受けた場合は園芸専門店や植物医に、ペットの誤食が疑われる場合は速やかに獣医師にご相談ください。`;

const PRIVACY_CONTENT = `## アクセス解析

本サイトでは、サイトの利用状況把握のために Google Analytics を使用しています。Google Analytics はクッキーを利用して匿名のトラフィックデータを収集します。収集される情報は匿名で、個人を特定するものではありません。

## 広告について

本サイトでは Google AdSense などの第三者配信の広告サービスを利用することがあります。広告配信事業者は、ユーザーの興味に応じた広告を表示するためにクッキーを使用することがあります。Google が広告 Cookie を使用することにより、Google や提携サイトによる広告の配信が可能になります。

## 免責事項

本サイトの情報は可能な限り正確を期していますが、その完全性・正確性を保証するものではありません。本サイトの情報を利用したことにより生じた損害について、運営者は一切の責任を負いません。`;

function Glossary() {
  useEffect(() => {
    document.title = '用語集 | モンステラの基本ガイド';
    window.scrollTo(0, 0);
  }, []);
  const sorted = [...glossary].sort((a, b) =>
    (a.reading || a.term).localeCompare(b.reading || b.term, 'ja')
  );
  return (
    <>
      <Breadcrumb currentTitle="用語集" />
      <article className="section-page">
        <header className="article-header">
          <div className="article-emoji" aria-hidden="true">📖</div>
          <h1>モンステラ用語集</h1>
        </header>
        <p className="lead">
          本サイトに登場する園芸用語をまとめました。気根、葉裂、斑入り、シュウ酸カルシウムなど、育て方や安全性の理解に役立ててください。
        </p>
        <dl className="glossary-list">
          {sorted.map((g) => (
            <div key={g.term} className="glossary-entry">
              <dt>
                <span className="glossary-term">{g.term}</span>
                {g.reading && g.reading !== g.term && (
                  <span className="glossary-reading">（{g.reading}）</span>
                )}
              </dt>
              <dd>
                <p>{g.description}</p>
                {g.relatedSectionId && (() => {
                  const related = sections.find((s) => s.id === g.relatedSectionId);
                  if (!related) return null;
                  return (
                    <a
                      href={`${BASE}/${related.id}/`}
                      className="glossary-related"
                      onClick={(e) => { e.preventDefault(); navigateTo(`/${related.id}/`); }}
                    >
                      関連ページ：{related.shortTitle} →
                    </a>
                  );
                })()}
              </dd>
            </div>
          ))}
        </dl>
      </article>
    </>
  );
}

function About() {
  useEffect(() => { document.title = 'サイトについて | モンステラの基本ガイド'; }, []);
  return (
    <>
      <Breadcrumb currentTitle="サイトについて" />
      <article className="section-page">
        <h1>サイトについて</h1>
        <div className="section-content">{parseContent(ABOUT_CONTENT)}</div>
      </article>
    </>
  );
}

function Privacy() {
  useEffect(() => { document.title = 'プライバシーポリシー | モンステラの基本ガイド'; }, []);
  return (
    <>
      <Breadcrumb currentTitle="プライバシーポリシー" />
      <article className="section-page">
        <h1>プライバシーポリシー</h1>
        <div className="section-content">{parseContent(PRIVACY_CONTENT)}</div>
      </article>
    </>
  );
}

export default function App() {
  const [path, setPath] = useState<string>(getCurrentPath());

  useEffect(() => {
    const handler = () => setPath(getCurrentPath());
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const normalized = path.replace(/\/$/, '') || '/';

  let content: ReactNode;
  if (normalized === '/' || normalized === '') {
    content = <Home />;
  } else if (normalized === '/about') {
    content = <About />;
  } else if (normalized === '/privacy') {
    content = <Privacy />;
  } else if (normalized === '/glossary') {
    content = <Glossary />;
  } else if (normalized === '/diagnose') {
    content = <Diagnose />;
  } else if (normalized === '/variegated-check') {
    content = <VariegatedCheck />;
  } else if (normalized === '/variety-check') {
    content = <VarietyCheck />;
  } else {
    const id = normalized.replace(/^\//, '');
    const section = sections.find((s) => s.id === id);
    content = section ? <SectionPage section={section} /> : <NotFound />;
  }

  return (
    <>
      <a href="#main-content" className="skip-link">メインコンテンツへスキップ</a>
      <Header />
      <main id="main-content" className="site-shell" tabIndex={-1}>{content}</main>
      <Footer />
    </>
  );
}
