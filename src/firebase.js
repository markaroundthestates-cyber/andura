// ══ FIREBASE SYNC ═══════════════════════════════════════════
import { DB, tod } from './db.js';
import { toast } from './ui/ui.js';

const FIREBASE_URL = 'https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app';
const USER_PATH = 'users/daniel';
// NOTE: 'photos' is intentionally excluded — base64 images are too large for Firebase RTDB free tier.
// Photos are stored locally only. Users should be aware they are NOT backed up to the cloud.
const SYNC_KEYS = ['weights','kcals','prots','waters','wellbeing','logs','session-burns','session-ratings','muted','notif-enabled','suppl-list','early-stops','pr-records','phase-log','closed-days','step-streaks','steps-today','bf-override','phase-override','current-kcal','phase-change-date'];

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
  try {
    const remote = await fbGet(USER_PATH);
    if (!remote) return false;

    const today = tod();
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
        DB.set(k, merged.slice(0, 500));
      } else {
        // Scalar — keep local
      }
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
DB.set = function(key, val) {
  _origSet(key, val);
  if (SYNC_KEYS.includes(key)) {
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(syncToFirebase, 3000);
  }
};

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
