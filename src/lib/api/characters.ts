import { supabase } from '@/lib/supabase';
import type {
  AwakeningTier,
  Character,
  CharacterFaction,
  CharacterRank,
  CoreTier,
  MetaTier,
  Passive,
  Rarity,
  ReleaseStatus,
  ReleaseTiming,
  Skill,
} from '@/types/character';

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
  meta_tier: MetaTier | null;
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
  debut_month: number | null;
  debut_year: number | null;
  debut_timing: ReleaseTiming | null;
  comeback_month: number | null;
  comeback_year: number | null;
  comeback_timing: ReleaseTiming | null;
}

function mapRowToCharacter(row: CharacterRow): Character {
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
    metaTier: row.meta_tier ?? undefined,
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
    debutMonth: row.debut_month ?? undefined,
    debutYear: row.debut_year ?? undefined,
    debutTiming: row.debut_timing ?? undefined,
    comebackMonth: row.comeback_month ?? undefined,
    comebackYear: row.comeback_year ?? undefined,
    comebackTiming: row.comeback_timing ?? undefined,
  };
}

export async function fetchCharacters(): Promise<Character[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('is_visible', true)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data as CharacterRow[]).map(mapRowToCharacter);
}

export async function fetchCharacterBySlug(slug: string): Promise<Character | null> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('slug', slug)
    .eq('is_visible', true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRowToCharacter(data as CharacterRow) : null;
}
