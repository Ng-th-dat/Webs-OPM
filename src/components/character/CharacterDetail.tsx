import type { CSSProperties } from 'react';
import type { Character } from '@/types/character';
import { useTranslation } from '@/hooks/useTranslation';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { RARITY_CSS_VAR, RARITY_GLOW, RARITY_STYLES } from '@/utils/rarity';
import { META_TIER_CSS_VAR, META_TIER_ORDER, META_TIER_STYLES } from '@/utils/metaTier';
import {
  FACTION_BADGE_ICONS,
  FACTION_LABEL_KEYS,
  RANK_BADGE_ICONS,
  RANK_LABEL_KEYS,
  TYPE_BADGE_ICONS,
} from '@/utils/badges';
import { CheckIcon, XIcon } from '@/components/common/icons';
import { parseCharacterName } from '@/utils/characters';
import { CharacterGallery } from './CharacterGallery';
import { SkillShowcase } from './SkillShowcase';

interface CharacterDetailProps {
  character: Character;
}

export function CharacterDetail({ character }: CharacterDetailProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const { title, mainName } = parseCharacterName(character.name);
  const glowStyle = { '--card-glow': RARITY_GLOW[character.rarity] } as CSSProperties;
  const rarityColor = RARITY_CSS_VAR[character.rarity];
  const metaTierIndex = character.metaTier ? META_TIER_ORDER.indexOf(character.metaTier) : -1;
  const metaTierColor = character.metaTier ? META_TIER_CSS_VAR[character.metaTier] : undefined;
  const filledMetaSegments = metaTierIndex + 1;

  function reveal(delayMs: number): { className: string; style?: CSSProperties } {
    if (reducedMotion) return { className: '' };
    return { className: 'animate-rise-in', style: { animationDelay: `${delayMs}ms` } };
  }

  return (
    <article className="flex flex-col gap-12">
      <header
        style={{ ...glowStyle, borderColor: rarityColor }}
        className={`comic-panel-torn relative flex min-h-[520px] items-end overflow-hidden border-4 bg-surface shadow-[6px_6px_0_rgba(0,0,0,0.35)] ${reveal(0).className}`}
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
          className="comic-dots pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-overlay"
          style={{ color: rarityColor }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full opacity-[0.1]"
          style={{ background: `repeating-conic-gradient(${rarityColor} 0deg 4deg, transparent 4deg 12deg)` }}
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="comic-pill h-8 border border-white/15 px-3.5 text-[11px]">{character.type}</span>
            <span
              className={`-rotate-6 rounded-sm border bg-canvas/90 px-2 py-1 text-[11px] font-extrabold uppercase tracking-wide shadow-[0_2px_0_rgba(0,0,0,0.35)] ${RARITY_STYLES[character.rarity]}`}
            >
              {character.rarity}
            </span>
          </div>

          <div>
            {title && (
              <p
                className="mb-1 w-fit text-xs font-extrabold uppercase tracking-[0.25em] text-accent-secondary sm:text-sm"
                style={{ textShadow: '2px 2px 0 var(--color-canvas)' }}
              >
                {title}
              </p>
            )}
            <h1
              className="w-fit text-5xl font-black uppercase italic leading-[1.02] tracking-tight text-foreground sm:text-6xl"
              style={{ textShadow: '3px 3px 0 var(--color-canvas), 6px 6px 0 rgba(0,0,0,0.35)' }}
            >
              {mainName}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {character.tags.map((tag) => (
              <span key={tag} className="comic-pill h-7 border border-white/10 bg-elevated px-3 text-[10px] text-foreground/90">
                {tag}
              </span>
            ))}
          </div>

          <div className="comic-caption w-fit max-w-xl">
            <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent-secondary">
              {t('characterDetail.recommendedUsage')}
            </span>
            <p className="text-sm leading-relaxed text-foreground/90">{character.recommendedUsage}</p>
          </div>

          <div className="mt-1 flex flex-wrap gap-2">
            <InfoTag label={t('characters.filters.role')} value={character.role} />
            <InfoTag
              label={t('characters.filters.type')}
              value={character.type}
              icon={TYPE_BADGE_ICONS[character.type]}
            />
            <InfoTag
              label={t('characters.filters.faction')}
              value={t(FACTION_LABEL_KEYS[character.faction])}
              icon={FACTION_BADGE_ICONS[character.faction]}
            />
            <InfoTag
              label={t('characters.filters.rank')}
              value={t(RANK_LABEL_KEYS[character.rank])}
              icon={RANK_BADGE_ICONS[character.rank]}
            />
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-subtle">
              {t('characterDetail.power')}
            </span>
            {character.metaTier ? (
              <>
                <span
                  className={`-rotate-3 rounded-sm border bg-canvas/90 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide shadow-[0_2px_0_rgba(0,0,0,0.35)] ${META_TIER_STYLES[character.metaTier]}`}
                >
                  {character.metaTier}
                </span>
                <div className="flex items-center gap-1">
                  {META_TIER_ORDER.map((_, index) => {
                    const isFilled = index < filledMetaSegments;
                    const segReveal = reveal(180 + index * 30);
                    return (
                      <span
                        key={index}
                        className={`h-2.5 w-4 rounded-[2px] border border-border ${segReveal.className}`}
                        style={{
                          ...segReveal.style,
                          ...(isFilled
                            ? { backgroundColor: metaTierColor, borderColor: metaTierColor, boxShadow: `0 0 7px ${metaTierColor}` }
                            : undefined),
                        }}
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wide text-subtle">
                {t('tierList.unrankedTitle')}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className={reveal(140).className} style={reveal(140).style}>
        <SkillShowcase character={character} />
      </div>

      {(character.strengths.length > 0 || character.weaknesses.length > 0) && (
        <section
          className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${reveal(220).className}`}
          style={reveal(220).style}
        >
          {character.strengths.length > 0 && (
            <div className="comic-caption border-l-rarity-r">
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-[0.2em] text-rarity-r">
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
            <div className="comic-caption border-l-accent">
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-[0.2em] text-accent">
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
        <div className={reveal(280).className} style={reveal(280).style}>
          <CharacterGallery characterName={character.name} images={[character.image]} rarity={character.rarity} />
        </div>
      )}
    </article>
  );
}

function InfoTag({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <span
      className="comic-pill h-8 gap-1.5 border border-white/10 bg-elevated px-3 text-[10px] normal-case tracking-normal text-foreground"
      title={`${label}: ${value}`}
    >
      {icon && <img src={icon} alt="" className="h-4 w-4 object-contain" />}
      <span className="font-bold uppercase tracking-wide text-subtle">{label}:</span>
      <span className="font-extrabold">{value}</span>
    </span>
  );
}
