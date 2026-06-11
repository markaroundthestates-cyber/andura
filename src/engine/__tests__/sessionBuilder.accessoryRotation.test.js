// ══ dp_accessory_rotation_v1 — ANCHOR/ACCESSORY rotation (Daniel "monotonia tampa"
// 2026-06-11) ════════════════════════════════════════════════════════════════════
//
// On a MATURE account everything is logged, so PR-stickiness made every program
// identical week-to-week. Policy: ANCHORS repeat (tier-1 compounds + the lifts the
// user progresses on), ACCESSORIES rotate (tier 2-3 isolations). The rotation is the
// FINAL step on the fully-ordered poolForGroup output: among the TOP isolation (tier>1)
// candidates, when the first two are score-equal-ish AND BOTH are logged, their order
// alternates on the ISO-week parity (derived from the EXISTING seed `uid|weekStartIso|
// dayIdx`, NOT Date.now()). A demoted (refusal/structural) lift is never a rotation
// candidate, so the demote stays strictly stronger than the rotation. OFF → byte-
// identical pool order.
//
// The rotation lever lives in poolForGroup (which variant of an equal-ish family leads),
// so the round-robin in buildSession picks the rotated head and the movement-dedup
// collapses the rest of the family — i.e. the SAME isolation slot shows a DIFFERENT
// logged variant on alternating weeks while compounds repeat.

import { describe, it, expect } from 'vitest';
import { buildSession, poolForGroup } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';

// Real library exercises (verified tier/group in exercises.json 2026-06-11):
//  - curls (biceps, tier 2, all "curl" → ONE movementKey biceps::curl, so the pool
//    HEAD decides which variant fills the single biceps::curl slot):
const CURLS = ['Bayesian Curl', 'Hammer Curl', 'Incline DB Curl']; // all S-band
//  - lateral raises (umeri, tier 2, all "lateral" → ONE movementKey umeri::lateral-raise):
const LATERALS = ['DB Lateral Raise', 'Cable Lateral Raise', 'Machine Lateral Raise'];

// Two seeds ONE ISO-week apart (consecutive Mondays) → guaranteed opposite parity, so
// the rotation MUST flip between them. A third for a 2-week span (same parity as the
// first → the rotation returns to the original head; the "alternates" contract).
const WEEK_A = '2026-05-25'; // a Monday
const WEEK_B = '2026-06-01'; // the next Monday (ISO week+1 → opposite parity)
const WEEK_C = '2026-06-08'; // two Mondays after A (ISO week+2 → SAME parity as A)
const seedFor = (week, uid = 'mature-user', day = 0) => `${uid}|${week}|${day}`;

const ALL_EQUIP = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];

// A mature account: it has logged the rotatable accessories (so PR-stickiness would
// otherwise pin them) AND the compound anchors (so anchors are clearly repeat-eligible).
const MATURE_PR = [
  ...CURLS, ...LATERALS,
  'Leg Press', 'Romanian Deadlift', 'Lat Pulldown', 'Cable Row', // tier-1 anchors
  'Flat DB Press', 'Incline DB Press',
];

const baseCtx = (over = {}) => ({
  equipment: { available: ALL_EQUIP },
  profileTier: 'T2',
  prNames: MATURE_PR,
  danielTierSelect: true, // the live default — rotation judges equal-ish on this score
  ...over,
});

const names = (session) => session.exercises.map((e) => e.name);
const groupLead = (session, group) => {
  for (const e of session.exercises) {
    if (getExerciseMetadata(e.name).muscle_target_primary === group) return e.name;
  }
  return undefined;
};

// ── poolForGroup-level: the rotation head-swap on the ordered pool ──────────────

