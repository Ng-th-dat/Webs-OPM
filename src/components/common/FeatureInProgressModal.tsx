import { useEffect } from 'react';
import { Badge } from './Badge';
import { SparklesIcon, XIcon } from './icons';
import { useTranslation } from '@/hooks/useTranslation';

interface FeatureInProgressModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

export function FeatureInProgressModal({ isOpen, title, description, onClose }: FeatureInProgressModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="animate-backdrop-in overscroll-contain fixed inset-0 z-[100] flex items-center justify-center bg-canvas/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="animate-modal-in relative flex w-full max-w-sm flex-col items-center gap-3 rounded-card border border-border bg-surface p-6 text-center shadow-2xl shadow-black/40"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-subtle transition-colors duration-200 hover:bg-canvas hover:text-foreground"
        >
          <XIcon className="h-4 w-4" />
        </button>

        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-canvas text-accent">
          <SparklesIcon className="h-5 w-5" />
        </span>
        <Badge>{t('common.comingSoon')}</Badge>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted">{description}</p>
      </div>
    </div>
  );
}
