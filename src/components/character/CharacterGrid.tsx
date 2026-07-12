import type { Character } from '@/types/character';
import { EmptyState } from '@/components/common/EmptyState';
import { UsersIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { CharacterCard } from './CharacterCard';

interface CharacterGridProps {
  characters: Character[];
}

export function CharacterGrid({ characters }: CharacterGridProps) {
  const { t } = useTranslation();

  if (characters.length === 0) {
    return (
      <EmptyState
        icon={UsersIcon}
        title={t('characters.emptyTitle')}
        description={t('characters.emptyDescription')}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {characters.map((character) => (
        <CharacterCard key={character.id} character={character} />
      ))}
    </div>
  );
}
