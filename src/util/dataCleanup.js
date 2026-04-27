// ══ DATA CLEANUP — Utilitare pentru resetare date de test și debugging ═══════
import { FIREBASE_URL, USER_PATH, scheduleInvalidation } from '../firebase.js';
import { USER_DATA_KEYS, TEST_RESIDUE_KEYS, PRESERVE_ON_RESET_KEYS, CDL_KEYS, getAllDynamicKeys } from './dataRegistry.js';

// Re-export for backward compat (tests and other importers)
export { USER_DATA_KEYS, TEST_RESIDUE_KEYS, PRESERVE_ON_RESET_KEYS, CDL_KEYS };

// ── Deduplicate Logs ──────────────────────────────────────────────────────
// Removes truly duplicate log entries — defined as two entries with the exact
// same timestamp. Legitimate multi-set data (same exercise, different ts) is preserved.

export function cleanDuplicateLogs() {
  let logs;
  try {
    logs = JSON.parse(localStorage.getItem('logs') || '[]');
  } catch { return; }

  const seen = new Set();
  const clean = logs.filter(l => {
    if (l.ts == null) return true;
    if (seen.has(l.ts)) return false;
    seen.add(l.ts);
    return true;
  });

  if (clean.length < logs.length) {
    localStorage.setItem('logs', JSON.stringify(clean));
  }
}

// ── Auto-Backup / Restore ──────────────────────────────────────────────────

export function createAutoBackup() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    data[k] = localStorage.getItem(k);
  }
  const backup = { timestamp: new Date().toISOString(), version: 'auto-full-reset', data };
  const json = JSON.stringify(backup, null, 2);

  // Trigger download
  try {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salafull-backup-${new Date().toISOString().slice(0,19).replace(/[T:]/g,'-')}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
  } catch (e) {
    console.warn('[DataCleanup] Download failed:', e.message);
  }

  // Save in localStorage for quick restore (best-effort — may fail on size limit)
  try {
    localStorage.setItem('last-backup', json);
  } catch (e) {
    console.warn('[DataCleanup] last-backup save failed (storage quota):', e.message);
  }

  console.log('[DataCleanup] Auto-backup created:', Object.keys(data).length, 'keys');
  return backup;
}

export function restoreFromBackup(jsonString) {
  let backup;
  try {
    backup = JSON.parse(jsonString);
  } catch (e) {
    alert('Fișierul nu este un JSON valid.');
    return false;
  }
  if (!backup || typeof backup.data !== 'object' || backup.data === null) {
    alert('Structura backup-ului este invalidă (lipsă câmp "data").');
    return false;
  }

  window._suppressFirebaseSync = true;
  localStorage.clear();
  Object.entries(backup.data).forEach(([k, v]) => {
    try { localStorage.setItem(k, v); } catch (e) { console.warn('[DataCleanup] restore key failed:', k, e.message); }
  });
  console.log('[DataCleanup] Restored', Object.keys(backup.data).length, 'keys from backup', backup.timestamp || '');
  setTimeout(() => { window.location.reload(); }, 500);
  return true;
}

export function restoreLastBackup() {
  const raw = localStorage.getItem('last-backup');
  if (!raw) {
    alert('Nu există niciun auto-backup salvat local.');
    return null;
  }
  return restoreFromBackup(raw);
}

export async function resetTestData(options = {}) {
  const { clearFirebase = true, reload = true } = options;

  console.log('[DataCleanup] Starting test residue cleanup...');

  window._suppressFirebaseSync = true;
  console.log('[DataCleanup] Firebase sync suppressed');

  TEST_RESIDUE_KEYS.forEach(k => localStorage.removeItem(k));
  console.log('[DataCleanup] Local storage cleared:', TEST_RESIDUE_KEYS.length, 'keys');

  if (clearFirebase) {
    try {
      const r = await fetch(`${FIREBASE_URL}/${USER_PATH}.json`, { cache: 'no-store' });
      if (r.ok) {
        const remote = await r.json();
        if (remote && typeof remote === 'object') {
          TEST_RESIDUE_KEYS.forEach(k => { delete remote[k]; });
          await fetch(`${FIREBASE_URL}/${USER_PATH}.json`, {
            method: 'PUT',
            body: JSON.stringify(remote),
            headers: { 'Content-Type': 'application/json' }
          });
          console.log('[DataCleanup] Firebase keys removed');
        }
      } else {
        console.log('[DataCleanup] Firebase not reachable, local-only cleanup');
      }
    } catch (err) {
      console.warn('[DataCleanup] Firebase cleanup failed:', err.message);
    }
  }

  scheduleInvalidation();
  console.log('[DataCleanup] Test residue cleared:', TEST_RESIDUE_KEYS.length, 'keys');

  // Persist suppression across reload — window property does not survive page load
  if (reload) {
    localStorage.setItem('__suppressFirebaseSyncUntil', String(Date.now() + 10000));
  }

  setTimeout(() => { window._suppressFirebaseSync = false; }, 3000);

  if (reload) {
    setTimeout(() => { location.reload(); }, 500);
  }

  return { cleared: TEST_RESIDUE_KEYS.length, firebase: clearFirebase };
}

