import { useEffect, useState } from 'react';
import type { TradeListing } from '@/types/tradeListing';
import { fetchApprovedTradeListings, type TradeListingFilters } from '@/lib/api/tradeListings';

interface UseTradeListingsResult {
  listings: TradeListing[];
  loading: boolean;
  error: string | null;
}

export function useTradeListings(filters?: TradeListingFilters): UseTradeListingsResult {
  const [listings, setListings] = useState<TradeListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const server = filters?.server;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchApprovedTradeListings(server ? { server } : undefined)
      .then((data) => {
        if (!cancelled) setListings(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load listings');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [server]);

  return { listings, loading, error };
}
