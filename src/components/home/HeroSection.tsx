import { Link } from 'react-router-dom';
import {
  getCurrentMonthSpotlightEntries,
  RELEASE_TIMING_LABEL_KEYS,
  RELEASE_TYPE_LABEL_KEYS,
  RELEASE_TYPE_STYLES,
  SERVER_STYLES,
} from '@/utils/releaseSchedule';
import { RARITY_ORDER, RARITY_GLOW, RARITY_STYLES } from '@/utils/rarity';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { HudFrame } from '@/components/character/HudFrame';
import { ArrowRightIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { useCharacters } from '@/hooks/useCharacters';

const HEADLINE_ACCENT = 'One Punch Man';

const EMBERS = [
  { left: '6%', size: 3, delay: '0s', duration: '7s' },
  { left: '18%', size: 2, delay: '1.6s', duration: '9s' },
  { left: '34%', size: 4, delay: '3s', duration: '8s' },
  { left: '60%', size: 2, delay: '0.8s', duration: '10s' },
  { left: '78%', size: 3, delay: '2.2s', duration: '7.5s' },
  { left: '92%', size: 2, delay: '4s', duration: '8.5s' },
];

function HeroHeadline({ text }: { text: string }) {
  const splitAt = text.indexOf(HEADLINE_ACCENT);
  if (splitAt === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, splitAt)}
      <span
        className="bg-clip-text text-transparent [background-image:linear-gradient(90deg,var(--color-accent-secondary),var(--color-accent))] [text-shadow:0_0_32px_var(--color-accent-glow)]"
      >
        {HEADLINE_ACCENT}
      </span>
      {text.slice(splitAt + HEADLINE_ACCENT.length)}
    </>
  );
}

export function HeroSection() {
  const { t } = useTranslation();
  const { characters } = useCharacters();
  const spotlightEntries = getCurrentMonthSpotlightEntries(characters);
  const upcomingCount = spotlightEntries.length;
  const featuredRarity =
    (characters.find((character) => character.slug === 'saitama') ?? characters[0])?.rarity ?? 'UR+';

  const stats = [
    { key: 'characters', value: characters.length, label: t('home.hero.stats.characters') },
    { key: 'upcoming', value: upcomingCount, label: t('home.hero.stats.upcoming') },
    { key: 'rarityTiers', value: RARITY_ORDER.length, label: t('home.hero.stats.rarityTiers') },
  ];

  return (
    <section className="relative flex overflow-hidden lg:min-h-[calc(100vh-65px)] lg:items-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(65% 55% at 20% 10%, var(--color-accent-glow) 0%, transparent 65%), radial-gradient(55% 50% at 85% 0%, var(--color-glow-purple) 0%, transparent 65%), radial-gradient(45% 40% at 50% 100%, var(--color-glow-blue) 0%, transparent 65%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] items-center justify-end overflow-hidden lg:flex"
      >
        <div
          className="animate-float-slow absolute right-[-8%] top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full blur-[110px]"
          style={{ background: RARITY_GLOW[featuredRarity] }}
        />
      </div>

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

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.15fr_1fr] lg:gap-8 lg:py-20">
        <div className="flex flex-col items-start gap-6 text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted">
            {t('home.hero.eyebrow')}
          </span>

          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            <HeroHeadline text={t('home.hero.headline')} />
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {t('home.tagline')}
          </p>

          <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/characters"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-6 text-sm font-semibold text-canvas transition-transform duration-200 hover:-translate-y-0.5 hover:bg-accent/90 sm:text-base"
            >
              {t('home.hero.exploreCharacters')}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              to="/updates"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-info/50 hover:bg-elevated sm:text-base"
            >
              {t('home.hero.viewUpdates')}
            </Link>
          </div>

          <div className="mt-4 flex w-full flex-wrap items-center gap-x-8 gap-y-4 border-t border-border pt-6">
            {stats.map((stat) => (
              <div key={stat.key} className="flex flex-col gap-0.5">
                <span className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  {stat.value}
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-subtle">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xs lg:max-w-sm">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full blur-[90px]"
            style={{ background: 'var(--color-glow-blue)' }}
          />

          <div className="mb-4 flex items-center justify-center gap-2 lg:justify-start">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-info opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-info" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              {t('home.hero.upcomingLabel')}
            </span>
          </div>

          <div className="relative grid grid-cols-2 gap-4 sm:gap-5">
            <HudFrame
              rarity={featuredRarity}
              className="pointer-events-none absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 opacity-50"
            />
            {spotlightEntries.map((entry, index) => (
              <div
                key={entry.key}
                className="animate-float perspective-distant"
                style={{ animationDelay: `${index * 0.5}s` }}
              >
                <Link
                  to={`/characters/${entry.characterSlug}`}
                  className={`group flex flex-col rounded-2xl border bg-surface p-3 shadow-2xl shadow-black/40 transition-transform duration-500 ease-out hover:-translate-y-2 hover:rotate-x-0 hover:rotate-y-0 hover:scale-105 ${RARITY_STYLES[entry.rarity]} ${index % 2 === 0
                    ? 'rotate-y-[10deg] -rotate-x-[3deg]'
                    : '-rotate-y-[10deg] rotate-x-[3deg] sm:translate-y-6'
                    }`}
                >
                  <div className="mb-2 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${SERVER_STYLES[entry.server]}`}
                    >
                      {entry.server}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${RELEASE_TYPE_STYLES[entry.releaseType].badge}`}
                    >
                      {t(RELEASE_TYPE_LABEL_KEYS[entry.releaseType])}
                    </span>
                  </div>
                  <CharacterPortrait
                    name={entry.characterName}
                    rarity={entry.rarity}
                    image={entry.image}
                    className="aspect-square w-full rounded-xl text-3xl transition-transform duration-300 group-hover:scale-105"
                  />
                  <p className="mt-2 truncate text-center text-xs font-semibold text-foreground">
                    {entry.characterName}
                  </p>
                  <p className="truncate text-center text-[10px] font-medium uppercase tracking-wide text-subtle">
                    {t(RELEASE_TIMING_LABEL_KEYS[entry.timing])}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
