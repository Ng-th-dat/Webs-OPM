import type { Rarity } from '@/types/character';
import { RARITY_STYLES } from '@/utils/rarity';
import { getInitials } from '@/utils/characters';

interface CharacterAvatarProps {
  name: string;
  rarity: Rarity;
  className?: string;
}

export function CharacterAvatar({ name, rarity, className = '' }: CharacterAvatarProps) {
  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center border-2 bg-elevated font-extrabold ${RARITY_STYLES[rarity]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
