import { useParams, Link } from 'react-router-dom';
import { useMatch } from '@/hooks/useMatch';
import { Loading } from '@/components/common/Loading';
import { Card } from '@/components/common/Card';
import { ProbBar } from '@/components/common/ProbBar';
import { ScoreMatrix } from '@/components/prediction/ScoreMatrix';
import { formatDate, formatPercent } from '@/utils/format';

export function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: match, loading, error } = useMatch(parseInt(id ?? '0'));

  if (loading) return <Loading />;
  if (error || !match) {
    return (
      <div className="text-center py-16 text-red-500">
        試合が見つかりませんでした
      </div>
    );
  }

  const { prediction } = match;
  const homeTeamWithStats = match.homeTeam as any;
  const awayTeamWithStats = match.awayTeam as any;
  const homeStats = homeTeamWithStats.stats?.[0];
  const awayStats = awayTeamWithStats.stats?.[0];

  return (
    <div className="space-y-4">
      <Link to="/" className="flex items-center gap-1 text-blue-600 hover:underline text-sm">
        ← 戻る
      </Link>

      <Card>
        <p className="text-xs text-gray-400 text-center mb-3">
          {match.league.name} | {formatDate(match.matchDate)}
        </p>
        <div className="flex items-center justify-center gap-6">
          <TeamBadge name={match.homeTeam.name} logo={match.homeTeam.logo} />
          <div className="text-center">
            {prediction ? (
              <>
                <p className="text-4xl font-bold text-gray-800">
                  {prediction.predictedHome} - {prediction.predictedAway}
                </p>
                <p className="text-xs text-gray-400 mt-1">予測スコア</p>
              </>
            ) : (
              <p className="text-gray-400">予測なし</p>
            )}
          </div>
          <TeamBadge name={match.awayTeam.name} logo={match.awayTeam.logo} />
        </div>
      </Card>

      {prediction && (
        <>
          <Card>
            <h3 className="font-semibold text-gray-700 mb-3">勝敗確率</h3>
            <div className="space-y-2">
              <ProbBar label="ホーム勝ち" value={prediction.homeWinProb} color="bg-blue-400" />
              <ProbBar label="引き分け" value={prediction.drawProb} color="bg-gray-400" />
              <ProbBar label="アウェイ勝ち" value={prediction.awayWinProb} color="bg-red-400" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">信頼度</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-green-400"
                  style={{ width: formatPercent(prediction.confidence) }}
                />
              </div>
              <span className="text-xs font-medium">{formatPercent(prediction.confidence)}</span>
            </div>
          </Card>

          {prediction.scoreMatrix && (
            <Card>
              <h3 className="font-semibold text-gray-700 mb-3">スコア確率マトリクス</h3>
              <p className="text-xs text-gray-400 mb-2">
                行: ホーム得点 / 列: アウェイ得点
              </p>
              <ScoreMatrix
                matrix={prediction.scoreMatrix}
                predictedHome={prediction.predictedHome}
                predictedAway={prediction.predictedAway}
              />
            </Card>
          )}

          <Card>
            <h3 className="font-semibold text-gray-700 mb-3">予測ファクター</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <FactorRow label="ホーム攻撃力" value={prediction.factors.homeAttack.toFixed(2)} />
              <FactorRow label="アウェイ攻撃力" value={prediction.factors.awayAttack.toFixed(2)} />
              <FactorRow label="ホーム守備力" value={prediction.factors.homeDefense.toFixed(2)} />
              <FactorRow label="アウェイ守備力" value={prediction.factors.awayDefense.toFixed(2)} />
              <FactorRow label="直接対決" value={prediction.factors.h2hRecord} />
            </div>
          </Card>
        </>
      )}

      {(homeStats || awayStats) && (
        <Card>
          <h3 className="font-semibold text-gray-700 mb-3">チーム統計比較</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs">
                <th className="text-left py-1">項目</th>
                <th className="text-center py-1">{match.homeTeam.name}</th>
                <th className="text-center py-1">{match.awayTeam.name}</th>
              </tr>
            </thead>
            <tbody>
              {homeStats && awayStats && (
                <>
                  <StatRow
                    label="直近フォーム"
                    home={homeStats.form ?? '-'}
                    away={awayStats.form ?? '-'}
                  />
                  <StatRow
                    label="勝/分/負"
                    home={`${homeStats.wins}/${homeStats.draws}/${homeStats.losses}`}
                    away={`${awayStats.wins}/${awayStats.draws}/${awayStats.losses}`}
                  />
                  <StatRow
                    label="総得点"
                    home={String(homeStats.goalsFor)}
                    away={String(awayStats.goalsFor)}
                  />
                  <StatRow
                    label="総失点"
                    home={String(homeStats.goalsAgainst)}
                    away={String(awayStats.goalsAgainst)}
                  />
                  <StatRow
                    label="ホーム勝利"
                    home={String(homeStats.homeWins)}
                    away="-"
                  />
                  <StatRow
                    label="アウェイ勝利"
                    home="-"
                    away={String(awayStats.awayWins)}
                  />
                </>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function TeamBadge({ name, logo }: { name: string; logo: string | null }) {
  return (
    <div className="flex flex-col items-center gap-2 w-28">
      {logo ? (
        <img src={logo} alt={name} className="w-14 h-14 object-contain" />
      ) : (
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
          ⚽
        </div>
      )}
      <span className="text-sm font-medium text-center leading-tight">{name}</span>
    </div>
  );
}

function FactorRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between bg-gray-50 rounded px-2 py-1">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function StatRow({ label, home, away }: { label: string; home: string; away: string }) {
  return (
    <tr className="border-t border-gray-50">
      <td className="py-1.5 text-gray-500">{label}</td>
      <td className="py-1.5 text-center font-medium">{home}</td>
      <td className="py-1.5 text-center font-medium">{away}</td>
    </tr>
  );
}
