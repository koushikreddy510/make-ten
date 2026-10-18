/** Dates are handled as "YYYY-MM-DD" text in the player's own time zone, so "today" matches their calendar. */
export type DateKey = string;

const pad = (n: number) => String(n).padStart(2, '0');

export function toDateKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const todayKey = (now: Date = new Date()): DateKey => toDateKey(now);

export function previousDateKey(key: DateKey): DateKey {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-10-18" becomes "18 Oct 2026". */
export function formatDateKey(key: DateKey): string {
  const [y, m, d] = key.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export const isDateKey = (v: unknown): v is DateKey => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
