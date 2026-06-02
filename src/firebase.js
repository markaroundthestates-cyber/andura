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
import { kv } from './storage/kv';
import { toast } from './ui/toast.js';
import { logger } from './util/logger.js';
import { COACH_RELEVANT_KEYS } from './util/dataRegistry.js';
import { getAuthState, getIdToken } from './auth.js';

// §4-H4 audit fix — env-var (build-time inject via deploy.yml secret
// VITE_FIREBASE_RTDB_URL). The prior hardcoded PROD RTDB fallback was REMOVED:
// any build WITHOUT the env var (dev/preview/local) silently hit PRODUCTION user
// data — zero dev/prod separation, prod-pollution risk. The deploy workflow
// already injects this secret at build time (.github/workflows/deploy.yml), so
// requiring it does not break the live deploy; misconfigured builds now fail
// LOUD instead of silently reading/writing prod.
export const FIREBASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_RTDB_URL) || '';

// §B011-style audit fix — startup assert: fail fast if VITE_FIREBASE_RTDB_URL is
// missing. Mirrors the FIREBASE_API_KEY placeholder guard in auth.js (D040
// lesson: silent fallback masked broken Magic Link for weeks; here a silent PROD
// fallback masked the dev/prod data-separation gap). PROD build missing the var
// throws at boot (deploy must inject the secret); DEV build warns loud so local
// dev knows to set VITE_FIREBASE_RTDB_URL in .env.local before any Firebase op.
if (!FIREBASE_URL) {
  const isProd = typeof import.meta !== 'undefined' && import.meta.env?.PROD === true;
  const msg = '[firebase] VITE_FIREBASE_RTDB_URL is not set — Firebase sync disabled. Set the VITE_FIREBASE_RTDB_URL build env var (deploy.yml secret) or add it to .env.local for local dev. The hardcoded PROD fallback was removed to prevent dev/preview builds silently hitting production data.';
  if (isProd) {
    throw new Error(msg);
  }
  if (typeof console !== 'undefined') console.warn(msg);
}

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

// §25-M2 audit fix — forward-compat schema version stamped on the user-doc
// whole-tree write (syncToFirebase). Read side (syncFromFirebase) treats an
// absent `_schemaVersion` as v1 (legacy docs predate this field). Additive
// only — no migration logic yet; bump + add a transform here when a future
// breaking RTDB shape change ships.
export const USER_DOC_SCHEMA_VERSION = 1;

// NOTE: 'photos' is intentionally excluded — base64 images are too large for Firebase RTDB free tier.
// Photos are stored locally only. Users should be aware they are NOT backed up to the cloud.
export const SYNC_KEYS = ['weights','kcals','prots','waters','wellbeing','logs','session-burns','session-ratings','muted','notif-enabled','suppl-list','early-stops','pr-records','phase-log','closed-days','step-streaks','steps-today','bf-override','phase-override','current-kcal','phase-change-date','readiness','unavailable-equipment','sf.userConfig', // sf.userConfig — bio + targetKg + equipment prefs (per audit night 2026-04-26 + ADR sync drift finding)
  'peak-hours','session-start-hours','auto-recommendations','applied-recommendations','applied-patterns','session-draft','workout-skips','coach-decisions','coach-decisions-aggregate','coach-decisions-archive','cdl-patterns',
  'profile-history', // profile-history — onboarding Q1-Q5 + reconciliation events (per ADR 014 §6)
  'tombstones',      // tombstones — Memory Paradox hotfix (Batch B Task 2): localStorage soft-delete tracking (per ADR_MULTI_TENANT_AUTH_v1 + future T&B Faza 1+2)
];

