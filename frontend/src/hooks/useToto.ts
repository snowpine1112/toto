import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { TotoCurrentResponse } from '../types';

export function useTotoCurrent() {
  const [data, setData] = useState<TotoCurrentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.toto
      .current()
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
