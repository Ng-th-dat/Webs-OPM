import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { CoinIcon, XIcon } from '@/components/common/icons';

const TOPUP_URL = 'https://opmts.site/';

interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TopupModal({ isOpen, onClose }: TopupModalProps) {
  const { t } = useTranslation();
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) setIframeLoaded(false);
  }, [isOpen]);

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
      aria-label={t('topupWidget.modalTitle')}
      className="animate-backdrop-in overscroll-contain fixed inset-0 z-[100] flex items-center justify-center bg-canvas/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="animate-modal-in relative flex h-full max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-card border border-border bg-surface shadow-2xl shadow-black/40"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-elevated px-4 py-3">
          <div className="flex items-center gap-2">
            <CoinIcon className="h-5 w-5 text-accent-secondary" />
            <span className="text-sm font-bold uppercase tracking-wide text-foreground">
              {t('topupWidget.modalTitle')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={TOPUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-xs font-semibold text-accent-info transition-colors duration-200 hover:text-foreground sm:inline"
            >
              {t('topupWidget.openInNewTab')}
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('topupWidget.closeLabel')}
              className="flex h-8 w-8 items-center justify-center rounded-full text-subtle transition-colors duration-200 hover:bg-canvas hover:text-foreground"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-canvas">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-subtle">{t('topupWidget.loading')}</span>
            </div>
          )}
          <iframe
            src={TOPUP_URL}
            title={t('topupWidget.modalTitle')}
            onLoad={() => setIframeLoaded(true)}
            className={`h-full w-full border-0 transition-opacity duration-300 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
      </div>
    </div>
  );
}
