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

// ── Cycle-9 cluster 1 — learned-volume inversions (LV-1/LV-2/LV-3) ──
// A week of `nSets` Leg Extension sets at a real working load (non-round) + real
// rating literals + ISO-week spacing — production-shaped, NOT the round helper above.
function quadWeekW(wk, nSets, topW, reps, rating = 'potrivit') {
  const rows = [];
  const ts = T0 + wk * MS_WEEK;
  for (let s = 0; s < nSets; s++) {
    rows.push({ ex: 'Leg Extension', w: topW, reps, ts: ts + s * 61000, rating });
  }
  return rows;
}
function buildW(profile) {
  let logs = [];
  let wk = 0;
  for (const [n, w, r, rating] of profile) { logs = logs.concat(quadWeekW(wk, n, w, r, rating)); wk++; }
  return logs;
}

describe('cycle9 cluster1 — learned-volume inversions', () => {
  const FIX = { fixInversions: true }; // dp_learned_volume_fix_v1 ON (ships to users)

  it('LV-3 — inserting recommended DELOAD weeks yields byte-identical landmarks', () => {
    // Advanced lifter plateaus at 14 sets (flat 1RM) across the block. The training
    // weeks are identical; the only difference is a scheduled deload (volume -45% ->
    // 7 sets, intensity -12.5% -> lighter 67.5kg) inserted mid-block.
    const noDeload = [
      [14, 82.5, 8], [14, 82.5, 8], [14, 82.5, 8], [14, 82.5, 8], [14, 82.5, 8], [14, 82.5, 8],
    ];
    const withDeload = [
      [14, 82.5, 8], [14, 82.5, 8], [14, 82.5, 8],
      [7, 67.5, 10, 'usor'],   // DELOAD inserted (fewer sets + lighter by design)
      [14, 82.5, 8], [14, 82.5, 8], [14, 82.5, 8],
    ];
    const base = learnVolumeLandmarks(buildW(noDeload), undefined, FIX).quads;
    const variant = learnVolumeLandmarks(buildW(withDeload), undefined, FIX).quads;
    // Both learn the SAME band — the deload does not manufacture a spurious signal.
    expect(variant).toEqual(base);
    // Flag OFF (pre-fix) — the deload DID move the landmark (the defect this proves).
    const variantOff = learnVolumeLandmarks(buildW(withDeload)).quads;
    expect(variantOff).not.toEqual(base);
  });

  it('LV-2 — a plateau-then-DELOAD advanced lifter keeps MAV ~14 (no collapse to 8)', () => {
    // Plateau at 14 (flat 1RM), then a deload at 8 sets / lighter load. Pre-fix the
    // deload-8 week read as a "stalled" point and Math.min dragged MAV down to ~8.
    const logs = buildW([
      [14, 82.5, 8], [14, 82.5, 8], [14, 82.5, 8], [14, 82.5, 8],
      [8, 70.0, 8, 'usor'],   // deload at low dose
      [14, 82.5, 8], [14, 82.5, 8],
    ]);
    const learned = learnVolumeLandmarks(logs, undefined, FIX).quads;
    expect(learned).toBeDefined();
    // MAV stays near the prior plateau dose, never collapses toward MEV (8): the
    // deload-8 week is excluded (LV-3) and a NEGATIVE/low delta is no longer counted
    // as a "stalled" saturation point (LV-2).
    expect(learned.mav).toBeGreaterThanOrEqual(13);
  });

  it('LV-1 — a regression at HIGH dose (over-reaching) does NOT inflate MEV', () => {
    // Good progress at a moderate 8 sets, then the 1RM REGRESSES while volume is
    // PUSHED to 16 sets (over-reaching). A drop at high volume is over-reaching, not
    // under-dosing — MEV must stay at the prior 8, never rise toward 16.
    const logs = buildW([
      [8, 57.5, 12], [8, 60.0, 11], [8, 62.5, 10],
      [16, 62.5, 10], [16, 60.0, 10], [16, 57.5, 10],
    ]);
    const learned = learnVolumeLandmarks(logs, undefined, FIX).quads;
    expect(learned).toBeDefined();
    // MEV is NOT dragged up by the high-dose regression (pre-fix Math.max(...regressed)
    // = 16 inflated it toward 16; now only low-dose regressions, Math.min).
    expect(learned.mev).toBeLessThanOrEqual(ISRAETEL_BASELINES.quads.MEV);
    // Pre-fix (flag OFF) the same history INFLATED MEV above the prior.
    const off = learnVolumeLandmarks(logs).quads;
    expect(off.mev).toBeGreaterThan(ISRAETEL_BASELINES.quads.MEV);
  });

  it('LV-1 — a genuine LOW-dose regression still RAISES MEV (under-dosing preserved)', () => {
    // The muscle is trained at a LOW 4 sets and the 1RM DROPS each week → real
    // under-dosing → MEV must move DOWN toward 4 from the prior 8 (the legit signal).
    const logs = buildW([
      [4, 72.5, 9], [4, 70.0, 9], [4, 67.5, 9], [4, 65.0, 9], [4, 62.5, 9], [4, 60.0, 9],
    ]);
    const learned = learnVolumeLandmarks(logs, undefined, FIX).quads;
    expect(learned).toBeDefined();
    expect(learned.mev).toBeLessThan(ISRAETEL_BASELINES.quads.MEV);
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
