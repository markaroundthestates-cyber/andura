// ══ DB + UTIL TYPE STUBS — A022a iter 2 prep ════════════════════════════
// §A022a audit fix iter 2 prep — type stubs pentru db.js + util fns to
// unblock incremental TS strict checkJs migration (A022b-A022f).
//
// Mirrors src/db.js JSDoc-implicit signatures. Generic <T> on DB.get/set
// for callers to narrow at use site.

export const DB: {
  get<T = unknown>(key: string): T | null;
  set<T = unknown>(key: string, value: T): void;
};

/** Generic `document.getElementById` shorthand. Returns null when absent. */
export function $(id: string): HTMLElement | null;

/** Current local date as YYYY-MM-DD (sv locale, NOT UTC). */
export function tod(): string;

/** Convert timestamp (ms or ISO) to local date YYYY-MM-DD. */
export function todTs(ts: number | string): string;

/** Local date for arbitrary Date object as YYYY-MM-DD. */
export function todDate(d: Date): string;

/** Format ISO string to ro-RO short date (e.g. "12 mai"). */
export function fmt(s: string): string;

/** Strip exercise name suffix variants (wide/neutral/rope/cable/drop/pump). */
export function cleanEx(n: string): string;
