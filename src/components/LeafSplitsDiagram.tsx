import { useState, useMemo } from 'react';

/**
 * モンステラの葉に切れ込みと穴が入る原理を可視化する教育的なインタラクティブ図。
 * 特定品種の正確な葉形ではなく、概念図として描画する。
 *
 * - 光量スライダー：高いほど切れ込みと穴が多く生じる（光合成効率の最適化）
 * - 成熟度スライダー：低いと幼若で切れ込みが出ない、高いと成熟して切れ込みが出る
 */
export function LeafSplitsDiagram() {
  const [light, setLight] = useState(80);
  const [maturity, setMaturity] = useState(80);

  // 株が幼若だとアポトーシスのエネルギーが取れず切れ込みが出ない
  // 光量が低いと省エネモードで切れ込みが出ない
  const effectiveSplitFactor = Math.min(light, maturity) / 100;

  // 切れ込みの本数（0〜8）と深さ
  const splitCount = Math.round(effectiveSplitFactor * 8);
  const splitDepth = effectiveSplitFactor * 65;

  // 穴の数（0〜6）と大きさ
  const holeCount = Math.max(0, Math.round(effectiveSplitFactor * 6) - 1);
  const holeSize = effectiveSplitFactor * 14 + 4;

  // 葉のサイズ（成熟度で大きく）
  const leafScale = 0.7 + maturity * 0.003;

  // 切れ込みの三角形パスを生成（左右対称、葉の両側に交互に）
  const splits = useMemo(() => {
    const items: { d: string; key: string }[] = [];
    for (let i = 0; i < splitCount; i++) {
      // 葉の縦方向 0..1 で位置を計算（上下マージン付き）
      const t = 0.15 + (0.7 * i) / Math.max(splitCount - 1, 1);
      const isLeft = i % 2 === 0;
      const sign = isLeft ? -1 : 1;
      // 葉の縁から内側へ三角形
      const edgeX = sign * (95 - Math.sin(t * Math.PI) * 5);
      const edgeY = -100 + t * 200;
      const tipX = sign * (95 - splitDepth - Math.sin(t * Math.PI) * 5);
      const tipY = edgeY;
      const halfWidth = 10;
      items.push({
        key: `split-${i}`,
        d: `M ${edgeX} ${edgeY - halfWidth} L ${tipX} ${tipY} L ${edgeX} ${edgeY + halfWidth} Z`,
      });
    }
    return items;
  }, [splitCount, splitDepth]);

  // 穴（フェネストレーション）を中心軸付近に配置
  const holes = useMemo(() => {
    const items: { cx: number; cy: number; rx: number; ry: number; key: string }[] = [];
    for (let i = 0; i < holeCount; i++) {
      const t = 0.2 + (0.6 * i) / Math.max(holeCount - 1, 1);
      const cy = -100 + t * 200;
      const cx = (i % 2 === 0 ? -1 : 1) * 25;
      items.push({
        key: `hole-${i}`,
        cx,
        cy,
        rx: holeSize * 0.55,
        ry: holeSize * 0.9,
      });
    }
    return items;
  }, [holeCount, holeSize]);

  // ステータスラベル
  const stage =
    maturity < 30
      ? '幼若株：切れ込みなし'
      : light < 30
      ? '省エネモード（日照不足）：丸い葉に戻る'
      : effectiveSplitFactor < 0.5
      ? '展開期：切れ込みが浅い'
      : effectiveSplitFactor < 0.8
      ? '成熟葉：切れ込みあり'
      : '十分成熟＋高光量：切れ込みと穴が発達';

  return (
    <div className="leaf-diagram">
      <div className="leaf-diagram-disclaimer">
        ※ これは原理を理解するための概念図です。実際の葉形は品種・個体差・環境で大きく変化します。
      </div>
      <div className="leaf-diagram-stage">{stage}</div>

      <div className="leaf-diagram-canvas">
        <svg viewBox="-120 -120 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="モンステラの葉の概念図">
          <defs>
            <radialGradient id="ldLeaf" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#6FA37F"/>
              <stop offset="60%" stopColor="#3D7A52"/>
              <stop offset="100%" stopColor="#1E3F2A"/>
            </radialGradient>
            <mask id="ldMask">
              <rect x="-120" y="-120" width="240" height="240" fill="white"/>
              {/* 縁の切れ込みは黒で打ち抜く */}
              {splits.map((s) => (
                <path key={s.key} d={s.d} fill="black"/>
              ))}
              {/* 穴も黒で打ち抜く */}
              {holes.map((h) => (
                <ellipse key={h.key} cx={h.cx} cy={h.cy} rx={h.rx} ry={h.ry} fill="black"/>
              ))}
            </mask>
          </defs>
          <g transform={`scale(${leafScale})`}>
            {/* ベース葉（楕円） */}
            <ellipse cx="0" cy="0" rx="95" ry="100" fill="url(#ldLeaf)" stroke="#1E3F2A" strokeWidth="1.5" mask="url(#ldMask)"/>
            {/* 主葉脈 */}
            <line x1="0" y1="-95" x2="0" y2="95" stroke="#C9A14A" strokeWidth="1" opacity="0.5"/>
          </g>
        </svg>
      </div>

      <div className="leaf-diagram-controls">
        <div className="leaf-diagram-control">
          <label htmlFor="ld-maturity">
            <span>株の成熟度</span>
            <span className="leaf-diagram-value">{maturity}</span>
          </label>
          <input
            id="ld-maturity"
            type="range"
            min={0}
            max={100}
            value={maturity}
            onChange={(e) => setMaturity(parseInt(e.target.value, 10))}
          />
          <div className="leaf-diagram-range-labels">
            <span>幼若</span>
            <span>成熟</span>
          </div>
        </div>

        <div className="leaf-diagram-control">
          <label htmlFor="ld-light">
            <span>光量</span>
            <span className="leaf-diagram-value">{light}</span>
          </label>
          <input
            id="ld-light"
            type="range"
            min={0}
            max={100}
            value={light}
            onChange={(e) => setLight(parseInt(e.target.value, 10))}
          />
          <div className="leaf-diagram-range-labels">
            <span>暗所（省エネ）</span>
            <span>明るい間接光</span>
          </div>
        </div>
      </div>

      <div className="leaf-diagram-hint">
        💡 <strong>幼若 + 暗所</strong> → 切れ込みのない丸い葉。<strong>成熟 + 明るい</strong> → 切れ込みと穴が発達。
        家庭で「新葉が丸いまま」のときは、株がエネルギーを節約する状態に入っているサインです。
      </div>
    </div>
  );
}
