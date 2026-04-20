import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Match } from '../types';

export function useMatch(id: number) {
  const [data, setData] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.matches
      .get(id)
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}

export function useMatches(params?: { leagueId?: number; status?: string }) {
  const [data, setData] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.matches
      .list(params)
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.leagueId, params?.status]);

  return { data, loading, error };
}
