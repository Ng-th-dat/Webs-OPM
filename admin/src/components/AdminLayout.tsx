import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { fetchAllTradeListings } from '@/lib/tradeListings';
import { fetchAllTopups } from '@/lib/wallet';
import {
  AtomIcon,
  BellIcon,
  CalendarIcon,
  CoinIcon,
  ExternalLinkIcon,
  GridIcon,
  HelpCircleIcon,
  LockIcon,
  LogOutIcon,
  MegaphoneIcon,
  PlusIcon,
  SparklesIcon,
  TagIcon,
  UsersIcon,
} from './icons';

interface NavItem {
  to: string;
  label: string;
  icon: typeof GridIcon;
  end: boolean;
  pendingKey?: 'trade-listings' | 'topups';
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Overview', icon: GridIcon, end: true }],
  },
  {
    label: 'Content',
    items: [
      { to: '/characters', label: 'Characters', icon: UsersIcon, end: false },
      { to: '/schedule', label: 'Schedule', icon: CalendarIcon, end: false },
      { to: '/updates', label: 'Updates', icon: MegaphoneIcon, end: false },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/trade-listings', label: 'Trade', icon: TagIcon, end: false, pendingKey: 'trade-listings' },
      { to: '/topups', label: 'Top-ups', icon: CoinIcon, end: false, pendingKey: 'topups' },
      { to: '/feedback', label: 'Feedback', icon: HelpCircleIcon, end: false },
    ],
  },
];

const SOON_ITEMS = [
  { label: 'Mastery', icon: SparklesIcon },
  { label: 'Core-Lab', icon: AtomIcon },
];

const PAGE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/characters': 'Characters',
  '/characters/new': 'Add Character',
  '/schedule': 'Release Schedule',
  '/schedule/new': 'Add Schedule Entry',
  '/updates': 'Game Updates',
  '/updates/new': 'Add Update',
  '/trade-listings': 'Trade Listings',
  '/feedback': 'Feedback',
  '/topups': 'Phiếu Top-ups',
};

function editTitleFor(pathname: string): string {
  if (pathname.startsWith('/schedule')) return 'Edit Schedule Entry';
  if (pathname.startsWith('/updates')) return 'Edit Update';
  if (pathname.startsWith('/trade-listings')) return 'Trade Listing';
  if (pathname.startsWith('/topups')) return 'Top-up';
  return 'Edit Character';
}

function getInitial(email: string | null | undefined): string {
  return email ? email.slice(0, 1).toUpperCase() : 'A';
}

export function AdminLayout() {
  const location = useLocation();
  const { pathname } = location;
  const { state, signOut } = useAuth();
  const email = state.status === 'authorized' ? state.user.email : null;
  const isFormRoute = pathname.endsWith('/new') || pathname.endsWith('/edit');
  const title = PAGE_TITLES[pathname] ?? (pathname.endsWith('/edit') ? editTitleFor(pathname) : 'Overview');

  const [pendingCounts, setPendingCounts] = useState<{ 'trade-listings': number; topups: number }>({
    'trade-listings': 0,
    topups: 0,
  });

  useEffect(() => {
    fetchAllTradeListings()
      .then((listings) => {
        const pending = listings.filter((listing) => listing.status === 'pending').length;
        setPendingCounts((current) => ({ ...current, 'trade-listings': pending }));
      })
      .catch(() => undefined);

    fetchAllTopups()
      .then((topups) => {
        const pending = topups.filter((topup) => topup.status === 'pending').length;
        setPendingCounts((current) => ({ ...current, topups: pending }));
      })
      .catch(() => undefined);
  }, []);

  const totalPending = pendingCounts['trade-listings'] + pendingCounts.topups;

  const topbarAction = isFormRoute
    ? null
    : pathname.startsWith('/schedule')
      ? { label: 'Add Schedule Entry', to: '/schedule/new' }
      : pathname.startsWith('/updates')
        ? { label: 'Add Update', to: '/updates/new' }
        : pathname.startsWith('/trade-listings') || pathname.startsWith('/feedback') || pathname.startsWith('/topups')
          ? null
          : { label: 'Add Character', to: '/characters/new' };

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-base font-bold text-white">
            S
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-foreground">S-Class Codex</p>
            <p className="text-xs leading-tight text-subtle">Admin Dashboard</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-subtle">{group.label}</p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const pendingCount = item.pendingKey ? pendingCounts[item.pendingKey] : 0;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-150 ${
                          isActive ? 'bg-accent text-white' : 'text-muted hover:bg-elevated hover:text-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4.5 w-4.5 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {pendingCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-bold text-white">
                          {pendingCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-subtle">Coming soon</p>
            <div className="flex flex-col gap-0.5">
              {SOON_ITEMS.map((item) => (
                <span
                  key={item.label}
                  className="relative flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-subtle/70"
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <LockIcon className="h-3.5 w-3.5" />
                </span>
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2.5 px-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
              {getInitial(email)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{email ?? 'Admin'}</p>
              <p className="text-xs text-subtle">Administrator</p>
            </div>
          </div>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-muted transition-colors duration-150 hover:bg-elevated hover:text-foreground"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            View public site
          </a>
          <button
            type="button"
            onClick={() => signOut()}
            className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger"
          >
            <LogOutIcon className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
          <h1 className="text-xl font-bold text-foreground">{title}</h1>

          <div className="flex items-center gap-3">
            {topbarAction && (
              <NavLink
                to={topbarAction.to}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-hover"
              >
                <PlusIcon className="h-4 w-4" />
                {topbarAction.label}
              </NavLink>
            )}
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted">
              <BellIcon className="h-5 w-5" />
              {totalPending > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
              )}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
              {getInitial(email)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
