import { useEffect, useState } from 'react';
import type { SeaServerEntry } from '@/types/seaServer';
import { fetchSeaServers } from '@/lib/api/seaServers';

interface UseSeaServersResult {
  servers: SeaServerEntry[];
  loading: boolean;
  error: string | null;
}

export function useSeaServers(): UseSeaServersResult {
  const [servers, setServers] = useState<SeaServerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchSeaServers()
      .then((data) => {
        if (!cancelled) setServers(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load server schedule');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { servers, loading, error };
}
