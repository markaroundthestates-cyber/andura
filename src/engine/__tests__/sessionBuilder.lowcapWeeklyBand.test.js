/**
 * dp_lowcap_weekly_band_v1 — LOW-CAPACITY per-muscle weekly-band clamp (eval p9/p10).
 *
 * The /10 eval docked the MAINTENANCE-goal + OLDER (age >=60) personas because their
 * weekly volume scaled LINEARLY with training frequency (p9 ~67/wk at freq-7, p10
 * ~71/wk at freq-5 — "over-prescribed for a maintenance/older trainee"). An elite coach
 * holds a maintenance/older trainee's weekly volume NEAR its band regardless of how many
 * days they train: extra days = LIGHTER sessions, not more total volume.
 *
 * When ctx.lowCapWeeklyBand = { perMuscleCeiling, sessionsPerGroup } (the getDailyWorkout
 * seam sets it only for goal mentenanta / age >=60 under the flag), buildSession clamps
 * EACH trained muscle's per-session DELIVERED sets so its WEEKLY sum lands in the
 * maintenance band: a primary mover divides the ceiling by its (true) session count, an
 * over-counted accessory holds its concentrated day at the maintenance dose, sets trim
 * toward MEV (2), and a still-over muscle drops its lowest-priority extra slot — never the
 * only slot (no orphan). Absent (flag OFF / trained adult under 60 / pure-fn callers) →
 * null → no clamp → byte-identical.
 */

import { describe, it, expect } from 'vitest';
import { buildSession } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';

const ALL = ['barbell', 'dumbbell', 'machine', 'cable', 'band', 'bodyweight', 'smith', 'ez-bar', 'trap-bar'];

// A rich weekly budget so OFF naturally over-volumes a multi-slot group (the over-
// prescription the eval flagged), trained 2x/week on the relevant clusters.
const ctxBase = (over = {}) => ({
  equipment: { available: ALL },
  profileTier: 'T1',
  seed: 'lcw|2026-W02|0',
  volumeTargets: {
    chest: 12, back: 14, shoulders: 10, biceps: 8, triceps: 8,
    quads: 12, hamstrings: 10, glutes: 10, calves: 6, abs: 6, forearms: 4,
  },
  weeklySessionsPerGroup: {
    piept: 2, spate: 2, umeri: 2, biceps: 2, triceps: 2,
    'picioare-quads': 2, 'picioare-hamstrings': 2, fese: 2, gambe: 2, core: 2, antebrate: 2,
  },
  focusId: 'balanced',
  ...over,
});

