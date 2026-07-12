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

export interface MasteryLevel {
  level: number;
  statBonus: StatBonus[];
  requiredMaterials: MaterialCost[];
  notes?: string;
}
