import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ReleaseStatus } from '@main/types/character';
import { fetchCharacters, setCharacterVisibility, type AdminCharacter } from '@/lib/characters';
import { RARITY_SWATCH } from '@/lib/rarity';
import { EyeIcon, EyeOffIcon, PencilIcon, SearchIcon } from '@/components/icons';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

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

function CharacterThumb({ character }: { character: AdminCharacter }) {
  const [hasError, setHasError] = useState(false);
  const color = RARITY_SWATCH[character.rarity];

  if (!character.image || hasError) {
    return (
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
        style={{ backgroundColor: `${color}1a`, color, boxShadow: `inset 0 0 0 1px ${color}33` }}
      >
        {getInitials(character.name)}
      </span>
    );
  }

  return (
    <img
      src={character.image}
      alt=""
      onError={() => setHasError(true)}
      className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
    />
  );
}

function RarityBadge({ rarity }: { rarity: AdminCharacter['rarity'] }) {
  const color = RARITY_SWATCH[rarity];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      {rarity}
    </span>
  );
}

export function CharacterListPage() {
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [characters, setCharacters] = useState<AdminCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
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

      <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-elevated">
        {loading ? (
          <p className="p-6 text-sm text-muted">Loading…</p>
        ) : error ? (
          <p className="p-6 text-sm text-danger">{error}</p>
        ) : characters.length === 0 ? (
          <p className="p-6 text-sm text-muted">No characters yet. Add one to get started.</p>
        ) : visibleCharacters.length === 0 ? (
          <p className="p-6 text-sm text-muted">No characters match "{query}".</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-subtle">
              <tr>
                <th className="px-5 pb-3 pt-5 font-semibold">Character</th>
                <th className="px-5 pb-3 pt-5 font-semibold">Rarity</th>
                <th className="px-5 pb-3 pt-5 font-semibold">Type</th>
                <th className="px-5 pb-3 pt-5 font-semibold">Faction</th>
                <th className="px-5 pb-3 pt-5 font-semibold">Role</th>
                <th className="px-5 pb-3 pt-5 font-semibold">Status</th>
                <th className="px-5 pb-3 pt-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleCharacters.map((character) => (
                <tr
                  key={character.id}
                  className={`transition-colors duration-150 hover:bg-elevated/70 ${character.isVisible ? '' : 'opacity-50'}`}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <CharacterThumb character={character} />
                      <div>
                        <p className="font-semibold text-foreground">{character.name}</p>
                        <p className="text-xs text-subtle">/{character.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <RarityBadge rarity={character.rarity} />
                  </td>
                  <td className="px-5 py-3 text-muted">{character.type}</td>
                  <td className="px-5 py-3 text-muted">{character.faction}</td>
                  <td className="px-5 py-3 text-muted">{character.role}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[character.releaseStatus]}`}
                      >
                        {character.releaseStatus}
                      </span>
                      {!character.isVisible && (
                        <span className="inline-flex items-center rounded-full bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger">
                          Hidden
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/characters/${character.id}/edit`}
                        title="Edit character"
                        aria-label={`Edit ${character.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-all duration-150 hover:-translate-y-px hover:bg-accent/10 hover:text-accent"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(character)}
                        disabled={togglingId === character.id}
                        title={character.isVisible ? 'Hide from public site' : 'Show on public site'}
                        aria-label={character.isVisible ? `Hide ${character.name}` : `Show ${character.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-all duration-150 hover:-translate-y-px hover:bg-danger/10 hover:text-danger disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        {character.isVisible ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
