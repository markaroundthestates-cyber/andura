// Tests for WP-3 muscle vocabulary reconciliation — Big-11 RO ↔ engine head
// groups bidirectional map (unblocks deferred-P1 weakness-selection + set-count
// that today cannot connect because vocabularies mismatch).

import { describe, it, expect } from 'vitest';
import {
  BIG11_GROUPS,
  HEAD_TO_BIG11,
  BIG11_TO_HEADS,
  headToBig11,
  big11ToHeads,
} from '../muscleGroupMap.js';
import { MUSCLE_HEADS } from '../muscleMap.js';
import { EXERCISE_METADATA } from '../exerciseLibrary.js';

describe('BIG11_GROUPS — library canonical RO vocabulary', () => {
  it('is exactly the 11 canonical RO groups', () => {
    expect([...BIG11_GROUPS].sort()).toEqual(
      [
        'antebrate', 'biceps', 'core', 'fese', 'gambe', 'picioare-hamstrings',
        'picioare-quads', 'piept', 'spate', 'triceps', 'umeri',
      ]
    );
  });

  it('contains every muscle_target_primary used in the library (except unknown sentinel)', () => {
    const used = new Set(
      Object.values(EXERCISE_METADATA)
        .map((m) => m.muscle_target_primary)
        .filter((g) => g && g !== 'unknown')
    );
    for (const g of used) {
      expect(BIG11_GROUPS).toContain(g);
    }
  });
});

describe('HEAD_TO_BIG11 — engine head → Big-11 RO (many-to-one)', () => {
  it('covers every key in muscleMap.MUSCLE_HEADS', () => {
    for (const head of Object.keys(MUSCLE_HEADS)) {
      expect(HEAD_TO_BIG11[head], `head ${head} should map`).toBeDefined();
    }
  });

  it('every mapped target is a valid Big-11 group', () => {
    for (const group of Object.values(HEAD_TO_BIG11)) {
      expect(BIG11_GROUPS).toContain(group);
    }
  });

  it('collapses the 3 delts + rear_delt_trap to umeri', () => {
    expect(headToBig11('delt_front')).toBe('umeri');
    expect(headToBig11('delt_mid')).toBe('umeri');
    expect(headToBig11('delt_rear')).toBe('umeri');
    expect(headToBig11('rear_delt_trap')).toBe('umeri');
  });

  it('maps lats/traps/lower-back to spate, calf to gambe, glute to fese', () => {
    expect(headToBig11('lat')).toBe('spate');
    expect(headToBig11('mid_trap')).toBe('spate');
    expect(headToBig11('lower_back')).toBe('spate');
    expect(headToBig11('calf')).toBe('gambe');
    expect(headToBig11('glute')).toBe('fese');
  });

  it('returns null for unknown / non-string head', () => {
    expect(headToBig11('nope')).toBeNull();
    expect(headToBig11(null)).toBeNull();
    expect(headToBig11(42)).toBeNull();
  });
});

describe('BIG11_TO_HEADS — Big-11 RO → engine heads (one-to-many)', () => {
  it('umeri expands to all shoulder heads', () => {
    expect([...big11ToHeads('umeri')].sort()).toEqual(
      ['delt_front', 'delt_mid', 'delt_rear', 'rear_delt_trap']
    );
  });

  it('antebrate + core have no engine head modelled (empty, honest)', () => {
    expect(big11ToHeads('antebrate')).toEqual([]);
    expect(big11ToHeads('core')).toEqual([]);
  });

  it('returns [] for unknown / non-string group', () => {
    expect(big11ToHeads('nope')).toEqual([]);
    expect(big11ToHeads(null)).toEqual([]);
  });
});

describe('round-trip coherence — head → RO → heads contains the head', () => {
  it('every head round-trips through its RO group', () => {
    for (const head of Object.keys(HEAD_TO_BIG11)) {
      const ro = headToBig11(head);
      expect(ro).not.toBeNull();
      expect(big11ToHeads(/** @type {string} */ (ro))).toContain(head);
    }
  });

  it('every RO group with heads maps each head back to itself', () => {
    for (const group of BIG11_GROUPS) {
      for (const head of big11ToHeads(group)) {
        expect(headToBig11(head)).toBe(group);
      }
    }
  });

  it('BIG11_TO_HEADS keys are exactly the 11 groups', () => {
    expect(Object.keys(BIG11_TO_HEADS).sort()).toEqual([...BIG11_GROUPS].sort());
  });
});
