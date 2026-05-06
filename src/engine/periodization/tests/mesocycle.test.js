import { describe, it, expect } from 'vitest';
import {
  computePhase,
  volumeMultiplierForPhase,
  intensityMultiplierForPhase,
  rirTargetForPhase,
  isMariusDualSignalGreen,
  hasInjuryBlock,
  isExtensionAllowedByCap,
  resolveTrigger,
} from '../mesocycle.js';
import { DELOAD_MULTIPLIERS, ANTI_ABUSE } from '../constants.js';

describe('computePhase — §9.3 Cluster 2.1 W1-W4 cycle', () => {
  it('W1 → LOAD baseline', () => {
    expect(computePhase(1)).toBe('LOAD');
  });
  it('W2 → LOAD+ accumulate', () => {
    expect(computePhase(2)).toBe('LOAD+');
  });
  it('W3 → PEAK push', () => {
    expect(computePhase(3)).toBe('PEAK');
  });
  it('W4 → DELOAD reset', () => {
    expect(computePhase(4)).toBe('DELOAD');
  });
  it('out-of-range coerces to LOAD (defensive total function)', () => {
    expect(computePhase(0)).toBe('LOAD');
    expect(computePhase(5)).toBe('LOAD');
    expect(computePhase(-1)).toBe('LOAD');
    expect(computePhase('foo')).toBe('LOAD');
    expect(computePhase(null)).toBe('LOAD');
  });
});

describe('volumeMultiplierForPhase — §9.3 Cluster 2.1 DELOAD −45%', () => {
  it('DELOAD → 0.55 (−45% volume cut)', () => {
    expect(volumeMultiplierForPhase('DELOAD')).toBe(DELOAD_MULTIPLIERS.volumeMul);
    expect(volumeMultiplierForPhase('DELOAD')).toBeCloseTo(0.55, 5);
  });
  it('LOAD / LOAD+ / PEAK → 1.00 (baseline volume)', () => {
    expect(volumeMultiplierForPhase('LOAD')).toBe(1.0);
    expect(volumeMultiplierForPhase('LOAD+')).toBe(1.0);
    expect(volumeMultiplierForPhase('PEAK')).toBe(1.0);
  });
});

describe('intensityMultiplierForPhase — §9.3 Cluster 2.1 DELOAD −12.5%', () => {
  it('DELOAD → 0.875 (−12.5% intensity cut)', () => {
    expect(intensityMultiplierForPhase('DELOAD')).toBe(DELOAD_MULTIPLIERS.intensityMul);
    expect(intensityMultiplierForPhase('DELOAD')).toBeCloseTo(0.875, 5);
  });
  it('LOAD / LOAD+ / PEAK → 1.00 (baseline intensity)', () => {
    expect(intensityMultiplierForPhase('LOAD')).toBe(1.0);
    expect(intensityMultiplierForPhase('LOAD+')).toBe(1.0);
    expect(intensityMultiplierForPhase('PEAK')).toBe(1.0);
  });
});

describe('rirTargetForPhase — §9.3 Cluster 2.1 RIR drift LOAD→PEAK', () => {
  it('LOAD → baseline (offset 0)', () => {
    expect(rirTargetForPhase('LOAD', 3)).toBe(3);
  });
  it('LOAD+ → baseline − 1', () => {
    expect(rirTargetForPhase('LOAD+', 3)).toBe(2);
  });
  it('PEAK → baseline − 2', () => {
    expect(rirTargetForPhase('PEAK', 3)).toBe(1);
  });
  it('DELOAD → baseline (recovery, NU push closer to failure)', () => {
    expect(rirTargetForPhase('DELOAD', 3)).toBe(3);
  });
  it('floor at 0 (NU negative RIR)', () => {
    expect(rirTargetForPhase('PEAK', 1)).toBe(0);
    expect(rirTargetForPhase('PEAK', 0)).toBe(0);
  });
  it('non-numeric baseline coerces to defensive default 2', () => {
    expect(rirTargetForPhase('LOAD', 'foo')).toBe(2);
    expect(rirTargetForPhase('LOAD', null)).toBe(2);
  });
});

