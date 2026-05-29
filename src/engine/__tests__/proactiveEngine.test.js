import { describe, it, expect } from 'vitest';
import {
  checkProteinDeficit, checkSleepDebt,
  checkTrainingStreak, checkKcalDeficit, checkInactivity,
  checkHydration, runProactiveChecks,
  checkPROpportunity, checkRecoveryGroups,
} from '../proactiveEngine.js';
import { READINESS_PR } from '../readiness.js';

const today = new Date().toLocaleDateString('sv');
const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('sv');
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toLocaleDateString('sv');

describe('checkProteinDeficit', () => {
  it('returns null when no data', () => {
    expect(checkProteinDeficit(null, 80)).toBeNull();
  });

  it('returns alert when avg protein < 80% of target', () => {
    const prots = { [today]: 80, [yesterday]: 70, [twoDaysAgo]: 75 };
    const alert = checkProteinDeficit(prots, 100); // target = 220g
    expect(alert).not.toBeNull();
    expect(alert.type).toBe('protein_deficit');
  });

  it('returns null when protein is adequate', () => {
    const prots = { [today]: 220, [yesterday]: 230, [twoDaysAgo]: 210 };
    const alert = checkProteinDeficit(prots, 100); // target = 220g
    expect(alert).toBeNull();
  });
});

describe('checkSleepDebt', () => {
  it('returns null for empty readiness', () => {
    expect(checkSleepDebt({})).toBeNull();
  });

  it('detects 3 consecutive days below 60', () => {
    const readiness = {
      [today]: { score: 45 },
      [yesterday]: { score: 40 },
      [twoDaysAgo]: { score: 35 },
    };
    const alert = checkSleepDebt(readiness);
    expect(alert).not.toBeNull();
    expect(alert.type).toBe('sleep_debt');
  });

  it('returns null when readiness is adequate', () => {
    const readiness = {
      [today]: { score: 75 },
      [yesterday]: { score: 70 },
      [twoDaysAgo]: { score: 80 },
    };
    expect(checkSleepDebt(readiness)).toBeNull();
  });
});

describe('checkTrainingStreak', () => {
  it('returns null for empty logs', () => {
    expect(checkTrainingStreak([])).toBeNull();
  });

  it('detects streak of 5+ days', () => {
    const logs = Array.from({ length: 6 }, (_, i) => ({
      ex: 'Bench',
      ts: Date.now() - i * 86400000,
    }));
    const alert = checkTrainingStreak(logs);
    expect(alert).not.toBeNull();
    expect(alert.type).toBe('training_streak');
    expect(alert.streak).toBeGreaterThanOrEqual(5);
  });
});

describe('checkKcalDeficit', () => {
  it('returns null without data', () => {
    expect(checkKcalDeficit(null, 2200)).toBeNull();
  });

  it('alerts when avg kcal < 2000', () => {
    const kcals = { [today]: 1500, [yesterday]: 1600, [twoDaysAgo]: 1700 };
    const alert = checkKcalDeficit(kcals, 2200);
    expect(alert).not.toBeNull();
    expect(alert.type).toBe('kcal_too_low');
  });

  it('returns null when kcals adequate', () => {
    const kcals = { [today]: 2200, [yesterday]: 2100, [twoDaysAgo]: 2000 };
    expect(checkKcalDeficit(kcals, 2200)).toBeNull();
  });
});

describe('checkInactivity', () => {
  it('returns null for empty logs', () => {
    expect(checkInactivity([])).toBeNull();
  });

  it('alerts after 4+ days without training', () => {
    const logs = [{ ex: 'Bench', ts: Date.now() - 5 * 86400000 }];
    const alert = checkInactivity(logs);
    expect(alert).not.toBeNull();
    expect(alert.type).toBe('inactivity');
    expect(alert.daysSinceLast).toBeGreaterThanOrEqual(4);
  });

  it('returns null for recent training', () => {
    const logs = [{ ex: 'Bench', ts: Date.now() - 86400000 }];
    expect(checkInactivity(logs)).toBeNull();
  });

  it('returns null when logs lack usable ts (no Infinity leak)', () => {
    // Logs present but no ts → Math.max() of empty list is -Infinity. Must
    // return null, never an alert with daysSinceLast: Infinity.
    const logs = [{ ex: 'Bench', date: '2026-05-01' }, { ex: 'Row', reps: 8 }];
    expect(checkInactivity(logs)).toBeNull();
  });
});

