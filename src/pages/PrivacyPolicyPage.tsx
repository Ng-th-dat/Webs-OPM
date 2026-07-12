import { LegalPage } from '@/components/common/LegalPage';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/i18n';

const SECTION_KEYS = [
  'legal.privacy.sections.dataStored',
  'legal.privacy.sections.noTracking',
  'legal.privacy.sections.thirdParty',
  'legal.privacy.sections.donation',
  'legal.privacy.sections.contact',
] as const;

export function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <LegalPage
      eyebrow={t('legal.privacy.eyebrow')}
      title={t('legal.privacy.title')}
      updated={t('legal.privacy.updated')}
      intro={t('legal.privacy.intro')}
      contactLabel={t('legal.contactChannelLabel')}
      sections={SECTION_KEYS.map((key) => ({
        title: t(`${key}.title` as TranslationKey),
        body: t(`${key}.body` as TranslationKey),
      }))}
    />
  );
}
