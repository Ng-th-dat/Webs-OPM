import { Link } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { AtomIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { useSeo } from '@/hooks/useSeo';
import type { TranslationKey } from '@/i18n';

const GUIDE_SECTION_KEYS: { titleKey: TranslationKey; descriptionKey: TranslationKey }[] = [
  {
    titleKey: 'coreLab.sections.coreSelection.title',
    descriptionKey: 'coreLab.sections.coreSelection.description',
  },
  {
    titleKey: 'coreLab.sections.unlockedBuffs.title',
    descriptionKey: 'coreLab.sections.unlockedBuffs.description',
  },
  {
    titleKey: 'coreLab.sections.resourcePlanning.title',
    descriptionKey: 'coreLab.sections.resourcePlanning.description',
  },
];

export function CoreLabPage() {
  const { t } = useTranslation();
  useSeo({ title: t('coreLab.title'), description: t('coreLab.description') });

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
      <div className="mb-10 flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent-info">
          {t('coreLab.eyebrow')}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t('coreLab.title')}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">{t('coreLab.description')}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-subtle">
            {t('coreLab.guideTitle')}
          </h2>
          {GUIDE_SECTION_KEYS.map((section) => (
            <div
              key={section.titleKey}
              className="rounded-card border border-border bg-surface p-5"
            >
              <h3 className="text-base font-semibold text-foreground">{t(section.titleKey)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {t(section.descriptionKey)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-subtle">
            {t('coreLab.calculatorTitle')}
          </h2>
          <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-surface px-6 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-elevated text-accent">
              <AtomIcon className="h-5 w-5" />
            </span>
            <Badge>{t('common.comingSoon')}</Badge>
            <p className="text-sm leading-relaxed text-muted">{t('coreLab.calculatorPreview')}</p>
            <Link
              to="/core-lab-calculator"
              className="text-sm font-medium text-accent-info transition-colors duration-200 hover:text-foreground"
            >
              {t('coreLab.calculatorLink')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
