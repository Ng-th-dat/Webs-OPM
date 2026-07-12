import type { Rarity } from '@main/types/character';

// Kept local (not imported from the main app) to avoid cross-project React/JSX type
// duplication issues — see the note in tsconfig.app.json / vite.config.ts.
export const RARITY_ORDER: Rarity[] = ['UR+', 'UR', 'SSR+', 'SSR', 'SR', 'R', 'N'];
export const AWAKENING_ELIGIBLE_RARITIES: Rarity[] = ['UR+', 'UR', 'SSR+'];

// Mirrors the rarity colors in the main site's src/styles/index.css @theme block —
// keep these two in sync if the brand palette changes.
export const RARITY_SWATCH: Record<Rarity, string> = {
  'UR+': '#e8763c',
  UR: '#a970ff',
  'SSR+': '#ffb020',
  SSR: '#ff8a3d',
  SR: '#22c3a6',
  R: '#6bcf7f',
  N: '#8a94a6',
};
