import { LegalPage } from '@/components/common/LegalPage';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/i18n';

const SECTION_KEYS = [
  'legal.disclaimer.sections.ownership',
  'legal.disclaimer.sections.nonCommercial',
  'legal.disclaimer.sections.takedown',
  'legal.disclaimer.sections.contact',
] as const;

export function DisclaimerPage() {
  const { t } = useTranslation();

  return (
    <LegalPage
      eyebrow={t('legal.disclaimer.eyebrow')}
      title={t('legal.disclaimer.title')}
      updated={t('legal.disclaimer.updated')}
      intro={t('legal.disclaimer.intro')}
      contactLabel={t('legal.contactChannelLabel')}
      sections={SECTION_KEYS.map((key) => ({
        title: t(`${key}.title` as TranslationKey),
        body: t(`${key}.body` as TranslationKey),
      }))}
    />
  );
}
