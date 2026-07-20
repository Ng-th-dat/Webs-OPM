import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useSeaServers } from '@/hooks/useSeaServers';
import { useTranslation } from '@/hooks/useTranslation';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useCountUp } from '@/hooks/useCountUp';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { AlertTriangleIcon, BeaconIcon } from '@/components/common/icons';
import { getDaysUntilOpen, getNextSeaServer, getSeaServerStatus, type SeaServerStatus } from '@/utils/seaServers';
import type { SeaServerEntry } from '@/types/seaServer';

const RECENT_LIMIT = 5;

const STATUS_BADGE: Record<SeaServerStatus, string> = {
  upcoming: 'bg-accent-info text-canvas',
  new: 'bg-accent-secondary text-canvas',
  established: 'bg-subtle text-canvas',
};

function formatFullDate(isoDate: string, language: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatShortDate(isoDate: string, language: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function TornPanel({
  children,
  reducedMotion,
  className = '',
}: {
  children: ReactNode;
  reducedMotion: boolean;
  className?: string;
}) {
  return (
    <div
      className={`comic-panel-torn relative border-4 border-accent-secondary bg-surface p-1 shadow-[6px_6px_0_rgba(0,0,0,0.35)] ${reducedMotion ? '' : 'animate-panel-slam'} ${className}`}
      style={
        {
          '--slam-rotate': '-1.5deg',
          ...(reducedMotion ? { transform: 'rotate(-1.5deg)' } : {}),
        } as CSSProperties
      }
    >
      <div className="relative overflow-hidden bg-surface">{children}</div>
    </div>
  );
}

function NextLaunchConsole({
  server,
  language,
  reducedMotion,
  className = '',
}: {
  server: SeaServerEntry;
  language: string;
  reducedMotion: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const daysUntil = getDaysUntilOpen(server.openDate);
  const countedDays = useCountUp(Math.max(daysUntil, 0));

  return (
    <TornPanel reducedMotion={reducedMotion} className={className}>
      <div aria-hidden="true" className="comic-dots pointer-events-none absolute inset-0 opacity-[0.05]" />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07] ${reducedMotion ? '' : 'animate-spin-slow'}`}
      >
        <div
          className="h-[420px] w-[420px] shrink-0"
          style={{
            background: 'repeating-conic-gradient(var(--color-accent-secondary) 0deg 3deg, transparent 3deg 18deg)',
          }}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(480px circle at 15% 15%, rgba(255,176,32,0.14), transparent 62%), radial-gradient(420px circle at 85% 85%, rgba(61,169,252,0.09), transparent 60%)',
        }}
      />

      <div className="absolute left-3 top-3 z-10 flex gap-1.5">
        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-canvas shadow-[2px_2px_0_rgba(0,0,0,0.35)] bg-accent-info">
          SEA
        </span>
        <span className="flex items-center gap-1 rounded bg-accent-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-canvas shadow-[2px_2px_0_rgba(0,0,0,0.35)]">
          <BeaconIcon className="h-2.5 w-2.5" />
          {t('seaServers.nextBeaconLabel')}
        </span>
      </div>

      <div className="relative flex flex-col items-center gap-6 px-6 pb-14 pt-16 text-center sm:px-10 sm:pb-16 sm:pt-20">
        <h2
          className="font-mono text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl"
          style={{ textShadow: '2px 2px 0 var(--color-canvas), 4px 4px 0 rgba(0,0,0,0.35)' }}
        >
          {server.serverLabel}
        </h2>

        {daysUntil <= 0 ? (
          <p className="animate-pulse text-lg font-extrabold uppercase tracking-wide text-accent-secondary">
            {t('seaServers.opensToday')}
          </p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-lg border border-accent-secondary/30 bg-canvas/70 px-6 py-2 shadow-[inset_0_2px_10px_rgba(0,0,0,0.45)]">
              <span className="font-mono text-5xl font-extrabold tabular-nums text-accent-secondary sm:text-6xl">
                {String(countedDays).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-subtle">
              {t('seaServers.daysUnit')}
            </span>
          </div>
        )}

        <p className="text-sm text-muted">{formatFullDate(server.openDate, language)}</p>
      </div>
    </TornPanel>
  );
}

function ManifestRow({
  server,
  rank,
  language,
  delayMs,
  reducedMotion,
}: {
  server: SeaServerEntry;
  rank: number;
  language: string;
  delayMs: number;
  reducedMotion: boolean;
}) {
  const { t } = useTranslation();
  const status = getSeaServerStatus(server.openDate);

  return (
    <div
      className={`group flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-elevated/60 ${reducedMotion ? '' : 'animate-rise-in'}`}
      style={reducedMotion ? undefined : { animationDelay: `${delayMs}ms` }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[10px] font-bold tabular-nums text-subtle transition-colors duration-200 group-hover:border-accent-secondary/60 group-hover:text-foreground">
          {rank}
        </span>
        <span className="font-mono text-sm font-bold text-foreground sm:text-base">{server.serverLabel}</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-subtle">{formatShortDate(server.openDate, language)}</span>
        <span className={`comic-pill h-6 px-2.5 text-[10px] ${STATUS_BADGE[status]}`}>
          {t(`seaServers.status.${status}`)}
        </span>
      </div>
    </div>
  );
}

export function SeaServersPage() {
  const { t, language } = useTranslation();
  const { servers, loading, error } = useSeaServers();
  const reducedMotion = useReducedMotion();

  const nextServer = useMemo(() => getNextSeaServer(servers), [servers]);
  const recentServers = useMemo(
    () =>
      [...servers]
        .sort((a, b) => new Date(b.openDate).getTime() - new Date(a.openDate).getTime())
        .slice(0, RECENT_LIMIT),
    [servers]
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
      <PageHeader
        eyebrow={t('seaServers.eyebrow')}
        title={t('seaServers.title')}
        description={t('seaServers.description')}
      />

      {loading ? (
        <LoadingState label={t('common.loading')} className="mt-10" />
      ) : error ? (
        <EmptyState
          icon={AlertTriangleIcon}
          title={t('common.errorTitle')}
          description={t('common.errorDescription')}
          className="mt-10"
        />
      ) : servers.length === 0 ? (
        <EmptyState
          icon={BeaconIcon}
          title={t('seaServers.emptyTitle')}
          description={t('seaServers.emptyDescription')}
          className="mt-10"
        />
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          {nextServer ? (
            <NextLaunchConsole
              server={nextServer}
              language={language}
              reducedMotion={reducedMotion}
              className="lg:order-2"
            />
          ) : (
            <TornPanel reducedMotion={reducedMotion} className="lg:order-2">
              <div aria-hidden="true" className="comic-dots pointer-events-none absolute inset-0 opacity-[0.05]" />
              <div className="relative px-6 py-14 text-center">
                <BeaconIcon className="mx-auto h-8 w-8 text-subtle" />
                <p className="mt-3 text-sm font-semibold text-foreground">{t('seaServers.emptyTitle')}</p>
                <p className="mt-1 text-xs text-subtle">{t('seaServers.emptyDescription')}</p>
              </div>
            </TornPanel>
          )}

          <div className="lg:order-1">
            <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-subtle">
              {t('seaServers.recentTitle')}
            </h2>
            <p className="mb-4 text-xs text-subtle">{t('seaServers.recentSubtitle')}</p>
            <div className="relative overflow-hidden rounded-2xl border-2 border-border bg-surface shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
              <div aria-hidden="true" className="comic-dots pointer-events-none absolute inset-0 opacity-[0.04]" />
              <div className="relative divide-y divide-border">
                {recentServers.map((server, index) => (
                  <ManifestRow
                    key={server.id}
                    server={server}
                    rank={index + 1}
                    language={language}
                    delayMs={index * 60}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
