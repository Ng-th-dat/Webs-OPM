import { ComingSoonPage } from '@/components/common/ComingSoonPage';
import { CalculatorIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

export function SpecCalculatorPage() {
  const { t } = useTranslation();

  return (
    <ComingSoonPage
      icon={CalculatorIcon}
      title={t('comingSoonPages.specCalculator.title')}
      description={t('comingSoonPages.specCalculator.description')}
    />
  );
}