// The lowCapWeeklyBand object the getDailyWorkout seam threads (perMuscleCeiling + the
// TRUE per-group weekly session snapshot taken before the de-emphasis divisor inflation).
const band = (over = {}) => ({
  perMuscleCeiling: 5,
  sessionsPerGroup: {
    piept: 2, spate: 2, umeri: 2, biceps: 2, triceps: 2,
    'picioare-quads': 2, 'picioare-hamstrings': 2, fese: 2, gambe: 2, core: 2, antebrate: 2,
  },
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
function totalSets(session) {
  return session.exercises.reduce((n, e) => n + (e.sets || 0), 0);
}

describe('dp_lowcap_weekly_band_v1 — low-capacity per-muscle weekly-band clamp', () => {
  it('flag OFF (no ctx.lowCapWeeklyBand) → no clamp (a multi-slot group keeps its full per-session volume)', () => {
    const off = buildSession('pull', ctxBase());
    // back (spate) is the pull cluster's primary — OFF it carries the full distribution.
    expect(groupSets(off, 'spate')).toBeGreaterThan(4);
  });

  it('flag ON → a primary mover\'s per-session delivered sets are bounded by its band cap', () => {
    const off = buildSession('pull', ctxBase());
    const on = buildSession('pull', ctxBase({ lowCapWeeklyBand: band() }));
    // back trained 2x/week, ceiling 5 → floor(5/2)=2 sets/session → ×2 days = ~4/wk (band).
    expect(groupSets(on, 'spate')).toBeLessThanOrEqual(groupSets(off, 'spate'));
    expect(groupSets(on, 'spate')).toBeLessThanOrEqual(3);
  });

  it('ON only ever REDUCES the per-session total (never adds)', () => {
    const off = buildSession('pull', ctxBase());
    const on = buildSession('pull', ctxBase({ lowCapWeeklyBand: band() }));
    expect(totalSets(on)).toBeLessThanOrEqual(totalSets(off));
  });

  it('ON → no muscle present in the session is left below MEV (2) — never an under-volume slot', () => {
    const on = buildSession('full', ctxBase({ lowCapWeeklyBand: band() }));
    for (const e of on.exercises) {
      expect(e.sets, `${e.name} below MEV`).toBeGreaterThanOrEqual(2);
    }
  });

  it('ON → never orphans a muscle that was present OFF (no muscle dropped to zero slots)', () => {
    const off = buildSession('full', ctxBase());
    const on = buildSession('full', ctxBase({ lowCapWeeklyBand: band() }));
    const offG = presentGroups(off);
    const onG = presentGroups(on);
    for (const g of offG) {
      // A multi-slot muscle may drop EXTRA slots, but never its last one.
      expect(onG.has(g), `${g} orphaned by the clamp`).toBe(true);
    }
  });

  it('ON → an OVER-COUNTED accessory (biceps) concentrated on its day keeps the maintenance dose (not crushed to MEV)', () => {
    // Pull concentrates biceps (spate+biceps cluster) — its structural session count
    // over-estimates realized days, so its concentrated exposure must keep ~the floor.
    const on = buildSession('pull', ctxBase({ lowCapWeeklyBand: band() }));
    const bi = groupSets(on, 'biceps');
    if (bi > 0) expect(bi, `biceps crushed: ${bi}`).toBeGreaterThanOrEqual(4);
  });

  it('ON is deterministic (same ctx → same session)', () => {
    const a = buildSession('full', ctxBase({ lowCapWeeklyBand: band() }));
    const b = buildSession('full', ctxBase({ lowCapWeeklyBand: band() }));
    expect(a).toEqual(b);
  });

  it('ON under a FOCUS → the focus muscle still LEADS its band (present, >= MEV)', () => {
    const on = buildSession('pull', ctxBase({
      lowCapWeeklyBand: band(), emphasizedGroups: ['spate'], focusId: 'back',
    }));
    expect(groupSets(on, 'spate'), 'focus muscle gutted').toBeGreaterThanOrEqual(2);
    expect(presentGroups(on).has('spate')).toBe(true);
  });

  it('TWO-TIER ceiling → a FOCUS muscle clears the non-focus maintenance band (stays emphasized, not clamped to ~5)', () => {
    // Without emphasizedGroups the flat ceiling clamps spate to the maintenance band (~5/wk
    // → ~2-3/session). With spate as the band's FOCUS group it gets the higher focus ceiling
    // so it leads — the regression fix (p9 v-taper back was clamped to 4 = "not emphasized").
    const flat = buildSession('pull', ctxBase({ lowCapWeeklyBand: band() }));
    const focused = buildSession('pull', ctxBase({
      lowCapWeeklyBand: band({ emphasizedGroups: ['spate'] }),
      emphasizedGroups: ['spate'], focusId: 'back',
    }));
    // The focus exemption RAISES the focus muscle above the flat maintenance clamp.
    expect(groupSets(focused, 'spate')).toBeGreaterThan(groupSets(flat, 'spate'));
    // spate trained 2x, focus ceiling 11 → floor(11/2)=5/session → leads a non-focus group.
    expect(groupSets(focused, 'spate'), 'focus not emphasized').toBeGreaterThanOrEqual(4);
  });

  it('TWO-TIER ceiling → a MULTI-muscle focus (v-taper: umeri + spate) emphasizes BOTH pillars', () => {
    // v-taper emphasizes shoulders AND back — both must clear the non-focus band so the
    // taper signature is intact (the regression: back was clamped to 4 while it is a pillar).
    const on = buildSession('upper', ctxBase({
      lowCapWeeklyBand: band({ emphasizedGroups: ['umeri', 'spate'] }),
      emphasizedGroups: ['umeri', 'spate'], focusId: 'v-taper',
    }));
    const nonFocusMax = Math.max(
      groupSets(on, 'piept'), groupSets(on, 'biceps'), groupSets(on, 'triceps'),
    );
    expect(groupSets(on, 'spate'), 'back pillar not emphasized').toBeGreaterThan(nonFocusMax);
    expect(groupSets(on, 'umeri'), 'shoulder pillar not emphasized').toBeGreaterThan(nonFocusMax);
  });

  it('TWO-TIER ceiling → NON-focus muscles still drop to the maintenance band (total stays bounded)', () => {
    // The focus exemption must NOT re-inflate non-focus muscles — they keep perMuscleCeiling.
    const focused = buildSession('pull', ctxBase({
      lowCapWeeklyBand: band({ emphasizedGroups: ['spate'] }),
      emphasizedGroups: ['spate'], focusId: 'back',
    }));
    // biceps (non-focus over-counted accessory) stays at the maintenance dose, not raised.
    const bi = groupSets(focused, 'biceps');
    if (bi > 0) expect(bi, `non-focus biceps inflated: ${bi}`).toBeLessThanOrEqual(5);
  });

  it('TWO-TIER ceiling → empty emphasizedGroups is identical to the flat clamp (balanced)', () => {
    const flat = buildSession('full', ctxBase({ lowCapWeeklyBand: band() }));
    const empty = buildSession('full', ctxBase({ lowCapWeeklyBand: band({ emphasizedGroups: [] }) }));
    expect(empty).toEqual(flat);
  });

  it('a malformed band ({} / missing perMuscleCeiling) → no clamp (defensive no-op)', () => {
    const off = buildSession('pull', ctxBase());
    const bad = buildSession('pull', ctxBase({ lowCapWeeklyBand: {} }));
    expect(bad).toEqual(off);
  });
});
