// ══ W-Goal — coherent STRENGTH goal (dp_strength_goal_v1) ════════════════════
// goal=forta must be a REAL strength prescription: LOWER reps (~3-6) + HEAVIER
// implied %1RM on a barbell COMPOUND — not hypertrophy-with-long-rest. The flag
// flips BOTH levers atomically:
//   (a) UNCLAMP the rep floor: forta band [3,8] is normally floored to the
//       per-exercise REP_RANGES default [8,12] (max(8,3)=8). With the flag ON +
//       an e1RM-eligible COMPOUND, the goal low (3) wins → reps drop into 3-6.
//   (b) the %1RM intensity corridor turns ON for that path (subsumes #6) so the
//       lower reps ride the heavier {0.78,0.90} load.
// Flag OFF → BYTE-IDENTICAL (forta still floors to 8). hipertrofie [8,12] is
// untouched even with the flag ON (its low >= default, never unclamps).
//
// REAL values: real library compounds + a real stable working history so DP runs
// its history branch (mu exists → the corridor can bite).

import { describe, it, expect, beforeEach } from 'vitest';
import { DP } from '../dp.js';
import { DB } from '../../db.js';

const FORTA = [3, 8];          // goalAdaptation forta rep_range_modifier (TEMPLATE_BASE_MODIFIERS)
const HYPER = [8, 12];         // hipertrofie / masa rep band
const FORTA_CORRIDOR = { floor: 0.78, ceiling: 0.90 }; // periodization forta corridor
const HYPER_CORRIDOR = { floor: 0.70, ceiling: 0.85 };
const STRENGTH_ON = () =>
  localStorage.setItem('_devFlags', JSON.stringify({ dp_strength_goal_v1: true }));
// dp_strength_goal_v1 now defaults ON (2026-06-09 flip) — the OFF-arm tests must
// force it explicitly OFF to assert the byte-identical legacy behavior (same OFF-pin
// precedent the focus-policy flip used).
const STRENGTH_OFF = () =>
  localStorage.setItem('_devFlags', JSON.stringify({ dp_strength_goal_v1: false }));

const BENCH = 'Flat Barbell Bench'; // COMPOUND_EX, barbell e1RM-eligible, NO REP_RANGES entry → default [8,12]
const CABLE = 'Lat Pulldown';       // COMPOUND_EX cable, REP_RANGES [8,12]

/** Seed a real, stable working history so DP runs its history branch + has a mu. */
function seedHistory(ex, w, reps, rpe) {
  const ts = Date.now() - 24 * 3600 * 1000;
  DB.set('logs', [
    { ex, w, kg: w, reps: String(reps), ts, rpe, session: ts },
    { ex, w, kg: w, reps: String(reps), ts: ts - 1, rpe, session: ts - 1 },
    { ex, w, kg: w, reps: String(reps), ts: ts - 2, rpe, session: ts - 2 },
  ]);
}

beforeEach(() => {
  try { localStorage.clear(); } catch { /* jsdom */ }
  DB.set('logs', []);
  DB.set('phase-override', 'BULK'); // no CUT rep cap interference
});

describe('W-Goal — flag OFF is byte-identical (forta still clamps to 8)', () => {
  it('forta on a barbell compound floors to 8 with the flag OFF', () => {
    STRENGTH_OFF();
    seedHistory(BENCH, 60, 8, 8);
    const rec = DP.getSmartRecommendation(BENCH, null, null, undefined, null, [], {
      repRangeModifier: FORTA,
      intensityCorridor: FORTA_CORRIDOR,
    });
    // OFF: goal low (3) is floored to the [8,12] default → 8, exactly as today.
    expect(rec.repsTarget).toBe(8);
  });

  it('OFF: forta keeps the legacy clamp (reps floored to 8, corridor inert)', () => {
    // The F2 #2 goal-band INTERSECTION is pre-existing + flag-independent: forta
    // [3,8] ∩ default [8,12] = [8,8] → 8 (today's documented behavior). My change
    // must NOT alter this when the flag is OFF: reps stay 8 and the corridor (gated
    // by dp_intensity_corridor_v1, also OFF here) does not move the load.
    STRENGTH_OFF();
    seedHistory(BENCH, 60, 8, 8);
    const forta = DP.getSmartRecommendation(BENCH, null, null, undefined, null, [], {
      repRangeModifier: FORTA,
      intensityCorridor: FORTA_CORRIDOR,
    });
    expect(forta.repsTarget).toBe(8);
    // corridor gated OFF → kg is the plain history-branch load (no corridor stamp).
    expect(forta.intensityCorridorApplied).toBeUndefined();
  });
});

