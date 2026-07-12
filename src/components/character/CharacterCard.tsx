import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import type { Character } from '@/types/character';
import { RarityTag } from '@/components/common/RarityTag';
import { RARITY_GLOW } from '@/utils/rarity';
import { CharacterPortrait } from './CharacterPortrait';

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  const glowStyle = { '--card-glow': RARITY_GLOW[character.rarity] } as CSSProperties;

  return (
    <Link
      to={`/characters/${character.slug}`}
      style={glowStyle}
      className="group relative flex aspect-[3/4] w-full overflow-hidden rounded-card border border-border transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_45px_-18px_var(--card-glow)]"
    >
      <CharacterPortrait
        name={character.name}
        rarity={character.rarity}
        image={character.image}
        fit="cover"
        className="absolute inset-0 h-full w-full rounded-none border-0 text-6xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-canvas via-canvas/60 to-transparent"
      />

      <RarityTag rarity={character.rarity} className="absolute right-2.5 top-2.5 bg-canvas/80" />

      <h3 className="relative mt-auto line-clamp-2 px-3 py-2.5 text-sm font-extrabold italic uppercase leading-tight tracking-wide text-foreground sm:px-3.5 sm:py-3 sm:text-base lg:text-lg">
        {character.name}
      </h3>
    </Link>
  );
}
