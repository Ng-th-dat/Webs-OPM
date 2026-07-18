import { useEffect, useState } from 'react';
import type { CharacterIntelEntry } from '@/types/characterIntel';
import { fetchCharacterIntelEntries } from '@/lib/api/characterIntel';

interface UseCharacterIntelResult {
  entries: CharacterIntelEntry[];
  loading: boolean;
  error: string | null;
}

export function useCharacterIntel(): UseCharacterIntelResult {
  const [entries, setEntries] = useState<CharacterIntelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchCharacterIntelEntries()
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load intel');
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
