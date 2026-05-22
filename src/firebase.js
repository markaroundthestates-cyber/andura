// ══ FIREBASE SYNC ═══════════════════════════════════════════
//
// §35-H4 audit note — Andura uses Firebase Realtime Database (RTDB), NOT
// Firestore. Limits: per-node max payload 256MB (RTDB) — NOT Firestore 1MB/doc.
// `users/{uid}` whole-tree PUT in syncToFirebase below stays well under
// realistic per-user volumes (~10-100KB typical SYNC_KEYS payload). Tier 2
// archive (>180d) deferred per ADR 020 + tier2Stub.js — when shipped, archive
// path WILL use Firestore (per ADR 002 REST) — at that point document size
// limit 1MB/doc applies; mitigation via sub-collection chunking per uid.
//
// §25-H3 audit fix — Idempotency keys NA for Firebase RTDB REST architecture.
// Rationale: RTDB PUT to a path is idempotent by design (last-write-wins per
// Firebase docs, the path itself is the unique resource identifier — repeating
// the same PUT does not duplicate writes, only overwrites the same node with
// the same payload). DELETE is similarly path-based + idempotent. POST (push)
// auto-generates push IDs server-side, so client retry could in theory create
// dupes — but Andura sync flow uses PUT exclusively (syncToFirebase writes
// `users/{uid}` as whole-tree update, syncFromFirebase reads only, dataCleanup
// uses DELETE). Identity Toolkit endpoints (signInWithIdp, sendOobCode) accept
// no idempotency-key header per their OpenAPI spec, and any retry produces
// the same outcome (existing token returned OR another magic link mailed —
// throttled separately by lastMagicLinkSent §4-H3). No client-side idempotency
// keys required.
//
import { DB } from './db.js';
import { toast } from './ui/ui.js';
import { COACH_RELEVANT_KEYS } from './util/dataRegistry.js';
import { getAuthState, getIdToken } from './auth.js';

// §4-H4 audit fix — env-var with hardcoded fallback (preserves single-env Pre-Beta
// while enabling staging/prod env split Phase 7+ without source change).
export const FIREBASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_RTDB_URL)
  || 'https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app';

// Legacy literal — preserved as migration source for Daniel's pre-Beta
// account ONLY. Per §AMENDMENT 2026-05-04.4 + §56.4.1, post-auth Daniel,
// `users/daniel` data migrates one-time → `users/{uid}` via existing
// 2026-05-02-auth-path-migration runner. NEVER returned by getUserPath()
// in Anonymous mode (was BUG 2 root cause — see §56.1.3 below).
export const LEGACY_USER_PATH = 'users/daniel';

// Back-compat alias preserved pentru consumers care inca refera explicit
// the legacy literal pentru migration source. Will be removed cand
// Faza 3 Anonymous sunset complete (post-Beta v1.5 per §56.9.1).
export const USER_PATH = LEGACY_USER_PATH;

/**
 * Resolve the per-user RTDB path. Per §AMENDMENT 2026-05-04.1 + §56.1.3
 * (BUG 2 root cause resolution LOCKED V1):
 *
 *   - Firebase Auth uid present → `users/<uid>`
 *   - Anonymous mode (`getAuthState() === null`) → **null**
 *
 * Anonymous mode = app ruleaza exclusiv local IndexedDB (per §56.1.2
 * Faza 1-2 fallback local-first preserved). Toate apelurile Firebase
 * API blocate cand path null → bucla 401 eliminata mecanic per
 * §36.80 BUG 2 RESOLUTION.
 *
 * Consumers (`fbGet`/`fbSet`/`fbRemove`/`syncToFirebase`/`syncFromFirebase`/
 * `clearFirebaseKeys`) deja short-circuit clean cand userPath null —
 * no-op silent, NU error toast (per §AMENDMENT 2026-05-04.1 graceful).
 *
 * @returns {string|null}
 */
export function getUserPath() {
  const auth = getAuthState();
  if (auth?.uid) return `users/${auth.uid}`;
  return null;
}

