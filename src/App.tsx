import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, List, ChevronRight, Menu, X, Calendar, Stethoscope, AlertCircle } from 'lucide-react';
import { sections } from './data/sections';
import type { Section } from './data/sections';
import { FAQ_BY_SECTION } from './data/faqs';
import { glossary } from './data/glossary';
import { symptomCategories } from './data/symptoms';
import type { Severity } from './data/symptoms';
import { LeafSplitsDiagram } from './components/LeafSplitsDiagram';
import './App.css';

const BASE = '/monstera-info';


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
    { re: /\*\*(.+?)\*\*/, render: (m) => <strong key={key++}>{m[1]}</strong> },
    { re: /`([^`]+)`/, render: (m) => <code key={key++} className="inline-code">{m[1]}</code> },
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

    // インタラクティブ要素
    if (trimmed === '[[interactive:leaf-splits]]') {
      result.push(<LeafSplitsDiagram key={key++} />);
      i++;
      continue;
    }

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

      <a
        href={`${BASE}/diagnose/`}
        className="diagnose-cta"
        onClick={(e) => { e.preventDefault(); navigateTo('/diagnose/'); }}
      >
        <Stethoscope className="diagnose-cta-icon" size={28} aria-hidden="true" />
        <div className="diagnose-cta-text">
          <div className="diagnose-cta-title">うちのモンステラ、何かおかしい？</div>
          <div className="diagnose-cta-desc">症状から考えられる原因と対処を 2 ステップで絞り込み</div>
        </div>
        <ChevronRight size={20} aria-hidden="true" />
      </a>

      <h2 className="home-section-title">セクション一覧</h2>
      <div className="section-grid">
        {sections.map((s) => (
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
        ))}
      </div>

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
  } else {
    const id = normalized.replace(/^\//, '');
    const section = sections.find((s) => s.id === id);
    content = section ? <SectionPage section={section} /> : <NotFound />;
  }

  return (
    <>
      <Header />
      <main className="site-shell">{content}</main>
      <Footer />
    </>
  );
}
