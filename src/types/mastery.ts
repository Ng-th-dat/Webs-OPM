export interface StatBonus {
  stat: string;
  value: number;
  isPercent: boolean;
}

export interface MaterialCost {
  materialId: string;
  materialName: string;
  quantity: number;
}

export type MasteryBranch = 'type' | 'faction' | 'level';

export interface MasteryTier {
  tier: number;
  /** Cumulative ATK/DEF/HP gain at this tier, from "Not started". */
  statGain: StatBonus[];
  /** Cumulative materials needed to reach this tier, from "Not started". */
  materials: MaterialCost[];
  /** Prerequisites to unlock this tier, as free-text condition lines — the set of conditions varies per branch (e.g. Level Mastery references roster-wide counts that don't fit a fixed field shape). Optional — not every branch's data has been transcribed yet. */
  requirements?: string[];
}
