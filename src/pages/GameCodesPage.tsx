import { useGameCodes } from '@/hooks/useGameCodes';
import { useTranslation } from '@/hooks/useTranslation';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { AlertTriangleIcon, TicketIcon } from '@/components/common/icons';
import { CodeCard } from '@/components/gameCodes/CodeCard';

export function GameCodesPage() {
  const { t } = useTranslation();
  const { codes, loading, error } = useGameCodes();
  const reducedMotion = useReducedMotion();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
      <PageHeader
        eyebrow={t('gameCodes.eyebrow')}
        title={t('gameCodes.title')}
        description={t('gameCodes.description')}
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
      ) : codes.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title={t('gameCodes.emptyTitle')}
          description={t('gameCodes.emptyDescription')}
          className="mt-10"
        />
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {codes.map((entry, index) => (
            <CodeCard key={entry.id} entry={entry} delayMs={Math.min(index, 6) * 60} reducedMotion={reducedMotion} />
          ))}
        </div>
      )}
    </section>
  );
}
