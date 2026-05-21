// ══ TIERING ENGINE — Tier 0 ↔ Tier 1 rotation orchestrator (ADR 020) ════════
// Per ADR 020 §Rotation trigger: move-only rotation Tier 0 (`localStorage`,
// hot, last 30d) → Tier 1 (Dexie/IndexedDB, warm, 30-180d pre-launch).
// Triggers: localStorage size > 4MB OR entry age > 30d (whichever first).
//
// Zero info loss principle absolut:
//   1. Write Tier 1 first (Dexie put + verify).
//   2. Only delete from Tier 0 daca Tier 1 confirm.
//   3. Failure mode: keep Tier 0, retry next tick (3-attempt backoff), Sentry
//      alert pe persistent fail.
//
// ── ADR 020 §6 Open Items decisions (defaults applied here) ─────────────────
//
//  1. Threshold rotation: localStorage > 4MB OR entry.ts age > 30d.
//  2. Alert "Storage Full" UX: Sprint 4.1 deferred — Sentry warn only,
//     NU UI prompt inca (wording user-facing pending Daniel review).
//  3. Failure mode IDB write fail: 3-attempt exponential backoff (1s, 2s, 4s),
//     Sentry critical pe persistent fail. Retain Tier 0 entry intact.
//  4. Multi-tenant namespacing: handled in `db.js` `getNamespace()`. Pre-Auth
//     uses `firebase.userPath`, post-Auth migrates to `auth.uid`. Out of scope.
//  5. Periodic check interval: hourly default (`ROTATION_CHECK_INTERVAL_MS =
//     3600000`). Configurable via `initAutoBackup({ intervalMs })`.
//  6. Profile typing v2 footprint: telemetry via `getStorageStats()` —
//     Sprint 4.1 measure post-deploy, flag daca Tier 0 > 80% budget.

import { DB } from '../db.js';
import { captureException as sentryCaptureException } from '../util/sentry.js';
import {
  STORES,
  tier1Bulk,
  logMigrationEvent,
} from './db.js';

// ── Constants (ADR 020 §6 defaults, configurable via opts) ──────────────────

/** Rotation: max localStorage size before forced Tier 0 → Tier 1 push (bytes). */
export const TIER0_SIZE_LIMIT_BYTES = 4 * 1024 * 1024; // 4MB

/** Rotation: entries older than this go Tier 1 (ms). */
export const TIER0_AGE_LIMIT_MS = 30 * 24 * 60 * 60 * 1000; // 30d

/** Periodic check tick (ms). Hourly = balance freshness vs CPU. */
export const ROTATION_CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1h

/** Retry backoff schedule on Tier 1 write fail. */
export const RETRY_BACKOFF_MS = [1000, 2000, 4000];

/**
 * Mapping of Tier 0 localStorage key → Tier 1 Dexie store name. Drives
 * rotation: per key, classify entries by age, push old ones to its mapped
 * store, retain new ones in localStorage.
 *
 * Cross-ref: `src/util/dataRegistry.js` CDL_KEYS + USER_DATA_KEYS for
 * canonical key list.
 *
 * **Phase 1 scope (current):** rotate `coach-decisions` + `coach-decisions-
 * aggregate` + `applied-patterns`. These are the unbounded-growth keys with
 * highest size impact (CDL ~1KB/entry × 250+ entries/year = ~250KB).
 *
 * **Phase 2 scope (Sprint 4.x):** add `logs` rotation. Blocked on engine
 * read path async refactor — `calibration.js::detectCalibrationLevel` reads
 * `ctx.allLogs` for `days_since_first_session` and `unique_session_count`
 * (ADR 009). Naive rotation today would silently truncate calibration to
 * last 30d. Resolution: build `getTieredLogs()` async merge helper +
 * `coachContext.js` async-aware build pass. Tracked as Sprint 4.x deliverable.
 *
 * Static config (sf.userConfig, weights, onboarding flags) stays Tier 0
 * forever — small, recent-relevant only.
 */
export const ROTATABLE_KEYS = Object.freeze({
  'coach-decisions': STORES.CDL_TIER1,
  'coach-decisions-aggregate': STORES.CDL_TIER1,
  'applied-patterns': STORES.APPLIED_PATTERNS_TIER1,
});

