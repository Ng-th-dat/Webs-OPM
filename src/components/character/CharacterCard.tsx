import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import type { Character } from '@/types/character';
import { RARITY_GLOW, RARITY_STYLES } from '@/utils/rarity';
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
      className="group relative flex aspect-[3/4] w-full overflow-hidden rounded-card border-2 border-border bg-canvas p-1 transition duration-300 hover:-translate-y-1 hover:rotate-1 hover:border-accent/40 hover:shadow-[0_20px_45px_-18px_var(--card-glow)]"
    >
      <div
        className={`relative flex h-full w-full flex-1 flex-col overflow-hidden rounded-[10px] border ${RARITY_STYLES[character.rarity]}`}
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

        <span
          className={`absolute right-1.5 top-1.5 -rotate-6 rounded-sm border bg-canvas/90 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide shadow-[0_2px_0_rgba(0,0,0,0.35)] ${RARITY_STYLES[character.rarity]}`}
        >
          {character.rarity}
        </span>

        <span className="absolute left-1.5 top-1.5 max-w-[50%] truncate rounded-sm bg-canvas/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted backdrop-blur-sm">
          {character.role}
        </span>

        <h3 className="relative mt-auto line-clamp-2 px-3 py-2.5 text-sm font-extrabold italic uppercase leading-tight tracking-wide text-foreground sm:px-3.5 sm:py-3 sm:text-base lg:text-lg">
          {character.name}
        </h3>
      </div>
    </Link>
  );
}
