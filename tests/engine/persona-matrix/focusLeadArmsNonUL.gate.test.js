// ══ ARMS focus-lead on NON-U/L splits — dp_focus_lead_arms_nonul_v1 (2026-06-15) ══
//
// dp_focus_lead_splits_v1 makes the ARMS focus lead the week (a) by trimming the
// non-focus major groups toward their MEV and (b) by guaranteeing a 2nd direct-arm
// slot on the upper days — but its scope guard fires ONLY on a PURE upper/lower
// split. A 4-day arms split (['upper','lower','upper','lower']) is pure U/L → it
// fires; a 5-day arms split (['upper','lower','push','pull','legs']) is NOT pure
// U/L → focusLeadSplits returns null → back/chest/legs run full while bi/tri ride
// leftover slots (the same defect the trim was built to fix). The 5-day push/pull/
// legs split STILL gives the arms no day of their own, so the trim is appropriate.
//
// dp_focus_lead_arms_nonul_v1 relaxes the scope FOR ARMS ONLY so the SAME trim +
// arm-slot guarantee also fire when the split has no dedicated arm/full day (covers
// the 5-day case). This gate proves:
//   - OFF → the 5-day arms week is BYTE-IDENTICAL to today (only pure-U/L fires);
//   - ON  → the 5-day arms week trims the non-focus majors toward MEV, the arms get
//           their guaranteed slots, and the arms LEAD the week;
//   - 4-day arms (already pure-U/L) is BYTE-IDENTICAL with the flag ON (only the
//     5-day-style arms config changes);
//   - every NON-arms focus is BYTE-IDENTICAL with the flag ON.
//
// METHODOLOGY (house rule "test real values"): composes through the REAL compose
// path (resetWorld + setPathAFlags(false) + an explicit ON flag map +
// world.composePlannedWorkoutToday per active day), exactly like the
// focus-signature gate. READ-ONLY: forces flags via localStorage._devFlags; no
// engine change. The MEV numbers asserted are the REAL ISRAETEL_BASELINES.

import { describe, it, expect } from 'vitest';
import { world, resetWorld, setPathAFlags, FLIPPED_FLAGS } from '../full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../../../src/engine/exerciseLibrary.js';
import { DEV_FLAGS_KEY } from '../../../src/util/featureFlags.js';
import { ACTIVE_DAYS } from './pm-run.js';
import { PERSONAS, ANDURA_ON_FLAGS, MS_DAY, COHORT_START } from './pm-personas.js';

// Real production MEV values (src/engine/periodization/constants.js ISRAETEL_BASELINES):
// chest 8 / back 10 / shoulders 8 / quads 8 / hamstrings 6 / glutes 6.
const MEV = Object.freeze({
  piept: 8, spate: 10, umeri: 8,
  'picioare-quads': 8, 'picioare-hamstrings': 6, fese: 6,
});

// The full focus-policy ON set (same composition flags the focus-signature gate
// uses) PLUS dp_focus_lead_splits_v1 (the base trim must be ON for the relaxation
// to have anything to extend). dp_focus_lead_arms_nonul_v1 is toggled per-arm.
const BASE_ON = Object.freeze([
  ...ANDURA_ON_FLAGS,
  'dp_focus_policy_v1', 'dp_split_rebalance_v1', 'dp_latiso_dedup_v1',
  'dp_biceps_guarantee_v1', 'dp_lumbar_dedup_v1', 'dp_rep_class_v1',
  'dp_anchor_sets_v1', 'dp_load_model_v1', 'dp_metric_types_v1',
  'dp_focus_contracts_v1', 'dp_week_ledger_v1', 'dp_arms_signature_v1',
  'dp_focus_lead_splits_v1',
]);

// All flags off (FLIPPED_FLAGS base) then the listed ids ON — the SAME mechanic
// the focus-signature + persona-matrix gates use, so the OFF arm is a true off arm.
function setFlags(ids) {
  const o = {};
  for (const f of FLIPPED_FLAGS) o[f] = false;
  for (const f of ids) o[f] = true;
  localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(o));
}

// Fresh intermediate male, mass goal, equipment-free (full library) — the same
// BASIS the focus-signature gate uses, so the only variable is focus × frequency.
const BASIS = (() => {
  const m = PERSONAS.find((p) => p.id === 15);
  const { equipmentProfile, refusedPatterns, ...data } = m.data;
  return data;
})();

