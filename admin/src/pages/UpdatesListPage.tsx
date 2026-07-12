import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { GameUpdateEntry } from '@main/types/gameUpdate';
import { deleteGameUpdate, fetchGameUpdates } from '@/lib/gameUpdates';
import { SERVER_OPTIONS, UPDATE_CATEGORY_OPTIONS } from '@/lib/badges';
import { PencilIcon, PlusIcon, TrashIcon, ImageIcon } from '@/components/icons';
import { BadgeSelect } from '@/components/BadgeSelect';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

const CATEGORY_COLOR = Object.fromEntries(UPDATE_CATEGORY_OPTIONS.map((o) => [o.value, o.color]));
const SERVER_COLOR = Object.fromEntries(SERVER_OPTIONS.map((o) => [o.value, o.color]));

function UpdateThumb({ entry }: { entry: GameUpdateEntry }) {
  const [hasError, setHasError] = useState(false);

  if (!entry.image || hasError) {
    return (
      <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-xl bg-elevated text-subtle">
        <ImageIcon className="h-4 w-4" />
      </span>
    );
  }

  return (
    <img
      src={entry.image}
      alt=""
      onError={() => setHasError(true)}
      className="h-10 w-14 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
    />
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
      <div className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-4 shadow-elevated sm:flex-row sm:items-center sm:justify-between sm:p-5">
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
        <p className="rounded-3xl border border-border bg-surface p-6 text-sm text-muted shadow-elevated">Loading…</p>
      ) : error ? (
        <p className="rounded-3xl border border-border bg-surface p-6 text-sm text-danger shadow-elevated">{error}</p>
      ) : entries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center shadow-elevated">
          <p className="text-sm font-semibold text-foreground">No updates yet</p>
          <p className="mt-1 text-sm text-muted">Upload a banner image and let AI draft the first post.</p>
          <Link
            to="/updates/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-hover))] px-4 py-2 text-sm font-semibold text-white shadow-glow-accent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated-lg active:translate-y-0 active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4" />
            Add Update
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-surface p-4 shadow-elevated sm:p-5">
          <div className="flex flex-col gap-2">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-elevated/50 p-3"
              >
                <UpdateThumb entry={entry} />
                <div className="min-w-[10rem] flex-1">
                  <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                  <p className="text-xs text-subtle">{entry.date}</p>
                </div>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: CATEGORY_COLOR[entry.category] }}
                >
                  {entry.category}
                </span>
                {entry.server && (
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold text-white"
                    style={{ backgroundColor: SERVER_COLOR[entry.server] }}
                  >
                    {entry.server}
                  </span>
                )}
                <div className="ml-auto flex items-center gap-1.5">
                  <Link
                    to={`/updates/${entry.id}/edit`}
                    title="Edit update"
                    aria-label={`Edit ${entry.title}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-all duration-150 hover:-translate-y-px hover:bg-accent/10 hover:text-accent"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry)}
                    disabled={deletingId === entry.id}
                    title="Delete update"
                    aria-label={`Delete ${entry.title}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-all duration-150 hover:-translate-y-px hover:bg-danger/10 hover:text-danger disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
