import { ComingSoonPage } from '@/components/common/ComingSoonPage';
import { GaugeIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

export function CoreLabCalculatorPage() {
  const { t } = useTranslation();

  return (
    <ComingSoonPage
      icon={GaugeIcon}
      title={t('comingSoonPages.coreLabCalculator.title')}
      description={t('comingSoonPages.coreLabCalculator.description')}
    />
  );
}
