import { ChevronDownIcon } from '@/components/common/icons';

export interface SelectFilterOption {
  label: string;
  value: string;
}

interface SelectFilterProps {
  id: string;
  label: string;
  allLabel?: string;
  value: string | null;
  options: SelectFilterOption[];
  onChange: (value: string | null) => void;
}

export function SelectFilter({ id, label, allLabel, value, options, onChange }: SelectFilterProps) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
        className="h-11 min-w-[9.5rem] appearance-none rounded-lg border border-border bg-elevated pl-3.5 pr-9 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent-info/40 focus:border-accent-info/60 focus:outline-none focus:ring-2 focus:ring-accent-info/20"
      >
        {allLabel && (
          <option value="">
            {allLabel} {label}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
    </div>
  );
}
