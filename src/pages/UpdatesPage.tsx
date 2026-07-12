import { useState } from 'react';
import { useGameUpdates } from '@/hooks/useGameUpdates';
import { PageHeader } from '@/components/common/PageHeader';
import { UpdateCard } from '@/components/updates/UpdateCard';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { BurstIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

const PAGE_SIZE = 6;

export function UpdatesPage() {
  const { t } = useTranslation();
  const { updates, loading, error } = useGameUpdates();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleUpdates = updates.slice(0, visibleCount);
  const hasMore = visibleCount < updates.length;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
      <PageHeader title={t('updates.title')} description={t('updates.description')} />

      {loading ? (
        <LoadingState label={t('common.loading')} className="mt-10" />
      ) : error ? (
        <EmptyState
          icon={BurstIcon}
          title={t('common.errorTitle')}
          description={t('common.errorDescription')}
          className="mt-10"
        />
      ) : updates.length === 0 ? (
        <EmptyState
          icon={BurstIcon}
          title={t('updates.emptyTitle')}
          description={t('updates.emptyDescription')}
          className="mt-10"
        />
      ) : (
        <>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleUpdates.map((entry) => (
              <UpdateCard key={entry.id} entry={entry} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-6 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-accent-info/40 hover:bg-elevated"
              >
                {t('updates.showMore')}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
