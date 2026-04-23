// ══ DATA CLEANUP — Utilitare pentru resetare date de test și debugging ═══════

export const TEST_RESIDUE_KEYS = [
  'auto-recommendations',
  'applied-patterns',
  'applied-recommendations',
  'early-stops',
  'session-draft',
  'peak-hours',
  'step-streaks',
  'session-start-hours',
  'session-ratings',
  'dev-mode',
  'unavailable-equipment'
];

export const USER_DATA_KEYS = [
  'weights',
  'kcals',
  'prots',
  'logs',
  'readiness',
  'phase-override',
  'phase-log',
  'phase-change-date',
  'bf-override',
  'pr-records',
  'current-kcal',
  'suppl-list',
  'active-theme',
  'waters',
  'workout-skips',
  'device-id',
  'session-burns',
  'wellbeing',
  'notif-enabled',
  'closed-days',
  'muted',
  'onboarding-done',
  'onboarding-completed'
];

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

  // Marker to suppress Firebase sync for 3 seconds
  window._suppressFirebaseSync = true;
  console.log('[DataCleanup] Firebase sync suppressed');

  // Delete from localStorage
  TEST_RESIDUE_KEYS.forEach(k => localStorage.removeItem(k));
  console.log('[DataCleanup] Local storage cleared:', TEST_RESIDUE_KEYS.length, 'keys');

  // Delete from Firebase if available
  if (clearFirebase) {
    try {
      const FIREBASE_URL = 'https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app';
      const USER_PATH = 'users/daniel';
      // Fetch current remote data, remove test keys, then PUT back
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

  // Invalidate CoachDirector cache
  if (window._directorCache) {
    window._directorCache.invalidate();
  } else if (window._cachedDirectorSession !== undefined) {
    window._cachedDirectorSession = null;
    console.log('[DataCleanup] Director cache invalidated (legacy)');
  }

  console.log('[DataCleanup] Test residue cleared:', TEST_RESIDUE_KEYS.length, 'keys');

  // Re-enable Firebase sync after 3 seconds
  setTimeout(() => {
    window._suppressFirebaseSync = false;
    console.log('[DataCleanup] Firebase sync re-enabled');
  }, 3000);

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

  // Suppress Firebase sync during reset
  window._suppressFirebaseSync = true;
  console.log('[DataCleanup] Firebase sync suppressed');

  const ALL_KEYS = [...TEST_RESIDUE_KEYS, ...USER_DATA_KEYS, 'onboarding-done', 'onboarding-completed'];
  ALL_KEYS.forEach(k => localStorage.removeItem(k));

  // Clear sessionStorage
  try {
    sessionStorage.clear();
    console.log('[DataCleanup] sessionStorage cleared');
  } catch (e) {
    console.warn('[DataCleanup] sessionStorage clear failed:', e.message);
  }

  console.log('[DataCleanup] All local storage cleared');

  // Delete from Firebase if available
  if (clearFirebase) {
    try {
      const FIREBASE_URL = 'https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app';
      const USER_PATH = 'users/daniel';
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

  // Invalidate CoachDirector cache
  if (window._directorCache) {
    window._directorCache.invalidate();
  } else if (window._cachedDirectorSession !== undefined) {
    window._cachedDirectorSession = null;
  }

  console.log('[DataCleanup] FULL RESET — all data cleared');

  // Re-enable Firebase sync after 3 seconds
  setTimeout(() => {
    window._suppressFirebaseSync = false;
    console.log('[DataCleanup] Firebase sync re-enabled');
  }, 3000);

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

  // Salvează temporar
  const preserved = {};
  KEEP_KEYS.forEach(k => {
    const v = localStorage.getItem(k);
    if (v !== null) preserved[k] = v;
  });

  // Clear total
  localStorage.clear();
  try { sessionStorage.clear(); } catch (e) { /* ignore */ }

  // Restaurăm
  Object.entries(preserved).forEach(([k, v]) => localStorage.setItem(k, v));

  // Firebase cleanup pentru test residue
  try {
    const fbModule = await import('../firebase.js').catch(() => null);
    if (fbModule && fbModule.removeKey) {
      await Promise.all(TEST_RESIDUE_KEYS.map(k => fbModule.removeKey(k).catch(() => {})));
    }
  } catch (err) {
    console.warn('[DataCleanup] Firebase residue clear:', err.message);
  }

  if (window._directorCache) {
    window._directorCache.invalidate();
  } else if (window._cachedDirectorSession !== undefined) {
    window._cachedDirectorSession = null;
  }

  setTimeout(() => { window._suppressFirebaseSync = false; }, 3000);

  if (options.reload) {
    setTimeout(() => window.location.reload(), 500);
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

if (typeof window !== 'undefined') {
  window.resetTestData = resetTestData;
  window.fullReset = fullReset;
  window.inspectStorage = inspectStorage;
  window.resetButKeepRealLogs = resetButKeepRealLogs;
  window.createAutoBackup = createAutoBackup;
  window.restoreFromBackup = restoreFromBackup;
  window.restoreLastBackup = restoreLastBackup;
}
