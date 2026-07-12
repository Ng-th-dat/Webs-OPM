import { useState } from 'react';
import type { Rarity } from '@/types/character';
import { RARITY_STYLES } from '@/utils/rarity';
import { CharacterAvatar } from './CharacterAvatar';

interface CharacterPortraitProps {
  name: string;
  rarity: Rarity;
  image?: string;
  className?: string;
  fit?: 'contain' | 'cover';
}

export function CharacterPortrait({
  name,
  rarity,
  image,
  className = '',
  fit = 'contain',
}: CharacterPortraitProps) {
  const [hasError, setHasError] = useState(false);

  if (!image || hasError) {
    return <CharacterAvatar name={name} rarity={rarity} className={className} />;
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden border-2 bg-elevated transition-shadow duration-300 ${RARITY_STYLES[rarity]} ${className}`}
    >
      <img
        src={image}
        alt={name}
        loading="lazy"
        onError={() => setHasError(true)}
        className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${fit === 'cover' ? 'object-cover' : 'object-contain'}`}
      />
    </div>
  );
}
