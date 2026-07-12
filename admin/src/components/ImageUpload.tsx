import { useRef, useState } from 'react';
import { uploadCharacterImage } from '@/lib/storage';
import { ImageIcon } from './icons';

interface ImageUploadProps {
  slug: string;
  slot: string;
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ slug, slot, value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!slug) {
      setError('Enter a name or slug first');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const url = await uploadCharacterImage(slug, slot, file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-elevated">
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-5 w-5 text-subtle" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || !slug}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
          </button>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-xs font-semibold text-danger hover:underline"
            >
              Remove
            </button>
          )}
        </div>
        {error && <span className="text-xs text-danger">{error}</span>}
        {!slug && !error && <span className="text-xs text-subtle">Enter a name first</span>}
      </div>
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
