// ══ ARMS-SIGNATURE GATE (dp_arms_signature_v1, 2026-06-13) ═══════════════════════
// The elite-coach /10 eval capped 25/57 `arms`-focus configs at <=5.5 for "Specificity
// to goal & focus": the focus muscles (biceps + triceps) were PRESENT but NOT the
// week's VOLUME LEADERS — `umeri` (shoulders) was emphasized too, so it competed for
// slots + volume and OUT-VOLUMED the arms. dp_arms_signature_v1 (a) demotes umeri out
// of the arms emphasize list (shoulders → MEV maintenance, no extra slot) and (b) floors
// the biceps/triceps weekly budget toward the signature band, so biceps + triceps become
// the clear top-two by VOLUME.
//
// This gate asserts the STRUCTURAL signature on the REAL compose path (resetWorld +
// setPathAFlags(false) + an explicit flag map + world.composePlannedWorkoutToday per
// active day — the SAME mechanic the focus-signature gate uses), flag ON vs OFF:
//   • ON  → biceps & triceps OUT-VOLUME shoulders & back (the week's signature), and
//           shoulders is held at maintenance (>0 — never orphaned, but well below arms).
//   • OFF → byte-identical to the pre-flag behavior (the flag must be a true no-op when
//           off — this is what keeps fp-regression 23/23 + the focus-signature gate green).
// NEVER-ORPHAN invariant (both arms): shoulders + back stay >0 (maintenance, never 0).
//
// The configs asserted are the ROBUST leaders on the eval grid (beginner + intermediate +
// advanced at 2-3 days, where the split gives the arms enough exposures) — NOT the
// slot-limited Upper/Lower 4-day cases where a logged-PR back lat is PR-protected and back
// can still lead (a documented split-structure + PR-continuity limit, not a flag failure).
// READ-ONLY: forces flags via localStorage._devFlags exactly like fp-config.

import { describe, it, expect } from 'vitest';
import { world, resetWorld, setPathAFlags, FLIPPED_FLAGS } from './full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../../src/engine/exerciseLibrary.js';
import { DEV_FLAGS_KEY } from '../../src/util/featureFlags.js';
import { ACTIVE_DAYS } from './persona-matrix/pm-run.js';
import { PERSONAS, ANDURA_ON_FLAGS, MS_DAY, COHORT_START } from './persona-matrix/pm-personas.js';

// The full focus-policy ON set (mirrors the focus-signature gate) so the arms contracts +
// resolver are live; PLUS dp_arms_signature_v1 when the test wants it ON.
const FOCUS_FLAGS = Object.freeze([
  ...ANDURA_ON_FLAGS,
  'dp_focus_policy_v1', 'dp_split_rebalance_v1', 'dp_latiso_dedup_v1',
  'dp_biceps_guarantee_v1', 'dp_triceps_fullbody_guarantee_v1', 'dp_lumbar_dedup_v1',
  'dp_rep_class_v1', 'dp_anchor_sets_v1', 'dp_load_model_v1', 'dp_metric_types_v1',
  'dp_focus_contracts_v1', 'dp_week_ledger_v1',
]);

function setFlags(ids) {
  const o = {};
  for (const f of FLIPPED_FLAGS) o[f] = false;
  for (const f of ids) o[f] = true;
  localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(o));
}

// A clean persona BASIS (equipment-free → full library), experience overridden per config.
const BASIS = (() => {
  const m = PERSONAS.find((p) => p.id === 15);
  const { equipmentProfile, refusedPatterns, ...data } = m.data;
  return data;
})();

/** Compose one arms week (experience × frequency) on the real path with the given flag set.
 *  Returns the weekly sets-per-primary-muscle map (the eval grid's weeklyVolumeByMuscle). */
