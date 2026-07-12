import { supabase } from '@/lib/supabase';
import type { GameUpdateEntry, UpdateCategory, UpdateSubEvent } from '@main/types/gameUpdate';
import type { Server } from '@main/types/releaseSchedule';

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

export async function fetchGameUpdateById(id: string): Promise<GameUpdateEntry | null> {
  const { data, error } = await supabase.from('game_updates').select('*').eq('id', id).maybeSingle();

  if (error) throw error;
  return data ? mapRowToEntry(data as GameUpdateRow) : null;
}

export interface GameUpdateInput {
  slug: string;
  category: UpdateCategory;
  server: Server | null;
  date: string;
  title: string;
  description: string;
  image: string | null;
  events: UpdateSubEvent[];
}

export async function createGameUpdate(input: GameUpdateInput): Promise<void> {
  const { error } = await supabase.from('game_updates').insert({
    id: crypto.randomUUID(),
    slug: input.slug,
    category: input.category,
    server: input.server,
    date: input.date,
    title: input.title,
    description: input.description,
    image: input.image,
    events: input.events.length > 0 ? input.events : null,
  });
  if (error) throw error;
}

export async function updateGameUpdate(id: string, input: GameUpdateInput): Promise<void> {
  const { error } = await supabase
    .from('game_updates')
    .update({
      slug: input.slug,
      category: input.category,
      server: input.server,
      date: input.date,
      title: input.title,
      description: input.description,
      image: input.image,
      events: input.events.length > 0 ? input.events : null,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteGameUpdate(id: string): Promise<void> {
  const { error } = await supabase.from('game_updates').delete().eq('id', id);
  if (error) throw error;
}
