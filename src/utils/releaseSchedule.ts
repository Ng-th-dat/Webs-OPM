import type { ReleaseScheduleEntry, ReleaseTiming, ReleaseType, Server } from '@/types/releaseSchedule';
import type { ReleaseStatus } from '@/types/character';
import type { TranslationKey } from '@/i18n';

export const RELEASE_TYPE_STYLES: Record<ReleaseType, { badge: string; border: string }> = {
  Debut: { badge: 'bg-accent-secondary text-canvas', border: 'border-accent-secondary/40' },
  Comeback: { badge: 'bg-accent-info text-canvas', border: 'border-accent-info/40' },
  Limited: { badge: 'bg-accent text-canvas', border: 'border-accent/40' },
  Core: { badge: 'bg-rarity-sr text-canvas', border: 'border-rarity-sr/40' },
  Event: { badge: 'bg-rarity-ur text-canvas', border: 'border-rarity-ur/40' },
};

export const SERVER_STYLES: Record<Server, string> = {
  CN: 'bg-rarity-ur text-canvas',
  SEA: 'bg-rarity-ur-plus text-canvas',
  Global: 'bg-accent-secondary text-canvas',
};

export const RELEASE_TYPE_LABEL_KEYS: Record<ReleaseType, TranslationKey> = {
  Debut: 'releaseSchedule.releaseType.debut',
  Comeback: 'releaseSchedule.releaseType.comeback',
  Limited: 'releaseSchedule.releaseType.limited',
  Core: 'releaseSchedule.releaseType.core',
  Event: 'releaseSchedule.releaseType.event',
};

export const RELEASE_TIMING_LABEL_KEYS: Record<ReleaseTiming, TranslationKey> = {
  'Start of Month': 'releaseSchedule.timing.startOfMonth',
  'Mid Month': 'releaseSchedule.timing.midMonth',
  'End of Month': 'releaseSchedule.timing.endOfMonth',
};

export const RELEASE_STATUS_LABEL_KEYS: Record<ReleaseStatus, TranslationKey> = {
  Released: 'releaseSchedule.status.released',
  Upcoming: 'releaseSchedule.status.upcoming',
  TBD: 'releaseSchedule.status.tbd',
};

export const RELEASE_STATUS_DOT_STYLES: Record<ReleaseStatus, string> = {
  Released: 'bg-rarity-r',
  Upcoming: 'bg-accent-info',
  TBD: 'bg-subtle',
};

export const SERVER_LABEL_KEYS: Record<Server, TranslationKey> = {
  CN: 'releaseSchedule.chinaServer',
  SEA: 'releaseSchedule.seaServer',
  Global: 'releaseSchedule.globalServer',
};

export const MONTH_LABEL_KEYS: TranslationKey[] = [
  'releaseSchedule.months.january',
  'releaseSchedule.months.february',
  'releaseSchedule.months.march',
  'releaseSchedule.months.april',
  'releaseSchedule.months.may',
  'releaseSchedule.months.june',
  'releaseSchedule.months.july',
  'releaseSchedule.months.august',
  'releaseSchedule.months.september',
  'releaseSchedule.months.october',
  'releaseSchedule.months.november',
  'releaseSchedule.months.december',
];

export function getEntriesForMonth(
  entries: ReleaseScheduleEntry[],
  month: number,
  year: number,
  server: Server
): ReleaseScheduleEntry[] {
  return entries.filter(
    (entry) => entry.month === month && entry.year === year && entry.server === server
  );
}

export interface ServerSectionData {
  server: Server;
  entries: ReleaseScheduleEntry[];
}

export function getServerSectionsForMonth(
  entries: ReleaseScheduleEntry[],
  month: number,
  year: number,
  servers: Server[] = ['CN', 'SEA', 'Global']
): ServerSectionData[] {
  return servers
    .map((server) => ({ server, entries: getEntriesForMonth(entries, month, year, server) }))
    .filter((section) => section.entries.length > 0);
}

export function getAvailableYears(entries: ReleaseScheduleEntry[]): number[] {
  return Array.from(new Set(entries.map((entry) => entry.year))).sort((a, b) => b - a);
}

const TIMING_ORDER: Record<ReleaseTiming, number> = {
  'Start of Month': 0,
  'Mid Month': 1,
  'End of Month': 2,
};

export function getUpcomingEntriesForServer(
  entries: ReleaseScheduleEntry[],
  server: Server,
  limit: number
): ReleaseScheduleEntry[] {
  return entries
    .filter((entry) => entry.server === server && entry.status === 'Upcoming')
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.month !== b.month) return a.month - b.month;
      return TIMING_ORDER[a.timing] - TIMING_ORDER[b.timing];
    })
    .slice(0, limit);
}

export function getLatestMonthYear(
  entries: ReleaseScheduleEntry[]
): { month: number; year: number } | null {
  if (entries.length === 0) return null;

  return entries.reduce(
    (latest, entry) => {
      const isNewer =
        entry.year > latest.year || (entry.year === latest.year && entry.month > latest.month);
      return isNewer ? { month: entry.month, year: entry.year } : latest;
    },
    { month: entries[0].month, year: entries[0].year }
  );
}

export function formatMonthYear(month: number, year: number): string {
  return `${String(month).padStart(2, '0')} / ${year}`;
}