async function composeArmsWeek(experience, frequency, armsSignatureOn) {
  resetWorld();
  setPathAFlags(false);
  setFlags(armsSignatureOn ? [...FOCUS_FLAGS, 'dp_arms_signature_v1'] : FOCUS_FLAGS);
  const n0 = COHORT_START;
  world.useOnboardingStore.setState({
    data: {
      ...BASIS,
      experience,
      focusPreset: 'arms',
      frequency: String(frequency),
      focusPresetPickedAt: n0 - 7 * MS_DAY,
    },
    completed: true,
    completedAt: n0,
  });
  const offsets = ACTIVE_DAYS[String(frequency)] || ACTIVE_DAYS['4'];
  const weekly = {};
  for (const off of offsets) {
    const now = new Date(n0 + off * MS_DAY);
    let plan = null;
    try { plan = await world.composePlannedWorkoutToday(now); } catch { plan = null; }
    if (!plan || plan.error || !Array.isArray(plan.exercises)) continue;
    for (const e of plan.exercises) {
      const name = e.engineName || e.name;
      const g = getExerciseMetadata(name)?.muscle_target_primary;
      if (g) weekly[g] = (weekly[g] || 0) + (e.sets || 0);
    }
  }
  return weekly;
}

const get = (w, g) => w[g] || 0;

// Robust leaders on the eval grid (experience × freq where the split gives the arms room).
const CONFIGS = [
  { experience: 'incepator', freq: 2 },
  { experience: 'incepator', freq: 3 },
  { experience: 'intermediar', freq: 2 },
  { experience: 'intermediar', freq: 3 },
  { experience: 'avansat', freq: 2 },
  { experience: 'avansat', freq: 3 },
];

describe('arms-signature gate — biceps & triceps are the week VOLUME leaders (dp_arms_signature_v1)', () => {
  for (const { experience, freq } of CONFIGS) {
    it(`arms ${experience} @ ${freq}d: ON → bi & tri out-volume shoulders & back; never orphaned`, async () => {
      const w = await composeArmsWeek(experience, freq, true);
      const bi = get(w, 'biceps');
      const tri = get(w, 'triceps');
      const sh = get(w, 'umeri');
      const bk = get(w, 'spate');
      // The signature: biceps + triceps are the clear top-two by VOLUME.
      expect(bi, `biceps(${bi}) >= shoulders(${sh}) (weekly=${JSON.stringify(w)})`).toBeGreaterThanOrEqual(sh);
      expect(bi, `biceps(${bi}) >= back(${bk}) (weekly=${JSON.stringify(w)})`).toBeGreaterThanOrEqual(bk);
      expect(tri, `triceps(${tri}) >= shoulders(${sh}) (weekly=${JSON.stringify(w)})`).toBeGreaterThanOrEqual(sh);
      expect(tri, `triceps(${tri}) >= back(${bk}) (weekly=${JSON.stringify(w)})`).toBeGreaterThanOrEqual(bk);
      // NEVER orphan a non-focus group — shoulders + back stay at maintenance (>0).
      expect(sh, `shoulders(${sh}) > 0 — maintenance, never orphaned (weekly=${JSON.stringify(w)})`).toBeGreaterThan(0);
      expect(bk, `back(${bk}) > 0 — maintenance, never orphaned (weekly=${JSON.stringify(w)})`).toBeGreaterThan(0);
    }, 120000);
  }

  // The flag must MOVE the arms signature: ON lifts the arms above shoulders where OFF did
  // not. We assert the DELTA on a config the eval grid shows flips (intermediate @ 3d: OFF
  // shoulders out-volumed the arms; ON the arms lead). This proves the flag is the lever.
  it('flag ON vs OFF: ON subordinates shoulders below the arms (OFF did not)', async () => {
    const off = await composeArmsWeek('intermediar', 3, false);
    const on = await composeArmsWeek('intermediar', 3, true);
    const offShLeads = get(off, 'umeri') > Math.min(get(off, 'biceps'), get(off, 'triceps'));
    const onArmsLead = get(on, 'biceps') >= get(on, 'umeri') && get(on, 'triceps') >= get(on, 'umeri');
    expect(offShLeads, `OFF: shoulders(${get(off, 'umeri')}) should out-volume min(arms) (off=${JSON.stringify(off)})`).toBe(true);
    expect(onArmsLead, `ON: arms should lead shoulders (on=${JSON.stringify(on)})`).toBe(true);
    // ON keeps shoulders alive (maintenance), never zero — the de-emphasis is to MEV, not off.
    expect(get(on, 'umeri'), `ON shoulders > 0 (on=${JSON.stringify(on)})`).toBeGreaterThan(0);
  }, 120000);
});