// ── Module-level state (timer handle for shutdown / test cleanup) ───────────

/** @type {ReturnType<typeof setInterval> | null} */
let _checkTimer = null;

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Estimate Tier 0 size (localStorage bytes used). Sum of stringified value
 * lengths. Browser quotas are typically per-origin ~5MB; we trigger at 4MB.
 *
 * @returns {number} approximate bytes
 */
export function estimateTier0Bytes() {
  if (typeof localStorage === 'undefined') return 0;
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    const v = localStorage.getItem(k) ?? '';
    total += k.length + v.length;
  }
  return total * 2; // UTF-16 — rough upper bound on bytes
}

/**
 * Classify entries from a Tier 0 array by age. Hot (recent) stay in Tier 0;
 * cold (>= AGE limit) move to Tier 1.
 *
 * Entries WITHOUT a recognizable timestamp field (`ts` or `date` parsable as
 * Date) are treated as hot — defensive, NU le mut accidental fara context.
 * §B022 audit fix (REVIEW-A036-A038 M-§A036-02) — count stuck-hot entries
 * fara `ts` for telemetry; rotateOnce surfaces via Sentry breadcrumb daca > 0.
 *
 * @param {Array<{ ts?: number, date?: string }>} entries
 * @param {number} [now=Date.now()]
 * @param {number} [ageLimitMs=TIER0_AGE_LIMIT_MS]
 * @returns {{ hot: Array, cold: Array, stuckHotEntries: number }}
 */
export function classifyByAge(entries, now = Date.now(), ageLimitMs = TIER0_AGE_LIMIT_MS) {
  const hot = [];
  const cold = [];
  let stuckHotEntries = 0;
  if (!Array.isArray(entries)) return { hot, cold, stuckHotEntries };
  const cutoff = now - ageLimitMs;

  for (const entry of entries) {
    const ts = _resolveTs(entry);
    if (ts == null) {
      hot.push(entry);
      stuckHotEntries++;
    } else if (ts >= cutoff) {
      hot.push(entry);
    } else {
      cold.push(entry);
    }
  }
  return { hot, cold, stuckHotEntries };
}

/**
 * Resolve canonical timestamp (ms epoch) from an entry. Tries `entry.ts`
 * (numeric ms epoch — CDL convention) first, then `entry.date` (YYYY-MM-DD
 * via Date parser). Returns null daca neither resolves.
 *
 * @param {*} entry
 * @returns {number | null}
 */
