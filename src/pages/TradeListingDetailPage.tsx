import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTradeListing } from '@/hooks/useTradeListing';
import { markTradeListingSold } from '@/lib/api/tradeListings';
import { BackLink } from '@/components/common/BackLink';
import { LoadingState } from '@/components/common/LoadingState';
import { TradeStatusBadge } from '@/components/trade/TradeStatusBadge';
import { AlertTriangleIcon, ImageIcon } from '@/components/common/icons';
import { SERVER_LABEL_KEYS, SERVER_STYLES } from '@/utils/releaseSchedule';
import { formatTradeListingDate } from '@/utils/tradeListings';
import { useTranslation } from '@/hooks/useTranslation';
import { NotFoundPage } from './NotFoundPage';

export function TradeListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { listing, loading } = useTradeListing(id);
  const [activeImage, setActiveImage] = useState(0);
  const [markingSold, setMarkingSold] = useState(false);

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8 sm:py-20">
        <LoadingState label={t('common.loading')} />
      </section>
    );
  }

  if (!listing) {
    return <NotFoundPage />;
  }

  const isOwner = user?.id === listing.userId;

  async function handleMarkSold() {
    if (!id) return;
    setMarkingSold(true);
    try {
      await markTradeListingSold(id);
      navigate(0);
    } finally {
      setMarkingSold(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8 sm:py-20">
      <BackLink to="/trade">{t('common.backToTrade')}</BackLink>

      <div className="relative aspect-video w-full overflow-hidden rounded-card border border-border bg-elevated">
        {listing.images.length > 0 ? (
          <img src={listing.images[activeImage]} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-subtle">
            <ImageIcon className="h-14 w-14" />
          </div>
        )}
      </div>

      {listing.images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {listing.images.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveImage(index)}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border transition-colors ${
                index === activeImage ? 'border-accent-info' : 'border-border'
              }`}
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SERVER_STYLES[listing.server]}`}
          >
            {t(SERVER_LABEL_KEYS[listing.server])}
          </span>
          <TradeStatusBadge status={listing.status} />
          {isOwner && (
            <span className="text-[11px] font-semibold text-accent-info">{t('trade.ownListingBadge')}</span>
          )}
          <span className="text-xs font-medium text-subtle">{t('trade.postedOn', { date: formatTradeListingDate(listing.createdAt, language) })}</span>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{listing.title}</h1>
        <p className="text-xl font-bold text-accent-secondary">{listing.priceText}</p>

        {listing.status === 'rejected' && listing.rejectionReason && (
          <p className="rounded-card border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {t('trade.mine.rejectionReasonLabel')}: {listing.rejectionReason}
          </p>
        )}

        <p className="text-base leading-relaxed text-muted">{listing.description}</p>

        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-subtle">{t('trade.contactLabel')}</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{listing.contactInfo}</p>
        </div>

        {isOwner && (
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/trade/${listing.id}/edit`}
              className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:border-accent-info/40 hover:bg-elevated"
            >
              {t('trade.editListing')}
            </Link>
            {listing.status === 'approved' && (
              <button
                type="button"
                onClick={handleMarkSold}
                disabled={markingSold}
                className="inline-flex h-10 items-center rounded-lg bg-accent-info px-4 text-sm font-bold text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {t('trade.markSold')}
              </button>
            )}
          </div>
        )}

        <Link
          to="/trade/disclaimer"
          className="mt-2 flex items-start gap-2 rounded-card border border-dashed border-border bg-surface px-4 py-3 text-xs text-subtle transition-colors hover:border-accent-info/40 hover:text-foreground"
        >
          <AlertTriangleIcon className="h-4 w-4 shrink-0 text-accent-secondary" />
          <span>
            {t('trade.disclaimerNotice')} <span className="font-semibold text-accent-info">{t('trade.readDisclaimer')}</span>
          </span>
        </Link>
      </div>
    </section>
  );
}
