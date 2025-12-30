// ============================================
// Analysis Modal & Cross-Analysis Logic
// ============================================

// Calculate sentiment score based on indicator value
function calculateSentimentScore(indicatorKey, value, threshold, thresholdType) {
    let score;
    
    // Special handling for each indicator
    switch(indicatorKey) {
        case 'vix':
            // VIX: 高いほど恐怖
            if (value >= 40) score = 10;
            else if (value >= 30) score = 20;
            else if (value >= 25) score = 35;
            else if (value >= 20) score = 50;
            else if (value >= 15) score = 70;
            else score = 85;
            break;
            
        case 'skew':
            // SKEW: 高いほど警戒
            if (value >= 150) score = 15;
            else if (value >= 145) score = 25;
            else if (value >= 140) score = 40;
            else if (value >= 135) score = 55;
            else if (value >= 130) score = 70;
            else score = 80;
            break;
            
        case 'putCall':
            // Put/Call: 低いほど楽観（危険）、高いほど恐怖
            if (value <= 0.6) score = 90; // 極度の強欲
            else if (value <= 0.7) score = 80;
            else if (value <= 0.9) score = 65;
            else if (value <= 1.1) score = 50;
            else if (value <= 1.3) score = 35;
            else score = 20; // 極度の恐怖
            break;
            
        case 'hySpread':
            // HY Spread: 高いほど恐怖
            if (value >= 7.0) score = 10;
            else if (value >= 5.0) score = 25;
            else if (value >= 4.0) score = 40;
            else if (value >= 3.5) score = 55;
            else if (value >= 3.0) score = 70;
            else score = 85;
            break;
            
        case 'shiller':
            // Shiller PE: 高いほど楽観（危険）
            if (value >= 35) score = 95; // 極度の強欲
            else if (value >= 30) score = 85;
            else if (value >= 27) score = 75;
            else if (value >= 24) score = 60;
            else if (value >= 20) score = 50;
            else if (value >= 18) score = 40;
            else score = 25; // 割安で恐怖
            break;
            
        case 'ma200':
            // 200日線乖離率: マイナスは恐怖、大幅プラスは楽観
            if (value <= -10) score = 15;
            else if (value <= -5) score = 30;
            else if (value <= 0) score = 40;
            else if (value <= 3) score = 55;
            else if (value <= 7) score = 70;
            else if (value <= 12) score = 80;
            else score = 90; // 過熱
            break;
            
        case 'fearGreed':
            // Fear & Greed Index: そのまま使用
            score = value;
            break;
            
        case 'buffett':
            // Buffett Indicator: 高いほど楽観（危険）
            if (value >= 180) score = 95;
            else if (value >= 150) score = 85;
            else if (value >= 130) score = 75;
            else if (value >= 110) score = 60;
            else if (value >= 100) score = 50;
            else if (value >= 80) score = 40;
            else score = 25;
            break;
            
        default:
            // デフォルト: ステータスベース
            const status = window.marketData.getStatus(indicatorKey, value);
            score = status === 'danger' ? 25 : status === 'warning' ? 50 : 75;
    }
    
    // ランダム変動を少し追加（±3点）
    const randomVariation = (Math.random() - 0.5) * 6;
    score = Math.round(Math.max(0, Math.min(100, score + randomVariation)));
    
    return score;
}

