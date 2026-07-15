import type { ReleaseScheduleEntry, ReleaseTiming, ReleaseType, Server } from '@/types/releaseSchedule';
import type { Character, Rarity, ReleaseStatus } from '@/types/character';
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

/**
 * Characters carry one entered debut/comeback month — that value is CN's timing (CN
 * releases first, so it's the value the admin actually tracks). SEA always follows 4
 * months later, so SEA's month/year is derived, never entered separately.
 */
export const SEA_LAG_MONTHS = 4;

export function shiftMonth(month: number, year: number, offsetMonths: number): { month: number; year: number } {
  const total = year * 12 + (month - 1) + offsetMonths;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 + 1 };
}

export const TIMING_DAY: Record<ReleaseTiming, number> = {
  'Start of Month': 1,
  'Mid Month': 15,
  'End of Month': 28,
};

export function timingToDate(month: number, year: number, timing: ReleaseTiming): Date {
  return new Date(year, month - 1, TIMING_DAY[timing]);
}

/** Midnight today — comparisons against `timingToDate` (also midnight) must use this, not `new Date()`, or today's own event reads as "already past" once any time has elapsed since midnight. */
export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export interface SpotlightEntry {
  key: string;
  server: Server;
  releaseType: 'Debut' | 'Comeback';
  timing: ReleaseTiming;
  date: Date;
  characterId: string;
  characterName: string;
  characterSlug: string;
  image: string;
  rarity: Rarity;
}

const SPOTLIGHT_SERVER_ORDER: Record<Server, number> = { CN: 0, SEA: 1, Global: 2 };

/**
 * Derives this month's Debut/Comeback spotlight cards straight from character records —
 * no release_schedule row needed. For each character, CN fires in its entered month;
 * SEA fires 4 months later — only entries landing in the current month are returned.
 */
export function getCurrentMonthSpotlightEntries(characters: Character[]): SpotlightEntry[] {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const entries: SpotlightEntry[] = [];

  function addIfCurrentMonth(
    character: Character,
    cnMonth: number,
    cnYear: number,
    releaseType: 'Debut' | 'Comeback',
    timing: ReleaseTiming
  ) {
    const sea = shiftMonth(cnMonth, cnYear, SEA_LAG_MONTHS);
    if (cnMonth === currentMonth && cnYear === currentYear) {
      entries.push({
        key: `${character.id}-cn-${releaseType}`,
        server: 'CN',
        releaseType,
        timing,
        date: timingToDate(cnMonth, cnYear, timing),
        characterId: character.id,
        characterName: character.name,
        characterSlug: character.slug,
        image: character.image,
        rarity: character.rarity,
      });
    }
    if (sea.month === currentMonth && sea.year === currentYear) {
      entries.push({
        key: `${character.id}-sea-${releaseType}`,
        server: 'SEA',
        releaseType,
        timing,
        date: timingToDate(sea.month, sea.year, timing),
        characterId: character.id,
        characterName: character.name,
        characterSlug: character.slug,
        image: character.image,
        rarity: character.rarity,
      });
    }
  }

  for (const character of characters) {
    if (character.debutMonth && character.debutYear) {
      addIfCurrentMonth(character, character.debutMonth, character.debutYear, 'Debut', character.debutTiming ?? 'Start of Month');
    }
    if (character.comebackMonth && character.comebackYear) {
      addIfCurrentMonth(character, character.comebackMonth, character.comebackYear, 'Comeback', character.comebackTiming ?? 'Mid Month');
    }
  }

  return entries.sort((a, b) => SPOTLIGHT_SERVER_ORDER[a.server] - SPOTLIGHT_SERVER_ORDER[b.server]);
}

/**
 * Every Debut/Comeback for a single server landing within [fromDate, toDate], sorted
 * chronologically — the Ticket Calculator timeline's event list (unlike
 * `getCurrentMonthSpotlightEntries`, which is locked to the current calendar month and
 * both servers).
 */
export function getSpotlightEntriesInRange(
  characters: Character[],
  server: Server,
  fromDate: Date,
  toDate: Date
): SpotlightEntry[] {
  const entries: SpotlightEntry[] = [];

  function addIfInRange(character: Character, cnMonth: number, cnYear: number, releaseType: 'Debut' | 'Comeback', timing: ReleaseTiming) {
    let date: Date;
    if (server === 'CN') {
      date = timingToDate(cnMonth, cnYear, timing);
    } else {
      const sea = shiftMonth(cnMonth, cnYear, SEA_LAG_MONTHS);
      date = timingToDate(sea.month, sea.year, timing);
    }
    if (date >= fromDate && date <= toDate) {
      entries.push({
        key: `${character.id}-${server.toLowerCase()}-${releaseType}`,
        server,
        releaseType,
        timing,
        date,
        characterId: character.id,
        characterName: character.name,
        characterSlug: character.slug,
        image: character.image,
        rarity: character.rarity,
      });
    }
  }

  for (const character of characters) {
    if (character.debutMonth && character.debutYear) {
      addIfInRange(character, character.debutMonth, character.debutYear, 'Debut', character.debutTiming ?? 'Start of Month');
    }
    if (character.comebackMonth && character.comebackYear) {
      addIfInRange(character, character.comebackMonth, character.comebackYear, 'Comeback', character.comebackTiming ?? 'Mid Month');
    }
  }

  return entries.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export interface UpcomingReleaseEvent {
  server: Server;
  releaseType: 'Debut' | 'Comeback';
  date: Date;
  characterName: string;
  characterSlug: string;
}

/** Earliest future Debut/Comeback across every character, for the requested server(s) — the Ticket Calculator's default target date. */
export function getNextUpcomingRelease(
  characters: Character[],
  servers: Server[] = ['CN', 'SEA']
): UpcomingReleaseEvent | null {
  const now = startOfToday();
  const candidates: UpcomingReleaseEvent[] = [];

  function addCandidates(character: Character, cnMonth: number, cnYear: number, releaseType: 'Debut' | 'Comeback', timing: ReleaseTiming) {
    if (servers.includes('CN')) {
      const cnDate = timingToDate(cnMonth, cnYear, timing);
      if (cnDate >= now) {
        candidates.push({ server: 'CN', releaseType, date: cnDate, characterName: character.name, characterSlug: character.slug });
      }
    }
    if (servers.includes('SEA')) {
      const sea = shiftMonth(cnMonth, cnYear, SEA_LAG_MONTHS);
      const seaDate = timingToDate(sea.month, sea.year, timing);
      if (seaDate >= now) {
        candidates.push({ server: 'SEA', releaseType, date: seaDate, characterName: character.name, characterSlug: character.slug });
      }
    }
  }

  for (const character of characters) {
    if (character.debutMonth && character.debutYear) {
      addCandidates(character, character.debutMonth, character.debutYear, 'Debut', character.debutTiming ?? 'Start of Month');
    }
    if (character.comebackMonth && character.comebackYear) {
      addCandidates(character, character.comebackMonth, character.comebackYear, 'Comeback', character.comebackTiming ?? 'Mid Month');
    }
  }

  candidates.sort((a, b) => a.date.getTime() - b.date.getTime());
  return candidates[0] ?? null;
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
