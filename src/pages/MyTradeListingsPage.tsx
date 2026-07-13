import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMyTradeListings } from '@/hooks/useMyTradeListings';
import { markTradeListingSold } from '@/lib/api/tradeListings';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { TradeStatusBadge } from '@/components/trade/TradeStatusBadge';
import { CoinIcon, ImageIcon } from '@/components/common/icons';
import { formatTradeListingDate } from '@/utils/tradeListings';
import { useTranslation } from '@/hooks/useTranslation';

export function MyTradeListingsPage() {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const { listings, loading, refetch } = useMyTradeListings(user?.id);

  async function handleMarkSold(id: string) {
    await markTradeListingSold(id);
    refetch();
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-8 sm:py-20">
      <PageHeader title={t('trade.mine.title')} description={t('trade.mine.description')} />

      <div className="mt-8">
        {loading ? (
          <LoadingState label={t('common.loading')} />
        ) : listings.length === 0 ? (
          <EmptyState icon={CoinIcon} title={t('trade.mine.emptyTitle')} description={t('trade.mine.emptyDescription')} />
        ) : (
          <div className="flex flex-col gap-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface p-4"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-elevated">
                  {listing.images[0] ? (
                    <img src={listing.images[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-subtle" />
                  )}
                </div>

                <div className="min-w-[10rem] flex-1">
                  <Link to={`/trade/${listing.id}`} className="text-sm font-semibold text-foreground hover:text-accent-info">
                    {listing.title}
                  </Link>
                  <p className="text-xs text-subtle">{formatTradeListingDate(listing.createdAt, language)}</p>
                  {listing.status === 'rejected' && listing.rejectionReason && (
                    <p className="mt-1 text-xs text-danger">
                      {t('trade.mine.rejectionReasonLabel')}: {listing.rejectionReason}
                    </p>
                  )}
                </div>

                <TradeStatusBadge status={listing.status} />

                <div className="ml-auto flex items-center gap-2">
                  <Link
                    to={`/trade/${listing.id}/edit`}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-elevated"
                  >
                    {t('trade.editListing')}
                  </Link>
                  {listing.status === 'approved' && (
                    <button
                      type="button"
                      onClick={() => handleMarkSold(listing.id)}
                      className="rounded-full bg-accent-info px-3 py-1.5 text-xs font-bold text-canvas transition-opacity hover:opacity-90"
                    >
                      {t('trade.markSold')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
