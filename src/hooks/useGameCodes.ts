import { useEffect, useState } from 'react';
import type { GameCodeEntry } from '@/types/gameCode';
import { fetchGameCodes } from '@/lib/api/gameCodes';

interface UseGameCodesResult {
  codes: GameCodeEntry[];
  loading: boolean;
  error: string | null;
}

export function useGameCodes(): UseGameCodesResult {
  const [codes, setCodes] = useState<GameCodeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchGameCodes()
      .then((data) => {
        if (!cancelled) setCodes(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load game codes');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { codes, loading, error };
}
