import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { IntelConfidence, IntelStatus } from '@main/types/characterIntel';
import type { Rarity } from '@main/types/character';
import { createCharacterIntel, fetchCharacterIntelById, updateCharacterIntel } from '@/lib/characterIntel';
import { INTEL_CONFIDENCE_OPTIONS, INTEL_STATUS_OPTIONS, RARITY_OPTIONS } from '@/lib/badges';
import { BadgeSelect } from '@/components/BadgeSelect';
import { IntelImageUpload } from '@/components/IntelImageUpload';
import { XIcon } from '@/components/icons';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { buttonClasses } from '@/lib/buttonStyles';

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-subtle">{hint}</span>}
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

function RemovableRow({ onRemove, children }: { onRemove: () => void; children: ReactNode }) {
  return (
    <div className="relative rounded-xl border border-border bg-elevated/50 p-4">
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors duration-200 hover:bg-danger/10 hover:text-danger"
      >
        <XIcon className="h-4 w-4" />
      </button>
      <div className="flex flex-col gap-3 pr-8">{children}</div>
    </div>
  );
}

/** Live mirror of the public IntelCard — deliberately shown at full clarity, not the public
    site's blur/reveal gimmick, since the officer editing it needs to see the real asset. */
function IntelPreviewCard({ form, hintCount }: { form: FormState; hintCount: number }) {
  const statusOption = INTEL_STATUS_OPTIONS.find((option) => option.value === form.status);

  return (
    <aside className="xl:sticky xl:top-6 xl:self-start">
      <div className="ops-bracket flex flex-col gap-3 overflow-hidden rounded-card border border-border bg-surface p-5 shadow-elevated">
        <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Live Preview</p>

        <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-xl bg-elevated">
          {form.coverImage ? (
            <img src={form.coverImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-semibold uppercase tracking-wide text-subtle">No cover yet</span>
          )}
          {statusOption && (
            <span
              className="absolute left-2 top-2 rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-canvas shadow-elevated"
              style={{ backgroundColor: statusOption.color }}
            >
              {statusOption.value}
            </span>
          )}
        </div>

        <p className="truncate text-base font-extrabold text-foreground">{form.characterName || 'Unnamed dossier'}</p>

        <div className="flex flex-wrap gap-1.5">
          {[form.rarityGuess !== 'None' ? form.rarityGuess : null, form.typeGuess, form.factionGuess, form.roleGuess]
            .filter(Boolean)
            .map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-border bg-elevated px-2 py-1 text-[10px] font-semibold text-muted"
              >
                {chip}?
              </span>
            ))}
        </div>

        {form.summary && (
          <div>
            <p className="line-clamp-3 text-sm leading-relaxed text-muted">{form.summary}</p>
          </div>
        )}

        <span className="w-fit rounded-full border border-border px-2 py-1 text-[10px] font-semibold text-muted">
          {hintCount} hint{hintCount === 1 ? '' : 's'} logged
        </span>
      </div>
    </aside>
  );
}

interface HintFormValue {
  date: string;
  confidence: IntelConfidence | '';
  title: string;
  description: string;
  image: string;
}

const EMPTY_HINT: HintFormValue = { date: '', confidence: '', title: '', description: '', image: '' };

interface FormState {
  characterName: string;
  slug: string;
  status: IntelStatus | '';
  rarityGuess: Rarity | 'None';
  typeGuess: string;
  factionGuess: string;
  roleGuess: string;
  summary: string;
  coverImage: string;
  confirmedCharacterSlug: string;
}

const EMPTY_FORM: FormState = {
  characterName: '',
  slug: '',
  status: 'rumored',
  rarityGuess: 'None',
  typeGuess: '',
  factionGuess: '',
  roleGuess: '',
  summary: '',
  coverImage: '',
  confirmedCharacterSlug: '',
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type SubmitStatus = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'error'; message: string };

