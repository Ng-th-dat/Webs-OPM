import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  getCurrentMonthSpotlightEntries,
  MONTH_LABEL_KEYS,
  RELEASE_TIMING_LABEL_KEYS,
  RELEASE_TYPE_LABEL_KEYS,
  RELEASE_TYPE_STYLES,
  SERVER_LABEL_KEYS,
  SERVER_STYLES,
  type SpotlightEntry,
} from '@/utils/releaseSchedule';
import { RARITY_ORDER, RARITY_STYLES } from '@/utils/rarity';
import { parseCharacterName } from '@/utils/characters';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { VortexRing } from './VortexRing';
import { AlertTriangleIcon, ArrowRightIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { useCharacters } from '@/hooks/useCharacters';
import { useCharacterIntel } from '@/hooks/useCharacterIntel';
import { useCountUp } from '@/hooks/useCountUp';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { TranslationKey } from '@/i18n';

const HEADLINE_ACCENT = 'One Punch Man';

const EMBERS = [
  { left: '6%', size: 3, delay: '0s', duration: '7s' },
  { left: '18%', size: 2, delay: '1.6s', duration: '9s' },
  { left: '34%', size: 4, delay: '3s', duration: '8s' },
  { left: '60%', size: 2, delay: '0.8s', duration: '10s' },
  { left: '78%', size: 3, delay: '2.2s', duration: '7.5s' },
  { left: '92%', size: 2, delay: '4s', duration: '8.5s' },
];

/** Saitama's only current art asset is a 21.8MB animated GIF — far too heavy to sit above the fold. Excluded until a lighter asset exists. */
const HERO_EXCLUDED_SLUGS = new Set(['saitama']);
const PANEL_ROTATIONS = ['-6deg', '4deg', '-3deg', '5deg'];
const BADGE_ROTATIONS = ['-6deg', '5deg', '-4deg'];

function HeroHeadline({ text, reducedMotion }: { text: string; reducedMotion: boolean }) {
  const splitAt = text.indexOf(HEADLINE_ACCENT);
  if (splitAt === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, splitAt)}
      <span
        className={`bg-clip-text text-transparent bg-[length:250%_100%] ${reducedMotion ? '' : 'animate-shimmer'}`}
        style={{
          backgroundImage:
            'linear-gradient(100deg, var(--color-accent-secondary) 20%, var(--color-accent) 38%, #fff3d6 50%, var(--color-accent) 62%, var(--color-accent-secondary) 80%)',
        }}
      >
        {HEADLINE_ACCENT}
      </span>
      {text.slice(splitAt + HEADLINE_ACCENT.length)}
    </>
  );
}

function StatBurst({
  value,
  label,
  rotate,
  reducedMotion,
  floatDelayMs,
}: {
  value: number;
  label: string;
  rotate: string;
  reducedMotion: boolean;
  floatDelayMs: number;
}) {
  const count = useCountUp(value);

  return (
    <div
      className={reducedMotion ? '' : 'animate-float'}
      style={reducedMotion ? undefined : { animationDelay: `${floatDelayMs}ms` }}
    >
      <div
        className="flex h-[76px] w-[76px] shrink-0 flex-col items-center justify-center rounded-full border-[3px] border-canvas bg-accent-secondary text-canvas shadow-[0_4px_0_rgba(0,0,0,0.35)]"
        style={{ transform: `rotate(${rotate})` }}
      >
        <span className="font-mono text-xl font-extrabold leading-none">{count}</span>
        <span className="mt-0.5 max-w-[58px] text-center text-[8px] font-bold uppercase leading-tight tracking-wide">
          {label}
        </span>
      </div>
    </div>
  );
}

