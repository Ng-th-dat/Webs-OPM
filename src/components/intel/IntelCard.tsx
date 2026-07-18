import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { CharacterIntelEntry } from '@/types/characterIntel';
import { RARITY_STYLES } from '@/utils/rarity';
import { formatUpdateDate } from '@/utils/gameUpdates';
import { IntelStatusStamp } from './IntelStatusStamp';
import { IntelCoverPlaceholder } from './IntelCoverPlaceholder';
import { useTranslation } from '@/hooks/useTranslation';

interface IntelCardProps {
  entry: CharacterIntelEntry;
  className?: string;
  style?: CSSProperties;
}

export function IntelCard({ entry, className = '', style }: IntelCardProps) {
  const { t, language } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(entry.coverImage) && !imageError;

  return (
    <Link
      to={`/intel/${entry.slug}`}
      style={style}
      className={`group flex flex-col overflow-hidden rounded-card border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg hover:shadow-black/25 focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${className}`}
    >
      <div className="comic-dots relative aspect-video w-full overflow-hidden bg-elevated">
        {showImage ? (
          <img
            src={entry.coverImage}
            alt=""
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <IntelCoverPlaceholder />
        )}

        <IntelStatusStamp status={entry.status} className="absolute left-2 top-2" />

        {entry.rarityGuess && (
          <span
            className={`absolute right-1.5 top-1.5 -rotate-6 rounded-sm border bg-canvas/90 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide shadow-[0_2px_0_rgba(0,0,0,0.35)] ${RARITY_STYLES[entry.rarityGuess]}`}
          >
            {entry.rarityGuess}?
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-base font-bold text-foreground transition-colors duration-200 group-hover:text-accent">
          {entry.characterName}
        </h3>

        {(entry.roleGuess || entry.typeGuess || entry.factionGuess) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {[entry.roleGuess, entry.typeGuess, entry.factionGuess]
              .filter((value): value is string => Boolean(value))
              .map((guess) => (
                <span key={guess} className="comic-pill h-5 px-2 text-[9px]">
                  {guess}?
                </span>
              ))}
          </div>
        )}

        {entry.summary && <p className="line-clamp-2 text-sm leading-relaxed text-muted">{entry.summary}</p>}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] font-semibold text-subtle">{t('intel.hintCount', { count: entry.hints.length })}</span>
          <span className="text-[11px] font-medium text-subtle">{formatUpdateDate(entry.updatedAt.slice(0, 10), language)}</span>
        </div>
      </div>
    </Link>
  );
}
