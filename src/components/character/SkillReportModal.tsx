import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { submitFeedback } from '@/lib/api/feedback';
import { AlertTriangleIcon, HeartIcon, UserIcon, XIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

interface SkillReportModalProps {
  open: boolean;
  onClose: () => void;
  characterName: string;
  skillLabel: string;
}

const fieldClasses =
  'w-full rounded-lg border border-border bg-elevated px-4 text-base text-foreground placeholder:text-subtle transition-all duration-200 focus:border-accent-info/60 focus:outline-none focus:ring-2 focus:ring-accent-info/20';

export function SkillReportModal({ open, onClose, characterName, skillLabel }: SkillReportModalProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setMessage('');
      setContact('');
      setError(null);
      setSubmitting(false);
      setSubmitted(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await submitFeedback({
        message: `[${characterName} — ${skillLabel}]\n${message.trim()}`,
        contact: contact.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div
      className="animate-backdrop-in fixed inset-0 z-[100] flex items-center justify-center bg-canvas/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-report-title"
        onClick={(event) => event.stopPropagation()}
        className="animate-modal-in relative max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-card border border-border bg-surface p-6 shadow-2xl shadow-black/40 sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.closeMenu')}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-subtle transition-colors duration-200 hover:bg-elevated hover:text-foreground"
        >
          <XIcon className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
              <HeartIcon className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">{t('feedback.thanksTitle')}</h2>
            <p className="text-sm text-muted">{t('feedback.thanksDescription')}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-secondary/15 text-accent-secondary">
                <AlertTriangleIcon className="h-5 w-5" />
              </span>
              <h2 id="skill-report-title" className="text-xl font-extrabold tracking-tight text-foreground">
                {t('characterDetail.report.title')}
              </h2>
              <p className="text-sm text-muted">{t('characterDetail.report.description')}</p>
            </div>

            <div className="mt-5 rounded-lg border border-border bg-elevated px-3.5 py-2.5 text-xs">
              <span className="font-bold uppercase tracking-wide text-subtle">{t('characterDetail.report.about')}: </span>
              <span className="font-semibold text-foreground">
                {characterName} — {skillLabel}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {t('characterDetail.report.messageLabel')}
                </span>
                <textarea
                  required
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={t('characterDetail.report.messagePlaceholder')}
                  className={`${fieldClasses} min-h-[7rem] resize-y py-3`}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t('feedback.contactLabel')}</span>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                  <input
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    placeholder={t('feedback.contactPlaceholder')}
                    className={`${fieldClasses} h-12 pl-11`}
                  />
                </div>
              </label>

              {error && <p className="text-sm text-accent">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="h-12 rounded-lg bg-accent-secondary text-sm font-bold text-canvas transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? t('common.loading') : t('characterDetail.report.submit')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
