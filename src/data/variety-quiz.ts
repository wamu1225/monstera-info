export type VarietyId = 'deliciosa' | 'borsigiana' | 'adansonii' | 'minima' | 'compacta';

export type Variety = {
  id: VarietyId;
  name: string;
  scientificName: string;
  emoji: string;
  summary: string;
  traits: string[];
  notes: string;
};

export const varieties: Record<VarietyId, Variety> = {
  deliciosa: {
    id: 'deliciosa',
    name: 'デリシオーサ',
    scientificName: 'Monstera deliciosa',
    emoji: '🌿',
    summary: 'モンステラ属の代表種。大型で力強い樹形が印象的な「王道」モンステラ。',
    traits: [
      '葉が大型（直径 50cm を超えることもある）',
      '葉は円形に近い形で、深い切れ込みと多数の穴を持つ',
      '節と節の間が短く詰まり、株がコンパクトでがっしりとした樹形',
      '葉柄の付け根に明瞭な波打つフリル（ヒダ）が発達',
      '比較的緩やかに生長し、自立性が高い',
    ],
    notes: '床置きシンボル株として人気。家庭で最もよく見るタイプ。',
  },
  borsigiana: {
    id: 'borsigiana',
    name: 'ボルシギアナ',
    scientificName: 'Monstera borsigiana / M. deliciosa var. borsigiana',
    emoji: '🌱',
    summary: 'デリシオーサより小型でつる性が強い系統。支柱仕立てや上方向の生長に向く。',
    traits: [
      '葉はやや小型（最大 31cm 程度）、楕円形',
      '節と節の間が長く、葉同士の間隔が広く伸びる',
      '生長が早く、つる性が強い（自重で這うことも）',
      '葉柄のフリルは基本的に平滑（極大株でわずかに皺）',
      '支柱を使った幹立ち仕立てに向く',
    ],
    notes: '一見デリシオーサに似るが、節間の長さで明確に区別できる。',
  },
  adansonii: {
    id: 'adansonii',
    name: 'アダンソニー（マドカズラ）',
    scientificName: 'Monstera adansonii',
    emoji: '🕳️',
    summary: '葉の縁に切れ込みはなく、葉身内に穴（窓）だけが規則的に開く独特の品種。',
    traits: [
      '葉の縁に切れ込みは入らない',
      '葉身内側に大小の穴（穿孔）が規則的に並ぶ',
      'つる性が強く、ハンギングや支柱仕立てに向く',
      '節間は中〜長め',
      '生長が早い',
    ],
    notes: '「マドカズラ」の和名で流通。垂れ下げて飾るスタイルが人気。',
  },
  minima: {
    id: 'minima',
    name: 'ヒメモンステラ',
    scientificName: 'Monstera minima / Rhaphidophora tetrasperma 等',
    emoji: '🌿',
    summary: 'コンパクトで管理しやすい小型品種。狭い室内や卓上、ハンギング向け。',
    traits: [
      '葉と全体のサイズが小型',
      '切れ込みは入るが、デリシオーサに比べて遅れて出る傾向',
      '比較的長めの節間で細いつるを伸ばす',
      '低光量にも比較的耐え、卓上インテリアに向く',
      'フリルは存在しない',
    ],
    notes: '植物学的にはラフィドフォラ属（別属）に分類されることもあるが、市場では「ヒメモンステラ」として流通。',
  },
  compacta: {
    id: 'compacta',
    name: 'デリシオーサ・コンパクタ',
    scientificName: 'Monstera deliciosa "Compacta"',
    emoji: '🪴',
    summary: 'デリシオーサの矮性変異種。節間が極端に短く、葉も小さめで生長が穏やか。',
    traits: [
      '節間がデリシオーサよりさらに短く詰まる',
      '葉のサイズが小さめ',
      '生長が極めて緩やか',
      'がっしりとしたコンパクトな樹形',
      '都市型のマンションなど省スペース栽培に最適',
    ],
    notes: '見た目はデリシオーサのミニ版。狭い室内でじっくり育てたい人に向く。',
  },
};

export type QuizOption = {
  label: string;
  scores: Partial<Record<VarietyId, number>>;
};

export type QuizQuestion = {
  id: string;
  question: string;
  hint?: string;
  options: QuizOption[];
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: '葉の大きさはどのくらい？',
    hint: '最大葉のサイズで判断（成熟葉を基準に）',
    options: [
      {
        label: '小さい（10〜25cm 程度）',
        scores: { minima: 3, compacta: 2 },
      },
      {
        label: '中くらい（25〜40cm 程度）',
        scores: { borsigiana: 3, adansonii: 2, compacta: 2, deliciosa: 1 },
      },
      {
        label: '大きい（40cm 以上、50cm を超えるものも）',
        scores: { deliciosa: 3 },
      },
      {
        label: 'まだ幼若で判断できない',
        scores: { deliciosa: 1, borsigiana: 1, adansonii: 1, minima: 1, compacta: 1 },
      },
    ],
  },
  {
    id: 'q2',
    question: '成熟葉の縁と内側のパターンは？',
    hint: '十分に成熟した葉を観察してください。幼若葉では判断できません。',
    options: [
      {
        label: '縁から深く切れ込みが入り、葉身内にも穴がある',
        scores: { deliciosa: 3, borsigiana: 3, compacta: 2 },
      },
      {
        label: '縁の切れ込みはなく、葉身内に穴だけが規則的に開く',
        scores: { adansonii: 3 },
      },
      {
        label: '切れ込みはあるが浅め・控えめ',
        scores: { minima: 3, borsigiana: 1 },
      },
      {
        label: 'まだ切れ込みが入っていない（幼若葉）',
        scores: { deliciosa: 1, borsigiana: 1, adansonii: 1, minima: 1, compacta: 1 },
      },
    ],
  },
  {
    id: 'q3',
    question: '茎の節と節の間隔（節間）は？',
    hint: '葉の付け根と次の葉の付け根の距離を見ます。',
    options: [
      {
        label: '極端に短く詰まる（葉が密集して見える）',
        scores: { compacta: 3, deliciosa: 2 },
      },
      {
        label: '短く詰まる（葉同士が近い）',
        scores: { deliciosa: 3, compacta: 1 },
      },
      {
        label: '長く伸びる（葉と葉の間隔が広い、つる性）',
        scores: { borsigiana: 3, adansonii: 3, minima: 2 },
      },
    ],
  },
  {
    id: 'q4',
    question: '葉柄（葉と茎をつなぐ部分）の付け根にフリル（波打つヒダ）はある？',
    hint: '成熟葉でのみ判別可能な特徴です。',
    options: [
      {
        label: 'はっきりとフリル（皺）がある',
        scores: { deliciosa: 3, compacta: 2 },
      },
      {
        label: 'フリルはなく、ほぼ平滑',
        scores: { borsigiana: 3, adansonii: 2, minima: 2 },
      },
      {
        label: 'よく分からない・確認できない',
        scores: { deliciosa: 1, borsigiana: 1, adansonii: 1, minima: 1, compacta: 1 },
      },
    ],
  },
  {
    id: 'q5',
    question: '株全体の樹形・支え方は？',
    options: [
      {
        label: 'がっしりと自立し、シンボル株のような風格',
        scores: { deliciosa: 3, compacta: 3 },
      },
      {
        label: 'つる性が強く、支柱や誘引が必要',
        scores: { borsigiana: 3, adansonii: 2 },
      },
      {
        label: 'ハンギングや卓上で垂れ下げる形が似合う',
        scores: { adansonii: 3, minima: 3 },
      },
    ],
  },
];
