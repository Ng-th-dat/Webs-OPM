import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCharacters } from '@/hooks/useCharacters';
import { CharacterGrid } from '@/components/character/CharacterGrid';
import { SearchInput } from '@/components/common/SearchInput';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { BurstIcon } from '@/components/common/icons';
import { FilterBar, type FilterGroup } from '@/components/data-table/FilterBar';
import { RarityFilterChips } from '@/components/data-table/RarityFilterChips';
import { useFilters } from '@/hooks/useFilters';
import { useSeo } from '@/hooks/useSeo';
import { useTranslation } from '@/hooks/useTranslation';
import { filterCharacters, getUniqueSortedValues, searchCharacters, sortCharactersByDebutDesc } from '@/utils/characters';
import type { CharacterFilterValues } from '@/types/character';

const INITIAL_FILTERS: CharacterFilterValues = {
  rarity: null,
  type: null,
  faction: null,
  role: null,
};

export function CharactersPage() {
  const { t } = useTranslation();
  useSeo({ title: t('characters.title'), description: t('characters.description') });
  const { characters, loading, error } = useCharacters();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters(INITIAL_FILTERS);

  const filterGroups = useMemo<FilterGroup<keyof CharacterFilterValues>[]>(
    () => [
      {
        key: 'type',
        label: t('characters.filters.type'),
        options: getUniqueSortedValues(characters, 'type').map((value) => ({
          label: value,
          value,
        })),
      },
      {
        key: 'faction',
        label: t('characters.filters.faction'),
        options: getUniqueSortedValues(characters, 'faction').map((value) => ({
          label: value,
          value,
        })),
      },
      {
        key: 'role',
        label: t('characters.filters.role'),
        options: getUniqueSortedValues(characters, 'role').map((value) => ({
          label: value,
          value,
        })),
      },
    ],
    [t, characters]
  );

  const visibleCharacters = useMemo(() => {
    const searched = searchCharacters(characters, query);
    return sortCharactersByDebutDesc(filterCharacters(searched, filters));
  }, [characters, query, filters]);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-8 sm:pt-14">
        <PageHeader eyebrow={t('characters.eyebrow')} title={t('characters.title')} description={t('characters.description')} />
      </div>

      <div className="sticky top-16 z-30 border-b border-border bg-canvas py-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-xl shadow-black/20 sm:p-5">
            <div aria-hidden="true" className="comic-dots pointer-events-none absolute inset-0 opacity-[0.04]" />
            <div className="relative flex flex-col gap-4">
              <RarityFilterChips value={filters.rarity} onChange={(value) => setFilter('rarity', value)} />
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder={t('characters.searchPlaceholder')}
                  className="lg:max-w-xs"
                />
                <FilterBar
                  groups={filterGroups}
                  values={filters}
                  onChange={setFilter}
                  onReset={hasActiveFilters ? resetFilters : undefined}
                />
              </div>
              <p className="text-xs font-medium text-subtle">
                {t('characters.resultCount', {
                  count: visibleCharacters.length,
                  total: characters.length,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        {loading ? (
          <LoadingState label={t('common.loading')} />
        ) : error ? (
          <EmptyState icon={BurstIcon} title={t('common.errorTitle')} description={t('common.errorDescription')} />
        ) : (
          <CharacterGrid characters={visibleCharacters} />
        )}
      </div>
    </>
  );
}
