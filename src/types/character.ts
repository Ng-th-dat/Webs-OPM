export type Rarity = 'UR+' | 'UR' | 'SSR+' | 'SSR' | 'SR' | 'R' | 'N';
export type ReleaseStatus = 'Upcoming' | 'Released' | 'TBD';
export type SkillType = 'Attack' | 'Ultimate' | 'Passive' | 'Awaken Passive' | 'Core';
/** Which side a character fights for. */
export type CharacterFaction = 'Hero' | 'Monster' | 'Third-party';
/** Hero Association class or monster threat level — independent of gacha `rarity`. */
export type CharacterRank = 'S-1' | 'S-2' | 'A' | 'Demon' | 'Dragon';

export interface Skill {
  name: string;
  description: string;
  skillType?: SkillType;
  /** Resource cost as shown in-game, e.g. "None" or "2 Energy". */
  cost?: string;
  /** Ultimate-only: full effect text once upgraded to 3-star. */
  upgradedDescription?: string;
  /** Path under public/characters/<slug>/, named skill-{index in skills[], 1-based}.png; falls back to a generic type icon when missing. */
  image?: string;
}

export interface Passive {
  name: string;
  description: string;
  /** Full effect text once the character reaches 5-star Gold. */
  goldDescription?: string;
  /** Full effect text once the character reaches 5-star Purple. */
  purpleDescription?: string;
  /** Path under public/characters/<slug>/passive.png, shared across all tiers; falls back to a generic type icon when missing. */
  image?: string;
}

export interface AwakeningTier {
  tier: number;
  name: string;
  description: string;
  requirement?: string;
  /** Path under public/characters/<slug>/, named awaken-{tier}.png; falls back to a generic type icon when missing. */
  image?: string;
}

/** Core-Lab tier for `role: 'Core'` characters — replaces Awakening in the skill showcase. */
export interface CoreTier {
  tier: number;
  name: string;
  description: string;
  requirement?: string;
  /** Path under public/characters/<slug>/, named core-{tier}.png; falls back to a generic type icon when missing. */
  image?: string;
}

export interface Character {
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
  /** Only shown for `rarity` SSR+/UR/UR+, and only when `role` isn't 'Core' (see `core`). */
  awakenings?: AwakeningTier[];
  /** Shown instead of `awakenings` for `role: 'Core'` characters (same SSR+/UR/UR+ rarity gate). */
  core?: CoreTier[];
  strengths: string[];
  weaknesses: string[];
  recommendedUsage: string;
  releaseVersion: string;
  releaseStatus: ReleaseStatus;
}

export interface CharacterFilterValues {
  rarity: string | null;
  type: string | null;
  faction: string | null;
  role: string | null;
}
