import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { buttonClasses } from '@/lib/buttonStyles';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
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
          className="animate-backdrop-in fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
          onClick={() => settle(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="animate-modal-in relative w-full max-w-sm overflow-hidden rounded-card border border-border bg-surface p-6 shadow-elevated-lg"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 ${options.variant === 'danger' ? 'bg-danger' : 'bg-accent'}`}
            />
            <h2 id="confirm-dialog-title" className="text-lg font-bold text-foreground">
              {options.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{options.message}</p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button type="button" onClick={() => settle(false)} className={buttonClasses('ghost', 'sm')}>
                {options.cancelLabel ?? 'Cancel'}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => settle(true)}
                className={buttonClasses(options.variant === 'danger' ? 'danger' : 'primary', 'sm')}
              >
                {options.confirmLabel ?? 'Confirm'}
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
