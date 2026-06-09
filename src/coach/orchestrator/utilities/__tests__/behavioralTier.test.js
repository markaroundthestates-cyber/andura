import { describe, it, expect } from 'vitest';
import {
  resolveBehavioralTier,
  MIN_SESSIONS_TO_CLASSIFY,
} from '../convergenceGuard.js';
import {
  classifyMovementLevel,
  STRENGTH_TIER_BAND,
} from '../../../../engine/dp/ceiling.js';
import { DP } from '../../../../engine/dp.js';

// Real RIR-corrected Epley e1RM (the production fn) so the test exercises the
// SAME math the live seam uses.
const e1RMForSet = (w, reps, rpe, ex) => DP.e1RMForSet(w, reps, rpe, ex);

// A logs helper — one set repeated, newest-first. `rpe` 7 = potrivit (no failure).
function setsAt(w, reps, n = 6, rpe = 7) {
  return Array.from({ length: n }, (_, i) => ({ w, reps, rpe, ts: 1000 + i }));
}

describe('classifyMovementLevel — strength-standard bands', () => {
  it('classifies squat ratio into beginner/intermediate/advanced', () => {
    expect(classifyMovementLevel('squat', 0.9)).toBe('beginner');     // < 1.25
    expect(classifyMovementLevel('squat', 1.30)).toBe('intermediate'); // >= 1.25
    expect(classifyMovementLevel('squat', 1.80)).toBe('advanced');     // >= 1.75
  });

  it('returns null for an isolation pattern (no band)', () => {
    expect(classifyMovementLevel('bicep', 1.5)).toBeNull();
    expect(classifyMovementLevel('generic', 1.5)).toBeNull();
  });

  it('returns null for an unusable ratio', () => {
    expect(classifyMovementLevel('squat', 0)).toBeNull();
    expect(classifyMovementLevel('squat', NaN)).toBeNull();
  });

  it('advanced band sits BELOW the elite ceiling for every main pattern', () => {
    // sanity: each band's advanced threshold is a real-training-age proof, not elite.
    for (const p of Object.keys(STRENGTH_TIER_BAND)) {
      expect(STRENGTH_TIER_BAND[p].advanced).toBeGreaterThan(STRENGTH_TIER_BAND[p].intermediate);
    }
  });
});

describe('resolveBehavioralTier — cold-start gate', () => {
  const base = {
    seedTier: 'T2',
    bodyweightKg: 80,
    sex: 'm',
    exerciseNames: ['Barbell Squat'],
    getLogsFor: () => setsAt(60, 8), // weak squat → beginner if classified
    e1RMForSet,
  };

  it('keeps the self-report seed below the literal cold-start session count', () => {
    const r = resolveBehavioralTier({ ...base, sessionCount: MIN_SESSIONS_TO_CLASSIFY - 1 });
    expect(r.tier).toBe('T2');
    expect(r.changed).toBe(false);
  });
});

describe('resolveBehavioralTier — demotion (the over-claimer) is FAST', () => {
  it('demotes a self-reported advanced who actually lifts beginner loads', () => {
    // 60kg x 8 @ bw 80 → e1RM ~76 → ratio ~0.95 < squat intermediate 1.25 → beginner.
    const r = resolveBehavioralTier({
      seedTier: 'T2',
      bodyweightKg: 80,
      sex: 'm',
      sessionCount: 3,
      lastChangeTs: null, // first behavioral resolution → no hysteresis wait
      exerciseNames: ['Barbell Squat'],
      getLogsFor: () => setsAt(60, 8),
      e1RMForSet,
    });
    expect(r.tier).toBe('T0');
    expect(r.changed).toBe(true);
    expect(typeof r.lastChangeTs).toBe('number');
  });
});