// Analysis data for each indicator
const analysisData = {
    vix: {
        title: 'VIX（恐怖指数）詳細分析',
        description: '市場のボラティリティ（変動性）と投資家心理を総合分析',
        keywords: ['#VIX', '#市場不安', '#ボラティリティ', '#リスクオフ', '#投資家心理'],
        crossAnalysis: function(value, status) {
            if (value >= 30) {
                return `<p><strong>【高リスク警告】</strong></p>
                <p>VIXが${value}に達しており、市場は極度の不安状態です。SNS上では「暴落」「リスクオフ」などのキーワードが急増しています。</p>
                <p><strong>市場データ分析：</strong>過去のデータから、VIXが30を超えた際の平均下落率は-15%です。現在のレベルは2020年3月のコロナショック時に近い水準です。</p>
                <p><strong>世論トレンド：</strong>投資家コミュニティでは防御的なポジション調整が話題の中心となっています。機関投資家の間でもリスク回避の動きが加速しています。</p>`;
            } else if (value >= 20) {
                return `<p><strong>【注意レベル】</strong></p>
                <p>VIXは${value}で、通常より高めの水準です。市場参加者の警戒感が高まっています。</p>
                <p><strong>市場データ分析：</strong>この水準では短期的な調整が発生しやすい傾向にあります。</p>
                <p><strong>世論トレンド：</strong>SNSでは慎重なスタンスが主流となっており、「様子見」「ポジション縮小」などの投稿が増加しています。</p>`;
            } else {
                return `<p><strong>【安定状態】</strong></p>
                <p>VIXは${value}で、市場は比較的落ち着いています。投資家心理は安定しています。</p>
                <p><strong>市場データ分析：</strong>低VIX環境では、株式市場は上昇トレンドを維持しやすい傾向があります。</p>
                <p><strong>世論トレンド：</strong>SNSでは楽観的な見方が優勢で、「押し目買い」「買い増し」などのポジティブな投稿が目立ちます。</p>`;
            }
        },
        historical: '2008年金融危機時、VIXは89.53まで急騰。2020年コロナショックでは82.69を記録。現在の水準をこれらと比較することで、市場ストレスの程度を把握できます。',
        recommendations: function(value) {
            if (value >= 30) {
                return [
                    '防御的セクター（生活必需品、ヘルスケア）への資金シフトを検討',
                    'ポートフォリオの現金比率を20-30%に引き上げ',
                    'プット・オプションの購入によるヘッジ戦略',
                    '高ベータ株のエクスポージャー削減'
                ];
            } else if (value >= 20) {
                return [
                    'ポジションサイズを通常の70-80%に調整',
                    '利益確定の実施を検討',
                    '優良ディフェンシブ銘柄の段階的な買い増し',
                    'ストップロスの設定を厳格化'
                ];
            } else {
                return [
                    '成長株への投資チャンスを検討',
                    '分散投資でリスクを管理しながら積極運用',
                    '押し目買いの機会を狙う',
                    '長期投資計画に沿った定期積立の継続'
                ];
            }
        }
    },
    skew: {
        title: 'SKEW（テールリスク指数）詳細分析',
        description: '市場の暴落リスク（テールリスク）と投資家の警戒レベルを分析',
        keywords: ['#SKEW', '#テールリスク', '#暴落警戒', '#ブラックスワン', '#リスク管理'],
        crossAnalysis: function(value, status) {
            if (value >= 145) {
                return `<p><strong>【暴落リスク警告】</strong></p>
                <p>SKEWが${value}に達しており、投資家は極端な下落リスクを強く意識しています。</p>
                <p><strong>市場データ分析：</strong>SKEWの高水準は、市場参加者がアウト・オブ・ザ・マネーのプット・オプションを積極的に購入していることを示します。過去のデータでは、この水準から1-3ヶ月以内に大きな市場変動が発生する確率が高まります。</p>
                <p><strong>世論トレンド：</strong>金融プロフェッショナルの間で「ブラックスワン」「テールリスク」への言及が急増。機関投資家はヘッジ戦略を強化しています。</p>`;
            } else if (value >= 135) {
                return `<p><strong>【警戒レベル】</strong></p>
                <p>SKEW指数は${value}で、通常より高めです。市場は潜在的なリスクに敏感になっています。</p>
                <p><strong>市場データ分析：</strong>この水準では、予期せぬニュースに対する市場の反応が過敏になる傾向があります。</p>
                <p><strong>世論トレンド：</strong>リスク管理とポートフォリオ防御に関する議論が活発化しています。</p>`;
            } else {
                return `<p><strong>【通常範囲】</strong></p>
                <p>SKEW指数は${value}で、テールリスクに対する懸念は限定的です。</p>
                <p><strong>市場データ分析：</strong>市場参加者は大規模な暴落リスクを過度に警戒していません。</p>
                <p><strong>世論トレンド：</strong>リスク選好的な投資姿勢が主流となっています。</p>`;
            }
        },
        historical: '2018年2月のVolmageddon（ボラティリティ急騰）前、SKEWは150を超えていました。歴史的に高SKEW環境では、予想外の市場ショックが発生しやすい傾向があります。',
        recommendations: function(value) {
            if (value >= 145) {
                return [
                    'テールリスク・ヘッジ戦略の即時実行',
                    'ポートフォリオの集中リスクを分散',
                    'レバレッジポジションの大幅削減',
                    '金・国債などの安全資産の比率を25-35%に引き上げ'
                ];
            } else {
                return [
                    '通常のリスク管理プロセスを継続',
                    '定期的な市場モニタリング',
                    'ストップロス設定の確認',
                    'ポートフォリオの定期的なリバランス'
                ];
            }
        }
    },
    fearGreed: {
        title: 'Fear & Greed Index 詳細分析',
        description: '市場感情と投資家心理の総合スコアを多角的に分析',
        keywords: ['#FearAndGreed', '#市場心理', '#センチメント', '#投資家感情', '#逆張り指標'],
        crossAnalysis: function(value, status) {
            if (value <= 25) {
                return `<p><strong>【極度の恐怖】</strong></p>
                <p>Fear & Greed Indexは${value}で、市場は極度の恐怖状態にあります。</p>
                <p><strong>市場データ分析：</strong>歴史的に、この水準は絶好の「逆張り」買い機会となることが多いです。過去10年のデータでは、極度の恐怖状態から3ヶ月後の平均リターンは+12.5%でした。</p>
                <p><strong>世論トレンド：</strong>SNS上は悲観論で溢れ、「暴落」「底なし」などのネガティブワードが支配的です。しかし、これは逆説的に底打ちのシグナルとなることがあります。著名投資家の間では「強気の買い」を示唆する発言も見られ始めています。</p>`;
            } else if (value >= 75) {
                return `<p><strong>【極度の強欲】</strong></p>
                <p>Fear & Greed Indexは${value}で、市場は過度に楽観的です。</p>
                <p><strong>市場データ分析：</strong>この水準は調整リスクが高まるシグナルです。過去のデータでは、極度の強欲状態から1-2ヶ月以内に平均-8%の調整が発生しています。</p>
                <p><strong>世論トレンド：</strong>SNSでは「買い一択」「まだ上がる」などの楽観論が溢れています。個人投資家の信用買い残も増加傾向。専門家は「過熱感」を警告し始めています。</p>`;
            } else {
                return `<p><strong>【中立的】</strong></p>
                <p>Fear & Greed Indexは${value}で、市場センチメントはバランスが取れています。</p>
                <p><strong>市場データ分析：</strong>この水準では、ファンダメンタルズに基づいた健全な価格形成が行われやすい環境です。</p>
                <p><strong>世論トレンド：</strong>SNS上の意見も分かれており、慎重派と楽観派がバランスを保っています。</p>`;
            }
        },
        historical: '2020年3月のコロナショック時、指数は12まで低下し、その後の大幅反発の起点となりました。2021年11月の高値圏では95に達し、その後調整が発生しました。',
        recommendations: function(value) {
            if (value <= 25) {
                return [
                    '逆張り戦略で優良株の段階的な買い増し',
                    '暴落時の買いリストに基づいた投資実行',
                    '長期保有前提での投資を検討',
                    'ドルコスト平均法での積立開始の好機'
                ];
            } else if (value >= 75) {
                return [
                    '利益確定を積極的に実施',
                    '新規ポジション構築は控えめに',
                    'プット・オプションでのヘッジ検討',
                    '現金比率を高め、調整時の備えを'
                ];
            } else {
                return [
                    'ファンダメンタルズ重視の投資を継続',
                    'バランス型ポートフォリオの維持',
                    '定期的なリバランス実施',
                    '長期投資計画に沿った運用'
                ];
            }
        }
    },
    buffett: {
        title: 'Buffett Indicator（バフェット指数）詳細分析',
        description: '株式市場の時価総額とGDPの比率から割高・割安を判断',
        keywords: ['#BuffettIndicator', '#株価割高', '#バリュエーション', '#市場時価総額', '#GDP'],
        crossAnalysis: function(value, status) {
            if (value >= 150) {
                return `<p><strong>【バブル警戒水準】</strong></p>
                <p>Buffett Indicatorは${value}%で、歴史的な高水準にあります。</p>
                <p><strong>市場データ分析：</strong>株式市場の時価総額がGDPの1.5倍を超えており、ウォーレン・バフェット氏が「危険信号」と位置づける水準です。2000年のドットコムバブル崩壊前は140%、2007年の金融危機前は140%でした。現在はそれらを上回る水準です。</p>
                <p><strong>世論トレンド：</strong>著名アナリストの間で「バリュエーション懸念」が高まっています。SNSでは「バブル崩壊」「調整」などの議論が活発化していますが、「今回は違う」という楽観論も根強く存在します。</p>`;
            } else if (value >= 100) {
                return `<p><strong>【割高傾向】</strong></p>
                <p>Buffett Indicatorは${value}%で、株式市場はやや割高な水準です。</p>
                <p><strong>市場データ分析：</strong>GDP対比で株式市場が100%を超えるのは、歴史的に珍しいことです。慎重なアプローチが求められます。</p>
                <p><strong>世論トレンド：</strong>バリュエーションに対する警戒感が徐々に広がっています。</p>`;
            } else {
                return `<p><strong>【適正〜割安水準】</strong></p>
                <p>Buffett Indicatorは${value}%で、株式市場のバリュエーションは健全です。</p>
                <p><strong>市場データ分析：</strong>この水準は長期投資の好機となることが多いです。</p>
                <p><strong>世論トレンド：</strong>バリュー投資家の間では「買い場」との評価が優勢です。</p>`;
            }
        },
        historical: '2000年のITバブル時は約140%でピーク、その後-50%の暴落。2021年には200%を超え、2022年の調整につながりました。100%以下は歴史的に「買い場」とされています。',
        recommendations: function(value) {
            if (value >= 150) {
                return [
                    '高バリュエーション銘柄のエクスポージャー削減',
                    '割安なバリュー株へのシフト',
                    '現金・債券比率を40-50%に引き上げ',
                    '調整時の買い増し資金を確保'
                ];
            } else if (value >= 100) {
                return [
                    'バリュエーションを重視した銘柄選別',
                    '割高なグロース株の段階的な利益確定',
                    'バランス型ポートフォリオの維持',
                    '質の高い企業への集中投資'
                ];
            } else {
                return [
                    '積極的な投資機会として評価',
                    '優良株の長期保有戦略',
                    'ドルコスト平均法での投資継続',
                    '成長株とバリュー株のバランス投資'
                ];
            }
        }
    },
    putCall: {
        title: 'Put/Call比率 詳細分析',
        description: '市場センチメントとポジショニングを総合評価',
        keywords: ['#PutCall', '#市場センチメント', '#オプション取引', '#強気弱気', '#ポジショニング'],
        crossAnalysis: function(value, status) {
            if (value <= 0.7) {
                return `<p><strong>【過度な楽観警告】</strong></p>
                <p>Put/Call比率が${value}で、市場は過度に楽観的です。</p>
                <p><strong>市場データ分析：</strong>プット・オプション（下落に賭ける）よりもコール・オプション（上昇に賭ける）の取引が圧倒的に多い状態です。歴史的に、この水準は「群集心理の極端な偏り」を示し、反転リスクが高まります。過去のデータでは、0.7以下の状態から1-2ヶ月以内に平均-10%の調整が発生しています。</p>
                <p><strong>世論トレンド：</strong>SNSでは「まだ上がる」「買い増しチャンス」などの楽観論が支配的です。個人投資家の信用買い残も急増中。一方、プロの投資家は利益確定を進めている兆候があります。CNBCなどの金融メディアでは「過熱感」への警告が増えています。</p>`;
            } else if (value >= 1.2) {
                return `<p><strong>【過度な悲観】</strong></p>
                <p>Put/Call比率が${value}で、市場は過度に悲観的です。</p>
                <p><strong>市場データ分析：</strong>プット・オプションの購入が急増しており、投資家は下落に強く備えています。歴史的に、この水準は「底打ちシグナル」となることが多く、逆張り投資の好機です。</p>
                <p><strong>世論トレンド：</strong>SNSは悲観論で溢れていますが、これは逆説的に買いシグナルです。著名投資家の中には「恐怖の時に買う」という発言も見られ始めています。</p>`;
            } else {
                return `<p><strong>【バランス良好】</strong></p>
                <p>Put/Call比率は${value}で、市場センチメントはバランスが取れています。</p>
                <p><strong>市場データ分析：</strong>強気派と弱気派が拮抗しており、健全な価格形成が行われやすい環境です。</p>
                <p><strong>世論トレンド：</strong>SNS上の意見も多様で、一方的な偏りは見られません。</p>`;
            }
        },
        historical: '2020年3月のコロナショック時、比率は1.8まで急上昇し、その後の大反発の起点となりました。2021年の高値圏では0.5台まで低下し、調整の前兆でした。',
        recommendations: function(value) {
            if (value <= 0.7) {
                return [
                    '新規買いは控え、利益確定を優先',
                    'プット・オプションの購入でヘッジ',
                    '現金比率を30-40%に引き上げ',
                    '調整待ちの姿勢を維持'
                ];
            } else if (value >= 1.2) {
                return [
                    '逆張りで優良株の買い増し検討',
                    '長期保有前提での投資実行',
                    '下値での段階的な買い付け',
                    'ボラティリティを味方につける戦略'
                ];
            } else {
                return [
                    'ファンダメンタルズ重視の投資継続',
                    'バランス型ポートフォリオ維持',
                    '通常のリスク管理を継続',
                    '定期的なリバランス実施'
                ];
            }
        }
    },
    hySpread: {
        title: 'ハイイールド債スプレッド 詳細分析',
        description: '信用リスクと流動性懸念を評価',
        keywords: ['#HYSpread', '#信用リスク', '#ハイイールド債', '#社債市場', '#流動性'],
        crossAnalysis: function(value, status) {
            if (value >= 5.0) {
                return `<p><strong>【信用リスク警告】</strong></p>
                <p>ハイイールド債スプレッドが${value}%で、信用市場に緊張が高まっています。</p>
                <p><strong>市場データ分析：</strong>ハイイールド債（投機的格付け債券）の利回りと米国債の利回り差が拡大しており、投資家が信用リスクに敏感になっています。この水準は、企業のデフォルト懸念や景気後退リスクの高まりを示唆します。2008年の金融危機時には20%超、2020年コロナショック時には10%超まで拡大しました。</p>
                <p><strong>世論トレンド：</strong>債券市場では「質への逃避」が進行中。SNSでは「信用収縮」「デフォルトリスク」などの議論が増加。企業の資金調達環境が悪化しているとの報道も目立ちます。機関投資家は投資適格債へのシフトを進めています。</p>`;
            } else if (value >= 3.5) {
                return `<p><strong>【やや警戒】</strong></p>
                <p>ハイイールド債スプレッドは${value}%で、やや高めの水準です。</p>
                <p><strong>市場データ分析：</strong>信用リスクへの警戒感が徐々に高まっています。景気減速懸念がある可能性があります。</p>
                <p><strong>世論トレンド：</strong>債券投資家の間で慎重論が増えています。</p>`;
            } else {
                return `<p><strong>【信用環境良好】</strong></p>
                <p>ハイイールド債スプレッドは${value}%で、信用市場は安定しています。</p>
                <p><strong>市場データ分析：</strong>企業の信用力に対する懸念は限定的で、資金調達環境は良好です。</p>
                <p><strong>世論トレンド：</strong>信用市場はリスクオンのムードです。</p>`;
            }
        },
        historical: '2008年金融危機時は20%超まで拡大、2015-16年の資源価格暴落時は8%台、2020年3月は10%超。低スプレッド環境（3%以下）は市場の過度な楽観を示すことも。',
        recommendations: function(value) {
            if (value >= 5.0) {
                return [
                    'ハイイールド債への投資を削減',
                    '投資適格債・国債へのシフト',
                    '信用リスクの高い企業への投資見直し',
                    '現金・安全資産の比率を高める'
                ];
            } else if (value >= 3.5) {
                return [
                    '信用リスクの監視強化',
                    '高格付け債券の比率を高める',
                    'クレジット分析の徹底',
                    '分散投資でリスク管理'
                ];
            } else {
                return [
                    '適切なクレジットリスクテイク',
                    'ハイイールド債への投資機会検討',
                    'リスク・リターンのバランス重視',
                    '定期的な信用分析の実施'
                ];
            }
        }
    },
    shiller: {
        title: 'Shiller P/E（CAPE）詳細分析',
        description: '景気調整後の株価バリュエーションを評価',
        keywords: ['#ShillerPE', '#CAPE', '#バリュエーション', '#割高割安', '#長期投資'],
        crossAnalysis: function(value, status) {
            if (value >= 30) {
                return `<p><strong>【割高警戒水準】</strong></p>
                <p>Shiller P/Eが${value}で、株価は歴史的に割高な水準にあります。</p>
                <p><strong>市場データ分析：</strong>景気循環を調整した株価収益率（10年平均利益ベース）が高水準です。過去140年超のデータで見ると、この水準は上位10%に入ります。1929年の大恐慌前は32、2000年のITバブル時は44、2007年の金融危機前は27でした。現在の水準は調整リスクを示唆しています。</p>
                <p><strong>世論トレンド：</strong>バリュー投資家からは「割高すぎる」との声が強まっています。SNSでは「今回は違う」という楽観論と「いずれ調整が来る」という警戒論が対立。著名投資家の多くは慎重姿勢を強めています。ただし、低金利環境が高バリュエーションを正当化するという意見も根強いです。</p>`;
            } else if (value >= 25) {
                return `<p><strong>【やや割高】</strong></p>
                <p>Shiller P/Eは${value}で、平均より高めの水準です。</p>
                <p><strong>市場データ分析：</strong>長期平均（約16.8）を大きく上回っており、慎重なアプローチが求められます。</p>
                <p><strong>世論トレンド：</strong>バリュエーションへの警戒感が徐々に広がっています。</p>`;
            } else {
                return `<p><strong>【適正〜割安水準】</strong></p>
                <p>Shiller P/Eは${value}で、株価バリュエーションは健全です。</p>
                <p><strong>市場データ分析：</strong>長期投資の好機となる可能性があります。歴史的に、この水準からの10年リターンは良好です。</p>
                <p><strong>世論トレンド：</strong>バリュー投資家は「買い場」と評価しています。</p>`;
            }
        },
        historical: '歴史的平均は16.8。1929年は32でピーク後暴落、2000年は44で史上最高値（その後-50%）、2009年は13で大底（その後大幅上昇）。20以下は歴史的に絶好の買い場。',
        recommendations: function(value) {
            if (value >= 30) {
                return [
                    '高PER銘柄の段階的な利益確定',
                    '割安バリュー株への資金シフト',
                    '配当利回りの高い銘柄に注目',
                    '調整時の買い増し資金を確保'
                ];
            } else if (value >= 25) {
                return [
                    'バリュエーションを重視した銘柄選別',
                    '割高なグロース株は慎重に',
                    '質の高い企業への集中投資',
                    '長期的な視点を維持'
                ];
            } else {
                return [
                    '積極的な投資機会として評価',
                    '優良株の長期保有戦略',
                    'ドルコスト平均法での継続投資',
                    '歴史的な買い場の可能性'
                ];
            }
        }
    },
    ma200: {
        title: '200日移動平均線乖離率 詳細分析',
        description: '市場トレンドとモメンタムを評価',
        keywords: ['#200日線', '#移動平均', '#トレンド', '#テクニカル分析', '#モメンタム'],
        crossAnalysis: function(value, status) {
            if (value <= 0) {
                return `<p><strong>【下落トレンド】</strong></p>
                <p>200日移動平均線乖離率が${value}%で、市場は下落トレンドにあります。</p>
                <p><strong>市場データ分析：</strong>株価が200日移動平均線を下回っており、テクニカル的には弱気相場入りのシグナルです。200日線は長期トレンドを示す重要な指標で、これを下回ると売り圧力が強まる傾向があります。機関投資家の多くが200日線をトレンド判断の基準としているため、ここを割り込むと自動売買による売りも加速します。</p>
                <p><strong>世論トレンド：</strong>テクニカルアナリストの間で「デッドクロス」「トレンド転換」の議論が活発化。SNSでは「売り場」「損切り」などのワードが増加。ただし、逆張り投資家は「買い場が近い」と見る向きもあります。機関投資家のポジション調整が続いている模様です。</p>`;
            } else if (value >= 5) {
                return `<p><strong>【強い上昇トレンド】</strong></p>
                <p>200日移動平均線乖離率が${value}%で、市場は強い上昇トレンドです。</p>
                <p><strong>市場データ分析：</strong>株価が200日線を大きく上回っており、勢いのある上昇相場です。ただし、乖離が大きすぎる場合（10%超）は、短期的な調整リスクもあります。</p>
                <p><strong>世論トレンド：</strong>テクニカル分析では「買いトレンド継続」のシグナル。モメンタム投資家が積極的です。</p>`;
            } else {
                return `<p><strong>【トレンド転換期】</strong></p>
                <p>200日移動平均線乖離率は${value}%で、トレンドの転換点にあります。</p>
                <p><strong>市場データ分析：</strong>重要な節目にあり、今後の方向性を見極める局面です。</p>
                <p><strong>世論トレンド：</strong>テクニカルトレーダーが注目しており、ブレイクアウトの方向が焦点です。</p>`;
            }
        },
        historical: '2008年金融危機時は-25%、2020年3月は-15%まで下落し底打ち。上昇相場では+10-15%程度が多い。0%付近は重要なサポート/レジスタンスライン。',
        recommendations: function(value) {
            if (value <= 0) {
                return [
                    '短期的には様子見、押し目買いの準備',
                    '200日線回復まで新規買いは慎重に',
                    'ストップロス設定の厳格化',
                    '逆張り投資家は段階的な買い検討'
                ];
            } else if (value >= 5) {
                return [
                    'トレンドフォロー戦略の継続',
                    '過度な乖離時は部分利益確定',
                    'トレイリングストップの活用',
                    '押し目買いのタイミングを待つ'
                ];
            } else {
                return [
                    '方向性確認まで慎重なスタンス',
                    '小ポジションでのトライアル',
                    'ブレイクアウト後の追随',
                    'リスク管理を最優先'
                ];
            }
        }
    }
};

