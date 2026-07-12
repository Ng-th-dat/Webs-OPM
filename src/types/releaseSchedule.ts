import type { Rarity, ReleaseStatus } from './character';

export type ReleaseType = 'Debut' | 'Comeback' | 'Limited' | 'Core' | 'Event';
export type ReleaseTiming = 'Start of Month' | 'Mid Month' | 'End of Month';
export type Server = 'CN' | 'SEA' | 'Global';

export interface ReleaseScheduleEntry {
  id: string;
  month: number;
  year: number;
  server: Server;
  characterId: string;
  characterName: string;
  characterSlug: string;
  image: string;
  rarity: Rarity;
  type: string;
  faction: string;
  releaseType: ReleaseType;
  timing: ReleaseTiming;
  status: ReleaseStatus;
}
