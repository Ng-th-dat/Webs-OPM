import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SeaServerEntry } from '@main/types/seaServer';
import { deleteSeaServer, fetchSeaServers } from '@/lib/seaServers';
import { PencilIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { buttonClasses } from '@/lib/buttonStyles';

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function statusOf(openDate: string): 'upcoming' | 'new' | 'established' {
  const diffDays = Math.round(
    (new Date(`${openDate}T00:00:00`).getTime() - new Date(new Date().toDateString()).getTime()) / 86_400_000
  );
  if (diffDays > 0) return 'upcoming';
  if (diffDays >= -7) return 'new';
  return 'established';
}

const STATUS_BADGE: Record<'upcoming' | 'new' | 'established', string> = {
  upcoming: 'bg-accent-info/10 text-accent-info',
  new: 'bg-accent/10 text-accent',
  established: 'bg-elevated text-subtle',
};

export function SeaServersPage() {
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<SeaServerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchSeaServers()
      .then(setEntries)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load server schedule'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(entry: SeaServerEntry) {
    const confirmed = await confirm({
      title: 'Delete this server entry?',
      message: `Removes "${entry.serverLabel}" from the public schedule. This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;

    setDeletingId(entry.id);
    try {
      await deleteSeaServer(entry.id);
      setEntries((current) => current.filter((e) => e.id !== entry.id));
      showToast(`Deleted "${entry.serverLabel}"`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete server entry', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-elevated sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="text-sm font-medium text-muted">
          {loading ? 'Loading…' : `${entries.length} server${entries.length === 1 ? '' : 's'} scheduled`}
        </p>
      </div>

      {loading ? (
        <p className="rounded-card border border-border bg-surface p-6 text-sm text-muted shadow-elevated">Loading…</p>
      ) : error ? (
        <p className="rounded-card border border-border bg-surface p-6 text-sm text-danger shadow-elevated">{error}</p>
      ) : entries.length === 0 ? (
        <div className="rounded-card border border-dashed border-border bg-surface p-10 text-center shadow-elevated">
          <p className="text-sm font-semibold text-foreground">No servers scheduled yet</p>
          <p className="mt-1 text-sm text-muted">Add one once the next SEA server launch is announced.</p>
          <Link to="/sea-servers/new" className={`mt-4 inline-flex items-center gap-1.5 ${buttonClasses('primary', 'sm')}`}>
            <PlusIcon className="h-4 w-4" />
            Add Server
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {entries.map((entry) => {
            const status = statusOf(entry.openDate);
            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-elevated transition-colors duration-150 hover:bg-elevated/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-foreground">{entry.serverLabel}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_BADGE[status]}`}>
                      {status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-subtle">{formatDate(entry.openDate)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/sea-servers/${entry.id}/edit`}
                    title="Edit entry"
                    aria-label={`Edit ${entry.serverLabel}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-all duration-150 hover:-translate-y-px hover:bg-accent/10 hover:text-accent"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry)}
                    disabled={deletingId === entry.id}
                    title="Delete entry"
                    aria-label={`Delete ${entry.serverLabel}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-all duration-150 hover:-translate-y-px hover:bg-danger/10 hover:text-danger disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