describe('dp_accessory_rotation_v1 — poolForGroup head rotation', () => {
  const POOL_ARGS = (group, prNames, accessoryRotation, weekParity) => [
    group, new Set(ALL_EQUIP), 3, 2, new Set(prNames),
    12345, null, null, null, /* danielTierSelect */ true, /* structuralPenalties */ null,
    accessoryRotation, weekParity,
  ];
  const topIsolation = (pool) =>
    pool.find((e) => (getExerciseMetadata(e.name).tier ?? 2) > 1)?.name;

  it('even vs odd ISO-week parity swaps the TOP equal-ish logged isolation', () => {
    const even = poolForGroup(...POOL_ARGS('biceps', CURLS, true, 0));
    const odd = poolForGroup(...POOL_ARGS('biceps', CURLS, true, 1));
    const headEven = topIsolation(even);
    const headOdd = topIsolation(odd);
    expect(headEven).toBeTruthy();
    expect(headOdd).toBeTruthy();
    // The two top equal-ish logged curls must trade the lead between parities.
    expect(headOdd).not.toBe(headEven);
    expect(CURLS).toContain(headEven);
    expect(CURLS).toContain(headOdd);
  });

  it('rotation OFF (flag falsy) → pool order is byte-identical to no-rotation', () => {
    const off = poolForGroup(...POOL_ARGS('biceps', CURLS, false, 0)).map((e) => e.name);
    const noArg = poolForGroup('biceps', new Set(ALL_EQUIP), 3, 2, new Set(CURLS),
      12345, null, null, null, true, null).map((e) => e.name);
    expect(off).toEqual(noArg);
  });

  it('null parity (unparsable week) → no rotation even with the flag on', () => {
    const evenWorld = poolForGroup(...POOL_ARGS('biceps', CURLS, true, 0)).map((e) => e.name);
    const nullWorld = poolForGroup(...POOL_ARGS('biceps', CURLS, true, null)).map((e) => e.name);
    // parity 0 keeps the sorted lead, and null performs no swap → both equal the
    // sorted order (the swap only ever happens at parity 1).
    expect(nullWorld).toEqual(evenWorld);
  });

  it('a single logged isolation candidate is NOT rotated (needs two)', () => {
    // Only ONE curl logged → no second equal-ish candidate → head is stable across parity.
    const even = poolForGroup(...POOL_ARGS('biceps', ['Bayesian Curl'], true, 0));
    const odd = poolForGroup(...POOL_ARGS('biceps', ['Bayesian Curl'], true, 1));
    expect(topIsolation(even)).toBe(topIsolation(odd));
  });

  it('determinism: same seed/parity × 2 runs → identical pool order', () => {
    const a = poolForGroup(...POOL_ARGS('umeri', LATERALS, true, 1)).map((e) => e.name);
    const b = poolForGroup(...POOL_ARGS('umeri', LATERALS, true, 1)).map((e) => e.name);
    expect(a).toEqual(b);
  });

  it('a demoted lift never returns to the head via rotation', () => {
    // Demote the variant that WOULD lead on odd weeks; rotation must not resurface it
    // ahead of a clean sibling. A LOGGED rotation candidate is PR-exempt from the SOFT
    // (refusal/pain) channel, so a logged demote can only come from the STRUCTURAL
    // channel — use that (it pierces the PR exemption) to demote the head hard.
    const oddHead = topIsolation(poolForGroup(...POOL_ARGS('biceps', CURLS, true, 1)));
    expect(oddHead).toBeTruthy();
    const structural = { [oddHead]: 0.9 }; // ≥ 0.5 demote cutoff (pierces PR exemption)
    const POOL_DEMOTE = (parity) => [
      'biceps', new Set(ALL_EQUIP), 3, 2, new Set(CURLS),
      12345, null, null, null, true, structural, true, parity,
    ];
    const evenNames = poolForGroup(...POOL_DEMOTE(0)).map((e) => e.name);
    const oddNames = poolForGroup(...POOL_DEMOTE(1)).map((e) => e.name);
    // The demoted lift sits at the BACK on BOTH parities (partition wins); the head is
    // a clean sibling on both, and rotation never lifts the demoted one above it.
    const top = (arr) => arr.find((n) => CURLS.includes(n));
    expect(top(evenNames)).not.toBe(oddHead);
    expect(top(oddNames)).not.toBe(oddHead);
    // It still exists (demote-only, last-option safety) but behind its clean siblings.
    expect(oddNames.indexOf(oddHead)).toBeGreaterThan(oddNames.indexOf(top(oddNames)));
  });
});

// ── buildSession-level: end-to-end pick rotates accessories, repeats anchors ────

