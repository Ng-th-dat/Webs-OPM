const DAY_ABBREVIATIONS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function dateKey(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

export interface DayBucket {
  date: Date;
  key: string;
  label: string;
}

/** Most recent `days` calendar days, oldest first, ending today. */
export function buildDayBuckets(days: number): DayBucket[] {
  const today = startOfDay(new Date());
  const buckets: DayBucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const label = `${DAY_ABBREVIATIONS[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
    buckets.push({ date, key: dateKey(date), label });
  }
  return buckets;
}

/** Number of `items` whose date (via `getDate`) falls on each of the last `days` days. */
export function countByDay<T>(items: T[], getDate: (item: T) => string, days: number): number[] {
  const buckets = buildDayBuckets(days);
  const counts = new Map<string, number>(buckets.map((bucket) => [bucket.key, 0]));
  for (const item of items) {
    const key = dateKey(new Date(getDate(item)));
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return buckets.map((bucket) => counts.get(bucket.key) ?? 0);
}

/** Sum of `getAmount(item)` for items whose date falls on each of the last `days` days. */
export function sumByDay<T>(items: T[], getDate: (item: T) => string, getAmount: (item: T) => number, days: number): number[] {
  const buckets = buildDayBuckets(days);
  const sums = new Map<string, number>(buckets.map((bucket) => [bucket.key, 0]));
  for (const item of items) {
    const key = dateKey(new Date(getDate(item)));
    if (sums.has(key)) sums.set(key, (sums.get(key) ?? 0) + getAmount(item));
  }
  return buckets.map((bucket) => sums.get(bucket.key) ?? 0);
}

export function isWithinDays(dateStr: string, days: number): boolean {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(dateStr).getTime() >= cutoff;
}
