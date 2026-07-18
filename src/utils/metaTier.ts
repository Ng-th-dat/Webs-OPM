import type { MetaTier } from '@/types/character';

/** Weakest to strongest — the single source of truth for meta tier ordering everywhere. */
export const META_TIER_ORDER: MetaTier[] = ['D', 'C', 'B', 'A', 'S', 'S+', 'SS+', 'Tốc', 'Core'];

export const META_TIER_STYLES: Record<MetaTier, string> = {
  D: 'border-tier-d/50 text-tier-d',
  C: 'border-tier-c/50 text-tier-c',
  B: 'border-tier-b/50 text-tier-b',
  A: 'border-tier-a/50 text-tier-a',
  S: 'border-tier-s/50 text-tier-s',
  'S+': 'border-tier-s-plus/50 text-tier-s-plus',
  'SS+': 'border-tier-ss-plus/50 text-tier-ss-plus',
  Tốc: 'border-tier-toc/50 text-tier-toc',
  Core: 'border-tier-core/50 text-tier-core',
};

/** rgba glow tint per tier, used for hover shadows via the `--card-glow` CSS var pattern */
export const META_TIER_GLOW: Record<MetaTier, string> = {
  D: 'rgba(107, 119, 133, 0.35)',
  C: 'rgba(79, 176, 165, 0.35)',
  B: 'rgba(95, 191, 107, 0.35)',
  A: 'rgba(159, 210, 60, 0.35)',
  S: 'rgba(242, 184, 7, 0.35)',
  'S+': 'rgba(242, 135, 10, 0.35)',
  'SS+': 'rgba(240, 69, 63, 0.35)',
  Tốc: 'rgba(176, 107, 255, 0.35)',
  Core: 'rgba(255, 79, 163, 0.4)',
};

/** Solid theme color per tier, referenced as a CSS var name (see @theme in index.css). */
export const META_TIER_CSS_VAR: Record<MetaTier, string> = {
  D: 'var(--color-tier-d)',
  C: 'var(--color-tier-c)',
  B: 'var(--color-tier-b)',
  A: 'var(--color-tier-a)',
  S: 'var(--color-tier-s)',
  'S+': 'var(--color-tier-s-plus)',
  'SS+': 'var(--color-tier-ss-plus)',
  Tốc: 'var(--color-tier-toc)',
  Core: 'var(--color-tier-core)',
};
