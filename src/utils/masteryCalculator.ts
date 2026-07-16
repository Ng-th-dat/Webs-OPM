import { MASTERY_TIERS } from '@/data/mastery';
import type { MaterialCost, StatBonus } from '@/types/mastery';
import type { MasteryCalculatorInput, MasteryCalculatorResult } from '@/types/calculator';

const ZERO_STATS: StatBonus[] = [
  { stat: 'ATK', value: 0, isPercent: false },
  { stat: 'DEF', value: 0, isPercent: false },
  { stat: 'HP', value: 0, isPercent: false },
];

/** Every tier's stat gain/materials are cumulative from "Not started". Stat gain is shown as the raw before/after value at each tier boundary; materials are the delta (straight subtraction) since they represent what still needs farming. */
export function calculateMasteryUpgrade(input: MasteryCalculatorInput): MasteryCalculatorResult {
  const tiers = MASTERY_TIERS[input.branch];
  const from = input.fromTier === 0 ? { statGain: ZERO_STATS, materials: [] as MaterialCost[] } : tiers[input.fromTier - 1];
  const to = tiers[input.toTier - 1];

  const statGain = to.statGain.map((toStat) => {
    const fromValue = from.statGain.find((s) => s.stat === toStat.stat)?.value ?? 0;
    return { stat: toStat.stat, fromValue, toValue: toStat.value };
  });

  const materials = to.materials.map((toMaterial) => {
    const fromQuantity = from.materials.find((m) => m.materialId === toMaterial.materialId)?.quantity ?? 0;
    return { ...toMaterial, quantity: toMaterial.quantity - fromQuantity };
  });

  return { statGain, materials: materials.filter((m) => m.quantity > 0) };
}
