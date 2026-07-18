import { supabase } from '@/lib/supabase';
import type { CharacterIntelEntry, IntelHint, IntelStatus } from '@main/types/characterIntel';
import type { Rarity } from '@main/types/character';

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

export async function fetchCharacterIntelById(id: string): Promise<CharacterIntelEntry | null> {
  const { data, error } = await supabase.from('character_intel').select('*').eq('id', id).maybeSingle();

  if (error) throw error;
  return data ? mapRowToEntry(data as CharacterIntelRow) : null;
}

export interface CharacterIntelInput {
  slug: string;
  status: IntelStatus;
  characterName: string;
  rarityGuess: Rarity | null;
  typeGuess: string | null;
  factionGuess: string | null;
  roleGuess: string | null;
  summary: string | null;
  coverImage: string | null;
  hints: IntelHint[];
  confirmedCharacterSlug: string | null;
}

function toRow(input: CharacterIntelInput) {
  return {
    slug: input.slug,
    status: input.status,
    character_name: input.characterName,
    rarity_guess: input.rarityGuess,
    type_guess: input.typeGuess,
    faction_guess: input.factionGuess,
    role_guess: input.roleGuess,
    summary: input.summary,
    cover_image: input.coverImage,
    hints: input.hints,
    confirmed_character_slug: input.confirmedCharacterSlug,
  };
}

export async function createCharacterIntel(input: CharacterIntelInput): Promise<void> {
  const { error } = await supabase.from('character_intel').insert({ id: crypto.randomUUID(), ...toRow(input) });
  if (error) throw error;
}

export async function updateCharacterIntel(id: string, input: CharacterIntelInput): Promise<void> {
  const { error } = await supabase.from('character_intel').update(toRow(input)).eq('id', id);
  if (error) throw error;
}

export async function deleteCharacterIntel(id: string): Promise<void> {
  const { error } = await supabase.from('character_intel').delete().eq('id', id);
  if (error) throw error;
}
