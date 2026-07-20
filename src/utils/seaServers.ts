import type { SeaServerEntry } from '@/types/seaServer';

export type SeaServerStatus = 'upcoming' | 'new' | 'established';

const NEW_WINDOW_DAYS = 7;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseOpenDate(openDate: string): Date {
  return new Date(`${openDate}T00:00:00`);
}

/** Days between today and a server's open date — negative once it's already open. */
export function getDaysUntilOpen(openDate: string, now: Date = new Date()): number {
  const diff = parseOpenDate(openDate).getTime() - startOfDay(now).getTime();
  return Math.round(diff / MS_PER_DAY);
}

/**
 * `upcoming` — hasn't opened yet, still worth a countdown.
 * `new` — opened within the last week, still the "go here for a fresh server" pick.
 * `established` — opened longer ago, kept for history only.
 */
export function getSeaServerStatus(openDate: string, now: Date = new Date()): SeaServerStatus {
  const daysUntil = getDaysUntilOpen(openDate, now);
  if (daysUntil > 0) return 'upcoming';
  if (daysUntil >= -NEW_WINDOW_DAYS) return 'new';
  return 'established';
}

/** The single nearest not-yet-open server, if any — the one worth a hero countdown. */
export function getNextSeaServer(servers: SeaServerEntry[], now: Date = new Date()): SeaServerEntry | null {
  const upcoming = servers
    .filter((server) => getDaysUntilOpen(server.openDate, now) > 0)
    .sort((a, b) => parseOpenDate(a.openDate).getTime() - parseOpenDate(b.openDate).getTime());
  return upcoming[0] ?? null;
}
