import { useEffect } from 'react';
import { XIcon } from './icons';
import { useTranslation } from '@/hooks/useTranslation';

interface ImageLightboxProps {
  src: string | null;
  alt?: string;
  /** Extra classes merged onto the <img> — e.g. to keep an intentionally-obscured thumbnail
   * (like an unconfirmed Intel leak) equally obscured at full size, not "leak" a clear view. */
  imgClassName?: string;
  onClose: () => void;
}

export function ImageLightbox({ src, alt = '', imgClassName = '', onClose }: ImageLightboxProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!src) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [src, onClose]);

  useEffect(() => {
    if (!src) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [src]);

  if (!src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('common.viewImage')}
      className="animate-backdrop-in overscroll-contain fixed inset-0 z-[100] flex items-center justify-center bg-canvas/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t('common.closeImage')}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors duration-200 hover:bg-elevated"
      >
        <XIcon className="h-5 w-5" />
      </button>
      <img
        src={src}
        alt={alt}
        onClick={(event) => event.stopPropagation()}
        className={`animate-modal-in max-h-[85vh] max-w-full rounded-lg border border-border object-contain shadow-2xl shadow-black/50 ${imgClassName}`}
      />
    </div>
  );
}
