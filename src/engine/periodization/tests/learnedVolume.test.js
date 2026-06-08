// ══ BUILD F6b V1 #10 — Learned MEV/MAV unit tests (spec §3c) ═════════════════
// Pure learnVolumeLandmarks() from durable logs + the computeMuscleVolumeTarget
// `learned` override (byte-identical when omitted). Mirrors the F3 learned-recovery
// test discipline (real EXERCISE_MUSCLES keys + real rating literals so a green test
// means the live path works). The sim-plan cases (spec §3c):
//   - plateau at N sets → learned MAV converges TOWARD ~N (junk volume detected).
//   - regression at low volume → learned MEV RISES (under-dosing detected).
//   - steady progress → landmarks stay within the [0.6×,1.6×] clamp of the prior.
//   - too few weeks → no learn (the muscle keeps the prior).
//   - EMA-continues a prior (slow; one window barely moves a converged value).
//   - computeMuscleVolumeTarget WITHOUT `learned` = byte-identical to today.

import { describe, it, expect } from 'vitest';
import {
  learnVolumeLandmarks,
  LEARNED_VOLUME_CLAMP_LO,
  LEARNED_VOLUME_CLAMP_HI,
} from '../learnedVolume.js';
import { computeMuscleVolumeTarget } from '../volumeLandmarks.js';
import { ISRAETEL_BASELINES } from '../constants.js';

const MS_WEEK = 7 * 86400000;
const T0 = Date.UTC(2026, 0, 5); // a Monday

// One week of `nSets` Leg Extension sets (→ quads), best single-set 1RM ≈ best1RM.
function quadWeek(wk, nSets, best1RM, rating = 'potrivit') {
  const rows = [];
  const ts = T0 + wk * MS_WEEK;
  for (let s = 0; s < nSets; s++) {
    rows.push({ ex: 'Leg Extension', w: best1RM * 0.6, reps: 10, ts: ts + s * 60000, rating });
  }
  return rows;
}
function buildTrace(profile) {
  let logs = [];
  for (const [wk, n, best] of profile) logs = logs.concat(quadWeek(wk, n, best));
  return logs;
}

describe('F6b V1 #10 — learnVolumeLandmarks', () => {
  it('learns nothing with too few weeks (< MIN_WEEKS+1) → prior (muscle absent)', () => {
    const logs = buildTrace([[0, 12, 100], [1, 12, 102]]);
    const learned = learnVolumeLandmarks(logs);
    expect(learned.quads).toBeUndefined();
  });

  it('plateau at N sets → learned MAV converges TOWARD ~N (junk volume detected)', () => {
    // Weeks 0-3 progress at 10 sets, then weeks 4-7 PLATEAU (flat 1RM) at 16 sets.
    // The flat forward-delta at 16 sets is "saturated" → personalMAV pulls toward 16,
    // i.e. AWAY from (above) the prior 14. EMA(0.3) from 14 toward 16.
    const logs = buildTrace([
      [0, 10, 100], [1, 10, 103], [2, 10, 106], [3, 10, 109],
      [4, 16, 110], [5, 16, 110], [6, 16, 110], [7, 16, 110],
    ]);
    const learned = learnVolumeLandmarks(logs);
    expect(learned.quads).toBeDefined();
    expect(learned.quads.mav).toBeGreaterThan(ISRAETEL_BASELINES.quads.MAV); // moved up toward the saturation set count
    expect(learned.quads.mav).toBeLessThan(16); // EMA — does not jump straight to the observed
  });

  it('regression at low volume → learned MEV RISES (under-dosing detected)', () => {
    // The muscle is trained at a LOW 4 sets/week and the 1RM DROPS each week (the dose
    // failed to even maintain) → personalMEV pulls UP toward 4 from the prior 8.
    const logs = buildTrace([
      [0, 4, 110], [1, 4, 108], [2, 4, 106], [3, 4, 104], [4, 4, 102], [5, 4, 100],
    ]);
    const learned = learnVolumeLandmarks(logs);
    expect(learned.quads).toBeDefined();
    // MEV moved DOWN from the prior 8 toward the regressed dose (4) — under-dose flagged.
    expect(learned.quads.mev).toBeLessThan(ISRAETEL_BASELINES.quads.MEV);
  });

  it('clamps the learned MAV to [0.6×, 1.6×] of the prior (no runaway)', () => {
    // An absurd plateau at a huge set count cannot push MAV past 1.6× the prior.
    const logs = buildTrace([
      [0, 10, 100], [1, 10, 103], [2, 10, 106], [3, 10, 109],
      [4, 40, 110], [5, 40, 110], [6, 40, 110], [7, 40, 110],
    ]);
    const learned = learnVolumeLandmarks(logs);
    const prior = ISRAETEL_BASELINES.quads.MAV;
    expect(learned.quads.mav).toBeLessThanOrEqual(prior * LEARNED_VOLUME_CLAMP_HI);
    expect(learned.quads.mav).toBeGreaterThanOrEqual(prior * LEARNED_VOLUME_CLAMP_LO);
  });

  it('EMA-continues a prior (slow — a converged value barely moves in one window)', () => {
    const logs = buildTrace([
      [0, 10, 100], [1, 10, 103], [2, 10, 106], [3, 10, 109],
      [4, 16, 110], [5, 16, 110], [6, 16, 110], [7, 16, 110],
    ]);
    const prior = { quads: { mev: 8, mav: 16, n: 5 } };
    const learned = learnVolumeLandmarks(logs, prior);
    // Started already at 16 (prior) → EMA toward the same 16 → stays ~16, not below.
    expect(learned.quads.mav).toBeGreaterThanOrEqual(15.5);
    expect(learned.quads.n).toBe(6);
  });

  it('effective-volume mode (V3 dose link) learns on a LOWER set weight when sets are in-reserve', () => {
    // Same raw set counts but all `usor` (RIR 3) → each set ≈ 0.4 effective sets, so the
    // effective weekly count is far below raw. The learned MAV reflects the SMALLER
    // delivered stimulus, so it lands lower than the raw-mode learn at the same logs.
    const profile = [
      [0, 10, 100], [1, 10, 103], [2, 10, 106], [3, 10, 109],
      [4, 16, 110], [5, 16, 110], [6, 16, 110], [7, 16, 110],
    ];
    let logs = [];
    for (const [wk, n, best] of profile) logs = logs.concat(quadWeek(wk, n, best, 'usor'));
    const raw = learnVolumeLandmarks(logs, undefined, { effective: false });
    const eff = learnVolumeLandmarks(logs, undefined, { effective: true });
    expect(eff.quads.mav).toBeLessThan(raw.quads.mav);
  });
});

