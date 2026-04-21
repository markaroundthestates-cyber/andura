// ══ FIREBASE SYNC ═══════════════════════════════════════════
import { DB, tod } from './db.js';
import { toast } from './ui/ui.js';

const FIREBASE_URL = 'https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app';
const USER_PATH = 'users/daniel';
const SYNC_KEYS = ['weights','kcals','prots','waters','wellbeing','logs','session-burns','session-ratings','muted','notif-enabled','suppl-list'];

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
    SYNC_KEYS.forEach(k => { const v = DB.get(k); if (v != null) payload[k] = v; });
    payload['_device'] = getDeviceId();
    payload['_ts'] = Date.now();
    const ok = await fbSet(USER_PATH, payload);
    if (ok) console.log('✓ Synced to Firebase');
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

      // Merge objects (weights, kcals, prots, etc.) — remote is baseline, local wins for all keys it has
      if (typeof remote[k] === 'object' && !Array.isArray(remote[k])) {
        // Union: start from remote, overwrite with all local entries (local is always most recent)
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

    // Debug: print what came down from Firebase so key mismatches are visible in console
    const remoteKeys = Object.keys(remote).filter(k => !k.startsWith('_'));
    const unknownKeys = remoteKeys.filter(k => !SYNC_KEYS.includes(k));
    console.log('[Firebase] remote keys:', remoteKeys);
    console.log('[Firebase] local sync keys:', SYNC_KEYS);
    if (unknownKeys.length) console.warn('[Firebase] unknown remote keys (v11 leftovers?):', unknownKeys);
    SYNC_KEYS.forEach(k => {
      const rv = remote[k];
      if (rv == null) { console.log(`[Firebase]   ${k}: missing in remote`); return; }
      if (Array.isArray(rv)) console.log(`[Firebase]   ${k}: array(${rv.length})`);
      else if (typeof rv === 'object') console.log(`[Firebase]   ${k}: object(${Object.keys(rv).length} entries)`);
      else console.log(`[Firebase]   ${k}: ${rv}`);
    });
    console.log('✓ Data loaded from Firebase');
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
    console.log('✓ Firebase sync complete');
    toast('☁ Date sincronizate', 'var(--green)');
  }
}

window.syncToFirebase = syncToFirebase;
window.syncFromFirebase = syncFromFirebase;
