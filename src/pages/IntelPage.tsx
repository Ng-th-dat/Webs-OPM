import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useCharacterIntel } from '@/hooks/useCharacterIntel';
import { PageHeader } from '@/components/common/PageHeader';
import { IntelCard } from '@/components/intel/IntelCard';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { SearchIcon } from '@/components/common/icons';
import { INTEL_STATUS_LABEL_KEYS, INTEL_STATUS_STYLES } from '@/utils/characterIntel';
import type { IntelStatus } from '@/types/characterIntel';
import { useTranslation } from '@/hooks/useTranslation';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const STATUSES: IntelStatus[] = ['rumored', 'confirmed'];
const STAGGER_STEP_MS = 60;
const STAGGER_CAP_MS = 300;

export function IntelPage() {
  const { t } = useTranslation();
  const { entries, loading, error } = useCharacterIntel();
  const [activeStatus, setActiveStatus] = useState<IntelStatus | null>(null);
  const reducedMotion = useReducedMotion();

  const filteredEntries = useMemo(
    () => (activeStatus ? entries.filter((entry) => entry.status === activeStatus) : entries),
    [entries, activeStatus]
  );

  function cardReveal(index: number): { className: string; style?: CSSProperties } {
    if (reducedMotion) return { className: '' };
    return {
      className: 'animate-rise-in',
      style: { animationDelay: `${Math.min(index * STAGGER_STEP_MS, STAGGER_CAP_MS)}ms` },
    };
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
      <PageHeader title={t('intel.title')} description={t('intel.description')} />

      {!loading && !error && entries.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label={t('common.filter')}>
          <button
            type="button"
            onClick={() => setActiveStatus(null)}
            aria-pressed={activeStatus === null}
            className={`h-9 rounded-md border px-3 text-xs font-bold uppercase tracking-wide transition-colors duration-150 ${
              activeStatus === null
                ? 'border-foreground bg-foreground text-canvas'
                : 'border-border text-subtle hover:border-accent/40 hover:text-foreground'
            }`}
          >
            {t('common.all')}
          </button>
          {STATUSES.map((status) => {
            const isActive = activeStatus === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setActiveStatus(isActive ? null : status)}
                aria-pressed={isActive}
                className={`comic-pill h-9 px-3 text-[11px] transition-opacity duration-150 ${
                  isActive ? INTEL_STATUS_STYLES[status].badge : 'opacity-60 hover:opacity-100'
                }`}
              >
                {t(INTEL_STATUS_LABEL_KEYS[status])}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <LoadingState label={t('common.loading')} className="mt-10" />
      ) : error ? (
        <EmptyState
          icon={SearchIcon}
          title={t('common.errorTitle')}
          description={t('common.errorDescription')}
          className="mt-10"
        />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title={t('intel.emptyTitle')}
          description={t('intel.emptyDescription')}
          className="mt-10"
        />
      ) : filteredEntries.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title={t('intel.emptyTitle')}
          description={t('intel.statusEmptyDescription')}
          className="mt-10"
        />
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEntries.map((entry, index) => {
            const reveal = cardReveal(index);
            return <IntelCard key={entry.id} entry={entry} className={reveal.className} style={reveal.style} />;
          })}
        </div>
      )}
    </section>
  );
}