/**
 * Compose one focus × frequency week through the REAL path with an EXPLICIT flag
 * set. Returns a per-day breakdown (name + sets + primary group, in order) for the
 * byte-identical comparisons + a weekly per-group set aggregate for the ON asserts.
 */
async function composeWeek(focusPreset, frequency, flagIds) {
  resetWorld();
  setPathAFlags(false);
  setFlags(flagIds);
  const n0 = COHORT_START;
  world.useOnboardingStore.setState({
    data: {
      ...BASIS,
      focusPreset,
      frequency: String(frequency),
      focusPresetPickedAt: focusPreset && focusPreset !== 'balanced' ? n0 - 7 * MS_DAY : null,
    },
    completed: true,
    completedAt: n0,
  });
  const offsets = ACTIVE_DAYS[String(frequency)] || ACTIVE_DAYS['4'];
  const days = [];
  const weekly = {};
  for (const off of offsets) {
    const now = new Date(n0 + off * MS_DAY);
    let plan = null;
    try { plan = await world.composePlannedWorkoutToday(now); } catch { plan = null; }
    if (!plan || plan.error) { days.push({ off, rest: true, rows: [] }); continue; }
    const rows = [];
    for (const e of plan.exercises || []) {
      const name = e.engineName || e.name;
      const sets = e.sets || 0;
      const g = getExerciseMetadata(name)?.muscle_target_primary;
      weekly[g] = (weekly[g] || 0) + sets;
      rows.push({ name, sets, primary: g });
    }
    days.push({ off, rest: false, sessionType: plan.sessionType, rows });
  }
  return { focusPreset, frequency, days, weekly };
}

// The composition fingerprint used for byte-identical comparisons: per active day,
// the ordered [name, sets] pairs. Identical fingerprint ⇒ byte-identical session.
function fingerprint(w) {
  return w.days
    .filter((d) => !d.rest)
    .map((d) => `${d.sessionType}|${d.rows.map((r) => `${r.name}:${r.sets}`).join(',')}`)
    .join(' || ');
}
const setsForGroup = (w, g) => w.weekly[g] || 0;

const NON_ARMS_FOCUSES = ['balanced', 'v-taper', 'chest', 'shoulders', 'back', 'upper', 'lower'];

