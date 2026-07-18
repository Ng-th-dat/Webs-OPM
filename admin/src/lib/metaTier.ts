import type { MetaTier } from '@main/types/character';

// Kept local (not imported from the main app) to avoid cross-project React/JSX type
// duplication issues — see the note in tsconfig.app.json / vite.config.ts.
export const META_TIER_ORDER: MetaTier[] = ['D', 'C', 'B', 'A', 'S', 'S+', 'SS+', 'Tốc', 'Core'];

// Mirrors the tier colors in the main site's src/styles/index.css @theme block —
// keep these two in sync if the palette changes.
export const META_TIER_SWATCH: Record<MetaTier, string> = {
  D: '#6b7785',
  C: '#4fb0a5',
  B: '#5fbf6b',
  A: '#9fd23c',
  S: '#f2b807',
  'S+': '#f2870a',
  'SS+': '#f0453f',
  Tốc: '#b06bff',
  Core: '#ff4fa3',
};
