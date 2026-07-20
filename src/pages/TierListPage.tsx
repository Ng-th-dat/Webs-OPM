import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCharacters } from '@/hooks/useCharacters';
import { useTranslation } from '@/hooks/useTranslation';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { AlertTriangleIcon, StarIcon } from '@/components/common/icons';
import { META_TIER_CSS_VAR, META_TIER_ORDER } from '@/utils/metaTier';
import type { Character, MetaTier } from '@/types/character';

function TierRow({
  tier,
  characters,
  delayMs,
  reducedMotion,
}: {
  tier: MetaTier;
  characters: Character[];
  delayMs: number;
  reducedMotion: boolean;
}) {
  const { t } = useTranslation();
  const color = META_TIER_CSS_VAR[tier];
  const isTopTier = tier === 'Core';

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border-2 sm:flex-row ${
        isTopTier ? 'border-tier-core/60 shadow-[0_0_28px_-10px_var(--color-tier-core)]' : 'border-border'
      } ${reducedMotion ? '' : 'animate-rise-in'}`}
      style={reducedMotion ? undefined : { animationDelay: `${delayMs}ms` }}
    >
      <div
        className="flex shrink-0 items-center justify-center gap-2 border-b-2 bg-canvas px-4 py-3 sm:w-28 sm:flex-col sm:border-b-0 sm:border-r-2 sm:py-4"
        style={{ borderColor: color }}
      >
        <h2 className="text-2xl font-black italic leading-none" style={{ color }}>
          {tier}
        </h2>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-subtle">
          {t('tierList.characterCount', { count: characters.length })}
        </span>
      </div>

      <div className="relative flex-1 overflow-hidden bg-surface p-4">
        <div aria-hidden="true" className="comic-dots pointer-events-none absolute inset-0 opacity-[0.04]" />
        <div className="relative flex flex-wrap items-center gap-3">
          {characters.map((character) => (
            <Link
              key={character.id}
              to={`/characters/${character.slug}`}
              className="group flex flex-col items-center gap-1.5 transition-transform duration-200 hover:-translate-y-1"
            >
              <CharacterPortrait
                name={character.name}
                rarity={character.rarity}
                image={character.image}
                fit="cover"
                className="h-16 w-16 rounded-lg text-base sm:h-[72px] sm:w-[72px]"
              />
              <span className="max-w-[72px] truncate text-center text-[10px] font-semibold text-muted transition-colors duration-200 group-hover:text-foreground">
                {character.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function UnrankedRow({ characters }: { characters: Character[] }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border-2 border-dashed border-border sm:flex-row">
      <div className="flex shrink-0 items-center justify-center gap-2 border-b-2 border-dashed border-border bg-canvas px-4 py-3 sm:w-28 sm:flex-col sm:border-b-0 sm:border-r-2 sm:py-4">
        <span className="text-sm font-bold uppercase tracking-wide text-subtle">
          {t('tierList.unrankedTitle')}
        </span>
        <span className="text-[10px] font-medium text-subtle">
          {t('tierList.characterCount', { count: characters.length })}
        </span>
      </div>

      <div className="flex-1 bg-surface/60 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {characters.map((character) => (
            <Link
              key={character.id}
              to={`/characters/${character.slug}`}
              className="group flex flex-col items-center gap-1.5"
              title={t('tierList.unrankedDescription')}
            >
              <CharacterPortrait
                name={character.name}
                rarity={character.rarity}
                image={character.image}
                fit="cover"
                className="h-14 w-14 rounded-lg text-sm grayscale transition-[filter] duration-200 group-hover:grayscale-0"
              />
              <span className="max-w-[64px] truncate text-center text-[10px] text-subtle transition-colors duration-200 group-hover:text-muted">
                {character.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TierListPage() {
  const { t } = useTranslation();
  const { characters, loading, error } = useCharacters();
  const reducedMotion = useReducedMotion();

  const { byTier, unranked } = useMemo(() => {
    const map = new Map<MetaTier, Character[]>();
    const rest: Character[] = [];
    for (const character of characters) {
      if (character.metaTier) {
        const list = map.get(character.metaTier) ?? [];
        list.push(character);
        map.set(character.metaTier, list);
      } else {
        rest.push(character);
      }
    }
    return { byTier: map, unranked: rest };
  }, [characters]);

  const rankedTiersStrongestFirst = [...META_TIER_ORDER].reverse();
  const hasAnyRanked = byTier.size > 0;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
      <PageHeader
        eyebrow={t('tierList.eyebrow')}
        title={t('tierList.title')}
        description={t('tierList.description')}
        className="mb-10"
      />

      {loading ? (
        <LoadingState label={t('common.loading')} />
      ) : error ? (
        <EmptyState icon={AlertTriangleIcon} title={t('common.errorTitle')} description={t('common.errorDescription')} />
      ) : !hasAnyRanked ? (
        <EmptyState icon={StarIcon} title={t('tierList.emptyTitle')} description={t('tierList.emptyDescription')} />
      ) : (
        <div className="flex flex-col gap-4">
          {rankedTiersStrongestFirst.map((tier, index) => {
            const list = byTier.get(tier);
            if (!list || list.length === 0) return null;
            return (
              <TierRow
                key={tier}
                tier={tier}
                characters={list}
                delayMs={Math.min(index, 6) * 50}
                reducedMotion={reducedMotion}
              />
            );
          })}

          {unranked.length > 0 && <UnrankedRow characters={unranked} />}
        </div>
      )}
    </section>
  );
}
