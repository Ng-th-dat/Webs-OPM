import type { Rarity } from '@/types/character';

export const RARITY_ORDER: Rarity[] = ['UR+', 'UR', 'SSR+', 'SSR', 'SR', 'R', 'N'];

/** Only these tiers get an Awakening (or Core, for `role: 'Core'`) section — N/R/SR/SSR have neither. */
export const AWAKENING_ELIGIBLE_RARITIES: Rarity[] = ['UR+', 'UR', 'SSR+'];

export function hasAwakeningTier(rarity: Rarity): boolean {
  return AWAKENING_ELIGIBLE_RARITIES.includes(rarity);
}

export const RARITY_STYLES: Record<Rarity, string> = {
  'UR+': 'border-rarity-ur-plus/50 text-rarity-ur-plus',
  UR: 'border-rarity-ur/50 text-rarity-ur',
  'SSR+': 'border-rarity-ssr-plus/50 text-rarity-ssr-plus',
  SSR: 'border-rarity-ssr/50 text-rarity-ssr',
  SR: 'border-rarity-sr/50 text-rarity-sr',
  R: 'border-rarity-r/50 text-rarity-r',
  N: 'border-rarity-n/50 text-rarity-n',
};

/** rgba glow tint per rarity, used for dynamic hover shadows via the `--card-glow` CSS var pattern */
export const RARITY_GLOW: Record<Rarity, string> = {
  'UR+': 'rgba(232, 118, 60, 0.35)',
  UR: 'rgba(169, 112, 255, 0.35)',
  'SSR+': 'rgba(255, 176, 32, 0.35)',
  SSR: 'rgba(255, 138, 61, 0.35)',
  SR: 'rgba(34, 195, 166, 0.35)',
  R: 'rgba(107, 207, 127, 0.35)',
  N: 'rgba(138, 148, 166, 0.3)',
};

/** Solid theme color per rarity, referenced as a CSS var name (see @theme in index.css). */
export const RARITY_CSS_VAR: Record<Rarity, string> = {
  'UR+': 'var(--color-rarity-ur-plus)',
  UR: 'var(--color-rarity-ur)',
  'SSR+': 'var(--color-rarity-ssr-plus)',
  SSR: 'var(--color-rarity-ssr)',
  SR: 'var(--color-rarity-sr)',
  R: 'var(--color-rarity-r)',
  N: 'var(--color-rarity-n)',
};
