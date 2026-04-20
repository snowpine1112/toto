import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Loading } from '@/components/common/Loading';
import { Card } from '@/components/common/Card';
import { formatSeason } from '@/utils/format';
import type { League } from '@/types';

export function Tournaments() {
  const [tournaments, setTournaments] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.leagues.list({ type: 'cup' }).then((r) => {
      setTournaments(r.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-3">
      <h2 className="font-bold text-gray-700 text-lg">大会一覧</h2>
      {tournaments.length === 0 ? (
        <p className="text-gray-400 text-center py-8">大会データがまだありません</p>
      ) : (
        tournaments.map((t) => (
          <Link key={t.id} to={`/tournaments/${t.id}`}>
            <Card className="flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
              {t.logo ? (
                <img src={t.logo} alt={t.name} className="w-10 h-10 object-contain" />
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                  🏆
                </div>
              )}
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-gray-400">{t.country} · {formatSeason(t.season, t.country)}</p>
              </div>
              <span className="ml-auto text-gray-300">→</span>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
