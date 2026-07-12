import { useEffect, useMemo, useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { Link } from 'react-router-dom';
import { fetchCharacters, type AdminCharacter } from '@/lib/characters';
import { RARITY_ORDER, RARITY_SWATCH } from '@/lib/rarity';
import { CheckIcon, ClockIcon, HelpCircleIcon, PlusIcon, UsersIcon } from '@/components/icons';

interface StatTileProps {
  label: string;
  value: number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  gradient: string;
  glow: string;
}

function StatTile({ label, value, icon: Icon, gradient, glow }: StatTileProps) {
  return (
    <div className="group rounded-3xl border border-border bg-surface p-5 shadow-elevated transition-all duration-200 hover:-translate-y-1 hover:shadow-elevated-lg">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-2xl text-white transition-transform duration-200 group-hover:scale-105"
        style={{ background: gradient, boxShadow: `0 8px 16px -4px ${glow}` }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

export function DashboardPage() {
  const [characters, setCharacters] = useState<AdminCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharacters()
      .then(setCharacters)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load characters'))
      .finally(() => setLoading(false));
  }, []);

  // Hidden characters are soft-deleted from the public site — keep dashboard counts matching what it shows.
  const visibleCharacters = useMemo(() => characters.filter((c) => c.isVisible), [characters]);

  const stats = useMemo(
    () => ({
      total: visibleCharacters.length,
      released: visibleCharacters.filter((c) => c.releaseStatus === 'Released').length,
      upcoming: visibleCharacters.filter((c) => c.releaseStatus === 'Upcoming').length,
      tbd: visibleCharacters.filter((c) => c.releaseStatus === 'TBD').length,
    }),
    [visibleCharacters]
  );

  const rarityBreakdown = useMemo(() => {
    const counts = new Map<string, number>(RARITY_ORDER.map((rarity) => [rarity, 0]));
    for (const character of visibleCharacters) {
      counts.set(character.rarity, (counts.get(character.rarity) ?? 0) + 1);
    }
    const max = Math.max(1, ...counts.values());
    return RARITY_ORDER.map((rarity) => ({
      rarity,
      count: counts.get(rarity) ?? 0,
      pct: ((counts.get(rarity) ?? 0) / max) * 100,
    }));
  }, [visibleCharacters]);

  if (loading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (error) {
    return <p className="text-sm text-danger">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Total Characters"
          value={stats.total}
          icon={UsersIcon}
          gradient="linear-gradient(135deg, #60a5fa, #3b82f6)"
          glow="rgba(59, 130, 246, 0.35)"
        />
        <StatTile
          label="Released"
          value={stats.released}
          icon={CheckIcon}
          gradient="linear-gradient(135deg, #4ade80, #16a34a)"
          glow="rgba(34, 197, 94, 0.35)"
        />
        <StatTile
          label="Upcoming"
          value={stats.upcoming}
          icon={ClockIcon}
          gradient="linear-gradient(135deg, #a78bfa, #7c3aed)"
          glow="rgba(139, 92, 246, 0.35)"
        />
        <StatTile
          label="TBD"
          value={stats.tbd}
          icon={HelpCircleIcon}
          gradient="linear-gradient(135deg, #fb923c, #ea580c)"
          glow="rgba(249, 115, 22, 0.35)"
        />
      </div>

      <div className="rounded-3xl border border-border bg-surface p-5 shadow-elevated lg:p-6">
        <h2 className="text-sm font-bold text-foreground">Characters by rarity</h2>
        <div className="mt-5 flex flex-col gap-3">
          {rarityBreakdown.map(({ rarity, count, pct }) => (
            <div key={rarity} className="flex items-center gap-3">
              <span className="flex w-14 shrink-0 items-center gap-1.5 text-xs font-semibold text-foreground">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/5"
                  style={{ backgroundColor: RARITY_SWATCH[rarity] }}
                />
                {rarity}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-accent),var(--color-accent-purple))] transition-all duration-500 ease-out"
                  style={{ width: `${count === 0 ? 0 : Math.max(pct, 4)}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs font-semibold text-muted">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {characters.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
          <p className="text-sm font-semibold text-foreground">No characters yet</p>
          <p className="mt-1 text-sm text-muted">Add your first character to get started.</p>
          <Link
            to="/characters/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-hover))] px-4 py-2 text-sm font-semibold text-white shadow-glow-accent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated-lg active:translate-y-0 active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4" />
            Add Character
          </Link>
        </div>
      )}
    </div>
  );
}
