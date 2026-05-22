// C4.4 Specialization refactor Big 6 → Big 11 RO canonical V1 scope tests per
// ADR_ENGINE_REFACTOR §4.4 LOCK V1 acceptance criteria.
//
// Coverage:
//   - ELIGIBLE_GROUPS_SPECIALIZATION_BIG11 (8 of 11 candidates per Decision §3.4)
//   - SECONDARY_TAG_WEIGHT_DEFAULT 0.3 per Decision §3.5
//   - computeWeightedGroupScore() weighted secondary consume policy primary 1.0 + secondary 0.3
//   - consumeWeaknessDetectorSignal() filter eligibleWeak (excluded picioare-quads/picioare-hamstrings/gambe)
//   - translateGroupToRO() Big 11 RO canonical V1 input + backwards-compat Big 6 EN fallback cap-coadă cleanup C4.5
//
// Pure-function discipline ADR-026 §9 invariant preserved — ZERO Date.now /
// Math.random / side effects / mock global state.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ELIGIBLE_GROUPS_SPECIALIZATION_BIG11,
  SECONDARY_TAG_WEIGHT_DEFAULT,
} from '../constants.js';
import {
  computeWeightedGroupScore,
  consumeWeaknessDetectorSignal,
} from '../weaknessConsumer.js';
import { translateGroupToRO } from '../applicationStrategy.js';
import * as weaknessDetectorMod from '../../weaknessDetector.js';

describe('ELIGIBLE_GROUPS_SPECIALIZATION_BIG11 — ADR §3.4 LOCK V1 (8 of 11 candidates)', () => {
  it('contains exactly 8 entries', () => {
    expect(ELIGIBLE_GROUPS_SPECIALIZATION_BIG11.length).toBe(8);
  });

  it('contains piept, spate, umeri, biceps, triceps, antebrate, core, fese', () => {
    expect(ELIGIBLE_GROUPS_SPECIALIZATION_BIG11).toEqual(
      expect.arrayContaining(['piept', 'spate', 'umeri', 'biceps', 'triceps', 'antebrate', 'core', 'fese'])
    );
  });

  it('does NOT contain picioare-quads, picioare-hamstrings, gambe (anatomical conflict V1)', () => {
    expect(ELIGIBLE_GROUPS_SPECIALIZATION_BIG11).not.toContain('picioare-quads');
    expect(ELIGIBLE_GROUPS_SPECIALIZATION_BIG11).not.toContain('picioare-hamstrings');
    expect(ELIGIBLE_GROUPS_SPECIALIZATION_BIG11).not.toContain('gambe');
  });

  it('is frozen (immutability invariant)', () => {
    expect(Object.isFrozen(ELIGIBLE_GROUPS_SPECIALIZATION_BIG11)).toBe(true);
  });
});

describe('SECONDARY_TAG_WEIGHT_DEFAULT — ADR §3.5 LOCK V1 (0.3 = 30% co-engage)', () => {
  it('equals 0.3', () => {
    expect(SECONDARY_TAG_WEIGHT_DEFAULT).toBe(0.3);
  });
});

describe('computeWeightedGroupScore — primary 1.0 + secondary 0.3 weighted consume policy', () => {
  it('returns 1.0 when muscle_target_primary matches target', () => {
    const exerciseMeta = {
      muscle_target_primary:   'spate',
      muscle_target_secondary: ['picioare-hamstrings'],
    };
    expect(computeWeightedGroupScore(exerciseMeta, 'spate')).toBe(1.0);
  });

  it('returns 0.3 when target appears in muscle_target_secondary', () => {
    const exerciseMeta = {
      muscle_target_primary:   'spate',
      muscle_target_secondary: ['picioare-hamstrings'],
    };
    expect(computeWeightedGroupScore(exerciseMeta, 'picioare-hamstrings')).toBe(0.3);
  });

  it('returns 0 when target appears nowhere', () => {
    const exerciseMeta = {
      muscle_target_primary:   'spate',
      muscle_target_secondary: ['picioare-hamstrings'],
    };
    expect(computeWeightedGroupScore(exerciseMeta, 'gambe')).toBe(0);
  });

  it('returns 0 for malformed input (null exerciseMeta, undefined target)', () => {
    expect(computeWeightedGroupScore(null, 'spate')).toBe(0);
    expect(computeWeightedGroupScore(undefined, 'spate')).toBe(0);
    expect(computeWeightedGroupScore({}, undefined)).toBe(0);
    expect(computeWeightedGroupScore({ muscle_target_primary: 'spate' }, null)).toBe(0);
    expect(computeWeightedGroupScore({ muscle_target_primary: 'spate' }, '')).toBe(0);
  });

  it('handles missing muscle_target_secondary gracefully (undefined / non-array)', () => {
    expect(computeWeightedGroupScore({ muscle_target_primary: 'spate' }, 'picioare-hamstrings')).toBe(0);
    expect(computeWeightedGroupScore({ muscle_target_primary: 'spate', muscle_target_secondary: null }, 'picioare-hamstrings')).toBe(0);
    expect(computeWeightedGroupScore({ muscle_target_primary: 'spate', muscle_target_secondary: 'not_array' }, 'picioare-hamstrings')).toBe(0);
  });

  it('Bundle 6.0.4.2 RDL dual-cluster integration — spate primary + hams secondary', () => {
    const rdl = {
      muscle_target_primary:   'spate',
      muscle_target_secondary: ['picioare-hamstrings', 'fese'],
    };
    expect(computeWeightedGroupScore(rdl, 'spate')).toBe(1.0);
    expect(computeWeightedGroupScore(rdl, 'picioare-hamstrings')).toBe(SECONDARY_TAG_WEIGHT_DEFAULT);
    expect(computeWeightedGroupScore(rdl, 'fese')).toBe(SECONDARY_TAG_WEIGHT_DEFAULT);
  });
});

