import { TICKET_SOURCES, type TicketSource } from '@/data/ticketSources';
import { timingToDate, type SpotlightEntry } from './releaseSchedule';
import type { TicketCalculatorInput, TicketCalculatorResult } from '@/types/calculator';

/** True once a source's monthly purchase/claim window has closed and it's too late to get it this month. */
export function isPurchaseWindowClosed(source: TicketSource, now: Date = new Date()): boolean {
  return source.purchaseWindowEndDay !== undefined && now.getDate() > source.purchaseWindowEndDay;
}

/**
 * Walks month-by-month from today through the target date. For the current month, a
 * source only counts if it hasn't already been claimed and its purchase window (if any)
 * hasn't closed yet; every later month counts in full (assumes the player claims
 * everything going forward — the realistic default for a forward projection).
 */
export function calculateProjectedTickets(input: TicketCalculatorInput): TicketCalculatorResult {
  const now = new Date();
  const target = new Date(input.targetDate);

  let blackTicketsGained = 0;
  let stkTicketsGained = 0;
  const upcomingSources: { source: (typeof TICKET_SOURCES)[number]; date: string }[] = [];

  let month = now.getMonth() + 1;
  let year = now.getFullYear();

  while (year < target.getFullYear() || (year === target.getFullYear() && month <= target.getMonth() + 1)) {
    const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

    for (const source of TICKET_SOURCES) {
      const date = timingToDate(month, year, source.timing);
      if (date > target) continue;
      if (isCurrentMonth && input.claimedSourceIds.includes(source.id)) continue;
      // A source whose purchase window has already closed this month is gone, not "still coming."
      if (isCurrentMonth && isPurchaseWindowClosed(source, now)) continue;

      if (source.ticketType === 'black') {
        blackTicketsGained += source.amount;
      } else {
        stkTicketsGained += source.amount;
      }
      upcomingSources.push({ source, date: date.toISOString() });
    }

    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  upcomingSources.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    projectedBlackTickets: input.currentBlackTickets + blackTicketsGained,
    projectedStkTickets: input.currentStkTickets + stkTicketsGained,
    blackTicketsGained,
    stkTicketsGained,
    upcomingSources,
  };
}

export interface TicketTimelineRow {
  key: string;
  kind: 'event' | 'target';
  date: Date;
  event?: SpotlightEntry;
  includedBlack: { source: TicketSource; date: string }[];
  includedStk: { source: TicketSource; date: string }[];
  cumulativeBlack: number;
  cumulativeStk: number;
}

/**
 * Turns the flat, date-sorted `upcomingSources` list into one row per character
 * Debut/Comeback event (plus a trailing row for the target date itself, when it doesn't
 * already coincide with the last event) — each row shows only the sources newly counted
 * since the previous row, and the running cumulative total.
 */
export function buildTicketTimeline(
  events: SpotlightEntry[],
  upcomingSources: TicketCalculatorResult['upcomingSources'],
  currentBlackTickets: number,
  currentStkTickets: number,
  targetDate: Date
): TicketTimelineRow[] {
  const rows: TicketTimelineRow[] = [];
  let cumulativeBlack = currentBlackTickets;
  let cumulativeStk = currentStkTickets;
  let sourceIndex = 0;

  function collectUpTo(date: Date): { black: { source: TicketSource; date: string }[]; stk: { source: TicketSource; date: string }[] } {
    const black: { source: TicketSource; date: string }[] = [];
    const stk: { source: TicketSource; date: string }[] = [];
    while (sourceIndex < upcomingSources.length && new Date(upcomingSources[sourceIndex].date) <= date) {
      const entry = upcomingSources[sourceIndex];
      if (entry.source.ticketType === 'black') {
        black.push(entry);
        cumulativeBlack += entry.source.amount;
      } else {
        stk.push(entry);
        cumulativeStk += entry.source.amount;
      }
      sourceIndex += 1;
    }
    return { black, stk };
  }

  for (const event of events) {
    const { black, stk } = collectUpTo(event.date);
    rows.push({
      key: event.key,
      kind: 'event',
      date: event.date,
      event,
      includedBlack: black,
      includedStk: stk,
      cumulativeBlack,
      cumulativeStk,
    });
  }

  const lastDate = events[events.length - 1]?.date;
  if (!lastDate || targetDate.getTime() > lastDate.getTime()) {
    const { black, stk } = collectUpTo(targetDate);
    rows.push({
      key: 'target',
      kind: 'target',
      date: targetDate,
      includedBlack: black,
      includedStk: stk,
      cumulativeBlack,
      cumulativeStk,
    });
  }

  return rows;
}
