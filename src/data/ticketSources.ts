import type { ReleaseTiming } from '../types/character';
import type { TranslationKey } from '../i18n/types';

export type TicketType = 'black' | 'stk';

export interface TicketSource {
  id: string;
  ticketType: TicketType;
  amount: number;
  timing: ReleaseTiming;
  labelKey: TranslationKey;
  /** Day-of-month after which this source can no longer be purchased/claimed for the month — undefined means no cutoff. */
  purchaseWindowEndDay?: number;
}

/** Fixed monthly sources — 81 black tickets + 18 STK tickets, every month, same cadence. */
export const TICKET_SOURCES: TicketSource[] = [
  { id: 'black-shop-early', ticketType: 'black', amount: 36, timing: 'Start of Month', labelKey: 'ticketCalculator.sources.blackShopEarly', purchaseWindowEndDay: 13 },
  { id: 'black-shop-mid', ticketType: 'black', amount: 36, timing: 'Mid Month', labelKey: 'ticketCalculator.sources.blackShopMid' },
  { id: 'black-event', ticketType: 'black', amount: 2, timing: 'Start of Month', labelKey: 'ticketCalculator.sources.blackEvent', purchaseWindowEndDay: 13 },
  { id: 'black-login', ticketType: 'black', amount: 5, timing: 'Start of Month', labelKey: 'ticketCalculator.sources.blackLogin', purchaseWindowEndDay: 13 },
  { id: 'black-bingo', ticketType: 'black', amount: 2, timing: 'Mid Month', labelKey: 'ticketCalculator.sources.blackBingo' },
  { id: 'stk-shop', ticketType: 'stk', amount: 6, timing: 'Mid Month', labelKey: 'ticketCalculator.sources.stkShop' },
  { id: 'stk-event', ticketType: 'stk', amount: 2, timing: 'Start of Month', labelKey: 'ticketCalculator.sources.stkEvent', purchaseWindowEndDay: 13 },
  { id: 'stk-login-early', ticketType: 'stk', amount: 3, timing: 'Start of Month', labelKey: 'ticketCalculator.sources.stkLoginEarly', purchaseWindowEndDay: 13 },
  { id: 'stk-login-mid', ticketType: 'stk', amount: 3, timing: 'Mid Month', labelKey: 'ticketCalculator.sources.stkLoginMid' },
  { id: 'stk-bingo', ticketType: 'stk', amount: 4, timing: 'Mid Month', labelKey: 'ticketCalculator.sources.stkBingo' },
];
