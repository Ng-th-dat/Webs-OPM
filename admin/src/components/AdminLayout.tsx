import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  AtomIcon,
  CalendarIcon,
  ExternalLinkIcon,
  GridIcon,
  LockIcon,
  MegaphoneIcon,
  PlusIcon,
  SparklesIcon,
  UsersIcon,
} from './icons';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: GridIcon, end: true },
  { to: '/characters', label: 'Characters', icon: UsersIcon, end: false },
  { to: '/schedule', label: 'Schedule', icon: CalendarIcon, end: false },
  { to: '/updates', label: 'Updates', icon: MegaphoneIcon, end: false },
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
};

function editTitleFor(pathname: string): string {
  if (pathname.startsWith('/schedule')) return 'Edit Schedule Entry';
  if (pathname.startsWith('/updates')) return 'Edit Update';
  return 'Edit Character';
}

export function AdminLayout() {
  const location = useLocation();
  const { pathname } = location;
  const isFormRoute = pathname.endsWith('/new') || pathname.endsWith('/edit');
  const title = PAGE_TITLES[pathname] ?? (pathname.endsWith('/edit') ? editTitleFor(pathname) : 'S-Class Codex Admin');

  const topbarAction = isFormRoute
    ? null
    : pathname.startsWith('/schedule')
      ? { label: 'Add Schedule Entry', to: '/schedule/new' }
      : pathname.startsWith('/updates')
        ? { label: 'Add Update', to: '/updates/new' }
        : { label: 'Add Character', to: '/characters/new' };

  return (
    <div className="flex min-h-screen gap-4 p-4">
      <aside className="flex w-24 shrink-0 flex-col items-center rounded-3xl border border-border bg-surface py-6 shadow-elevated">
        <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-purple))] text-base font-bold text-white shadow-glow-accent">
          S
        </div>

        <nav className="flex flex-1 flex-col items-center gap-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex w-16 flex-col items-center gap-1.5 rounded-2xl py-2.5 text-[11px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-hover))] text-white shadow-glow-accent'
                    : 'text-subtle hover:-translate-y-0.5 hover:bg-elevated hover:text-foreground'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}

          <div className="my-2 h-px w-8 bg-border" />

          {SOON_ITEMS.map((item) => (
            <span
              key={item.label}
              className="relative flex w-16 cursor-not-allowed flex-col items-center gap-1.5 rounded-2xl py-2.5 text-[11px] font-medium text-subtle/70"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              <LockIcon className="absolute right-2 top-1 h-2.5 w-2.5" />
            </span>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col gap-4">
        <header className="flex items-center justify-between rounded-3xl border border-border bg-surface px-6 py-4 shadow-elevated">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">S-Class Codex Admin</p>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted transition-all duration-200 hover:-translate-y-0.5 hover:bg-elevated hover:text-foreground sm:inline-flex"
            >
              View site
              <ExternalLinkIcon className="h-3.5 w-3.5" />
            </a>
            {topbarAction && (
              <NavLink
                to={topbarAction.to}
                className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-hover))] px-4 py-2 text-sm font-semibold text-white shadow-glow-accent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated-lg active:translate-y-0 active:scale-[0.98]"
              >
                <PlusIcon className="h-4 w-4" />
                {topbarAction.label}
              </NavLink>
            )}
          </div>
        </header>

        <main className="flex-1 pb-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
