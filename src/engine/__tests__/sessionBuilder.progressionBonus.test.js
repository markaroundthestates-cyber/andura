// ══ #42 progression-conditioned selection bonus — wiring tests ════════════════
// Proves: a logged lift the user is PROGRESSING on edges ahead of an equal-band
// non-progressing sibling (the +5), but NEVER jumps a selection band (so an
// unlogged-S still beats a progressing logged-A/C); and the bonus is OFF by default
// (no progressingNames / progressionBonus gate off → byte-identical pool order).

import { describe, it, expect } from 'vitest';
import { buildSession, poolForGroup } from '../sessionBuilder.js';
import { EXERCISE_TIER_RANK, tierRankOf } from '../exerciseTierRank.js';

const ALL_EQUIP = new Set(['barbell', 'dumbbell', 'machine', 'cable', 'band']);
// poolForGroup positional args (tier-select path ON), with an optional
// progressingNames set as the LAST arg.
const pool = (prNames, progressing) =>
  poolForGroup(
    'biceps', ALL_EQUIP, 3, 2, prNames, 12345,
    null /*penalties*/, null /*painSwaps*/, null /*excluded*/, true /*danielTierSelect*/,
    null /*structural*/, false /*accessoryRotation*/, null /*weekParity*/,
    progressing /*progressingNames*/,
  ).map((e) => e.name);

describe('#42 bonus — equal-band: a progressing logged lift edges ahead', () => {
  // Two A-band biceps lifts. Both logged (so the +10 log bonus is equal); only one
  // is progressing → it gets the extra +5 → it leads its A-band sibling.
  const A1 = 'Cable Curl';
  const A2 = 'DB Curl Standing';

  it('the two are A-band (precondition)', () => {
    expect(EXERCISE_TIER_RANK[A1]).toBe('A');
    expect(EXERCISE_TIER_RANK[A2]).toBe('A');
  });

  it('progressing A leads the non-progressing A sibling', () => {
    const prNames = new Set([A1, A2]);
    const ordered = pool(prNames, new Set([A1]));
    expect(ordered.indexOf(A1)).toBeLessThan(ordered.indexOf(A2));
  });

  it('switching which one progresses flips the order (the +5 is the cause)', () => {
    const prNames = new Set([A1, A2]);
    const ordered = pool(prNames, new Set([A2]));
    expect(ordered.indexOf(A2)).toBeLessThan(ordered.indexOf(A1));
  });
});

describe('#42 bonus — bounded: never jumps a selection band', () => {
  it('a progressing logged C does NOT beat an unlogged S (45+5 < 100)', () => {
    // Preacher Curl = C-band biceps; Bayesian Curl = S-band biceps (unlogged).
    const C = 'Preacher Curl';
    const S = 'Bayesian Curl';
    expect(EXERCISE_TIER_RANK[C]).toBe('C');
    expect(EXERCISE_TIER_RANK[S]).toBe('S');
    const ordered = pool(new Set([C]), new Set([C]));
    // The S-band lead still fronts the logged+progressing C (35+10+5 = 50 < 100).
    expect(tierRankOf(ordered[0])).toBeLessThanOrEqual(1); // S or A leads, not the C
    expect(ordered.indexOf(S)).toBeLessThan(ordered.indexOf(C));
  });
});

describe('#42 bonus — OFF is byte-identical', () => {
  it('no progressingNames arg → identical pool order to an empty set', () => {
    const prNames = new Set(['Cable Curl', 'DB Curl Standing']);
    const withoutArg = poolForGroup(
      'biceps', ALL_EQUIP, 3, 2, prNames, 12345,
      null, null, null, true, null, false, null,
    ).map((e) => e.name);
    const withNull = pool(prNames, null);
    expect(withoutArg).toEqual(withNull);
  });

  it('buildSession ignores progressingNames when progressionBonus gate is OFF', () => {
    const baseCtx = {
      equipment: { available: [...ALL_EQUIP] },
      profileTier: 'T2',
      prNames: ['Cable Curl', 'DB Curl Standing'],
      seed: 'user-1|2026-05-25|0',
      danielTierSelect: true,
    };
    const off = buildSession('pull', baseCtx).exercises.map((e) => e.name);
    // Same ctx + a progressingNames set but progressionBonus NOT true → gate OFF →
    // the set is ignored → identical composition (byte-identical).
    const gatedOff = buildSession('pull', {
      ...baseCtx,
      progressingNames: new Set(['Cable Curl']),
      // progressionBonus omitted (=> not === true) → ignored
    }).exercises.map((e) => e.name);
    expect(gatedOff).toEqual(off);
  });
});