describe('checkHydration', () => {
  it('returns null without data', () => {
    expect(checkHydration(null)).toBeNull();
  });

  it('alerts when today water < 2000ml', () => {
    const waters = { [today]: 1200 };
    const alert = checkHydration(waters);
    expect(alert).not.toBeNull();
    expect(alert.type).toBe('low_hydration');
    expect(alert.ml).toBe(1200);
  });

  it('returns null when water adequate', () => {
    const waters = { [today]: 2500 };
    expect(checkHydration(waters)).toBeNull();
  });
});

describe('runProactiveChecks', () => {
  it('returns array', () => {
    const result = runProactiveChecks({});
    expect(Array.isArray(result)).toBe(true);
  });

  it('sorts warnings before info before success', () => {
    const ctx = {
      prots: { [today]: 50, [yesterday]: 50, [twoDaysAgo]: 50 },
      user: { weight: 80 },
      logs: Array.from({ length: 6 }, (_, i) => ({ ex: 'Bench', ts: Date.now() - i * 86400000 })),
    };
    const alerts = runProactiveChecks(ctx);
    const severityOrder = { warning: 0, info: 1, success: 2 };
    for (let i = 1; i < alerts.length; i++) {
      expect(severityOrder[alerts[i - 1].severity]).toBeLessThanOrEqual(severityOrder[alerts[i].severity]);
    }
  });
});

// §07.198-204 — staleness/window branches are now pinnable via injected nowMs
// (defaults to real clock). A FIXED epoch decouples these tests from the wall
// clock so "days ago" thresholds are deterministic regardless of when CI runs.
describe('proactiveEngine injectable clock (§07.198-204)', () => {
  const NOW = Date.parse('2026-03-15T12:00:00Z'); // pinned reference instant
  const DAY = 86400000;

  it('checkInactivity: deterministic across the >=4d threshold with injected nowMs', () => {
    const logs3 = [{ ex: 'Bench', ts: NOW - 3 * DAY }];
    const logs5 = [{ ex: 'Bench', ts: NOW - 5 * DAY }];
    expect(checkInactivity(logs3, NOW)).toBeNull();           // 3 days < 4 → no alert
    const alert = checkInactivity(logs5, NOW);                 // 5 days >= 4 → alert
    expect(alert).not.toBeNull();
    expect(alert.daysSinceLast).toBe(5);
  });

  it('checkPROpportunity: 14d recency boundary pinned via injected nowMs', () => {
    // NOTE: the "today" readiness lookup uses db.js tod() (real clock, not
    // injectable here), so key on the real today. The 14d PR window IS the
    // injectable branch under test — anchor it on NOW.
    const todayKey = new Date().toLocaleDateString('sv');
    const readiness = { [todayKey]: READINESS_PR + 5 };
    // PR 20 days ago (relative to NOW) → outside 14d window → opportunity surfaced.
    const oldPR = [{ isPR: true, ts: NOW - 20 * DAY }];
    expect(checkPROpportunity(readiness, oldPR, NOW)).not.toBeNull();
    // PR 5 days ago (relative to NOW) → inside 14d window → suppressed.
    const recentPR = [{ isPR: true, ts: NOW - 5 * DAY }];
    expect(checkPROpportunity(readiness, recentPR, NOW)).toBeNull();
  });

  it('checkRecoveryGroups: >5d undertrained detection pinned via injected nowMs', () => {
    const muscleExercises = { chest: ['Bench'] };
    const stale = [{ ex: 'Bench', ts: NOW - 6 * DAY }];   // 6 days → undertrained
    const fresh = [{ ex: 'Bench', ts: NOW - 2 * DAY }];   // 2 days → fine
    expect(checkRecoveryGroups(stale, {}, muscleExercises, NOW)).not.toBeNull();
    expect(checkRecoveryGroups(fresh, {}, muscleExercises, NOW)).toBeNull();
  });

  it('runProactiveChecks threads ctx.nowMs into clock-reading checks', () => {
    const ctx = {
      logs: [{ ex: 'Bench', ts: NOW - 5 * DAY }],
      nowMs: NOW,
    };
    const alerts = runProactiveChecks(ctx);
    // 5-day gap → inactivity alert present deterministically.
    expect(alerts.some(a => a.type === 'inactivity')).toBe(true);
  });
});
