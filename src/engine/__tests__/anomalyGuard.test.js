// ══ BUILD #5/A — anomaly / fat-finger guard tests (F4 spec §A) ═══════════════
// (1) Pure sanityCheckSet bounds: in-range OK, ×10 typo flagged with a /10
//     suggestion, reps>50 flagged, a strong-but-real load is NOT flagged.
// (2) THE POISON TEST (F4 §A acceptance): an UNCONFIRMED outlier mid-stream does
//     NOT move the calibration factor — the engine self-protects even if the value
//     reaches the in-session adjust path. A user-CONFIRMED outlier DOES flow.

import { describe, it, expect, beforeEach } from 'vitest';
import { sanityCheckSet, ANOMALY_BOUNDS } from '../dp/anomalyGuard.js';
import { DP } from '../dp.js';
import { DB } from '../../db.js';

describe('sanityCheckSet — pure bounds', () => {
  it('an in-range working load is OK (no confirm)', () => {
    const r = sanityCheckSet({ ex: 'Lat Pulldown', w: 60, reps: 10, lastLoggedW: 55, maxKg: 120 });
    expect(r.ok).toBe(true);
    expect(r.suspectKind).toBe(null);
  });

  it('a ×10 fat-finger over the last logged load is flagged with a /10 suggestion', () => {
    // 95 → 950 (the live "9590" class). lastLoggedW reference trips the jump bound.
    const r = sanityCheckSet({ ex: 'Lat Pulldown', w: 950, reps: 10, lastLoggedW: 95, maxKg: 120 });
    expect(r.ok).toBe(false);
    expect(r.suspectKind).toBe('weight_jump');
    expect(r.field).toBe('weight');
    expect(r.suggested).toBe(95); // offer the last real load back
  });

  it('a load past the physical ceiling (no prior log) is flagged via the ceiling bound', () => {
    // bw 80kg → Lat Pulldown elite ceiling ~ 1.6×80 ≈ 128 e1RM × 1.3 ≈ 166. 950 ≫ that.
    const r = sanityCheckSet({ ex: 'Lat Pulldown', w: 950, reps: 10, lastLoggedW: null, maxKg: 120, bwKg: 80, sex: 'm' });
    expect(r.ok).toBe(false);
    expect(r.suspectKind).toBe('weight_ceiling');
    expect(r.suggested).toBe(95); // /10 de-type lands back under the cap
  });

  it('falls back to MAX_KG × ratio when no bodyweight is known', () => {
    const r = sanityCheckSet({ ex: 'Lat Pulldown', w: 300, reps: 10, lastLoggedW: null, maxKg: 120 });
    expect(r.ok).toBe(false); // 300 > 120 × 1.5
    expect(r.suspectKind).toBe('weight_ceiling');
  });

  it('reps > 50 are flagged', () => {
    const r = sanityCheckSet({ ex: 'Lat Pulldown', w: 60, reps: 100, lastLoggedW: 60 });
    expect(r.ok).toBe(false);
    expect(r.suspectKind).toBe('reps_high');
    expect(r.field).toBe('reps');
  });

  it('a strong-but-real heavy load is NOT flagged (no false positive)', () => {
    // 150kg squat for a 100kg lifter — heavy but physically real. No prior-log jump,
    // well under the elite ceiling × 1.3 → must pass clean.
    const r = sanityCheckSet({ ex: 'Barbell Back Squat (High Bar)', w: 150, reps: 5, lastLoggedW: 140, maxKg: 320, bwKg: 100, sex: 'm' });
    expect(r.ok).toBe(true);
  });

  it('bounds are exported as tunable constants (Daniel knob)', () => {
    expect(ANOMALY_BOUNDS.JUMP_RATIO).toBe(4);
    expect(ANOMALY_BOUNDS.REPS_MAX).toBe(50);
  });
});

describe('POISON TEST — an unconfirmed outlier never moves calibration (F4 §A)', () => {
  const EX = 'Lat Pulldown';
  beforeEach(() => {
    localStorage.clear();
    // Seed prior history so dpState.lastW is a real ~60kg working load.
    const base = Date.UTC(2026, 0, 1);
    DB.set('logs', [
      { ex: EX, w: 60, reps: 10, rpe: 7.5, ts: base + 3 * 86400000 },
      { ex: EX, w: 60, reps: 10, rpe: 7.5, ts: base + 2 * 86400000 },
      { ex: EX, w: 55, reps: 10, rpe: 7.5, ts: base + 1 * 86400000 },
    ]);
  });

  function calFactor() {
    const f = /** @type {any} */ (DB.get('dp-cal-factors')) || {};
    return f[EX] ? f[EX].kgFactor : null;
  }

  it('an UNCONFIRMED 10× outlier set leaves dp-cal-factors untouched', () => {
    expect(calFactor()).toBe(null);
    // recKg ~60 (the prescription), but the user logs a 600 fat-finger, rated potrivit.
    DP.checkInSessionAdjust(EX, [7.5], [10], {
      recKg: 60, recReps: 10, loggedKg: 600, setIdx: 1, nowMs: Date.UTC(2026, 0, 5),
      // userConfirmed omitted → unconfirmed
    });
    // The calibration factor must NOT have learned from the 10× outlier.
    expect(calFactor()).toBe(null);
  });

  it('a CONFIRMED outlier DOES flow to calibration (never silently dropped)', () => {
    DP.checkInSessionAdjust(EX, [7.5], [10], {
      recKg: 60, recReps: 10, loggedKg: 600, setIdx: 1, nowMs: Date.UTC(2026, 0, 5),
      userConfirmed: true,
    });
    // Confirmed → calibration learned (factor written, clamped).
    expect(calFactor()).not.toBe(null);
  });

  it('an in-range set still calibrates normally (guard is inert in-range)', () => {
    DP.checkInSessionAdjust(EX, [7.5], [10], {
      recKg: 60, recReps: 10, loggedKg: 65, setIdx: 1, nowMs: Date.UTC(2026, 0, 5),
    });
    expect(calFactor()).not.toBe(null);
  });
});
