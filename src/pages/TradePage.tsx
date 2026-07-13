import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTradeListings } from '@/hooks/useTradeListings';
import { TradeListingGrid } from '@/components/trade/TradeListingGrid';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { BurstIcon } from '@/components/common/icons';
import { FilterBar, type FilterGroup } from '@/components/data-table/FilterBar';
import { useFilters } from '@/hooks/useFilters';
import { useTranslation } from '@/hooks/useTranslation';
import { SERVER_LABEL_KEYS } from '@/utils/releaseSchedule';
import type { Server } from '@/types/releaseSchedule';

interface TradeFilterValues {
  server: string | null;
}

const INITIAL_FILTERS: TradeFilterValues = { server: null };
const SERVERS: Server[] = ['CN', 'SEA', 'Global'];

export function TradePage() {
  const { t } = useTranslation();
  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters(INITIAL_FILTERS);
  const { listings, loading, error } = useTradeListings(filters.server ? { server: filters.server as Server } : undefined);
  const [query, setQuery] = useState('');

  const filterGroups = useMemo<FilterGroup<keyof TradeFilterValues>[]>(
    () => [
      {
        key: 'server',
        label: t('trade.filters.server'),
        options: SERVERS.map((server) => ({ label: t(SERVER_LABEL_KEYS[server]), value: server })),
      },
    ],
    [t]
  );

  const visibleListings = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return listings;
    return listings.filter((listing) => listing.title.toLowerCase().includes(trimmed));
  }, [listings, query]);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-8 sm:pt-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader title={t('trade.title')} description={t('trade.description')} />
          <Link
            to="/trade/new"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-accent-info px-5 text-sm font-bold text-canvas transition-opacity duration-200 hover:opacity-90"
          >
            {t('trade.postListing')}
          </Link>
        </div>
      </div>

      <div className="sticky top-16 z-30 border-b border-border bg-canvas/90 py-4 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-xl shadow-black/20 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('trade.searchPlaceholder')}
                className="h-12 w-full rounded-lg border border-border bg-elevated px-4 text-base text-foreground placeholder:text-subtle transition-colors duration-200 focus:border-accent-info/60 focus:outline-none lg:max-w-xs"
              />
              <FilterBar
                groups={filterGroups}
                values={filters}
                onChange={setFilter}
                onReset={hasActiveFilters ? resetFilters : undefined}
              />
            </div>
            <p className="text-xs font-medium text-subtle">
              {t('trade.resultCount', { count: visibleListings.length, total: listings.length })}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        {loading ? (
          <LoadingState label={t('common.loading')} />
        ) : error ? (
          <EmptyState icon={BurstIcon} title={t('common.errorTitle')} description={t('common.errorDescription')} />
        ) : (
          <TradeListingGrid listings={visibleListings} />
        )}
      </div>
    </>
  );
}
