// ══ PLAN CACHE — the composed plan is reused while nothing it reads has changed ══
// Founder 2026-10-10 ("verifica andura pe unde gandeste la pagini... cache"; "da tre sa
// faci si un mecanism de refresh in cazul in care riscam dupa o modificare sa arate
// date eronate"). Every surface that shows the plan (Coach card, week preview, the
// "Alta grupa" list, Workout, PostRpe, SessionPill, coach director) recomposed it:
// ~1.5 s each on his 870-set account, several at once on the Coach tab.
//
// Refresh is not a timer guess. A plan is a function of the STORED state (every
// localStorage key: logs, learned engine state, every persisted store, settings, sync
// writes from another device), the two runtime hints compose reads (session time
// budget, last rating), the day and the clock. The cache keys each entry on a
// fingerprint of ALL of it: any write anywhere → the next read recomposes. On top: a
// new day or 15 minutes (recovery windows move with the clock) also recompose.
// Concurrent callers share one compose; each caller gets its own copy.

import { isEnabled } from '../../util/featureFlags.js';
import { useWorkoutStore } from '../stores/workoutStore';

export const PLAN_CACHE_TTL_MS = 15 * 60_000;

type Entry = { fp: string; day: string; at: number; value: Promise<unknown> };
const _cache = new Map<string, Entry>();

function _hash(s: string, h: number): number {
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return h;
}

/** Fingerprint of everything a plan reads. Null when storage is unreadable (never reuse). */
export function planFingerprint(): string | null {
  let h = 5381;
  try {
    const n = localStorage.length;
    for (let i = 0; i < n; i++) {
      const k = localStorage.key(i);
      if (k == null) continue;
      h = _hash(k, h);
      h = _hash(localStorage.getItem(k) ?? '', h);
    }
  } catch {
    return null;
  }
  const w = useWorkoutStore.getState();
  return `${h >>> 0}|${w.sessionTimeBudgetMin ?? ''}|${w.lastRating ?? ''}`;
}

function _localDay(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function _copy<T>(v: T): T {
  try { return v == null ? v : structuredClone(v); } catch { return v; }
}

/**
 * The plan for `key` (target day + options), recomposed only when the stored state,
 * the runtime hints, the day or the 15-minute window changed. Flag plan_cache_v1 off
 * → always recompose.
 */
export function cachedPlan<T>(key: string, compute: () => Promise<T>): Promise<T> {
  if (!isEnabled('plan_cache_v1')) return compute();
  const fp = planFingerprint();
  if (fp === null) return compute();
  const now = new Date();
  const day = _localDay(now);
  const hit = _cache.get(key);
  if (hit && hit.fp === fp && hit.day === day && now.getTime() - hit.at < PLAN_CACHE_TTL_MS) {
    return (hit.value as Promise<T>).then(_copy);
  }
  // The computing caller gets the plan itself; the cache keeps its own copy.
  const fresh = compute();
  const value = fresh.then(_copy);
  _cache.set(key, { fp, day, at: now.getTime(), value });
  value.catch(() => { if (_cache.get(key)?.value === value) _cache.delete(key); });
  return fresh;
}

/** Drop every cached plan (explicit refresh; test isolation). */
export function invalidatePlanCache(): void {
  _cache.clear();
}

// Test isolation without importing this module (and its store) into the global setup:
// setup.ts calls the hook in beforeEach when the module was loaded by the test.
(globalThis as { __anduraResetPlanCache?: () => void }).__anduraResetPlanCache = invalidatePlanCache;
