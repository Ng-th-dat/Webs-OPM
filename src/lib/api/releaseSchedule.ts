import { supabase } from '@/lib/supabase';
import type { ReleaseScheduleEntry, ReleaseTiming, ReleaseType, Server } from '@/types/releaseSchedule';
import type { CharacterFaction, Rarity, ReleaseStatus } from '@/types/character';

interface ReleaseScheduleRow {
  id: string;
  month: number;
  year: number;
  server: Server;
  character_id: string;
  release_type: ReleaseType;
  timing: ReleaseTiming;
  status: ReleaseStatus;
  characters: {
    name: string;
    slug: string;
    image: string;
    rarity: Rarity;
    type: string;
    faction: CharacterFaction;
  } | null;
}

function mapRowToEntry(row: ReleaseScheduleRow): ReleaseScheduleEntry | null {
  if (!row.characters) return null;
  return {
    id: row.id,
    month: row.month,
    year: row.year,
    server: row.server,
    characterId: row.character_id,
    characterName: row.characters.name,
    characterSlug: row.characters.slug,
    image: row.characters.image,
    rarity: row.characters.rarity,
    type: row.characters.type,
    faction: row.characters.faction,
    releaseType: row.release_type,
    timing: row.timing,
    status: row.status,
  };
}

export async function fetchReleaseSchedule(): Promise<ReleaseScheduleEntry[]> {
  const { data, error } = await supabase
    .from('release_schedule')
    .select('*, characters!inner(name, slug, image, rarity, type, faction, is_visible)')
    .eq('characters.is_visible', true)
    .order('year', { ascending: true })
    .order('month', { ascending: true });

  if (error) throw error;
  return (data as ReleaseScheduleRow[])
    .map(mapRowToEntry)
    .filter((entry): entry is ReleaseScheduleEntry => entry !== null);
}
