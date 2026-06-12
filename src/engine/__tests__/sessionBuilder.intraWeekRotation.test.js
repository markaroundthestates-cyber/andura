// ══ dp_rotation_intraweek_v1 — INTRA-WEEK isolation rotation (isolation-rotation arc
// 2026-06-12) ════════════════════════════════════════════════════════════════════════
//
// Extends the CROSS-week dp_accessory_rotation_v1 one dimension over: adjacent TRAINING
// DAYS within a week repeat the same UNLOGGED isolations (the sweep's "repetate adiacent"
// info signals). Founder verdict: ANCHORS repeat BY DESIGN (logged DP-tracked lifts +
// tier-1 compounds — DP continuity needs stable anchors), UNLOGGED isolations of equal-ish
// standing VARY on adjacent days. poolForGroup rotates the top equal-ish UNLOGGED isolation
// head by the TRAINING-DAY ORDINAL within the week (intraWeekDayOrdinal — count of active
// days before today, NOT Date.now()), so consecutive ordinals surface a DIFFERENT
// equivalent-role variant of the same family. Logged isolations stay (they are anchors);
// no equivalent → the repeat stays; determinism is a pure function of week/day indices.
//
// The lever lives in poolForGroup (which variant of an equal-ish family leads), so the
// round-robin in buildSession picks the rotated head and the movement-dedup collapses the
// rest of the family — the SAME isolation slot shows a DIFFERENT unlogged variant on
// adjacent training days while compounds + logged isolations repeat.

import { describe, it, expect } from 'vitest';
import { buildSession, poolForGroup } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';

const ALL_EQUIP = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];

// Real library exercises (verified tier/group/equipment/band in exercises.json +
// exerciseTierRank.js 2026-06-12):
//  - laterals (umeri, tier 2, all "lateral" → ONE movementKey umeri::lateral-raise, so the
//    pool HEAD decides which variant fills the single lateral slot). All UNLOGGED in these
//    tests = the safe rotatable set. These three are ALL Daniel S-band (tierSelectScore 100)
//    so they are EQUAL-ISH (|Δ| <= HAS_LOG_BONUS 10) and rotate as a 3-cycle. (DB Lateral
//    Raise is a LOWER band → not equal-ish → deliberately NOT in this set.)
const LATERALS = ['Machine Lateral Raise', 'Cable Lateral Raise', 'Behind-the-Back Cable Lateral'];
//  - calf raises (gambe, tier 2, all "calf raise" → ONE movementKey gambe::calf) — a second
//    family to prove the rotation is not lateral-specific. Seated + Standing Calf Raise
//    Machine are both S-band (score 100) = equal-ish.
const _CALVES = ['Seated Calf Raise Machine', 'Standing Calf Raise Machine'];

