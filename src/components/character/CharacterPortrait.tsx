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
  /** Fades the image's edges into whatever sits behind it (an inset, canvas-colored shadow) so
      art reads as integrated into the card rather than a pasted rectangle — every source image
      has its own background color/contrast, so this keeps the crop consistent regardless. Opt-in
      since the character-detail hero/gallery already have their own edge treatment (full-bleed
      background, framed gallery panel) that a vignette would fight with. */
  vignette?: boolean;
}

export function CharacterPortrait({
  name,
  rarity,
  image,
  className = '',
  fit = 'contain',
  vignette = false,
}: CharacterPortraitProps) {
  const [hasError, setHasError] = useState(false);

  if (!image || hasError) {
    return <CharacterAvatar name={name} rarity={rarity} className={className} />;
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden border-2 bg-elevated transition-shadow duration-300 ${RARITY_STYLES[rarity]} ${className}`}
      style={vignette ? { boxShadow: 'inset 0 0 2.5rem 1rem var(--color-canvas)' } : undefined}
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
