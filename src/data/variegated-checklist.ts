export type Weight = 'critical' | 'important' | 'recommended';

export type CheckCategory = 'genetic' | 'health' | 'seller' | 'prep';

export type CheckItem = {
  id: string;
  category: CheckCategory;
  question: string;
  detail: string;
  weight: Weight;
  whyMatters: string;
};

export const checkCategories: Record<CheckCategory, { label: string; emoji: string; description: string }> = {
  genetic: {
    label: '斑の遺伝形質（最重要）',
    emoji: '🧬',
    description: '将来出る新葉にも斑が出続けるかを左右する、最も重要な項目',
  },
  health: {
    label: '苗の健康状態',
    emoji: '🌱',
    description: '輸送後・購入後すぐに枯れない健康な株かを判断する',
  },
  seller: {
    label: '出品者・販売情報',
    emoji: '🛒',
    description: '高額取引のため、信頼できる売り手と価格設定かを確認',
  },
  prep: {
    label: '購入後の受け入れ準備',
    emoji: '🪴',
    description: '迎えた後、株を健康に保つための家庭側の準備',
  },
};

export const checkItems: CheckItem[] = [
  // ── 斑の遺伝形質 ──
  {
    id: 'g1',
    category: 'genetic',
    question: '現在出ている葉に、白〜黄色〜淡緑の斑が明確に入っている',
    detail: '葉の一部が白・黄色・淡い緑色に脱色しているのが視認できる状態。',
    weight: 'critical',
    whyMatters: '株自体に斑が出ていなければ、そもそも斑入り品種ではない可能性があります。',
  },
  {
    id: 'g2',
    category: 'genetic',
    question: 'これから伸びる成長点（先端の節）にも斑が出ている',
    detail: '芽鞘（新芽を覆う組織）や、最新の節の周辺に斑の形質が残っているか。出品写真の成長点付近をズームして確認。',
    weight: 'critical',
    whyMatters: '株自体に斑があっても、成長点が緑なら新葉は緑に戻る（緑戻り）可能性が極めて高くなります。',
  },
  {
    id: 'g3',
    category: 'genetic',
    question: '全緑の節（斑のない節）から伸びているカット苗ではない',
    detail: '挿し穂・カット苗の場合、節そのものに斑が含まれているかを確認。全緑の節からは緑戻り個体しか出ません。',
    weight: 'critical',
    whyMatters: '全緑の節を選ぶと、いくら期待しても緑のモンステラしか育ちません。',
  },
  {
    id: 'g4',
    category: 'genetic',
    question: '全白（葉全体がほぼ白）の致死性白化苗ではない',
    detail: 'フルムーン状態の純白苗は光合成ができず、長期生存が極めて困難。',
    weight: 'critical',
    whyMatters: '葉緑素を欠いた状態では光合成できず、貯蔵養分を使い切ると枯死します。',
  },
  {
    id: 'g5',
    category: 'genetic',
    question: 'ハーフムーンや散り斑など、健全な斑パターンを含む節がある',
    detail: '葉の半分が緑・半分が白のハーフムーン、または星屑状に散り斑が広がるパターンは安定して斑が継承されやすいとされます。',
    weight: 'important',
    whyMatters: '緑と斑のバランスが取れた節が含まれていると、次世代の葉でも斑入りが継続しやすくなります。',
  },

  // ── 苗の健康状態 ──
  {
    id: 'h1',
    category: 'health',
    question: '発根済みである（未発根カット苗ではない）',
    detail: '根が確認できる写真や記載があるか。「未発根」「カット苗」の場合は発根のリスクを引き受けることになります。',
    weight: 'important',
    whyMatters: '未発根苗は発根失敗で枯れるリスクがあり、特に高額な斑入り品種では損失が大きくなります。',
  },
  {
    id: 'h2',
    category: 'health',
    question: '葉色（緑部分）が深く、ハリ・光沢がある',
    detail: '葉が薄く弱々しい、しおれている、艶がない場合は管理不良の疑い。',
    weight: 'important',
    whyMatters: '弱った株は迎え入れた後の順化に失敗しやすくなります。',
  },
  {
    id: 'h3',
    category: 'health',
    question: '葉裏や茎に害虫の痕跡（白い綿状物・赤茶の点・カイガラムシ）がない',
    detail: '出品写真の葉裏もチェック。ベタつき・すす状汚れも害虫のサイン。',
    weight: 'important',
    whyMatters: '害虫付きの株は家庭の他の観葉植物にも被害が広がるリスクがあります。',
  },
  {
    id: 'h4',
    category: 'health',
    question: '茎にしわ・黒変・軟化がない',
    detail: '主茎の表面が滑らかで、地際に黒ずみや凹みがないか確認。',
    weight: 'critical',
    whyMatters: '茎のしわや黒変は根腐れや軟腐病の進行を示す重大なサインです。',
  },
  {
    id: 'h5',
    category: 'health',
    question: '気根が健康（黒くしぼんでいない）',
    detail: '気根は緑〜茶色で適度な太さがあり、しっかりした状態が望ましい。',
    weight: 'recommended',
    whyMatters: '気根の状態は株の健康度を示す指標になります。',
  },

  // ── 出品者・販売情報 ──
  {
    id: 's1',
    category: 'seller',
    question: '根鉢や根の状態が分かる写真が提示されている',
    detail: '葉だけの写真しかない出品は要警戒。根の状態を必ず確認できる出品を選びます。',
    weight: 'important',
    whyMatters: '葉だけ撮影された出品では、根の致命的な問題が隠されている可能性があります。',
  },
  {
    id: 's2',
    category: 'seller',
    question: '出品者の評価・取引実績が十分にある',
    detail: 'フリマアプリやオークションでは過去の評価コメントを確認。植物の取引実績がある出品者だとさらに安心。',
    weight: 'important',
    whyMatters: '評価の薄い・新規出品者は梱包品質や偽物のリスクが相対的に高くなります。',
  },
  {
    id: 's3',
    category: 'seller',
    question: '価格が相場と大きく乖離していない',
    detail: 'タイ・コンステレーション若苗の通販相場は 4,980 円前後、フリマで 1,600〜3,450 円前後。極端に安い場合は偽物・未発根・問題株の可能性。',
    weight: 'important',
    whyMatters: '相場より極端に安い場合、品種偽装や状態不良など何らかの理由がある可能性が高くなります。',
  },
  {
    id: 's4',
    category: 'seller',
    question: '組織培養苗・実生苗・カット苗のどれかが明示されている',
    detail: 'タイ・コンステレーションは組織培養（クローン）で斑が固定されたものが流通。記載がない場合は出品者に確認。',
    weight: 'recommended',
    whyMatters: '由来が明確だと、斑の安定性や育成方針を判断しやすくなります。',
  },

  // ── 購入後の受け入れ準備 ──
  {
    id: 'p1',
    category: 'prep',
    question: '購入後 1〜2 週間は環境変化への順化期間を取れる',
    detail: '到着後すぐの植え替え・施肥は避け、レースカーテン越しの明るい日陰で養生する期間を確保。',
    weight: 'important',
    whyMatters: '輸送ストレスを受けた株は、急な環境変化でさらに弱ることがあります。',
  },
  {
    id: 'p2',
    category: 'prep',
    question: '明るい間接光が確保できる置き場所がある',
    detail: '斑入り品種は緑部分が少ないため、より明るい光が必要。窓際のレースカーテン越しが理想。',
    weight: 'important',
    whyMatters: '光量不足が続くと斑入り品種は緑戻りが進みやすく、株自体も弱ります。',
  },
  {
    id: 'p3',
    category: 'prep',
    question: '冬の室温 10°C 以上を維持できる環境がある',
    detail: '高額な斑入り苗ほど、寒さで失うダメージが大きくなります。',
    weight: 'important',
    whyMatters: '低温障害は斑入り品種でも通常品種でも致命傷になります。',
  },
  {
    id: 'p4',
    category: 'prep',
    question: '湿度 50〜70% を保つ手段（加湿器・葉水）がある',
    detail: '斑の白い部分は組織が弱く、乾燥でダメージを受けやすい。',
    weight: 'recommended',
    whyMatters: '斑入り品種は通常品種より湿度ストレスに弱い傾向があります。',
  },
];
