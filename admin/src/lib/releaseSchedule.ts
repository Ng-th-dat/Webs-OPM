import { supabase } from '@/lib/supabase';
import type { ReleaseScheduleEntry, ReleaseTiming, ReleaseType, Server } from '@main/types/releaseSchedule';
import type { CharacterFaction, Rarity, ReleaseStatus } from '@main/types/character';

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
    is_visible: boolean;
  } | null;
}

export interface AdminReleaseEntry extends ReleaseScheduleEntry {
  characterIsVisible: boolean;
}

function mapRowToEntry(row: ReleaseScheduleRow): AdminReleaseEntry | null {
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
    characterIsVisible: row.characters.is_visible,
  };
}

/** Includes entries for hidden characters too — the admin needs to see and manage everything. */
export async function fetchReleaseSchedule(): Promise<AdminReleaseEntry[]> {
  const { data, error } = await supabase
    .from('release_schedule')
    .select('*, characters(name, slug, image, rarity, type, faction, is_visible)')
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) throw error;
  return (data as ReleaseScheduleRow[])
    .map(mapRowToEntry)
    .filter((entry): entry is AdminReleaseEntry => entry !== null);
}

export async function fetchReleaseEntryById(id: string): Promise<AdminReleaseEntry | null> {
  const { data, error } = await supabase
    .from('release_schedule')
    .select('*, characters(name, slug, image, rarity, type, faction, is_visible)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRowToEntry(data as ReleaseScheduleRow) : null;
}

export interface ReleaseEntryInput {
  month: number;
  year: number;
  server: Server;
  characterId: string;
  releaseType: ReleaseType;
  timing: ReleaseTiming;
  status: ReleaseStatus;
}

export async function createReleaseEntry(input: ReleaseEntryInput): Promise<void> {
  const { error } = await supabase.from('release_schedule').insert({
    id: crypto.randomUUID(),
    month: input.month,
    year: input.year,
    server: input.server,
    character_id: input.characterId,
    release_type: input.releaseType,
    timing: input.timing,
    status: input.status,
  });
  if (error) throw error;
}

export async function updateReleaseEntry(id: string, input: ReleaseEntryInput): Promise<void> {
  const { error } = await supabase
    .from('release_schedule')
    .update({
      month: input.month,
      year: input.year,
      server: input.server,
      character_id: input.characterId,
      release_type: input.releaseType,
      timing: input.timing,
      status: input.status,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteReleaseEntry(id: string): Promise<void> {
  const { error } = await supabase.from('release_schedule').delete().eq('id', id);
  if (error) throw error;
}