// RTDB key sanitizer — Firebase Realtime Database forbids `. $ # [ ] /` in node
// keys (any path/PATCH-body key containing one returns 400 Bad Request). The
// localStorage key `sf.userConfig` carries a dot, so EVERY remote op on it
// (PATCH write, GET read, DELETE) 400'd — its bio/targetKg/equipment config
// never synced to the cloud and the reset DELETE threw the visible console
// error. Map the localStorage key → a valid REMOTE node name CONSISTENTLY at
// every push/pull/delete site so it round-trips. The localStorage key itself is
// unchanged (only the cloud node name is sanitized). No migration needed: the
// dotted node never wrote successfully, so there is no prior remote data.
/** @param {string} localKey @returns {string} */
export function fbKey(localKey) {
  return localKey.replace(/[.$#[\]/]/g, '_');
}

function getDeviceId() {
  let id = kv.getItem('device-id');
  if (!id) { id = 'dev-' + Math.random().toString(36).slice(2,10); kv.setItem('device-id', id); }
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

// FCM-sync audit fix — RTDB REST PATCH (multi-path update). Unlike PUT (which
// REPLACES the whole node, deleting any child not in the payload), PATCH updates
// ONLY the provided child keys and leaves sibling subtrees intact. Used by
// syncToFirebase so the user-tree sync no longer clobbers the FCM nodes
// (`fcmTokens` + `notificationPrefs`) written as siblings by pushNotifications.ts
// + notificationPrefsSync.ts. Per Firebase RTDB REST docs, PATCH on a path merges
// the JSON body at that location (shallow, key-by-key) without touching unlisted
// children. Mirror fbSet error contract (graceful false on any failure).
/** @param {string} path @param {Record<string, unknown>} data */
async function fbPatch(path, data) {
  try {
    const url = await _buildUrl(path);
    const r = await _fbFetch(url, {
      method: 'PATCH',
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

// ── wv2 store-sync helpers (08.050/051) ──────────────────────────────────────
// The Zustand wv2-* stores (weight/session history, onboarding profile, goals,
// nutrition) live ONLY in localStorage — they never reached RTDB, so a logged-in
// user lost everything on reinstall / cache-clear / new device. These two thin
// wrappers expose the existing auth-aware GET/PATCH primitives so storeSync.ts
// can push + restore those stores WITHOUT touching the flat SYNC_KEYS path above
// (Tier-0 contract is unchanged). PATCH (not PUT) so each store writes only its
// own child node under `users/{uid}/wv2/<store>` and never clobbers siblings
// (SYNC_KEYS, fcmTokens, notificationPrefs). Both honor the suppress flag +
// graceful null/false return contract (no throw, no toast spam).
/** @param {string} relPath child path under `users/{uid}` (e.g. 'wv2/workout') */
export async function fbGetUserChild(relPath) {
  const userPath = getUserPath();
  if (!userPath) return null;
  return fbGet(`${userPath}/${relPath}`);
}

/** @param {string} relPath @param {Record<string, unknown>} data */
export async function fbPatchUserChild(relPath, data) {
  if (window._suppressFirebaseSync) return false;
  const userPath = getUserPath();
  if (!userPath) return false;
  return fbPatch(`${userPath}/${relPath}`, data);
}

/**
 * @param {ReadonlyArray<string>|null|undefined} keys
 * @returns {Promise<{ succeeded: number, total: number }>} per-key DELETE outcome
 *   so the caller can detect a PARTIAL failure (succeeded < total) instead of a
 *   swallowed `fbRemove` false → silent cloud resurrection. No-op paths report a
 *   fully-succeeded zero-key result.
 */
export async function clearFirebaseKeys(keys) {
  if (!keys || keys.length === 0) return { succeeded: 0, total: 0 };
  const userPath = getUserPath();
  if (!userPath) return { succeeded: 0, total: 0 };
  const results = await Promise.allSettled(
    keys.map(async (/** @type {string} */ key) => {
      // Sanitize per segment so the remote node name matches the push/pull side
      // (e.g. `sf.userConfig` → `sf_userConfig`, fixing the reset DELETE 400)
      // while preserving legitimate `/` separators in wv2 child paths
      // (`wv2/workout` stays a real subtree path, never collapsed to `wv2_workout`).
      const remoteKey = key.split('/').map(fbKey).join('/');
      const ok = await fbRemove(`${userPath}/${remoteKey}`);
      if (ok) logger.debug(`[Firebase] Removed key: ${key}`);
      else logger.warn(`[Firebase] Failed to remove key: ${key}`);
      return ok;
    })
  );
  const succeeded = results.filter(r => r.status === 'fulfilled' && r.value).length;
  logger.debug(`[Firebase] clearFirebaseKeys: ${succeeded}/${keys.length} removed`);
  return { succeeded, total: keys.length };
}

export async function syncToFirebase() {
  // C3-S-01 audit fix (REAUDIT3 LOW) — gate the push on the suppress flag, mirroring
  // syncFromFirebase below. The DB.set override (firebase.js:359) only blocks
  // scheduling NEW timers when suppressed; an _syncTimer already armed before the
  // flag was set still fires its callback. On the SPA delete path (no page reload to
  // nuke the timer) that armed push could re-PUT users/{uid} during the awaited cloud
  // wipe window — the exact resurrection RE-S-01 closed. Early-return here neutralizes
  // any in-flight armed push (delete path + fullReset defense-in-depth) without
  // touching normal sync behavior (flag falsy in normal operation).
  if (window._suppressFirebaseSync) {
    logger.debug('[Firebase] Sync suppressed, skipping push');
    return false;
  }
  try {
    const userPath = getUserPath();
    if (!userPath) {
      logger.debug('[Firebase] syncToFirebase: no auth + no fallback, skipping');
      return false;
    }
    /** @type {Record<string, unknown>} */
    const payload = {};
    SYNC_KEYS.forEach(k => {
      const v = DB.get(k);
      if (v == null) return;
      // Remote node name must be a valid RTDB key (sanitize forbidden chars,
      // e.g. the dot in `sf.userConfig`). localStorage key `k` stays as-is.
      payload[fbKey(k)] = v;
    });
    payload['_device'] = getDeviceId();
    payload['_ts'] = Date.now();
    payload['_schemaVersion'] = USER_DOC_SCHEMA_VERSION;
    // FCM-sync audit fix — PATCH (not whole-tree PUT) so this sync updates only
    // the SYNC_KEYS paths + metadata, leaving sibling nodes (fcmTokens,
    // notificationPrefs — written by pushNotifications.ts / notificationPrefsSync.ts)
    // intact. A PUT here carried only SYNC_KEYS and DELETED those siblings on the
    // next ordinary log, killing push delivery; PATCH preserves them.
    const ok = await fbPatch(userPath, payload);
    return ok;
  } catch (e) { logger.warn('Firebase sync failed:', e); return false; }
}

export async function syncFromFirebase() {
  if (window._suppressFirebaseSync) {
    logger.debug('[Firebase] Sync suppressed, skipping restore');
    return false;
  }
  const suppressUntil = kv.getItem('__suppressFirebaseSyncUntil');
  if (suppressUntil && Date.now() < Number(suppressUntil)) {
    logger.debug('[Firebase] Sync suppressed post-reset until', new Date(Number(suppressUntil)).toISOString());
    return false;
  }
  try {
    const userPath = getUserPath();
    if (!userPath) {
      logger.debug('[Firebase] syncFromFirebase: no auth + no fallback, skipping');
      return false;
    }
    const remote = await fbGet(userPath);
    if (!remote) return false;

    // Defensive: a well-formed user-doc is a plain object keyed by SYNC_KEYS +
    // metadata. A corrupted/hostile remote scalar or array must NOT reach the
    // merge below (Object.keys / remote[k] on a string would silently poison
    // local state). Reject non-plain-object payloads and bail out cleanly.
    if (typeof remote !== 'object' || Array.isArray(remote)) {
      logger.warn('[Firebase] malformed remote doc (not a plain object) — skipping restore:', typeof remote);
      return false;
    }

    // §25-M2 — tolerant schema-version read: absent → treat as v1 (legacy doc
    // predating the field). Newer-than-client = forward-compat warn only (we
    // still merge known SYNC_KEYS; unknown keys handled by drift warn below).
    const remoteSchema = typeof remote['_schemaVersion'] === 'number' ? remote['_schemaVersion'] : 1;
    if (remoteSchema > USER_DOC_SCHEMA_VERSION) {
      logger.warn(`[Firebase] remote doc schema v${remoteSchema} newer than client v${USER_DOC_SCHEMA_VERSION} — merging known keys only`);
    }

    suppressInvalidations(() => {
      SYNC_KEYS.forEach(k => {
        // Read from the sanitized remote node name (matches the push side), but
        // keep writing to the original localStorage key `k`.
        const rk = fbKey(k);
        if (remote[rk] == null) return;
        const local = DB.get(k);
        if (local == null) { DB.set(k, remote[rk]); return; }

        // Merge objects (weights, kcals, prots, etc.).
        // Strategy: union of remote + local, with local taking priority on conflicts.
        // KNOWN LIMITATION: if the same date was edited on two devices, local always wins
        // regardless of which edit was more recent. Proper last-write-wins requires
        // per-entry timestamps — deferred until multi-device use becomes a real concern.
        if (typeof remote[rk] === 'object' && !Array.isArray(remote[rk])) {
          DB.set(k, Object.assign({}, remote[rk], local));
        } else if (Array.isArray(remote[rk])) {
          // For arrays (logs), merge by timestamp uniqueness
          const localArr = Array.isArray(local) ? local : [];
          const remoteArr = remote[rk];
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
      logger.warn('[Firebase] tombstone filter skipped:', e instanceof Error ? e.message : e);
    }

    // Warn about unknown remote keys so schema drift is visible
    const remoteKeys = Object.keys(remote).filter(k => !k.startsWith('_'));
    // Compare against sanitized SYNC_KEYS — remote node names use fbKey() (e.g.
    // `sf_userConfig`), so a raw SYNC_KEYS membership check would mis-flag them.
    const syncRemoteKeys = SYNC_KEYS.map(fbKey);
    const unknownKeys = remoteKeys.filter(k => !syncRemoteKeys.includes(k));
    if (unknownKeys.length) logger.warn('[Firebase] unknown remote keys (schema drift?):', unknownKeys);
    return true;
  } catch (e) { logger.warn('Firebase load failed:', e); return false; }
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
