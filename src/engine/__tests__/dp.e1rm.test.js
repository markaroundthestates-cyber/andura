// ══ BUILD #1 — e1RM substrate (F3 spec §1) unit tests ═══════════════════════
// Pure RIR-corrected Epley e1RM. Uses the REAL per-set rating→rpe literals the
// app stores (workoutStore RATING_TO_RPE: usor 6.5 / potrivit 7.5 / greu 8.5) —
// NOT round comfort numbers — so a green test means the live rating path works.

import { describe, it, expect } from 'vitest';
import { DP } from '../dp.js';

const RPE = { usor: 6.5, potrivit: 7.5, greu: 8.5 };

describe('DP.e1RMForSet — RIR-corrected saturated Epley', () => {
  it('maps the 3 real rating literals to the conservative RIR map (3/1/0)', () => {
    // usor → RIR 3, potrivit → RIR 1, greu → RIR 0 on the same load+reps.
    const w = 60, reps = 8;
    const usor = DP.e1RMForSet(w, reps, RPE.usor);
    const potrivit = DP.e1RMForSet(w, reps, RPE.potrivit);
    const greu = DP.e1RMForSet(w, reps, RPE.greu);
    // Epley W·(1 + (reps+RIR)/30): usor R_eff=11, potrivit R_eff=9, greu R_eff=8.
    expect(usor).toBeCloseTo(60 * (1 + 11 / 30), 6);
    expect(potrivit).toBeCloseTo(60 * (1 + 9 / 30), 6);
    expect(greu).toBeCloseTo(60 * (1 + 8 / 30), 6);
    // More reserve → higher estimated 1RM (the set was further from failure).
    expect(usor).toBeGreaterThan(potrivit);
    expect(potrivit).toBeGreaterThan(greu);
  });

  it('saturates EFFECTIVE reps at R_CAP=12 (Daniel high-rep zone)', () => {
    // 15 reps usor → R_eff would be 18, clamped to 12. 13 reps greu → R_eff 13→12.
    const a = DP.e1RMForSet(20, 15, RPE.usor);
    const b = DP.e1RMForSet(20, 18, RPE.usor); // even more reps, same clamp
    expect(a).toBeCloseTo(20 * (1 + 12 / 30), 6);
    expect(b).toBeCloseTo(20 * (1 + 12 / 30), 6); // identical — both clamped
    // A 12-rep greu (R_eff 12) sits exactly at the cap, equal to the clamped 15×usor.
    const c = DP.e1RMForSet(20, 12, RPE.greu);
    expect(c).toBeCloseTo(20 * (1 + 12 / 30), 6);
  });

  it('a legacy/absent rpe defaults to potrivit-equivalent RIR 1', () => {
    const def = DP.e1RMForSet(50, 10, undefined);
    const potrivit = DP.e1RMForSet(50, 10, RPE.potrivit);
    expect(def).toBeCloseTo(potrivit, 6);
  });

  it('returns null for unusable load/reps (→ caller falls to raw kg)', () => {
    expect(DP.e1RMForSet(0, 10, RPE.potrivit)).toBeNull();
    expect(DP.e1RMForSet(50, 0, RPE.potrivit)).toBeNull();
    expect(DP.e1RMForSet(NaN, 10, RPE.potrivit)).toBeNull();
  });
});

describe('DP._kgFromE1RM — back-solve to a working load', () => {
  it('round-trips an e1RM at a fixed rep target (within-band identity)', () => {
    // A potrivit set at 60×8 has e1RM 60·(1+9/30). Back-solving at rep target 8
    // (potrivit RIR 1 → R_eff 9) returns exactly 60 kg — the within-band invariant.
    const e = DP.e1RMForSet(60, 8, RPE.potrivit);
    expect(DP._kgFromE1RM(e, 8)).toBeCloseTo(60, 6);
  });

  it('cross-rep-scheme: a 60×12 potrivit out-floors a 62.5×8 potrivit', () => {
    // The B_…md §6.1 defect: raw kg discards high-rep work. In e1RM space the
    // higher-rep set carries the higher 1RM estimate.
    const hi = DP.e1RMForSet(60, 12, RPE.potrivit);  // R_eff 12 (capped) → big
    const lo = DP.e1RMForSet(62.5, 8, RPE.potrivit); // R_eff 9
    expect(hi).toBeGreaterThan(lo);
  });
});

describe('DP._rirFromRpe / _e1rmEligible', () => {
  it('buckets the real rating literals', () => {
    expect(DP._rirFromRpe(RPE.usor)).toBe(3);
    expect(DP._rirFromRpe(RPE.potrivit)).toBe(1);
    expect(DP._rirFromRpe(RPE.greu)).toBe(0);
  });

  it('excludes bodyweight/band exercises from e1RM', () => {
    // Pull-up is a bodyweight CORE_AUTO — no clean external-load e1RM.
    expect(DP._e1rmEligible('Pull-up')).toBe(false);
    // A loaded machine/barbell lift is eligible.
    expect(DP._e1rmEligible('Leg Press')).toBe(true);
  });
});
