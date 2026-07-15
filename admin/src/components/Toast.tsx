import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckIcon, XIcon } from './icons';

type ToastVariant = 'success' | 'error';

interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
  leaving: boolean;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4000;
const EXIT_ANIMATION_MS = 180;

const VARIANT_STYLES: Record<ToastVariant, { chip: string; bar: string }> = {
  success: {
    chip: 'bg-success',
    bar: 'bg-success',
  },
  error: {
    chip: 'bg-danger',
    bar: 'bg-danger',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const startExit = useCallback(
    (id: number) => {
      setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
      setTimeout(() => remove(id), EXIT_ANIMATION_MS);
    },
    [remove]
  );

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, variant, leaving: false }]);
      setTimeout(() => startExit(id), AUTO_DISMISS_MS);
    },
    [startExit]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col-reverse items-end gap-2.5 sm:inset-x-auto sm:right-5 sm:bottom-5">
        {toasts.map((toast) => {
          const style = VARIANT_STYLES[toast.variant];
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface/95 shadow-elevated backdrop-blur-sm ${
                toast.leaving ? 'animate-toast-out' : 'animate-toast-in'
              }`}
            >
              <div className="flex items-start gap-3 px-4 py-3.5">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${style.chip}`}
                >
                  {toast.variant === 'success' ? (
                    <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : (
                    <XIcon className="h-3.5 w-3.5" strokeWidth={3} />
                  )}
                </span>
                <p className="flex-1 pt-0.5 text-sm font-semibold leading-snug text-foreground">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => startExit(toast.id)}
                  aria-label="Dismiss"
                  className="shrink-0 rounded-full p-1 text-subtle transition-colors hover:bg-elevated hover:text-foreground"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="h-[3px] w-full bg-elevated">
                <div
                  className={`h-full origin-left ${style.bar} ${toast.leaving ? '' : 'animate-toast-bar'}`}
                  style={{ animationDuration: `${AUTO_DISMISS_MS}ms` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
