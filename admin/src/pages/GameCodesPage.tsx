import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { GameCodeEntry, GameCodeStatus } from '@main/types/gameCode';
import { deleteGameCode, fetchGameCodes } from '@/lib/gameCodes';
import { PencilIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { buttonClasses } from '@/lib/buttonStyles';

const STATUS_BADGE: Record<GameCodeStatus, string> = {
  active: 'bg-accent/10 text-accent',
  expired: 'bg-elevated text-subtle',
};

export function GameCodesPage() {
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<GameCodeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchGameCodes()
      .then(setEntries)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load game codes'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(entry: GameCodeEntry) {
    const confirmed = await confirm({
      title: 'Delete this code?',
      message: `Removes "${entry.code}" for good. This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;

    setDeletingId(entry.id);
    try {
      await deleteGameCode(entry.id);
      setEntries((current) => current.filter((e) => e.id !== entry.id));
      showToast(`Deleted "${entry.code}"`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete code', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-elevated sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="text-sm font-medium text-muted">
          {loading ? 'Loading…' : `${entries.length} code${entries.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {loading ? (
        <p className="rounded-card border border-border bg-surface p-6 text-sm text-muted shadow-elevated">Loading…</p>
      ) : error ? (
        <p className="rounded-card border border-border bg-surface p-6 text-sm text-danger shadow-elevated">{error}</p>
      ) : entries.length === 0 ? (
        <div className="rounded-card border border-dashed border-border bg-surface p-10 text-center shadow-elevated">
          <p className="text-sm font-semibold text-foreground">No codes yet</p>
          <p className="mt-1 text-sm text-muted">Add one once the publisher drops a new SEA redeem code.</p>
          <Link to="/game-codes/new" className={`mt-4 inline-flex items-center gap-1.5 ${buttonClasses('primary', 'sm')}`}>
            <PlusIcon className="h-4 w-4" />
            Add Code
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-elevated transition-colors duration-150 hover:bg-elevated/50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono font-bold text-foreground">{entry.code}</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_BADGE[entry.status]}`}
                  >
                    {entry.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Link
                  to={`/game-codes/${entry.id}/edit`}
                  title="Edit code"
                  aria-label={`Edit ${entry.code}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-all duration-150 hover:-translate-y-px hover:bg-accent/10 hover:text-accent"
                >
                  <PencilIcon className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(entry)}
                  disabled={deletingId === entry.id}
                  title="Delete code"
                  aria-label={`Delete ${entry.code}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-all duration-150 hover:-translate-y-px hover:bg-danger/10 hover:text-danger disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
