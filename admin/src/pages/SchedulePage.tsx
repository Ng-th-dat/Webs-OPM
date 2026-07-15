import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ReleaseStatus } from '@main/types/character';
import type { Server } from '@main/types/releaseSchedule';
import { deleteReleaseEntry, fetchReleaseSchedule, type AdminReleaseEntry } from '@/lib/releaseSchedule';
import { RARITY_SWATCH } from '@/lib/rarity';
import { RELEASE_TYPE_OPTIONS, SERVER_OPTIONS } from '@/lib/badges';
import { PencilIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { BadgeSelect } from '@/components/BadgeSelect';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

const STATUS_BADGE: Record<ReleaseStatus, string> = {
  Released: 'bg-success/10 text-success',
  Upcoming: 'bg-accent-info/10 text-accent-info',
  TBD: 'bg-elevated text-subtle',
};

const RELEASE_TYPE_COLOR = Object.fromEntries(RELEASE_TYPE_OPTIONS.map((o) => [o.value, o.color]));
const SERVER_COLOR = Object.fromEntries(SERVER_OPTIONS.map((o) => [o.value, o.color]));

/** The homepage shows 1 Debut + 1 Comeback per server each month — flag when that's off. */
const EXPECTED_PER_SERVER = 2;
const TRACKED_SERVERS: Server[] = ['CN', 'SEA'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return (words[0].slice(0, 1) + words[1].slice(0, 1)).toUpperCase();
}

function CharacterThumb({ entry }: { entry: AdminReleaseEntry }) {
  const [hasError, setHasError] = useState(false);
  const color = RARITY_SWATCH[entry.rarity];

  if (!entry.image || hasError) {
    return (
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
        style={{ backgroundColor: `${color}1a`, color }}
      >
        {getInitials(entry.characterName)}
      </span>
    );
  }

  return (
    <img
      src={entry.image}
      alt=""
      onError={() => setHasError(true)}
      className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
    />
  );
}

export function SchedulePage() {
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<AdminReleaseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [serverFilter, setServerFilter] = useState<string>('All');

  function load() {
    setLoading(true);
    setError(null);
    fetchReleaseSchedule()
      .then(setEntries)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load release schedule'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const years = useMemo(() => Array.from(new Set(entries.map((e) => e.year))).sort((a, b) => b - a), [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (yearFilter !== 'All' && String(entry.year) !== yearFilter) return false;
      if (serverFilter !== 'All' && entry.server !== serverFilter) return false;
      return true;
    });
  }, [entries, yearFilter, serverFilter]);

  const groups = useMemo(() => {
    const map = new Map<string, { year: number; month: number; entries: AdminReleaseEntry[] }>();
    for (const entry of filteredEntries) {
      const key = `${entry.year}-${entry.month}`;
      if (!map.has(key)) map.set(key, { year: entry.year, month: entry.month, entries: [] });
      map.get(key)!.entries.push(entry);
    }
    return Array.from(map.values()).sort((a, b) => (a.year !== b.year ? b.year - a.year : b.month - a.month));
  }, [filteredEntries]);

  async function handleDelete(entry: AdminReleaseEntry) {
    const confirmed = await confirm({
      title: 'Delete this schedule entry?',
      message: `Removes ${entry.characterName}'s ${entry.releaseType} on ${entry.server} for ${MONTH_NAMES[entry.month - 1]} ${entry.year}. This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;

    setDeletingId(entry.id);
    try {
      await deleteReleaseEntry(entry.id);
      setEntries((current) => current.filter((e) => e.id !== entry.id));
      showToast(`Deleted ${entry.characterName}'s ${entry.releaseType} entry`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete entry', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-elevated sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="text-sm font-medium text-muted">
          {loading ? 'Loading…' : `${filteredEntries.length} of ${entries.length} entries`}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <BadgeSelect
            value={serverFilter}
            onChange={setServerFilter}
            options={[{ value: 'All' }, ...SERVER_OPTIONS]}
          />
          <select
            value={yearFilter}
            onChange={(event) => setYearFilter(event.target.value)}
            className="h-9 rounded-full border border-border bg-elevated px-3.5 text-xs font-semibold text-foreground transition-colors focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/15"
          >
            <option value="All">All years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="rounded-card border border-border bg-surface p-6 text-sm text-muted shadow-elevated">Loading…</p>
      ) : error ? (
        <p className="rounded-card border border-border bg-surface p-6 text-sm text-danger shadow-elevated">{error}</p>
      ) : groups.length === 0 ? (
        <p className="rounded-card border border-border bg-surface p-6 text-sm text-muted shadow-elevated">
          No schedule entries yet. Add one to get started.
        </p>
      ) : (
        groups.map((group) => (
          <div key={`${group.year}-${group.month}`} className="rounded-card border border-border bg-surface p-4 shadow-elevated sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-bold text-foreground">
                {MONTH_NAMES[group.month - 1]} {group.year}
              </h2>
              <div className="flex items-center gap-2">
                {TRACKED_SERVERS.map((server) => {
                  const count = group.entries.filter((e) => e.server === server).length;
                  const complete = count === EXPECTED_PER_SERVER;
                  return (
                    <span
                      key={server}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        complete ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {server} {count}/{EXPECTED_PER_SERVER}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wide text-subtle">
                  <tr>
                    <th className="px-5 pb-3 pt-5 font-semibold">Character</th>
                    <th className="px-5 pb-3 pt-5 font-semibold">Server</th>
                    <th className="px-5 pb-3 pt-5 font-semibold">Release Type</th>
                    <th className="px-5 pb-3 pt-5 font-semibold">Timing</th>
                    <th className="px-5 pb-3 pt-5 font-semibold">Status</th>
                    <th className="px-5 pb-3 pt-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {group.entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className={`transition-colors duration-150 hover:bg-elevated/70 ${entry.characterIsVisible ? '' : 'opacity-50'}`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <CharacterThumb entry={entry} />
                          <div>
                            <p className="font-semibold text-foreground">{entry.characterName}</p>
                            {!entry.characterIsVisible && <p className="text-xs text-danger">Character hidden</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold text-white"
                          style={{ backgroundColor: SERVER_COLOR[entry.server] }}
                        >
                          {entry.server}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold text-white"
                          style={{ backgroundColor: RELEASE_TYPE_COLOR[entry.releaseType] }}
                        >
                          {entry.releaseType}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted">{entry.timing}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[entry.status]}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/schedule/${entry.id}/edit`}
                            title="Edit entry"
                            aria-label={`Edit ${entry.characterName} ${entry.releaseType} entry`}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-all duration-150 hover:-translate-y-px hover:bg-accent/10 hover:text-accent"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(entry)}
                            disabled={deletingId === entry.id}
                            title="Delete entry"
                            aria-label={`Delete ${entry.characterName} ${entry.releaseType} entry`}
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
          </div>
        ))
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="rounded-card border border-dashed border-border bg-surface p-10 text-center shadow-elevated">
          <p className="text-sm font-semibold text-foreground">No schedule entries yet</p>
          <p className="mt-1 text-sm text-muted">Add the first Debut or Comeback slot to get started.</p>
          <Link
            to="/schedule/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-elevated-lg active:translate-y-0 active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4" />
            Add Schedule Entry
          </Link>
        </div>
      )}
    </div>
  );
}
