import { useTranslation } from '@/hooks/useTranslation';
import { SelectFilter } from './SelectFilter';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup<K extends string = string> {
  key: K;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps<K extends string> {
  groups: FilterGroup<K>[];
  values: Record<K, string | null>;
  onChange: (key: K, value: string | null) => void;
  onReset?: () => void;
}

export function FilterBar<K extends string>({ groups, values, onChange, onReset }: FilterBarProps<K>) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {groups.map((group) => (
        <SelectFilter
          key={group.key}
          id={`filter-${group.key}`}
          label={group.label}
          allLabel={t('common.all')}
          value={values[group.key]}
          options={group.options}
          onChange={(value) => onChange(group.key, value)}
        />
      ))}

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-11 items-center rounded-lg border border-border px-3 text-sm font-medium text-muted transition-colors duration-200 hover:border-accent/40 hover:text-foreground"
        >
          {t('common.resetFilters')}
        </button>
      )}
    </div>
  );
}
