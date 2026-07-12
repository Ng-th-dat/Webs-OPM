import { RARITY_ORDER, RARITY_SWATCH } from './rarity';

export interface BadgeOption {
  value: string;
  icon?: string;
  color?: string;
}

// Mirrors src/utils/badges.ts's TYPE_BADGE_ICONS / FACTION_BADGE_ICONS / RANK_BADGE_ICONS on the
// main site — kept local (not cross-imported) since that file pulls in the '@/' alias, and the
// icon files themselves are duplicated into admin/public/badges/ for the same cross-app reason.
export const TYPE_OPTIONS: BadgeOption[] = [
  { value: 'Duelist', icon: '/badges/duelist.webp' },
  { value: 'Esper', icon: '/badges/esper.webp' },
  { value: 'Grappler', icon: '/badges/grappler.webp' },
  { value: 'Hi-Tech', icon: '/badges/hi-tech.webp' },
];

export const FACTION_OPTIONS: BadgeOption[] = [
  { value: 'Hero', icon: '/badges/hero.webp' },
  { value: 'Monster', icon: '/badges/monster.webp' },
  { value: 'Third-party' },
];

export const RANK_OPTIONS: BadgeOption[] = [
  { value: 'S-1', icon: '/badges/badge_s_01.webp' },
  { value: 'S-2', icon: '/badges/badge_s_02.webp' },
  { value: 'A', icon: '/badges/badge_a.webp' },
  { value: 'Demon', icon: '/badges/badge_demon.webp' },
  { value: 'Dragon', icon: '/badges/badge_dragon.webp' },
];

export const RELEASE_STATUS_OPTIONS: BadgeOption[] = [
  { value: 'Upcoming', color: '#8b5cf6' },
  { value: 'Released', color: '#22c55e' },
  { value: 'TBD', color: '#9ca3af' },
];

// The Skills panel only ever produces basic-attack or ultimate entries — Passive
// and Awaken Passive/Core skills already have their own dedicated panels below.
export const SKILL_TYPE_OPTIONS: BadgeOption[] = [{ value: 'Attack' }, { value: 'Ultimate' }];

/** `Core` here is what flips a character's Awakening panel to a Core panel — see AddCharacterPage. */
export const ROLE_OPTIONS: BadgeOption[] = [
  { value: 'DPS' },
  { value: 'Tank' },
  { value: 'Support' },
  { value: 'Core' },
  { value: 'Control' },
  { value: 'Healer' },
  { value: 'Utility' },
];

export const RARITY_OPTIONS: BadgeOption[] = RARITY_ORDER.map((rarity) => ({
  value: rarity,
  color: RARITY_SWATCH[rarity],
}));

export const SERVER_OPTIONS: BadgeOption[] = [
  { value: 'CN', color: '#8b5cf6' },
  { value: 'SEA', color: '#ec4899' },
  { value: 'Global', color: '#f97316' },
];

export const UPDATE_CATEGORY_OPTIONS: BadgeOption[] = [
  { value: 'Update', color: '#3da9fc' },
  { value: 'Event', color: '#ffb020' },
  { value: 'CnNews', color: '#a970ff' },
  { value: 'Maintenance', color: '#5c6470' },
];

export const RELEASE_TYPE_OPTIONS: BadgeOption[] = [
  { value: 'Debut', color: '#f97316' },
  { value: 'Comeback', color: '#3b82f6' },
  { value: 'Limited', color: '#dc2626' },
  { value: 'Core', color: '#14b8a6' },
  { value: 'Event', color: '#8b5cf6' },
];

export const TIMING_OPTIONS: BadgeOption[] = [
  { value: 'Start of Month' },
  { value: 'Mid Month' },
  { value: 'End of Month' },
];

export const MONTH_ABBREVIATIONS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export const MONTH_OPTIONS: BadgeOption[] = MONTH_ABBREVIATIONS.map((value) => ({ value }));
