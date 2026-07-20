import type { CharacterIntelEntry, IntelConfidence, IntelStatus } from '@/types/characterIntel';
import type { TranslationKey } from '@/i18n';

export const INTEL_STATUS_LABEL_KEYS: Record<IntelStatus, TranslationKey> = {
  rumored: 'intel.status.rumored',
  confirmed: 'intel.status.confirmed',
};

export const INTEL_STATUS_STYLES: Record<IntelStatus, { badge: string; stamp: string }> = {
  rumored: { badge: 'bg-accent text-canvas', stamp: 'border-accent text-accent' },
  confirmed: { badge: 'bg-rarity-r text-canvas', stamp: 'border-rarity-r text-rarity-r' },
};

export const INTEL_CONFIDENCE_LABEL_KEYS: Record<IntelConfidence, TranslationKey> = {
  rumor: 'intel.confidence.rumor',
  likely: 'intel.confidence.likely',
  confirmed: 'intel.confidence.confirmed',
};

export const INTEL_CONFIDENCE_STYLES: Record<IntelConfidence, { badge: string; dot: string; border: string }> = {
  rumor: { badge: 'bg-subtle/20 text-subtle', dot: 'bg-subtle', border: 'border-l-subtle' },
  likely: { badge: 'bg-accent-secondary/20 text-accent-secondary', dot: 'bg-accent-secondary', border: 'border-l-accent-secondary' },
  confirmed: { badge: 'bg-rarity-r/20 text-rarity-r', dot: 'bg-rarity-r', border: 'border-l-rarity-r' },
};

const CONFIDENCE_RANK: Record<IntelConfidence, number> = { rumor: 1, likely: 2, confirmed: 3 };

export type IntelRevealLevel = 'silhouette' | 'obscured' | 'emerging' | 'clear';

/**
 * How in-focus a dossier's image should render — derived from the highest confidence reached
 * across its own hint timeline, not a separate admin-set field. A dossier with no hints yet is
 * a pure silhouette; each stronger hint brings the picture further into focus, and it snaps to
 * fully clear the moment the dossier (or a hint) is marked confirmed.
 */
export function getIntelRevealLevel(entry: Pick<CharacterIntelEntry, 'status' | 'hints'>): IntelRevealLevel {
  if (entry.status === 'confirmed') return 'clear';
  const highestRank = entry.hints.reduce((max, hint) => Math.max(max, CONFIDENCE_RANK[hint.confidence] ?? 0), 0);
  if (highestRank >= 3) return 'clear';
  if (highestRank === 2) return 'emerging';
  if (highestRank === 1) return 'obscured';
  return 'silhouette';
}

/** The dossier's own cover image, falling back to the most recent hint that has one. */
export function getIntelRevealImage(entry: Pick<CharacterIntelEntry, 'coverImage' | 'hints'>): string | undefined {
  if (entry.coverImage) return entry.coverImage;
  const withImages = [...entry.hints].filter((hint) => hint.image).sort((a, b) => b.date.localeCompare(a.date));
  return withImages[0]?.image;
}

export const INTEL_REVEAL_FILTER: Record<IntelRevealLevel, string> = {
  silhouette: 'blur-xl grayscale brightness-[0.4] contrast-125',
  obscured: 'blur-md grayscale brightness-75',
  emerging: 'blur-[3px] saturate-[0.6]',
  clear: '',
};

export const INTEL_REVEAL_LABEL_KEYS: Partial<Record<IntelRevealLevel, TranslationKey>> = {
  silhouette: 'intel.reveal.silhouette',
  obscured: 'intel.reveal.obscured',
  emerging: 'intel.reveal.emerging',
};

/** A single hint's own image is obscured by that hint's own confidence, independent of the
 * dossier-wide reveal level — an early "rumor" leak photo reads as a grainy, unconfirmed shot. */
export const INTEL_CONFIDENCE_REVEAL: Record<IntelConfidence, IntelRevealLevel> = {
  rumor: 'obscured',
  likely: 'emerging',
  confirmed: 'clear',
};
