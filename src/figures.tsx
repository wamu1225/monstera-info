import { figureHtml } from './figures-data';

// 本文の {{figure:KEY}} で差し込む自作SVG模式図。
// SVGの実体は figures-data.ts（React/prerender共用のSSOT）に一元化し、二重レンダラの食い違いを防ぐ。
export function Figure({ id }: { id: string }) {
  const html = figureHtml(id);
  if (!html) return null;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
