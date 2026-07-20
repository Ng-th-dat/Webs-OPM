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
import { buttonClasses } from '@/lib/buttonStyles';

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

/** Compact card-chip, not a full portrait card — these live nested inside a month group
    alongside a completeness check, so density matters more than trading-card theatrics. */
function ScheduleEntryCard({
  entry,
  deletingId,
  onDelete,
}: {
  entry: AdminReleaseEntry;
  deletingId: string | null;
  onDelete: (entry: AdminReleaseEntry) => void;
}) {
  const [hasError, setHasError] = useState(false);
  const color = RARITY_SWATCH[entry.rarity];
  const showImage = Boolean(entry.image) && !hasError;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border bg-elevated/40 p-3 transition-colors duration-150 hover:bg-elevated ${
        entry.characterIsVisible ? '' : 'opacity-50'
      }`}
      style={{ borderColor: `${color}40` }}
    >
      {showImage ? (
        <img
          src={entry.image}
          alt=""
          onError={() => setHasError(true)}
          className="h-11 w-11 shrink-0 rounded-lg object-cover shadow-sm"
          style={{ boxShadow: `inset 0 0 0 1px ${color}55` }}
        />
      ) : (
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          {getInitials(entry.characterName)}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{entry.characterName}</p>
        {!entry.characterIsVisible && <p className="text-[10px] font-semibold text-danger">Character hidden</p>}
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold text-canvas"
            style={{ backgroundColor: SERVER_COLOR[entry.server] }}
          >
            {entry.server}
          </span>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold text-canvas"
            style={{ backgroundColor: RELEASE_TYPE_COLOR[entry.releaseType] }}
          >
            {entry.releaseType}
          </span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_BADGE[entry.status]}`}>
            {entry.status}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-subtle">{entry.timing}</p>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1">
        <Link
          to={`/schedule/${entry.id}/edit`}
          title="Edit entry"
          aria-label={`Edit ${entry.characterName} ${entry.releaseType} entry`}
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-accent/10 hover:text-accent"
        >
          <PencilIcon className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(entry)}
          disabled={deletingId === entry.id}
          title="Delete entry"
          aria-label={`Delete ${entry.characterName} ${entry.releaseType} entry`}
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
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

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {group.entries.map((entry) => (
                <ScheduleEntryCard key={entry.id} entry={entry} deletingId={deletingId} onDelete={handleDelete} />
              ))}
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
            className={`mt-4 inline-flex items-center gap-1.5 ${buttonClasses('primary', 'sm')}`}
          >
            <PlusIcon className="h-4 w-4" />
            Add Schedule Entry
          </Link>
        </div>
      )}
    </div>
  );
}
