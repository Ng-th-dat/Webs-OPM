import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ReleaseStatus } from '@main/types/character';
import type { ReleaseTiming, ReleaseType, Server } from '@main/types/releaseSchedule';
import { fetchCharacters, type AdminCharacter } from '@/lib/characters';
import {
  createReleaseEntry,
  fetchReleaseEntryById,
  updateReleaseEntry,
} from '@/lib/releaseSchedule';
import {
  MONTH_ABBREVIATIONS,
  MONTH_OPTIONS,
  RELEASE_STATUS_OPTIONS,
  RELEASE_TYPE_OPTIONS,
  SERVER_OPTIONS,
  TIMING_OPTIONS,
} from '@/lib/badges';
import { BadgeSelect } from '@/components/BadgeSelect';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { buttonClasses } from '@/lib/buttonStyles';

/** Debut/Comeback are now derived automatically from each character's Release Timing (CN) fields — not selectable here anymore. */
const SELECTABLE_RELEASE_TYPE_OPTIONS = RELEASE_TYPE_OPTIONS.filter(
  (option) => option.value !== 'Debut' && option.value !== 'Comeback'
);

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputClasses =
  'w-full rounded-xl border border-border bg-elevated px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle transition-colors duration-200 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/15';

function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-border bg-surface p-4 shadow-elevated sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

interface FormState {
  monthAbbr: string;
  year: string;
  server: Server | '';
  characterId: string;
  releaseType: ReleaseType | '';
  timing: ReleaseTiming | '';
  status: ReleaseStatus | '';
}

/** Live mirror of a public ReleaseCard's calendar slot — fills the wide layout with the same
    at-a-glance summary an officer would otherwise have to reconstruct from the form above. */
function SchedulePreviewCard({
  form,
  characterName,
}: {
  form: FormState;
  characterName: string | null;
}) {
  const releaseTypeOption = RELEASE_TYPE_OPTIONS.find((option) => option.value === form.releaseType);
  const serverOption = SERVER_OPTIONS.find((option) => option.value === form.server);
  const statusOption = RELEASE_STATUS_OPTIONS.find((option) => option.value === form.status);

  return (
    <aside className="xl:sticky xl:top-6 xl:self-start">
      <div className="ops-bracket flex flex-col gap-3 rounded-card border border-border bg-surface p-5 shadow-elevated">
        <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Live Preview</p>

        <div className="flex flex-wrap items-center gap-1.5">
          {serverOption && (
            <span
              className="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-canvas"
              style={{ backgroundColor: serverOption.color }}
            >
              {serverOption.value}
            </span>
          )}
          {releaseTypeOption && (
            <span
              className="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-canvas"
              style={{ backgroundColor: releaseTypeOption.color }}
            >
              {releaseTypeOption.value}
            </span>
          )}
        </div>

        <p className="truncate text-base font-extrabold text-foreground">{characterName ?? 'No character selected'}</p>
        <p className="text-xs text-subtle">
          {form.monthAbbr || '—'} {form.year} · {form.timing || 'timing —'}
        </p>

        {statusOption && (
          <span
            className="w-fit rounded-full border px-2 py-1 text-[10px] font-semibold"
            style={{ borderColor: statusOption.color, color: statusOption.color }}
          >
            {statusOption.value}
          </span>
        )}
      </div>
    </aside>
  );
}

const currentYear = new Date().getFullYear();
const currentMonthAbbr = MONTH_ABBREVIATIONS[new Date().getMonth()];

const EMPTY_FORM: FormState = {
  monthAbbr: currentMonthAbbr,
  year: String(currentYear),
  server: '',
  characterId: '',
  releaseType: '',
  timing: '',
  status: '',
};

