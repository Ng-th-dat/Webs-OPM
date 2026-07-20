import { Link } from 'react-router-dom';
import type { TradeListing } from '@/types/tradeListing';
import { SERVER_LABEL_KEYS, SERVER_STYLES } from '@/utils/releaseSchedule';
import { formatTradeListingDate } from '@/utils/tradeListings';
import { ImageIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

interface TradeListingCardProps {
  listing: TradeListing;
}

export function TradeListingCard({ listing }: TradeListingCardProps) {
  const { t, language } = useTranslation();

  return (
    <Link
      to={`/trade/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface transition duration-300 hover:-translate-y-1 hover:border-accent-info/30"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-elevated">
        {listing.images[0] ? (
          <img
            src={listing.images[0]}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-subtle">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SERVER_STYLES[listing.server]}`}
          >
            {t(SERVER_LABEL_KEYS[listing.server])}
          </span>
          <span className="text-[11px] font-medium text-subtle">
            {formatTradeListingDate(listing.createdAt, language)}
          </span>
        </div>

        {/* line-clamp only truncates on a plain block, not a flex item directly — see CharacterCard */}
        <div>
          <h3 className="line-clamp-2 text-base font-bold text-foreground transition-colors duration-200 group-hover:text-accent-info">
            {listing.title}
          </h3>
        </div>

        <p className="mt-auto text-sm font-semibold text-accent-secondary">{listing.priceText}</p>
      </div>
    </Link>
  );
}