describe('resolveBehavioralTier — promotion trusts strength (session count never blocks)', () => {
  it('promotes a self-reported beginner who lifts advanced loads, even with few sessions', () => {
    // 170kg x 5 @ bw 80 → e1RM ~198 → ratio ~2.48 > squat advanced 1.75 → advanced.
    const r = resolveBehavioralTier({
      seedTier: 'T0',
      bodyweightKg: 80,
      sex: 'm',
      sessionCount: 3, // only just past the cold-start gate
      lastChangeTs: null,
      exerciseNames: ['Barbell Squat'],
      // flat (no climb) heavy loads → not newbie gains
      getLogsFor: () => setsAt(170, 5),
      e1RMForSet,
    });
    expect(r.tier).toBe('T2');
    expect(r.changed).toBe(true);
  });

  it('a STILL-CLIMBING advanced-strength lift is capped to T1 (newbie gains)', () => {
    // Newest-first logs that are heavier recently than earlier → still climbing.
    const climbing = [
      { w: 170, reps: 5, rpe: 7, ts: 6000 },
      { w: 165, reps: 5, rpe: 7, ts: 5000 },
      { w: 130, reps: 5, rpe: 7, ts: 4000 },
      { w: 120, reps: 5, rpe: 7, ts: 3000 },
      { w: 110, reps: 5, rpe: 7, ts: 2000 },
      { w: 100, reps: 5, rpe: 7, ts: 1000 },
    ];
    const r = resolveBehavioralTier({
      seedTier: 'T0',
      bodyweightKg: 80,
      sex: 'm',
      sessionCount: 6,
      lastChangeTs: null,
      exerciseNames: ['Barbell Squat'],
      getLogsFor: () => climbing,
      e1RMForSet,
    });
    expect(r.tier).toBe('T1');
    expect(r.changed).toBe(true);
  });
});

describe('resolveBehavioralTier — hysteresis (anti yo-yo)', () => {
  it('does NOT change again before the hysteresis session window elapses', () => {
    const r = resolveBehavioralTier({
      seedTier: 'T2',
      bodyweightKg: 80,
      sex: 'm',
      sessionCount: 3, // < HYSTERESIS_MIN_SESSIONS + MIN_SESSIONS_TO_CLASSIFY (=4)
      lastChangeTs: 12345, // a recent change exists
      exerciseNames: ['Barbell Squat'],
      getLogsFor: () => setsAt(60, 8), // would otherwise demote
      e1RMForSet,
    });
    expect(r.changed).toBe(false);
    expect(r.tier).toBe('T2'); // seed held
    expect(r.lastChangeTs).toBe(12345);
  });

  it('allows the change once enough sessions have passed since the last change', () => {
    const r = resolveBehavioralTier({
      seedTier: 'T2',
      bodyweightKg: 80,
      sex: 'm',
      sessionCount: 5, // >= 4 → hysteresis cleared
      lastChangeTs: 12345,
      now: 99999,
      exerciseNames: ['Barbell Squat'],
      getLogsFor: () => setsAt(60, 8),
      e1RMForSet,
    });
    expect(r.changed).toBe(true);
    expect(r.tier).toBe('T0');
    expect(r.lastChangeTs).toBe(99999);
  });
});

describe('resolveBehavioralTier — degrade safe', () => {
  it('keeps the seed when there is no usable strength signal (only isolations)', () => {
    const r = resolveBehavioralTier({
      seedTier: 'T1',
      bodyweightKg: 80,
      sex: 'm',
      sessionCount: 5,
      lastChangeTs: null,
      exerciseNames: ['Bicep Curl'], // no strength-standard band
      getLogsFor: () => setsAt(20, 10),
      e1RMForSet,
    });
    expect(r.changed).toBe(false);
    expect(r.tier).toBe('T1');
  });

  it('keeps the seed when bodyweight is unusable', () => {
    const r = resolveBehavioralTier({
      seedTier: 'T1',
      bodyweightKg: 0,
      sex: 'm',
      sessionCount: 5,
      lastChangeTs: null,
      exerciseNames: ['Barbell Squat'],
      getLogsFor: () => setsAt(170, 5),
      e1RMForSet,
    });
    expect(r.changed).toBe(false);
    expect(r.tier).toBe('T1');
  });
});
