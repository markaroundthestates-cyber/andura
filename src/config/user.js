// ══ USER CONFIG — defaults + localStorage override ═══════════

import { kv } from '../storage/kv';

export const USER_DEFAULTS = {
  bio: {
    name: 'Daniel',
    height: 183,
    age: 30,
    startBF: 23,
    startKg: 111.4,
    currentKgFallback: 110.4,
    targetKg: 101.5,
  },
  targets: {
    kcal: 2000, // Daniel test data 1800 removed 2026-05-10 — 2000 generic adult male baseline; engine derive via BMR/TDEE Mifflin-St Jeor preferred
    protein: 180,
    phaseTargetDate: '2026-07-20',
  },
  firebase: {
    userPath: 'users/daniel',
  },
};

export function getUserConfig() {
  const override = kv.getItem('sf.userConfig');
  if (override) {
    try {
      return { ...USER_DEFAULTS, ...JSON.parse(override) };
    } catch {
      return USER_DEFAULTS;
    }
  }
  return USER_DEFAULTS;
}

/**
 * @param {Record<string, unknown>} patch
 * @returns {Record<string, unknown>}
 */
export function updateUserConfig(patch) {
  const current = getUserConfig();
  const updated = { ...current, ...patch };
  kv.setItem('sf.userConfig', JSON.stringify(updated));
  return updated;
}
