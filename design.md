# toto スコア予想アプリ 設計書

| 項目 | 内容 |
|------|------|
| プロジェクト名 | Toto Score Advisor |
| バージョン | 1.0.0 |
| 作成日 | 2026-04-20 |
| ステータス | Draft |

---

## 1. 概要

### 1.1 目的

サッカーの試合データ（過去の成績・統計情報）をもとに、toto の各試合のスコアを統計的に予測し、購入の参考情報を提供する Web アプリケーション。

### 1.2 スコープ

- 全リーグ対応（API が提供するリーグすべて）
- 統計ベースのシンプルな予測アルゴリズム
- React SPA として構築

### 1.3 想定ユーザー

- toto 購入者（サッカーファン）
- 試合の統計データを確認したい人

---

## 2. システム構成

### 2.1 アーキテクチャ概要

```
┌─────────────────────────────────────────────────┐
│                    Frontend                      │
│              React + TypeScript                  │
│              (Vite / SPA)                        │
└──────────────────┬──────────────────────────────┘
                   │ REST API
┌──────────────────▼──────────────────────────────┐
│                    Backend                       │
│              Node.js + Express                   │
│              (TypeScript)                        │
└──────┬───────────────────────────┬──────────────┘
       │                           │
┌──────▼──────┐           ┌───────▼───────┐
│  PostgreSQL │           │  API-Football │
│   (DB)      │           │  (外部API)    │
└─────────────┘           └───────────────┘
```

### 2.2 技術スタック

| レイヤー | 技術 | 理由 |
|----------|------|------|
| Frontend | React 18 + TypeScript | コンポーネント指向、型安全 |
| ビルドツール | Vite | 高速HMR、設定がシンプル |
| UIライブラリ | Tailwind CSS + shadcn/ui | ユーティリティファースト、カスタマイズ性 |
| Backend | Node.js + Express + TypeScript | フロントと言語統一、エコシステム豊富 |
| ORM | Prisma | 型安全なDBアクセス、マイグレーション管理 |
| DB | PostgreSQL | リレーショナルデータに強い、JSON型対応 |
| 外部API | API-Football (RapidAPI) | Jリーグ含む全リーグ対応、データ量豊富 |
| テスト | Vitest + Testing Library | Viteとの統合、高速実行 |

### 2.3 ディレクトリ構成

```
toto-advisor/
├── frontend/
│   ├── src/
│   │   ├── components/       # UIコンポーネント
│   │   │   ├── common/       # Button, Card, Loading等
│   │   │   ├── match/        # 試合関連コンポーネント
│   │   │   ├── prediction/   # 予測表示コンポーネント
│   │   │   └── league/       # リーグ選択等
│   │   ├── pages/            # ページコンポーネント
│   │   ├── hooks/            # カスタムフック
│   │   ├── services/         # API呼び出し
│   │   ├── types/            # 型定義
│   │   ├── utils/            # ユーティリティ
│   │   └── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── controllers/      # リクエストハンドラ
│   │   ├── services/         # ビジネスロジック
│   │   │   ├── prediction/   # 予測アルゴリズム
│   │   │   └── football/     # 外部APIラッパー
│   │   ├── models/           # Prismaスキーマ関連
│   │   ├── routes/           # ルーティング定義
│   │   ├── middlewares/      # 認証・エラーハンドリング等
│   │   ├── types/            # 型定義
│   │   ├── utils/            # ユーティリティ
│   │   └── app.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
└── README.md
```

---

## 3. データモデル

