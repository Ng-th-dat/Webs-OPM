import type { IntelConfidence, IntelStatus } from '@/types/characterIntel';
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
