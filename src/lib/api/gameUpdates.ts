import { supabase } from '@/lib/supabase';
import type { GameUpdateEntry, UpdateCategory, UpdateSubEvent } from '@/types/gameUpdate';
import type { Server } from '@/types/releaseSchedule';

interface GameUpdateRow {
  id: string;
  slug: string;
  category: UpdateCategory;
  server: Server | null;
  date: string;
  title: string;
  description: string;
  image: string | null;
  events: UpdateSubEvent[] | null;
}

function mapRowToEntry(row: GameUpdateRow): GameUpdateEntry {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    server: row.server ?? undefined,
    date: row.date,
    title: row.title,
    description: row.description,
    image: row.image ?? undefined,
    events: row.events ?? undefined,
  };
}

export async function fetchGameUpdates(): Promise<GameUpdateEntry[]> {
  const { data, error } = await supabase.from('game_updates').select('*').order('date', { ascending: false });

  if (error) throw error;
  return (data as GameUpdateRow[]).map(mapRowToEntry);
}

export async function fetchGameUpdateBySlug(slug: string): Promise<GameUpdateEntry | null> {
  const { data, error } = await supabase.from('game_updates').select('*').eq('slug', slug).maybeSingle();

  if (error) throw error;
  return data ? mapRowToEntry(data as GameUpdateRow) : null;
}
