import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function RequireAdmin() {
  const { state, signOut } = useAuth();

  if (state.status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  if (state.status === 'signed-out') {
    return <Navigate to="/login" replace />;
  }

  if (state.status === 'forbidden') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-bold text-foreground">Not an admin account</p>
        <p className="max-w-sm text-sm text-muted">
          You're signed in as <span className="font-semibold text-foreground">{state.user.email}</span>, but this
          account doesn't have admin access.
        </p>
        <button
          type="button"
          onClick={() => signOut()}
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-elevated"
        >
          Sign out
        </button>
      </div>
    );
  }

  return <Outlet />;
}
