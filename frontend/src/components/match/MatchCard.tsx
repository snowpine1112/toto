import { Link } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { ProbBar } from '@/components/common/ProbBar';
import { formatDate, formatPercent } from '@/utils/format';
import type { Match } from '@/types';

interface MatchCardProps {
  match: Match;
  index?: number;
}

export function MatchCard({ match, index }: MatchCardProps) {
  const { prediction } = match;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        {index !== undefined && (
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            #{index + 1}
          </span>
        )}
        <span className="text-xs text-gray-400 ml-auto">{formatDate(match.matchDate)}</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <TeamDisplay name={match.homeTeam.name} logo={match.homeTeam.logo} />
        <div className="text-center px-4">
          {prediction ? (
            <span className="text-2xl font-bold text-gray-800">
              {prediction.predictedHome} - {prediction.predictedAway}
            </span>
          ) : (
            <span className="text-gray-400 text-sm">予測なし</span>
          )}
          <p className="text-xs text-gray-400 mt-0.5">予測スコア</p>
        </div>
        <TeamDisplay name={match.awayTeam.name} logo={match.awayTeam.logo} align="right" />
      </div>

      {prediction && (
        <div className="space-y-1.5 mb-3">
          <ProbBar label="ホーム勝ち" value={prediction.homeWinProb} color="bg-blue-400" />
          <ProbBar label="引き分け" value={prediction.drawProb} color="bg-gray-400" />
          <ProbBar label="アウェイ勝ち" value={prediction.awayWinProb} color="bg-red-400" />
        </div>
      )}

      {prediction && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">信頼度</span>
            <div className="w-24 bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-green-400"
                style={{ width: formatPercent(prediction.confidence) }}
              />
            </div>
            <span className="text-xs font-medium">{formatPercent(prediction.confidence)}</span>
          </div>
          <Link
            to={`/matches/${match.id}`}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            詳細を見る →
          </Link>
        </div>
      )}
    </Card>
  );
}

function TeamDisplay({
  name,
  logo,
  align = 'left',
}: {
  name: string;
  logo: string | null;
  align?: 'left' | 'right';
}) {
  return (
    <div className={`flex flex-col items-center gap-1 w-28 ${align === 'right' ? '' : ''}`}>
      {logo ? (
        <img src={logo} alt={name} className="w-10 h-10 object-contain" />
      ) : (
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-lg">
          ⚽
        </div>
      )}
      <span className="text-xs font-medium text-center leading-tight">{name}</span>
    </div>
  );
}
