import { useMemo, useState } from 'react';

export function useFilters<T extends { [K in keyof T]: string | null }>(initialValues: T) {
  const [filters, setFilters] = useState<T>(initialValues);

  function setFilter(key: keyof T, value: string | null) {
    setFilters((current) => ({ ...current, [key]: value }) as T);
  }

  function resetFilters() {
    setFilters(initialValues);
  }

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => value !== null),
    [filters]
  );

  return { filters, setFilter, resetFilters, hasActiveFilters };
}
