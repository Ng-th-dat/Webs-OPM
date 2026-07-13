import type { TradeListing } from '@/types/tradeListing';
import { EmptyState } from '@/components/common/EmptyState';
import { CoinIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { TradeListingCard } from './TradeListingCard';

interface TradeListingGridProps {
  listings: TradeListing[];
}

export function TradeListingGrid({ listings }: TradeListingGridProps) {
  const { t } = useTranslation();

  if (listings.length === 0) {
    return (
      <EmptyState icon={CoinIcon} title={t('trade.emptyTitle')} description={t('trade.emptyDescription')} />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <TradeListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
