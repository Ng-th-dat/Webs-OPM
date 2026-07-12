import { useEffect, useState } from 'react';
import type { ReleaseScheduleEntry } from '@/types/releaseSchedule';
import { fetchReleaseSchedule } from '@/lib/api/releaseSchedule';

interface UseReleaseScheduleResult {
  entries: ReleaseScheduleEntry[];
  loading: boolean;
  error: string | null;
}

export function useReleaseSchedule(): UseReleaseScheduleResult {
  const [entries, setEntries] = useState<ReleaseScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchReleaseSchedule()
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load release schedule');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { entries, loading, error };
}
