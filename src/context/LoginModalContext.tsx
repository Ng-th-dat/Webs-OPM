import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface LoginModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const LoginModalContext = createContext<LoginModalContextValue | null>(null);

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return <LoginModalContext.Provider value={{ isOpen, open, close }}>{children}</LoginModalContext.Provider>;
}

export function useLoginModal(): LoginModalContextValue {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error('useLoginModal must be used within a LoginModalProvider');
  }
  return context;
}