function _resolveTs(entry) {
  if (!entry || typeof entry !== 'object') return null;
  if (typeof entry.ts === 'number' && Number.isFinite(entry.ts)) return entry.ts;
  if (typeof entry.date === 'string') {
    const parsed = Date.parse(entry.date);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

/**
 * Run one rotation pass: scan all `ROTATABLE_KEYS`, classify by age, push cold
 * entries to Tier 1, delete from Tier 0 only after Tier 1 verify.
 *
 * Idempotent — re-running with no cold entries = no-op. Failure on one key
 * does NOT abort other keys (each independent transaction).
 *
 * §B025 audit fix (REVIEW-A036-A038 M-§A036-05) — wraps body in
 * `navigator.locks.request('andura-tiering', ...)` to prevent cross-tab race
 * (Tab A read snapshot + Tab B write + Tab A overwrite = data loss). Graceful
 * degradation: if Web Locks API unavailable (legacy browser, test env),
 * runs without lock (accept low-prob race risk).
 *
 * @param {object} [opts]
 * @param {object} [opts.db=DB] - DB sink override (testing)
 * @param {Function} [opts.bulkWriter=tier1Bulk] - Tier 1 write fn
 * @param {Function} [opts.eventLogger=logMigrationEvent] - audit append fn
 * @param {{ captureException?: Function }} [opts.sentry]
 * @param {number} [opts.now=Date.now()]
 * @param {number} [opts.ageLimitMs=TIER0_AGE_LIMIT_MS]
 * @param {Array<number>} [opts.retryBackoffMs=RETRY_BACKOFF_MS] - retry delays (testing fast)
 * @param {boolean} [opts.skipLock=false] - bypass Web Locks (testing only)
 * @returns {Promise<{ rotated: number, perKey: Array, errors: Array }>}
 */
export async function rotateOnce(opts = {}) {
  // §B025 audit fix — Web Locks API cross-tab serialization. Graceful fallback
  // if unavailable (legacy browser, test env jsdom). opts.skipLock for tests
  // that intentionally exercise body without the lock wrapper.
  const skipLock = opts.skipLock === true;
  const hasLocks = !skipLock
    && typeof navigator !== 'undefined'
    && typeof navigator.locks?.request === 'function';
  if (hasLocks) {
    return navigator.locks.request('andura-tiering', { mode: 'exclusive' }, async () => {
      return _rotateOnceUnlocked(opts);
    });
  }
  return _rotateOnceUnlocked(opts);
}

async function _rotateOnceUnlocked(opts = {}) {
  const db = opts.db ?? DB;
  const bulkWriter = opts.bulkWriter ?? tier1Bulk;
  const eventLogger = opts.eventLogger ?? logMigrationEvent;
  const sentry = opts.sentry ?? { captureException: sentryCaptureException };
  const now = opts.now ?? Date.now();
  const ageLimitMs = opts.ageLimitMs ?? TIER0_AGE_LIMIT_MS;
  const retryBackoffMs = opts.retryBackoffMs ?? RETRY_BACKOFF_MS;

  const errors = [];
  const perKey = [];
  let totalRotated = 0;

  for (const [tier0Key, storeName] of Object.entries(ROTATABLE_KEYS)) {
    let entries;
    try {
      entries = db.get(tier0Key);
    } catch (err) {
      errors.push({ key: tier0Key, op: 'read', reason: _stringifyErr(err) });
      _safeSentry(sentry, err, { tags: { component: 'tieringEngine', op: 'read', key: tier0Key } });
      continue;
    }
    if (!Array.isArray(entries) || entries.length === 0) {
      perKey.push({ key: tier0Key, store: storeName, rotated: 0 });
      continue;
    }

    const { hot, cold, stuckHotEntries } = classifyByAge(entries, now, ageLimitMs);
    // §B022 audit fix — telemetry stuck-hot (no `ts`) entries breadcrumb.
    // Entries fara timestamp raman in Tier 0 in infinit (defensive HOT default).
    // Sentry warn daca count > 0 — upstream bug likely (e.g., legacy localStorage
    // pre-2026-04 schema), surface for forensic root-cause analysis.
    if (stuckHotEntries > 0) {
      _safeSentry(sentry, new Error(`stuckHotEntries in ${tier0Key}: ${stuckHotEntries}`), {
        tags: { component: 'tieringEngine', op: 'classify_stuck_hot', key: tier0Key },
        extra: { stuckHotEntries, totalEntries: entries.length },
        level: 'warning',
      });
    }
    if (cold.length === 0) {
      perKey.push({ key: tier0Key, store: storeName, rotated: 0, stuckHotEntries });
      continue;
    }

    // Tier 1 write with retry backoff
    const writeResult = await _writeWithRetry(bulkWriter, storeName, cold, sentry, retryBackoffMs);
    if (!writeResult.ok) {
      errors.push({ key: tier0Key, op: 'tier1_write', reason: writeResult.reason });
      // Retain Tier 0 — NO delete on failure. Next tick will retry.
      continue;
    }

    // Verify success → delete cold from Tier 0 (write hot back).
    try {
      db.set(tier0Key, hot);
    } catch (err) {
      errors.push({ key: tier0Key, op: 'tier0_prune', reason: _stringifyErr(err) });
      _safeSentry(sentry, err, { tags: { component: 'tieringEngine', op: 'prune', key: tier0Key } });
      continue;
    }

    totalRotated += cold.length;
    perKey.push({ key: tier0Key, store: storeName, rotated: cold.length, stuckHotEntries });

    // Audit trail (non-blocking — eat errors so audit fail doesn't break rotation)
    try {
      await eventLogger({
        kind: 'rotation',
        tier0Key,
        store: storeName,
        count: cold.length,
        ageLimitMs,
      });
    } catch { /* swallow audit fail */ }
  }

  return { rotated: totalRotated, perKey, errors };
}

/**
 * Write with retry: 3-attempt exponential backoff per ADR 020 §Risks #5.
 *
 * @param {Function} writer - bulk write fn (storeName, entries) → { written }
 * @param {string} storeName
 * @param {Array} entries
 * @param {{ captureException?: Function }} sentry
 * @param {Array<number>} [backoffMs=RETRY_BACKOFF_MS] - delay schedule between attempts
 * @returns {Promise<{ ok: boolean, reason?: string }>}
 */
async function _writeWithRetry(writer, storeName, entries, sentry, backoffMs = RETRY_BACKOFF_MS) {
  let lastErr = null;
  for (let attempt = 0; attempt <= backoffMs.length; attempt++) {
    try {
      const res = await writer(storeName, entries);
      if (res?.written === entries.length) return { ok: true };
      lastErr = new Error(`write count mismatch: expected ${entries.length}, got ${res?.written ?? 0}`);
    } catch (err) {
      lastErr = err;
    }
    if (attempt < backoffMs.length) {
      await _sleep(backoffMs[attempt]);
    }
  }
  _safeSentry(sentry, lastErr, {
    tags: { component: 'tieringEngine', op: 'tier1_write_persistent_fail', store: storeName },
    extra: { entriesCount: entries.length },
  });
  return { ok: false, reason: _stringifyErr(lastErr) };
}

function _sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Pre-write quota guard. If Tier 0 > size limit, forces a rotation before
 * proceeding. Caller can await this before any unbounded write to prevent
 * crash silent (PWA quota exhaustion).
 *
 * @param {object} [opts] - Forwarded to `rotateOnce`
 * @returns {Promise<{ rotated: number, forcedByQuota: boolean }>}
 */
export async function ensureTier0Capacity(opts = {}) {
  const bytes = estimateTier0Bytes();
  if (bytes < TIER0_SIZE_LIMIT_BYTES) {
    return { rotated: 0, forcedByQuota: false };
  }
  const result = await rotateOnce(opts);
  return { rotated: result.rotated, forcedByQuota: true };
}

/**
 * Initialize auto-backup tier rotation on app load. Registers a periodic
 * timer (default hourly) + runs an initial pass immediately so first deploy
 * post-ADR-020 catches up on any backlog.
 *
 * Idempotent — calling twice replaces the existing timer. Test cleanup via
 * `stopAutoBackup()`.
 *
 * @param {object} [opts]
 * @param {number} [opts.intervalMs=ROTATION_CHECK_INTERVAL_MS]
 * @param {boolean} [opts.runImmediately=true]
 * @param {object} [opts.rotateOpts] - Forwarded to `rotateOnce`
 * @returns {Promise<{ initial: { rotated: number } | null }>}
 */
export async function initAutoBackup(opts = {}) {
  const intervalMs = opts.intervalMs ?? ROTATION_CHECK_INTERVAL_MS;
  const runImmediately = opts.runImmediately ?? true;
  const rotateOpts = opts.rotateOpts ?? {};

  stopAutoBackup();

  let initial = null;
  if (runImmediately) {
    try {
      initial = await rotateOnce(rotateOpts);
    } catch {
      initial = null; // Non-fatal — let timer retry next tick
    }
  }

  _checkTimer = setInterval(() => {
    rotateOnce(rotateOpts).catch(() => { /* swallow — Sentry already captures */ });
  }, intervalMs);

  return { initial };
}

/**
 * Stop the periodic rotation timer. Used in test cleanup or on Auth migration
 * (when namespace changes and DB needs swap).
 */
export function stopAutoBackup() {
  if (_checkTimer) {
    clearInterval(_checkTimer);
    _checkTimer = null;
  }
}

// ── Internal helpers ────────────────────────────────────────────────────────

function _safeSentry(sentry, err, ctx) {
  if (!sentry?.captureException) return;
  try { sentry.captureException(err, ctx); }
  catch { /* swallow — never die from monitoring */ }
}

function _stringifyErr(err) {
  if (!err) return 'unknown';
  if (err instanceof Error) return err.message || err.toString();
  return String(err);
}