function SpotlightCard({
  entry,
  index,
  reducedMotion,
  reveal,
  t,
}: {
  entry: SpotlightEntry;
  index: number;
  reducedMotion: boolean;
  reveal: (delayMs: number, animationClass?: string) => { className: string; style?: CSSProperties };
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}) {
  const rotateDeg = PANEL_ROTATIONS[index % PANEL_ROTATIONS.length];
  const panelReveal = reveal(360 + index * 120, 'animate-panel-slam');
  const { title, mainName } = parseCharacterName(entry.characterName);

  return (
    <Link
      to={`/characters/${entry.characterSlug}`}
      className={`group comic-panel-torn relative block border-4 bg-surface p-1 shadow-[6px_6px_0_rgba(0,0,0,0.35)] ${RARITY_STYLES[entry.rarity]} ${panelReveal.className}`}
      style={
        {
          ...panelReveal.style,
          '--slam-rotate': rotateDeg,
          ...(reducedMotion ? { transform: `rotate(${rotateDeg})` } : {}),
        } as CSSProperties
      }
    >
      <div className="absolute left-1.5 top-1.5 z-10 flex gap-1">
        <span
          className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide shadow-[2px_2px_0_rgba(0,0,0,0.35)] ${SERVER_STYLES[entry.server]}`}
        >
          {entry.server}
        </span>
        <span
          className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide shadow-[2px_2px_0_rgba(0,0,0,0.35)] ${RELEASE_TYPE_STYLES[entry.releaseType].badge}`}
        >
          {t(RELEASE_TYPE_LABEL_KEYS[entry.releaseType])}
        </span>
      </div>
      <div className="relative overflow-hidden transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-105">
        <CharacterPortrait
          name={entry.characterName}
          rarity={entry.rarity}
          image={entry.image}
          fit="cover"
          className="aspect-[3/4] w-full text-lg"
        />
        {!reducedMotion && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 -translate-x-full skew-x-[-20deg] group-hover:animate-shine-sweep"
            style={{
              background: 'linear-gradient(75deg, transparent 42%, rgba(255,255,255,0.55) 50%, transparent 58%)',
            }}
          />
        )}
      </div>
      <div className="mt-1">
        {title && (
          <p className="truncate text-center text-[7px] font-bold uppercase tracking-wider text-accent-secondary/90">
            {title}
          </p>
        )}
        <p className="truncate text-center text-[10px] font-bold uppercase tracking-wide text-foreground">
          {mainName}
        </p>
        <p className="truncate text-center text-[9px] font-medium uppercase tracking-wide text-subtle">
          {t(RELEASE_TIMING_LABEL_KEYS[entry.timing])}
        </p>
      </div>
    </Link>
  );
}

