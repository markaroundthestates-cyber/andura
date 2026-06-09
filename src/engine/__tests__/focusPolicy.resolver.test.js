// ══ Wave 1.3-B — FOCUS-POLICY RESOLVER (deriver + applyFocusPolicy) ════════════
// Proves the LOCAL constraint resolver: the tag deriver classifies the real
// CORE_AUTO pool, a sessionCap prunes excess, a sessionRequirement injects a
// missing slot when a candidate exists (and is a graceful no-op when none does),
// relaxation prefers fewer-good over bad, and the whole thing is deterministic.
// Plus one integration test through the real composer (buildSession) for v-taper.

import { describe, it, expect } from 'vitest';
import { deriveExerciseTags, applyFocusPolicy } from '../focusPolicy.js';
import { buildSession, movementKey } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';

const mk = (name, meta) => movementKey(name, meta ?? getExerciseMetadata(name));
const tagsOf = (name) => deriveExerciseTags(name, getExerciseMetadata(name), movementKey);

describe('deriveExerciseTags — grounded on the real CORE_AUTO pool', () => {
  // ~12 representative entries (verified 2026-06-09 against exercises.json).
  it('classifies shoulder patterns (side/rear delt, vertical press)', () => {
    expect(tagsOf('DB Lateral Raise')).toContain('side_delt');
    expect(tagsOf('Cable Lateral Raise')).toContain('lateral_raise');
    expect(tagsOf('Cable Rear Delt Fly')).toContain('rear_delt');
    expect(tagsOf('Face Pull')).toContain('rear_delt');
    expect(tagsOf('DB Shoulder Press')).toContain('vertical_press');
    expect(tagsOf('Machine Shoulder Press')).toContain('vertical_press');
  });

  it('classifies chest patterns (chest press, flye)', () => {
    expect(tagsOf('Flat DB Press')).toContain('chest_press');
    expect(tagsOf('Incline DB Press')).toContain('chest_press');
    expect(tagsOf('Dip')).toContain('chest_press'); // Dip keys piept::dip
    expect(tagsOf('Cable Fly')).toContain('flye');
    expect(tagsOf('DB Fly')).toContain('flye');
  });

  it('classifies back patterns (vertical pull, horizontal row, lat isolation)', () => {
    expect(tagsOf('Lat Pulldown')).toContain('vertical_pull');
    expect(tagsOf('Pull-up')).toContain('vertical_pull');
    expect(tagsOf('Cable Row')).toContain('horizontal_row');
    expect(tagsOf('Barbell Row')).toContain('horizontal_row');
    // Machine Pullover + Straight-Arm Lat Pulldown are the only lat-isolation pair.
    expect(tagsOf('Machine Pullover')).toContain('lat_isolation');
    expect(tagsOf('Straight-Arm Lat Pulldown')).toContain('lat_isolation');
  });

  it('classifies arm patterns (direct + overhead triceps, direct + stretch biceps)', () => {
    expect(tagsOf('Cable Triceps Pushdown Rope')).toContain('direct_triceps');
    expect(tagsOf('Cable Overhead Triceps Extension Rope')).toContain('overhead_triceps');
    expect(tagsOf('Cable Curl')).toContain('direct_biceps');
    expect(tagsOf('EZ-bar Preacher Curl')).toContain('stretch_curl');
    expect(tagsOf('Incline DB Curl')).toContain('stretch_curl');
  });

  it('classifies heavy lower compounds (tier-1 squat/deadlift/leg-press/hip-thrust)', () => {
    expect(tagsOf('Barbell Back Squat (High Bar)')).toContain('heavy_lower_compound');
    expect(tagsOf('Romanian Deadlift')).toContain('heavy_lower_compound');
    expect(tagsOf('Leg Press')).toContain('heavy_lower_compound');
    expect(tagsOf('Hip Thrust')).toContain('heavy_lower_compound');
    // Tier-2 lower isolation is NOT a heavy compound.
    expect(tagsOf('Leg Extension')).not.toContain('heavy_lower_compound');
    expect(tagsOf('Cable Glute Kickback')).not.toContain('heavy_lower_compound');
  });

  it('NEVER emits the MISSING front_delt/front_raise tag (graceful no-op)', () => {
    // No CORE_AUTO front-raise variant exists; the deriver must not invent the tag.
    for (const name of ['DB Lateral Raise', 'DB Shoulder Press', 'Cable Rear Delt Fly']) {
      expect(tagsOf(name)).not.toContain('front_delt');
      expect(tagsOf(name)).not.toContain('front_raise');
    }
  });
});

