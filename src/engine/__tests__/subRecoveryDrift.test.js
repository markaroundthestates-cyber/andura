// ══ BUILD F6a #26 — sub-recovery drift detector tests (F6a spec §1e) ═════════
// PURE detector over matched-load set logs. Real rating literals (6.5/7.5/8.5 =
// usor/potrivit/greu). Asserts:
//   - no-false-positive: steady potrivit at fixed load → no drift, no systemic.
//   - early-catch: greu-share climbing at fixed load → drift; >=2 groups → systemic.
//   - reactive non-overlap: a single failed-short set is NOT systemic drift.
//   - e1RM degrade: rating-drift fires with no e1rmFn (dp_e1rm_v1 OFF path).

import { describe, it, expect } from 'vitest';
import {
  detectExerciseDrift,
  detectSubRecoveryDrift,
  DRIFT_SYSTEMIC_GROUPS,
} from '../dp/subRecoveryDrift.js';
import { DP } from '../dp.js';

const e1rmFn = (w, reps, rpe, ex) => DP.e1RMForSet(w, reps, rpe, ex);
const DAY = 86400000;

// Build N newest-first sets at a fixed load, with a per-index rpe (the real
// 6.5/7.5/8.5 literals) and reps. `rpes` is oldest-first → reversed to newest.
function sets(w, reps, rpes) {
  const oldestFirst = rpes.map((rpe, i) => ({ w, reps, rpe, ts: 1_000_000 + i * 2 * DAY }));
  return oldestFirst.reverse(); // newest-first (as DP.getLogs returns)
}

describe('F6a #26 sub-recovery drift', () => {
  it('steady potrivit at fixed load → no drift (no false positive)', () => {
    const logs = sets(60, '10', [7.5, 7.5, 7.5, 7.5, 7.5, 7.5]);
    const v = detectExerciseDrift(logs, 'Flat DB Press', e1rmFn);
    expect(v.drift).toBe(false);
    expect(v.ratingDrift).toBe(false);
  });

  it('greu-share climbing at fixed load + reps held → rating drift', () => {
    // usor→potrivit→greu creeping up at the SAME 60kg, reps stay ~10.
    const logs = sets(60, '10', [6.5, 7.5, 7.5, 8.5, 8.5, 8.5]);
    const v = detectExerciseDrift(logs, 'Flat DB Press', e1rmFn);
    expect(v.drift).toBe(true);
    expect(v.ratingDrift).toBe(true);
    expect(v.groups).toContain('chest_mid');
  });

  it('two muscle groups drifting at once → systemic', () => {
    const chest = sets(60, '10', [6.5, 7.5, 7.5, 8.5, 8.5, 8.5]);
    const quad = sets(120, '10', [6.5, 7.5, 7.5, 8.5, 8.5, 8.5]);
    const res = detectSubRecoveryDrift(
      { 'Flat DB Press': chest, 'Leg Extension': quad },
      Date.now(),
      e1rmFn,
    );
    expect(res.groups.length).toBeGreaterThanOrEqual(DRIFT_SYSTEMIC_GROUPS);
    expect(res.systemic).toBe(true);
    expect(res.severity).toBeGreaterThan(0);
  });

  it('single drifting exercise → exercise-local, NOT systemic', () => {
    const chest = sets(60, '10', [6.5, 7.5, 7.5, 8.5, 8.5, 8.5]);
    const res = detectSubRecoveryDrift({ 'Flat DB Press': chest }, Date.now(), e1rmFn);
    expect(res.exercises).toContain('Flat DB Press');
    expect(res.systemic).toBe(false);
  });

  it('a single failed-short overload set is NOT misclassified as systemic drift', () => {
    // Stable potrivit, then ONE greu set where reps collapsed (an overload set the
    // reactive EASE-BACK owns) — reps-held guard suppresses the drift flag.
    const logs = [
      { w: 60, reps: '5', rpe: 8.5, ts: 1_000_000 + 10 * DAY }, // newest: failed-short
      { w: 60, reps: '10', rpe: 7.5, ts: 1_000_000 + 8 * DAY },
      { w: 60, reps: '10', rpe: 7.5, ts: 1_000_000 + 6 * DAY },
      { w: 60, reps: '10', rpe: 7.5, ts: 1_000_000 + 4 * DAY },
      { w: 60, reps: '10', rpe: 7.5, ts: 1_000_000 + 2 * DAY },
    ];
    const v = detectExerciseDrift(logs, 'Flat DB Press', e1rmFn);
    expect(v.drift).toBe(false);
  });

  it('rating-drift fires WITHOUT the e1rm fn (dp_e1rm_v1 OFF degrade path)', () => {
    const logs = sets(60, '10', [6.5, 7.5, 7.5, 8.5, 8.5, 8.5]);
    const v = detectExerciseDrift(logs, 'Flat DB Press', null);
    expect(v.ratingDrift).toBe(true);
    expect(v.e1rmDrift).toBe(false);
    expect(v.drift).toBe(true);
  });
});
