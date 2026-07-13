import { useState } from 'react';
import type { FormEvent } from 'react';
import { submitFeedback } from '@/lib/api/feedback';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { HeartIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

const inputClasses =
  'w-full rounded-lg border border-border bg-elevated px-4 text-base text-foreground placeholder:text-subtle transition-all duration-200 focus:border-accent-info/60 focus:outline-none focus:ring-2 focus:ring-accent-info/20';

export function FeedbackPage() {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await submitFeedback({ message: message.trim(), contact: contact.trim() || undefined });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 sm:px-8 sm:py-20">
        <EmptyState icon={HeartIcon} title={t('feedback.thanksTitle')} description={t('feedback.thanksDescription')} />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-16 sm:px-8 sm:py-20">
      <PageHeader title={t('feedback.title')} description={t('feedback.description')} />

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 rounded-card border border-border bg-surface p-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t('feedback.messageLabel')}</span>
          <textarea
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t('feedback.messagePlaceholder')}
            className={`${inputClasses} min-h-[9rem] resize-y py-3`}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t('feedback.contactLabel')}</span>
          <input
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            placeholder={t('feedback.contactPlaceholder')}
            className={`${inputClasses} h-12`}
          />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="h-12 rounded-lg bg-accent-info text-sm font-bold text-canvas transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? t('common.loading') : t('feedback.submit')}
        </button>
      </form>
    </section>
  );
}
