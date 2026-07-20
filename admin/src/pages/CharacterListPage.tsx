import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MetaTier, ReleaseStatus } from '@main/types/character';
import { fetchCharacters, setCharacterMetaTier, setCharacterVisibility, type AdminCharacter } from '@/lib/characters';
import { RARITY_SWATCH } from '@/lib/rarity';
import { META_TIER_ORDER } from '@/lib/metaTier';
import { EyeIcon, EyeOffIcon, PencilIcon, SearchIcon } from '@/components/icons';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

const TIER_OPTIONS = [...META_TIER_ORDER].reverse();

const STATUS_BADGE: Record<ReleaseStatus, string> = {
  Released: 'bg-success/10 text-success',
  Upcoming: 'bg-accent-info/10 text-accent-info',
  TBD: 'bg-elevated text-subtle',
};

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return (words[0].slice(0, 1) + words[1].slice(0, 1)).toUpperCase();
}

/** Trading-card treatment for the roster grid — the same rarity-glow identity as the public
    CharacterCard, so browsing the catalog here feels like the game it's managing. */
function CharacterCard({
  character,
  tieringId,
  togglingId,
  onTierChange,
  onToggleVisibility,
}: {
  character: AdminCharacter;
  tieringId: string | null;
  togglingId: string | null;
  onTierChange: (character: AdminCharacter, tier: MetaTier | null) => void;
  onToggleVisibility: (character: AdminCharacter) => void;
}) {
  const [hasError, setHasError] = useState(false);
  const color = RARITY_SWATCH[character.rarity];
  const showImage = Boolean(character.image) && !hasError;

  return (
    <div
      className={`ops-bracket flex flex-col overflow-hidden rounded-card border bg-surface shadow-elevated transition-all duration-200 hover:-translate-y-1 hover:shadow-elevated-lg ${
        character.isVisible ? '' : 'opacity-50'
      }`}
      style={{ borderColor: `${color}55` }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-elevated">
        {showImage ? (
          <img
            src={character.image}
            alt=""
            onError={() => setHasError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: `${color}1a` }}>
            <span className="text-3xl font-black" style={{ color }}>
              {getInitials(character.name)}
            </span>
          </div>
        )}

        <span
          className="absolute left-2 top-2 rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-canvas shadow-elevated"
          style={{ backgroundColor: color }}
        >
          {character.rarity}
        </span>

        <div className="absolute right-2 top-2 flex items-center gap-1">
          <Link
            to={`/characters/${character.id}/edit`}
            title="Edit character"
            aria-label={`Edit ${character.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas/70 text-foreground backdrop-blur-sm transition-colors hover:text-accent"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => onToggleVisibility(character)}
            disabled={togglingId === character.id}
            title={character.isVisible ? 'Hide from public site' : 'Show on public site'}
            aria-label={character.isVisible ? `Hide ${character.name}` : `Show ${character.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas/70 text-foreground backdrop-blur-sm transition-colors hover:text-danger disabled:opacity-50"
          >
            {character.isVisible ? <EyeIcon className="h-3.5 w-3.5" /> : <EyeOffIcon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">{character.name}</p>
          <p className="truncate text-[11px] text-subtle">/{character.slug}</p>
        </div>

        <div className="flex flex-wrap gap-1">
          {[character.type, character.faction, character.role].filter(Boolean).map((chip) => (
            <span
              key={chip}
              className="truncate rounded border border-border bg-elevated px-1.5 py-0.5 text-[10px] font-semibold text-muted"
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE[character.releaseStatus]}`}
          >
            {character.releaseStatus}
          </span>
          {!character.isVisible && (
            <span className="inline-flex items-center rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold text-danger">
              Hidden
            </span>
          )}
        </div>

        <select
          value={character.metaTier ?? ''}
          onChange={(event) => onTierChange(character, (event.target.value || null) as MetaTier | null)}
          disabled={tieringId === character.id}
          aria-label={`Set tier for ${character.name}`}
          className="mt-auto h-8 w-full rounded-lg border border-border bg-elevated px-2 text-xs font-semibold text-foreground transition-colors focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/15 disabled:opacity-50"
        >
          <option value="">Unranked</option>
          {TIER_OPTIONS.map((tier) => (
            <option key={tier} value={tier}>
              {tier}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function CharacterListPage() {
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [characters, setCharacters] = useState<AdminCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [tieringId, setTieringId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  function load() {
    setLoading(true);
    setError(null);
    fetchCharacters()
      .then(setCharacters)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load characters'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const visibleCharacters = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return characters;
    return characters.filter((character) =>
      [character.name, character.slug, character.type, character.role].join(' ').toLowerCase().includes(normalized)
    );
  }, [characters, query]);

  async function handleToggleVisibility(character: AdminCharacter) {
    const nextVisible = !character.isVisible;
    const confirmed = await confirm(
      nextVisible
        ? {
            title: 'Show this character?',
            message: `"${character.name}" will reappear on the public site.`,
            confirmLabel: 'Show',
          }
        : {
            title: 'Hide this character?',
            message: `"${character.name}" will disappear from the public site. You can show it again anytime — nothing is deleted.`,
            confirmLabel: 'Hide',
            variant: 'danger',
          }
    );
    if (!confirmed) return;

    setTogglingId(character.id);
    try {
      await setCharacterVisibility(character.id, nextVisible);
      setCharacters((current) =>
        current.map((c) => (c.id === character.id ? { ...c, isVisible: nextVisible } : c))
      );
      showToast(nextVisible ? `"${character.name}" is visible again` : `"${character.name}" is now hidden`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update visibility', 'error');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleTierChange(character: AdminCharacter, nextTier: MetaTier | null) {
    const confirmed = await confirm(
      nextTier
        ? {
            title: `Set tier to ${nextTier}?`,
            message: `"${character.name}" will be ranked as ${nextTier} on the public tier list.`,
            confirmLabel: 'Set tier',
          }
        : {
            title: 'Clear tier?',
            message: `"${character.name}" will be removed from the public tier list until ranked again.`,
            confirmLabel: 'Clear',
          }
    );
    if (!confirmed) return;

    setTieringId(character.id);
    try {
      await setCharacterMetaTier(character.id, nextTier);
      setCharacters((current) =>
        current.map((c) => (c.id === character.id ? { ...c, metaTier: nextTier ?? undefined } : c))
      );
      showToast(
        nextTier ? `"${character.name}" set to ${nextTier}` : `"${character.name}" cleared from tier list`,
        'success'
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update tier', 'error');
    } finally {
      setTieringId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-elevated sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="text-sm font-medium text-muted">
          {loading ? 'Loading…' : `${visibleCharacters.length} of ${characters.length} character(s)`}
        </p>
        <div className="relative sm:w-72">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search characters…"
            className="h-10 w-full rounded-full border border-border bg-elevated pl-10 pr-4 text-sm text-foreground placeholder:text-subtle transition-colors focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/15"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-card border border-border bg-surface p-6 shadow-elevated">
          <p className="text-sm text-muted">Loading…</p>
        </div>
      ) : error ? (
        <div className="rounded-card border border-border bg-surface p-6 shadow-elevated">
          <p className="text-sm text-danger">{error}</p>
        </div>
      ) : characters.length === 0 ? (
        <div className="rounded-card border border-border bg-surface p-6 shadow-elevated">
          <p className="text-sm text-muted">No characters yet. Add one to get started.</p>
        </div>
      ) : visibleCharacters.length === 0 ? (
        <div className="rounded-card border border-border bg-surface p-6 shadow-elevated">
          <p className="text-sm text-muted">No characters match "{query}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visibleCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              tieringId={tieringId}
              togglingId={togglingId}
              onTierChange={handleTierChange}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>
      )}
    </div>
  );
}
