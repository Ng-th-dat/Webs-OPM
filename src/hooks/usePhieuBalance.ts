import { useEffect, useState } from 'react';
import { fetchMyPhieuBalance } from '@/lib/api/wallet';

interface UsePhieuBalanceResult {
  balance: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** `pollMs`, when set, silently re-fetches in the background without touching `loading`/`error` —
 * used while a top-up is awaiting SePay webhook auto-credit (see WalletPage.tsx). */
export function usePhieuBalance(userId: string | undefined, pollMs?: number): UsePhieuBalanceResult {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!userId) {
      setBalance(0);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchMyPhieuBalance(userId)
      .then((value) => {
        if (!cancelled) setBalance(value);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load balance');
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
      fetchMyPhieuBalance(userId)
        .then(setBalance)
        .catch(() => undefined);
    }, pollMs);
    return () => window.clearInterval(interval);
  }, [userId, pollMs]);

  return { balance, loading, error, refetch: () => setReloadToken((token) => token + 1) };
}
