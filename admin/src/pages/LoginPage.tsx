import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const inputClasses =
  'h-12 w-full rounded-md border border-border bg-canvas px-3.5 text-sm text-foreground placeholder:text-subtle transition-colors duration-200 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/15';

export function LoginPage() {
  const { state, signInWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.status === 'authorized' || state.status === 'forbidden') {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await signInWithPassword(email, password);
    setSubmitting(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(600px circle at 20% 20%, rgba(255,176,32,0.10), transparent 60%), radial-gradient(600px circle at 80% 80%, rgba(61,169,252,0.08), transparent 60%)',
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="relative flex w-full max-w-sm flex-col gap-4 overflow-hidden rounded-card border border-border bg-surface p-7 shadow-elevated-lg"
      >
        <div className="ops-dots pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-accent" />

        <div>
          <div className="mb-3 flex h-12 w-12 items-center justify-center bg-accent text-lg font-black text-canvas shadow-elevated ops-clip">
            S
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Officer Access Only</p>
          <h1 className="mt-0.5 text-xl font-extrabold uppercase tracking-wide text-foreground">S-Class Codex</h1>
          <p className="mt-1 text-sm text-muted">Sign in to reach the Ops Deck.</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-muted">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClasses}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-muted">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClasses}
          />
        </label>

        {error && (
          <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="ops-clip h-11 bg-accent text-sm font-bold uppercase tracking-wide text-canvas shadow-elevated transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-elevated-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
