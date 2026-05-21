export type MonthlyPoint = {
  label: string;
  detail: string;
  relatedSectionId?: 'basics' | 'growing' | 'seasonal' | 'troubles' | 'selection' | 'safety';
};

export type MonthlyTip = {
  month: number;
  season: string;
  emoji: string;
  headline: string;
  points: MonthlyPoint[];
};

export const monthlyTips: MonthlyTip[] = [
  {
    month: 1,
    season: '真冬',
    emoji: '❄️',
    headline: '休眠期：温度キープが最優先',
    points: [
      { label: '室温 10°C 以上を維持', detail: '夜間の窓辺は冷気が滞留するため、部屋の中央寄りへ移動。最低でも 5°C を下回らないように。', relatedSectionId: 'growing' },
      { label: '水やりは控えめに', detail: '土が完全に乾いてから数日待ち、温かい午前中に少量だけ。', relatedSectionId: 'growing' },
      { label: '施肥は完全停止', detail: '休眠中の施肥は根を傷める原因。春までお休み。', relatedSectionId: 'seasonal' },
      { label: '湿度は葉水と加湿器で', detail: '暖房で乾きやすいため、葉水で 50〜70% を目標に。', relatedSectionId: 'growing' },
    ],
  },
  {
    month: 2,
    season: '真冬',
    emoji: '❄️',
    headline: '寒さのピーク：耐えしのぐ時期',
    points: [
      { label: '低温障害に注意', detail: '葉が黒ずむ・地際が黒くなる症状は寒さで根が傷んだサイン。即暖かい場所へ。', relatedSectionId: 'troubles' },
      { label: '水やりは月数回程度', detail: '土の中までしっかり乾いてから少量だけ。', relatedSectionId: 'growing' },
      { label: 'ハダニ予防の葉水', detail: '暖房で乾燥した室内はハダニが発生しやすい。葉裏にも霧吹き。', relatedSectionId: 'troubles' },
    ],
  },
  {
    month: 3,
    season: '早春',
    emoji: '🌱',
    headline: '成長期への助走：まだ施肥は早い',
    points: [
      { label: '最低気温 15°C を超えてから本格管理', detail: '寒の戻りに注意。施肥開始や植え替えはもう少し待つ。', relatedSectionId: 'seasonal' },
      { label: '水やりを徐々に通常モードへ', detail: '気温上昇に合わせて少しずつ頻度を上げる。', relatedSectionId: 'growing' },
      { label: '植え替えの準備', detail: '4〜6 月の植え替え期に向けて、用土と新しい鉢を準備しておくとスムーズ。', relatedSectionId: 'seasonal' },
    ],
  },
  {
    month: 4,
    season: '春',
    emoji: '🌸',
    headline: '成長期スタート：植え替え最適期',
    points: [
      { label: '植え替え・鉢増しの好機', detail: '1〜2 年に 1 回が目安。現在の鉢から 1 サイズ大きい鉢へ。', relatedSectionId: 'seasonal' },
      { label: '施肥再開', detail: '2 ヶ月に 1 回の緩効性肥料、または薄めた液肥を月 1〜2 回。', relatedSectionId: 'growing' },
      { label: '剪定の好機', detail: '伸びすぎた茎は節の 1cm 上でカット。カット穂木は増殖にも使える。', relatedSectionId: 'seasonal' },
      { label: '新葉が動き始めたか観察', detail: '芽鞘が伸びていれば成長サイクルに入った証拠。', relatedSectionId: 'basics' },
    ],
  },
  {
    month: 5,
    season: '春',
    emoji: '🌿',
    headline: '本格的な成長期：観察が楽しい時期',
    points: [
      { label: '新葉の切れ込みをチェック', detail: '成熟株なのに丸い葉が続けば、光量や根の状態を見直すサイン。', relatedSectionId: 'troubles' },
      { label: '挿し木・水挿しの好機', detail: '気温 20〜25°C は発根の最適環境。剪定した茎を活用。', relatedSectionId: 'seasonal' },
      { label: '葉水と通気を確保', detail: '湿度を保ちつつサーキュレーターで空気を循環、害虫予防にも。', relatedSectionId: 'growing' },
    ],
  },
  {
    month: 6,
    season: '梅雨',
    emoji: '☔',
    headline: '梅雨：過湿に要注意',
    points: [
      { label: '過湿による根腐れに警戒', detail: '土が長く湿った状態が続く場合は水やりを控えめに。鉢底の風通しを確保。', relatedSectionId: 'troubles' },
      { label: 'カビ・コバエ対策', detail: '表土が常に濡れていると発生しやすい。乾湿のメリハリをつける。', relatedSectionId: 'troubles' },
      { label: '剪定・繁殖の継続好機', detail: '気温・湿度ともに発根に最適。', relatedSectionId: 'seasonal' },
    ],
  },
  {
    month: 7,
    season: '盛夏',
    emoji: '☀️',
    headline: '高温期：遮光と水切れの両立',
    points: [
      { label: '直射日光を避ける', detail: '屋外では 30〜50% 遮光。室内も真夏の窓辺は要注意。', relatedSectionId: 'growing' },
      { label: '水やりは朝か夕方の涼しい時間に', detail: '日中の熱い土に水を与えると根を傷めることがある。', relatedSectionId: 'growing' },
      { label: 'エアコン送風直撃を避ける', detail: '葉先の枯れ込みやハダニ発生の原因に。', relatedSectionId: 'troubles' },
    ],
  },
  {
    month: 8,
    season: '猛暑',
    emoji: '🥵',
    headline: '猛暑のピーク：株を弱らせない',
    points: [
      { label: '弱っているなら施肥を一時停止', detail: '高温で生理活動が落ちている株への施肥は逆効果。', relatedSectionId: 'growing' },
      { label: '葉水で温度も下げる', detail: '朝夕の葉水は湿度確保＋葉温の冷却にもなる。', relatedSectionId: 'growing' },
      { label: 'ハダニチェックを強化', detail: '高温乾燥で発生しやすい。葉裏を週 1 回観察。', relatedSectionId: 'troubles' },
    ],
  },
  {
    month: 9,
    season: '初秋',
    emoji: '🍃',
    headline: '成長後半：屋外株は室内取り込み準備',
    points: [
      { label: '気温低下に合わせて水やり頻度を下げる', detail: '徐々に乾燥気味に慣らしていく（ハードニング）。', relatedSectionId: 'seasonal' },
      { label: '屋外管理株は明るい室内へ', detail: '最低気温 15°C を切る前に取り込む。', relatedSectionId: 'seasonal' },
      { label: '剪定・植え替えの最終チャンス', detail: '10 月以降は株の負担になるため、必要なら今のうちに。', relatedSectionId: 'seasonal' },
    ],
  },
  {
    month: 10,
    season: '秋',
    emoji: '🍂',
    headline: '休眠準備：施肥は終了へ',
    points: [
      { label: '追肥を完全に終了', detail: '気温が下がる時期の施肥は根傷みの原因。置き肥は回収。', relatedSectionId: 'seasonal' },
      { label: '室内の明るい場所へ配置', detail: '日照時間が短くなる時期。窓際の光を確保。', relatedSectionId: 'growing' },
      { label: 'ハダニ予防の葉水を継続', detail: '暖房を入れ始める前から湿度維持を意識。', relatedSectionId: 'troubles' },
    ],
  },
  {
    month: 11,
    season: '晩秋',
    emoji: '🌬️',
    headline: '休眠期入り：水やりを絞り始める',
    points: [
      { label: '土が完全に乾いてから水やり', detail: '頻度を 2〜3 週に 1 回程度に。温かい午前中に少量。', relatedSectionId: 'growing' },
      { label: '夜間の冷え対策', detail: '窓辺の冷気が滞る場所から離す。最低 10°C を維持。', relatedSectionId: 'growing' },
      { label: '加湿器の準備', detail: '暖房開始で湿度が急降下。50〜70% を目標に。', relatedSectionId: 'growing' },
    ],
  },
  {
    month: 12,
    season: '初冬',
    emoji: '❄️',
    headline: '休眠期：管理を最小限に',
    points: [
      { label: '施肥は完全停止', detail: '春まで肥料は不要。', relatedSectionId: 'seasonal' },
      { label: '水やりは月 1〜2 回', detail: '完全に乾いてから数日後に温かい午前中に少量。', relatedSectionId: 'growing' },
      { label: '室温 10°C 以上を維持', detail: '夜間の窓辺は冷気が滞留するため部屋の中央寄りへ。', relatedSectionId: 'growing' },
      { label: '葉水で湿度を確保', detail: '暖房で乾燥が進むため、加湿器との併用が理想。', relatedSectionId: 'growing' },
    ],
  },
];

export function getCurrentMonthTip(): MonthlyTip {
  const month = new Date().getMonth() + 1;
  return monthlyTips.find((t) => t.month === month) ?? monthlyTips[0];
}
