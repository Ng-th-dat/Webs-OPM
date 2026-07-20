import { HeroSection } from '@/components/home/HeroSection';
import { useSeo } from '@/hooks/useSeo';
import { useTranslation } from '@/hooks/useTranslation';
import { buildWebsiteJsonLd } from '@/utils/seo';

export function HomePage() {
  const { t } = useTranslation();
  const description = t('home.tagline');

  useSeo({
    title: t('home.hero.headline'),
    description,
    jsonLd: buildWebsiteJsonLd(description),
  });

  return <HeroSection />;
}
