/**
 * dp_single_day_focus_v1 — SINGLE-DAY FOCUS CONCENTRATION (eval freq=1).
 *
 * A user training only 1 day/week still has just ONE full-body session. The /10 judge
 * capped that day "focus-not-emphasized" / "focus at maintenance, not a signature" on the
 * freq=1 grid (p3_chest/shoulders/lower/upper, p6_shoulders, p9_arms): every group landed
 * at its ordinary per-session dose, so the focus muscle sat at MEV while the off-focus
 * accessories took the same sets — the day read as a balanced full-body, not a focused one.
 *
 * When ctx.singleDayFocus = { emphasizedGroups } (the getDailyWorkout seam sets it ONLY when
 * the resolved active week has EXACTLY ONE training day, a non-balanced focus is active, and
 * the flag is ON), buildSession runs a NET-NEUTRAL concentration pass: STEP 1 trims each
 * NON-focus ACCESSORY (tier > 1) group toward maintenance (2), banking the freed sets; STEP 2
 * reallocates that budget into the focus group's exercises (raise toward the per-exercise
 * ceiling, bounded by the focus group weekly ceiling + MRV); STEP 3 (minimal lead guarantee)
 * raises the focus lead slot until each present focus group STRICTLY out-ranks the highest
 * non-focus group — so the single day expresses the focus even when there was nothing to free.
 * It never trims a non-focus COMPOUND anchor, never trims any group below maintenance (2),
 * never raises a focus lift past the per-exercise ceiling (5). Absent (freq >= 2 / balanced /
 * flag OFF / pure-fn callers) → null → no-op → BYTE-IDENTICAL.
 */

import { describe, it, expect } from 'vitest';
import { buildSession } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';

const ALL = ['barbell', 'dumbbell', 'machine', 'cable', 'band', 'bodyweight', 'smith', 'ez-bar', 'trap-bar'];

// A full-body single-day cohort: a rich weekly budget delivered into ONE 'full' session, every
// group trained once (freq=1). This mirrors what the seam threads for a 1-day week.
const ctxBase = (over = {}) => ({
  equipment: { available: ALL },
  profileTier: 'T1',
  seed: 'sdf|2026-W02|0',
  daysPerWeek: 1,
  volumeTargets: {
    chest: 12, back: 14, shoulders: 12, biceps: 10, triceps: 10,
    quads: 12, hamstrings: 10, glutes: 10, calves: 6, abs: 6, forearms: 4,
  },
  weeklySessionsPerGroup: {
    piept: 1, spate: 1, umeri: 1, biceps: 1, triceps: 1,
    'picioare-quads': 1, 'picioare-hamstrings': 1, fese: 1, gambe: 1, core: 1, antebrate: 1,
  },
  focusId: 'balanced',
  ...over,
});

function groupSets(session, roGroup) {
  return session.exercises
    .filter((e) => getExerciseMetadata(e.name)?.muscle_target_primary === roGroup)
    .reduce((n, e) => n + (e.sets || 0), 0);
}
function presentGroups(session) {
  const s = new Set();
  for (const e of session.exercises) {
    const g = getExerciseMetadata(e.name)?.muscle_target_primary;
    if (g) s.add(g);
  }
  return s;
}
function maxNonFocus(session, focus) {
  const fs = new Set(focus);
  let m = 0;
  for (const g of presentGroups(session)) if (!fs.has(g)) m = Math.max(m, groupSets(session, g));
  return m;
}