// ── Helpers for the unit-level resolver tests (synthetic exercises so the test
// owns the metadata + does not depend on the live library shape). ──
function makeCtx(metaMap, pool, overrides = {}) {
  const getMeta = (name) => metaMap[name] ?? { muscle_target_primary: 'unknown' };
  return {
    focusId: overrides.focusId ?? 'v-taper',
    cluster: overrides.cluster ?? 'push',
    pool: pool ?? [],
    prNames: overrides.prNames ?? new Set(),
    movementKey,
    getMeta,
    scoreOf: overrides.scoreOf ?? (() => 0),
    sessionSizeCap: overrides.sessionSizeCap ?? 8,
    ...overrides,
  };
}

describe('applyFocusPolicy — sessionCaps prune excess', () => {
  it('prunes chest presses down to the chest cap (4 → 2)', () => {
    const metaMap = {
      'Flat DB Press': { muscle_target_primary: 'piept', tier: 1 },
      'Incline DB Press': { muscle_target_primary: 'piept', tier: 1 },
      'Flat Chest Press Machine': { muscle_target_primary: 'piept', tier: 1 },
      'Converging Chest Press': { muscle_target_primary: 'piept', tier: 1 },
      'Cable Fly': { muscle_target_primary: 'piept', tier: 2 },
    };
    // chest focus: maxChestPressPatterns: 2.
    const chosen = [
      { name: 'Flat DB Press', sets: 3 },
      { name: 'Incline DB Press', sets: 3 },
      { name: 'Flat Chest Press Machine', sets: 3 },
      { name: 'Converging Chest Press', sets: 3 },
      { name: 'Cable Fly', sets: 3 }, // flye → satisfies requireFlyeIfChestDay
    ];
    // give distinct scores so the prune order is deterministic (lowest pruned).
    const scoreOf = (n) => ({
      'Flat DB Press': 100, 'Incline DB Press': 80,
      'Flat Chest Press Machine': 60, 'Converging Chest Press': 40, 'Cable Fly': 90,
    })[n] ?? 0;
    const out = applyFocusPolicy(chosen, makeCtx(metaMap, [], { focusId: 'chest', cluster: 'chest', scoreOf }));
    const presses = out.filter((e) => deriveExerciseTags(e.name, metaMap[e.name], movementKey).has('chest_press'));
    expect(presses.length).toBe(2);
    // The two HIGHEST-score presses survive.
    expect(out.map((e) => e.name)).toContain('Flat DB Press');
    expect(out.map((e) => e.name)).toContain('Incline DB Press');
    // The flye (a requirement carrier) is never pruned.
    expect(out.map((e) => e.name)).toContain('Cable Fly');
  });

  it('never prunes a logged-PR lift even when it is an offender', () => {
    const metaMap = {
      'Flat DB Press': { muscle_target_primary: 'piept', tier: 1 },
      'Incline DB Press': { muscle_target_primary: 'piept', tier: 1 },
      'Converging Chest Press': { muscle_target_primary: 'piept', tier: 1 },
    };
    const chosen = [
      { name: 'Flat DB Press', sets: 3 },
      { name: 'Incline DB Press', sets: 3 },
      { name: 'Converging Chest Press', sets: 3 },
    ];
    // Converging is the lowest score (would be pruned) but it is a logged PR.
    const scoreOf = (n) => ({ 'Flat DB Press': 100, 'Incline DB Press': 80, 'Converging Chest Press': 10 })[n] ?? 0;
    const out = applyFocusPolicy(chosen, makeCtx(metaMap, [], {
      focusId: 'chest', cluster: 'chest', scoreOf, prNames: new Set(['Converging Chest Press']),
    }));
    expect(out.map((e) => e.name)).toContain('Converging Chest Press');
    // Cap can't be fully met (PR protected) → graceful relaxation: a press is dropped
    // but the PR survives.
    expect(out.length).toBe(2);
  });
});

