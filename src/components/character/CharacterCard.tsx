import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import type { Character } from '@/types/character';
import { RARITY_GLOW, RARITY_STYLES } from '@/utils/rarity';
import { parseCharacterName } from '@/utils/characters';
import { CharacterPortrait } from './CharacterPortrait';

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  const glowStyle = { '--card-glow': RARITY_GLOW[character.rarity] } as CSSProperties;
  const { title, mainName } = parseCharacterName(character.name);

  return (
    <Link
      to={`/characters/${character.slug}`}
      style={glowStyle}
      className="group relative flex aspect-[1080/512] w-full overflow-hidden rounded-card border-2 border-border bg-canvas p-1 transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_45px_-18px_var(--card-glow)]"
    >
      <div
        className={`relative flex h-full w-full flex-1 flex-col overflow-hidden rounded-[10px] border ${RARITY_STYLES[character.rarity]}`}
      >
        <CharacterPortrait
          name={character.name}
          rarity={character.rarity}
          image={character.image}
          fit="cover"
          vignette
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

        {/* -webkit-line-clamp stops truncating once its element is blockified as a flex item
            (Chromium reports its display as flow-root instead of -webkit-box) — the wrapper div
            takes the mt-auto/flex-item role so the clamped h3 stays a plain block child. */}
        <div className="relative mt-auto flex flex-col gap-0.5 px-3 py-2 sm:px-3.5 sm:py-2.5">
          {title && (
            <span className="truncate text-[9px] font-bold uppercase tracking-wider text-accent-secondary/90">
              {title}
            </span>
          )}
          <h3 className="truncate text-sm font-extrabold italic uppercase leading-tight tracking-wide text-foreground sm:text-base lg:text-lg">
            {mainName}
          </h3>
        </div>
      </div>
    </Link>
  );
}
