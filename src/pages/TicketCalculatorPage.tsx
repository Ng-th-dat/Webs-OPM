import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCharacters } from '@/hooks/useCharacters';
import { useTicketTypeImages } from '@/hooks/useTicketTypeImages';
import { useTranslation } from '@/hooks/useTranslation';
import { useCountUp } from '@/hooks/useCountUp';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { TICKET_SOURCES, type TicketSource } from '@/data/ticketSources';
import { calculateProjectedTickets, buildTicketTimeline, type TicketTimelineRow } from '@/utils/ticketCalculator';
import {
  getNextUpcomingRelease,
  getSpotlightEntriesInRange,
  startOfToday,
  RELEASE_TIMING_LABEL_KEYS,
  RELEASE_TYPE_LABEL_KEYS,
  RELEASE_TYPE_STYLES,
} from '@/utils/releaseSchedule';
import type { Server } from '@/types/releaseSchedule';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { AlertTriangleIcon, CheckIcon, ImageIcon } from '@/components/common/icons';

type TargetMode = 'next-release' | 'custom-date';

const SERVERS: Server[] = ['CN', 'SEA'];

function formatDate(date: Date, language: string): string {
  return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function TicketSourceIcon({ imageUrl }: { imageUrl?: string }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <ImageIcon className="h-3.5 w-3.5 text-subtle" />
      )}
    </span>
  );
}

function ResultStat({
  label,
  value,
  gained,
  colorVar,
}: {
  label: string;
  value: number;
  gained: number;
  colorVar: string;
}) {
  const count = useCountUp(value);

  return (
    <div className="relative flex min-w-[140px] flex-1 flex-col gap-1 overflow-hidden rounded-xl border-2 border-border bg-canvas px-4 py-3">
      <div aria-hidden="true" className="comic-dots pointer-events-none absolute inset-0 opacity-[0.05]" />
      <span className="relative text-[10px] font-bold uppercase tracking-wider text-subtle">{label}</span>
      <span className="relative font-mono text-3xl font-extrabold tabular-nums" style={{ color: colorVar }}>
        {count}
      </span>
      {gained > 0 && <span className="relative text-[11px] font-semibold text-rarity-r">+{gained}</span>}
    </div>
  );
}

