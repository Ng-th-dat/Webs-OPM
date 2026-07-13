import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLoginModal } from '@/context/LoginModalContext';
import { useTranslation } from '@/hooks/useTranslation';
import { UserIcon, XIcon } from '@/components/common/icons';

const inputClasses =
  'h-12 w-full rounded-lg border border-border bg-elevated px-4 text-base text-foreground placeholder:text-subtle transition-all duration-200 focus:border-accent-info/60 focus:outline-none focus:ring-2 focus:ring-accent-info/20';

type Mode = 'login' | 'signup';

export function LoginModal() {
  const { isOpen, close } = useLoginModal();
  const { user, signInWithPassword, signUpWithPassword } = useAuth();
  const { t } = useTranslation();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupNotice, setSignupNotice] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }
    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) {
      setMode('login');
      setEmail('');
      setPassword('');
      setError(null);
      setSignupNotice(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) close();
  }, [user, close]);

  if (!isOpen) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSignupNotice(false);
    setSubmitting(true);

    const result = mode === 'login' ? await signInWithPassword(email, password) : await signUpWithPassword(email, password);

    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (mode === 'signup') {
      setSignupNotice(true);
    }
  }

  return (
    <div
      className="animate-backdrop-in fixed inset-0 z-[100] flex items-center justify-center bg-canvas/70 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="animate-modal-in relative w-full max-w-sm rounded-card border border-border bg-surface p-6 shadow-2xl shadow-black/40 sm:p-7"
      >
        <button
          type="button"
          onClick={close}
          aria-label={t('common.closeMenu')}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-subtle transition-colors duration-200 hover:bg-elevated hover:text-foreground"
        >
          <XIcon className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent-info to-accent-glow text-canvas shadow-[0_0_30px_-8px_var(--color-accent-info)]">
            <UserIcon className="h-5 w-5" />
          </span>
          <h2 id="login-modal-title" className="text-xl font-extrabold tracking-tight text-foreground">
            {t(mode === 'login' ? 'auth.loginTitle' : 'auth.signupTitle')}
          </h2>
          <p className="text-sm text-muted">{t(mode === 'login' ? 'auth.loginDescription' : 'auth.signupDescription')}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t('auth.emailLabel')}</span>
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClasses}
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t('auth.passwordLabel')}</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClasses}
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}
          {signupNotice && <p className="text-sm text-accent-info">{t('auth.signupCheckEmail')}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 h-12 rounded-lg bg-gradient-to-r from-accent-info to-[#5fc4ff] text-sm font-bold text-canvas shadow-[0_10px_25px_-10px_var(--color-accent-info)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-10px_var(--color-accent-info)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
          >
            {submitting ? t('common.loading') : t(mode === 'login' ? 'auth.loginButton' : 'auth.signupButton')}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((current) => (current === 'login' ? 'signup' : 'login'));
            setError(null);
            setSignupNotice(false);
          }}
          className="mt-4 w-full text-center text-sm font-medium text-accent-info transition-opacity hover:opacity-80"
        >
          {t(mode === 'login' ? 'auth.switchToSignup' : 'auth.switchToLogin')}
        </button>
      </div>
    </div>
  );
}