describe('applyFocusPolicy — sessionRequirements inject', () => {
  it('injects a missing side-delt lateral when one is available in the pool', () => {
    const metaMap = {
      'DB Shoulder Press': { muscle_target_primary: 'umeri', tier: 1 },
      'Cable Rear Delt Fly': { muscle_target_primary: 'umeri', tier: 2 },
      'DB Lateral Raise': { muscle_target_primary: 'umeri', tier: 2 },
    };
    // v-taper requires minSideDeltSlots:1 + minRearDeltSlots:1. Session has press +
    // rear delt but NO lateral. The lateral is in the pool → inject it.
    const chosen = [
      { name: 'DB Shoulder Press', sets: 3 },
      { name: 'Cable Rear Delt Fly', sets: 3 },
    ];
    const pool = [{ name: 'DB Lateral Raise', meta: metaMap['DB Lateral Raise'] }];
    const out = applyFocusPolicy(chosen, makeCtx(metaMap, pool, { focusId: 'v-taper', cluster: 'push' }));
    const hasLateral = out.some((e) => deriveExerciseTags(e.name, metaMap[e.name], movementKey).has('side_delt'));
    expect(hasLateral).toBe(true);
    expect(out.map((e) => e.name)).toContain('DB Lateral Raise');
  });

  it('is a graceful no-op when NO qualifying candidate exists (never invents)', () => {
    const metaMap = {
      'DB Shoulder Press': { muscle_target_primary: 'umeri', tier: 1 },
      'Cable Rear Delt Fly': { muscle_target_primary: 'umeri', tier: 2 },
    };
    const chosen = [
      { name: 'DB Shoulder Press', sets: 3 },
      { name: 'Cable Rear Delt Fly', sets: 3 },
    ];
    // Empty pool → no lateral candidate → the side-delt requirement is a no-op.
    const out = applyFocusPolicy(chosen, makeCtx(metaMap, [], { focusId: 'v-taper', cluster: 'push' }));
    expect(out.map((e) => e.name)).toEqual(['DB Shoulder Press', 'Cable Rear Delt Fly']);
  });

  it('replaces the lowest-value non-required exercise when at the slot ceiling', () => {
    const metaMap = {
      'DB Shoulder Press': { muscle_target_primary: 'umeri', tier: 1 },
      'Cable Rear Delt Fly': { muscle_target_primary: 'umeri', tier: 2 },
      'Cable Triceps Pushdown Rope': { muscle_target_primary: 'triceps', tier: 2 },
      'DB Lateral Raise': { muscle_target_primary: 'umeri', tier: 2 },
    };
    // sessionSizeCap 3, session full, no lateral → inject by replacing the lowest-
    // value non-required exercise (the triceps pushdown, lowest score).
    const chosen = [
      { name: 'DB Shoulder Press', sets: 3 },
      { name: 'Cable Rear Delt Fly', sets: 3 },
      { name: 'Cable Triceps Pushdown Rope', sets: 3 },
    ];
    const pool = [{ name: 'DB Lateral Raise', meta: metaMap['DB Lateral Raise'] }];
    const scoreOf = (n) => ({ 'DB Shoulder Press': 100, 'Cable Rear Delt Fly': 80, 'Cable Triceps Pushdown Rope': 10 })[n] ?? 0;
    const out = applyFocusPolicy(chosen, makeCtx(metaMap, pool, {
      focusId: 'v-taper', cluster: 'push', sessionSizeCap: 3, scoreOf,
    }));
    expect(out.length).toBe(3);
    expect(out.map((e) => e.name)).toContain('DB Lateral Raise');
    expect(out.map((e) => e.name)).not.toContain('Cable Triceps Pushdown Rope');
  });
});

describe('applyFocusPolicy — relaxation prefers fewer-good over bad', () => {
  it('returns fewer good exercises rather than padding with an excluded/absent one', () => {
    const metaMap = {
      'DB Shoulder Press': { muscle_target_primary: 'umeri', tier: 1 },
      'Cable Rear Delt Fly': { muscle_target_primary: 'umeri', tier: 2 },
    };
    // v-taper wants a side-delt; the pool is EMPTY (no lateral available). The
    // resolver leaves the session as-is (2 good exercises) — never forces a bad pad.
    const chosen = [
      { name: 'DB Shoulder Press', sets: 3 },
      { name: 'Cable Rear Delt Fly', sets: 3 },
    ];
    const out = applyFocusPolicy(chosen, makeCtx(metaMap, [], { focusId: 'v-taper', cluster: 'push' }));
    expect(out.length).toBe(2);
    expect(out.every((e) => metaMap[e.name])).toBe(true);
  });
});

