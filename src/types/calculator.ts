import type { MasteryBranch, MaterialCost } from './mastery';
import type { TicketSource } from '@/data/ticketSources';

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

export interface TicketCalculatorInput {
  currentBlackTickets: number;
  currentStkTickets: number;
  /** This month's source ids already claimed — excluded from the projection. */
  claimedSourceIds: string[];
  targetDate: string;
}

export interface TicketCalculatorResult {
  projectedBlackTickets: number;
  projectedStkTickets: number;
  blackTicketsGained: number;
  stkTicketsGained: number;
  upcomingSources: { source: TicketSource; date: string }[];
}

export interface MasteryCalculatorInput {
  branch: MasteryBranch;
  fromTier: number;
  toTier: number;
}

export interface MasteryStatGain {
  stat: string;
  fromValue: number;
  toValue: number;
}

export interface MasteryCalculatorResult {
  statGain: MasteryStatGain[];
  materials: MaterialCost[];
}
