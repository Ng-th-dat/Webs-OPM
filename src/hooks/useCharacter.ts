import { useEffect, useState } from 'react';
import type { Character } from '@/types/character';
import { fetchCharacterBySlug } from '@/lib/api/characters';

interface UseCharacterResult {
  character: Character | null;
  loading: boolean;
  error: string | null;
}

export function useCharacter(slug: string | undefined): UseCharacterResult {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setCharacter(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchCharacterBySlug(slug)
      .then((data) => {
        if (!cancelled) setCharacter(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load character');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { character, loading, error };
}
