import { useMemo, useState } from 'react';
import { useGameUpdates } from '@/hooks/useGameUpdates';
import { PageHeader } from '@/components/common/PageHeader';
import { UpdateCard } from '@/components/updates/UpdateCard';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { BurstIcon } from '@/components/common/icons';
import { UPDATE_CATEGORY_LABEL_KEYS, UPDATE_CATEGORY_STYLES } from '@/utils/gameUpdates';
import type { UpdateCategory } from '@/types/gameUpdate';
import { useTranslation } from '@/hooks/useTranslation';

const PAGE_SIZE = 6;
const CATEGORIES: UpdateCategory[] = ['Update', 'Event', 'CnNews', 'Maintenance'];

export function UpdatesPage() {
  const { t } = useTranslation();
  const { updates, loading, error } = useGameUpdates();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeCategory, setActiveCategory] = useState<UpdateCategory | null>(null);

  const filteredUpdates = useMemo(
    () => (activeCategory ? updates.filter((entry) => entry.category === activeCategory) : updates),
    [updates, activeCategory]
  );
  const visibleUpdates = filteredUpdates.slice(0, visibleCount);
  const hasMore = visibleCount < filteredUpdates.length;

  function handleCategoryChange(category: UpdateCategory | null) {
    setActiveCategory(category);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
      <PageHeader title={t('updates.title')} description={t('updates.description')} />

      {!loading && !error && updates.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label={t('common.filter')}>
          <button
            type="button"
            onClick={() => handleCategoryChange(null)}
            aria-pressed={activeCategory === null}
            className={`h-9 rounded-md border px-3 text-xs font-bold uppercase tracking-wide transition-colors duration-150 ${
              activeCategory === null
                ? 'border-foreground bg-foreground text-canvas'
                : 'border-border text-subtle hover:border-accent/40 hover:text-foreground'
            }`}
          >
            {t('common.all')}
          </button>
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(isActive ? null : category)}
                aria-pressed={isActive}
                className={`comic-pill h-9 px-3 text-[11px] transition-opacity duration-150 ${
                  isActive ? UPDATE_CATEGORY_STYLES[category].badge : 'opacity-60 hover:opacity-100'
                }`}
              >
                {t(UPDATE_CATEGORY_LABEL_KEYS[category])}
              </button>
            );
          })}
        </div>
      )}

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
      ) : filteredUpdates.length === 0 ? (
        <EmptyState
          icon={BurstIcon}
          title={t('updates.emptyTitle')}
          description={t('updates.categoryEmptyDescription')}
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
              <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="comic-pill h-11 px-6 text-xs">
                {t('updates.showMore')}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
