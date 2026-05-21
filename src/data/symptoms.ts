export type Severity = 'low' | 'medium' | 'high';

export type Cause = {
  title: string;
  description: string;
  severity: Severity;
  quickAction: string;
  relatedSectionId: 'basics' | 'growing' | 'seasonal' | 'troubles' | 'selection' | 'safety';
  relatedAnchor?: string;
};

export type Symptom = {
  id: string;
  label: string;
  causes: Cause[];
};

export type SymptomCategory = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  symptoms: Symptom[];
};

export const symptomCategories: SymptomCategory[] = [
  {
    id: 'leaf',
    label: '葉',
    emoji: '🌿',
    description: '葉の色・形・ハリの異常',
    symptoms: [
      {
        id: 'yellowing',
        label: '葉が全体的に黄色くなる',
        causes: [
          {
            title: '水のやりすぎ・根腐れの初期',
            description: '鉢内が常に湿った状態で、根が酸素不足を起こしている可能性。最も多い原因。',
            severity: 'high',
            quickAction: '水やりを完全停止し、土を完全に乾燥させる。サーキュレーターで通気を確保。',
            relatedSectionId: 'troubles',
          },
          {
            title: '自然な下葉の老化',
            description: '株の最も下の葉が時間経過で黄変するのは生理的に正常な範囲のことも。',
            severity: 'low',
            quickAction: '他の葉が健康なら経過観察で問題なし。気になる古い葉は剪定可能。',
            relatedSectionId: 'seasonal',
          },
          {
            title: '肥料過多・塩類集積',
            description: '与えすぎた肥料が土壌に蓄積し、根が水分を吸えなくなっている可能性。',
            severity: 'medium',
            quickAction: '施肥を中止し、たっぷりの水で鉢底から流して塩類を流す。',
            relatedSectionId: 'growing',
          },
        ],
      },
      {
        id: 'brown-tips',
        label: '葉先や周縁が茶色く枯れ込む',
        causes: [
          {
            title: '空気の乾燥',
            description: '特に冬の暖房期、湿度が極端に下がると葉先から枯れ込む典型的なサイン。',
            severity: 'medium',
            quickAction: '加湿器や葉水で湿度 50〜70% を維持する。',
            relatedSectionId: 'growing',
          },
          {
            title: '肥料過多による塩類過剰',
            description: '土壌の塩類濃度が高くなり、根の水分吸収が阻害されている。',
            severity: 'medium',
            quickAction: '施肥を停止し、用土の更新も検討する。',
            relatedSectionId: 'growing',
          },
          {
            title: '水切れ',
            description: '長期間の水不足で葉先から乾燥が進んでいる。',
            severity: 'medium',
            quickAction: '土の乾き具合を確認し、必要なら鉢底から流れるまでたっぷり給水。',
            relatedSectionId: 'growing',
          },
        ],
      },
      {
        id: 'sunburn',
        label: '葉の表面に褐色〜黒の斑点・薄い茶色',
        causes: [
          {
            title: '葉焼け（強い直射日光）',
            description: '直射日光や急激な光量変化で組織が損傷した状態。一度焼けた部分は回復しない。',
            severity: 'medium',
            quickAction: 'レースカーテン越しの明るい日陰へ移動。焼けた葉は気になるなら剪定。',
            relatedSectionId: 'troubles',
          },
        ],
      },
      {
        id: 'small-new-leaves',
        label: '新葉だけが小さく弱々しい',
        causes: [
          {
            title: '日照不足',
            description: '光が不足していて、株が十分なエネルギーを得られていない。',
            severity: 'medium',
            quickAction: 'より明るい窓際へ移動するか、植物育成 LED を併用する。',
            relatedSectionId: 'growing',
          },
          {
            title: '根詰まり',
            description: '2 年以上植え替えていない場合、鉢内で根が回りきって新しい成長を支えられない。',
            severity: 'medium',
            quickAction: '鉢から抜いて根を確認し、必要なら 1 サイズ大きい鉢へ植え替え。',
            relatedSectionId: 'seasonal',
          },
        ],
      },
      {
        id: 'no-splits',
        label: '成熟株なのに新葉に切れ込みが入らない',
        causes: [
          {
            title: '省エネモード（環境ストレスのサイン）',
            description: '株がエネルギーを節約する状態に入っており、切れ込みを作る余裕がない。複数の原因が重なっていることが多い。',
            severity: 'medium',
            quickAction: '日照・根詰まり・温度ストレス・水分ストレスを総合的に見直す。',
            relatedSectionId: 'troubles',
          },
          {
            title: '株がまだ成熟していない',
            description: '幼い株では生理的に切れ込みのない丸い葉のみが出る。',
            severity: 'low',
            quickAction: '適切な管理を続けて、十分に成長するのを待つ。',
            relatedSectionId: 'basics',
          },
        ],
      },
      {
        id: 'pests-mites',
        label: '葉裏に微小な赤茶〜白の点・葉全体がカスリ状',
        causes: [
          {
            title: 'ハダニ',
            description: '乾燥した環境を好む害虫。冬の暖房期に発生しやすく、放置すると葉全体が色抜けする。',
            severity: 'medium',
            quickAction: '葉水で湿度を上げる予防と、発生時は葉裏を水で洗い流す。広範囲なら殺虫剤。',
            relatedSectionId: 'troubles',
          },
        ],
      },
      {
        id: 'pests-scale',
        label: '葉や茎に白い綿状のかたまり・茶色いカサブタ状',
        causes: [
          {
            title: 'カイガラムシ',
            description: '茎や葉に固着する害虫。ベタつく排泄物がすす状の汚れの原因にもなる。',
            severity: 'medium',
            quickAction: '歯ブラシや綿棒で物理的にこすり落とす。広範囲なら市販の殺虫剤を使用。',
            relatedSectionId: 'troubles',
          },
        ],
      },
      {
        id: 'leaf-firmness',
        label: '葉のハリ・光沢が落ちて頼りない柔らかさ',
        causes: [
          {
            title: '根腐れの初期サイン',
            description: '根が酸素不足で機能低下を起こしている可能性。3〜5日で乾く土が 1 週間以上湿っていれば要警戒。',
            severity: 'high',
            quickAction: '水やりを停止して土を完全に乾かす。サーキュレーターで通気。',
            relatedSectionId: 'troubles',
          },
          {
            title: '水切れ',
            description: '反対に水が不足してハリを失っている可能性も。土が完全に乾ききっていれば。',
            severity: 'low',
            quickAction: '土の状態を確認し、乾いていれば鉢底から流れるまでたっぷり給水。',
            relatedSectionId: 'growing',
          },
        ],
      },
    ],
  },
  {
    id: 'stem',
    label: '茎・幹',
    emoji: '🪵',
    description: '主茎の変色・軟化・倒伏',
    symptoms: [
      {
        id: 'soft-base',
        label: '地際の主茎が黒〜黒褐色でブヨブヨ',
        causes: [
          {
            title: '根腐れの末期（軟腐病）',
            description: '腐敗が地際まで及んでいる深刻な状態。通常の植え替えでは救えない段階。',
            severity: 'high',
            quickAction: '上部の健全な緑色部位（節と気根含む 10〜15cm）を切り出し、水挿しでクローン救出を試みる。',
            relatedSectionId: 'troubles',
          },
        ],
      },
      {
        id: 'wrinkled-stem',
        label: '茎にしわが寄っている',
        causes: [
          {
            title: '根の機能不全（根腐れ進行）',
            description: '根が水を吸えず、茎が水分を失ってしわが寄っている。',
            severity: 'high',
            quickAction: '株を抜いて根の状態を確認。腐敗根は除去し、無菌用土で植え替え。',
            relatedSectionId: 'troubles',
          },
          {
            title: '長期の水切れ',
            description: '土が完全に乾ききった状態が長く続いた可能性。',
            severity: 'medium',
            quickAction: '土を確認し、完全に乾いていればたっぷり給水して様子見。',
            relatedSectionId: 'growing',
          },
        ],
      },
      {
        id: 'falling-over',
        label: '自重を支えられず倒れる',
        causes: [
          {
            title: '根腐れによる固定力低下',
            description: '根が機能していないため、株が土に固定されていない。',
            severity: 'high',
            quickAction: '根の状態を確認し、必要なら緊急切除＋植え替え、または上部のクローン救出。',
            relatedSectionId: 'troubles',
          },
          {
            title: '支柱の不足',
            description: '健康な株でも葉が大きく重くなると自立しにくい。',
            severity: 'low',
            quickAction: 'ヘゴ棒・水苔ポール等の支柱を設置して誘引する。',
            relatedSectionId: 'seasonal',
          },
        ],
      },
    ],
  },
  {
    id: 'root',
    label: '根・鉢の中',
    emoji: '🪴',
    description: '根の異変・鉢内の状態',
    symptoms: [
      {
        id: 'bad-smell',
        label: '鉢底や土からドブ臭・腐敗臭',
        causes: [
          {
            title: '根腐れの進行',
            description: '嫌気性菌が増殖して根を分解している深刻なサイン。',
            severity: 'high',
            quickAction: '株を抜いて根を確認。腐敗根を除去し、清潔な無菌用土に植え替え。',
            relatedSectionId: 'troubles',
          },
        ],
      },
      {
        id: 'black-roots',
        label: '根が黒くブヨブヨ・引っ張ると抜ける',
        causes: [
          {
            title: '根腐れの中度〜重度',
            description: '腐敗が広範囲に及んでいる状態。早急な対処が必要。',
            severity: 'high',
            quickAction: '腐敗根をすべて除去し、白く硬い健康な根だけを残して植え替え。',
            relatedSectionId: 'troubles',
          },
        ],
      },
      {
        id: 'root-bound',
        label: '鉢底から大量に根が飛び出している',
        causes: [
          {
            title: '根詰まり',
            description: '鉢が小さくなりすぎている状態。生育が鈍り、新葉も小型化する。',
            severity: 'medium',
            quickAction: '成長期（春〜初夏）に 1 サイズ大きい鉢へ植え替え。',
            relatedSectionId: 'seasonal',
          },
        ],
      },
      {
        id: 'fungus-gnats',
        label: '土の表面に小さな黒い虫（コバエ）が飛んでいる',
        causes: [
          {
            title: 'キノコバエ（コバエ）',
            description: '用土が常に湿っているのが主因。幼虫は根を食害することも。',
            severity: 'medium',
            quickAction: '水やり間隔を空けて土を乾燥気味に、表土を赤玉土や軽石で覆って卵が産み付けられない環境に。',
            relatedSectionId: 'troubles',
          },
        ],
      },
    ],
  },
  {
    id: 'whole',
    label: '全体',
    emoji: '🌱',
    description: '株全体に関する症状',
    symptoms: [
      {
        id: 'no-growth',
        label: '成長期なのに新芽が出ない・止まる',
        causes: [
          {
            title: '根腐れの初期サイン',
            description: '根が機能低下し、新しい成長を支えられない状態の可能性。',
            severity: 'high',
            quickAction: '水やり頻度と土の乾き具合を確認し、過湿なら停止して乾燥療法。',
            relatedSectionId: 'troubles',
          },
          {
            title: '日照不足',
            description: '光合成エネルギーが足りず、新葉を展開する余力がない。',
            severity: 'medium',
            quickAction: 'より明るい場所へ移動するか、植物育成 LED を併用。',
            relatedSectionId: 'growing',
          },
          {
            title: '冬の休眠',
            description: '冬は生育が緩慢になるのが正常。',
            severity: 'low',
            quickAction: '水やりを控えめにして、施肥は完全停止。春を待つ。',
            relatedSectionId: 'seasonal',
          },
        ],
      },
      {
        id: 'soil-stays-wet',
        label: '土が長期間（1週間以上）湿ったまま',
        causes: [
          {
            title: '排水不良・根の吸水機能低下',
            description: '用土の劣化、または根腐れで根が水を吸えなくなっている。',
            severity: 'high',
            quickAction: '水やりを停止して通気を確保。改善しなければ用土・根の状態を確認。',
            relatedSectionId: 'troubles',
          },
          {
            title: '鉢が大きすぎる',
            description: '株のサイズに対して鉢と土の量が多すぎると、土が乾きにくくなる。',
            severity: 'medium',
            quickAction: '次回植え替え時に株のサイズに合った鉢へ。鉢サイズアップは 1 段階まで。',
            relatedSectionId: 'seasonal',
          },
        ],
      },
    ],
  },
];
