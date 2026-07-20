import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { GameUpdateEntry } from '@main/types/gameUpdate';
import { deleteGameUpdate, fetchGameUpdates } from '@/lib/gameUpdates';
import { SERVER_OPTIONS, UPDATE_CATEGORY_OPTIONS } from '@/lib/badges';
import { PencilIcon, PlusIcon, TrashIcon, ImageIcon } from '@/components/icons';
import { BadgeSelect } from '@/components/BadgeSelect';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { buttonClasses } from '@/lib/buttonStyles';

const CATEGORY_COLOR = Object.fromEntries(UPDATE_CATEGORY_OPTIONS.map((o) => [o.value, o.color]));
const SERVER_COLOR = Object.fromEntries(SERVER_OPTIONS.map((o) => [o.value, o.color]));

/** Trading-card treatment mirroring the public UpdateCard — banner-forward, category-colored
    accent — so scanning the feed here feels the same as the site it's publishing to. */
function UpdateCard({
  entry,
  deletingId,
  onDelete,
}: {
  entry: GameUpdateEntry;
  deletingId: string | null;
  onDelete: (entry: GameUpdateEntry) => void;
}) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(entry.image) && !hasError;
  const color = CATEGORY_COLOR[entry.category];

  return (
    <div
      className="ops-bracket flex flex-col overflow-hidden rounded-card border bg-surface shadow-elevated transition-all duration-200 hover:-translate-y-1 hover:shadow-elevated-lg"
      style={{ borderColor: `${color}55` }}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-elevated">
        {showImage ? (
          <img src={entry.image} alt="" onError={() => setHasError(true)} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-subtle">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-wrap items-center gap-1">
          <span
            className="rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-canvas shadow-elevated"
            style={{ backgroundColor: color }}
          >
            {entry.category}
          </span>
          {entry.server && (
            <span
              className="rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-canvas shadow-elevated"
              style={{ backgroundColor: SERVER_COLOR[entry.server] }}
            >
              {entry.server}
            </span>
          )}
        </div>

        <div className="absolute right-2 top-2 flex items-center gap-1">
          <Link
            to={`/updates/${entry.id}/edit`}
            title="Edit update"
            aria-label={`Edit ${entry.title}`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas/70 text-foreground backdrop-blur-sm transition-colors hover:text-accent"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(entry)}
            disabled={deletingId === entry.id}
            title="Delete update"
            aria-label={`Delete ${entry.title}`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas/70 text-foreground backdrop-blur-sm transition-colors hover:text-danger disabled:opacity-50"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {/* line-clamp only truncates on a plain block, not a flex item directly */}
        <div>
          <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground">{entry.title}</p>
        </div>
        <p className="text-[11px] text-subtle">{entry.date}</p>
      </div>
    </div>
  );
}

export function UpdatesListPage() {
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<GameUpdateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [serverFilter, setServerFilter] = useState('All');

  function load() {
    setLoading(true);
    setError(null);
    fetchGameUpdates()
      .then(setEntries)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load updates'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (categoryFilter !== 'All' && entry.category !== categoryFilter) return false;
      if (serverFilter !== 'All' && entry.server !== serverFilter) return false;
      return true;
    });
  }, [entries, categoryFilter, serverFilter]);

  async function handleDelete(entry: GameUpdateEntry) {
    const confirmed = await confirm({
      title: 'Delete this update?',
      message: `Removes "${entry.title}" from the feed. This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;

    setDeletingId(entry.id);
    try {
      await deleteGameUpdate(entry.id);
      setEntries((current) => current.filter((e) => e.id !== entry.id));
      showToast(`Deleted "${entry.title}"`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete update', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-elevated sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="text-sm font-medium text-muted">
          {loading ? 'Loading…' : `${filteredEntries.length} of ${entries.length} updates`}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <BadgeSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[{ value: 'All' }, ...UPDATE_CATEGORY_OPTIONS]}
          />
          <BadgeSelect
            value={serverFilter}
            onChange={setServerFilter}
            options={[{ value: 'All' }, ...SERVER_OPTIONS]}
          />
        </div>
      </div>

      {loading ? (
        <p className="rounded-card border border-border bg-surface p-6 text-sm text-muted shadow-elevated">Loading…</p>
      ) : error ? (
        <p className="rounded-card border border-border bg-surface p-6 text-sm text-danger shadow-elevated">{error}</p>
      ) : entries.length === 0 ? (
        <div className="rounded-card border border-dashed border-border bg-surface p-10 text-center shadow-elevated">
          <p className="text-sm font-semibold text-foreground">No updates yet</p>
          <p className="mt-1 text-sm text-muted">Upload a banner image and let AI draft the first post.</p>
          <Link
            to="/updates/new"
            className={`mt-4 inline-flex items-center gap-1.5 ${buttonClasses('primary', 'sm')}`}
          >
            <PlusIcon className="h-4 w-4" />
            Add Update
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEntries.map((entry) => (
            <UpdateCard key={entry.id} entry={entry} deletingId={deletingId} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