describe('dp_focus_lead_arms_nonul_v1 — arms focus-lead on NON-U/L splits', () => {
  // ── 5-day arms (['upper','lower','push','pull','legs']) is the relaxation target ──

  it('5-day arms OFF: the new flag is inert → today\'s exact behavior (non-focus majors NOT all at MEV)', async () => {
    // With the relaxation OFF, the 5-day arms split is not pure U/L → focusLeadSplits is
    // null → at least one non-focus major over-delivers above its MEV (the documented gap).
    const off = await composeWeek('arms', 5, BASE_ON);
    const overMev = [...Object.keys(MEV)].some((g) => setsForGroup(off, g) > MEV[g]);
    expect(overMev, `no non-focus major over MEV OFF (weekly=${JSON.stringify(off.weekly)})`).toBe(true);
  });

  it('5-day arms OFF vs ON: only the 5-day arms week MOVES (ON differs from OFF)', async () => {
    const off = await composeWeek('arms', 5, BASE_ON);
    const on = await composeWeek('arms', 5, [...BASE_ON, 'dp_focus_lead_arms_nonul_v1']);
    expect(fingerprint(on), 'ON should change the 5-day arms week').not.toBe(fingerprint(off));
  });

  it('5-day arms ON: every non-focus major is capped to MEV on EACH day it is trained (+1 tol)', async () => {
    // The per-cluster trim bounds each non-focus major's PER-SESSION delivered sets toward
    // floor(MEV/sessions) (never below the per-exercise MEV 2 → slot-preserving). A group
    // that trains on 2 clusters still sums to ~2×MEV/2 = MEV per day → on no single day does
    // a non-focus major exceed its MEV ceiling (the maintenance dose). +1 set granularity tol.
    const on = await composeWeek('arms', 5, [...BASE_ON, 'dp_focus_lead_arms_nonul_v1']);
    for (const d of on.days.filter((x) => !x.rest)) {
      const perGroup = {};
      for (const r of d.rows) perGroup[r.primary] = (perGroup[r.primary] || 0) + r.sets;
      for (const g of Object.keys(MEV)) {
        const v = perGroup[g] || 0;
        expect(v, `${g} over MEV ${MEV[g]} on ${d.sessionType} (rows=${JSON.stringify(perGroup)})`)
          .toBeLessThanOrEqual(MEV[g] + 1);
      }
    }
  });

  it('5-day arms ON: the trim actually fired — at least one non-focus major is reduced vs OFF', async () => {
    // Slot-preserving means a group already at its per-exercise floor cannot drop further,
    // but the over-delivering majors (the defect) DO fall. The trim is observable as a net
    // reduction across the non-focus majors vs the flag-OFF (today's) delivery.
    const off = await composeWeek('arms', 5, BASE_ON);
    const on = await composeWeek('arms', 5, [...BASE_ON, 'dp_focus_lead_arms_nonul_v1']);
    const offTotal = Object.keys(MEV).reduce((n, g) => n + setsForGroup(off, g), 0);
    const onTotal = Object.keys(MEV).reduce((n, g) => n + setsForGroup(on, g), 0);
    expect(onTotal, `non-focus majors not trimmed (off ${offTotal} → on ${onTotal})`).toBeLessThan(offTotal);
  });

  it('5-day arms ON: the arms LEAD — bi+tri exceed every non-arm major', async () => {
    const on = await composeWeek('arms', 5, [...BASE_ON, 'dp_focus_lead_arms_nonul_v1']);
    const arms = setsForGroup(on, 'biceps') + setsForGroup(on, 'triceps');
    const topNonArm = Math.max(...Object.keys(MEV).map((g) => setsForGroup(on, g)));
    expect(arms, `arms ${arms} lead top non-arm ${topNonArm} (weekly=${JSON.stringify(on.weekly)})`)
      .toBeGreaterThan(topNonArm);
  });

  it('5-day arms ON: both biceps & triceps are present and floored (each ≥ MEV-ish)', async () => {
    const on = await composeWeek('arms', 5, [...BASE_ON, 'dp_focus_lead_arms_nonul_v1']);
    // The arm-slot guarantee + arm floor ensure direct bi/tri are present and dosed, not
    // a single leftover slot. Real intermediate budget → each clears a maintenance dose.
    expect(setsForGroup(on, 'biceps'), `biceps weekly (weekly=${JSON.stringify(on.weekly)})`).toBeGreaterThanOrEqual(6);
    expect(setsForGroup(on, 'triceps'), `triceps weekly (weekly=${JSON.stringify(on.weekly)})`).toBeGreaterThanOrEqual(6);
  });

  it('5-day arms ON: no non-focus major is orphaned (still trained, never zeroed)', async () => {
    const off = await composeWeek('arms', 5, BASE_ON);
    const on = await composeWeek('arms', 5, [...BASE_ON, 'dp_focus_lead_arms_nonul_v1']);
    for (const g of Object.keys(MEV)) {
      if (setsForGroup(off, g) > 0) {
        expect(setsForGroup(on, g), `${g} orphaned (weekly=${JSON.stringify(on.weekly)})`).toBeGreaterThan(0);
      }
    }
  });

  // ── 4-day arms (pure U/L) already fires today → the flag must NOT move it ──
  it('4-day arms: BYTE-IDENTICAL with the flag ON (pure U/L already fired)', async () => {
    const off = await composeWeek('arms', 4, BASE_ON);
    const on = await composeWeek('arms', 4, [...BASE_ON, 'dp_focus_lead_arms_nonul_v1']);
    expect(fingerprint(on)).toBe(fingerprint(off));
  });

  // ── every NON-arms focus is untouched at every frequency ──
  for (const focus of NON_ARMS_FOCUSES) {
    for (const freq of [4, 5]) {
      it(`${focus} @ ${freq}d: BYTE-IDENTICAL with the flag ON (relaxation is arms-scoped)`, async () => {
        const off = await composeWeek(focus, freq, BASE_ON);
        const on = await composeWeek(focus, freq, [...BASE_ON, 'dp_focus_lead_arms_nonul_v1']);
        expect(fingerprint(on)).toBe(fingerprint(off));
      }, 120000);
    }
  }
});