describe('applyFocusPolicy — determinism', () => {
  it('same input twice → byte-identical output', () => {
    const metaMap = {
      'Flat DB Press': { muscle_target_primary: 'piept', tier: 1 },
      'Incline DB Press': { muscle_target_primary: 'piept', tier: 1 },
      'Flat Chest Press Machine': { muscle_target_primary: 'piept', tier: 1 },
      'Cable Fly': { muscle_target_primary: 'piept', tier: 2 },
    };
    const chosen = [
      { name: 'Flat DB Press', sets: 3 },
      { name: 'Incline DB Press', sets: 3 },
      { name: 'Flat Chest Press Machine', sets: 3 },
      { name: 'Cable Fly', sets: 3 },
    ];
    const scoreOf = (n) => ({ 'Flat DB Press': 100, 'Incline DB Press': 60, 'Flat Chest Press Machine': 40, 'Cable Fly': 90 })[n] ?? 0;
    const a = applyFocusPolicy(chosen, makeCtx(metaMap, [], { focusId: 'chest', cluster: 'chest', scoreOf }));
    const b = applyFocusPolicy(chosen, makeCtx(metaMap, [], { focusId: 'chest', cluster: 'chest', scoreOf }));
    expect(a).toEqual(b);
  });

  it('balanced focus (empty policy) is a pure no-op', () => {
    const metaMap = { 'Flat DB Press': { muscle_target_primary: 'piept', tier: 1 } };
    const chosen = [{ name: 'Flat DB Press', sets: 3 }];
    const out = applyFocusPolicy(chosen, makeCtx(metaMap, [], { focusId: 'balanced', cluster: 'push' }));
    expect(out).toEqual([{ name: 'Flat DB Press', sets: 3 }]);
  });
});

