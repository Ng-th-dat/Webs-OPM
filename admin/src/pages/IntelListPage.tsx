import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CharacterIntelEntry } from '@main/types/characterIntel';
import { deleteCharacterIntel, fetchCharacterIntelEntries } from '@/lib/characterIntel';
import { INTEL_STATUS_OPTIONS } from '@/lib/badges';
import { PencilIcon, PlusIcon, TrashIcon, ImageIcon } from '@/components/icons';
import { BadgeSelect } from '@/components/BadgeSelect';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

const STATUS_COLOR = Object.fromEntries(INTEL_STATUS_OPTIONS.map((o) => [o.value, o.color]));

function IntelThumb({ entry }: { entry: CharacterIntelEntry }) {
  const [hasError, setHasError] = useState(false);

  if (!entry.coverImage || hasError) {
    return (
      <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-xl bg-elevated text-subtle">
        <ImageIcon className="h-4 w-4" />
      </span>
    );
  }

  return (
    <img
      src={entry.coverImage}
      alt=""
      onError={() => setHasError(true)}
      className="h-10 w-14 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
    />
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
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-elevated-lg active:translate-y-0 active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4" />
            Add Dossier
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-elevated">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-subtle">
              <tr>
                <th className="px-5 pb-3 pt-5 font-semibold">Dossier</th>
                <th className="px-5 pb-3 pt-5 font-semibold">Status</th>
                <th className="px-5 pb-3 pt-5 font-semibold">Hints</th>
                <th className="px-5 pb-3 pt-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="transition-colors duration-150 hover:bg-elevated/70">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <IntelThumb entry={entry} />
                      <div>
                        <p className="font-semibold text-foreground">{entry.characterName}</p>
                        <p className="text-xs text-subtle">{entry.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold text-white"
                      style={{ backgroundColor: STATUS_COLOR[entry.status] }}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted">{entry.hints.length}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/intel/${entry.id}/edit`}
                        title="Edit dossier"
                        aria-label={`Edit ${entry.characterName}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-all duration-150 hover:-translate-y-px hover:bg-accent/10 hover:text-accent"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry)}
                        disabled={deletingId === entry.id}
                        title="Delete dossier"
                        aria-label={`Delete ${entry.characterName}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-all duration-150 hover:-translate-y-px hover:bg-danger/10 hover:text-danger disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
