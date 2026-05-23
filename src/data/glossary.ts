export type GlossaryTerm = {
  term: string;
  reading?: string;
  description: string;
  relatedSectionId?: string;
};

export const glossary: GlossaryTerm[] = [
  {
    term: 'モンステラ・デリシオーサ',
    reading: 'もんすてら でりしおーさ',
    description:
      'モンステラ属の代表種。葉が大型化し直径50cmを超えることもあり、円形に近い葉に深い切れ込みと多数の穴が入る。節間が短く、がっしりとしたシンボル株として人気が高い。',
    relatedSectionId: 'basics',
  },
  {
    term: 'ボルシギアナ',
    reading: 'ぼるしぎあな',
    description:
      'デリシオーサの近縁種、または変種とされる系統。葉はやや小型で楕円形、節間が長くつる性が強い。家庭栽培では支柱や仕立てが必要になることが多い。',
    relatedSectionId: 'basics',
  },
  {
    term: 'アダンソニー',
    reading: 'あだんそにー',
    description:
      'マドカズラの名でも流通するモンステラ属の品種。縁の切れ込みはなく、葉身の内側に大小の窓のような穴が並ぶのが特徴。ハンギングや支柱仕立てに向く。',
    relatedSectionId: 'basics',
  },
  {
    term: 'ヒメモンステラ',
    reading: 'ひめもんすてら',
    description:
      '小型でコンパクトな品種。狭い室内でも管理しやすく、卓上や低光量環境でも比較的順応する。植物学的にはラフィドフォラ属に分類されることもあるが、市場では「ヒメモンステラ」として流通している。',
    relatedSectionId: 'basics',
  },
  {
    term: 'フェネストレーション',
    reading: 'ふぇねすとれーしょん',
    description:
      'モンステラ最大の特徴である、葉に開いた窓状の穴。新葉が筒状に巻かれている初期段階で、特定の細胞があらかじめプログラムされた死（アポトーシス）を実行することで形成される。',
    relatedSectionId: 'basics',
  },
  {
    term: '気根',
    reading: 'きこん',
    description:
      '茎の節から空中に伸びる根。自生地では樹木への固定、空気中の水分吸着、株の支持の役割を担う。家庭栽培では切る・残す・支柱に絡める・培養土に下ろすなど選択が可能。',
    relatedSectionId: 'seasonal',
  },
  {
    term: '節',
    reading: 'ふし',
    description:
      '葉柄・気根・新芽が出る茎の膨らんだ部分。未分化の分裂組織（潜伏芽）が集中し、将来の新しい成長を担保する重要な器官。剪定では節を傷つけないようにすることが原則。',
    relatedSectionId: 'seasonal',
  },
  {
    term: '芽鞘',
    reading: 'がしょう',
    description:
      'モンステラの新芽を覆う筒状の組織。中で新葉が巻かれた状態で育ち、展開とともに離脱する。芽鞘の段階で切れ込み構造が完成しているため、開いた直後から窓のある葉が現れる。',
    relatedSectionId: 'basics',
  },
  {
    term: '斑入り',
    reading: 'ふいり',
    description:
      '遺伝子または葉緑体の突然変異により、葉の一部が白や黄色に退色する変異品種。タイ・コンステレーション、アルボ、オーレアなどが代表。観賞価値が高い一方、白い部分には葉緑素がなく組織が弱いため、管理難度が上がる。',
    relatedSectionId: 'basics',
  },
  {
    term: '緑戻り',
    reading: 'みどりもどり',
    description:
      '斑入り品種で、新葉がすべて緑一色に戻ってしまう現象。「先祖返り」とも呼ぶ。窒素過多やストレスで発生しやすく、斑の形質が残っている節まで切り戻すことで再び斑入り葉を誘発できる。',
    relatedSectionId: 'selection',
  },
  {
    term: 'ハーフムーン',
    reading: 'はーふむーん',
    description:
      '斑入り品種で、葉の片側半分が白〜淡色、もう半分が緑になる斑のパターン。繁殖時に「ハーフムーンを含む節」を選ぶことが、緑戻りと致死性白化を回避する重要な指標とされる。',
    relatedSectionId: 'selection',
  },
  {
    term: 'アポトーシス',
    reading: 'あぽとーしす',
    description:
      'プログラムされた細胞死。モンステラの葉に切れ込みや穴が生じるのは、新芽が展開する前の段階で、特定の細胞がアポトーシスを実行するため。エネルギーを必要とするプロセスのため、若い株やストレス下では発現しにくい。',
    relatedSectionId: 'basics',
  },
  {
    term: '不溶性シュウ酸カルシウム',
    reading: 'ふようせい しゅうさんかるしうむ',
    description:
      'サトイモ科植物が組織内に持つ針状の結晶（ラフィド）。水に溶けず、噛むと粘膜に物理的に突き刺さって激しい痛みと腫れを引き起こす。モンステラがペットに有害とされる主な機序。',
    relatedSectionId: 'safety',
  },
  {
    term: 'ラフィド',
    reading: 'らふぃど',
    description:
      '不溶性シュウ酸カルシウムの針状結晶の総称。植物の防御機構として進化したと考えられている。多くのサトイモ科植物に共通する特徴で、咀嚼や接触で口腔粘膜・皮膚に刺激を与える。',
    relatedSectionId: 'safety',
  },
  {
    term: '根腐れ',
    reading: 'ねぐされ',
    description:
      '鉢内過湿による土壌酸素欠乏で根が呼吸を停止して壊死し、嫌気性病原菌（ピシウム・フザリウム・軟腐病菌）が増殖して根を分解する状態。栽培で最も致死率が高い生理障害だが、段階別に介入すれば多くは救える。',
    relatedSectionId: 'troubles',
  },
  {
    term: '葉焼け',
    reading: 'はやけ',
    description:
      '強い直射日光や急激な光量変化で葉の組織が損傷し、褐色や黒の斑点・薄い茶色になる状態。一度焼けた部分は回復しないため、レースカーテン越しの光に位置を調整する予防が重要。',
    relatedSectionId: 'troubles',
  },
  {
    term: 'ヘゴ棒',
    reading: 'へごぼう',
    description:
      'シダ植物のヘゴの幹を加工した支柱。粗い繊維表面に気根が引っかかりやすく、垂直仕立てに使われる。保水性が低いため、定期的な霧吹きで湿らせる必要がある。',
    relatedSectionId: 'seasonal',
  },
  {
    term: '水苔ポール',
    reading: 'みずごけぽーる',
    description:
      'プラスチックネット内に乾燥水苔を充填した支柱。保水性が高く、湿潤を好む気根が水苔内部に侵入して活着する。水苔の乾燥・カビには定期確認が必要。',
    relatedSectionId: 'seasonal',
  },
  {
    term: '茎伏せ',
    reading: 'くきふせ',
    description:
      '節を含む茎を水苔や用土に寝かせて発根・発芽させる増殖手法。透明容器で密閉すれば高湿度が自己維持され、安全に新芽を引き出せる。室温 20〜25°C、明るい日陰が成功条件。',
    relatedSectionId: 'seasonal',
  },
  {
    term: '水挿し',
    reading: 'みずざし',
    description:
      'カットした茎を水に挿して発根させる増殖手法。発根の様子を視覚的に追えるのが利点。水の溶存酸素不足で切り口が腐敗しないよう、毎日の水交換が成功の鍵。',
    relatedSectionId: 'seasonal',
  },
  {
    term: 'ASPCA',
    reading: 'あすぴーしーえー',
    description:
      'American Society for the Prevention of Cruelty to Animals（米国動物虐待防止協会）。ペットへの植物の毒性データベースを公開しており、観葉植物の安全性評価で世界的に参照される。モンステラは犬・猫に対する有害植物として登録されている。',
    relatedSectionId: 'safety',
  },
  {
    term: 'ラフィドフォラ・テトラスペルマ',
    reading: 'らふぃどふぉら てとらすぺるま',
    description:
      '学名 Rhaphidophora tetrasperma。東南アジア（マレーシア・タイ南部）原産のサトイモ科のつる性植物で、日本では「ヒメモンステラ」「ミニモンステラ」の名で流通する。植物分類学上はモンステラ属ではなく別属。葉に切れ込みは入るが、モンステラ属のような完全に閉じた穿孔は形成しない。',
    relatedSectionId: 'basics',
  },
  {
    term: '炭疽病',
    reading: 'たんそびょう',
    description:
      '糸状菌（カビ）による葉の病害。葉面に不整形の黒褐色斑点が現れ、拡大すると内側が淡褐色〜灰白色に乾燥して組織に穴が開く。高温多湿・窒素過多・散水時の水滴のはね返りで発生・拡大する。',
    relatedSectionId: 'troubles',
  },
  {
    term: '斑点細菌病',
    reading: 'はんてんさいきんびょう',
    description:
      '細菌（バクテリア）による葉の病害。葉脈に沿う黒褐色〜水浸状の不整形シミ斑が特徴。剪定ハサミ・手・水滴を介して伝染する。カビ用殺菌剤は無効で、銅殺菌剤を使用する。',
    relatedSectionId: 'troubles',
  },
  {
    term: 'アザミウマ',
    reading: 'あざみうま',
    description:
      'スリップスとも呼ばれる体長 1〜2mm の細長い微小昆虫。新芽や葉裏に寄生して吸汁し、葉脈に沿うかすり状の銀白色斑を生じさせる。トマト黄化えそウイルス等のウイルス病を媒介することでも知られる。',
    relatedSectionId: 'troubles',
  },
  {
    term: 'コナジラミ',
    reading: 'こなじらみ',
    description:
      '全長 3mm 以下の白い粉状の羽虫。葉裏に密集して吸汁し、加害部位が白っぽく退色する。甘い排泄物（甘露）ですす病を誘発し、ウイルス病も媒介する。',
    relatedSectionId: 'troubles',
  },
  {
    term: 'IPM（統合的病害虫管理）',
    reading: 'あいぴーえむ',
    description:
      'Integrated Pest Management の略。「予防（環境整備）→ 監視（早期発見）→ 物理的対処 → 化学防除」の順に段階的に対応する考え方。最初から薬剤散布に頼らず、まず風通し・灌水管理・葉水観察などの基本管理を優先する持続可能な防除アプローチ。',
    relatedSectionId: 'troubles',
  },
];
