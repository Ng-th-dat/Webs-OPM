import { useEffect, useState } from 'react';
import type { GameUpdateEntry } from '@/types/gameUpdate';
import { fetchGameUpdateBySlug } from '@/lib/api/gameUpdates';

interface UseGameUpdateResult {
  update: GameUpdateEntry | null;
  loading: boolean;
  error: string | null;
}

export function useGameUpdate(slug: string | undefined): UseGameUpdateResult {
  const [update, setUpdate] = useState<GameUpdateEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setUpdate(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchGameUpdateBySlug(slug)
      .then((data) => {
        if (!cancelled) setUpdate(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load update');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { update, loading, error };
}
