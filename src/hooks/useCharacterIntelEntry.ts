import { useEffect, useState } from 'react';
import type { CharacterIntelEntry } from '@/types/characterIntel';
import { fetchCharacterIntelBySlug } from '@/lib/api/characterIntel';

interface UseCharacterIntelEntryResult {
  entry: CharacterIntelEntry | null;
  loading: boolean;
  error: string | null;
}

export function useCharacterIntelEntry(slug: string | undefined): UseCharacterIntelEntryResult {
  const [entry, setEntry] = useState<CharacterIntelEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setEntry(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchCharacterIntelBySlug(slug)
      .then((data) => {
        if (!cancelled) setEntry(data);
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
  }, [slug]);

  return { entry, loading, error };
}
