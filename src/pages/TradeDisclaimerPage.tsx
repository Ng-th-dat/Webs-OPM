import { LegalPage } from '@/components/common/LegalPage';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/i18n';

const SECTION_KEYS = [
  'legal.tradeDisclaimer.sections.noMediation',
  'legal.tradeDisclaimer.sections.ownRisk',
  'legal.tradeDisclaimer.sections.notAParty',
  'legal.tradeDisclaimer.sections.publisherTos',
  'legal.tradeDisclaimer.sections.contact',
] as const;

export function TradeDisclaimerPage() {
  const { t } = useTranslation();

  return (
    <LegalPage
      eyebrow={t('legal.tradeDisclaimer.eyebrow')}
      title={t('legal.tradeDisclaimer.title')}
      updated={t('legal.tradeDisclaimer.updated')}
      intro={t('legal.tradeDisclaimer.intro')}
      contactLabel={t('legal.contactChannelLabel')}
      sections={SECTION_KEYS.map((key) => ({
        title: t(`${key}.title` as TranslationKey),
        body: t(`${key}.body` as TranslationKey),
      }))}
    />
  );
}
