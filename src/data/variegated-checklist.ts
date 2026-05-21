export type Weight = 'critical' | 'important' | 'recommended';

export type CheckCategory = 'genetic' | 'health' | 'seller' | 'prep';

export type CheckItem = {
  id: string;
  category: CheckCategory;
  question: string;
  detail: string;
  checkPoints: string[];
  weight: Weight;
  whyMatters: string;
};

export const checkCategories: Record<CheckCategory, { label: string; emoji: string; description: string }> = {
  genetic: {
    label: '斑の遺伝形質（最重要）',
    emoji: '🧬',
    description: '将来出る新葉にも斑が出続けるかを左右する、最も重要な観点',
  },
  health: {
    label: '苗の健康状態',
    emoji: '🌱',
    description: '輸送後・購入後すぐに枯れない健康な株か',
  },
  seller: {
    label: '出品者・販売情報',
    emoji: '🛒',
    description: '高額取引のため、信頼できる売り手と価格設定か',
  },
  prep: {
    label: '購入後の受け入れ準備',
    emoji: '🪴',
    description: '迎えた後、株を健康に保つための家庭側の準備',
  },
};

export const checkItems: CheckItem[] = [
  {
    id: 'g1',
    category: 'genetic',
    question: '成長点（最新の節）に健全な斑が出ており、全緑または全白ではない',
    detail: '株自体に斑があっても、これから伸びる節に斑がなければ新葉は緑に戻ります。最も重要なポイントです。',
    checkPoints: [
      '最新の節（先端付近）や芽鞘に、白・黄・淡緑の斑が見える',
      '全緑の節からの挿し穂ではない（全緑節からは緑戻り個体しか出ない）',
      '全白（フルムーン状態）の致死性白化苗ではない（光合成できず枯死する）',
    ],
    weight: 'critical',
    whyMatters: '成長点に斑がなければ新葉は緑に戻ります。全緑からは緑のモンステラに、全白では光合成不能で枯死します。',
  },
  {
    id: 'h1',
    category: 'health',
    question: '発根済みで、茎・葉・根・気根に明らかな異常がない',
    detail: 'カット苗の場合は根が確認できるか、株全体の健康状態を多面的に確認します。',
    checkPoints: [
      '根が写真や記載で確認できる（未発根カット苗ではない）',
      '葉色（緑部分）が深く、ハリ・光沢がある',
      '茎にしわ・黒変・地際の軟化がない',
      '葉裏や茎に害虫の痕跡（白い綿状物・赤茶の点・カイガラムシ）がない',
      '気根が緑〜茶色で適度な太さがあり、黒くしぼんでいない',
    ],
    weight: 'critical',
    whyMatters: '未発根や弱った株、害虫付きの株は、輸送ストレスと環境変化が重なる順化期間に失敗するリスクが高くなります。',
  },
  {
    id: 's1',
    category: 'seller',
    question: '信頼できる出品者で、根鉢の写真が提示され、価格が相場通り',
    detail: '高額取引になるため、出品情報を多面的に確認します。',
    checkPoints: [
      '根鉢や根の状態が分かる写真が提示されている',
      '出品者の評価・取引実績が十分にある（特に植物の取引実績）',
      '価格が相場の範囲内（タイ・コンステレーション若苗：通販 4,980 円前後、フリマ 1,600〜3,450 円前後）',
      '組織培養苗・実生苗・カット苗のどれかが明示されている',
    ],
    weight: 'important',
    whyMatters: '葉だけの写真では根の致命的な問題が隠されている可能性があります。極端に安い場合は偽物・未発根・状態不良のリスクが高くなります。',
  },
  {
    id: 'p1',
    category: 'prep',
    question: '到着後の順化期間と、明るい間接光・室温 10°C 以上・湿度確保ができる環境がある',
    detail: '迎え入れ後の管理ができないと、せっかくの斑入り苗を枯らしてしまいます。',
    checkPoints: [
      '到着後 1〜2 週間の順化期間を取れる（すぐの植え替え・施肥を避けられる）',
      'レースカーテン越しの明るい間接光が確保できる',
      '冬の室温を常時 10°C 以上に保てる',
      '湿度 50〜70% を保つ手段（加湿器・葉水）がある',
    ],
    weight: 'important',
    whyMatters: '斑入り品種は緑部分が少ないため、通常品種より光量不足に弱く、また葉緑素を欠く部分は乾燥・寒さに弱い性質があります。',
  },
  {
    id: 'g2',
    category: 'genetic',
    question: 'ハーフムーンや散り斑など、長期的に斑が継承されやすいパターンを含む',
    detail: '必須ではありませんが、長期保有や挿し木で増やす計画があるなら考慮したい項目です。',
    checkPoints: [
      '半分緑・半分白のハーフムーンパターンが見える',
      '葉全体に星屑のような散り斑が広がる（タイ・コンステレーション特有）',
      '単色の偏った斑ではなく、緑と斑のバランスが取れている',
    ],
    weight: 'recommended',
    whyMatters: '健全なバランスの斑入り節を含むと、次世代の葉でも美しい斑入りが継続しやすくなります。',
  },
];
