import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePhieuBalance } from '@/hooks/usePhieuBalance';
import { useLoginModal } from '@/context/LoginModalContext';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronDownIcon, CoinIcon, LogOutIcon, UserIcon } from '@/components/common/icons';

interface AccountMenuItemsProps {
  onItemClick?: () => void;
  className?: string;
}

export function AccountMenuItems({ onItemClick, className = '' }: AccountMenuItemsProps) {
  const { user, signOut } = useAuth();
  const { balance } = usePhieuBalance(user?.id);
  const { open } = useLoginModal();
  const { t } = useTranslation();

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => {
          open();
          onItemClick?.();
        }}
        className={`comic-pill inline-flex h-11 w-full items-center gap-2 px-4 text-sm ${className}`}
      >
        <UserIcon className="h-4 w-4" />
        {t('auth.login')}
      </button>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="truncate px-1 text-xs font-medium text-subtle">{user.email}</span>
      <Link
        to="/wallet"
        onClick={onItemClick}
        className="comic-pill inline-flex h-11 w-full items-center gap-2 px-4 text-sm"
      >
        <CoinIcon className="h-4 w-4" />
        {balance} {t('wallet.tokenUnit')}
      </Link>
      <button
        type="button"
        onClick={() => {
          signOut();
          onItemClick?.();
        }}
        className="comic-pill inline-flex h-11 w-full items-center gap-2 px-4 text-sm"
      >
        <LogOutIcon className="h-4 w-4" />
        {t('auth.logout')}
      </button>
    </div>
  );
}

export function AccountMenu() {
  const { user } = useAuth();
  const { open: openLoginModal } = useLoginModal();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user) {
    return (
      <button type="button" onClick={openLoginModal} className="comic-pill inline-flex h-11 items-center gap-2 px-4 text-sm">
        <UserIcon className="h-4 w-4" />
        {t('auth.login')}
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="comic-pill inline-flex h-11 max-w-[10rem] items-center gap-1.5 px-4 text-sm"
      >
        <UserIcon className="h-4 w-4 shrink-0" />
        <span className="truncate">{user.email}</span>
        <ChevronDownIcon className="h-3.5 w-3.5 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-card border border-border bg-surface p-2 shadow-2xl">
          <AccountMenuItems onItemClick={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
