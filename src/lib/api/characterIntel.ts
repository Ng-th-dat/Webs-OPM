import { supabase } from '@/lib/supabase';
import type { CharacterIntelEntry, IntelHint, IntelStatus } from '@/types/characterIntel';
import type { Rarity } from '@/types/character';

interface CharacterIntelRow {
  id: string;
  slug: string;
  status: IntelStatus;
  character_name: string;
  rarity_guess: Rarity | null;
  type_guess: string | null;
  faction_guess: string | null;
  role_guess: string | null;
  summary: string | null;
  cover_image: string | null;
  hints: IntelHint[];
  confirmed_character_slug: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToEntry(row: CharacterIntelRow): CharacterIntelEntry {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    characterName: row.character_name,
    rarityGuess: row.rarity_guess ?? undefined,
    typeGuess: row.type_guess ?? undefined,
    factionGuess: row.faction_guess ?? undefined,
    roleGuess: row.role_guess ?? undefined,
    summary: row.summary ?? undefined,
    coverImage: row.cover_image ?? undefined,
    hints: row.hints ?? [],
    confirmedCharacterSlug: row.confirmed_character_slug ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchCharacterIntelEntries(): Promise<CharacterIntelEntry[]> {
  const { data, error } = await supabase
    .from('character_intel')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data as CharacterIntelRow[]).map(mapRowToEntry);
}

export async function fetchCharacterIntelBySlug(slug: string): Promise<CharacterIntelEntry | null> {
  const { data, error } = await supabase.from('character_intel').select('*').eq('slug', slug).maybeSingle();

  if (error) throw error;
  return data ? mapRowToEntry(data as CharacterIntelRow) : null;
}
