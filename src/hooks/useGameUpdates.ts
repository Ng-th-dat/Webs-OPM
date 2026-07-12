import { useEffect, useState } from 'react';
import type { GameUpdateEntry } from '@/types/gameUpdate';
import { fetchGameUpdates } from '@/lib/api/gameUpdates';

interface UseGameUpdatesResult {
  updates: GameUpdateEntry[];
  loading: boolean;
  error: string | null;
}

export function useGameUpdates(): UseGameUpdatesResult {
  const [updates, setUpdates] = useState<GameUpdateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchGameUpdates()
      .then((data) => {
        if (!cancelled) setUpdates(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load updates');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { updates, loading, error };
}