describe('isMariusDualSignalGreen — §9.3 Cluster 2.3 §45.4 Q21 §36.82', () => {
  // Helper: build a 4-week mesocycle session trail
  const buildTrail = (rirByWeek, energyTrail) => {
    const trail = [];
    // Recent 3 energy signal sessions
    for (const e of energyTrail) trail.push({ energy: e, weekIdx: 4 });
    // Add per-week sessions for RIR check (1 session/week)
    for (let w = 1; w <= 4; w++) {
      trail.push({ rir: rirByWeek[w - 1], weekIdx: w });
    }
    return trail;
  };

  it('green when RIR stable [1,2] all 4 weeks AND no red in last 3 sessions', () => {
    const trail = buildTrail([1, 2, 1, 2], ['green', 'green', 'green']);
    expect(isMariusDualSignalGreen(trail)).toBe(true);
  });
  it('false when ANY week RIR outside [1,2]', () => {
    const trail = buildTrail([1, 2, 3, 2], ['green', 'green', 'green']);
    expect(isMariusDualSignalGreen(trail)).toBe(false);
  });
  it('false when ANY of last 3 sessions energy=red', () => {
    const trail = buildTrail([1, 2, 1, 2], ['green', 'red', 'green']);
    expect(isMariusDualSignalGreen(trail)).toBe(false);
  });
  it('false when fewer than 3 sessions in energy window', () => {
    const trail = buildTrail([1, 2, 1, 2], ['green', 'green']);
    expect(isMariusDualSignalGreen(trail)).toBe(false);
  });
  it('false when ANY week has zero sessions logged', () => {
    const partial = [{ rir: 1, weekIdx: 1 }, { rir: 2, weekIdx: 2 }, { rir: 1, weekIdx: 3 }];
    expect(isMariusDualSignalGreen(partial)).toBe(false);
  });
  it('returns false on non-array input (defensive)', () => {
    expect(isMariusDualSignalGreen(null)).toBe(false);
    expect(isMariusDualSignalGreen(undefined)).toBe(false);
    expect(isMariusDualSignalGreen('not-array')).toBe(false);
  });
});

describe('hasInjuryBlock — §9.3 anti-abuse Invariant 5 Medical Safety', () => {
  it('detects injury within 6 săpt window (42 days)', () => {
    expect(hasInjuryBlock([{ injury: true, daysAgo: 10 }])).toBe(true);
    expect(hasInjuryBlock([{ injury: true, daysAgo: 41 }])).toBe(true);
    expect(hasInjuryBlock([{ injury: true, daysAgo: 42 }])).toBe(true);
  });
  it('NU blocks injury older than 6 săpt window', () => {
    expect(hasInjuryBlock([{ injury: true, daysAgo: 43 }])).toBe(false);
    expect(hasInjuryBlock([{ injury: true, daysAgo: 100 }])).toBe(false);
  });
  it('blocks injury without timestamp (defensive)', () => {
    expect(hasInjuryBlock([{ injury: true }])).toBe(true);
  });
  it('false on no injury entries', () => {
    expect(hasInjuryBlock([{ injury: false, daysAgo: 1 }, {}])).toBe(false);
    expect(hasInjuryBlock([])).toBe(false);
  });
  it('false on non-array (defensive)', () => {
    expect(hasInjuryBlock(null)).toBe(false);
    expect(hasInjuryBlock('foo')).toBe(false);
  });
});