### 3.1 ER図

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   League     │     │    Team      │     │     Match        │
├──────────────┤     ├──────────────┤     ├──────────────────┤
│ id       PK │◄──┐ │ id       PK │◄──┐ │ id           PK  │
│ externalId   │   │ │ externalId   │   ├─│ homeTeamId   FK  │
│ name         │   │ │ name         │   └─│ awayTeamId   FK  │
│ country      │   │ │ logo         │     │ leagueId     FK  │──►League
│ season       │   │ │ leagueId FK │──►│ │ season           │
│ logo         │   │ └──────────────┘     │ matchDate        │
└──────────────┘   │                      │ homeScore        │
                   │                      │ awayScore        │
                   │                      │ status           │
                   │                      │ round            │
                   │                      └──────────────────┘
                   │
                   │  ┌──────────────────┐
                   │  │   TeamStats      │
                   │  ├──────────────────┤
                   │  │ id           PK  │
                   └──│ teamId       FK  │
                      │ leagueId     FK  │
                      │ season           │
                      │ wins             │
                      │ draws            │
                      │ losses           │
                      │ goalsFor         │
                      │ goalsAgainst     │
                      │ form             │ ← 直近5試合の結果 "WWDLW"
                      │ homeWins         │
                      │ homeLosses       │
                      │ awayWins         │
                      │ awayLosses       │
                      └──────────────────┘

┌──────────────────────┐
│    Prediction        │
├──────────────────────┤
│ id              PK   │
│ matchId         FK   │──► Match
│ predictedHome   int  │
│ predictedAway   int  │
│ homeWinProb     float│
│ drawProb        float│
│ awayWinProb     float│
│ confidence      float│
│ factors         json │ ← 予測の根拠データ
│ createdAt            │
└──────────────────────┘