// ── poolForGroup-level: the intra-week rotation on the ordered pool ──────────────
describe('dp_rotation_intraweek_v1 — poolForGroup head rotation (unlogged isolations)', () => {
  // Positional args: ...accessoryRotation(false), weekParity(null), progressingNames(null),
  // intraWeekRotation, intraWeekDayOrdinal. Cross-week rotation OFF so we isolate intra-week.
  const POOL_ARGS = (group, prNames, intraWeekRotation, dayOrdinal) => [
    group, new Set(ALL_EQUIP), 3, 2, new Set(prNames),
    12345, null, null, null, /* danielTierSelect */ true, /* structuralPenalties */ null,
    /* accessoryRotation */ false, /* weekParity */ null, /* progressingNames */ null,
    intraWeekRotation, dayOrdinal,
  ];
  const _topIsolation = (pool) =>
    pool.find((e) => (getExerciseMetadata(e.name).tier ?? 2) > 1)?.name;
  // The LATERAL the pool surfaces (the umeri::lateral-raise role's lead) — used to track a
  // SPECIFIC equivalent-role family so a test is never satisfied by a different role's head.
  const topLateral = (pool) => pool.find((e) => LATERALS.includes(e.name))?.name;

  it('adjacent training-day ordinals surface a DIFFERENT equal-ish unlogged isolation', () => {
    // prNames EMPTY → every lateral is UNLOGGED → the safe rotatable set. Three S-band
    // laterals collapse to umeri::lateral-raise; the role head decides the variant. Track
    // the LATERAL role explicitly so we assert the equivalent-role family, not whichever
    // isolation happens to lead the pool.
    const d0 = topLateral(poolForGroup(...POOL_ARGS('umeri', [], true, 0)));
    const d1 = topLateral(poolForGroup(...POOL_ARGS('umeri', [], true, 1)));
    const d2 = topLateral(poolForGroup(...POOL_ARGS('umeri', [], true, 2)));
    expect(d0).toBeTruthy();
    expect(LATERALS).toContain(d0);
    // Consecutive ordinals → consecutive variants of the equal-ish family → adjacent days
    // differ (the anti-monotony win the founder asked for).
    expect(d1).not.toBe(d0);
    expect(d2).not.toBe(d1);
  });

  it('the rotation CYCLES: ordinal k and k+roleSize lead with the same variant', () => {
    // 3 equal-ish laterals → the umeri::lateral-raise role has period 3. Ordinal 0 and 3
    // must surface the same lateral (modular rotation of that role's equal-ish run).
    const d0 = topLateral(poolForGroup(...POOL_ARGS('umeri', [], true, 0)));
    const d3 = topLateral(poolForGroup(...POOL_ARGS('umeri', [], true, 3)));
    expect(d0).toBeTruthy();
    expect(d3).toBe(d0);
  });

  it('rotation OFF (flag falsy) → pool order is byte-identical to no-rotation', () => {
    const off = poolForGroup(...POOL_ARGS('umeri', [], false, 1)).map((e) => e.name);
    const noArg = poolForGroup('umeri', new Set(ALL_EQUIP), 3, 2, new Set(),
      12345, null, null, null, true, null).map((e) => e.name);
    expect(off).toEqual(noArg);
  });

  it('ordinal 0 keeps the sorted lead (no change vs no-rotation)', () => {
    const ord0 = poolForGroup(...POOL_ARGS('umeri', [], true, 0)).map((e) => e.name);
    const noArg = poolForGroup('umeri', new Set(ALL_EQUIP), 3, 2, new Set(),
      12345, null, null, null, true, null).map((e) => e.name);
    expect(ord0).toEqual(noArg);
  });

  it('null / negative ordinal → no rotation even with the flag on', () => {
    const base = poolForGroup(...POOL_ARGS('umeri', [], true, 0)).map((e) => e.name);
    const nullWorld = poolForGroup(...POOL_ARGS('umeri', [], true, null)).map((e) => e.name);
    const negWorld = poolForGroup(...POOL_ARGS('umeri', [], true, -1)).map((e) => e.name);
    expect(nullWorld).toEqual(base);
    expect(negWorld).toEqual(base);
  });

  it('LOGGED isolations are IMMUNE — a logged role never rotates (DP anchor)', () => {
    // All three laterals LOGGED → the umeri::lateral-raise role is all anchors (DP
    // continuity), NOT the unlogged safe set → that role surfaces the SAME logged lateral
    // across ordinals. (Other umeri roles may rotate, but the LOGGED lateral family does not.)
    const d0 = topLateral(poolForGroup(...POOL_ARGS('umeri', LATERALS, true, 0)));
    const d1 = topLateral(poolForGroup(...POOL_ARGS('umeri', LATERALS, true, 1)));
    const d2 = topLateral(poolForGroup(...POOL_ARGS('umeri', LATERALS, true, 2)));
    expect(d0).toBeTruthy();
    expect(d1).toBe(d0);
    expect(d2).toBe(d0);
  });

  it('a SINGLE unlogged equal-ish candidate is NOT rotated (no equivalent → repeat stays)', () => {
    // Only ONE lateral UNLOGGED (the others logged → anchors, excluded) → fewer than two
    // equal-ish unlogged equivalents in the lateral role → that role is stable across
    // ordinals. The graceful no-equivalent fallback: a repeat beats forcing a worse lift.
    const onlyOneUnlogged = [...LATERALS.slice(1)]; // log 2 of 3 → 1 unlogged lateral remains
    const d0 = topLateral(poolForGroup(...POOL_ARGS('umeri', onlyOneUnlogged, true, 0)));
    const d1 = topLateral(poolForGroup(...POOL_ARGS('umeri', onlyOneUnlogged, true, 1)));
    expect(d0).toBe(d1);
  });

  it('determinism: same group/ordinal × 2 runs → byte-identical pool order', () => {
    const a = poolForGroup(...POOL_ARGS('gambe', [], true, 2)).map((e) => e.name);
    const b = poolForGroup(...POOL_ARGS('gambe', [], true, 2)).map((e) => e.name);
    expect(a).toEqual(b);
  });

  it('a structurally-demoted unlogged lift never leads via rotation', () => {
    // Demote the LATERAL that WOULD lead at ordinal 1; the structural channel (≥0.5) sinks
    // it to the back, and the rotation never resurfaces it ahead of a clean lateral sibling.
    const lead = topLateral(poolForGroup(...POOL_ARGS('umeri', [], true, 1)));
    expect(lead).toBeTruthy();
    const structural = { [lead]: 0.9 };
    const ARGS_DEMOTE = (ord) => [
      'umeri', new Set(ALL_EQUIP), 3, 2, new Set(),
      12345, null, null, null, true, structural,
      false, null, null, true, ord,
    ];
    for (const ord of [0, 1, 2]) {
      const names = poolForGroup(...ARGS_DEMOTE(ord)).map((e) => e.name);
      const surfacedLateral = names.find((n) => LATERALS.includes(n));
      // The demoted lift is never the surfaced lateral (it sits behind its clean siblings),
      // and it still exists (demote-only, last-option safety).
      expect(surfacedLateral).not.toBe(lead);
      expect(names.indexOf(lead)).toBeGreaterThan(names.indexOf(surfacedLateral));
    }
  });
});

