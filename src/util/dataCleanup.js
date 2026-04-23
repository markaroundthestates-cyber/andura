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
  'suppl-list'
];

export function resetTestData() {
  TEST_RESIDUE_KEYS.forEach(k => localStorage.removeItem(k));
  console.log('[DataCleanup] Test residue cleared:', TEST_RESIDUE_KEYS.length, 'keys');
  return { cleared: TEST_RESIDUE_KEYS.length };
}

export function fullReset() {
  [...TEST_RESIDUE_KEYS, ...USER_DATA_KEYS].forEach(k => localStorage.removeItem(k));
  console.log('[DataCleanup] FULL RESET — all data cleared');
  return { cleared: 'all' };
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
