import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLoginModal } from '@/context/LoginModalContext';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { UserIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

export function RequireAuth() {
  const { user, initializing } = useAuth();
  const { open, isOpen } = useLoginModal();
  const { t } = useTranslation();

  useEffect(() => {
    if (!initializing && !user) open();
  }, [initializing, user, open]);

  if (initializing) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
        <LoadingState label={t('common.loading')} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
        <EmptyState icon={UserIcon} title={t('auth.loginTitle')} description={t('auth.loginDescription')} />
        {!isOpen && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={open}
              className="inline-flex h-11 items-center rounded-lg bg-accent-info px-5 text-sm font-bold text-canvas transition-opacity duration-200 hover:opacity-90"
            >
              {t('auth.login')}
            </button>
          </div>
        )}
      </div>
    );
  }

  return <Outlet />;
}
