import type { TradeListingStatus } from '@/types/tradeListing';
import type { TranslationKey } from '@/i18n';

/** Posting fee in phiếu (the platform's internal token, 1 phiếu = 1,000 VND) — see src/utils/wallet.ts. */
export const TRADE_LISTING_FEE_PHIEU = 5;

export const TRADE_STATUS_LABEL_KEYS: Record<TradeListingStatus, TranslationKey> = {
  pending: 'trade.status.pending',
  approved: 'trade.status.approved',
  rejected: 'trade.status.rejected',
  sold: 'trade.status.sold',
};

export const TRADE_STATUS_STYLES: Record<TradeListingStatus, string> = {
  pending: 'bg-accent-secondary text-canvas',
  approved: 'bg-rarity-r text-canvas',
  rejected: 'bg-accent text-canvas',
  sold: 'bg-subtle text-canvas',
};

export function formatTradeListingDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
