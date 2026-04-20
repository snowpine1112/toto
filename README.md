# Toto Score Advisor

サッカーtotoのスコアを統計的に予測するWebアプリ。ポアソン分布モデルを使いチームの攻守力から期待ゴール数を算出し、各試合の勝敗確率・予測スコアを表示する。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| DB | PostgreSQL + Prisma |
| 外部API | API-Football (RapidAPI) |

## セットアップ

### 1. PostgreSQL起動 (Docker)

```bash
docker-compose up -d
```

### 2. バックエンド

```bash
cd backend
cp .env.example .env
# .envにRAPIDAPI_KEYを設定
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

### 3. データ取得バッチ

```bash
cd backend
npm run batch:fetch
```

### 4. 予測生成

```bash
curl -X POST http://localhost:3001/api/predictions/generate
```

### 5. フロントエンド

```bash
cd frontend
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開く。

## API エンドポイント

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/leagues` | リーグ一覧 |
| GET | `/api/leagues/:id` | リーグ詳細 |
| GET | `/api/matches` | 試合一覧 |
| GET | `/api/matches/:id` | 試合詳細 |
| GET | `/api/matches/:id/prediction` | 試合予測 |
| GET | `/api/toto/current` | 現在のtoto一覧+予測 |
| POST | `/api/predictions/generate` | 全試合の予測生成 |

## 予測アルゴリズム

ポアソン分布モデルを使用:

1. 各チームの攻撃力 = チーム平均得点 / リーグ平均得点
2. 守備力 = チーム平均失点 / リーグ平均失点
3. 期待ゴール数 = 攻撃力 × 相手守備力 × リーグ平均得点
4. ホームアドバンテージ ×1.15 を適用
5. ポアソン分布で全スコア組み合わせの確率を算出

## 環境変数 (backend/.env)

```
DATABASE_URL="postgresql://toto:toto_password@localhost:5432/toto_db"
RAPIDAPI_KEY="your_rapidapi_key"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

RapidAPI キーは https://rapidapi.com/api-sports/api/api-football で取得。
