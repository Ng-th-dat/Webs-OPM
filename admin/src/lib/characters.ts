import { supabase } from '@/lib/supabase';
import type {
  AwakeningTier,
  Character,
  CharacterFaction,
  CharacterRank,
  CoreTier,
  Passive,
  Rarity,
  ReleaseStatus,
  ReleaseTiming,
  Skill,
} from '@main/types/character';

export interface AdminCharacter extends Character {
  isVisible: boolean;
}

interface CharacterRow {
  id: string;
  name: string;
  slug: string;
  image: string;
  rarity: Rarity;
  type: string;
  faction: CharacterFaction;
  rank: CharacterRank;
  role: string;
  tags: string[];
  skills: Skill[];
  passive: Passive;
  awakenings: AwakeningTier[] | null;
  core: CoreTier[] | null;
  strengths: string[];
  weaknesses: string[];
  recommended_usage: string;
  release_version: string;
  release_status: ReleaseStatus;
  is_visible: boolean;
  debut_month: number | null;
  debut_year: number | null;
  debut_timing: ReleaseTiming | null;
  comeback_month: number | null;
  comeback_year: number | null;
  comeback_timing: ReleaseTiming | null;
}

function mapRowToCharacter(row: CharacterRow): AdminCharacter {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: row.image,
    rarity: row.rarity,
    type: row.type,
    faction: row.faction,
    rank: row.rank,
    role: row.role,
    tags: row.tags,
    skills: row.skills,
    passive: row.passive,
    awakenings: row.awakenings ?? undefined,
    core: row.core ?? undefined,
    strengths: row.strengths,
    weaknesses: row.weaknesses,
    recommendedUsage: row.recommended_usage,
    releaseVersion: row.release_version,
    releaseStatus: row.release_status,
    isVisible: row.is_visible,
    debutMonth: row.debut_month ?? undefined,
    debutYear: row.debut_year ?? undefined,
    debutTiming: row.debut_timing ?? undefined,
    comebackMonth: row.comeback_month ?? undefined,
    comebackYear: row.comeback_year ?? undefined,
    comebackTiming: row.comeback_timing ?? undefined,
  };
}

/** Includes hidden characters — the admin list is where they get managed/restored. */
export async function fetchCharacters(): Promise<AdminCharacter[]> {
  const { data, error } = await supabase.from('characters').select('*').order('name', { ascending: true });
  if (error) throw error;
  return (data as CharacterRow[]).map(mapRowToCharacter);
}

export async function fetchCharacterById(id: string): Promise<AdminCharacter | null> {
  const { data, error } = await supabase.from('characters').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRowToCharacter(data as CharacterRow) : null;
}

export interface NewCharacterInput {
  name: string;
  slug: string;
  image: string;
  rarity: Rarity;
  type: string;
  faction: CharacterFaction;
  rank: CharacterRank;
  role: string;
  tags: string[];
  skills: Skill[];
  passive: Passive;
  awakenings?: AwakeningTier[];
  core?: CoreTier[];
  strengths: string[];
  weaknesses: string[];
  recommendedUsage: string;
  releaseVersion: string;
  releaseStatus: ReleaseStatus;
  debutMonth: number | null;
  debutYear: number | null;
  debutTiming: ReleaseTiming | null;
  comebackMonth: number | null;
  comebackYear: number | null;
  comebackTiming: ReleaseTiming | null;
}

export async function createCharacter(input: NewCharacterInput): Promise<Character> {
  const { data, error } = await supabase
    .from('characters')
    .insert({
      id: input.slug,
      name: input.name,
      slug: input.slug,
      image: input.image,
      rarity: input.rarity,
      type: input.type,
      faction: input.faction,
      rank: input.rank,
      role: input.role,
      tags: input.tags,
      skills: input.skills,
      passive: input.passive,
      awakenings: input.awakenings ?? null,
      core: input.core ?? null,
      strengths: input.strengths,
      weaknesses: input.weaknesses,
      recommended_usage: input.recommendedUsage,
      release_version: input.releaseVersion,
      release_status: input.releaseStatus,
      debut_month: input.debutMonth,
      debut_year: input.debutYear,
      debut_timing: input.debutTiming,
      comeback_month: input.comebackMonth,
      comeback_year: input.comebackYear,
      comeback_timing: input.comebackTiming,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapRowToCharacter(data as CharacterRow);
}

export async function updateCharacter(id: string, input: NewCharacterInput): Promise<Character> {
  const { data, error } = await supabase
    .from('characters')
    .update({
      name: input.name,
      image: input.image,
      rarity: input.rarity,
      type: input.type,
      faction: input.faction,
      rank: input.rank,
      role: input.role,
      tags: input.tags,
      skills: input.skills,
      passive: input.passive,
      awakenings: input.awakenings ?? null,
      core: input.core ?? null,
      strengths: input.strengths,
      weaknesses: input.weaknesses,
      recommended_usage: input.recommendedUsage,
      release_version: input.releaseVersion,
      release_status: input.releaseStatus,
      debut_month: input.debutMonth,
      debut_year: input.debutYear,
      debut_timing: input.debutTiming,
      comeback_month: input.comebackMonth,
      comeback_year: input.comebackYear,
      comeback_timing: input.comebackTiming,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapRowToCharacter(data as CharacterRow);
}

/** Soft delete: hides the character from the public site without touching the row. */
export async function setCharacterVisibility(id: string, isVisible: boolean): Promise<void> {
  const { error } = await supabase.from('characters').update({ is_visible: isVisible }).eq('id', id);
  if (error) throw error;
}
