import { useEffect, useState } from 'react';
import type { TradeListing } from '@/types/tradeListing';
import { fetchTradeListingById } from '@/lib/api/tradeListings';

interface UseTradeListingResult {
  listing: TradeListing | null;
  loading: boolean;
  error: string | null;
}

export function useTradeListing(id: string | undefined): UseTradeListingResult {
  const [listing, setListing] = useState<TradeListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setListing(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchTradeListingById(id)
      .then((data) => {
        if (!cancelled) setListing(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load listing');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { listing, loading, error };
}
