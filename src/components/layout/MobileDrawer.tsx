import { useEffect } from 'react';
import { Navigation } from './Navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ArrowUpIcon, XIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function handleBackToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onClose();
  }

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label={t('common.mainNavigation')}
        className={`comic-surface comic-jagged-left absolute right-0 top-0 flex h-full w-[78%] max-w-xs flex-col gap-3 overflow-y-auto py-6 pl-8 pr-5 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            aria-label={t('common.closeMenu')}
            onClick={onClose}
            className="comic-pill h-11 w-11"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <Navigation
          className="flex flex-col gap-3"
          linkClassName="h-12 w-full text-sm"
          onLinkClick={onClose}
        />

        <div className="my-2 flex items-center justify-between gap-3 border-t-2 border-black/25 pt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-canvas/80">
            {t('common.language')}
          </span>
          <LanguageSwitcher />
        </div>

        <button type="button" onClick={handleBackToTop} className="comic-pill h-12 w-full text-sm">
          <ArrowUpIcon className="h-4 w-4" />
          {t('common.backToTop')}
        </button>
      </div>
    </div>
  );
}
