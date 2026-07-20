import { FeatureCard } from '@/components/home/FeatureCard';
import { CalculatorIcon, CoinIcon, GaugeIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { useSeo } from '@/hooks/useSeo';
import type { TranslationKey } from '@/i18n';

const CALCULATORS: {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  href: string;
  icon: typeof CalculatorIcon;
}[] = [
  {
    titleKey: 'home.features.specCalculator.title',
    descriptionKey: 'home.features.specCalculator.description',
    href: '/spec-calculator',
    icon: CalculatorIcon,
  },
  {
    titleKey: 'home.features.coreLabCalculator.title',
    descriptionKey: 'home.features.coreLabCalculator.description',
    href: '/core-lab-calculator',
    icon: GaugeIcon,
  },
  {
    titleKey: 'home.features.ticketCalculator.title',
    descriptionKey: 'home.features.ticketCalculator.description',
    href: '/ticket-calculator',
    icon: CoinIcon,
  },
];

export function CalculatorsPage() {
  const { t } = useTranslation();
  useSeo({ title: t('calculators.title'), description: t('calculators.description') });

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
      <div className="mb-10 flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent-info">
          {t('calculators.eyebrow')}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t('calculators.title')}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          {t('calculators.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATORS.map((calculator) => (
          <FeatureCard
            key={calculator.href}
            title={t(calculator.titleKey)}
            description={t(calculator.descriptionKey)}
            href={calculator.href}
            icon={calculator.icon}
          />
        ))}
      </div>
    </section>
  );
}
