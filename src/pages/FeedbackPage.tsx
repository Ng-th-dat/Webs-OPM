import { useState } from 'react';
import type { ComponentType, CSSProperties, FormEvent, ReactNode, SVGProps } from 'react';
import { Link } from 'react-router-dom';
import { submitFeedback } from '@/lib/api/feedback';
import { PageHeader } from '@/components/common/PageHeader';
import { HudCorners } from '@/components/common/HudCorners';
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckIcon,
  HeartIcon,
  ShieldIcon,
  UserIcon,
} from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSeo } from '@/hooks/useSeo';
import type { TranslationKey } from '@/i18n';

const fieldClasses =
  'w-full rounded-lg border border-border bg-canvas/60 px-4 text-base text-foreground placeholder:text-subtle shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] transition-all duration-200 hover:border-accent-info/40 focus:border-accent-info/60 focus:outline-none focus:ring-2 focus:ring-accent-info/20';

interface DebriefItem {
  key: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  link?: { to: string; labelKey: TranslationKey };
}

const DEBRIEF_ITEMS: DebriefItem[] = [
  { key: 'read', icon: HeartIcon, titleKey: 'feedback.after.readTitle', bodyKey: 'feedback.after.readBody' },
  {
    key: 'fix',
    icon: CheckIcon,
    titleKey: 'feedback.after.fixTitle',
    bodyKey: 'feedback.after.fixBody',
    link: { to: '/updates', labelKey: 'feedback.after.fixLink' },
  },
  { key: 'privacy', icon: ShieldIcon, titleKey: 'feedback.after.privacyTitle', bodyKey: 'feedback.after.privacyBody' },
];

function ConsoleShell({
  children,
  glowPosition,
  cornerClassName,
  className = '',
  style,
}: {
  children: ReactNode;
  glowPosition?: string;
  cornerClassName?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface ${className}`}
      style={style}
    >
      <div aria-hidden="true" className="comic-dots pointer-events-none absolute inset-0 opacity-[0.04]" />
      {glowPosition && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: glowPosition }} />
      )}
      {cornerClassName && <HudCorners className={cornerClassName} />}
      {children}
    </div>
  );
}

function DebriefPanel({ className = '', style }: { className?: string; style?: CSSProperties }) {
  const { t } = useTranslation();

  return (
    <ConsoleShell className={className} style={style}>
      <div className="relative flex flex-1 flex-col gap-5 p-6 sm:p-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-subtle">{t('feedback.afterTitle')}</h2>

        <div className="flex flex-1 flex-col justify-center gap-7">
          {DEBRIEF_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-elevated text-accent-secondary">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-foreground">{t(item.titleKey)}</p>
                  <p className="text-xs leading-relaxed text-muted">{t(item.bodyKey)}</p>
                  {item.link && (
                    <Link
                      to={item.link.to}
                      className="mt-0.5 inline-flex w-fit items-center gap-1 text-xs font-semibold text-accent-info transition-colors hover:text-foreground"
                    >
                      {t(item.link.labelKey)}
                      <ArrowRightIcon className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ConsoleShell>
  );
}

export function FeedbackPage() {
  const { t } = useTranslation();
  useSeo({ title: t('feedback.title'), description: t('feedback.description') });
  const reducedMotion = useReducedMotion();
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function reveal(delayMs: number, animationClass = 'animate-rise-in'): { className: string; style?: CSSProperties } {
    if (reducedMotion) return { className: '' };
    return { className: animationClass, style: { animationDelay: `${delayMs}ms` } };
  }

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
    const stampReveal = reveal(100, 'animate-panel-slam');
    const bodyReveal = reveal(260);

    return (
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-xl">
          <ConsoleShell
            glowPosition="radial-gradient(420px circle at 50% 0%, var(--color-accent-glow), transparent 65%)"
            cornerClassName="border-accent/50"
            className="px-6 py-16 text-center"
          >
            <div className="relative flex flex-col items-center gap-5">
              <span
                className={`select-none whitespace-nowrap rounded-md border-4 border-dashed border-accent bg-canvas/90 px-5 py-2 text-lg font-extrabold uppercase tracking-widest text-accent shadow-[2px_2px_0_rgba(0,0,0,0.35)] ${stampReveal.className}`}
                style={{ ...stampReveal.style, '--slam-rotate': '-6deg' } as CSSProperties}
              >
                {t('feedback.stampLabel')}
              </span>

              <div className={bodyReveal.className} style={bodyReveal.style}>
                <h1 className="flex items-center justify-center gap-2 text-2xl font-extrabold text-foreground">
                  <HeartIcon className="h-5 w-5 text-accent" />
                  {t('feedback.thanksTitle')}
                </h1>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{t('feedback.thanksDescription')}</p>
              </div>
            </div>
          </ConsoleShell>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
      <PageHeader eyebrow={t('feedback.eyebrow')} title={t('feedback.title')} description={t('feedback.description')} />

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-stretch">
        <form
          onSubmit={handleSubmit}
          className={reveal(0).className}
          style={reveal(0).style}
        >
          <ConsoleShell>
            <div className="relative flex flex-col gap-5 p-6 sm:p-8">
              <label className="flex flex-col gap-1.5">
                <span className="flex items-baseline justify-between text-xs font-semibold uppercase tracking-wide text-muted">
                  {t('feedback.messageLabel')}
                  <span className="font-mono text-[10px] font-normal normal-case tracking-normal text-subtle">
                    {t('feedback.charCount', { count: message.length })}
                  </span>
                </span>
                <textarea
                  required
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={t('feedback.messagePlaceholder')}
                  className={`${fieldClasses} min-h-[11rem] resize-y py-3`}
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

              {error && (
                <div className="comic-caption flex items-start gap-2" style={{ borderLeftColor: 'var(--color-accent)' }}>
                  <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <p className="text-sm text-accent">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="comic-pill comic-pill--active h-14 w-full text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? t('common.loading') : t('feedback.submit')}
              </button>
            </div>
          </ConsoleShell>
        </form>

        <DebriefPanel className={reveal(120).className} style={reveal(120).style} />
      </div>
    </section>
  );
}