export function IntelFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const isEditMode = Boolean(id);

  const [draftKey] = useState(() => crypto.randomUUID());
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [hints, setHints] = useState<HintFormValue[]>([]);
  const [status, setStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const [loading, setLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    fetchCharacterIntelById(id)
      .then((entry) => {
        if (!entry) {
          setLoadError(`No dossier found for "${id}"`);
          return;
        }
        setForm({
          characterName: entry.characterName,
          slug: entry.slug,
          status: entry.status,
          rarityGuess: entry.rarityGuess ?? 'None',
          typeGuess: entry.typeGuess ?? '',
          factionGuess: entry.factionGuess ?? '',
          roleGuess: entry.roleGuess ?? '',
          summary: entry.summary ?? '',
          coverImage: entry.coverImage ?? '',
          confirmedCharacterSlug: entry.confirmedCharacterSlug ?? '',
        });
        setSlugTouched(true);
        setHints(
          entry.hints.map((h) => ({
            date: h.date,
            confidence: h.confidence,
            title: h.title,
            description: h.description ?? '',
            image: h.image ?? '',
          }))
        );
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : 'Failed to load dossier'))
      .finally(() => setLoading(false));
  }, [id]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateHint(index: number, patch: Partial<HintFormValue>) {
    setHints((current) => current.map((h, i) => (i === index ? { ...h, ...patch } : h)));
  }

  const slugPreview = useMemo(() => slugify(form.slug || form.characterName), [form.slug, form.characterName]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const slug = slugPreview;
    if (!slug || !form.characterName.trim()) {
      setStatus({ kind: 'error', message: 'Character name is required' });
      return;
    }
    if (!form.status) {
      setStatus({ kind: 'error', message: 'Status is required' });
      return;
    }

    const payload = {
      slug,
      status: form.status,
      characterName: form.characterName.trim(),
      rarityGuess: form.rarityGuess === 'None' ? null : form.rarityGuess,
      typeGuess: form.typeGuess.trim() || null,
      factionGuess: form.factionGuess.trim() || null,
      roleGuess: form.roleGuess.trim() || null,
      summary: form.summary.trim() || null,
      coverImage: form.coverImage || null,
      confirmedCharacterSlug: form.confirmedCharacterSlug.trim() || null,
      hints: hints
        .filter((h) => Boolean(h.date && h.confidence && h.title.trim()))
        .map((h) => ({
          date: h.date,
          confidence: h.confidence as IntelConfidence,
          title: h.title.trim(),
          description: h.description.trim() || undefined,
          image: h.image || undefined,
        })),
    };

    const confirmed = await confirm(
      isEditMode
        ? { title: 'Save changes?', message: `Updates the dossier for "${payload.characterName}" right away.` }
        : { title: 'Publish this dossier?', message: `"${payload.characterName}" will appear in Intel right away.` }
    );
    if (!confirmed) return;

    setStatus({ kind: 'submitting' });
    try {
      if (isEditMode && id) {
        await updateCharacterIntel(id, payload);
        showToast(`Saved changes to "${payload.characterName}"`, 'success');
      } else {
        await createCharacterIntel(payload);
        showToast(`Published "${payload.characterName}"`, 'success');
      }
      navigate('/intel');
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Failed to save dossier' });
    }
  }

  if (isEditMode && loading) {
    return <p className="text-sm text-muted">Loading dossier…</p>;
  }

  if (isEditMode && loadError) {
    return <p className="text-sm text-danger">{loadError}</p>;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Panel title="Cover image" description="A teased splash art crop or hint image, if one exists yet.">
          <Field label="Cover">
            <IntelImageUpload draftKey={draftKey} slot="cover" value={form.coverImage} onChange={(url) => updateField('coverImage', url)} uploadLabel="Upload cover" />
          </Field>
        </Panel>

        <Panel title="Dossier Info" description="What's currently being speculated about this character.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Character name" required hint="Working/rumored name — can change later.">
              <input
                value={form.characterName}
                onChange={(e) => {
                  updateField('characterName', e.target.value);
                  if (!slugTouched) updateField('slug', slugify(e.target.value));
                }}
                className={inputClasses}
                placeholder="e.g. Boros (working name)"
              />
            </Field>
            <Field label="Slug" required hint={isEditMode ? 'Locked after creation.' : 'Used for the URL.'}>
              <input
                value={form.slug}
                disabled={isEditMode}
                onChange={(e) => {
                  setSlugTouched(true);
                  updateField('slug', e.target.value);
                }}
                className={inputClasses}
                placeholder="e.g. boros-working-name"
              />
            </Field>
          </div>

          <Field label="Status" required>
            <BadgeSelect value={form.status} onChange={(v) => updateField('status', v as IntelStatus)} options={INTEL_STATUS_OPTIONS} />
          </Field>

          {form.status === 'confirmed' && (
            <Field label="Confirmed character slug" hint="Links to the real /characters/:slug page, once it exists.">
              <input
                value={form.confirmedCharacterSlug}
                onChange={(e) => updateField('confirmedCharacterSlug', e.target.value)}
                className={inputClasses}
                placeholder="e.g. boros"
              />
            </Field>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Rarity guess">
              <BadgeSelect
                value={form.rarityGuess}
                onChange={(v) => updateField('rarityGuess', v as Rarity | 'None')}
                options={[{ value: 'None' }, ...RARITY_OPTIONS]}
              />
            </Field>
            <Field label="Role guess">
              <input value={form.roleGuess} onChange={(e) => updateField('roleGuess', e.target.value)} className={inputClasses} placeholder="e.g. DPS?" />
            </Field>
            <Field label="Type guess">
              <input value={form.typeGuess} onChange={(e) => updateField('typeGuess', e.target.value)} className={inputClasses} placeholder="e.g. Esper?" />
            </Field>
            <Field label="Faction guess">
              <input value={form.factionGuess} onChange={(e) => updateField('factionGuess', e.target.value)} className={inputClasses} placeholder="e.g. Villain?" />
            </Field>
          </div>

          <Field label="Summary">
            <textarea
              value={form.summary}
              onChange={(e) => updateField('summary', e.target.value)}
              className={`${inputClasses} min-h-[6rem] resize-y`}
              placeholder="Short blurb on what's being speculated so far."
            />
          </Field>
        </Panel>

        <Panel title="Leak Timeline" description="Each hint gets its own confidence level, oldest first.">
          {hints.map((hint, index) => (
            <RemovableRow key={index} onRemove={() => setHints((current) => current.filter((_, i) => i !== index))}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[10rem_1fr]">
                <Field label="Date" required>
                  <input type="date" value={hint.date} onChange={(e) => updateHint(index, { date: e.target.value })} className={inputClasses} />
                </Field>
                <Field label="Title" required>
                  <input value={hint.title} onChange={(e) => updateHint(index, { title: e.target.value })} className={inputClasses} placeholder="e.g. Splash art silhouette leaked" />
                </Field>
              </div>
              <Field label="Confidence" required>
                <BadgeSelect value={hint.confidence} onChange={(v) => updateHint(index, { confidence: v as IntelConfidence })} options={INTEL_CONFIDENCE_OPTIONS} />
              </Field>
              <Field label="Note">
                <input value={hint.description} onChange={(e) => updateHint(index, { description: e.target.value })} className={inputClasses} />
              </Field>
              <Field label="Image">
                <IntelImageUpload draftKey={draftKey} slot={`hint-${index}`} value={hint.image} onChange={(url) => updateHint(index, { image: url })} />
              </Field>
            </RemovableRow>
          ))}
          <button
            type="button"
            onClick={() => setHints((current) => [...current, EMPTY_HINT])}
            className={`self-start ${buttonClasses('dashed', 'sm')}`}
          >
            + Add hint
          </button>
        </Panel>

        {status.kind === 'error' && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{status.message}</div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status.kind === 'submitting'}
            className={`self-start ${buttonClasses('primary', 'lg')}`}
          >
            {status.kind === 'submitting' ? 'Saving…' : isEditMode ? 'Save changes' : 'Publish dossier'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/intel')}
            className={`self-start ${buttonClasses('ghost', 'lg')}`}
          >
            Cancel
          </button>
        </div>
      </form>

      <IntelPreviewCard form={form} hintCount={hints.length} />
      </div>
    </div>
  );
}