┌──────────────────────┐
│  TotoRound           │
├──────────────────────┤
│ id              PK   │
│ roundName        str │ ← "第1234回"
│ deadline         ts  │
│ matchIds         FK[]│──► Match[]
│ status           str │ ← "open" | "closed" | "resulted"
└──────────────────────┘
```

### 3.2 Prisma スキーマ（主要部分）

```prisma
model League {
  id         Int      @id @default(autoincrement())
  externalId Int      @unique
  name       String
  country    String
  season     Int
  logo       String?
  teams      Team[]
  matches    Match[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Team {
  id         Int         @id @default(autoincrement())
  externalId Int         @unique
  name       String
  logo       String?
  leagueId   Int
  league     League      @relation(fields: [leagueId], references: [id])
  homeMatches Match[]    @relation("HomeTeam")
  awayMatches Match[]    @relation("AwayTeam")
  stats      TeamStats[]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}

model Match {
  id          Int          @id @default(autoincrement())
  externalId  Int          @unique
  homeTeamId  Int
  awayTeamId  Int
  leagueId    Int
  season      Int
  matchDate   DateTime
  homeScore   Int?
  awayScore   Int?
  status      MatchStatus  @default(SCHEDULED)
  round       String?
  homeTeam    Team         @relation("HomeTeam", fields: [homeTeamId], references: [id])
  awayTeam    Team         @relation("AwayTeam", fields: [awayTeamId], references: [id])
  league      League       @relation(fields: [leagueId], references: [id])
  prediction  Prediction?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

enum MatchStatus {
  SCHEDULED
  LIVE
  FINISHED
  POSTPONED
  CANCELLED
}

model Prediction {
  id             Int      @id @default(autoincrement())
  matchId        Int      @unique
  predictedHome  Int
  predictedAway  Int
  homeWinProb    Float
  drawProb       Float
  awayWinProb    Float
  confidence     Float
  factors        Json
  match          Match    @relation(fields: [matchId], references: [id])
  createdAt      DateTime @default(now())
}
```

---

## 4. API設計

### 4.1 エンドポイント一覧

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/leagues` | リーグ一覧取得 |
| GET | `/api/leagues/:id` | リーグ詳細（順位表含む） |
| GET | `/api/matches` | 試合一覧（フィルタ対応） |
| GET | `/api/matches/:id` | 試合詳細 |
| GET | `/api/matches/:id/prediction` | 試合の予測結果取得 |
| GET | `/api/toto/current` | 現在のtoto対象試合一覧+予測 |
| GET | `/api/toto/:roundId` | 特定回のtoto情報 |
| GET | `/api/teams/:id/stats` | チーム統計情報 |
| POST | `/api/predictions/generate` | 予測を手動実行 |

### 4.2 レスポンス例

**GET `/api/toto/current`**

```json
{
  "round": {
    "id": 1,
    "name": "第1234回",
    "deadline": "2026-04-25T12:00:00+09:00",
    "status": "open"
  },
  "matches": [
    {
      "id": 101,
      "homeTeam": {
        "id": 1,
        "name": "浦和レッズ",
        "logo": "https://..."
      },
      "awayTeam": {
        "id": 2,
        "name": "鹿島アントラーズ",
        "logo": "https://..."
      },
      "matchDate": "2026-04-26T14:00:00+09:00",
      "prediction": {
        "predictedHome": 2,
        "predictedAway": 1,
        "homeWinProb": 0.45,
        "drawProb": 0.28,
        "awayWinProb": 0.27,
        "confidence": 0.72,
        "factors": {
          "homeAdvantage": 0.12,
          "formDiff": 0.08,
          "goalDiff": 0.15,
          "h2hRecord": "3W1D1L"
        }
      }
    }
  ]
}
```

**GET `/api/matches?leagueId=1&status=SCHEDULED&limit=20`**

```json
{
  "data": [...],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

## 5. 予測アルゴリズム

### 5.1 概要

ポアソン分布モデルをベースにした統計的予測を採用する。各チームの「攻撃力」「守備力」を算出し、期待ゴール数からスコアとその確率を求める。

### 5.2 計算フロー

```
1. データ収集
   └─ 直近N試合の成績を取得（デフォルト: 10試合）

2. チーム力の算出
   ├─ 攻撃力 = チーム平均得点 / リーグ平均得点
   └─ 守備力 = チーム平均失点 / リーグ平均失点

3. 期待ゴール数の算出
   ├─ ホーム期待値 = ホーム攻撃力 × アウェイ守備力 × リーグ平均得点 × ホーム補正
   └─ アウェイ期待値 = アウェイ攻撃力 × ホーム守備力 × リーグ平均得点

4. ポアソン分布で確率算出
   ├─ P(ホーム = x点) = e^(-λh) × λh^x / x!
   └─ P(アウェイ = y点) = e^(-λa) × λa^y / y!

5. スコア予測
   ├─ 最も確率の高いスコアを予測スコアとする
   ├─ 勝ち/引き分け/負け の確率を合算
   └─ confidence = max(homeWinProb, drawProb, awayWinProb)
```

### 5.3 補正ファクター

| ファクター | 重み | 説明 |
|------------|------|------|
| ホームアドバンテージ | ×1.15 | ホームチームの期待値に乗算 |
| 直近フォーム | ±0.1 | 直近5試合の成績で攻撃力を補正 |
| 直接対決成績 | ±0.05 | 過去の対戦成績を反映 |
| 得失点差 | ±0.05 | リーグ内での得失点差ランキング |

### 5.4 擬似コード

```typescript
interface PredictionInput {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  leagueAvg: { goalsPerMatch: number };
  h2h: H2HRecord;
}

function predictScore(input: PredictionInput): PredictionResult {
  const { homeTeam, awayTeam, leagueAvg, h2h } = input;

  // 攻撃力・守備力
  const homeAttack = homeTeam.avgGoalsFor / leagueAvg.goalsPerMatch;
  const homeDefense = homeTeam.avgGoalsAgainst / leagueAvg.goalsPerMatch;
  const awayAttack = awayTeam.avgGoalsFor / leagueAvg.goalsPerMatch;
  const awayDefense = awayTeam.avgGoalsAgainst / leagueAvg.goalsPerMatch;

  // 期待ゴール数
  let homeExpected = homeAttack * awayDefense * leagueAvg.goalsPerMatch;
  let awayExpected = awayAttack * homeDefense * leagueAvg.goalsPerMatch;

  // 補正
  homeExpected *= HOME_ADVANTAGE;          // 1.15
  homeExpected += formAdjustment(homeTeam); // ±0.1
  awayExpected += formAdjustment(awayTeam);
  homeExpected += h2hAdjustment(h2h);       // ±0.05

  // ポアソン分布でスコア確率マトリクス生成 (0-5点)
  const matrix = buildScoreMatrix(homeExpected, awayExpected, MAX_GOALS);

  // 結果集計
  const homeWinProb = sumUpperTriangle(matrix);
  const drawProb = sumDiagonal(matrix);
  const awayWinProb = sumLowerTriangle(matrix);
  const [predictedHome, predictedAway] = findMostLikely(matrix);

  return {
    predictedHome,
    predictedAway,
    homeWinProb,
    drawProb,
    awayWinProb,
    confidence: Math.max(homeWinProb, drawProb, awayWinProb),
    factors: { homeAttack, homeDefense, awayAttack, awayDefense },
  };
}
```

---

## 6. 画面設計

### 6.1 画面一覧

| 画面 | パス | 説明 |
|------|------|------|
| トップ/ダッシュボード | `/` | 今回のtoto対象試合と予測一覧 |
| リーグ一覧 | `/leagues` | 対応リーグの一覧 |
| リーグ詳細 | `/leagues/:id` | 順位表・試合一覧 |
| 試合詳細 | `/matches/:id` | 予測詳細・対戦データ |
| 予測履歴 | `/history` | 過去の予測と実際の結果比較 |

### 6.2 トップ画面レイアウト

```
┌─────────────────────────────────────────────┐
│  🏆 Toto Score Advisor         [リーグ選択] │
├─────────────────────────────────────────────┤
│                                             │
│  第1234回 toto  締切: 4/25 12:00            │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ #1  浦和レッズ  vs  鹿島アントラーズ  │    │
│  │     予測: 2-1 (ホーム勝ち 45%)       │    │
│  │     信頼度: ████████░░ 72%           │    │
│  │     [詳細を見る]                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ #2  FC東京  vs  横浜F・マリノス      │    │
│  │     予測: 1-1 (引き分け 35%)         │    │
│  │     信頼度: ██████░░░░ 55%           │    │
│  │     [詳細を見る]                     │    │
│  └─────────────────────────────────────┘    │
│  ...                                        │
│                                             │
│  ┌─ 予測サマリー ──────────────────────┐    │
│  │ 予測的中率（過去10回）: 68%          │    │
│  │ 今回の平均信頼度: 63%                │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### 6.3 試合詳細画面レイアウト

```
┌─────────────────────────────────────────────┐
│  ← 戻る                                    │
├─────────────────────────────────────────────┤
│                                             │
│       浦和レッズ  2 - 1  鹿島アントラーズ    │
│       (予測スコア)                          │
│                                             │
│  ┌─ 勝敗確率 ─────────────────────────┐    │
│  │ ホーム勝ち  ████████████░░░ 45%     │    │
│  │ 引き分け    ████████░░░░░░░ 28%     │    │
│  │ アウェイ勝ち ███████░░░░░░░░ 27%    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─ スコア確率マトリクス ──────────────┐    │
│  │      0    1    2    3    4          │    │
│  │  0  3%   5%   4%   2%   1%         │    │
│  │  1  7%  12%   9%   4%   1%         │    │
│  │  2  6%  11%  ★8%   3%   1%         │    │
│  │  3  3%   5%   4%   2%   0%         │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─ チーム統計比較 ───────────────────┐    │
│  │           浦和    鹿島             │    │
│  │  直近5試合  WWDLW   WLDWW          │    │
│  │  平均得点   1.8     1.5            │    │
│  │  平均失点   0.9     1.1            │    │
│  │  ホーム勝率 65%     -              │    │
│  │  アウェイ勝率 -     45%            │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─ 直接対決（過去5試合）─────────────┐    │
│  │  2026/02/15  浦和 1-0 鹿島         │    │
│  │  2025/11/03  鹿島 2-2 浦和         │    │
│  │  ...                               │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## 7. 外部API連携

### 7.1 API-Football 利用方針

| 項目 | 値 |
|------|------|
| プロバイダ | API-Football (via RapidAPI) |
| 無料枠 | 100リクエスト/日 |
| 認証 | `X-RapidAPI-Key` ヘッダー |

### 7.2 利用するエンドポイント

| API-Football Endpoint | 用途 | 呼び出し頻度 |
|----------------------|------|-------------|
| `GET /leagues` | リーグ一覧取得 | 日次 |
| `GET /teams` | チーム情報取得 | 日次 |
| `GET /fixtures` | 試合一覧・結果取得 | 日次 |
| `GET /fixtures/headtohead` | 直接対決データ | 予測時 |
| `GET /teams/statistics` | チームシーズン統計 | 日次 |
| `GET /standings` | 順位表 | 日次 |

### 7.3 API呼び出し戦略

無料枠が100リクエスト/日のため、以下の戦略でリクエストを最小化する。

1. **日次バッチ取得**: cronジョブで毎日1回、必要データをまとめて取得しDBにキャッシュ
2. **差分更新**: 変更がある試合（当日・翌日）のみ更新
3. **リクエスト優先度**: toto対象リーグ > その他リーグ
4. **キャッシュTTL**: 試合結果=1時間 / 統計情報=24時間 / リーグ情報=7日

---

## 8. 非機能要件

### 8.1 パフォーマンス

| 項目 | 目標値 |
|------|--------|
| 初回ページロード | 3秒以内 |
| API レスポンスタイム | 500ms以内（キャッシュヒット時 100ms） |
| 予測計算時間 | 1試合あたり 100ms以内 |

### 8.2 セキュリティ

- API キーは環境変数で管理（`.env`、Gitにコミットしない）
- Rate limiting を backend に設定（express-rate-limit）
- CORS 設定をフロントエンドのオリジンに限定
- 入力値のバリデーション（zod）

### 8.3 デプロイ

| 項目 | 選択肢 |
|------|--------|
| Frontend | Vercel / Netlify |
| Backend | Railway / Render |
| DB | Supabase (PostgreSQL) / Railway |
| CI/CD | GitHub Actions |

### 8.4 監視・ログ

- `winston` によるアプリケーションログ
- API-Football のリクエスト残数をログ出力（枯渇防止）
- デプロイ先のビルトインメトリクスを活用

---

## 9. 開発フェーズ

### Phase 1: MVP（2週間）

- プロジェクト初期セットアップ（Vite + Express + Prisma）
- DB スキーマ作成・マイグレーション
- API-Football からのデータ取得バッチ
- 基本的な予測アルゴリズム実装
- トップ画面（toto対象試合一覧 + 予測表示）

### Phase 2: 機能拡充（2週間）

- 試合詳細画面（スコアマトリクス、統計比較）
- リーグ一覧・詳細画面
- 予測履歴・的中率トラッキング
- レスポンシブ対応

### Phase 3: 改善（1週間）

- 予測アルゴリズムのチューニング（実績データで補正ファクター調整）
- UI/UX の改善
- パフォーマンス最適化
- デプロイ・CI/CD 構築

---

## 10. リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| API-Football 無料枠超過 | データ取得不可 | バッチ取得+キャッシュで最小化、有料プラン検討 |
| toto対象試合のAPI対応 | 試合が見つからない | 手動登録機能をフォールバックとして用意 |
| 予測精度が低い | ユーザー信頼低下 | 信頼度を明示、過去実績を表示して透明性確保 |
| API仕様変更 | 連携破損 | APIラッパー層で変更を局所化 |
