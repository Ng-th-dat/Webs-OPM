import { useParams } from 'react-router-dom';
import { useGameUpdate } from '@/hooks/useGameUpdate';
import { BackLink } from '@/components/common/BackLink';
import { LoadingState } from '@/components/common/LoadingState';
import {
  UPDATE_CATEGORY_ICONS,
  UPDATE_CATEGORY_LABEL_KEYS,
  UPDATE_CATEGORY_STYLES,
  formatUpdateDate,
} from '@/utils/gameUpdates';
import { SERVER_LABEL_KEYS, SERVER_STYLES } from '@/utils/releaseSchedule';
import { useTranslation } from '@/hooks/useTranslation';
import { NotFoundPage } from './NotFoundPage';

export function UpdateDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useTranslation();
  const { update: entry, loading } = useGameUpdate(slug);

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8 sm:py-20">
        <LoadingState label={t('common.loading')} />
      </section>
    );
  }

  if (!entry) {
    return <NotFoundPage />;
  }

  const style = UPDATE_CATEGORY_STYLES[entry.category];
  const Icon = UPDATE_CATEGORY_ICONS[entry.category];

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8 sm:py-20">
      <BackLink to="/updates">{t('common.backToUpdates')}</BackLink>

      <div className="relative aspect-video w-full overflow-hidden rounded-card border border-border bg-elevated">
        {entry.image ? (
          <img src={entry.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${style.iconBg}`}>
            <Icon className="h-14 w-14" />
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}
          >
            {t(UPDATE_CATEGORY_LABEL_KEYS[entry.category])}
          </span>
          {entry.server && (
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SERVER_STYLES[entry.server]}`}
            >
              {t(SERVER_LABEL_KEYS[entry.server])}
            </span>
          )}
          <span className="text-xs font-medium text-subtle">
            {formatUpdateDate(entry.date, language)}
          </span>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {entry.title}
        </h1>

        <p className="text-base leading-relaxed text-muted">{entry.description}</p>
      </div>

      {entry.events && entry.events.length > 0 && (
        <div className="mt-10 flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-subtle">
            {t('updates.eventSchedule')}
          </h2>

          <div className="flex flex-col divide-y divide-border rounded-card border border-border bg-surface">
            {entry.events.map((subEvent, index) => (
              <div
                key={`${subEvent.dateRange}-${index}`}
                className="flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="shrink-0 font-mono text-xs font-semibold text-accent-info sm:w-32">
                  {subEvent.dateRange}
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-semibold text-foreground">{subEvent.title}</span>
                  {subEvent.note && (
                    <span className="text-xs text-subtle">({subEvent.note})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