describe('dp_accessory_rotation_v1 — buildSession end-to-end (mature account)', () => {
  // 'full' gives every group (incl. biceps + umeri) a slot, so the rotatable
  // biceps::curl / umeri::lateral-raise families are reliably present in the session.
  const buildWk = (week, over = {}) =>
    buildSession('full', baseCtx({ accessoryRotation: true, seed: seedFor(week), ...over }));

  it('the rotatable isolation pick DIFFERS across consecutive ISO weeks', () => {
    const curlA = groupLead(buildWk(WEEK_A), 'biceps');
    const curlB = groupLead(buildWk(WEEK_B), 'biceps');
    expect(CURLS, 'biceps slot should be a logged rotatable curl').toContain(curlA);
    expect(CURLS).toContain(curlB);
    // Consecutive weeks → opposite parity → the biceps::curl slot shows a DIFFERENT
    // logged variant (the anti-monotony win).
    expect(curlB).not.toBe(curlA);
  });

  it('the SAME parity (2 weeks apart) returns the SAME rotatable pick (alternation)', () => {
    expect(groupLead(buildWk(WEEK_C), 'biceps')).toBe(groupLead(buildWk(WEEK_A), 'biceps'));
  });

  it('TIER-1 ANCHORS are untouched by rotation (only accessories rotate)', () => {
    const anchorsOf = (s) =>
      names(s).filter((n) => (getExerciseMetadata(n).tier ?? 2) === 1).sort();
    // The rotation step only reorders tier>1 head pairs, never a tier-1 anchor: for the
    // SAME seed the anchor set is identical with rotation ON vs OFF. (Cross-week anchor
    // variety, when anchors are unlogged equal-band siblings, is the long-standing
    // seeded selection — `seed` hashes weekStartIso — not this lever; a LOGGED anchor
    // carries the +10 log bonus and stays put week-to-week.)
    const on = buildWk(WEEK_A);
    const off = buildSession('full', baseCtx({ accessoryRotation: false, seed: seedFor(WEEK_A) }));
    expect(anchorsOf(on)).toEqual(anchorsOf(off));
  });

  it('a single-candidate group is identical across weeks (nothing to rotate)', () => {
    // 'legs' trains gambe (calves); seed a mature user with ONE logged calf isolation
    // so its slot has no equal-ish sibling → stable across parity.
    const pr = [...MATURE_PR, 'Standing Calf Raise Machine'];
    const wkA = buildSession('legs', baseCtx({ accessoryRotation: true, prNames: pr, seed: seedFor(WEEK_A) }));
    const wkB = buildSession('legs', baseCtx({ accessoryRotation: true, prNames: pr, seed: seedFor(WEEK_B) }));
    expect(groupLead(wkA, 'gambe')).toBe(groupLead(wkB, 'gambe'));
  });

  it('OFF (no accessoryRotation in ctx) → byte-identical session across many seeds', () => {
    // The kill-switch contract: with the flag absent the rotation NEVER runs, so the
    // session is whatever today's selection produces — proven by comparing the
    // flag-absent build to an explicit accessoryRotation:false build on many seeds.
    for (const week of [WEEK_A, WEEK_B, WEEK_C]) {
      for (const cluster of ['push', 'pull', 'legs', 'upper', 'full']) {
        const absent = buildSession(cluster, baseCtx({ seed: seedFor(week, 'k', 0) }));
        const explicitOff = buildSession(cluster, baseCtx({ accessoryRotation: false, seed: seedFor(week, 'k', 0) }));
        expect(names(explicitOff)).toEqual(names(absent));
      }
    }
  });

  it('determinism: same seed × 2 builds → identical session (flag ON)', () => {
    const a = buildSession('pull', baseCtx({ accessoryRotation: true, seed: seedFor(WEEK_B) }));
    const b = buildSession('pull', baseCtx({ accessoryRotation: true, seed: seedFor(WEEK_B) }));
    expect(names(a)).toEqual(names(b));
  });

  it('laterals (umeri) rotate the same way on a shoulder day', () => {
    // The umeri LEAD is a tier-1 press anchor (and varies by the seeded selection across
    // weeks); the rotatable lateral is the umeri ACCESSORY slot, found by name not by
    // lead. When the day surfaces a logged lateral on both weeks, consecutive (opposite-
    // parity) weeks must alternate which logged lateral fills the slot.
    const lateralOf = (s) => names(s).find((n) => LATERALS.includes(n));
    const latA = lateralOf(buildSession('push', baseCtx({ accessoryRotation: true, seed: seedFor(WEEK_A) })));
    const latB = lateralOf(buildSession('push', baseCtx({ accessoryRotation: true, seed: seedFor(WEEK_B) })));
    if (latA && latB) expect(latB).not.toBe(latA);
  });
});