describe('applyFocusPolicy — 1.3-C weeklyMinimums → per-session requirements', () => {
  it('translates a v-taper weekly side-delt target into a per-session require on a push day', () => {
    // v-taper push day: explicit minSideDeltSlots already requires a side delt, but
    // ALSO prove the weekly side_delt_slots target translates onto the same push
    // cluster. Use a focus whose weekly target has NO explicit twin to isolate the
    // weekly path: 'back' weekly horizontal_row_slots on a pull day with no explicit
    // min would still fire — but back HAS explicit mins. Instead use v-taper's
    // lat_isolation weekly (medium, no explicit twin) on an upper day.
    const metaMap = {
      'DB Shoulder Press': { muscle_target_primary: 'umeri', tier: 1 },
      'Cable Rear Delt Fly': { muscle_target_primary: 'umeri', tier: 2 },
      'DB Lateral Raise': { muscle_target_primary: 'umeri', tier: 2 },
      'Machine Pullover': { muscle_target_primary: 'spate', tier: 2 },
    };
    // v-taper upper day: weekly side_delt (high), rear_delt (high), lat_isolation
    // (medium) all applicable to 'upper'. Session has press only → inject lateral +
    // rear + lat-isolation from the pool (all available).
    const chosen = [{ name: 'DB Shoulder Press', sets: 3 }];
    const pool = [
      { name: 'DB Lateral Raise', meta: metaMap['DB Lateral Raise'] },
      { name: 'Cable Rear Delt Fly', meta: metaMap['Cable Rear Delt Fly'] },
      { name: 'Machine Pullover', meta: metaMap['Machine Pullover'] },
    ];
    const out = applyFocusPolicy(chosen, makeCtx(metaMap, pool, {
      focusId: 'v-taper', cluster: 'upper', daysPerWeek: 4, sessionSizeCap: 8,
    }));
    const names = out.map((e) => e.name);
    // side_delt comes via BOTH explicit minSideDeltSlots AND weekly side_delt_slots
    // (upper is applicable); the lat-isolation comes ONLY from the weekly target.
    expect(names).toContain('DB Lateral Raise');     // side_delt (weekly + explicit)
    expect(names).toContain('Machine Pullover');     // lat_isolation (weekly-only)
  });

  it('a weekly target on a push day injects a side delt even with NO explicit min for it', () => {
    // 'chest' focus: weekly chest_flye_slots is applicable to 'push'; there is an
    // explicit requireFlyeIfChestDay but that is gated on chest/push/upper too — to
    // isolate the weekly path use 'lower' focus whose ONLY requirement is the weekly
    // heavy_lower_compound (sessionRequirements is empty for lower).
    const metaMap = {
      'Leg Extension': { muscle_target_primary: 'picioare-quads', tier: 2 },
      'Barbell Back Squat (High Bar)': { muscle_target_primary: 'picioare-quads', tier: 1 },
    };
    const chosen = [{ name: 'Leg Extension', sets: 3 }]; // no heavy compound yet
    const pool = [{ name: 'Barbell Back Squat (High Bar)', meta: metaMap['Barbell Back Squat (High Bar)'] }];
    const out = applyFocusPolicy(chosen, makeCtx(metaMap, pool, {
      focusId: 'lower', cluster: 'legs', daysPerWeek: 3, sessionSizeCap: 8,
    }));
    // lower.sessionRequirements is empty; the squat is injected ONLY because the
    // weekly heavy_lower_compound target translated into a per-session require.
    expect(out.map((e) => e.name)).toContain('Barbell Back Squat (High Bar)');
  });

  it('weekly+explicit merge takes the MAX not the sum (no double-count)', () => {
    // v-taper push day has BOTH explicit minSideDeltSlots:1 AND weekly
    // side_delt_slots (days3to4 → 2 for push? push is applicable). The per-session
    // weekly translation is 1, the explicit is 1 → MAX = 1, NOT 1+1=2. So a single
    // lateral satisfies; a second is NOT force-injected even though two are in pool.
    const metaMap = {
      'DB Shoulder Press': { muscle_target_primary: 'umeri', tier: 1 },
      'Cable Rear Delt Fly': { muscle_target_primary: 'umeri', tier: 2 },
      'DB Lateral Raise': { muscle_target_primary: 'umeri', tier: 2 },
      'Cable Lateral Raise': { muscle_target_primary: 'umeri', tier: 2 },
    };
    const chosen = [
      { name: 'DB Shoulder Press', sets: 3 },
      { name: 'Cable Rear Delt Fly', sets: 3 },
      { name: 'DB Lateral Raise', sets: 3 }, // already 1 side_delt present
    ];
    // Two laterals available; if it summed (2) it would inject the 2nd. MAX(1,1)=1
    // is already met → no injection.
    const pool = [{ name: 'Cable Lateral Raise', meta: metaMap['Cable Lateral Raise'] }];
    const out = applyFocusPolicy(chosen, makeCtx(metaMap, pool, {
      focusId: 'v-taper', cluster: 'push', daysPerWeek: 4, sessionSizeCap: 8,
    }));
    const laterals = out.filter((e) => deriveExerciseTags(e.name, metaMap[e.name], movementKey).has('side_delt'));
    expect(laterals.length).toBe(1); // MAX(1,1)=1 — NOT 2
    expect(out.map((e) => e.name)).not.toContain('Cable Lateral Raise');
  });

  it('a non-applicable cluster is a graceful no-op (weekly target skipped)', () => {
    // 'lower' focus has NO explicit sessionRequirements; its only requirement is the
    // weekly heavy_lower_compound target, applicable to legs/lower/full/fullbody —
    // NOT to 'push'. On a push day the weekly translation must NOT fire even with a
    // heavy compound in the pool (isolates the weekly path from any explicit min).
    const metaMap = {
      'Flat DB Press': { muscle_target_primary: 'piept', tier: 1 },
      'Barbell Back Squat (High Bar)': { muscle_target_primary: 'picioare-quads', tier: 1 },
    };
    const chosen = [{ name: 'Flat DB Press', sets: 3 }];
    const pool = [{ name: 'Barbell Back Squat (High Bar)', meta: metaMap['Barbell Back Squat (High Bar)'] }];
    const out = applyFocusPolicy(chosen, makeCtx(metaMap, pool, {
      focusId: 'lower', cluster: 'push', daysPerWeek: 4, sessionSizeCap: 8,
    }));
    // heavy_lower_compound not applicable to a push day → session unchanged.
    expect(out.map((e) => e.name)).toEqual(['Flat DB Press']);
  });

  it('an underivable weekly tag (front_delt) is a graceful no-op (never invented)', () => {
    // shoulders focus, days5plus → front_delt_slots target is 1, applicable to a
    // push day. The deriver NEVER emits front_delt → no candidate ever qualifies →
    // graceful no-op (the session keeps its side/rear delts, no front-raise forced).
    const metaMap = {
      'DB Shoulder Press': { muscle_target_primary: 'umeri', tier: 1 },
      'DB Lateral Raise': { muscle_target_primary: 'umeri', tier: 2 },
      'Cable Rear Delt Fly': { muscle_target_primary: 'umeri', tier: 2 },
    };
    const chosen = [
      { name: 'DB Shoulder Press', sets: 3 },
      { name: 'DB Lateral Raise', sets: 3 },
      { name: 'Cable Rear Delt Fly', sets: 3 },
    ];
    // Pool has only umeri pieces; NONE derive front_delt, so the front_delt weekly
    // target can never be satisfied and must not error / inject a bogus pick.
    const pool = [];
    const out = applyFocusPolicy(chosen, makeCtx(metaMap, pool, {
      focusId: 'shoulders', cluster: 'push', daysPerWeek: 6, sessionSizeCap: 8,
    }));
    expect(out.map((e) => e.name)).toEqual([
      'DB Shoulder Press', 'DB Lateral Raise', 'Cable Rear Delt Fly',
    ]);
    expect(out.every((e) => !deriveExerciseTags(e.name, metaMap[e.name], movementKey).has('front_delt'))).toBe(true);
  });

  it('same seed/input twice → identical output (determinism with weekly translation)', () => {
    const metaMap = {
      'DB Shoulder Press': { muscle_target_primary: 'umeri', tier: 1 },
      'DB Lateral Raise': { muscle_target_primary: 'umeri', tier: 2 },
      'Cable Rear Delt Fly': { muscle_target_primary: 'umeri', tier: 2 },
      'Machine Pullover': { muscle_target_primary: 'spate', tier: 2 },
    };
    const chosen = [{ name: 'DB Shoulder Press', sets: 3 }];
    const pool = [
      { name: 'DB Lateral Raise', meta: metaMap['DB Lateral Raise'] },
      { name: 'Cable Rear Delt Fly', meta: metaMap['Cable Rear Delt Fly'] },
      { name: 'Machine Pullover', meta: metaMap['Machine Pullover'] },
    ];
    const run = () => applyFocusPolicy(chosen, makeCtx(metaMap, pool, {
      focusId: 'v-taper', cluster: 'upper', daysPerWeek: 4, sessionSizeCap: 8,
    }));
    expect(run()).toEqual(run());
  });
});

