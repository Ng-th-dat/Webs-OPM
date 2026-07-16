import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchMasteryMaterialImages, setMasteryMaterialImage } from '@/lib/masteryMaterials';
import { uploadMasteryMaterialImage } from '@/lib/masteryMaterialImageStorage';
import { ImageIcon } from '@/components/icons';

interface MaterialDef {
  materialId: string;
  materialName: string;
}

// Local copy of the materialIds used in src/data/mastery.ts — not cross-imported (see
// CLAUDE.md's admin cross-import rule: only src/types/*.ts, everything else gets a local copy).
// Update this list if new materials are added to that file's tiers.
const MATERIAL_GROUPS: { branch: string; materials: MaterialDef[] }[] = [
  {
    branch: 'Type Mastery',
    materials: [
      { materialId: 'type-manual', materialName: 'Type Manual' },
      { materialId: 'type-mastery-token', materialName: 'Type Mastery Token' },
      { materialId: 'type-element-token', materialName: 'Type Element Token' },
      { materialId: 'type-certificate', materialName: 'Type Certificate' },
      { materialId: 'type-element-material', materialName: 'Type Element Material' },
    ],
  },
  {
    branch: 'Faction Mastery',
    materials: [
      { materialId: 'faction-mastery-material', materialName: 'Faction Mastery Material' },
      { materialId: 'faction-mastery-token', materialName: 'Faction Mastery Token' },
      { materialId: 'faction-mastery-token-plus', materialName: 'Faction Mastery Token+' },
      { materialId: 'faction-mastery-token-plus-plus', materialName: 'Faction Mastery Token++' },
      { materialId: 'faction-certificate', materialName: 'Faction Certificate' },
    ],
  },
  {
    branch: 'Level Mastery',
    materials: [
      { materialId: 'level-manual', materialName: 'Level Manual' },
      { materialId: 'hero-omnishard-3', materialName: 'Hero Omnishard III' },
      { materialId: 'level-certificate', materialName: 'Level Certificate' },
    ],
  },
  {
    branch: 'Shared',
    materials: [{ materialId: 'gold', materialName: 'Gold' }],
  },
];

function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-border bg-surface p-4 shadow-elevated sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function MaterialImageRow({
  material,
  imageUrl,
  onUploaded,
}: {
  material: MaterialDef;
  imageUrl: string | undefined;
  onUploaded: (materialId: string, url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const url = await uploadMasteryMaterialImage(material.materialId, file);
      await setMasteryMaterialImage(material.materialId, url);
      onUploaded(material.materialId, url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-elevated/50 p-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-5 w-5 text-subtle" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-semibold text-foreground">{material.materialName}</span>
        <span className="truncate text-xs text-subtle">{material.materialId}</span>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? 'Uploading…' : imageUrl ? 'Replace' : 'Upload'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFile(file);
          event.target.value = '';
        }}
      />
    </div>
  );
}

export function MasteryMaterialsPage() {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMasteryMaterialImages()
      .then(setImages)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load material images'))
      .finally(() => setLoading(false));
  }, []);

  function handleUploaded(materialId: string, url: string) {
    setImages((current) => ({ ...current, [materialId]: url }));
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <p className="text-sm text-danger">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        MATERIAL_GROUPS.map((group) => (
          <Panel key={group.branch} title={group.branch}>
            {group.materials.map((material) => (
              <MaterialImageRow
                key={material.materialId}
                material={material}
                imageUrl={images[material.materialId]}
                onUploaded={handleUploaded}
              />
            ))}
          </Panel>
        ))
      )}
    </div>
  );
}
