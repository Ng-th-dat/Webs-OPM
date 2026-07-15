import type { Rarity, ReleaseStatus, ReleaseTiming } from './character';

export type { ReleaseTiming };
export type ReleaseType = 'Debut' | 'Comeback' | 'Limited' | 'Core' | 'Event';
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
