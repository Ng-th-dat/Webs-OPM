import { useEffect, useState } from 'react';
import type { PhieuTopup } from '@/types/wallet';
import { fetchMyTopups } from '@/lib/api/wallet';

interface UseMyTopupsResult {
  topups: PhieuTopup[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** `pollMs`, when set, silently re-fetches in the background without touching `loading`/`error` —
 * used while a top-up is awaiting SePay webhook auto-credit (see WalletPage.tsx). */
export function useMyTopups(userId: string | undefined, pollMs?: number): UseMyTopupsResult {
  const [topups, setTopups] = useState<PhieuTopup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!userId) {
      setTopups([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchMyTopups(userId)
      .then((data) => {
        if (!cancelled) setTopups(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load top-ups');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, reloadToken]);

  useEffect(() => {
    if (!userId || !pollMs) return;
    const interval = window.setInterval(() => {
      fetchMyTopups(userId)
        .then(setTopups)
        .catch(() => undefined);
    }, pollMs);
    return () => window.clearInterval(interval);
  }, [userId, pollMs]);

  return { topups, loading, error, refetch: () => setReloadToken((token) => token + 1) };
}
