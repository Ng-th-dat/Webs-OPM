import type { CharacterFaction, CharacterRank } from '@/types/character';
import type { TranslationKey } from '@/i18n';

const BADGE_PATH = '/badges';

/** Character `type` values (Hệ) mapped to their icon — keys must match `character.type` exactly. */
export const TYPE_BADGE_ICONS: Record<string, string> = {
  Duelist: `${BADGE_PATH}/duelist.webp`,
  Esper: `${BADGE_PATH}/esper.webp`,
  Grappler: `${BADGE_PATH}/grappler.webp`,
  'Hi-Tech': `${BADGE_PATH}/hi-tech.webp`,
};

export const FACTION_BADGE_ICONS: Record<CharacterFaction, string | undefined> = {
  Hero: `${BADGE_PATH}/hero.webp`,
  Monster: `${BADGE_PATH}/monster.webp`,
  'Third-party': undefined,
};

export const FACTION_LABEL_KEYS: Record<CharacterFaction, TranslationKey> = {
  Hero: 'characters.faction.hero',
  Monster: 'characters.faction.monster',
  'Third-party': 'characters.faction.thirdParty',
};

// Filenames are swapped from what they actually depict — badge_s_01.webp is the S-2
// insignia and vice versa (mirrors the same fix in admin/src/lib/badges.ts).
export const RANK_BADGE_ICONS: Record<CharacterRank, string> = {
  'S-1': `${BADGE_PATH}/badge_s_02.webp`,
  'S-2': `${BADGE_PATH}/badge_s_01.webp`,
  A: `${BADGE_PATH}/badge_a.webp`,
  Demon: `${BADGE_PATH}/badge_demon.webp`,
  Dragon: `${BADGE_PATH}/badge_dragon.webp`,
};

export const RANK_LABEL_KEYS: Record<CharacterRank, TranslationKey> = {
  'S-1': 'characters.rank.s1',
  'S-2': 'characters.rank.s2',
  A: 'characters.rank.a',
  Demon: 'characters.rank.demon',
  Dragon: 'characters.rank.dragon',
};