// ── buildSession-level: end-to-end adjacent-day variety, anchors repeat ─────────
describe('dp_rotation_intraweek_v1 — buildSession end-to-end', () => {
  // A FRESH user (no logs) so every isolation is unlogged = the safe rotatable set, the
  // cold-start case the founder verdict centers on. 'full' gives umeri + gambe a slot.
  const freshCtx = (over = {}) => ({
    equipment: { available: ALL_EQUIP },
    profileTier: 'T2',
    prNames: [],
    danielTierSelect: true, // the live default — rotation judges equal-ish on this score
    seed: 'fresh-user|2026-06-15|0',
    ...over,
  });
  const names = (s) => s.exercises.map((e) => e.name);
  const lateralOf = (s) => names(s).find((n) => LATERALS.includes(n));

  it('the lateral slot DIFFERS across adjacent training-day ordinals (fresh user)', () => {
    const d0 = lateralOf(buildSession('full', freshCtx({ rotationIntraWeek: true, intraWeekDayOrdinal: 0 })));
    const d1 = lateralOf(buildSession('full', freshCtx({ rotationIntraWeek: true, intraWeekDayOrdinal: 1 })));
    // When both days surface a lateral, consecutive ordinals must show a DIFFERENT variant.
    if (d0 && d1) {
      expect(LATERALS).toContain(d0);
      expect(d1).not.toBe(d0);
    }
  });

  it('TIER-1 ANCHORS are untouched by intra-week rotation (same seed, on vs off)', () => {
    const anchorsOf = (s) =>
      names(s).filter((n) => (getExerciseMetadata(n).tier ?? 2) === 1).sort();
    const on = buildSession('full', freshCtx({ rotationIntraWeek: true, intraWeekDayOrdinal: 1 }));
    const off = buildSession('full', freshCtx({ rotationIntraWeek: false, intraWeekDayOrdinal: 1 }));
    expect(anchorsOf(on)).toEqual(anchorsOf(off));
  });

  it('LOGGED isolations repeat across ordinals (mature account, DP continuity)', () => {
    // A mature account that logged every lateral → laterals are anchors → the lateral slot
    // is STABLE across adjacent ordinals (the founder rule: logged = anchor = stays).
    const matureCtx = (ord) => freshCtx({
      prNames: ['DB Lateral Raise', 'Cable Lateral Raise', 'Machine Lateral Raise'],
      rotationIntraWeek: true, intraWeekDayOrdinal: ord,
    });
    const d0 = lateralOf(buildSession('full', matureCtx(0)));
    const d1 = lateralOf(buildSession('full', matureCtx(1)));
    if (d0 && d1) expect(d1).toBe(d0);
  });

  it('determinism: same ordinal × 2 builds → identical session (flag ON)', () => {
    const a = buildSession('full', freshCtx({ rotationIntraWeek: true, intraWeekDayOrdinal: 2 }));
    const b = buildSession('full', freshCtx({ rotationIntraWeek: true, intraWeekDayOrdinal: 2 }));
    expect(names(a)).toEqual(names(b));
  });

  it('OFF (no rotationIntraWeek in ctx) → byte-identical session across ordinals & clusters', () => {
    // The kill-switch contract: with the flag absent the rotation NEVER runs, so the
    // session is whatever today's selection produces regardless of the ordinal.
    for (const ord of [0, 1, 2, 3]) {
      for (const cluster of ['push', 'pull', 'legs', 'upper', 'full']) {
        const absent = buildSession(cluster, freshCtx({ intraWeekDayOrdinal: ord }));
        const explicitOff = buildSession(cluster, freshCtx({ rotationIntraWeek: false, intraWeekDayOrdinal: ord }));
        expect(names(explicitOff)).toEqual(names(absent));
      }
    }
  });
});
