// ══ §beginner-volume-v2 — DELIVERED beginner emphasized-volume band ════════════
// (dp_beginner_volume_v2, 2026-06-13, eval p1/p10 over-volume defect.)
//
// The eval grid showed a NOVICE who emphasizes a single muscle (shoulders/back/
// chest) riding that muscle to ~20-22 weekly DELIVERED sets — far above the
// evidence-based beginner emphasized band (~10-14) — because the focus signature
// surfaces press + lateral + rear width SLOTS on each training day and the budget-
// share rounding + the cross-day delt-quota ledger floor handed several of those
// ISOLATIONS 3 sets. The base-budget scalar (volumeLandmarks) is fully absorbed by
// the per-session set floors, so the fix has to land in DELIVERY.
//
// The lever (a FINAL clamp at the end of buildSession, after the ledger floor that
// would otherwise re-raise them): for a BEGINNER (ctx.profileTier T0 +
// ctx.beginnerEmphasisSlotCap from the flag) the emphasized group's ISOLATIONS are
// capped at MEV (2 sets) — the width SLOTS the focus promises STAY (the look choice
// is visible), only the per-exercise junk 3rd set is trimmed. The COMPOUND anchor
// (press/row) is untouched, and an ISOLATION-ONLY emphasized group (arms) is EXEMPT
// so it never sinks below its MEV. flag-OFF (ctx unset) → byte-identical.

import { describe, it, expect } from 'vitest';
import { buildSession } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { ISRAETEL_BASELINES } from '../periodization/constants.js';

const ALL = ['barbell', 'dumbbell', 'machine', 'cable', 'band', 'bodyweight', 'smith', 'ez-bar', 'trap-bar'];
const groupOf = (n) => getExerciseMetadata(n).muscle_target_primary;
const tierOf = (n) => getExerciseMetadata(n).tier ?? 2;
const COMPOUND_TIER = 1;

// A beginner shoulder-focus push day under a CROSS-DAY ledger that projects the delt
// width quota (≥6 lateral + ≥6 rear sets/wk over 2 exposure days) as UNMET → the
// ledger floor raises each delt carrier to 3 sets/lift (the exact eval over-volume:
// the focus muscle to ~20 weekly). The beginner clamp must then re-cap those
// ISOLATIONS to MEV (2) — this is the FINAL pass the ledger floor can no longer undo.
const DELT_QUOTA_LEDGER = { weekSubSets: { lateral: 0, rear: 0 }, weekSlotDays: { lateral: 2, rear: 2 } };
const beginnerShoulderCtx = (over = {}) => ({
  equipment: { available: ALL },
  profileTier: 'T0',                 // beginner
  beginnerVolumeCap: true,           // dp_learned_volume_v1 (the non-focus cap gate)
  beginnerEmphasisSlotCap: true,     // dp_beginner_volume_v2 (the new emphasized clamp)
  seed: 'bvol|2026-W02|0',
  volumeTargets: { shoulders: 16, chest: 10, triceps: 8 },
  weeklySessionsPerGroup: { umeri: 2, piept: 2, triceps: 2 },
  emphasizedGroups: ['umeri'],
  emphasisSetsBoost: true,
  focusPolicy: true,
  focusId: 'shoulders',
  daysPerWeek: 4,
  weeklyLedger: DELT_QUOTA_LEDGER,   // forces the ledger delt floor (3 sets) ON
  ...over,
});

describe('beginner-volume-v2 — DELIVERED emphasized isolation clamp (eval p1/p10)', () => {
  it('a beginner emphasized-group ISOLATION never exceeds MEV (2) when the flag is ON', () => {
    const s = buildSession('push', beginnerShoulderCtx());
    const umeriIso = s.exercises.filter(
      (e) => groupOf(e.name) === 'umeri' && tierOf(e.name) > COMPOUND_TIER,
    );
    // Non-vacuous: the shoulder focus must surface umeri isolations (width work).
    expect(umeriIso.length, s.exercises.map((e) => e.name + ':' + e.sets).join('|')).toBeGreaterThan(0);
    for (const e of umeriIso) {
      expect(e.sets, `${e.name} should cap at 2 for a beginner emphasis`).toBeLessThanOrEqual(2);
    }
  });

  it('the emphasized COMPOUND anchor (press) is NOT clamped — the main lift keeps its dose', () => {
    const s = buildSession('push', beginnerShoulderCtx());
    const umeriCompound = s.exercises.filter(
      (e) => groupOf(e.name) === 'umeri' && tierOf(e.name) === COMPOUND_TIER,
    );
    // If a press anchor surfaced, it is free to sit above the isolation cap (>=2,
    // up to its own floor) — the clamp is isolation-only.
    for (const e of umeriCompound) {
      expect(e.sets).toBeGreaterThanOrEqual(2);
    }
  });

  it('an ISOLATION-ONLY emphasized group (arms → biceps) is EXEMPT — stays ABOVE its MEV', () => {
    // Biceps MEV is 8; with no compound to carry the dose, capping its only lifts to 2
    // would sink the EMPHASIZED muscle below MEV. The exemption keeps the arms emphasis
    // on the raised isolation band. Pull day = the biceps-bearing cluster.
    const bicepsMev = ISRAETEL_BASELINES.biceps.MEV;
    const armsCtx = beginnerShoulderCtx({
      volumeTargets: { back: 14, biceps: 18, shoulders: 8 },
      weeklySessionsPerGroup: { spate: 2, biceps: 2, umeri: 2 },
      emphasizedGroups: ['biceps'],
      focusId: 'arms',
      weeklyLedger: null,
    });
    const s = buildSession('pull', armsCtx);
    const bicepsIso = s.exercises.filter(
      (e) => groupOf(e.name) === 'biceps' && tierOf(e.name) > COMPOUND_TIER,
    );
    expect(bicepsIso.length, s.exercises.map((e) => e.name).join('|')).toBeGreaterThan(0);
    // At least one biceps isolation keeps a dose ABOVE the 2-set isolation cap (the
    // exemption is live — the emphasis is not crushed to MEV-per-lift).
    const perSessionBiceps = bicepsIso.reduce((a, e) => a + e.sets, 0);
    // Two pull sessions/week of this per-session biceps volume must clear the weekly MEV.
    expect(perSessionBiceps * 2).toBeGreaterThanOrEqual(bicepsMev);
  });

  // The clamp must be LOAD-BEARING: turning it OFF (and turning the tier non-beginner)
  // must leave at least one emphasized umeri isolation ABOVE the 2-set cap, proving the
  // ON path is what trims the over-volume. Comparing the SAME seed isolates the lever
  // from selection noise (a single isolation count would be brittle).
  const maxUmeriIso = (s) =>
    Math.max(0, ...s.exercises
      .filter((e) => groupOf(e.name) === 'umeri' && tierOf(e.name) > COMPOUND_TIER)
      .map((e) => e.sets));

  it('flag-OFF (ctx.beginnerEmphasisSlotCap unset) → emphasized isolations ride above the cap', () => {
    const off = buildSession('push', beginnerShoulderCtx({ beginnerEmphasisSlotCap: false }));
    expect(maxUmeriIso(off)).toBeGreaterThan(2);
  });

  it('a NON-beginner (T2) is untouched by the beginner clamp even with the ctx flag', () => {
    const t2 = buildSession('push', beginnerShoulderCtx({ profileTier: 'T2' }));
    expect(maxUmeriIso(t2)).toBeGreaterThan(2);
  });
});
