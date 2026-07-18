import { RARITY_CSS_VAR, RARITY_ORDER, RARITY_STYLES } from '@/utils/rarity';
import { useTranslation } from '@/hooks/useTranslation';

interface RarityFilterChipsProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function RarityFilterChips({ value, onChange }: RarityFilterChipsProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label={t('characters.filters.tier')}
    >
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={value === null}
        className={`h-9 rounded-md border px-3 text-xs font-bold uppercase tracking-wide transition-colors duration-150 ${
          value === null
            ? 'border-foreground bg-foreground text-canvas'
            : 'border-border text-subtle hover:border-accent/40 hover:text-foreground'
        }`}
      >
        {t('common.all')}
      </button>

      {RARITY_ORDER.map((rarity) => {
        const isActive = value === rarity;
        return (
          <button
            key={rarity}
            type="button"
            onClick={() => onChange(isActive ? null : rarity)}
            aria-pressed={isActive}
            className={`h-9 rounded-md border px-3 text-xs font-extrabold uppercase tracking-wide shadow-[0_2px_0_rgba(0,0,0,0.3)] transition-transform duration-150 hover:scale-105 ${RARITY_STYLES[rarity]} ${
              isActive ? 'scale-105' : 'bg-canvas/60'
            }`}
            style={
              isActive
                ? {
                    backgroundColor: RARITY_CSS_VAR[rarity],
                    borderColor: RARITY_CSS_VAR[rarity],
                    color: 'var(--color-canvas)',
                  }
                : undefined
            }
          >
            {rarity}
          </button>
        );
      })}
    </div>
  );
}
