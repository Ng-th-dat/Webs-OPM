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
    <div className="relative w-full sm:w-auto">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
        className="h-11 w-full appearance-none rounded-lg border border-border bg-elevated pl-3.5 pr-9 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent-info/40 focus:border-accent-info/60 focus:outline-none focus:shadow-[0_0_0_3px_rgba(61,169,252,0.15)] sm:w-auto sm:min-w-[9.5rem]"
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