describe('W-Goal — flag ON unclamps forta reps on a barbell compound', () => {
  it('forta [3,8] drops the repsTarget into 3-6 (NOT 8)', () => {
    STRENGTH_ON();
    seedHistory(BENCH, 60, 8, 8);
    const rec = DP.getSmartRecommendation(BENCH, null, null, undefined, null, [], {
      repRangeModifier: FORTA,
    });
    expect(rec.repsTarget).toBeLessThan(8);
    expect(rec.repsTarget).toBeGreaterThanOrEqual(3);
    expect(rec.repsTarget).toBeLessThanOrEqual(6);
  });

  it('hipertrofie [8,12] stays in the hypertrophy band even with the flag ON', () => {
    STRENGTH_ON();
    seedHistory(BENCH, 60, 8, 8);
    const rec = DP.getSmartRecommendation(BENCH, null, null, undefined, null, [], {
      repRangeModifier: HYPER,
    });
    // low (8) >= default floor (8) → never unclamps → stays 8-12.
    expect(rec.repsTarget).toBeGreaterThanOrEqual(8);
    expect(rec.repsTarget).toBeLessThanOrEqual(12);
  });

  it('ON: hipertrofie reps == the flag-OFF hipertrofie reps (untouched)', () => {
    seedHistory(BENCH, 60, 8, 8);
    const off = DP.getSmartRecommendation(BENCH, null, null, undefined, null, [], {
      repRangeModifier: HYPER,
    });
    STRENGTH_ON();
    seedHistory(BENCH, 60, 8, 8);
    const on = DP.getSmartRecommendation(BENCH, null, null, undefined, null, [], {
      repRangeModifier: HYPER,
    });
    expect(on.repsTarget).toBe(off.repsTarget);
  });

  it('the corridor turns ON under the strength flag (heavier implied load for forta)', () => {
    // mu from a heavy single-ish history → a too-LIGHT prescribed kg is raised to
    // the forta corridor floor (0.78). Drive _applyIntensityCorridor through the
    // strength flag (NOT dp_intensity_corridor_v1).
    STRENGTH_ON();
    seedHistory(CABLE, 80, 5, 7.5); // mu ≈ 80*(1+ ~6.5/30) ≈ 97
    const tooLight = 20; // implied %1RM well below 0.78
    const out = DP._applyIntensityCorridor(tooLight, CABLE, 5, FORTA_CORRIDOR);
    expect(out).toBeGreaterThan(tooLight);
  });

  it('the corridor stays OFF when NEITHER flag is set (byte-identical)', () => {
    STRENGTH_OFF();
    seedHistory(CABLE, 80, 5, 7.5);
    const out = DP._applyIntensityCorridor(20, CABLE, 5, FORTA_CORRIDOR);
    expect(out).toBe(20);
  });
});

describe('W-Goal — strength diverges from hypertrophy under the flag', () => {
  it('forta prescribes fewer reps than hipertrofie on the same compound + history', () => {
    STRENGTH_ON();
    seedHistory(BENCH, 60, 8, 8);
    const forta = DP.getSmartRecommendation(BENCH, null, null, undefined, null, [], {
      repRangeModifier: FORTA,
      intensityCorridor: FORTA_CORRIDOR,
    });
    STRENGTH_ON();
    seedHistory(BENCH, 60, 8, 8);
    const hyper = DP.getSmartRecommendation(BENCH, null, null, undefined, null, [], {
      repRangeModifier: HYPER,
      intensityCorridor: HYPER_CORRIDOR,
    });
    expect(forta.repsTarget).toBeLessThan(hyper.repsTarget);
  });
});