// NOTE: 'photos' is intentionally excluded — base64 images are too large for Firebase RTDB free tier.
// Photos are stored locally only. Users should be aware they are NOT backed up to the cloud.
export const SYNC_KEYS = ['weights','kcals','prots','waters','wellbeing','logs','session-burns','session-ratings','muted','notif-enabled','suppl-list','early-stops','pr-records','phase-log','closed-days','step-streaks','steps-today','bf-override','phase-override','current-kcal','phase-change-date','readiness','unavailable-equipment','sf.userConfig', // sf.userConfig — bio + targetKg + equipment prefs (per audit night 2026-04-26 + ADR sync drift finding)
  'peak-hours','session-start-hours','auto-recommendations','applied-recommendations','applied-patterns','session-draft','workout-skips','coach-decisions','coach-decisions-aggregate','coach-decisions-archive','cdl-patterns',
  'profile-history', // profile-history — onboarding Q1-Q5 + reconciliation events (per ADR 014 §6)
  'tombstones',      // tombstones — Memory Paradox hotfix (Batch B Task 2): localStorage soft-delete tracking (per ADR_MULTI_TENANT_AUTH_v1 + future T&B Faza 1+2)
];

function getDeviceId() {
  let id = localStorage.getItem('device-id');
  if (!id) { id = 'dev-' + Math.random().toString(36).slice(2,10); localStorage.setItem('device-id', id); }
  return id;
}

// ── Auth-aware URL builder ───────────────────────────────────────────────
// Appends `?auth=<idToken>` when an idToken is provided. Per Firebase docs,
// REST endpoints accept the idToken as query param for per-uid rule
// enforcement. Token is fetched proactively (auto-refresh inside getIdToken).
/** @param {string} fullPath */
async function _buildUrl(fullPath) {
  const token = await getIdToken().catch(() => null);
  const auth = token ? `?auth=${encodeURIComponent(token)}` : '';
  return `${FIREBASE_URL}/${fullPath}.json${auth}`;
}

// §25-H2 + §36-H3 audit fix — Firebase REST fetch wrap cu AbortController
// timeout. Mobile / spotty wifi / 3G partial connectivity → fetch can hang
// indefinitely (no default timeout in browser fetch API). 15s window generous
// pentru RTDB ops (typical < 1s) without blocking UI for users on flaky
// networks. Aborted request rejects fetch promise → existing try/catch in
// fbGet/fbSet/fbRemove returns graceful null/false (no error toast spam, no
// UI lock). Per §36-H3 audit verify: AbortSignal.timeout configured pe TOATE
// fetch paths through _fbFetch wrapper — no direct fetch() bypassing this.
export const FIREBASE_FETCH_TIMEOUT_MS = 15_000;

/** @param {RequestInfo|URL} url @param {RequestInit} [init] */
async function _fbFetch(url, init) {
  // AbortSignal.timeout is supported in Node 20+ + all modern browsers (per
  // baseline `node>=20` in package.json engines + PWA target browsers).
  const signal = AbortSignal.timeout(FIREBASE_FETCH_TIMEOUT_MS);
  return fetch(url, { ...(init || {}), signal });
}

// §36-H2 audit fix — Long offline duration graceful reconnect. After multi-day
// offline period, local Dexie writes accumulate → bulk sync needed on
// reconnect with timeout risk. Helper splits an array of operations into
// chunks (default 25) + sequential await with partial-fail tracking. Callers
// (future BackgroundSync handler per §36-H1 + §36-C1) use this to push
// accumulated writes incremental without single-shot timeout.
//
// Returns { ok, fail, errors } summary — caller decides retry strategy
// (typically exponential backoff per ADR 020 §Open Items 3 — 3 attempts).
export const SYNC_CHUNK_SIZE = 25;

/**
 * Bulk-sync helper: invoke `pushFn` over `items` chunked by SYNC_CHUNK_SIZE.
 * Sequential await per-chunk (NOT parallel — RTDB write contention avoided).
 * Partial fail recovery: failed items recorded în errors[], caller can retry.
 *
 * @template T
 * @param {ReadonlyArray<T>} items
 * @param {(item: T) => Promise<boolean>} pushFn
 * @param {number} [chunkSize]
 * @returns {Promise<{ ok: number, fail: number, errors: T[] }>}
 */
