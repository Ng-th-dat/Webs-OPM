import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CharacterIntelEntry } from '@main/types/characterIntel';
import { deleteCharacterIntel, fetchCharacterIntelEntries } from '@/lib/characterIntel';
import { INTEL_STATUS_OPTIONS } from '@/lib/badges';
import { PencilIcon, PlusIcon, TrashIcon, ImageIcon } from '@/components/icons';
import { BadgeSelect } from '@/components/BadgeSelect';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { buttonClasses } from '@/lib/buttonStyles';

const STATUS_COLOR = Object.fromEntries(INTEL_STATUS_OPTIONS.map((o) => [o.value, o.color]));

/** Trading-card treatment mirroring the public IntelCard — cover art + status stamp — but
    shown at full clarity (no blur/reveal gimmick) with admin edit/delete actions. */
function IntelCard({
  entry,
  deletingId,
  onDelete,
}: {
  entry: CharacterIntelEntry;
  deletingId: string | null;
  onDelete: (entry: CharacterIntelEntry) => void;
}) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(entry.coverImage) && !hasError;
  const color = STATUS_COLOR[entry.status];

  return (
    <div
      className="ops-bracket flex flex-col overflow-hidden rounded-card border bg-surface shadow-elevated transition-all duration-200 hover:-translate-y-1 hover:shadow-elevated-lg"
      style={{ borderColor: `${color}55` }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-elevated">
        {showImage ? (
          <img src={entry.coverImage} alt="" onError={() => setHasError(true)} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-subtle">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}

        <span
          className="absolute left-2 top-2 rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-canvas shadow-elevated"
          style={{ backgroundColor: color }}
        >
          {entry.status}
        </span>

        <div className="absolute right-2 top-2 flex items-center gap-1">
          <Link
            to={`/intel/${entry.id}/edit`}
            title="Edit dossier"
            aria-label={`Edit ${entry.characterName}`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas/70 text-foreground backdrop-blur-sm transition-colors hover:text-accent"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(entry)}
            disabled={deletingId === entry.id}
            title="Delete dossier"
            aria-label={`Delete ${entry.characterName}`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas/70 text-foreground backdrop-blur-sm transition-colors hover:text-danger disabled:opacity-50"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">{entry.characterName}</p>
          <p className="truncate text-[11px] text-subtle">{entry.slug}</p>
        </div>
        <span className="w-fit rounded-full border border-border bg-elevated px-2 py-0.5 text-[10px] font-semibold text-muted">
          {entry.hints.length} hint{entry.hints.length === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
}

export function IntelListPage() {
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<CharacterIntelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');

  function load() {
    setLoading(true);
    setError(null);
    fetchCharacterIntelEntries()
      .then(setEntries)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load dossiers'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (statusFilter !== 'All' && entry.status !== statusFilter) return false;
      return true;
    });
  }, [entries, statusFilter]);

  async function handleDelete(entry: CharacterIntelEntry) {
    const confirmed = await confirm({
      title: 'Delete this dossier?',
      message: `Removes "${entry.characterName}" from Intel. This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;

    setDeletingId(entry.id);
    try {
      await deleteCharacterIntel(entry.id);
      setEntries((current) => current.filter((e) => e.id !== entry.id));
      showToast(`Deleted "${entry.characterName}"`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete dossier', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-elevated sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="text-sm font-medium text-muted">
          {loading ? 'Loading…' : `${filteredEntries.length} of ${entries.length} dossiers`}
        </p>
        <BadgeSelect value={statusFilter} onChange={setStatusFilter} options={[{ value: 'All' }, ...INTEL_STATUS_OPTIONS]} />
      </div>

      {loading ? (
        <p className="rounded-card border border-border bg-surface p-6 text-sm text-muted shadow-elevated">Loading…</p>
      ) : error ? (
        <p className="rounded-card border border-border bg-surface p-6 text-sm text-danger shadow-elevated">{error}</p>
      ) : entries.length === 0 ? (
        <div className="rounded-card border border-dashed border-border bg-surface p-10 text-center shadow-elevated">
          <p className="text-sm font-semibold text-foreground">No dossiers yet</p>
          <p className="mt-1 text-sm text-muted">Open a case once CN starts teasing the next character.</p>
          <Link
            to="/intel/new"
            className={`mt-4 inline-flex items-center gap-1.5 ${buttonClasses('primary', 'sm')}`}
          >
            <PlusIcon className="h-4 w-4" />
            Add Dossier
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredEntries.map((entry) => (
            <IntelCard key={entry.id} entry={entry} deletingId={deletingId} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
