export type GameCodeStatus = 'active' | 'expired';

export interface GameCodeEntry {
  id: string;
  code: string;
  status: GameCodeStatus;
  createdAt: string;
  updatedAt: string;
}