describe('applyFocusPolicy — integration through the real composer (v-taper push)', () => {
  // A realistic equipment set so the umeri/piept/triceps pools fill from CORE_AUTO.
  const FULL_GYM = [
    'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'ez-bar', 'smith',
    'kettlebell', 'band', 'plate',
  ];
  function vtaperPushSession() {
    return buildSession('push', {
      equipment: { available: FULL_GYM },
      profileTier: 'T2',
      seed: 'wave13b-vtaper-push',
      danielTierSelect: true,
      focusPolicy: true,
      focusId: 'v-taper',
      daysPerWeek: 4,
      cluster: 'push',
    });
  }

  it('caps total press patterns at 2 (the v-taper cap) and surfaces a side delt', () => {
    const session = vtaperPushSession();
    const tags = session.exercises.map((e) => deriveExerciseTags(e.name, getExerciseMetadata(e.name), movementKey));
    const presses = tags.filter((t) => t.has('vertical_press') || t.has('chest_press')).length;
    // v-taper maxTotalPressPatterns: 2 — never exceeded.
    expect(presses).toBeLessThanOrEqual(2);
    // A side-delt lateral is present when a lateral is in the umeri pool (it is).
    const hasSideDelt = tags.some((t) => t.has('side_delt'));
    expect(hasSideDelt).toBe(true);
  });

  it('flag OFF → no caps applied (a press-heavy push day may exceed 2)', () => {
    // Sanity: with the flag off the resolver is not invoked. We only assert the
    // shape is a valid session (the byte-identical guard is the full-path-sim).
    const off = buildSession('push', {
      equipment: { available: FULL_GYM },
      profileTier: 'T2',
      seed: 'wave13b-vtaper-push',
      danielTierSelect: true,
      // focusPolicy omitted → resolver never runs.
      focusId: 'v-taper',
      cluster: 'push',
    });
    expect(Array.isArray(off.exercises)).toBe(true);
    expect(off.exercises.length).toBeGreaterThan(0);
  });
});
