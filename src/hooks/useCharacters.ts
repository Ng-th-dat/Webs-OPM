import { useEffect, useState } from 'react';
import type { Character } from '@/types/character';
import { fetchCharacters } from '@/lib/api/characters';

interface UseCharactersResult {
  characters: Character[];
  loading: boolean;
  error: string | null;
}

export function useCharacters(): UseCharactersResult {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchCharacters()
      .then((data) => {
        if (!cancelled) setCharacters(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load characters');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { characters, loading, error };
}