export function HeroSection() {
  const { t } = useTranslation();
  const { characters } = useCharacters();
  const { entries: intelEntries } = useCharacterIntel();
  const reducedMotion = useReducedMotion();

  function reveal(delayMs: number, animationClass = 'animate-rise-in'): { className: string; style?: CSSProperties } {
    if (reducedMotion) return { className: '' };
    return { className: animationClass, style: { animationDelay: `${delayMs}ms` } };
  }

  const spotlightEntries = useMemo(
    () => getCurrentMonthSpotlightEntries(characters).filter((entry) => !HERO_EXCLUDED_SLUGS.has(entry.characterSlug)),
    [characters]
  );

  // Same list, split by server so CN and SEA render as two distinct clusters instead of an
  // interleaved grid — each entry keeps its position in the combined list as its stagger/tilt
  // index, so the two clusters don't animate in lockstep with identical rotations.
  const cnSpotlight = spotlightEntries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.server === 'CN');
  const seaSpotlight = spotlightEntries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.server === 'SEA');

  // Only "rumored" dossiers are worth interrupting the homepage for — a "confirmed" one is
  // superseded by the real character page, so it no longer needs an urgent signal here.
  const latestRumor = useMemo(() => intelEntries.find((entry) => entry.status === 'rumored') ?? null, [intelEntries]);

  const stats = [
    { key: 'characters', value: characters.length, label: t('home.hero.stats.characters') },
    { key: 'upcoming', value: spotlightEntries.length, label: t('home.hero.stats.upcoming') },
    { key: 'rarityTiers', value: RARITY_ORDER.length, label: t('home.hero.stats.rarityTiers') },
  ];

  return (
    <section
      className="relative flex overflow-hidden lg:min-h-[calc(100vh-93px)] lg:items-center"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(65% 55% at 20% 10%, var(--color-accent-glow) 0%, transparent 65%), radial-gradient(55% 50% at 85% 0%, var(--color-glow-purple) 0%, transparent 65%), radial-gradient(45% 40% at 50% 100%, var(--color-glow-blue) 0%, transparent 65%)',
        }}
      />
      <div aria-hidden="true" className="comic-dots pointer-events-none absolute inset-0 -z-10 opacity-[0.05]" />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -left-32 -top-32 -z-10 h-[520px] w-[520px] rounded-full opacity-[0.08] ${reducedMotion ? '' : 'animate-spin-slow'}`}
        style={{
          background: 'repeating-conic-gradient(var(--color-accent-secondary) 0deg 4deg, transparent 4deg 12deg)',
        }}
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {EMBERS.map((ember, index) => (
          <span
            key={index}
            className="animate-ember absolute bottom-0 rounded-full bg-accent-secondary/70"
            style={{
              left: ember.left,
              width: ember.size,
              height: ember.size,
              animationDelay: ember.delay,
              animationDuration: ember.duration,
            }}
          />
        ))}
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-14 sm:px-8 sm:py-16 lg:py-6">
        {latestRumor && (
          <Link
            to={`/intel/${latestRumor.slug}`}
            className={`group relative mb-5 inline-flex w-fit max-w-full overflow-hidden rounded-md border-2 border-accent bg-canvas/90 shadow-[0_4px_0_rgba(0,0,0,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_rgba(0,0,0,0.4)] ${reveal(0).className}`}
            style={reveal(0).style}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 top-0 h-1.5 ${reducedMotion ? '' : 'animate-hazard-scroll'}`}
              style={{
                backgroundImage: 'repeating-linear-gradient(-45deg, var(--color-accent) 0 7px, var(--color-canvas) 7px 14px)',
              }}
            />
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 bottom-0 h-1.5 ${reducedMotion ? '' : 'animate-hazard-scroll'}`}
              style={{
                backgroundImage: 'repeating-linear-gradient(-45deg, var(--color-accent) 0 7px, var(--color-canvas) 7px 14px)',
              }}
            />

            <span className="flex flex-wrap items-center gap-2.5 py-3.5 pl-3 pr-4">
              <AlertTriangleIcon className="h-4 w-4 shrink-0 animate-pulse text-accent" />
              <span className="comic-pill h-6 shrink-0 bg-accent px-2 text-[9px] text-canvas">{t('common.intel')}</span>
              <span className="text-xs font-bold text-foreground sm:text-sm">
                {t('home.hero.intelAlert')} <span className="text-accent">{latestRumor.characterName}</span>
              </span>
              <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-accent transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </Link>
        )}

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
          <div className="flex flex-col items-start gap-5 text-left">
            <div className={`flex flex-col items-start gap-4 ${reveal(0).className}`} style={reveal(0).style}>
              <span className="comic-pill h-8 px-4 text-[11px]">{t('home.hero.eyebrow')}</span>

              <h1
                className="-rotate-1 text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-foreground sm:text-5xl"
                style={{ textShadow: '2px 2px 0 var(--color-canvas), 4px 4px 0 rgba(0,0,0,0.35)' }}
              >
                <HeroHeadline text={t('home.hero.headline')} reducedMotion={reducedMotion} />
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">{t('home.tagline')}</p>
            </div>

            <div className={`flex flex-wrap items-center gap-3 ${reveal(140).className}`} style={reveal(140).style}>
              <Link to="/characters" className="comic-pill comic-pill--active h-12 px-7 text-sm sm:h-14 sm:px-8 sm:text-base">
                {t('home.hero.exploreCharacters')}
              </Link>
              <Link to="/tier-list" className="comic-pill h-12 px-7 text-sm sm:h-14 sm:px-8 sm:text-base">
                {t('home.hero.viewTierList')}
              </Link>
            </div>

            <div
              className={`flex flex-wrap items-center gap-4 ${reveal(240).className}`}
              style={reveal(240).style}
            >
              {stats.map((stat, index) => (
                <StatBurst
                  key={stat.key}
                  value={stat.value}
                  label={stat.label}
                  rotate={BADGE_ROTATIONS[index]}
                  reducedMotion={reducedMotion}
                  floatDelayMs={index * 300}
                />
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xs lg:max-w-[330px]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full blur-[90px] lg:hidden"
              style={{ background: 'var(--color-glow-blue)' }}
            />
            <VortexRing
              reducedMotion={reducedMotion}
              className="absolute left-1/2 top-1/2 hidden h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 lg:block"
            />

            <div className={`mb-2 flex justify-center lg:justify-start ${reveal(180).className}`} style={reveal(180).style}>
              <span className="comic-pill h-7 px-4 text-[11px]">
                {t('home.hero.upcomingLabel', { month: t(MONTH_LABEL_KEYS[new Date().getMonth()]) })}
              </span>
            </div>

            <div className={`relative flex flex-col gap-2 ${reducedMotion ? '' : 'animate-float-slow'}`}>
              {cnSpotlight.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span
                    className={`h-6 w-fit rounded px-2.5 text-[10px] font-bold uppercase tracking-wide leading-6 shadow-[2px_2px_0_rgba(0,0,0,0.35)] ${SERVER_STYLES.CN}`}
                  >
                    {t(SERVER_LABEL_KEYS.CN)}
                  </span>
                  <div className="grid grid-cols-2 items-start gap-2.5 sm:gap-3">
                    {cnSpotlight.map(({ entry, index }) => (
                      <SpotlightCard key={entry.key} entry={entry} index={index} reducedMotion={reducedMotion} reveal={reveal} t={t} />
                    ))}
                  </div>
                </div>
              )}

              {seaSpotlight.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span
                    className={`h-6 w-fit rounded px-2.5 text-[10px] font-bold uppercase tracking-wide leading-6 shadow-[2px_2px_0_rgba(0,0,0,0.35)] ${SERVER_STYLES.SEA}`}
                  >
                    {t(SERVER_LABEL_KEYS.SEA)}
                  </span>
                  <div className="grid grid-cols-2 items-start gap-2.5 sm:gap-3">
                    {seaSpotlight.map(({ entry, index }) => (
                      <SpotlightCard key={entry.key} entry={entry} index={index} reducedMotion={reducedMotion} reveal={reveal} t={t} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
