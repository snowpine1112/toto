import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Loading } from '@/components/common/Loading';
import { Card } from '@/components/common/Card';
import type { League } from '@/types';

export function Leagues() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.leagues.list().then((r) => {
      setLeagues(r.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-3">
      <h2 className="font-bold text-gray-700 text-lg">対応リーグ一覧</h2>
      {leagues.length === 0 ? (
        <p className="text-gray-400 text-center py-8">リーグデータがまだありません</p>
      ) : (
        leagues.map((league) => (
          <Link key={league.id} to={`/leagues/${league.id}`}>
            <Card className="flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
              {league.logo ? (
                <img src={league.logo} alt={league.name} className="w-10 h-10 object-contain" />
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  🏆
                </div>
              )}
              <div>
                <p className="font-medium">{league.name}</p>
                <p className="text-sm text-gray-400">{league.country} · {league.season}シーズン</p>
              </div>
              <span className="ml-auto text-gray-300">→</span>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