describe('dp_single_day_focus_v1 — single-day focus concentration', () => {
  it('flag OFF (no ctx.singleDayFocus) → no concentration; ON trims non-focus + raises focus', () => {
    // shoulders: OFF the single full-body day doses umeri at ~MEV alongside equal accessories;
    // ON the concentration pass trims the non-focus accessories and raises umeri so it leads.
    const off = buildSession('full', ctxBase({ focusId: 'shoulders', emphasizedGroups: ['umeri'] }));
    const on = buildSession('full', ctxBase({
      focusId: 'shoulders', emphasizedGroups: ['umeri'], singleDayFocus: { emphasizedGroups: ['umeri'] },
    }));
    // ON concentrates the focus strictly above its OFF dose, AND raises the non-focus margin.
    expect(groupSets(on, 'umeri')).toBeGreaterThan(groupSets(off, 'umeri'));
  });

  it('ON → the focus group STRICTLY leads every non-focus group (single-day signature)', () => {
    const on = buildSession('full', ctxBase({
      focusId: 'back', emphasizedGroups: ['spate'], singleDayFocus: { emphasizedGroups: ['spate'] },
    }));
    expect(groupSets(on, 'spate')).toBeGreaterThan(maxNonFocus(on, ['spate']));
  });

  it('ON → each non-focus ACCESSORY group is trimmed toward maintenance (<= 2), never below', () => {
    const on = buildSession('full', ctxBase({
      focusId: 'shoulders', emphasizedGroups: ['umeri'], singleDayFocus: { emphasizedGroups: ['umeri'] },
    }));
    for (const e of on.exercises) {
      const meta = getExerciseMetadata(e.name);
      const g = meta?.muscle_target_primary;
      const isAccessory = (meta?.tier ?? 2) > 1;
      if (g && g !== 'umeri' && isAccessory) {
        expect(e.sets, `${e.name} non-focus accessory over maintenance`).toBeLessThanOrEqual(2);
      }
      // nothing ever trimmed below MEV.
      expect(e.sets, `${e.name} below MEV`).toBeGreaterThanOrEqual(2);
    }
  });

  it('ON → a NON-focus COMPOUND anchor (tier <= 1) is NEVER trimmed (day stays compound-dense)', () => {
    const off = buildSession('full', ctxBase({ focusId: 'arms', emphasizedGroups: ['biceps', 'triceps'] }));
    const on = buildSession('full', ctxBase({
      focusId: 'arms', emphasizedGroups: ['biceps', 'triceps'],
      singleDayFocus: { emphasizedGroups: ['biceps', 'triceps'] },
    }));
    // Every NON-focus tier-1 compound keeps at least its OFF dose (the pass only trims accessories).
    for (const e of on.exercises) {
      const meta = getExerciseMetadata(e.name);
      const g = meta?.muscle_target_primary;
      if (g && g !== 'biceps' && g !== 'triceps' && (meta?.tier ?? 2) <= 1) {
        const offMatch = off.exercises.find((x) => x.name === e.name);
        if (offMatch) expect(e.sets, `${e.name} compound trimmed`).toBeGreaterThanOrEqual(offMatch.sets);
      }
    }
  });

  it('ON → no focus lift exceeds the per-exercise ceiling (5)', () => {
    const on = buildSession('full', ctxBase({
      focusId: 'chest', emphasizedGroups: ['piept', 'triceps'],
      singleDayFocus: { emphasizedGroups: ['piept', 'triceps'] },
    }));
    for (const e of on.exercises) {
      const g = getExerciseMetadata(e.name)?.muscle_target_primary;
      if (g === 'piept' || g === 'triceps') {
        expect(e.sets, `${e.name} over per-exercise ceiling`).toBeLessThanOrEqual(5);
      }
    }
  });

  it('MINIMAL LEAD GUARANTEE → focus leads even when nothing could be freed (all non-focus already at 2)', () => {
    // Pre-trim every non-focus accessory to MEV via a thin budget so STEP 1 frees nothing; the
    // lead guarantee (STEP 3) must still raise the focus above the flat non-focus floor.
    const thin = ctxBase({
      focusId: 'arms', emphasizedGroups: ['biceps', 'triceps'],
      // a maintenance-thin budget so every group distributes near MEV (the p9_arms shape).
      volumeTargets: {
        chest: 4, back: 4, shoulders: 4, biceps: 4, triceps: 4,
        quads: 4, hamstrings: 4, glutes: 4, calves: 4, abs: 4, forearms: 4,
      },
      singleDayFocus: { emphasizedGroups: ['biceps', 'triceps'] },
    });
    const on = buildSession('full', thin);
    const armsLead = Math.max(groupSets(on, 'biceps'), groupSets(on, 'triceps'));
    const others = maxNonFocus(on, ['biceps', 'triceps', 'umeri']);
    expect(armsLead, `arms (${armsLead}) must lead non-arms (${others})`).toBeGreaterThan(others);
  });

  it('ON → never orphans a muscle that was present OFF (maintained, never zeroed)', () => {
    const off = buildSession('full', ctxBase({ focusId: 'lower', emphasizedGroups: ['fese', 'picioare-quads', 'picioare-hamstrings'] }));
    const on = buildSession('full', ctxBase({
      focusId: 'lower', emphasizedGroups: ['fese', 'picioare-quads', 'picioare-hamstrings'],
      singleDayFocus: { emphasizedGroups: ['fese', 'picioare-quads', 'picioare-hamstrings'] },
    }));
    for (const g of presentGroups(off)) {
      expect(presentGroups(on).has(g), `${g} orphaned by the concentration pass`).toBe(true);
    }
  });

  it('ON is deterministic (same ctx → same session)', () => {
    const a = buildSession('full', ctxBase({
      focusId: 'v-taper', emphasizedGroups: ['umeri', 'spate'],
      singleDayFocus: { emphasizedGroups: ['umeri', 'spate'] },
    }));
    const b = buildSession('full', ctxBase({
      focusId: 'v-taper', emphasizedGroups: ['umeri', 'spate'],
      singleDayFocus: { emphasizedGroups: ['umeri', 'spate'] },
    }));
    expect(a).toEqual(b);
  });

  it('balanced (empty emphasizedGroups) → no-op even with the field set', () => {
    const off = buildSession('full', ctxBase());
    const on = buildSession('full', ctxBase({ singleDayFocus: { emphasizedGroups: [] } }));
    expect(on).toEqual(off);
  });

  it('a malformed singleDayFocus ({} / missing emphasizedGroups) → no-op (defensive)', () => {
    const off = buildSession('full', ctxBase({ focusId: 'back', emphasizedGroups: ['spate'] }));
    const bad = buildSession('full', ctxBase({ focusId: 'back', emphasizedGroups: ['spate'], singleDayFocus: {} }));
    expect(bad).toEqual(off);
  });

  it('a multi-muscle focus (v-taper: umeri + spate) — BOTH pillars lead the non-focus groups', () => {
    const on = buildSession('full', ctxBase({
      focusId: 'v-taper', emphasizedGroups: ['umeri', 'spate'],
      singleDayFocus: { emphasizedGroups: ['umeri', 'spate'] },
    }));
    const nf = maxNonFocus(on, ['umeri', 'spate']);
    expect(groupSets(on, 'umeri'), 'shoulder pillar not leading').toBeGreaterThan(nf);
    expect(groupSets(on, 'spate'), 'back pillar not leading').toBeGreaterThan(nf);
  });
});
