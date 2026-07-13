import type { TradeListingStatus } from '@/types/tradeListing';
import { TRADE_STATUS_LABEL_KEYS, TRADE_STATUS_STYLES } from '@/utils/tradeListings';
import { useTranslation } from '@/hooks/useTranslation';

interface TradeStatusBadgeProps {
  status: TradeListingStatus;
  className?: string;
}

export function TradeStatusBadge({ status, className = '' }: TradeStatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TRADE_STATUS_STYLES[status]} ${className}`}
    >
      {t(TRADE_STATUS_LABEL_KEYS[status])}
    </span>
  );
}
