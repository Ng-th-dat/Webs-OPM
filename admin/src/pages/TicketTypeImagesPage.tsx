import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchTicketTypeImages, setTicketTypeImage } from '@/lib/ticketTypeImages';
import { uploadTicketTypeImage } from '@/lib/ticketTypeImageStorage';
import { ImageIcon } from '@/components/icons';

interface TicketTypeDef {
  ticketType: 'black' | 'stk' | 'topup';
  label: string;
}

const TICKET_TYPES: TicketTypeDef[] = [
  { ticketType: 'black', label: 'Black Ticket' },
  { ticketType: 'stk', label: 'STK Ticket' },
  { ticketType: 'topup', label: 'Top Up Icon' },
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

function TicketTypeImageRow({
  ticketType,
  imageUrl,
  onUploaded,
}: {
  ticketType: TicketTypeDef;
  imageUrl: string | undefined;
  onUploaded: (ticketType: 'black' | 'stk' | 'topup', url: string) => void;
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
      const url = await uploadTicketTypeImage(ticketType.ticketType, file);
      await setTicketTypeImage(ticketType.ticketType, url);
      onUploaded(ticketType.ticketType, url);
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
        <span className="truncate text-sm font-semibold text-foreground">{ticketType.label}</span>
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

export function TicketTypeImagesPage() {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTicketTypeImages()
      .then(setImages)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load ticket images'))
      .finally(() => setLoading(false));
  }, []);

  function handleUploaded(ticketType: 'black' | 'stk' | 'topup', url: string) {
    setImages((current) => ({ ...current, [ticketType]: url }));
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <p className="text-sm text-danger">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <Panel title="Ticket Icons" description="One icon per ticket type, shared across all of its sources.">
          {TICKET_TYPES.map((ticketType) => (
            <TicketTypeImageRow
              key={ticketType.ticketType}
              ticketType={ticketType}
              imageUrl={images[ticketType.ticketType]}
              onUploaded={handleUploaded}
            />
          ))}
        </Panel>
      )}
    </div>
  );
}
