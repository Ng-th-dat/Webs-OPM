import type { MaterialCost, StatBonus } from './mastery';

export interface CoreLabLevel {
  level: number;
  effect: string;
  statBonus: StatBonus[];
  requiredMaterials: MaterialCost[];
}
