import { SearchIcon, XIcon } from './icons';
import { useTranslation } from '@/hooks/useTranslation';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className = '' }: SearchInputProps) {
  const { t } = useTranslation();

  return (
    <div className={`relative ${className}`}>
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder ?? t('common.search')}
        className="h-11 w-full rounded-lg border border-border bg-elevated pl-11 pr-11 text-base text-foreground placeholder:text-subtle transition-colors duration-200 hover:border-accent-info/40 focus:border-accent-info/60 focus:outline-none focus:shadow-[0_0_0_3px_rgba(61,169,252,0.15)]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t('common.clearSearch')}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-subtle transition-colors duration-200 hover:text-foreground"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