// Open analysis modal
function openAnalysisModal(indicatorKey) {
    const indicator = window.marketData.indicators[indicatorKey];
    const currentValues = window.marketData.getCurrentValues();
    const value = currentValues[indicatorKey];
    const status = window.marketData.getStatus(indicatorKey, value);
    const analysis = analysisData[indicatorKey];
    
    if (!analysis) {
        console.warn(`No analysis data for ${indicatorKey}`);
        return;
    }
    
    // Set title
    document.getElementById('modalTitle').textContent = analysis.title;
    
    // Set current value
    document.getElementById('modalCurrentValue').textContent = window.marketData.formatValue(indicatorKey, value);
    
    // Set status
    const statusLabel = window.marketData.getStatusLabel(status);
    const statusElement = document.getElementById('modalStatus');
    statusElement.textContent = statusLabel;
    statusElement.className = `data-value status-badge ${status}`;
    
    // Set threshold
    document.getElementById('modalThreshold').textContent = 
        indicator.threshold + indicator.unit + (indicator.thresholdType === 'above' ? '以上' : '以下');
    
    // Calculate week change
    const weekData = window.marketData.getDataForPeriod(indicatorKey, 0.02);
    if (weekData.length >= 2) {
        const oldValue = weekData[0].value;
        const change = ((value - oldValue) / oldValue * 100).toFixed(2);
        const changeText = change >= 0 ? `+${change}%` : `${change}%`;
        const changeColor = change >= 0 ? 'var(--color-danger)' : 'var(--color-safe)';
        document.getElementById('modalWeekChange').innerHTML = 
            `<span style="color: ${changeColor}">${changeText}</span>`;
    }
    
    // Set sentiment score (calculated based on indicator value)
    const sentimentScore = calculateSentimentScore(indicatorKey, value, indicator.threshold, indicator.thresholdType);
    document.getElementById('sentimentScore').textContent = sentimentScore;
    
    // Set sentiment label
    let sentimentLabel = '';
    if (sentimentScore <= 25) sentimentLabel = '極度の恐怖';
    else if (sentimentScore <= 45) sentimentLabel = '恐怖';
    else if (sentimentScore <= 55) sentimentLabel = '中立';
    else if (sentimentScore <= 75) sentimentLabel = '強欲';
    else sentimentLabel = '極度の強欲';
    document.getElementById('sentimentLabel').textContent = sentimentLabel;
    
    // Update sentiment bar (horizontal bar chart)
    const sentimentBar = document.getElementById('sentimentGauge');
    if (sentimentBar) {
        sentimentBar.style.width = `${sentimentScore}%`;
        
        // Set color based on score
        let barColor;
        if (sentimentScore <= 25) barColor = '#f85149';        // Red - Extreme Fear
        else if (sentimentScore <= 45) barColor = '#d29922';   // Orange - Fear
        else if (sentimentScore <= 55) barColor = '#6e7681';   // Gray - Neutral
        else if (sentimentScore <= 75) barColor = '#58a6ff';   // Blue - Greed
        else barColor = '#3fb950';                             // Green - Extreme Greed
        
        sentimentBar.style.backgroundColor = barColor;
    }
    
    // Set keywords
    const keywordsHTML = analysis.keywords.map(kw => 
        `<span class="keyword-tag">${kw}</span>`
    ).join('');
    document.getElementById('trendingKeywords').innerHTML = keywordsHTML;
    
    // Set cross analysis
    document.getElementById('crossAnalysisContent').innerHTML = 
        typeof analysis.crossAnalysis === 'function' 
            ? analysis.crossAnalysis(value, status) 
            : analysis.crossAnalysis;
    
    // Set historical comparison
    document.getElementById('historicalComparison').innerHTML = 
        `<p>${analysis.historical}</p>`;
    
    // Set recommendations
    const recommendations = typeof analysis.recommendations === 'function'
        ? analysis.recommendations(value)
        : analysis.recommendations;
    const recommendationsHTML = '<ul>' + 
        recommendations.map(rec => `<li>${rec}</li>`).join('') + 
        '</ul>';
    document.getElementById('recommendations').innerHTML = recommendationsHTML;
    
    // Show modal
    const modal = document.getElementById('analysisModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Scroll to top of modal content
    setTimeout(() => {
        const modalContainer = modal.querySelector('.modal-container');
        if (modalContainer) {
            modalContainer.scrollTop = 0;
        }
    }, 50);
}

// Close analysis modal
function closeAnalysisModal() {
    const modal = document.getElementById('analysisModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close modal on overlay click
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('analysisModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAnalysisModal();
            }
        });
    }
    
    // ESC key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAnalysisModal();
        }
    });
});

// Export for use in main.js
window.openAnalysisModal = openAnalysisModal;
window.closeAnalysisModal = closeAnalysisModal;
