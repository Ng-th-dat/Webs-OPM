import { useEffect, useState } from 'react';
import { fetchMasteryMaterialImages } from '@/lib/api/masteryMaterials';

interface UseMasteryMaterialImagesResult {
  images: Record<string, string>;
  loading: boolean;
  error: string | null;
}

export function useMasteryMaterialImages(): UseMasteryMaterialImagesResult {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchMasteryMaterialImages()
      .then((data) => {
        if (!cancelled) setImages(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load material images');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { images, loading, error };
}
