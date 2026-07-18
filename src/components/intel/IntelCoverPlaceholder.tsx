import { SearchIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

interface IntelCoverPlaceholderProps {
  size?: 'sm' | 'lg';
}

/** Stands in for a dossier's cover image before an actual leak crop exists — a diagonal
 * watermark instead of a dead/empty box, so the common no-image case still reads as designed. */
export function IntelCoverPlaceholder({ size = 'sm' }: IntelCoverPlaceholderProps) {
  const { t } = useTranslation();

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -rotate-12 select-none whitespace-nowrap font-black uppercase tracking-[0.2em] text-foreground/15 ${
          size === 'lg' ? 'text-7xl' : 'text-3xl'
        }`}
      >
        {t('intel.coverWatermark')}
      </span>
      <SearchIcon className={`relative text-subtle/70 ${size === 'lg' ? 'h-12 w-12' : 'h-8 w-8'}`} />
    </div>
  );
}
