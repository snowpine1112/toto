import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Loading } from '@/components/common/Loading';
import { MatchCard } from '@/components/match/MatchCard';
import { formatSeason } from '@/utils/format';
import type { League, Match } from '@/types';

export function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<(League & { matches: Match[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.leagues.get(parseInt(id ?? '0')).then((r) => {
      setData(r.data as any);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Loading />;
  if (!data) return <p className="text-center py-16 text-red-500">大会が見つかりません</p>;

  return (
    <div className="space-y-4">
      <Link to="/tournaments" className="flex items-center gap-1 text-blue-600 hover:underline text-sm">
        ← 大会一覧
      </Link>

      <div className="flex items-center gap-4">
        {data.logo && <img src={data.logo} alt={data.name} className="w-14 h-14 object-contain" />}
        <div>
          <h2 className="text-xl font-bold">{data.name}</h2>
          <p className="text-gray-400 text-sm">{data.country} · {formatSeason(data.season, data.country)}</p>
        </div>
      </div>

      <h3 className="font-semibold text-gray-600">直近・予定試合</h3>
      {(data.matches as Match[]).length === 0 ? (
        <p className="text-gray-400 text-center py-8">試合データがありません</p>
      ) : (
        <div className="grid gap-3">
          {(data.matches as Match[]).map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
