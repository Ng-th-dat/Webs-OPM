import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  getCurrentMonthSpotlightEntries,
  MONTH_LABEL_KEYS,
  RELEASE_TIMING_LABEL_KEYS,
  RELEASE_TYPE_LABEL_KEYS,
  RELEASE_TYPE_STYLES,
  SERVER_STYLES,
} from '@/utils/releaseSchedule';
import { RARITY_ORDER, RARITY_STYLES } from '@/utils/rarity';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { AlertTriangleIcon, ArrowRightIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { useCharacters } from '@/hooks/useCharacters';
import { useCharacterIntel } from '@/hooks/useCharacterIntel';
import { useCountUp } from '@/hooks/useCountUp';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePointerParallax } from '@/hooks/usePointerParallax';

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

function hasFinePointer(): boolean {
  return window.matchMedia('(pointer: fine)').matches;
}

function HeroHeadline({ text }: { text: string }) {
  const splitAt = text.indexOf(HEADLINE_ACCENT);
  if (splitAt === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, splitAt)}
      <span
        className="bg-clip-text text-transparent [background-image:linear-gradient(90deg,var(--color-accent-secondary),var(--color-accent))]"
      >
        {HEADLINE_ACCENT}
      </span>
      {text.slice(splitAt + HEADLINE_ACCENT.length)}
    </>
  );
}

function StatBurst({ value, label, rotate }: { value: number; label: string; rotate: string }) {
  const count = useCountUp(value);

  return (
    <div
      className="flex h-[76px] w-[76px] shrink-0 flex-col items-center justify-center rounded-full border-[3px] border-canvas bg-accent-secondary text-canvas shadow-[0_4px_0_rgba(0,0,0,0.35)]"
      style={{ transform: `rotate(${rotate})` }}
    >
      <span className="font-mono text-xl font-extrabold leading-none">{count}</span>
      <span className="mt-0.5 max-w-[58px] text-center text-[8px] font-bold uppercase leading-tight tracking-wide">
        {label}
      </span>
    </div>
  );
}

export function HeroSection() {
  const { t } = useTranslation();
  const { characters } = useCharacters();
  const { entries: intelEntries } = useCharacterIntel();
  const reducedMotion = useReducedMotion();
  const [pointerFine] = useState(hasFinePointer);
  const parallaxEnabled = !reducedMotion && pointerFine;
  const { ref: parallaxRef, offset: parallaxOffset } = usePointerParallax<HTMLElement>(parallaxEnabled);

  function reveal(delayMs: number, animationClass = 'animate-rise-in'): { className: string; style?: CSSProperties } {
    if (reducedMotion) return { className: '' };
    return { className: animationClass, style: { animationDelay: `${delayMs}ms` } };
  }

  const spotlightEntries = useMemo(
    () => getCurrentMonthSpotlightEntries(characters).filter((entry) => !HERO_EXCLUDED_SLUGS.has(entry.characterSlug)),
    [characters]
  );

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
      ref={parallaxRef}
      className="relative flex overflow-hidden lg:min-h-[calc(100vh-65px)] lg:items-center"
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
        className="pointer-events-none absolute -left-32 -top-32 -z-10 h-[520px] w-[520px] rounded-full opacity-[0.08]"
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

      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-20 sm:px-8 sm:py-28 lg:py-20">
        {latestRumor && (
          <Link
            to={`/intel/${latestRumor.slug}`}
            className={`group relative mb-8 inline-flex w-fit max-w-full overflow-hidden rounded-md border-2 border-accent bg-canvas/90 shadow-[0_4px_0_rgba(0,0,0,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_rgba(0,0,0,0.4)] ${reveal(0).className}`}
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

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
          <div className="flex flex-col items-start gap-6 text-left">
            <div className={`flex flex-col items-start gap-6 ${reveal(0).className}`} style={reveal(0).style}>
              <span className="comic-pill h-8 px-4 text-[11px]">{t('home.hero.eyebrow')}</span>

              <h1
                className="-rotate-1 text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                style={{ textShadow: '2px 2px 0 var(--color-canvas), 4px 4px 0 rgba(0,0,0,0.35)' }}
              >
                <HeroHeadline text={t('home.hero.headline')} />
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">{t('home.tagline')}</p>
            </div>

            <div className={`flex flex-wrap items-center gap-3 ${reveal(140).className}`} style={reveal(140).style}>
              <Link to="/characters" className="comic-pill h-14 px-8 text-sm sm:text-base">
                {t('home.hero.exploreCharacters')}
              </Link>
              <Link to="/release-schedule" className="comic-pill comic-pill--active h-14 px-8 text-sm sm:text-base">
                {t('home.hero.viewSchedule')}
              </Link>
            </div>

            <div
              className={`mt-2 flex flex-wrap items-center gap-4 ${reveal(240).className}`}
              style={reveal(240).style}
            >
              {stats.map((stat, index) => (
                <StatBurst key={stat.key} value={stat.value} label={stat.label} rotate={BADGE_ROTATIONS[index]} />
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xs lg:max-w-sm">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full blur-[90px]"
              style={{ background: 'var(--color-glow-blue)' }}
            />

            <div className={`mb-4 flex justify-center lg:justify-start ${reveal(180).className}`} style={reveal(180).style}>
              <span className="comic-pill h-8 px-4 text-[11px]">
                {t('home.hero.upcomingLabel', { month: t(MONTH_LABEL_KEYS[new Date().getMonth()]) })}
              </span>
            </div>

            <div
              className="relative grid grid-cols-2 items-start gap-3 sm:gap-4"
              style={
                parallaxEnabled
                  ? { transform: `translate3d(${parallaxOffset.x * 10}px, ${parallaxOffset.y * 8}px, 0)` }
                  : undefined
              }
            >
              {spotlightEntries.map((entry, index) => {
                const rotateDeg = PANEL_ROTATIONS[index % PANEL_ROTATIONS.length];
                const panelReveal = reveal(360 + index * 120, 'animate-panel-slam');

                return (
                  <Link
                    key={entry.key}
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
                    <div className="overflow-hidden transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-105">
                      <CharacterPortrait
                        name={entry.characterName}
                        rarity={entry.rarity}
                        image={entry.image}
                        fit="cover"
                        className="aspect-[3/4] w-full text-lg"
                      />
                    </div>
                    <p className="mt-1 truncate text-center text-[10px] font-bold uppercase tracking-wide text-foreground">
                      {entry.characterName}
                    </p>
                    <p className="truncate text-center text-[9px] font-medium uppercase tracking-wide text-subtle">
                      {t(RELEASE_TIMING_LABEL_KEYS[entry.timing])}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
