import { useParams } from 'react-router-dom';
import { useCharacter } from '@/hooks/useCharacter';
import { CharacterDetail } from '@/components/character/CharacterDetail';
import { BackLink } from '@/components/common/BackLink';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { BurstIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { NotFoundPage } from './NotFoundPage';

export function CharacterDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { character, loading, error } = useCharacter(slug);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl overflow-x-hidden px-4 py-16 sm:px-8 sm:py-20">
        <BackLink to="/characters">{t('common.backToCharacters')}</BackLink>
        <LoadingState label={t('common.loading')} className="mt-8" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-6xl overflow-x-hidden px-4 py-16 sm:px-8 sm:py-20">
        <BackLink to="/characters">{t('common.backToCharacters')}</BackLink>
        <EmptyState
          icon={BurstIcon}
          title={t('common.errorTitle')}
          description={t('common.errorDescription')}
          className="mt-8"
        />
      </section>
    );
  }

  if (!character) {
    return <NotFoundPage />;
  }

  return (
    <section className="mx-auto max-w-6xl overflow-x-hidden px-4 py-16 sm:px-8 sm:py-20">
      <BackLink to="/characters">{t('common.backToCharacters')}</BackLink>

      <CharacterDetail character={character} />
    </section>
  );
}
