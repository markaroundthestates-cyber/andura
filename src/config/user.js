// ══ USER CONFIG — defaults + localStorage override ═══════════

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
    kcal: 1800,
    protein: 180,
    phaseTargetDate: '2026-07-20',
  },
  firebase: {
    userPath: 'users/daniel',
  },
};

export function getUserConfig() {
  const override = localStorage.getItem('sf.userConfig');
  if (override) {
    try {
      return { ...USER_DEFAULTS, ...JSON.parse(override) };
    } catch {
      return USER_DEFAULTS;
    }
  }
  return USER_DEFAULTS;
}

export function updateUserConfig(patch) {
  const current = getUserConfig();
  const updated = { ...current, ...patch };
  localStorage.setItem('sf.userConfig', JSON.stringify(updated));
  return updated;
}
