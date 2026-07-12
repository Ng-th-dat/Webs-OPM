import type { MaterialCost } from './mastery';

export interface SpecCalculatorInput {
  baseAtk: number;
  baseDef: number;
  currentLevel: number;
  targetLevel: number;
  enhancementBonus?: number;
}

export interface SpecCalculatorResult {
  finalAtk: number;
  finalDef: number;
  atkGain: number;
  defGain: number;
}

export interface CoreLabCalculatorInput {
  currentLevel: number;
  targetLevel: number;
}

export interface CoreLabCalculatorResult {
  totalMaterials: MaterialCost[];
  totalLevelsToUpgrade: number;
}
