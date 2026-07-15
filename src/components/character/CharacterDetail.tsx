import type { CSSProperties } from 'react';
import type { Character } from '@/types/character';
import { useTranslation } from '@/hooks/useTranslation';
import { RARITY_CSS_VAR, RARITY_GLOW } from '@/utils/rarity';
import {
  FACTION_BADGE_ICONS,
  FACTION_LABEL_KEYS,
  RANK_BADGE_ICONS,
  RANK_LABEL_KEYS,
  TYPE_BADGE_ICONS,
} from '@/utils/badges';
import { CheckIcon, XIcon } from '@/components/common/icons';
import { CharacterGallery } from './CharacterGallery';
import { SkillShowcase } from './SkillShowcase';

interface CharacterDetailProps {
  character: Character;
}

export function CharacterDetail({ character }: CharacterDetailProps) {
  const { t } = useTranslation();
  const glowStyle = { '--card-glow': RARITY_GLOW[character.rarity] } as CSSProperties;

  const rarityColor = RARITY_CSS_VAR[character.rarity];

  return (
    <article className="flex flex-col gap-12">
      <header
        style={glowStyle}
        className="relative flex min-h-[520px] items-end overflow-hidden rounded-2xl border border-border bg-surface"
      >
        {character.image && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `url(${character.image})`,
              backgroundSize: 'cover',
              backgroundPosition: '50% 12%',
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{
            backgroundImage: `repeating-linear-gradient(115deg, ${rarityColor} 0px, ${rarityColor} 2px, transparent 2px, transparent 46px)`,
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, var(--color-surface) 0%, var(--color-surface) 15%, rgba(18,22,31,0.88) 28%, rgba(18,22,31,0.68) 40%, rgba(18,22,31,0.42) 52%, rgba(18,22,31,0.2) 64%, rgba(18,22,31,0.06) 76%, transparent 88%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, var(--color-surface) 0%, rgba(18,22,31,0.5) 18%, transparent 42%)',
          }}
        />

        <div className="relative flex w-full max-w-2xl flex-col gap-4 p-6 sm:p-10">
          <span
            className="relative inline-flex w-fit items-center px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-canvas"
            style={{
              clipPath: 'polygon(8% 0, 100% 0, 92% 100%, 0% 100%)',
              background: 'linear-gradient(120deg, var(--color-accent-secondary), var(--color-accent))',
            }}
          >
            {character.type}
          </span>

          <h1
            className="w-fit bg-clip-text text-5xl font-black italic leading-[1.02] tracking-tight text-transparent sm:text-6xl"
            style={{
              backgroundImage: 'linear-gradient(115deg, #ffffff 0%, #ffffff 78%, var(--color-accent-secondary) 100%)',
              filter:
                'drop-shadow(0 2px 2px rgba(0,0,0,0.9)) drop-shadow(0 4px 10px rgba(0,0,0,0.7)) drop-shadow(0 6px 20px var(--card-glow))',
            }}
          >
            {character.name}
          </h1>

          <div className="flex flex-wrap gap-2">
            {character.tags.map((tag) => (
              <TagChip key={tag}>{tag}</TagChip>
            ))}
          </div>

          <div
            className="relative w-fit max-w-xl py-3 pl-4 pr-5"
            style={{
              clipPath: 'polygon(1.5% 0, 100% 0, 98.5% 100%, 0 100%)',
              background: 'linear-gradient(100deg, rgba(10,14,20,0.82), rgba(10,14,20,0.42))',
              borderLeft: '3px solid var(--color-accent-secondary)',
            }}
          >
            <p className="text-sm leading-relaxed text-foreground/90">{character.recommendedUsage}</p>
          </div>

          <div className="mt-1 flex flex-wrap gap-3">
            <InfoBadge label={t('characters.filters.role')} value={character.role} delay="0s" />
            <InfoBadge
              label={t('characters.filters.type')}
              value={character.type}
              icon={TYPE_BADGE_ICONS[character.type]}
              delay="0.5s"
            />
            <InfoBadge
              label={t('characters.filters.faction')}
              value={t(FACTION_LABEL_KEYS[character.faction])}
              icon={FACTION_BADGE_ICONS[character.faction]}
              delay="1s"
            />
            <InfoBadge
              label={t('characters.filters.rank')}
              value={t(RANK_LABEL_KEYS[character.rank])}
              icon={RANK_BADGE_ICONS[character.rank]}
              delay="1.5s"
            />
          </div>

          <div
            className="relative -ml-6 mt-2 inline-flex w-fit items-center gap-3 overflow-hidden py-3 pl-6 pr-9 sm:-ml-10 sm:pl-10"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0% 100%)',
              background: `linear-gradient(100deg, var(--color-canvas) 0%, ${rarityColor} 62%, ${rarityColor} 100%)`,
              boxShadow: '0 10px 28px -10px var(--card-glow)',
            }}
          >
            <span
              className="text-2xl font-black italic tracking-tight text-white sm:text-3xl"
              style={{
                WebkitTextStroke: '1px rgba(0,0,0,0.35)',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              {character.rarity}
            </span>
            <span className="h-7 w-px bg-white/30" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/90">
              {t('characters.filters.tier')}
            </span>
            <span
              aria-hidden="true"
              className="animate-badge-shimmer pointer-events-none absolute inset-0"
              style={{
                background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)',
              }}
            />
          </div>
        </div>
      </header>

      <SkillShowcase character={character} />

      {(character.strengths.length > 0 || character.weaknesses.length > 0) && (
        <section className="grid grid-cols-1 gap-8 rounded-3xl border border-border bg-surface p-6 sm:grid-cols-2 sm:p-8">
          {character.strengths.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-rarity-r">
                {t('characterDetail.strengths')}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {character.strengths.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-rarity-r" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {character.weaknesses.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-accent">
                {t('characterDetail.weaknesses')}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {character.weaknesses.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                    <XIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {character.image && (
        <CharacterGallery
          characterName={character.name}
          images={[character.image]}
          rarity={character.rarity}
        />
      )}
    </article>
  );
}

function TagChip({ children }: { children: string }) {
  return (
    <span
      className="relative inline-flex w-fit items-center px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-foreground/90"
      style={{
        clipPath: 'polygon(6% 0, 100% 0, 94% 100%, 0% 100%)',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.14)',
      }}
    >
      {children}
    </span>
  );
}

function InfoBadge({
  label,
  value,
  icon,
  delay = '0s',
}: {
  label: string;
  value: string;
  icon?: string;
  delay?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2" title={value}>
      <span
        className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
        style={{
          background:
            'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.14), transparent 55%), linear-gradient(155deg, var(--color-elevated), var(--color-canvas) 65%)',
          boxShadow:
            '0 0 0 1px rgba(255,255,255,0.07), 0 0 0 2.5px var(--card-glow), 0 10px 22px -8px var(--card-glow), inset 0 1px 1px rgba(255,255,255,0.12), inset 0 -2px 4px rgba(0,0,0,0.5)',
        }}
      >
        <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full">
          {icon ? (
            <img
              src={icon}
              alt={value}
              className="h-9 w-9 object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]"
            />
          ) : (
            <span className="text-xs font-extrabold text-foreground">{value}</span>
          )}
          <span
            aria-hidden="true"
            className="animate-badge-shimmer pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)',
              animationDelay: delay,
            }}
          />
        </span>
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
        {label}
      </span>
    </div>
  );
}
