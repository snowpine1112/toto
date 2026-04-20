import { useTotoCurrent } from '@/hooks/useToto';
import { Loading } from '@/components/common/Loading';
import { Card } from '@/components/common/Card';
import { MatchCard } from '@/components/match/MatchCard';
import { formatDeadline } from '@/utils/format';

export function Dashboard() {
  const { data, loading, error } = useTotoCurrent();

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="text-center py-16 text-red-500">
        <p>データの取得に失敗しました</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-xl">現在totoの対象試合はありません</p>
      </div>
    );
  }

  const { round, matches } = data;
  const avgConfidence =
    matches.reduce((s, m) => s + (m.prediction?.confidence ?? 0), 0) /
    (matches.filter((m) => m.prediction).length || 1);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{round.name} toto</h2>
            <p className="text-blue-100 text-sm mt-1">
              締切: {formatDeadline(round.deadline)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-xs">対象試合数</p>
            <p className="text-3xl font-bold">{matches.length}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {matches.map((match, i) => (
          <MatchCard key={match.id} match={match} index={i} />
        ))}
      </div>

      <Card className="bg-gray-50">
        <h3 className="font-semibold text-gray-700 mb-3">予測サマリー</h3>
        <div className="flex gap-8">
          <div>
            <p className="text-xs text-gray-500">今回の平均信頼度</p>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(avgConfidence * 100)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">予測済み試合</p>
            <p className="text-2xl font-bold text-green-600">
              {matches.filter((m) => m.prediction).length} / {matches.length}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