describe('consumeWeaknessDetectorSignal — C4.4 eligible scope filter (8 of 11)', () => {
  let detectorSpy;

  beforeEach(() => {
    detectorSpy = vi.spyOn(weaknessDetectorMod, 'detectWeakGroups');
  });

  afterEach(() => {
    detectorSpy.mockRestore();
  });

  it('returns topWeakGroup === null when detector signals picioare-quads only (excluded category)', () => {
    detectorSpy.mockReturnValue({
      weakGroups: ['picioare-quads'],
      ratio:      { 'picioare-quads': 0.7 },
      byGroup:    {},
      average1RM: {},
    });
    const r = consumeWeaknessDetectorSignal([{ exerciseName: 'Squat' }]);
    expect(r.topWeakGroup).toBeNull();
    expect(r.rationale).toContain('excluded_category');
    expect(r.rationale).toContain('picioare-quads');
  });

  it('returns topWeakGroup === antebrate when detector signals antebrate weakness (NEW Big 11)', () => {
    detectorSpy.mockReturnValue({
      weakGroups: ['antebrate'],
      ratio:      { antebrate: 0.65 },
      byGroup:    {},
      average1RM: {},
    });
    const r = consumeWeaknessDetectorSignal([{ exerciseName: 'Wrist Curl' }]);
    expect(r.topWeakGroup).toBe('antebrate');
    expect(r.rationale).toContain('eligible_big11_filter_applied');
  });

  it('returns topWeakGroup === fese when detector signals fese weakness (NEW Big 11)', () => {
    detectorSpy.mockReturnValue({
      weakGroups: ['fese'],
      ratio:      { fese: 0.7 },
      byGroup:    {},
      average1RM: {},
    });
    const r = consumeWeaknessDetectorSignal([{ exerciseName: 'Hip Thrust' }]);
    expect(r.topWeakGroup).toBe('fese');
  });

  it('selects first eligible weak group skipping excluded categories (mixed list)', () => {
    detectorSpy.mockReturnValue({
      weakGroups: ['picioare-quads', 'piept', 'gambe'],
      ratio:      { 'picioare-quads': 0.6, piept: 0.75, gambe: 0.7 },
      byGroup:    {},
      average1RM: {},
    });
    const r = consumeWeaknessDetectorSignal([{ exerciseName: 'Squat' }]);
    expect(r.topWeakGroup).toBe('piept');
  });
});

describe('translateGroupToRO — Big 11 RO canonical V1 SSOT (post-C4.5 cap-coada cleanup)', () => {
  it('Big 11 NEW: antebrate → Antebrate', () => {
    expect(translateGroupToRO('antebrate')).toBe('Antebrate');
  });

  it('Big 11 NEW: fese → Fese', () => {
    expect(translateGroupToRO('fese')).toBe('Fese');
  });

  it('Big 11 NEW: gambe → Gambe', () => {
    expect(translateGroupToRO('gambe')).toBe('Gambe');
  });

  it('Big 11 NEW: picioare-quads → Cvadriceps (RO native)', () => {
    expect(translateGroupToRO('picioare-quads')).toBe('Cvadriceps');
  });

  it('Big 11 NEW: picioare-hamstrings → Ischiogambieri (RO native NU calque)', () => {
    expect(translateGroupToRO('picioare-hamstrings')).toBe('Ischiogambieri');
  });

  it('post-C4.5 cap-coada cleanup: chest → Chest (capitalizeGroup fallback NU map entry — Big 6 EN deprecated)', () => {
    expect(translateGroupToRO('chest')).toBe('Chest');
  });

  it('post-C4.5 cap-coada cleanup: back → Back (capitalizeGroup fallback NU map entry — Big 6 EN deprecated)', () => {
    expect(translateGroupToRO('back')).toBe('Back');
  });

  it('post-C4.5 cap-coada cleanup: shoulders → Shoulders (capitalizeGroup fallback NU map entry — Big 6 EN deprecated)', () => {
    expect(translateGroupToRO('shoulders')).toBe('Shoulders');
  });

  it('post-C4.5 cap-coada cleanup: legs → Legs (capitalizeGroup fallback NU map entry — Big 6 EN deprecated)', () => {
    expect(translateGroupToRO('legs')).toBe('Legs');
  });
});
