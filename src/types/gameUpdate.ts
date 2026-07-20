import type { Server } from './releaseSchedule';

export type UpdateCategory = 'Update' | 'Event' | 'CnNews' | 'Maintenance';

export interface UpdateSubEvent {
  title: string;
  note?: string;
  /** ISO (YYYY-MM-DD) start/end of this sub-event — drives both the displayed date range and its live status. Optional since older JSONB rows may still lack them. */
  startDate?: string;
  endDate?: string;
}

export interface GameUpdateEntry {
  id: string;
  slug: string;
  category: UpdateCategory;
  /** Which server this applies to (CN/SEA/Global); omitted for posts that aren't server-specific. */
  server?: Server;
  date: string;
  title: string;
  description: string;
  /** Path under public/characters/<slug>/, or a Supabase Storage URL; omitted falls back to a category icon. */
  image?: string;
  /** Full sub-event schedule shown on the update's detail page (e.g. the start-of-month/mid-month event lineup). */
  events?: UpdateSubEvent[];
}
