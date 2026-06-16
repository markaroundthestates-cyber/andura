// ══ DP ENGINE — cycle-10 ladder-snap reconcile (clusters 1 & 2) ══════════════
//
// The GENERIC progression ladder (getNextWeight/getPrevWeight over EQUIPMENT_WEIGHTS)
// and the REAL pin-stack the FINAL rec snaps onto (roundToStep → realMachineStacks /
// user ladder, flags dp_real_ladder_snap_v1 + dp_user_ladder_v1, default ON) were
// misaligned, so:
//   C1 — an EASE-BACK down-step picked the next-lower GENERIC rung (Cable Row 42 → 40),
//        but 40 re-snaps UP to 42 on the real 6..90 stack → the ease silently no-ops
//        AND the note (frozen from the pre-snap 40, "coboram la 40 kg") contradicts the
//        prescribed 42. Re-introduced the Gigel P0 the ease-back fix (142c1c7c) killed.
//   C2 — the PR-FLOOR restored the proven load via roundToStep(floorW), re-snapping it
//        through the COARSE plate grid that craters it (squat 105 → 100, Barbell Row
//        115 → 110) — BELOW the demonstrated capacity the floor is meant to protect.
//
// Production-shaped inputs (non-round plate loads 102.5/115, reps 8-12, the REAL coarse
// rating→RPE literals usor=6.5/potrivit=7.5/greu=8.5, ISO-week-spaced sessions so no
// return-deload fires). Flags default ON (production). The behavior is gated behind
// dp_ladder_snap_reconcile_v1; toggling it OFF reproduces the pre-fix contradiction.

import { describe, it, expect, beforeEach, vi } from 'vitest';

/** @type {Record<string, any>} */
let store = {};
vi.mock('../../db.js', () => ({
  DB: {
    get: vi.fn((key) => (key in store ? store[key] : null)),
    set: vi.fn((key, val) => { store[key] = val; }),
  },
  tod: () => new Date().toISOString().slice(0, 10),
  cleanEx: (/** @type {string} */ s) => s.replace(/ pump$/, '').trim(),
}));

import { DP } from '../dp.js';
import { getPrevWeight } from '../../config/weights.js';

// REAL coarse cross-session rating→RPE map (workoutStore.logic.ts RATING_TO_RPE).
const RPE = { usor: 6.5, potrivit: 7.5, greu: 8.5 };
const NOW = Date.UTC(2026, 5, 15);
const WEEK = 7 * 86400000;

/** Seed `logs` newest-first under the EN engine key, ISO-week spaced (no gap deload). */
function seed(ex, rows) {
  store['logs'] = rows.map((r, i) => ({
    ex, w: r.w, reps: String(r.reps), rpe: r.rpe, ts: NOW - i * WEEK,
  }));
}

beforeEach(() => {
  store = {};
  store['phase-override'] = 'BULK';
  try { localStorage.clear(); } catch { /* jsdom always has it */ }
});

describe('C1 — ease-back lands on a REAL lower rung (no off-grid no-op + note match)', () => {
  it('Cable Row sustained greu below target eases to a real rung strictly below lastW', () => {
    // Cable Row real stack 6..90 by 6. lastW=42; the generic prev (40) re-snaps to 42.
    seed('Cable Row', [
      { w: 42, reps: 6, rpe: RPE.greu },
      { w: 42, reps: 6, rpe: RPE.greu },
      { w: 42, reps: 6, rpe: RPE.greu },
    ]);
    const r = DP.recommend('Cable Row', NOW);
    // It must actually LIGHTEN below the load the user struggled with — not hand back 42.
    expect(r.kg).toBeLessThan(42);
    // And the note's kg must MATCH the prescribed kg (no "coboram la 40" while kg=42).
    expect(r.progressionNote).toContain(`${r.kg} kg`);
  });

  it('OFF (pre-fix) the same case no-ops back onto the just-used load', () => {
    localStorage.setItem('_devFlags', JSON.stringify({ dp_ladder_snap_reconcile_v1: false }));
    seed('Cable Row', [
      { w: 42, reps: 6, rpe: RPE.greu },
      { w: 42, reps: 6, rpe: RPE.greu },
      { w: 42, reps: 6, rpe: RPE.greu },
    ]);
    const r = DP.recommend('Cable Row', NOW);
    // The defect: the snap collapsed the ease back onto 42 (the very load just rated greu).
    expect(r.kg).toBe(42);
  });
});

