import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { GameCodeStatus } from '@main/types/gameCode';
import { createGameCode, fetchGameCodeById, updateGameCode } from '@/lib/gameCodes';
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
  code: string;
  status: GameCodeStatus;
}

const EMPTY_FORM: FormState = { code: '', status: 'active' };

type SubmitStatus = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'error'; message: string };

export function GameCodeFormPage() {
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
    fetchGameCodeById(id)
      .then((entry) => {
        if (!entry) {
          setLoadError(`No code entry found for "${id}"`);
          return;
        }
        setForm({ code: entry.code, status: entry.status });
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : 'Failed to load code entry'))
      .finally(() => setLoading(false));
  }, [id]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.code.trim()) {
      setStatus({ kind: 'error', message: 'Code is required' });
      return;
    }

    const payload = { code: form.code.trim(), status: form.status };

    const confirmed = await confirm(
      isEditMode
        ? { title: 'Save changes?', message: `Updates "${payload.code}" right away.` }
        : { title: 'Add this code?', message: `"${payload.code}" will appear on the public codes page right away.` }
    );
    if (!confirmed) return;

    setStatus({ kind: 'submitting' });
    try {
      if (isEditMode && id) {
        await updateGameCode(id, payload);
        showToast(`Saved changes to "${payload.code}"`, 'success');
      } else {
        await createGameCode(payload);
        showToast(`Added "${payload.code}"`, 'success');
      }
      navigate('/game-codes');
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Failed to save code entry' });
    }
  }

  if (isEditMode && loading) {
    return <p className="text-sm text-muted">Loading code entry…</p>;
  }

  if (isEditMode && loadError) {
    return <p className="text-sm text-danger">{loadError}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Panel title="Redeem Code" description="Shown on the public site only while status is Active.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Code" required hint='Exactly as players should type it, e.g. "OPM2026JULY".'>
              <input
                value={form.code}
                onChange={(event) => updateField('code', event.target.value)}
                className={`${inputClasses} font-mono`}
                placeholder="e.g. OPM2026JULY"
              />
            </Field>
            <Field label="Status" required hint="Flip to Expired once the code stops working — that's what hides it from the public page.">
              <select
                value={form.status}
                onChange={(event) => updateField('status', event.target.value as GameCodeStatus)}
                className={inputClasses}
              >
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </Field>
          </div>
        </Panel>

        {status.kind === 'error' && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{status.message}</div>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={status.kind === 'submitting'} className={buttonClasses('primary', 'lg')}>
            {status.kind === 'submitting' ? 'Saving…' : isEditMode ? 'Save changes' : 'Add code'}
          </button>
          <button type="button" onClick={() => navigate('/game-codes')} className={buttonClasses('ghost', 'lg')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
