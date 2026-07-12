import type { Rarity } from '@/types/character';
import { RARITY_STYLES } from '@/utils/rarity';

interface RarityTagProps {
  rarity: Rarity;
  className?: string;
}

export function RarityTag({ rarity, className = '' }: RarityTagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border bg-elevated px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${RARITY_STYLES[rarity]} ${className}`}
    >
      {rarity}
    </span>
  );
}