describe('C2 — PR-floor never restores BELOW demonstrated capacity on a coarse grid', () => {
  it('Barbell Row proven 115 (off the plate grid) is not cratered to 110', () => {
    // barbell_plates grid: ...105,110,120 — 115 is a real plate load (bar+2×20+2×7.5/side)
    // but roundToStep(115)=110. Proven at potrivit → a HOLD-class rec that the floor restores.
    seed('Barbell Row', [
      { w: 115, reps: 9, rpe: RPE.potrivit },
      { w: 115, reps: 9, rpe: RPE.potrivit },
      { w: 115, reps: 9, rpe: RPE.potrivit },
    ]);
    const r = DP.recommend('Barbell Row', NOW);
    expect(r.kg).toBeGreaterThanOrEqual(115); // never below demonstrated capacity
  });

  it('Barbell Bench proven 102.5 holds at-or-above proven (not snapped down to 100)', () => {
    // barbell_plates HAS 102.5; this guards the fine-grid case stays honest (no over-bump).
    seed('Flat Barbell Bench', [
      { w: 102.5, reps: 8, rpe: RPE.potrivit },
      { w: 102.5, reps: 8, rpe: RPE.potrivit },
      { w: 102.5, reps: 8, rpe: RPE.potrivit },
    ]);
    const r = DP.recommend('Flat Barbell Bench', NOW);
    expect(r.kg).toBeGreaterThanOrEqual(102.5);
  });

  it('OFF (pre-fix) the off-grid proven Barbell Row 115 is cratered below 115', () => {
    localStorage.setItem('_devFlags', JSON.stringify({ dp_ladder_snap_reconcile_v1: false }));
    seed('Barbell Row', [
      { w: 115, reps: 9, rpe: RPE.potrivit },
      { w: 115, reps: 9, rpe: RPE.potrivit },
      { w: 115, reps: 9, rpe: RPE.potrivit },
    ]);
    const r = DP.recommend('Barbell Row', NOW);
    expect(r.kg).toBeLessThan(115); // the defect: floor restored through the coarse grid
  });
});

describe('reconciliation does not over-fire on a real pin stack', () => {
  it('Cable Row mis-logged 56 (off the 6-step stack) snaps DOWN to a real rung, no up-bump', () => {
    // 56 is NOT a real rung on a 6..90 step-6 stack — a HOLD-class rec (CONSOLIDATE) must
    // snap to the real rung (54), NOT bump UP to 60 (the pin stack rungs ARE the physical
    // reality, so an off-rung log is a mis-log, not an off-grid genuine plate load). The
    // e1RM cluster is pinned OFF here so the path stays a true HOLD (potrivit below top);
    // with e1RM ON a top-reps history legitimately routes through CATCH UP (a real climb).
    localStorage.setItem('_devFlags', JSON.stringify({
      dp_e1rm_v1: false, dp_strength_kalman_v1: false, dp_base_lookback_v1: false,
    }));
    seed('Cable Row', [
      { w: 56, reps: 9, rpe: RPE.potrivit },
      { w: 56, reps: 9, rpe: RPE.potrivit },
      { w: 56, reps: 9, rpe: RPE.potrivit },
    ]);
    const r = DP.recommend('Cable Row', NOW);
    expect(r.kg).toBeLessThanOrEqual(56);
  });
});
