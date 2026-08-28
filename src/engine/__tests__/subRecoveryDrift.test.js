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
// "now" coherent with the fixtures below (sets span ts 1_000_000 .. +10 DAY) so
// the session-window age cutoff (dp_drift_session_window_v1: stale eras cannot
// vote) sees them as CURRENT data — these tests exercise aggregation, not age.
const NOW = 1_000_000 + 12 * DAY;

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
      NOW,
      e1rmFn,
    );
    expect(res.groups.length).toBeGreaterThanOrEqual(DRIFT_SYSTEMIC_GROUPS);
    expect(res.systemic).toBe(true);
    expect(res.severity).toBeGreaterThan(0);
  });

  it('single drifting exercise → exercise-local, NOT systemic', () => {
    const chest = sets(60, '10', [6.5, 7.5, 7.5, 8.5, 8.5, 8.5]);
    const res = detectSubRecoveryDrift({ 'Flat DB Press': chest }, NOW, e1rmFn);
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

// dp_drift_session_window_v1 (founder live 2026-08-28): the legacy per-SET read
// kept REACTIVE_AA latched from July through August off (a) months-old windows and
// (b) within-session fatigue. Real founder shapes below.
describe('dp_drift_session_window_v1 — age window + per-session aggregation', () => {
  const AUG28 = Date.UTC(2026, 7, 28, 7, 30);
  const S = (day, hour) => Date.UTC(2026, day[0], day[1], hour);
  const desc = (rows) => [...rows].sort((a, b) => b.ts - a.ts);

  it('a months-old window cannot vote a deload today (founder Flat DB Press, June-only rows)', () => {
    // Verbatim founder pattern: last trained 2026-06-05; the June session's greu
    // tail (sets 2-5 at 8.5) legacy-read as drift EVERY day after, forever.
    const june = desc([
      { w: 25, reps: '8', rpe: 7.5, ts: S([5, 1], 17), session: S([5, 1], 17) },
      { w: 27.5, reps: '8', rpe: 7.5, ts: S([5, 1], 17.5), session: S([5, 1], 17) },
      { w: 27.5, reps: '9', rpe: 7.5, ts: S([5, 5], 17), session: S([5, 5], 17) },
      { w: 30, reps: '10', rpe: 8.5, ts: S([5, 5], 17.2), session: S([5, 5], 17) },
      { w: 27.5, reps: '8', rpe: 8.5, ts: S([5, 5], 17.4), session: S([5, 5], 17) },
      { w: 27.5, reps: '7', rpe: 8.5, ts: S([5, 5], 17.6), session: S([5, 5], 17) },
      { w: 25, reps: '8', rpe: 8.5, ts: S([5, 5], 17.8), session: S([5, 5], 17) },
    ]);
    const v = detectExerciseDrift(june, 'Flat DB Press', e1rmFn, AUG28);
    expect(v.drift).toBe(false);
  });

  it('within-session fatigue (late greu at same kg) is NOT across-session drift', () => {
    // 3 recent sessions, each the SAME healthy shape: fresh sets potrivit, last set
    // greu with fewer reps. Per-session greu-share is FLAT (1/3 each) → no slope.
    const sess = (day) => [
      { w: 60, reps: '10', rpe: 7.5, ts: S(day, 17), session: S(day, 17) },
      { w: 60, reps: '9', rpe: 7.5, ts: S(day, 17.2), session: S(day, 17) },
      { w: 60, reps: '7', rpe: 8.5, ts: S(day, 17.4), session: S(day, 17) },
    ];
    const rows = desc([...sess([7, 20]), ...sess([7, 23]), ...sess([7, 26])]);
    const v = detectExerciseDrift(rows, 'Machine Shoulder Press', e1rmFn, AUG28);
    expect(v.drift).toBe(false);
  });

  it('ONE multi-head lift drifting is NOT systemic (founder Cable Row: mid_trap+lat)', () => {
    // Real founder shape (2026-08-10 window): only Cable Row drifts, but its
    // primary list spans 2 muscle heads — legacy called that "systemic" alone.
    const rows = desc([
      { w: 73, reps: '10', rpe: 7.5, ts: S([6, 30], 17), session: S([6, 30], 17) },
      { w: 73, reps: '9', rpe: 8.5, ts: S([6, 30], 17.2), session: S([6, 30], 17) },
      { w: 73, reps: '10', rpe: 7.5, ts: S([6, 31], 17), session: S([6, 31], 17) },
      { w: 73, reps: '9', rpe: 7.5, ts: S([6, 31], 17.2), session: S([6, 31], 17) },
      { w: 73, reps: '9', rpe: 8.5, ts: S([7, 7], 17), session: S([7, 7], 17) },
    ]);
    const res = detectSubRecoveryDrift({ 'Cable Row': rows }, Date.UTC(2026, 7, 10, 7, 30), e1rmFn);
    expect(res.systemic).toBe(false);
  });

  it('genuine sustained across-session drift STILL fires (greu share rising, reps held)', () => {
    const sess = (day, rpes) => rpes.map((rpe, i) => (
      { w: 60, reps: '10', rpe, ts: S(day, 17 + i * 0.2), session: S(day, 17) }
    ));
    const rows = desc([
      ...sess([7, 16], [7.5, 7.5, 7.5]),
      ...sess([7, 20], [7.5, 7.5, 8.5]),
      ...sess([7, 23], [8.5, 7.5, 8.5]),
      ...sess([7, 26], [8.5, 8.5, 8.5]),
    ]);
    const v = detectExerciseDrift(rows, 'Machine Shoulder Press', e1rmFn, AUG28);
    expect(v.ratingDrift).toBe(true);
    expect(v.drift).toBe(true);
  });
});
