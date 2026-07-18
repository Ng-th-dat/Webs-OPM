import type { Rarity } from './character';

export type IntelStatus = 'rumored' | 'confirmed';

/** Confidence tag on an individual hint entry, not the dossier as a whole — a dossier accumulates hints of varying confidence over time. */
export type IntelConfidence = 'rumor' | 'likely' | 'confirmed';

export interface IntelHint {
  date: string;
  confidence: IntelConfidence;
  title: string;
  description?: string;
  image?: string;
}

export interface CharacterIntelEntry {
  id: string;
  slug: string;
  status: IntelStatus;
  /** Working/rumored name — may still change before the character is officially confirmed. */
  characterName: string;
  rarityGuess?: Rarity;
  typeGuess?: string;
  factionGuess?: string;
  roleGuess?: string;
  summary?: string;
  coverImage?: string;
  hints: IntelHint[];
  /** Set once the real character ships — links back to its slug in the confirmed database. */
  confirmedCharacterSlug?: string;
  createdAt: string;
  updatedAt: string;
}