export async function bulkSync(items, pushFn, chunkSize = SYNC_CHUNK_SIZE) {
  let ok = 0;
  let fail = 0;
  /** @type {T[]} */
  const errors = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const results = await Promise.allSettled(chunk.map(item => pushFn(item)));
    results.forEach((r, idx) => {
      const item = chunk[idx];
      if (item === undefined) return;
      if (r.status === 'fulfilled' && r.value === true) {
        ok += 1;
      } else {
        fail += 1;
        errors.push(item);
      }
    });
  }
  return { ok, fail, errors };
}

/** @param {string} path */
async function fbGet(path) {
  try {
    const url = await _buildUrl(path);
    const r = await _fbFetch(url, { cache: 'no-store' });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

/** @param {string} path @param {unknown} data */
async function fbSet(path, data) {
  try {
    const url = await _buildUrl(path);
    const r = await _fbFetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    return r.ok;
  } catch { return false; }
}

/** @param {string} path */
async function fbRemove(path) {
  try {
    const url = await _buildUrl(path);
    const r = await _fbFetch(url, { method: 'DELETE' });
    return r.ok;
  } catch { return false; }
}

// Exposed so dataCleanup.js + auth migration runner can issue auth-aware
// raw requests without re-implementing the URL builder.
/** @param {string} fullPath */
export async function buildAuthUrl(fullPath) {
  return _buildUrl(fullPath);
}

/** @param {ReadonlyArray<string>|null|undefined} keys */
export async function clearFirebaseKeys(keys) {
  if (!keys || keys.length === 0) return;
  const userPath = getUserPath();
  if (!userPath) return;
  const results = await Promise.allSettled(
    keys.map(async (/** @type {string} */ key) => {
      const ok = await fbRemove(`${userPath}/${key}`);
      if (ok) console.log(`[Firebase] Removed key: ${key}`);
      else console.warn(`[Firebase] Failed to remove key: ${key}`);
      return ok;
    })
  );
  const succeeded = results.filter(r => r.status === 'fulfilled' && r.value).length;
  console.log(`[Firebase] clearFirebaseKeys: ${succeeded}/${keys.length} removed`);
}

export async function syncToFirebase() {
  try {
    const userPath = getUserPath();
    if (!userPath) {
      console.log('[Firebase] syncToFirebase: no auth + no fallback, skipping');
      return false;
    }
    /** @type {Record<string, unknown>} */
    const payload = {};
    SYNC_KEYS.forEach(k => {
      const v = DB.get(k);
      if (v == null) return;
      payload[k] = v;
    });
    payload['_device'] = getDeviceId();
    payload['_ts'] = Date.now();
    const ok = await fbSet(userPath, payload);
    return ok;
  } catch (e) { console.warn('Firebase sync failed:', e); return false; }
}

export async function syncFromFirebase() {
  if (window._suppressFirebaseSync) {
    console.log('[Firebase] Sync suppressed, skipping restore');
    return false;
  }
  const suppressUntil = localStorage.getItem('__suppressFirebaseSyncUntil');
  if (suppressUntil && Date.now() < Number(suppressUntil)) {
    console.log('[Firebase] Sync suppressed post-reset until', new Date(Number(suppressUntil)).toISOString());
    return false;
  }
  try {
    const userPath = getUserPath();
    if (!userPath) {
      console.log('[Firebase] syncFromFirebase: no auth + no fallback, skipping');
      return false;
    }
    const remote = await fbGet(userPath);
    if (!remote) return false;

    suppressInvalidations(() => {
      SYNC_KEYS.forEach(k => {
        if (remote[k] == null) return;
        const local = DB.get(k);
        if (local == null) { DB.set(k, remote[k]); return; }

        // Merge objects (weights, kcals, prots, etc.).
        // Strategy: union of remote + local, with local taking priority on conflicts.
        // KNOWN LIMITATION: if the same date was edited on two devices, local always wins
        // regardless of which edit was more recent. Proper last-write-wins requires
        // per-entry timestamps — deferred until multi-device use becomes a real concern.
        if (typeof remote[k] === 'object' && !Array.isArray(remote[k])) {
          DB.set(k, Object.assign({}, remote[k], local));
        } else if (Array.isArray(remote[k])) {
          // For arrays (logs), merge by timestamp uniqueness
          const localArr = Array.isArray(local) ? local : [];
          const remoteArr = remote[k];
          const tsSet = new Set(localArr.map(e => e.ts));
          const merged = [...localArr];
          remoteArr.forEach(e => { if (!tsSet.has(e.ts)) merged.push(e); });
          merged.sort((a, b) => (b.ts || 0) - (a.ts || 0));
          DB.set(k, merged.slice(0, 5000));
        } else {
          // Scalar — keep local
        }
      });
    });

    // Apply tombstone filter (Memory Paradox hotfix — Batch B Task 2).
    // Done AFTER merge so any deleted entries can't reappear from remote.
    try {
      const { applyTombstoneFilterToAll } = await import('./util/tombstones.js');
      applyTombstoneFilterToAll();
    } catch (e) {
      // Tombstones module is optional during transition — non-fatal.
      console.warn('[Firebase] tombstone filter skipped:', e instanceof Error ? e.message : e);
    }

    // Warn about unknown remote keys so schema drift is visible
    const remoteKeys = Object.keys(remote).filter(k => !k.startsWith('_'));
    const unknownKeys = remoteKeys.filter(k => !SYNC_KEYS.includes(k));
    if (unknownKeys.length) console.warn('[Firebase] unknown remote keys (schema drift?):', unknownKeys);
    return true;
  } catch (e) { console.warn('Firebase load failed:', e); return false; }
}

/** @type {ReturnType<typeof setTimeout> | null} */
let _syncTimer = null;
const _origSet = DB.set.bind(DB);

// Coalesce cache invalidations triggered by DB.set. Two mechanisms:
// 1. suppressInvalidations(fn) — batch-mode: all invalidations during fn are folded into one flush at the end.
// 2. Debounce 250ms — outside batch mode, rapid successive DB.set calls produce one invalidate per window.
// Direct calls to window._directorCache.invalidate() from other modules bypass both (intentional).
let _suppressed = false;
let _pendingInvalidation = false;
/** @type {ReturnType<typeof setTimeout> | null} */
let _invalidateTimer = null;
const INVALIDATE_DEBOUNCE_MS = 250;

export function scheduleInvalidation() {
  if (!window._directorCache) return;
  if (_suppressed) { _pendingInvalidation = true; return; }
  if (_invalidateTimer) clearTimeout(_invalidateTimer);
  _invalidateTimer = setTimeout(() => {
    _invalidateTimer = null;
    if (window._directorCache) window._directorCache.invalidate();
  }, INVALIDATE_DEBOUNCE_MS);
}

/** @param {() => any} fn */
export function suppressInvalidations(fn) {
  const wasSuppressed = _suppressed;
  _suppressed = true;
  try { return fn(); }
  finally {
    _suppressed = wasSuppressed;
    if (!_suppressed && _pendingInvalidation) {
      _pendingInvalidation = false;
      if (window._directorCache) window._directorCache.invalidate();
    }
  }
}

DB.set = function(key, val) {
  _origSet(key, val);
  if (COACH_RELEVANT_KEYS.includes(key)) {
    scheduleInvalidation();
  }
  if (SYNC_KEYS.includes(key) && !window._suppressFirebaseSync) {
    if (_syncTimer) clearTimeout(_syncTimer);
    _syncTimer = setTimeout(syncToFirebase, 3000);
  }
};

// Expose suppressInvalidations on DB for call-site convenience.
/** @type {any} */ (DB).suppressInvalidations = suppressInvalidations;

export async function initFirebaseSync() {
  const synced = await syncFromFirebase();
  if (synced) {
    // Push merged local state back so any locally-saved data that missed a previous
    // sync (e.g. app closed before the 3s debounce fired) is written to Firebase now.
    await syncToFirebase();
    toast('☁ Date sincronizate', 'var(--green)');
  }
}

window.syncToFirebase = syncToFirebase;
window.syncFromFirebase = syncFromFirebase;