export function ScheduleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [characters, setCharacters] = useState<AdminCharacter[]>([]);
  const [loading, setLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharacters()
      .then(setCharacters)
      .catch(() => {
        // Falls back to an empty picker; the page-level error below still surfaces load failures for edit mode.
      });
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    fetchReleaseEntryById(id)
      .then((entry) => {
        if (!entry) {
          setLoadError(`No schedule entry found for "${id}"`);
          return;
        }
        setForm({
          monthAbbr: MONTH_ABBREVIATIONS[entry.month - 1],
          year: String(entry.year),
          server: entry.server,
          characterId: entry.characterId,
          releaseType: entry.releaseType,
          timing: entry.timing,
          status: entry.status,
        });
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : 'Failed to load entry'))
      .finally(() => setLoading(false));
  }, [id]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const characterOptions = useMemo(
    () =>
      [...characters].sort((a, b) => a.name.localeCompare(b.name)).map((character) => ({
        value: character.id,
        label: character.isVisible ? character.name : `${character.name} (hidden)`,
      })),
    [characters]
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const month = MONTH_ABBREVIATIONS.indexOf(form.monthAbbr as (typeof MONTH_ABBREVIATIONS)[number]) + 1;
    const year = Number(form.year);

    if (!form.server || !form.characterId || !form.releaseType || !form.timing || !form.status) {
      setError('Server, character, release type, timing, and status are all required');
      return;
    }
    if (!year || year < 2020) {
      setError('Enter a valid year');
      return;
    }

    const payload = {
      month,
      year,
      server: form.server,
      characterId: form.characterId,
      releaseType: form.releaseType,
      timing: form.timing,
      status: form.status,
    };
    const characterName = characters.find((c) => c.id === form.characterId)?.name ?? 'this character';

    const confirmed = await confirm(
      isEditMode
        ? { title: 'Save changes?', message: `Updates ${characterName}'s ${payload.releaseType} entry.` }
        : {
            title: 'Add this schedule entry?',
            message: `Adds ${characterName}'s ${payload.releaseType} on ${payload.server} for ${form.monthAbbr} ${year}.`,
          }
    );
    if (!confirmed) return;

    setSubmitting(true);
    setError(null);
    try {
      if (isEditMode && id) {
        await updateReleaseEntry(id, payload);
        showToast(`Saved changes to ${characterName}'s entry`, 'success');
      } else {
        await createReleaseEntry(payload);
        showToast(`Added ${characterName}'s ${payload.releaseType} entry`, 'success');
      }
      navigate('/schedule');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  }

  if (isEditMode && loading) {
    return <p className="text-sm text-muted">Loading entry…</p>;
  }

  if (isEditMode && loadError) {
    return <p className="text-sm text-danger">{loadError}</p>;
  }

  const selectedCharacterName = characters.find((c) => c.id === form.characterId)?.name ?? null;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Panel
          title="Schedule Entry"
          description="For Limited/Core/Event slots only — Debut and Comeback are now handled automatically via each character's Release Timing (CN) fields."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Month" required>
              <BadgeSelect value={form.monthAbbr} onChange={(value) => updateField('monthAbbr', value)} options={MONTH_OPTIONS} />
            </Field>
            <Field label="Year" required>
              <input
                type="number"
                min={2020}
                value={form.year}
                onChange={(event) => updateField('year', event.target.value)}
                className={inputClasses}
              />
            </Field>
            <Field label="Server" required>
              <BadgeSelect value={form.server} onChange={(value) => updateField('server', value as Server)} options={SERVER_OPTIONS} />
            </Field>
          </div>

          <Field label="Character" required>
            <select
              value={form.characterId}
              onChange={(event) => updateField('characterId', event.target.value)}
              className={inputClasses}
            >
              <option value="">Select character</option>
              {characterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Release type" required>
            <BadgeSelect
              value={form.releaseType}
              onChange={(value) => updateField('releaseType', value as ReleaseType)}
              options={SELECTABLE_RELEASE_TYPE_OPTIONS}
            />
          </Field>

          <Field label="Timing" required>
            <BadgeSelect value={form.timing} onChange={(value) => updateField('timing', value as ReleaseTiming)} options={TIMING_OPTIONS} />
          </Field>

          <Field label="Status" required>
            <BadgeSelect value={form.status} onChange={(value) => updateField('status', value as ReleaseStatus)} options={RELEASE_STATUS_OPTIONS} />
          </Field>
        </Panel>

        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className={`self-start ${buttonClasses('primary', 'lg')}`}
          >
            {submitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Save entry'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/schedule')}
            className={`self-start ${buttonClasses('ghost', 'lg')}`}
          >
            Cancel
          </button>
        </div>
      </form>

      <SchedulePreviewCard form={form} characterName={selectedCharacterName} />
      </div>
    </div>
  );
}
