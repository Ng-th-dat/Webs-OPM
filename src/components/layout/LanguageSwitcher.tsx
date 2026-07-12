import { useTranslation } from '@/hooks/useTranslation';
import type { Language } from '@/i18n';

const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'vi', label: 'VN' },
];

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className="inline-flex items-center rounded-full border border-border bg-surface p-0.5"
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <button
          key={option.code}
          type="button"
          aria-pressed={language === option.code}
          onClick={() => setLanguage(option.code)}
          className={`h-8 rounded-full px-3 text-xs font-semibold transition-colors duration-200 ${
            language === option.code
              ? 'bg-accent-secondary text-canvas'
              : 'text-subtle hover:text-foreground'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
