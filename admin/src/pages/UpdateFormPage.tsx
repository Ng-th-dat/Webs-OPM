import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { UpdateCategory } from '@main/types/gameUpdate';
import type { Server } from '@main/types/releaseSchedule';
import { createGameUpdate, fetchGameUpdateById, updateGameUpdate } from '@/lib/gameUpdates';
import { analyzeUpdateImage } from '@/lib/aiAnalyze';
import { SERVER_OPTIONS, UPDATE_CATEGORY_OPTIONS } from '@/lib/badges';
import { BadgeSelect } from '@/components/BadgeSelect';
import { UpdateImageUpload } from '@/components/UpdateImageUpload';
import { SparklesIcon, XIcon } from '@/components/icons';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { buttonClasses } from '@/lib/buttonStyles';

// AI drafting is temporarily paused (Anthropic billing not set up yet) — flip back to
// true once the analyze-update-image Edge Function has credit again. Manual entry of
// every field below always works regardless of this flag.
const AI_ANALYZE_ENABLED = false;

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

/** Live mirror of the public site's UpdateCard — fills the wide layout with something useful
    instead of stretched inputs, and lets an officer see the banner crop/badges before publishing. */
function UpdatePreviewCard({ form }: { form: FormState }) {
  const categoryOption = UPDATE_CATEGORY_OPTIONS.find((option) => option.value === form.category);
  const serverOption = SERVER_OPTIONS.find((option) => option.value === form.server);

  return (
    <aside className="xl:sticky xl:top-6 xl:self-start">
      <div className="ops-bracket flex flex-col gap-3 overflow-hidden rounded-card border border-border bg-surface p-5 shadow-elevated">
        <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Live Preview</p>

        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-elevated">
          {form.image ? (
            <img src={form.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-semibold uppercase tracking-wide text-subtle">No banner yet</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categoryOption && (
            <span
              className="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-canvas"
              style={{ backgroundColor: categoryOption.color }}
            >
              {categoryOption.value}
            </span>
          )}
          {serverOption && form.server !== 'None' && (
            <span
              className="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-canvas"
              style={{ backgroundColor: serverOption.color }}
            >
              {serverOption.value}
            </span>
          )}
          {form.date && <span className="text-[10px] font-medium text-subtle">{form.date}</span>}
        </div>

        <p className="text-base font-extrabold leading-snug text-foreground">{form.title || 'Untitled update'}</p>
        {form.description && <p className="line-clamp-3 text-sm leading-relaxed text-muted">{form.description}</p>}
      </div>
    </aside>
  );
}

interface SubEventFormValue {
  title: string;
  note: string;
  startDate: string;
  endDate: string;
}

interface FormState {
  title: string;
  slug: string;
  image: string;
  category: UpdateCategory | '';
  server: Server | 'None';
  date: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  slug: '',
  image: '',
  category: '',
  server: 'None',
  date: '',
  description: '',
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type SubmitStatus = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'error'; message: string };

export function UpdateFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const isEditMode = Boolean(id);

  const [draftKey] = useState(() => crypto.randomUUID());
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [events, setEvents] = useState<SubEventFormValue[]>([]);
  const [status, setStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const [loading, setLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    fetchGameUpdateById(id)
      .then((entry) => {
        if (!entry) {
          setLoadError(`No update found for "${id}"`);
          return;
        }
        setForm({
          title: entry.title,
          slug: entry.slug,
          image: entry.image ?? '',
          category: entry.category,
          server: entry.server ?? 'None',
          date: entry.date,
          description: entry.description,
        });
        setSlugTouched(true);
        setEvents(
          (entry.events ?? []).map((e) => ({
            title: e.title,
            note: e.note ?? '',
            startDate: e.startDate ?? '',
            endDate: e.endDate ?? '',
          }))
        );
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : 'Failed to load update'))
      .finally(() => setLoading(false));
  }, [id]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateEvent(index: number, patch: Partial<SubEventFormValue>) {
    setEvents((current) => current.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  const slugPreview = useMemo(() => slugify(form.slug || form.title), [form.slug, form.title]);

  async function handleAnalyze() {
    if (!form.image) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const result = await analyzeUpdateImage(form.image);
      setForm((current) => ({
        ...current,
        title: result.title || current.title,
        description: result.description || current.description,
        category: result.category,
        server: result.server === 'Unknown' ? 'None' : result.server,
        date: result.date || current.date,
      }));
      if (!slugTouched) updateField('slug', slugify(result.title));
      setEvents(
        result.events.map((e) => ({
          title: e.title,
          note: e.note,
          startDate: e.startDate,
          endDate: e.endDate,
        }))
      );
      showToast('AI draft ready — review the fields before saving', 'success');
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'AI analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const slug = slugPreview;
    if (!slug || !form.title.trim()) {
      setStatus({ kind: 'error', message: 'Title is required' });
      return;
    }
    if (!form.category || !form.date) {
      setStatus({ kind: 'error', message: 'Category and date are required' });
      return;
    }
    if (!form.image) {
      setStatus({ kind: 'error', message: 'A banner image is required' });
      return;
    }

    const payload = {
      slug,
      category: form.category,
      server: form.server === 'None' ? null : form.server,
      date: form.date,
      title: form.title.trim(),
      description: form.description.trim(),
      image: form.image,
      events: events
        .map((e) => ({
          title: e.title.trim(),
          note: e.note.trim() || undefined,
          startDate: e.startDate || undefined,
          endDate: e.endDate || undefined,
        }))
        .filter((e) => e.startDate && e.endDate && e.title),
    };

    const confirmed = await confirm(
      isEditMode
        ? { title: 'Save changes?', message: `Updates "${payload.title}" right away.` }
        : { title: 'Publish this update?', message: `"${payload.title}" will appear in the Game Updates feed right away.` }
    );
    if (!confirmed) return;

    setStatus({ kind: 'submitting' });
    try {
      if (isEditMode && id) {
        await updateGameUpdate(id, payload);
        showToast(`Saved changes to "${payload.title}"`, 'success');
      } else {
        await createGameUpdate(payload);
        showToast(`Published "${payload.title}"`, 'success');
      }
      navigate('/updates');
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Failed to save update' });
    }
  }

  if (isEditMode && loading) {
    return <p className="text-sm text-muted">Loading update…</p>;
  }

  if (isEditMode && loadError) {
    return <p className="text-sm text-danger">{loadError}</p>;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Panel
          title="Banner image"
          description={
            AI_ANALYZE_ENABLED
              ? 'Upload the event/announcement banner the publisher sent, then let AI read the text and draft the fields below.'
              : 'Upload the event/announcement banner the publisher sent, then fill in the fields below manually.'
          }
        >
          <Field label="Banner" required>
            <UpdateImageUpload folderKey={draftKey} value={form.image} onChange={(url) => updateField('image', url)} />
          </Field>
          {AI_ANALYZE_ENABLED ? (
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!form.image || analyzing}
                className="inline-flex w-fit items-center gap-1.5 rounded-full border border-accent/40 bg-accent/5 px-4 py-2 text-sm font-semibold text-accent transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <SparklesIcon className="h-4 w-4" />
                {analyzing ? 'Analyzing…' : 'Analyze with AI'}
              </button>
              {analyzeError && <span className="text-xs text-danger">{analyzeError}</span>}
            </div>
          ) : (
            <p className="text-xs text-subtle">AI analysis is temporarily paused — fill in the fields below by hand.</p>
          )}
        </Panel>

        <Panel title="Update Info" description="Fill in the details for this update.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Title" required>
              <input
                value={form.title}
                onChange={(e) => {
                  updateField('title', e.target.value);
                  if (!slugTouched) updateField('slug', slugify(e.target.value));
                }}
                className={inputClasses}
                placeholder="e.g. Lịch sự kiện đầu tháng 7"
              />
            </Field>
            <Field
              label="Slug"
              required
              hint={isEditMode ? 'Locked after creation.' : 'Used for the URL.'}
            >
              <input
                value={form.slug}
                disabled={isEditMode}
                onChange={(e) => {
                  setSlugTouched(true);
                  updateField('slug', e.target.value);
                }}
                className={inputClasses}
                placeholder="e.g. lich-su-kien-dau-thang-7"
              />
            </Field>
            <Field label="Date" required>
              <input
                type="date"
                value={form.date}
                onChange={(e) => updateField('date', e.target.value)}
                className={inputClasses}
              />
            </Field>
          </div>

          <Field label="Category" required>
            <BadgeSelect value={form.category} onChange={(v) => updateField('category', v as UpdateCategory)} options={UPDATE_CATEGORY_OPTIONS} />
          </Field>

          <Field label="Server" hint='Leave on "None" for posts that are not server-specific.'>
            <BadgeSelect
              value={form.server}
              onChange={(v) => updateField('server', v as Server | 'None')}
              options={[{ value: 'None' }, ...SERVER_OPTIONS]}
            />
          </Field>

          <Field label="Description" required>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              className={`${inputClasses} min-h-[6rem] resize-y`}
            />
          </Field>
        </Panel>

        <Panel title="Sub-events" description="Optional — a date-range schedule shown on the update's detail page.">
          {events.map((subEvent, index) => (
            <RemovableRow key={index} onRemove={() => setEvents((current) => current.filter((_, i) => i !== index))}>
              <Field label="Title" required>
                <input value={subEvent.title} onChange={(e) => updateEvent(index, { title: e.target.value })} className={inputClasses} />
              </Field>
              <Field label="Note">
                <input value={subEvent.note} onChange={(e) => updateEvent(index, { note: e.target.value })} className={inputClasses} />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Start date" required hint="Drives the displayed date range and the ongoing/upcoming/expired status.">
                  <input
                    type="date"
                    value={subEvent.startDate}
                    onChange={(e) => updateEvent(index, { startDate: e.target.value })}
                    className={inputClasses}
                  />
                </Field>
                <Field label="End date" required>
                  <input
                    type="date"
                    value={subEvent.endDate}
                    onChange={(e) => updateEvent(index, { endDate: e.target.value })}
                    className={inputClasses}
                  />
                </Field>
              </div>
            </RemovableRow>
          ))}
          <button
            type="button"
            onClick={() => setEvents((current) => [...current, { title: '', note: '', startDate: '', endDate: '' }])}
            className={`self-start ${buttonClasses('dashed', 'sm')}`}
          >
            + Add sub-event
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
            {status.kind === 'submitting' ? 'Saving…' : isEditMode ? 'Save changes' : 'Publish update'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/updates')}
            className={`self-start ${buttonClasses('ghost', 'lg')}`}
          >
            Cancel
          </button>
        </div>
      </form>

      <UpdatePreviewCard form={form} />
      </div>
    </div>
  );
}
