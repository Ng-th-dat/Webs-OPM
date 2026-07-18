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
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
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
          className="comic-pill col-span-2 h-11 px-4 text-xs sm:col-span-1"
        >
          {t('common.resetFilters')}
        </button>
      )}
    </div>
  );
}
