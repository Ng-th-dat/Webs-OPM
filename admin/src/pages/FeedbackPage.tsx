import { useEffect, useState } from 'react';
import type { FeedbackEntry } from '@main/types/feedback';
import { deleteFeedback, fetchAllFeedback } from '@/lib/feedback';
import { TrashIcon } from '@/components/icons';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function FeedbackPage() {
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchAllFeedback()
      .then(setEntries)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load feedback'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(entry: FeedbackEntry) {
    const confirmed = await confirm({
      title: 'Delete this feedback?',
      message: 'This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;

    setDeletingId(entry.id);
    try {
      await deleteFeedback(entry.id);
      setEntries((current) => current.filter((e) => e.id !== entry.id));
      showToast('Deleted feedback entry', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete feedback', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-border bg-surface p-4 shadow-elevated sm:p-5">
        <p className="text-sm font-medium text-muted">{loading ? 'Loading…' : `${entries.length} feedback entries`}</p>
      </div>

      {loading ? (
        <p className="rounded-3xl border border-border bg-surface p-6 text-sm text-muted shadow-elevated">Loading…</p>
      ) : error ? (
        <p className="rounded-3xl border border-border bg-surface p-6 text-sm text-danger shadow-elevated">{error}</p>
      ) : entries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center shadow-elevated">
          <p className="text-sm font-semibold text-foreground">No feedback yet</p>
          <p className="mt-1 text-sm text-muted">Submissions from the public /feedback form will show up here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-3xl border border-border bg-surface p-5 shadow-elevated">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-subtle">{formatDate(entry.createdAt)}</span>
                  {entry.contact && <span className="text-xs font-semibold text-accent">{entry.contact}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(entry)}
                  disabled={deletingId === entry.id}
                  title="Delete"
                  aria-label="Delete feedback"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-all duration-150 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">{entry.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
