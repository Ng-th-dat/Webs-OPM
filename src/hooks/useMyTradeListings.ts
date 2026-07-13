import { useEffect, useState } from 'react';
import type { TradeListing } from '@/types/tradeListing';
import { fetchMyTradeListings } from '@/lib/api/tradeListings';

interface UseMyTradeListingsResult {
  listings: TradeListing[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMyTradeListings(userId: string | undefined): UseMyTradeListingsResult {
  const [listings, setListings] = useState<TradeListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!userId) {
      setListings([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchMyTradeListings(userId)
      .then((data) => {
        if (!cancelled) setListings(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load your listings');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, reloadToken]);

  return { listings, loading, error, refetch: () => setReloadToken((token) => token + 1) };
}
