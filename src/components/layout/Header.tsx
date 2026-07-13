import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from './Navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileDrawer } from './MobileDrawer';
import { LogoMark } from './LogoMark';
import { AccountMenu } from './AccountMenu';
import { MenuIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMenuOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-40">
      <div aria-hidden="true" className="comic-surface comic-jagged-bottom absolute inset-0" />

      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
        <Link
          to="/"
          className="group flex items-center gap-2.5"
          onClick={() => setIsMenuOpen(false)}
        >
          <LogoMark />
          <span className="text-lg font-extrabold tracking-tight text-canvas">
            S-Class Codex
          </span>
        </Link>

        <Navigation
          className="hidden items-center gap-2 lg:flex"
          linkClassName="h-10 px-3.5 text-sm"
        />

        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <AccountMenu />
          </div>

          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          <button
            type="button"
            aria-label={isMenuOpen ? t('common.closeMenu') : t('common.openMenu')}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="comic-pill h-11 w-11 lg:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <MobileDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
}
