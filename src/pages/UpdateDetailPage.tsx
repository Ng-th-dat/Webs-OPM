import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGameUpdate } from '@/hooks/useGameUpdate';
import { BackLink } from '@/components/common/BackLink';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { BurstIcon } from '@/components/common/icons';
import {
  UPDATE_CATEGORY_ICONS,
  UPDATE_CATEGORY_LABEL_KEYS,
  UPDATE_CATEGORY_STYLES,
  formatEventDateRange,
  formatUpdateDate,
  getEventStatus,
} from '@/utils/gameUpdates';
import { SERVER_LABEL_KEYS, SERVER_STYLES } from '@/utils/releaseSchedule';
import { useSeo } from '@/hooks/useSeo';
import { useTranslation } from '@/hooks/useTranslation';
import { buildBreadcrumbJsonLd, truncateDescription } from '@/utils/seo';
import { NotFoundPage } from './NotFoundPage';

export function UpdateDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useTranslation();
  const { update: entry, loading, error } = useGameUpdate(slug);
  const [imageError, setImageError] = useState(false);

  useSeo({
    title: entry ? entry.title : t('updates.title'),
    description: entry ? truncateDescription(entry.description) : t('updates.description'),
    image: entry?.image,
    noindex: !loading && (Boolean(error) || !entry),
    jsonLd: entry
      ? buildBreadcrumbJsonLd([
          { name: t('common.home'), path: '/' },
          { name: t('updates.title'), path: '/updates' },
          { name: entry.title, path: `/updates/${entry.slug}` },
        ])
      : undefined,
  });

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl overflow-x-hidden px-4 py-16 sm:px-8 sm:py-20">
        <LoadingState label={t('common.loading')} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-6xl overflow-x-hidden px-4 py-16 sm:px-8 sm:py-20">
        <BackLink to="/updates">{t('common.backToUpdates')}</BackLink>
        <EmptyState
          icon={BurstIcon}
          title={t('common.errorTitle')}
          description={t('common.errorDescription')}
          className="mt-8"
        />
      </section>
    );
  }

  if (!entry) {
    return <NotFoundPage />;
  }

  const style = UPDATE_CATEGORY_STYLES[entry.category];
  const Icon = UPDATE_CATEGORY_ICONS[entry.category];
  const showImage = Boolean(entry.image) && !imageError;

  return (
    <section className="mx-auto max-w-6xl overflow-x-hidden px-4 py-16 sm:px-8 sm:py-20">
      <BackLink to="/updates">{t('common.backToUpdates')}</BackLink>

      <div className="relative aspect-video w-full overflow-hidden rounded-card border-2 border-border bg-elevated">
        {showImage ? (
          <img
            src={entry.image}
            alt=""
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={`comic-dots flex h-full w-full items-center justify-center ${style.iconBg}`}>
            <Icon className="h-14 w-14" />
          </div>
        )}
      </div>

      <div className="mt-6 flex max-w-3xl flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`comic-pill h-7 px-2.5 text-[10px] ${style.badge}`}>
            {t(UPDATE_CATEGORY_LABEL_KEYS[entry.category])}
          </span>
          {entry.server && (
            <span className={`comic-pill h-7 px-2.5 text-[10px] ${SERVER_STYLES[entry.server]}`}>
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
          <h2 className="comic-pill h-7 w-fit px-3 text-[11px]">{t('updates.eventSchedule')}</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entry.events.map((subEvent, index) => {
              const status = getEventStatus(subEvent);
              const hasDates = Boolean(subEvent.startDate && subEvent.endDate);
              return (
                <div
                  key={`${subEvent.title}-${index}`}
                  className={`relative flex flex-col gap-1.5 overflow-hidden rounded-lg border px-4 py-3.5 transition-colors duration-200 ${
                    status === 'ongoing'
                      ? 'border-accent-info/50 bg-accent-info/5'
                      : status === 'expired'
                        ? 'border-border bg-surface opacity-60'
                        : 'border-border bg-surface'
                  }`}
                >
                  <div aria-hidden="true" className="comic-dots pointer-events-none absolute inset-0 opacity-[0.04]" />
                  <div className="relative flex flex-wrap items-center gap-1.5">
                    {hasDates && (
                      <span className="comic-pill h-6 w-fit bg-elevated px-2 text-[10px] text-accent-info">
                        {formatEventDateRange(subEvent.startDate!, subEvent.endDate!)}
                      </span>
                    )}
                    {status === 'ongoing' && (
                      <span className="comic-pill h-6 w-fit bg-accent-info/15 px-2 text-[10px] font-bold uppercase tracking-wide text-accent-info">
                        {t('updates.eventStatus.ongoing')}
                      </span>
                    )}
                    {status === 'upcoming' && (
                      <span className="comic-pill h-6 w-fit bg-accent-secondary/15 px-2 text-[10px] font-bold uppercase tracking-wide text-accent-secondary">
                        {t('common.comingSoon')}
                      </span>
                    )}
                    {status === 'expired' && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-accent/70">
                        {t('updates.eventStatus.expired')}
                      </span>
                    )}
                  </div>
                  <div className="relative flex min-w-0 flex-wrap items-baseline gap-x-2">
                    <span
                      className={`text-sm font-semibold ${
                        status === 'expired' ? 'text-muted line-through decoration-accent/40' : 'text-foreground'
                      }`}
                    >
                      {subEvent.title}
                    </span>
                    {subEvent.note && (
                      <span className="text-xs text-subtle">({subEvent.note})</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