describe('isExtensionAllowedByCap — §9.3 anti-abuse max 2 consecutive', () => {
  it('allowed when 0 consecutive extensions', () => {
    expect(isExtensionAllowedByCap(0)).toBe(true);
  });
  it('allowed when 1 consecutive extension', () => {
    expect(isExtensionAllowedByCap(1)).toBe(true);
  });
  it('blocked at cap (2 consecutive extensions)', () => {
    expect(isExtensionAllowedByCap(ANTI_ABUSE.maxConsecutiveExtensions)).toBe(false);
  });
  it('blocked when over cap', () => {
    expect(isExtensionAllowedByCap(3)).toBe(false);
  });
  it('defensive: unknown count assumes allowed', () => {
    expect(isExtensionAllowedByCap('foo')).toBe(true);
    expect(isExtensionAllowedByCap(NaN)).toBe(true);
  });
});

describe('resolveTrigger — §9.3 Cluster 2.2 hierarchy EARLY_SAFETY > EXTENSION_MARIUS > CALENDAR', () => {
  it('EARLY_SAFETY trumps everything else', () => {
    const result = resolveTrigger({
      earlySafetyTriggered: true,
      personaId: 'marius',
      recentSessions: [],
      consecutiveExtensions: 0,
    });
    expect(result.trigger).toBe('EARLY_SAFETY');
    expect(result.signals).toContain('early_safety_deload');
  });

  it('EXTENSION_MARIUS when Marius dual-signal green + no injury + cap not hit', () => {
    const greenTrail = [];
    for (let w = 1; w <= 4; w++) greenTrail.push({ rir: 1, weekIdx: w });
    greenTrail.push({ energy: 'green', weekIdx: 4 });
    greenTrail.push({ energy: 'green', weekIdx: 4 });
    greenTrail.push({ energy: 'green', weekIdx: 4 });

    const result = resolveTrigger({
      earlySafetyTriggered: false,
      personaId: 'marius',
      recentSessions: greenTrail,
      consecutiveExtensions: 0,
    });
    expect(result.trigger).toBe('EXTENSION_MARIUS');
    expect(result.signals).toContain('marius_dual_signal_green');
  });

  it('CALENDAR for Maria/Gigica regardless of signals (extension Marius-only)', () => {
    const greenTrail = [];
    for (let w = 1; w <= 4; w++) greenTrail.push({ rir: 1, weekIdx: w });
    greenTrail.push({ energy: 'green', weekIdx: 4 });
    greenTrail.push({ energy: 'green', weekIdx: 4 });
    greenTrail.push({ energy: 'green', weekIdx: 4 });

    expect(resolveTrigger({
      earlySafetyTriggered: false,
      personaId: 'maria',
      recentSessions: greenTrail,
      consecutiveExtensions: 0,
    }).trigger).toBe('CALENDAR');

    expect(resolveTrigger({
      earlySafetyTriggered: false,
      personaId: 'gigica',
      recentSessions: greenTrail,
      consecutiveExtensions: 0,
    }).trigger).toBe('CALENDAR');
  });

  it('CALENDAR + signal injury_history when Marius has recent injury', () => {
    const result = resolveTrigger({
      earlySafetyTriggered: false,
      personaId: 'marius',
      recentSessions: [{ injury: true, daysAgo: 5 }],
      consecutiveExtensions: 0,
    });
    expect(result.trigger).toBe('CALENDAR');
    expect(result.signals).toContain('extension_blocked_injury_history');
  });

  it('CALENDAR + signal cap when Marius hit consecutive cap', () => {
    const result = resolveTrigger({
      earlySafetyTriggered: false,
      personaId: 'marius',
      recentSessions: [],
      consecutiveExtensions: ANTI_ABUSE.maxConsecutiveExtensions,
    });
    expect(result.trigger).toBe('CALENDAR');
    expect(result.signals).toContain('extension_blocked_consecutive_cap');
  });

  it('CALENDAR + signal not_green when Marius signals fail', () => {
    const result = resolveTrigger({
      earlySafetyTriggered: false,
      personaId: 'marius',
      recentSessions: [{ rir: 5, weekIdx: 1 }],
      consecutiveExtensions: 0,
    });
    expect(result.trigger).toBe('CALENDAR');
    expect(result.signals).toContain('marius_dual_signal_not_green');
  });
});
