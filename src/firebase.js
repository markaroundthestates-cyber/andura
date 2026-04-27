// ══ FIREBASE SYNC ═══════════════════════════════════════════
import { DB, tod } from './db.js';
import { toast } from './ui/ui.js';
import { COACH_RELEVANT_KEYS } from './util/dataRegistry.js';

export const FIREBASE_URL = 'https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app';
export const USER_PATH = 'users/daniel';
// NOTE: 'photos' is intentionally excluded — base64 images are too large for Firebase RTDB free tier.
// Photos are stored locally only. Users should be aware they are NOT backed up to the cloud.
const SYNC_KEYS = ['weights','kcals','prots','waters','wellbeing','logs','session-burns','session-ratings','muted','notif-enabled','suppl-list','early-stops','pr-records','phase-log','closed-days','step-streaks','steps-today','bf-override','phase-override','current-kcal','phase-change-date','readiness','unavailable-equipment','sf.userConfig', // sf.userConfig — bio + targetKg + equipment prefs (per audit night 2026-04-26 + ADR sync drift finding)
  'peak-hours','session-start-hours','auto-recommendations','applied-recommendations','applied-patterns','session-draft','workout-skips','coach-decisions','coach-decisions-aggregate','coach-decisions-archive','cdl-patterns'];

function getDeviceId() {
  let id = localStorage.getItem('device-id');
  if (!id) { id = 'dev-' + Math.random().toString(36).slice(2,10); localStorage.setItem('device-id', id); }
  return id;
}

async function fbGet(path) {
  try {
    const r = await fetch(`${FIREBASE_URL}/${path}.json`, { cache: 'no-store' });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

async function fbSet(path, data) {
  try {
    const r = await fetch(`${FIREBASE_URL}/${path}.json`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    return r.ok;
  } catch { return false; }
}

async function fbRemove(path) {
  try {
    const r = await fetch(`${FIREBASE_URL}/${path}.json`, { method: 'DELETE' });
    return r.ok;
  } catch { return false; }
}

export async function clearFirebaseKeys(keys) {
  if (!keys || keys.length === 0) return;
  const results = await Promise.allSettled(
    keys.map(async key => {
      const ok = await fbRemove(`${USER_PATH}/${key}`);
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
    const payload = {};
    SYNC_KEYS.forEach(k => {
      const v = DB.get(k);
      if (v == null) return;
      payload[k] = v;
    });
    payload['_device'] = getDeviceId();
    payload['_ts'] = Date.now();
    const ok = await fbSet(USER_PATH, payload);
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
    const remote = await fbGet(USER_PATH);
    if (!remote) return false;

    const today = tod();
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

    // Warn about unknown remote keys so schema drift is visible
    const remoteKeys = Object.keys(remote).filter(k => !k.startsWith('_'));
    const unknownKeys = remoteKeys.filter(k => !SYNC_KEYS.includes(k));
    if (unknownKeys.length) console.warn('[Firebase] unknown remote keys (schema drift?):', unknownKeys);
    return true;
  } catch (e) { console.warn('Firebase load failed:', e); return false; }
}

let _syncTimer = null;
const _origSet = DB.set.bind(DB);

// Coalesce cache invalidations triggered by DB.set. Two mechanisms:
// 1. suppressInvalidations(fn) — batch-mode: all invalidations during fn are folded into one flush at the end.
// 2. Debounce 250ms — outside batch mode, rapid successive DB.set calls produce one invalidate per window.
// Direct calls to window._directorCache.invalidate() from other modules bypass both (intentional).
let _suppressed = false;
let _pendingInvalidation = false;
let _invalidateTimer = null;
const INVALIDATE_DEBOUNCE_MS = 250;

export function scheduleInvalidation() {
  if (!window._directorCache) return;
  if (_suppressed) { _pendingInvalidation = true; return; }
  clearTimeout(_invalidateTimer);
  _invalidateTimer = setTimeout(() => {
    _invalidateTimer = null;
    if (window._directorCache) window._directorCache.invalidate();
  }, INVALIDATE_DEBOUNCE_MS);
}

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
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(syncToFirebase, 3000);
  }
};

// Expose suppressInvalidations on DB for call-site convenience.
DB.suppressInvalidations = suppressInvalidations;

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
