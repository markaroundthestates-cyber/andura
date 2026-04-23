// ══ ADMIN PREFILL — Owner data restore for development/validation ══════════
// NOTE: At commercial launch this button should be auth-gated (Week 5).

export function adminPrefillAll() {
  const kcalsData = {
    '2026-04-15': 1957,
    '2026-04-16': 1894,
    '2026-04-17': 1521,
    '2026-04-18': 1245,
    '2026-04-19': 1770,
    '2026-04-20': 1811,
    '2026-04-21': 1787,
    '2026-04-22': 1911,
    '2026-04-23': 1297,
  };

  const protsData = {
    '2026-04-15': 155,
    '2026-04-16': 168,
    '2026-04-17': 195,
    '2026-04-18': 122,
    '2026-04-19': 183,
    '2026-04-20': 209,
    '2026-04-21': 212,
    '2026-04-22': 249,
    '2026-04-23': 141,
  };

  const weightsData = {
    '2026-04-15': 112.0,
    '2026-04-16': 111.8,
    '2026-04-17': 111.4,
    '2026-04-18': 110.6,
    '2026-04-19': 110.2,
    '2026-04-22': 114.8,
    '2026-04-23': 110.0,
  };

  // Merge: existing user entries take priority over prefill defaults
  const existingKcals   = JSON.parse(localStorage.getItem('kcals')   || '{}');
  const existingProts   = JSON.parse(localStorage.getItem('prots')   || '{}');
  const existingWeights = JSON.parse(localStorage.getItem('weights') || '{}');

  localStorage.setItem('kcals',   JSON.stringify({ ...kcalsData,   ...existingKcals   }));
  localStorage.setItem('prots',   JSON.stringify({ ...protsData,   ...existingProts   }));
  localStorage.setItem('weights', JSON.stringify({ ...weightsData, ...existingWeights }));

  if (typeof window !== 'undefined' && typeof window.restoreRealLogs === 'function') {
    window.restoreRealLogs({ merge: true });
  }

  console.log('[AdminPrefill] Imported: kcals+prots 9 days, weights 7 days, logs Apr 21-22');

  return {
    kcalsDays:   Object.keys(kcalsData).length,
    protsDays:   Object.keys(protsData).length,
    weightsDays: Object.keys(weightsData).length,
  };
}

if (typeof window !== 'undefined') {
  window.adminPrefillAll = adminPrefillAll;
}
