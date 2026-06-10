// ══ DP ENGINE — F-1: tuning lands on the EMITTED active engineNames ═══════════
//
// Defect F-1 (audit 2026-06-06): the DP REP_RANGES / MAX_KG / WEIGHT_CAP_STRATEGY
// tables keyed on legacy names (e.g. 'Lateral Raises', 'Pushdown', 'Calf Raises')
// whose exercises.json status is undefined — so the ACTIVE visibility gate
// (CORE_AUTO only) NEVER emits them. The founder's tuning therefore never reached
// the engineNames the session builder actually offers a new user; ~90% of active
// lifts fell to the generic [8,12] default with no weight cap.
//
// This regression asserts the tuning now lands on the REAL emitted CORE_AUTO
// names, that no truly-dead key remains in the tuning tables, and that the heavy
// generic compounds carry an explicit defensive MAX_KG cap.
//
// REAL data only: every name below is verified CORE_AUTO in exercises.json.

import { describe, it, expect } from 'vitest';
import { DP } from '../dp.js';
import exercisesData from '../exercises.json';
import { ACTIVE_STATUSES } from '../exerciseLibrary.js';

/** @type {Record<string, {status?: string}>} */
const LIB = exercisesData;

/** @param {string} name */
function isActive(name) {
  const m = LIB[name];
  return !!m && ACTIVE_STATUSES.has(/** @type {string} */ (m.status));
}

describe('F-1: every tuning-table key names a LIVE active CORE_AUTO exercise', () => {
  it('no REP_RANGES key is dead (status not CORE_AUTO)', () => {
    const dead = Object.keys(DP.REP_RANGES).filter((k) => !isActive(k));
    expect(dead).toEqual([]);
  });

  it('no MAX_KG key is dead (status not CORE_AUTO)', () => {
    const dead = Object.keys(DP.MAX_KG).filter((k) => !isActive(k));
    expect(dead).toEqual([]);
  });

  it('no WEIGHT_CAP_STRATEGY key is dead (status not CORE_AUTO)', () => {
    const dead = Object.keys(DP.WEIGHT_CAP_STRATEGY).filter((k) => !isActive(k));
    expect(dead).toEqual([]);
  });
});

describe("F-1: founder's re-pointed tuning reaches the emitted isolation names", () => {
  // Founder spec 2026-06-10 (R2 coach audit): low-risk isolations get their class
  // band — laterals/rear-delts/calves [12,20], curls/triceps [10,15] — applied to
  // the names the builder actually emits. Face Pull stays [12,15] (rotator-cuff
  // safety: high reps on a small external rotator invite sloppy form).
  it('lateral raises → [12,20] on every emitted variant', () => {
    for (const n of ['DB Lateral Raise', 'Cable Lateral Raise', 'Machine Lateral Raise', 'Leaning Lateral Raise']) {
      expect(DP.REP_RANGES[n]).toEqual([12, 20]);
      expect(isActive(n)).toBe(true);
    }
  });

  it('rear delt + reverse pec deck → [12,20]; face pull stays [12,15]', () => {
    for (const n of ['DB Rear Delt Fly', 'Cable Rear Delt Fly', 'Reverse Pec Deck']) {
      expect(DP.REP_RANGES[n]).toEqual([12, 20]);
      expect(isActive(n)).toBe(true);
    }
    expect(DP.REP_RANGES['Face Pull']).toEqual([12, 15]);
    expect(isActive('Face Pull')).toBe(true);
  });

  it('triceps pushdown / overhead → [10,15] on emitted names', () => {
    for (const n of [
      'Cable Triceps Pushdown Straight Bar', 'Cable Triceps Pushdown Rope',
      'Cable Overhead Triceps Extension Rope', 'DB Overhead Triceps Extension Two-Hand',
    ]) {
      expect(DP.REP_RANGES[n]).toEqual([10, 15]);
      expect(isActive(n)).toBe(true);
    }
  });

  it('preacher curl → [10,15] on the emitted name', () => {
    expect(DP.REP_RANGES['EZ-bar Preacher Curl']).toEqual([10, 15]);
    expect(isActive('EZ-bar Preacher Curl')).toBe(true);
  });

  it('calf raises → [12,20] on emitted names', () => {
    for (const n of ['Standing Calf Raise Machine', 'Seated Calf Raise Machine', 'Smith Standing Calf Raise']) {
      expect(DP.REP_RANGES[n]).toEqual([12, 20]);
      expect(isActive(n)).toBe(true);
    }
  });

  it('the emitted isolations carry their MAX_KG cap + reps cap-strategy', () => {
    // lateral raise dumbbell cap ~18 kg/hand (founder ref), strategy = add reps.
    expect(DP.MAX_KG['DB Lateral Raise']).toBe(18);
    expect(DP.WEIGHT_CAP_STRATEGY['DB Lateral Raise']).toBe('reps');
    expect(DP.MAX_KG['Cable Triceps Pushdown Straight Bar']).toBeGreaterThan(0);
    expect(DP.WEIGHT_CAP_STRATEGY['Cable Triceps Pushdown Straight Bar']).toBe('reps');
  });
});

describe('F-1: heavy generic compounds carry an explicit defensive MAX_KG cap', () => {
  // Audit list: these ran on generic [8,12] with NO cap — safe only by accident of
  // the equipment-list ceiling. They must now have an explicit cap (a true ceiling
  // well above any realistic strong-lifter load, so it clips only absurd values).
  const HEAVY_COMPOUNDS = [
    'Flat Barbell Bench', 'Incline Barbell Bench', 'Close-Grip Bench Press',
    'Barbell Row', 'Pendlay Row', 'Hammer Strength Row',
    'Barbell Back Squat (High Bar)', 'Hack Squat Machine',
    'Hip Thrust', 'Trap Bar Deadlift',
    'Pull-up', 'Weighted Pull-up', 'Chin-up',
  ];

  it('each heavy compound is ACTIVE and has a finite, sane MAX_KG cap', () => {
    for (const n of HEAVY_COMPOUNDS) {
      expect(isActive(n)).toBe(true);
      const cap = DP.MAX_KG[n];
      expect(Number.isFinite(cap)).toBe(true);
      // Sanity band: above world-class training loads, below the physically absurd.
      expect(cap).toBeGreaterThanOrEqual(80);
      expect(cap).toBeLessThanOrEqual(400);
    }
  });

  it('the cap is high enough never to clip a strong real lifter (e.g. 140kg bench)', () => {
    // A 140 kg flat bench is elite-but-real → must be UNDER the cap, not clipped.
    expect(DP.MAX_KG['Flat Barbell Bench']).toBeGreaterThan(140);
  });
});
