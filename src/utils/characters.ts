import type { Character, CharacterFilterValues, SkillType } from '@/types/character';
import type { Language, TranslationKey } from '@/i18n';
import { timingToDate } from '@/utils/releaseSchedule';

const NAME_TITLE_PATTERN = /^\[(.+?)\]\s*(.+)$/;

/** Splits a "[Title] Name" character name (an admin-entered convention for alt-costume/team
    variants, e.g. "[Heavy Vanguard] Atomic Samurai") into its title and main-name parts for
    display — names with no bracketed prefix (e.g. "Terrible Tornado") just get `title: null`. */
export function parseCharacterName(name: string): { title: string | null; mainName: string } {
  const match = name.match(NAME_TITLE_PATTERN);
  if (!match) return { title: null, mainName: name };
  return { title: match[1], mainName: match[2] };
}

export function searchCharacters(characters: Character[], query: string): Character[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return characters;

  return characters.filter((character) => {
    const haystack = [character.name, character.type, character.faction, character.role, ...character.tags]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function filterCharacters(
  characters: Character[],
  filters: CharacterFilterValues
): Character[] {
  return characters.filter((character) => {
    if (filters.rarity && character.rarity !== filters.rarity) return false;
    if (filters.type && character.type !== filters.type) return false;
    if (filters.faction && character.faction !== filters.faction) return false;
    if (filters.role && character.role !== filters.role) return false;
    return true;
  });
}

/** Newest CN debut first; characters with no debut month/year set sink to the end. */
export function sortCharactersByDebutDesc(characters: Character[]): Character[] {
  function debutTimestamp(character: Character): number {
    if (!character.debutMonth || !character.debutYear) return -Infinity;
    return timingToDate(character.debutMonth, character.debutYear, character.debutTiming ?? 'Start of Month').getTime();
  }

  return [...characters].sort((a, b) => debutTimestamp(b) - debutTimestamp(a));
}

export function getUniqueSortedValues(
  characters: Character[],
  key: 'type' | 'faction' | 'role'
): string[] {
  return Array.from(new Set(characters.map((character) => character[key]))).sort((a, b) =>
    a.localeCompare(b)
  );
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return (words[0].slice(0, 1) + words[1].slice(0, 1)).toUpperCase();
}

/** Falls back to English whenever the Vietnamese field is missing/empty — a character/field not translated yet never renders blank. */
export function pickLocalizedText(en: string | undefined, vi: string | undefined, language: Language): string | undefined {
  return language === 'vi' && vi ? vi : en;
}

export const SKILL_TYPE_STYLES: Record<SkillType, { badge: string; iconWrap: string; glow: string }> = {
  Attack: {
    badge: 'bg-accent-info/15 text-accent-info',
    iconWrap: 'border-accent-info/40 text-accent-info',
    glow: 'bg-accent-info',
  },
  Ultimate: {
    badge: 'bg-accent-secondary/15 text-accent-secondary',
    iconWrap: 'border-accent-secondary/40 text-accent-secondary',
    glow: 'bg-accent-secondary',
  },
  Passive: {
    badge: 'bg-rarity-ur/15 text-rarity-ur',
    iconWrap: 'border-rarity-ur/40 text-rarity-ur',
    glow: 'bg-rarity-ur',
  },
  'Awaken Passive': {
    badge: 'bg-accent/15 text-accent',
    iconWrap: 'border-accent/40 text-accent',
    glow: 'bg-accent',
  },
  Core: {
    badge: 'bg-rarity-sr/15 text-rarity-sr',
    iconWrap: 'border-rarity-sr/40 text-rarity-sr',
    glow: 'bg-rarity-sr',
  },
};

export const SKILL_TYPE_LABEL_KEYS: Record<SkillType, TranslationKey> = {
  Attack: 'characterDetail.skillType.attack',
  Ultimate: 'characterDetail.skillType.ultimate',
  Passive: 'characterDetail.skillType.passive',
  'Awaken Passive': 'characterDetail.skillType.awakenPassive',
  Core: 'characterDetail.skillType.core',
};
