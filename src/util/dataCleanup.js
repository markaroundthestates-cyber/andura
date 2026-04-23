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
  'muted'
];

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
  if (window._cachedDirectorSession !== undefined) {
    window._cachedDirectorSession = null;
    console.log('[DataCleanup] Director cache invalidated');
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

  // Suppress Firebase sync during reset
  window._suppressFirebaseSync = true;
  console.log('[DataCleanup] Firebase sync suppressed');

  const allKeys = [...TEST_RESIDUE_KEYS, ...USER_DATA_KEYS];
  allKeys.forEach(k => localStorage.removeItem(k));
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

  // Invalidate CoachDirector cache
  if (window._cachedDirectorSession !== undefined) {
    window._cachedDirectorSession = null;
  }

  console.log('[DataCleanup] FULL RESET — all data cleared');

  // Re-enable Firebase sync after 3 seconds
  setTimeout(() => {
    window._suppressFirebaseSync = false;
    console.log('[DataCleanup] Firebase sync re-enabled');
  }, 3000);

  if (reload) {
    setTimeout(() => { location.reload(); }, 500);
  }

  return { cleared: 'all', firebase: clearFirebase };
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
}
