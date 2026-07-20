import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCharacterIntelEntry } from '@/hooks/useCharacterIntelEntry';
import { BackLink } from '@/components/common/BackLink';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { IntelStatusStamp } from '@/components/intel/IntelStatusStamp';
import { IntelCoverPlaceholder } from '@/components/intel/IntelCoverPlaceholder';
import { ImageLightbox } from '@/components/common/ImageLightbox';
import { SearchIcon, ArrowRightIcon } from '@/components/common/icons';
import {
  getIntelRevealImage,
  getIntelRevealLevel,
  INTEL_CONFIDENCE_LABEL_KEYS,
  INTEL_CONFIDENCE_REVEAL,
  INTEL_CONFIDENCE_STYLES,
  INTEL_REVEAL_FILTER,
  INTEL_REVEAL_LABEL_KEYS,
} from '@/utils/characterIntel';
import { formatUpdateDate } from '@/utils/gameUpdates';
import { RARITY_STYLES } from '@/utils/rarity';
import { useTranslation } from '@/hooks/useTranslation';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSeo } from '@/hooks/useSeo';
import { buildBreadcrumbJsonLd, truncateDescription } from '@/utils/seo';
import { NotFoundPage } from './NotFoundPage';

const STAGGER_STEP_MS = 90;
const STAGGER_CAP_MS = 450;

