import type { BadgeOption } from '@/lib/badges';
import { CheckIcon } from './icons';

interface BadgeSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: BadgeOption[];
}

export function BadgeSelect({ value, onChange, options }: BadgeSelectProps) {
  const hasIcons = options.some((option) => option.icon);

  if (hasIcons) {
    return (
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isActive}
              className={`group relative flex w-20 flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all duration-200 ${
                isActive
                  ? 'border-accent/50 bg-accent/10 shadow-elevated'
                  : 'border-border bg-elevated hover:-translate-y-0.5 hover:border-accent/30 hover:bg-surface hover:shadow-elevated'
              }`}
            >
              {isActive && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-canvas shadow-elevated ring-2 ring-surface">
                  <CheckIcon className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
              {/* Badge art is drawn assuming a light backdrop — an intentional light "insignia
                  plate" behind it, not a leftover light-theme default. */}
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 ring-1 ring-black/5 transition-all duration-200 ${
                  isActive ? 'scale-105 shadow-elevated' : 'group-hover:scale-105'
                }`}
              >
                {option.icon ? (
                  <img src={option.icon} alt="" className="h-7 w-7 object-contain" />
                ) : (
                  <span className="text-xs font-bold text-subtle">{option.value.slice(0, 1)}</span>
                )}
              </span>
              <span className={`text-[11px] font-semibold leading-tight ${isActive ? 'text-accent' : 'text-muted'}`}>
                {option.value}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
              isActive
                ? 'border-transparent text-white shadow-sm'
                : 'border-border bg-elevated text-muted hover:-translate-y-0.5 hover:border-accent/40 hover:text-foreground'
            }`}
            style={
              isActive
                ? { background: option.color ?? 'var(--color-accent)' }
                : undefined
            }
          >
            {option.color && (
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${isActive ? 'bg-white/80' : ''}`}
                style={!isActive ? { backgroundColor: option.color } : undefined}
              />
            )}
            {isActive && <CheckIcon className="h-3 w-3 shrink-0" strokeWidth={3} />}
            {option.value}
          </button>
        );
      })}
    </div>
  );
}
