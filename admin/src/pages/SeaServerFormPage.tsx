import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSeaServer, fetchSeaServerById, updateSeaServer } from '@/lib/seaServers';
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

interface FormState {
  serverLabel: string;
  openDate: string;
}

const EMPTY_FORM: FormState = { serverLabel: '', openDate: '' };

type SubmitStatus = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'error'; message: string };

export function SeaServerFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const [loading, setLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    fetchSeaServerById(id)
      .then((entry) => {
        if (!entry) {
          setLoadError(`No server entry found for "${id}"`);
          return;
        }
        setForm({ serverLabel: entry.serverLabel, openDate: entry.openDate });
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : 'Failed to load server entry'))
      .finally(() => setLoading(false));
  }, [id]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.serverLabel.trim() || !form.openDate) {
      setStatus({ kind: 'error', message: 'Server label and open date are required' });
      return;
    }

    const payload = { serverLabel: form.serverLabel.trim(), openDate: form.openDate };

    const confirmed = await confirm(
      isEditMode
        ? { title: 'Save changes?', message: `Updates "${payload.serverLabel}" right away.` }
        : { title: 'Add this server?', message: `"${payload.serverLabel}" will appear on the public schedule right away.` }
    );
    if (!confirmed) return;

    setStatus({ kind: 'submitting' });
    try {
      if (isEditMode && id) {
        await updateSeaServer(id, payload);
        showToast(`Saved changes to "${payload.serverLabel}"`, 'success');
      } else {
        await createSeaServer(payload);
        showToast(`Added "${payload.serverLabel}"`, 'success');
      }
      navigate('/sea-servers');
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Failed to save server entry' });
    }
  }

  if (isEditMode && loading) {
    return <p className="text-sm text-muted">Loading server entry…</p>;
  }

  if (isEditMode && loadError) {
    return <p className="text-sm text-danger">{loadError}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Panel
          title="New Server"
          description="One row per SEA server launch. Status (upcoming / new / established) is derived from the open date on the public site — nothing else to set here."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Server label" required hint='Exactly as players should see it, e.g. "S45".'>
              <input
                value={form.serverLabel}
                onChange={(event) => updateField('serverLabel', event.target.value)}
                className={inputClasses}
                placeholder="e.g. S45"
              />
            </Field>
            <Field label="Open date" required>
              <input
                type="date"
                value={form.openDate}
                onChange={(event) => updateField('openDate', event.target.value)}
                className={inputClasses}
              />
            </Field>
          </div>
        </Panel>

        {status.kind === 'error' && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{status.message}</div>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={status.kind === 'submitting'} className={buttonClasses('primary', 'lg')}>
            {status.kind === 'submitting' ? 'Saving…' : isEditMode ? 'Save changes' : 'Add server'}
          </button>
          <button type="button" onClick={() => navigate('/sea-servers')} className={buttonClasses('ghost', 'lg')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
