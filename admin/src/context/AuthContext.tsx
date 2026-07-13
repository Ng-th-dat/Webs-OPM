import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type AdminAuthState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'forbidden'; user: User }
  | { status: 'authorized'; user: User };

interface AuthContextValue {
  state: AdminAuthState;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function resolveState(user: User | null): Promise<AdminAuthState> {
  if (!user) return { status: 'signed-out' };
  const { data, error } = await supabase.rpc('is_admin');
  if (error || !data) return { status: 'forbidden', user };
  return { status: 'authorized', user };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminAuthState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data }) => {
      const next = await resolveState(data.session?.user ?? null);
      if (!cancelled) setState(next);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveState(session?.user ?? null).then((next) => {
        if (!cancelled) setState(next);
      });
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return <AuthContext.Provider value={{ state, signInWithPassword, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