export async function fullReset(options = {}) {
  const { clearFirebase = true, reload = true } = options;

  console.log('[DataCleanup] Starting FULL RESET...');

  // Auto-backup BEFORE any deletion
  try {
    createAutoBackup();
  } catch (err) {
    console.warn('[DataCleanup] Auto-backup failed:', err.message);
    if (!confirm('Backup a eșuat. Continui oricum cu Full Reset?')) return;
  }

  window._suppressFirebaseSync = true;
  console.log('[DataCleanup] Firebase sync suppressed');

  // Save values to preserve across the clear
  const preserved = {};
  PRESERVE_ON_RESET_KEYS.forEach(k => {
    const v = localStorage.getItem(k);
    if (v !== null) preserved[k] = v;
  });

  // Whitelist reset: clear everything, then restore preserve list
  localStorage.clear();
  Object.entries(preserved).forEach(([k, v]) => localStorage.setItem(k, v));

  // Persist suppression across the reload — window._ does not survive page load
  localStorage.setItem('__suppressFirebaseSyncUntil', String(Date.now() + 10000));

  // Clear sessionStorage
  try {
    sessionStorage.clear();
    console.log('[DataCleanup] sessionStorage cleared');
  } catch (e) {
    console.warn('[DataCleanup] sessionStorage clear failed:', e.message);
  }

  console.log('[DataCleanup] All local storage cleared');

  if (clearFirebase) {
    try {
      await fetch(`${FIREBASE_URL}/${USER_PATH}.json`, {
        method: 'PUT',
        body: JSON.stringify(null),
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('[DataCleanup] Firebase data cleared');
    } catch (err) {
      console.warn('[DataCleanup] Firebase full reset failed:', err.message);
    }
  }

  // Unregister service workers
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(r => r.unregister()));
      console.log('[DataCleanup] Service workers unregistered:', registrations.length);
    }
  } catch (e) {
    console.warn('[DataCleanup] SW unregister failed:', e.message);
  }

  // Clear all caches (Cache API)
  try {
    if ('caches' in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map(k => caches.delete(k)));
      console.log('[DataCleanup] Cache API cleared:', cacheKeys.length, 'caches');
    }
  } catch (e) {
    console.warn('[DataCleanup] Cache clear failed:', e.message);
  }

  // Clear IndexedDB databases
  try {
    if (indexedDB && typeof indexedDB.databases === 'function') {
      const dbs = await indexedDB.databases();
      await Promise.all(dbs.map(db => new Promise((res) => {
        const req = indexedDB.deleteDatabase(db.name);
        req.onsuccess = res;
        req.onerror = res;
        req.onblocked = res;
      })));
      console.log('[DataCleanup] IndexedDB cleared:', dbs.length, 'databases');
    }
  } catch (e) {
    console.warn('[DataCleanup] IndexedDB clear failed:', e.message);
  }

  scheduleInvalidation();
  console.log('[DataCleanup] FULL RESET — all data cleared');

  if (reload) {
    const base = window.location.href.split('?')[0];
    setTimeout(() => {
      window.location.href = base + '?nocache=' + Date.now();
    }, 500);
  }

  return { cleared: 'all', firebase: clearFirebase };
}

export async function resetButKeepRealLogs(options = { reload: true }) {
  console.log('[DataCleanup] Soft reset — keeping real workout logs and daily tracking');
  window._suppressFirebaseSync = true;

  const KEEP_KEYS = [
    'logs', 'weights', 'kcals', 'prots', 'waters', 'pr-records',
    'phase-log', 'phase-change-date', 'bf-override', 'readiness',
    'session-burns', 'closed-days', 'wellbeing', 'suppl-list',
    'active-theme', 'device-id', 'notif-enabled', 'muted', 'workout-skips',
    'current-kcal', 'phase-override', 'onboarding-done'
  ];

  const preserved = {};
  KEEP_KEYS.forEach(k => {
    const v = localStorage.getItem(k);
    if (v !== null) preserved[k] = v;
  });

  localStorage.clear();
  try { sessionStorage.clear(); } catch (e) { /* ignore */ }

  Object.entries(preserved).forEach(([k, v]) => localStorage.setItem(k, v));

  try {
    const fbModule = await import('../firebase.js').catch(() => null);
    if (fbModule && fbModule.removeKey) {
      await Promise.all(TEST_RESIDUE_KEYS.map(k => fbModule.removeKey(k).catch(() => {})));
    }
  } catch (err) {
    console.warn('[DataCleanup] Firebase residue clear:', err.message);
  }

  scheduleInvalidation();

  if (options.reload) {
    localStorage.setItem('__suppressFirebaseSyncUntil', String(Date.now() + 10000));
    setTimeout(() => { window._suppressFirebaseSync = false; }, 3000);
    setTimeout(() => window.location.reload(), 500);
  } else {
    setTimeout(() => { window._suppressFirebaseSync = false; }, 3000);
  }

  return { preserved: Object.keys(preserved).length, cleared: TEST_RESIDUE_KEYS.length };
}

