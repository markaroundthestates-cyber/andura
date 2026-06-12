// ══ ANNOUNCEMENTS — founder→users channel (read-only) ════════════════════════
// Founder feature 2026-06-12 ("Adauga la Account un buton... Aici o sa punem
// patch notes si anunturile oficiale."). This is the READ side of an in-app
// announcements channel: the founder publishes official announcements + patch
// notes to a Firebase RTDB node; users READ them in the "Noutati" screen.
//
// DATA SOURCE — a TOP-LEVEL RTDB node `/announcements` (NOT under users/{uid} —
// it is shared, published by the founder via the admin tool):
//
//   /announcements = {
//     "<pushId>": {
//       "title":  "string",          // required, short headline
//       "body":   "string",          // required, multi-line plain text
//       "date":   "2026-06-12",      // ISO date (YYYY-MM-DD or full ISO)
//       "pinned": true               // optional — pinned cards float to top
//     },
//     ...
//   }
//
// The node is read over REST (NO Firebase SDK, per ADR 002), reusing the
// auth-aware URL builder from firebase.js. The Account tab is behind
// ProtectedRoute, so the read always carries the user's id token (the RTDB rule
// for `/announcements` only needs `.read` for authenticated users; founder owns
// the rule + the writes). Read-only on the client — the app never writes here.
//
// CACHE — the last good list is cached in localStorage (DB wrapper) so the
// screen paints instantly + works offline. The cache key is NOT a SYNC_KEY, so
// it never round-trips to the cloud (announcements are server-published; there
// is nothing to push up).
//
// i18n — this module emits ZERO user-facing copy. It returns data + a status;
// the screen renders all labels/states via t().

import { buildAuthUrl, FIREBASE_URL } from '../../firebase.js';
import { DB } from '../../db.js';

/** A single published announcement (normalized + safe to render). */
export interface Announcement {
  /** RTDB push id (stable identity — drives React keys + last-seen tracking). */
  id: string;
  title: string;
  /** Multi-line plain text. Rendered as text (never as raw HTML). */
  body: string;
  /** ISO date string the founder set (YYYY-MM-DD or full ISO). May be empty. */
  date: string;
  pinned: boolean;
  /**
   * Sort timestamp (ms). Derived from `date` when parseable, else 0 so an
   * undated entry sinks below dated ones (after the pinned block).
   */
  ts: number;
}

/** localStorage cache key for the last good announcements list (local-only). */
export const ANNOUNCEMENTS_CACHE_KEY = 'announcements-cache';
/** localStorage key for the newest `ts` the user has seen (unseen-dot source). */
export const ANNOUNCEMENTS_LAST_SEEN_KEY = 'announcements-last-seen';

// Mirror firebase.js _fbFetch — bound the request so a flaky mobile network
// can't hang the screen on its loading state forever.
const FETCH_TIMEOUT_MS = 15_000;

/**
 * Normalize one raw RTDB entry → a safe Announcement. Returns null when the
 * entry is malformed (missing title+body) so a single bad node can't break the
 * list. Defensive against hostile / partial cloud shapes.
 */
function normalizeEntry(id: string, raw: unknown): Announcement | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const title = typeof r.title === 'string' ? r.title.trim() : '';
  const body = typeof r.body === 'string' ? r.body : '';
  // An entry with neither a title nor a body carries nothing to show.
  if (!title && !body.trim()) return null;
  const date = typeof r.date === 'string' ? r.date : '';
  const parsed = date ? Date.parse(date) : NaN;
  return {
    id,
    title,
    body,
    date,
    pinned: r.pinned === true,
    ts: Number.isNaN(parsed) ? 0 : parsed,
  };
}

/**
 * Sort announcements for display: pinned first, then newest-first by `ts`
 * (ISO-date string as a stable tiebreaker so ordering is deterministic).
 */
export function sortAnnouncements(list: readonly Announcement[]): Announcement[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (b.ts !== a.ts) return b.ts - a.ts;
    return b.date.localeCompare(a.date);
  });
}

/** Parse + normalize the raw `/announcements` node value into a sorted list. */
export function parseAnnouncements(node: unknown): Announcement[] {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return [];
  const out: Announcement[] = [];
  for (const [id, raw] of Object.entries(node as Record<string, unknown>)) {
    const a = normalizeEntry(id, raw);
    if (a) out.push(a);
  }
  return sortAnnouncements(out);
}

/** Read the cached list (last good fetch). Empty array when absent/corrupt. */
export function readCachedAnnouncements(): Announcement[] {
  const cached = DB.get(ANNOUNCEMENTS_CACHE_KEY);
  if (!Array.isArray(cached)) return [];
  // Re-sort defensively (cache could predate a sort-rule change) + drop any
  // shape that no longer matches (best-effort; never throw on a stale cache).
  const safe = cached.filter(
    (e): e is Announcement =>
      !!e && typeof e === 'object' && typeof (e as Announcement).id === 'string',
  );
  return sortAnnouncements(safe);
}

/** Persist the latest good list locally for instant + offline paint. */
export function writeCachedAnnouncements(list: readonly Announcement[]): void {
  DB.set(ANNOUNCEMENTS_CACHE_KEY, list);
}

export type AnnouncementsStatus = 'ok' | 'error';

export interface AnnouncementsResult {
  status: AnnouncementsStatus;
  list: Announcement[];
  /** True when `list` came from the local cache (fetch failed / offline). */
  fromCache: boolean;
}

/**
 * Fetch the published announcements over REST (auth-aware), newest/pinned-first.
 * On any failure (offline, timeout, non-200, malformed) falls back to the last
 * cached list and reports `status: 'error'` so the screen can show a graceful
 * retry while still rendering any cached cards. A successful fetch refreshes the
 * cache. Never throws.
 */
export async function fetchAnnouncements(): Promise<AnnouncementsResult> {
  // Firebase not configured (e.g. local dev without the env var) → cache only.
  if (!FIREBASE_URL) {
    return { status: 'error', list: readCachedAnnouncements(), fromCache: true };
  }
  try {
    const url = await buildAuthUrl('announcements');
    const res = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      return { status: 'error', list: readCachedAnnouncements(), fromCache: true };
    }
    const node = await res.json();
    const list = parseAnnouncements(node);
    writeCachedAnnouncements(list);
    return { status: 'ok', list, fromCache: false };
  } catch {
    return { status: 'error', list: readCachedAnnouncements(), fromCache: true };
  }
}

/** Newest `ts` in a list (0 when empty) — the high-water mark for "seen". */
export function newestTs(list: readonly Announcement[]): number {
  return list.reduce((max, a) => (a.ts > max ? a.ts : max), 0);
}

/** The last-seen high-water mark the user acknowledged (0 when never opened). */
export function getLastSeenTs(): number {
  const v = DB.get(ANNOUNCEMENTS_LAST_SEEN_KEY);
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

/** Record that the user has seen everything up to the newest entry in `list`. */
export function markAnnouncementsSeen(list: readonly Announcement[]): void {
  const newest = newestTs(list);
  if (newest > getLastSeenTs()) DB.set(ANNOUNCEMENTS_LAST_SEEN_KEY, newest);
}

/**
 * Count of announcements newer than the last-seen mark (the unseen badge). Uses
 * the local cache so the Account row can show a dot WITHOUT a network round-trip
 * on every Account mount. Pinned entries with no date (ts 0) never count as
 * "unseen" (they have no recency signal).
 */
export function getUnseenCount(): number {
  const lastSeen = getLastSeenTs();
  return readCachedAnnouncements().filter((a) => a.ts > 0 && a.ts > lastSeen).length;
}
