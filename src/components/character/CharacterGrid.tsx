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
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-3 pl-8 shadow-inner shadow-black/20 sm:p-4 sm:pl-10 lg:pl-12">
      <div aria-hidden="true" className="comic-dots pointer-events-none absolute inset-0 opacity-[0.04]" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 left-3 top-6 hidden flex-col items-center justify-evenly lg:flex"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} className="h-2.5 w-2.5 rounded-full border border-border bg-canvas shadow-inner" />
        ))}
      </div>

      <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {characters.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
    </div>
  );
}