export function inspectStorage() {
  const report = { userData: {}, testResidue: {}, unknown: {} };

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    const size = value ? value.length : 0;

    if (USER_DATA_KEYS.includes(key)) {
      report.userData[key] = size + ' bytes';
    } else if (TEST_RESIDUE_KEYS.includes(key)) {
      report.testResidue[key] = size + ' bytes';
    } else {
      report.unknown[key] = size + ' bytes';
    }
  }

  console.table(report.userData);
  console.table(report.testResidue);
  console.table(report.unknown);
  return report;
}

// ── Restore real training logs (Apr 21–22, 2026) ─────────────────────────
// Folosit pentru a reinjecta antrenamentele reale după un full reset accidental.
// Datele sunt hardcodate ca sursă de adevăr verificată manual.

export function restoreRealLogs({ merge = true } = {}) {
  const PULL_SESSION_TS = new Date('2026-04-21T10:00:00').getTime();
  const PUSH_SESSION_TS = new Date('2026-04-22T10:00:00').getTime();

  const REAL_LOGS = [
    // Apr 21 — PULL day
    { ex: 'Lat Pulldown',   w: 64,  reps: 8,  rpe: 7, ts: PULL_SESSION_TS + 1000,  session: PULL_SESSION_TS, date: '2026-04-21', baseline: false },
    { ex: 'Lat Pulldown',   w: 64,  reps: 8,  rpe: 7, ts: PULL_SESSION_TS + 2000,  session: PULL_SESSION_TS, date: '2026-04-21', baseline: false },
    { ex: 'Lat Pulldown',   w: 64,  reps: 8,  rpe: 8, ts: PULL_SESSION_TS + 3000,  session: PULL_SESSION_TS, date: '2026-04-21', baseline: false },
    { ex: 'Cable Row',      w: 72,  reps: 8,  rpe: 7, ts: PULL_SESSION_TS + 4000,  session: PULL_SESSION_TS, date: '2026-04-21', baseline: false },
    { ex: 'Cable Row',      w: 72,  reps: 8,  rpe: 7, ts: PULL_SESSION_TS + 5000,  session: PULL_SESSION_TS, date: '2026-04-21', baseline: false },
    { ex: 'Cable Row',      w: 72,  reps: 7,  rpe: 8, ts: PULL_SESSION_TS + 6000,  session: PULL_SESSION_TS, date: '2026-04-21', baseline: false },
    { ex: 'Face Pulls',     w: 17,  reps: 15, rpe: 6, ts: PULL_SESSION_TS + 7000,  session: PULL_SESSION_TS, date: '2026-04-21', baseline: false },
    { ex: 'Face Pulls',     w: 17,  reps: 15, rpe: 6, ts: PULL_SESSION_TS + 8000,  session: PULL_SESSION_TS, date: '2026-04-21', baseline: false },
    { ex: 'Bayesian Curl',  w: 10,  reps: 12, rpe: 7, ts: PULL_SESSION_TS + 9000,  session: PULL_SESSION_TS, date: '2026-04-21', baseline: false },
    { ex: 'Bayesian Curl',  w: 10,  reps: 12, rpe: 7, ts: PULL_SESSION_TS + 10000, session: PULL_SESSION_TS, date: '2026-04-21', baseline: false },
    { ex: 'Incline DB Curl',w: 10,  reps: 12, rpe: 7, ts: PULL_SESSION_TS + 11000, session: PULL_SESSION_TS, date: '2026-04-21', baseline: false },
    { ex: 'Incline DB Curl',w: 10,  reps: 10, rpe: 8, ts: PULL_SESSION_TS + 12000, session: PULL_SESSION_TS, date: '2026-04-21', baseline: false },

    // Apr 22 — PUSH day
    { ex: 'Incline DB Press',   w: 32, reps: 10, rpe: 7, ts: PUSH_SESSION_TS + 1000,  session: PUSH_SESSION_TS, date: '2026-04-22', baseline: false },
    { ex: 'Incline DB Press',   w: 32, reps: 10, rpe: 7, ts: PUSH_SESSION_TS + 2000,  session: PUSH_SESSION_TS, date: '2026-04-22', baseline: false },
    { ex: 'Incline DB Press',   w: 32, reps: 9,  rpe: 8, ts: PUSH_SESSION_TS + 3000,  session: PUSH_SESSION_TS, date: '2026-04-22', baseline: false },
    { ex: 'Pec Deck / Cable Fly', w: 55, reps: 12, rpe: 7, ts: PUSH_SESSION_TS + 4000,  session: PUSH_SESSION_TS, date: '2026-04-22', baseline: false },
    { ex: 'Pec Deck / Cable Fly', w: 55, reps: 12, rpe: 7, ts: PUSH_SESSION_TS + 5000,  session: PUSH_SESSION_TS, date: '2026-04-22', baseline: false },
    { ex: 'Pec Deck / Cable Fly', w: 57, reps: 10, rpe: 8, ts: PUSH_SESSION_TS + 6000,  session: PUSH_SESSION_TS, date: '2026-04-22', baseline: false },
    { ex: 'DB Shoulder Press',  w: 20, reps: 12, rpe: 7, ts: PUSH_SESSION_TS + 7000,  session: PUSH_SESSION_TS, date: '2026-04-22', baseline: false },
    { ex: 'DB Shoulder Press',  w: 20, reps: 12, rpe: 7, ts: PUSH_SESSION_TS + 8000,  session: PUSH_SESSION_TS, date: '2026-04-22', baseline: false },
    { ex: 'DB Shoulder Press',  w: 20, reps: 10, rpe: 8, ts: PUSH_SESSION_TS + 9000,  session: PUSH_SESSION_TS, date: '2026-04-22', baseline: false },
    { ex: 'Lateral Raises',     w: 10, reps: 15, rpe: 7, ts: PUSH_SESSION_TS + 10000, session: PUSH_SESSION_TS, date: '2026-04-22', baseline: false },
    { ex: 'Lateral Raises',     w: 10, reps: 15, rpe: 7, ts: PUSH_SESSION_TS + 11000, session: PUSH_SESSION_TS, date: '2026-04-22', baseline: false },
    { ex: 'Pushdown',           w: 25, reps: 12, rpe: 7, ts: PUSH_SESSION_TS + 12000, session: PUSH_SESSION_TS, date: '2026-04-22', baseline: false },
    { ex: 'Pushdown',           w: 25, reps: 12, rpe: 7, ts: PUSH_SESSION_TS + 13000, session: PUSH_SESSION_TS, date: '2026-04-22', baseline: false },
    { ex: 'Overhead Triceps',   w: 20, reps: 12, rpe: 7, ts: PUSH_SESSION_TS + 14000, session: PUSH_SESSION_TS, date: '2026-04-22', baseline: false },
    { ex: 'Overhead Triceps',   w: 20, reps: 10, rpe: 8, ts: PUSH_SESSION_TS + 15000, session: PUSH_SESSION_TS, date: '2026-04-22', baseline: false },
  ];

  try {
    const existing = JSON.parse(localStorage.getItem('logs') ?? '[]');
    let finalLogs;

    if (merge) {
      const existingTs = new Set(existing.map(l => l.ts));
      const newEntries = REAL_LOGS.filter(l => !existingTs.has(l.ts));
      finalLogs = [...existing, ...newEntries].sort((a, b) => (b.ts || 0) - (a.ts || 0));
    } else {
      finalLogs = [...REAL_LOGS].sort((a, b) => (b.ts || 0) - (a.ts || 0));
    }

    localStorage.setItem('logs', JSON.stringify(finalLogs));

    scheduleInvalidation();

    console.log(`[DataCleanup] restoreRealLogs: ${REAL_LOGS.length} entries restored (merge=${merge}). Total logs: ${finalLogs.length}`);
    return { restored: REAL_LOGS.length, total: finalLogs.length, merge };
  } catch (e) {
    console.error('[DataCleanup] restoreRealLogs failed:', e.message);
    return { restored: 0, error: e.message };
  }
}

if (typeof window !== 'undefined') {
  window.resetTestData = resetTestData;
  window.fullReset = fullReset;
  window.inspectStorage = inspectStorage;
  window.resetButKeepRealLogs = resetButKeepRealLogs;
  window.createAutoBackup = createAutoBackup;
  window.restoreFromBackup = restoreFromBackup;
  window.restoreLastBackup = restoreLastBackup;
  window.restoreRealLogs = restoreRealLogs;
}