export function IntelDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useTranslation();
  const { entry, loading, error } = useCharacterIntelEntry(slug);
  const [imageError, setImageError] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; filterClass: string } | null>(null);
  const reducedMotion = useReducedMotion();

  useSeo({
    title: entry ? entry.characterName : t('intel.title'),
    description: entry ? truncateDescription(entry.summary ?? t('intel.description')) : t('intel.description'),
    image: entry?.coverImage,
    noindex: !loading && (Boolean(error) || !entry),
    jsonLd: entry
      ? buildBreadcrumbJsonLd([
          { name: t('common.home'), path: '/' },
          { name: t('intel.title'), path: '/intel' },
          { name: entry.characterName, path: `/intel/${entry.slug}` },
        ])
      : undefined,
  });

  function reveal(delayMs: number, animationClass = 'animate-rise-in'): { className: string; style?: CSSProperties } {
    if (reducedMotion) return { className: '' };
    return { className: animationClass, style: { animationDelay: `${delayMs}ms` } };
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl overflow-x-hidden px-4 py-16 sm:px-8 sm:py-20">
        <LoadingState label={t('common.loading')} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-6xl overflow-x-hidden px-4 py-16 sm:px-8 sm:py-20">
        <BackLink to="/intel">{t('common.backToIntel')}</BackLink>
        <EmptyState
          icon={SearchIcon}
          title={t('common.errorTitle')}
          description={t('common.errorDescription')}
          className="mt-8"
        />
      </section>
    );
  }

  if (!entry) {
    return <NotFoundPage />;
  }

  const revealImage = getIntelRevealImage(entry);
  const showImage = Boolean(revealImage) && !imageError;
  const revealLevel = getIntelRevealLevel(entry);
  const revealLabelKey = INTEL_REVEAL_LABEL_KEYS[revealLevel];
  const secondaryGuesses = [entry.roleGuess, entry.typeGuess, entry.factionGuess].filter(
    (value): value is string => Boolean(value)
  );
  const sortedHints = [...entry.hints].sort((a, b) => a.date.localeCompare(b.date));
  const latestHintIndex = sortedHints.length - 1;

  const stampReveal = reveal(150, 'animate-panel-slam');

  return (
    <section className="mx-auto max-w-6xl overflow-x-hidden px-4 py-16 sm:px-8 sm:py-20">
      <BackLink to="/intel">{t('common.backToIntel')}</BackLink>

      <div
        className={`comic-dots relative aspect-video w-full overflow-hidden rounded-card border-2 border-border bg-elevated ${reveal(0).className}`}
        style={reveal(0).style}
      >
        {showImage ? (
          <img
            src={revealImage}
            alt=""
            onError={() => setImageError(true)}
            className={`h-full w-full object-cover transition-[filter] duration-700 ${INTEL_REVEAL_FILTER[revealLevel]}`}
          />
        ) : (
          <IntelCoverPlaceholder size="lg" />
        )}
        <IntelStatusStamp
          status={entry.status}
          className={`absolute right-4 top-4 text-sm ${stampReveal.className}`}
          style={{ ...stampReveal.style, '--slam-rotate': '-6deg' } as CSSProperties}
        />
        {showImage && revealLabelKey && (
          <span className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-canvas/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-subtle backdrop-blur-sm">
            {t(revealLabelKey)}
          </span>
        )}
      </div>

      <div className={`mt-6 flex max-w-3xl flex-col gap-3 ${reveal(80).className}`} style={reveal(80).style}>
        <div className="flex flex-wrap items-center gap-2">
          {entry.rarityGuess && (
            <span
              className={`-rotate-2 rounded-sm border bg-canvas/90 px-2 py-1 text-[11px] font-extrabold uppercase tracking-wide shadow-[0_2px_0_rgba(0,0,0,0.35)] ${RARITY_STYLES[entry.rarityGuess]}`}
            >
              {entry.rarityGuess}?
            </span>
          )}
          {secondaryGuesses.map((guess) => (
            <span key={guess} className="comic-pill h-7 px-2.5 text-[10px]">
              {guess}?
            </span>
          ))}
          <span className="text-xs font-medium text-subtle">
            {t('intel.updatedLabel')} {formatUpdateDate(entry.updatedAt.slice(0, 10), language)}
          </span>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{entry.characterName}</h1>

        {entry.summary && <p className="text-base leading-relaxed text-muted">{entry.summary}</p>}
      </div>

      {entry.status === 'confirmed' && entry.confirmedCharacterSlug && (
        <Link
          to={`/characters/${entry.confirmedCharacterSlug}`}
          className={`comic-caption group mt-6 flex max-w-3xl items-center justify-between border-l-rarity-r transition-colors duration-200 hover:bg-canvas ${reveal(140).className}`}
          style={reveal(140).style}
        >
          <span className="text-sm font-bold text-rarity-r">{t('intel.confirmedLinkLabel')}</span>
          <ArrowRightIcon className="h-4 w-4 shrink-0 text-rarity-r transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      )}

      <div className="mt-10 flex flex-col gap-4">
        <h2 className={`comic-pill h-7 w-fit px-3 text-[11px] ${reveal(180).className}`} style={reveal(180).style}>
          {t('intel.timelineTitle')}
        </h2>

        {sortedHints.length === 0 ? (
          <p className="text-sm text-subtle">{t('intel.noHints')}</p>
        ) : (
          <div className="relative flex flex-col gap-4 border-l-2 border-border pl-6">
            {sortedHints.map((hint, index) => {
              const confidenceStyle = INTEL_CONFIDENCE_STYLES[hint.confidence];
              const hintReveal = reveal(220 + Math.min(index * STAGGER_STEP_MS, STAGGER_CAP_MS));
              return (
                <div key={`${hint.date}-${index}`} className={`relative ${hintReveal.className}`} style={hintReveal.style}>
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[1.95rem] top-4 h-3 w-3 rounded-full ring-4 ring-canvas ${confidenceStyle.dot}`}
                  />
                  <div className={`rounded-lg border border-border border-l-4 bg-surface px-4 py-3.5 ${confidenceStyle.border}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`comic-pill h-6 px-2 text-[10px] ${confidenceStyle.badge}`}>
                        {t(INTEL_CONFIDENCE_LABEL_KEYS[hint.confidence])}
                      </span>
                      {index === latestHintIndex && (
                        <span className="comic-pill h-6 bg-accent px-2 text-[10px] text-canvas">{t('intel.latestHint')}</span>
                      )}
                      <span className="text-xs text-subtle">{formatUpdateDate(hint.date, language)}</span>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-foreground">{hint.title}</p>
                    {hint.description && <p className="mt-0.5 text-sm leading-relaxed text-muted">{hint.description}</p>}
                    {hint.image && (
                      <button
                        type="button"
                        onClick={() =>
                          setLightbox({ src: hint.image ?? '', filterClass: INTEL_REVEAL_FILTER[INTEL_CONFIDENCE_REVEAL[hint.confidence]] })
                        }
                        aria-label={t('common.viewImage')}
                        className="group/image relative mt-2.5 block w-fit cursor-zoom-in overflow-hidden rounded-lg border border-border"
                      >
                        <img
                          src={hint.image}
                          alt=""
                          loading="lazy"
                          className={`max-h-64 w-auto max-w-full object-cover transition-transform duration-300 group-hover/image:scale-105 ${INTEL_REVEAL_FILTER[INTEL_CONFIDENCE_REVEAL[hint.confidence]]}`}
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-canvas/0 opacity-0 transition-all duration-200 group-hover/image:bg-canvas/40 group-hover/image:opacity-100"
                        >
                          <SearchIcon className="h-6 w-6 text-foreground" />
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ImageLightbox
        src={lightbox?.src ?? null}
        imgClassName={lightbox?.filterClass}
        onClose={() => setLightbox(null)}
      />
    </section>
  );
}
