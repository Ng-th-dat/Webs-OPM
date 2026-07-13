import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant?: 'default' | 'danger';
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((next) => {
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const settle = useCallback((result: boolean) => {
    setOptions(null);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }, []);

  useEffect(() => {
    if (!options) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') settle(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, settle]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div
          className="animate-backdrop-in fixed inset-0 z-[100] flex items-center justify-center bg-canvas/70 p-4 backdrop-blur-sm"
          onClick={() => settle(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="animate-modal-in w-full max-w-sm rounded-card border border-border bg-surface p-6 shadow-2xl shadow-black/40"
          >
            <h2 id="confirm-dialog-title" className="text-lg font-bold text-foreground">
              {options.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{options.message}</p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => settle(false)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition-colors hover:bg-elevated hover:text-foreground"
              >
                {options.cancelLabel}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => settle(true)}
                className={`rounded-full px-5 py-2 text-sm font-bold text-canvas shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${
                  options.variant === 'danger' ? 'bg-accent' : 'bg-accent-info'
                }`}
              >
                {options.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  return context;
}