function TicketBox({
  label,
  includedLabel,
  sources,
  total,
  accentClassName,
  typeImages,
}: {
  label: string;
  includedLabel: string;
  sources: { source: TicketSource; date: string }[];
  total: number;
  accentClassName: string;
  typeImages: Record<string, string>;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-elevated p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-subtle">{label}</span>
        <span className={`text-lg font-extrabold ${accentClassName}`}>{total}</span>
      </div>
      {sources.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle">{includedLabel}</span>
          {sources.map((entry, index) => (
            <div key={`${entry.source.id}-${index}`} className="flex items-center gap-2 text-xs text-muted">
              <TicketSourceIcon imageUrl={typeImages[entry.source.ticketType]} />
              <span className="min-w-0 flex-1 truncate">{t(entry.source.labelKey)}</span>
              <span className="shrink-0 font-semibold text-foreground">+{entry.source.amount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineRowView({
  row,
  language,
  typeImages,
  delayMs,
  reducedMotion,
}: {
  row: TicketTimelineRow;
  language: string;
  typeImages: Record<string, string>;
  delayMs: number;
  reducedMotion: boolean;
}) {
  const { t } = useTranslation();
  const portraitBlock =
    row.kind === 'event' && row.event ? (
      <>
        <CharacterPortrait
          name={row.event.characterName}
          rarity={row.event.rarity}
          image={row.event.image}
          className="h-16 w-16 rounded-xl transition-transform duration-200 group-hover:scale-105 sm:h-20 sm:w-20"
        />
        <div className="flex flex-col gap-1 sm:items-center">
          <span
            className={`inline-flex w-fit items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${RELEASE_TYPE_STYLES[row.event.releaseType].badge}`}
          >
            {t(RELEASE_TYPE_LABEL_KEYS[row.event.releaseType])}
          </span>
          <span className="text-xs font-semibold text-foreground transition-colors duration-200 group-hover:text-accent-info">
            {row.event.characterName}
          </span>
        </div>
      </>
    ) : (
      <span className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-border p-2 text-center text-[10px] font-semibold uppercase text-subtle sm:h-20 sm:w-20">
        {t('ticketCalculator.timeline.targetRowLabel')}
      </span>
    );

  return (
    <div
      className={`flex flex-col gap-3 border-b border-border pb-5 last:border-b-0 last:pb-0 sm:flex-row sm:gap-4 ${
        reducedMotion ? '' : 'animate-rise-in'
      }`}
      style={reducedMotion ? undefined : { animationDelay: `${delayMs}ms` }}
    >
      {row.kind === 'event' && row.event ? (
        <Link
          to={`/characters/${row.event.characterSlug}`}
          className="group flex shrink-0 flex-row items-center gap-3 sm:w-32 sm:flex-col sm:text-center"
        >
          {portraitBlock}
          <span className="text-[10px] font-medium uppercase tracking-wide text-subtle">
            {formatDate(row.date, language)}
          </span>
        </Link>
      ) : (
        <div className="flex shrink-0 flex-row items-center gap-3 sm:w-32 sm:flex-col sm:text-center">
          {portraitBlock}
          <span className="text-[10px] font-medium uppercase tracking-wide text-subtle">
            {formatDate(row.date, language)}
          </span>
        </div>
      )}

      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
        <TicketBox
          label={t('ticketCalculator.result.blackTickets')}
          includedLabel={t('ticketCalculator.timeline.includedLabel')}
          sources={row.includedBlack}
          total={row.cumulativeBlack}
          accentClassName="text-accent-secondary"
          typeImages={typeImages}
        />
        <TicketBox
          label={t('ticketCalculator.result.stkTickets')}
          includedLabel={t('ticketCalculator.timeline.includedLabel')}
          sources={row.includedStk}
          total={row.cumulativeStk}
          accentClassName="text-accent-info"
          typeImages={typeImages}
        />
      </div>
    </div>
  );
}

function ClaimedChecklist({
  accentLabel,
  accentClassName,
  groups,
  claimedIds,
  onToggle,
}: {
  accentLabel: string;
  accentClassName: string;
  groups: [TicketSource['timing'], TicketSource[]][];
  claimedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-elevated/40 p-3">
      <span className={`text-xs font-bold uppercase tracking-wide ${accentClassName}`}>{accentLabel}</span>
      {groups.map(([timing, sources]) => (
        <div key={timing} className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-subtle">
            {t(RELEASE_TIMING_LABEL_KEYS[timing])}
          </span>
          {sources.map((source) => {
            const isClaimed = claimedIds.has(source.id);
            return (
              <label
                key={source.id}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 text-sm transition-colors duration-150 ${
                  isClaimed
                    ? 'border-accent-secondary/40 bg-accent-secondary/10 text-foreground'
                    : 'border-transparent text-muted hover:bg-elevated'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isClaimed}
                  onChange={() => onToggle(source.id)}
                  className="peer sr-only"
                />
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-accent-info/50 ${
                    isClaimed ? 'border-accent-secondary bg-accent-secondary' : 'border-border'
                  }`}
                >
                  {isClaimed && <CheckIcon className="h-3 w-3 text-canvas" />}
                </span>
                <span className={`min-w-0 flex-1 truncate ${isClaimed ? 'text-foreground/80 line-through decoration-accent-secondary/50' : ''}`}>
                  {t(source.labelKey)}
                </span>
                <span className="shrink-0 text-xs font-semibold text-subtle">+{source.amount}</span>
              </label>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function SourceTable({
  titleKey,
  sources,
  total,
  typeImages,
}: {
  titleKey: 'ticketCalculator.table.blackTitle' | 'ticketCalculator.table.stkTitle';
  sources: TicketSource[];
  total: number;
  typeImages: Record<string, string>;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-5">
      <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">{t(titleKey)}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-subtle">
            <tr>
              <th className="pb-2 pr-3 font-semibold">{t('ticketCalculator.table.source')}</th>
              <th className="pb-2 pr-3 font-semibold">{t('ticketCalculator.table.timing')}</th>
              <th className="pb-2 text-right font-semibold">{t('ticketCalculator.table.amount')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sources.map((source) => (
              <tr key={source.id}>
                <td className="py-2 pr-3 text-muted">
                  <div className="flex items-center gap-2">
                    <TicketSourceIcon imageUrl={typeImages[source.ticketType]} />
                    <span className="min-w-0">{t(source.labelKey)}</span>
                  </div>
                </td>
                <td className="py-2 pr-3 text-subtle">{t(RELEASE_TIMING_LABEL_KEYS[source.timing])}</td>
                <td className="py-2 text-right font-semibold text-foreground">{source.amount}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td colSpan={2} className="pt-2 font-bold uppercase text-foreground">
                {t('ticketCalculator.table.total')}
              </td>
              <td className="pt-2 text-right text-lg font-extrabold text-accent-secondary">{total}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export function TicketCalculatorPage() {
  const { t, language } = useTranslation();
  const { characters, loading, error } = useCharacters();
  const { images: typeImages } = useTicketTypeImages();
  const reducedMotion = useReducedMotion();

  const [currentBlack, setCurrentBlack] = useState('0');
  const [currentStk, setCurrentStk] = useState('0');
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [targetMode, setTargetMode] = useState<TargetMode>('next-release');
  const [targetServer, setTargetServer] = useState<Server>('SEA');
  const [customDate, setCustomDate] = useState('');

  const blackSources = TICKET_SOURCES.filter((source) => source.ticketType === 'black');
  const stkSources = TICKET_SOURCES.filter((source) => source.ticketType === 'stk');
  const blackTotal = blackSources.reduce((sum, source) => sum + source.amount, 0);
  const stkTotal = stkSources.reduce((sum, source) => sum + source.amount, 0);

  function groupByTiming(sources: TicketSource[]): [TicketSource['timing'], TicketSource[]][] {
    const groups = new Map<TicketSource['timing'], TicketSource[]>();
    for (const source of sources) {
      const list = groups.get(source.timing) ?? [];
      list.push(source);
      groups.set(source.timing, list);
    }
    return Array.from(groups.entries());
  }

  const groupedBlackSources = useMemo(() => groupByTiming(blackSources), [blackSources]);
  const groupedStkSources = useMemo(() => groupByTiming(stkSources), [stkSources]);

  const nextRelease = useMemo(
    () => (characters.length > 0 ? getNextUpcomingRelease(characters, [targetServer]) : null),
    [characters, targetServer]
  );

  const targetDate = useMemo(() => {
    if (targetMode === 'next-release') return nextRelease?.date ?? null;
    if (!customDate) return null;
    // Parse as local midnight, not `new Date(customDate)` — that reads "YYYY-MM-DD" as UTC
    // midnight, which lands on a different local calendar day/time and breaks equality
    // checks against timingToDate()'s local-midnight dates (duplicate trailing timeline row).
    const [year, month, day] = customDate.split('-').map(Number);
    if (!year || !month || !day) return null;
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [targetMode, nextRelease, customDate]);

  const result = useMemo(() => {
    if (!targetDate) return null;
    return calculateProjectedTickets({
      currentBlackTickets: Number(currentBlack) || 0,
      currentStkTickets: Number(currentStk) || 0,
      claimedSourceIds: Array.from(claimedIds),
      targetDate: targetDate.toISOString(),
    });
  }, [currentBlack, currentStk, claimedIds, targetDate]);

  const timeline = useMemo<TicketTimelineRow[] | null>(() => {
    if (!targetDate || !result) return null;
    const events = getSpotlightEntriesInRange(characters, targetServer, startOfToday(), targetDate);
    return buildTicketTimeline(events, result.upcomingSources, Number(currentBlack) || 0, Number(currentStk) || 0, targetDate);
  }, [characters, targetServer, targetDate, result, currentBlack, currentStk]);

  function toggleClaimed(id: string) {
    setClaimedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const revealClassName = reducedMotion ? '' : 'animate-rise-in';

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
      <div className="mb-10 flex flex-col gap-3">
        <span className="comic-pill h-7 w-fit px-3 text-[11px]">{t('ticketCalculator.eyebrow')}</span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t('ticketCalculator.title')}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">{t('ticketCalculator.description')}</p>
      </div>

      {loading ? (
        <LoadingState label={t('common.loading')} />
      ) : error ? (
        <EmptyState icon={AlertTriangleIcon} title={t('common.errorTitle')} description={t('common.errorDescription')} />
      ) : (
        <div className={`grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr] ${revealClassName}`}>
          <div className="flex flex-col gap-5 rounded-card border border-border bg-surface p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {t('ticketCalculator.form.currentBlackTickets')}
                </span>
                <input
                  type="number"
                  min={0}
                  value={currentBlack}
                  onChange={(event) => setCurrentBlack(event.target.value)}
                  className="w-full rounded-lg border border-border bg-elevated px-3.5 py-2.5 text-sm text-foreground transition-colors duration-200 hover:border-accent-info/40 focus:border-accent-info/60 focus:outline-none focus:shadow-[0_0_0_3px_rgba(61,169,252,0.15)]"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {t('ticketCalculator.form.currentStkTickets')}
                </span>
                <input
                  type="number"
                  min={0}
                  value={currentStk}
                  onChange={(event) => setCurrentStk(event.target.value)}
                  className="w-full rounded-lg border border-border bg-elevated px-3.5 py-2.5 text-sm text-foreground transition-colors duration-200 hover:border-accent-info/40 focus:border-accent-info/60 focus:outline-none focus:shadow-[0_0_0_3px_rgba(61,169,252,0.15)]"
                />
              </label>
            </div>

            <div className="h-px bg-border" />

            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">{t('ticketCalculator.form.claimedTitle')}</h2>
                <p className="mt-0.5 text-xs text-subtle">{t('ticketCalculator.form.claimedHint')}</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ClaimedChecklist
                  accentLabel={t('ticketCalculator.form.currentBlackTickets')}
                  accentClassName="text-accent-secondary"
                  groups={groupedBlackSources}
                  claimedIds={claimedIds}
                  onToggle={toggleClaimed}
                />
                <ClaimedChecklist
                  accentLabel={t('ticketCalculator.form.currentStkTickets')}
                  accentClassName="text-accent-info"
                  groups={groupedStkSources}
                  claimedIds={claimedIds}
                  onToggle={toggleClaimed}
                />
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-foreground">{t('ticketCalculator.form.targetTitle')}</h2>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {t('ticketCalculator.form.targetServer')}
                </span>
                <div className="flex w-fit items-center gap-2">
                  {SERVERS.map((server) => (
                    <button
                      key={server}
                      type="button"
                      aria-pressed={targetServer === server}
                      onClick={() => setTargetServer(server)}
                      className={`comic-pill h-8 px-3.5 text-xs ${targetServer === server ? 'comic-pill--active' : 'opacity-70 hover:opacity-100'}`}
                    >
                      {server}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex w-fit items-center gap-2">
                {(['next-release', 'custom-date'] as TargetMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={targetMode === mode}
                    onClick={() => setTargetMode(mode)}
                    className={`comic-pill h-9 px-4 text-xs ${targetMode === mode ? 'comic-pill--active' : 'opacity-70 hover:opacity-100'}`}
                  >
                    {t(mode === 'next-release' ? 'ticketCalculator.form.targetNextRelease' : 'ticketCalculator.form.targetCustomDate')}
                  </button>
                ))}
              </div>

              {targetMode === 'next-release' ? (
                <p className="text-sm text-muted">
                  {nextRelease
                    ? t('ticketCalculator.form.nextReleaseFound', {
                        characterName: nextRelease.characterName,
                        releaseType: t(RELEASE_TYPE_LABEL_KEYS[nextRelease.releaseType]),
                        server: nextRelease.server,
                        date: formatDate(nextRelease.date, language),
                      })
                    : t('ticketCalculator.form.nextReleaseNone')}
                </p>
              ) : (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {t('ticketCalculator.form.customDateLabel')}
                  </span>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(event) => setCustomDate(event.target.value)}
                    className="w-full rounded-lg border border-border bg-elevated px-3.5 py-2.5 text-sm text-foreground transition-colors duration-200 hover:border-accent-info/40 focus:border-accent-info/60 focus:outline-none focus:shadow-[0_0_0_3px_rgba(61,169,252,0.15)]"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5 rounded-card border border-border bg-surface p-5 sm:p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
              {t('ticketCalculator.result.title')}
            </h2>

            {result && (
              <div className="flex flex-wrap gap-3">
                <ResultStat
                  label={t('ticketCalculator.result.blackTickets')}
                  value={result.projectedBlackTickets}
                  gained={result.blackTicketsGained}
                  colorVar="var(--color-accent-secondary)"
                />
                <ResultStat
                  label={t('ticketCalculator.result.stkTickets')}
                  value={result.projectedStkTickets}
                  gained={result.stkTicketsGained}
                  colorVar="var(--color-accent-info)"
                />
              </div>
            )}

            {timeline && timeline.length > 0 ? (
              <div className="flex flex-col gap-5">
                {timeline.length === 1 && timeline[0].kind === 'target' && (
                  <p className="text-xs text-subtle">{t('ticketCalculator.timeline.noEvents')}</p>
                )}
                {timeline.map((row, index) => (
                  <TimelineRowView
                    key={row.key}
                    row={row}
                    language={language}
                    typeImages={typeImages}
                    delayMs={Math.min(index, 5) * 60}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">{t('ticketCalculator.form.nextReleaseNone')}</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <SourceTable
          titleKey="ticketCalculator.table.blackTitle"
          sources={blackSources}
          total={blackTotal}
          typeImages={typeImages}
        />
        <SourceTable
          titleKey="ticketCalculator.table.stkTitle"
          sources={stkSources}
          total={stkTotal}
          typeImages={typeImages}
        />
      </div>
    </section>
  );
}