describe('F6b V1 #10 — computeMuscleVolumeTarget off-byte-identical', () => {
  const base = {
    muscleGroup: 'quads',
    personaId: 'marius',
    goalId: 'hipertrofie',
    blockScaling: 1.0,
    phaseVolumeMul: 1.0,
  };

  it('WITHOUT `learned` → identical to today (static Israetel table)', () => {
    const today = computeMuscleVolumeTarget(base);
    expect(today.mav).toBe(ISRAETEL_BASELINES.quads.MAV);
    expect(today.mev).toBe(ISRAETEL_BASELINES.quads.MEV);
    expect(today.mrv).toBe(ISRAETEL_BASELINES.quads.MRV);
  });

  it('a muscle ABSENT from the learned map → `?? baseline` fallback = byte-identical', () => {
    const withEmpty = computeMuscleVolumeTarget({ ...base, learned: { chest: { mav: 20, mev: 10 } } });
    const today = computeMuscleVolumeTarget(base);
    expect(withEmpty.sets).toBe(today.sets);
    expect(withEmpty.mav).toBe(ISRAETEL_BASELINES.quads.MAV);
  });

  it('a learned MAV drives the target sets (path A change when present)', () => {
    // A learned MAV ABOVE the prior raises the target; the MRV cap still bounds it.
    const learned = { quads: { mav: ISRAETEL_BASELINES.quads.MAV + 4, mev: ISRAETEL_BASELINES.quads.MEV } };
    const out = computeMuscleVolumeTarget({ ...base, learned });
    const today = computeMuscleVolumeTarget(base);
    expect(out.sets).toBeGreaterThan(today.sets);
    expect(out.sets).toBeLessThanOrEqual(ISRAETEL_BASELINES.quads.MRV); // MRV hard cap holds
  });

  it('the MRV hard cap is never learned (a huge learned MAV still caps at MRV)', () => {
    const learned = { quads: { mav: 999, mev: ISRAETEL_BASELINES.quads.MEV } };
    const out = computeMuscleVolumeTarget({ ...base, learned });
    expect(out.sets).toBeLessThanOrEqual(ISRAETEL_BASELINES.quads.MRV);
  });
});
