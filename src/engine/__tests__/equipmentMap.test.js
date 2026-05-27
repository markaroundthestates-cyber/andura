// Tests for WP-3 equipment vocabulary reconciliation — coarse equipment_type
// (D081 SoT) ↔ user-facing AparateLipsa IDs ↔ legacy fine engine IDs.

import { describe, it, expect } from 'vitest';
import {
  COARSE_EQUIPMENT_TYPES,
  USER_EQUIPMENT_TO_COARSE,
  SETUP_ONLY_USER_IDS,
  FINE_TO_COARSE,
  normalizeToCoarseTypes,
  translateMissingToCoarse,
  availableCoarseTypes,
} from '../equipmentMap.js';
import { VALID_EQUIPMENT_IDS } from '../schedule/scheduleAdapter.js';
import { EXERCISE_METADATA } from '../exerciseLibrary.js';

describe('COARSE_EQUIPMENT_TYPES — library equipment_type domain', () => {
  it('is the 6 coarse types, frozen', () => {
    expect([...COARSE_EQUIPMENT_TYPES].sort()).toEqual(
      ['band', 'barbell', 'bodyweight', 'cable', 'dumbbell', 'machine']
    );
    expect(Object.isFrozen(COARSE_EQUIPMENT_TYPES)).toBe(true);
  });

  it('matches the equipment_type values actually used in the library', () => {
    const used = new Set(
      Object.values(EXERCISE_METADATA).map((m) => m.equipment_type)
    );
    for (const t of used) {
      expect(COARSE_EQUIPMENT_TYPES).toContain(t);
    }
  });
});

describe('USER_EQUIPMENT_TO_COARSE — every AparateLipsa ID is meaningful', () => {
  it('covers all 10 user-facing IDs from scheduleAdapter VALID_EQUIPMENT_IDS', () => {
    const mapped = Object.keys(USER_EQUIPMENT_TO_COARSE).sort();
    expect(mapped).toEqual([...VALID_EQUIPMENT_IDS].sort());
  });

  it('every NON-setup user ID resolves to >= 1 EXISTING coarse type (zero dead items)', () => {
    for (const [id, types] of Object.entries(USER_EQUIPMENT_TO_COARSE)) {
      if (SETUP_ONLY_USER_IDS.includes(id)) continue; // setup, handled separately
      expect(types.length).toBeGreaterThanOrEqual(1);
      for (const t of types) {
        expect(COARSE_EQUIPMENT_TYPES).toContain(t);
      }
    }
  });

  it('maps the spec examples correctly', () => {
    expect(USER_EQUIPMENT_TO_COARSE['gantere']).toEqual(['dumbbell']);
    expect(USER_EQUIPMENT_TO_COARSE['bara-halterelor']).toEqual(['barbell']);
    expect(USER_EQUIPMENT_TO_COARSE['aparat-cablu']).toEqual(['cable']);
    expect([...USER_EQUIPMENT_TO_COARSE['power-rack']].sort()).toEqual(['barbell', 'machine']);
    expect(USER_EQUIPMENT_TO_COARSE['banda-elastica']).toEqual(['band']);
  });

  it('bench setup IDs map to [] deliberately and are flagged setup-only', () => {
    expect(USER_EQUIPMENT_TO_COARSE['banca-inclinata']).toEqual([]);
    expect(USER_EQUIPMENT_TO_COARSE['banca-plana']).toEqual([]);
    expect(SETUP_ONLY_USER_IDS).toContain('banca-inclinata');
    expect(SETUP_ONLY_USER_IDS).toContain('banca-plana');
  });
});

describe('normalizeToCoarseTypes — coarse + legacy fine IDs → coarse', () => {
  it('passes coarse types through', () => {
    expect(normalizeToCoarseTypes(['dumbbell', 'cable']).sort()).toEqual(['cable', 'dumbbell']);
  });

  it('translates legacy fine engine IDs to coarse', () => {
    expect(normalizeToCoarseTypes(['matrix_cable', 'bailib_stack']).sort()).toEqual(['cable']);
    expect(normalizeToCoarseTypes(['pec_deck', 'leg_machine', 'leg_press_plates']).sort()).toEqual(['machine']);
  });

  it('mixes coarse + fine + drops unknowns', () => {
    expect(normalizeToCoarseTypes(['dumbbell', 'leg_machine', 'nope']).sort()).toEqual(['dumbbell', 'machine']);
  });

  it('handles non-array / non-string input', () => {
    expect(normalizeToCoarseTypes(null)).toEqual([]);
    expect(normalizeToCoarseTypes('dumbbell')).toEqual([]);
    expect(normalizeToCoarseTypes([1, undefined, {}])).toEqual([]);
  });

  it('every FINE_TO_COARSE value is a real coarse type', () => {
    for (const coarse of Object.values(FINE_TO_COARSE)) {
      expect(COARSE_EQUIPMENT_TYPES).toContain(coarse);
    }
  });
});

describe('translateMissingToCoarse — user missing → blocked coarse types', () => {
  it('power-rack blocks barbell + machine', () => {
    expect(translateMissingToCoarse(['power-rack']).sort()).toEqual(['barbell', 'machine']);
  });

  it('setup-only IDs block nothing', () => {
    expect(translateMissingToCoarse(['banca-inclinata', 'banca-plana'])).toEqual([]);
  });

  it('dedupes overlapping coarse types', () => {
    // leg-press (machine) + aparat-extensii (machine) → just machine
    expect(translateMissingToCoarse(['leg-press', 'aparat-extensii'])).toEqual(['machine']);
  });

  it('handles non-array input', () => {
    expect(translateMissingToCoarse(null)).toEqual([]);
  });
});

describe('availableCoarseTypes — subtract missing from all coarse', () => {
  it('nothing missing → all 6 coarse types', () => {
    expect(availableCoarseTypes([]).sort()).toEqual(
      ['band', 'barbell', 'bodyweight', 'cable', 'dumbbell', 'machine']
    );
  });

  it('missing gantere → dumbbell removed, rest available', () => {
    const avail = availableCoarseTypes(['gantere']);
    expect(avail).not.toContain('dumbbell');
    expect(avail).toContain('barbell');
    expect(avail).toContain('bodyweight');
  });

  it('missing power-rack → barbell + machine removed', () => {
    const avail = availableCoarseTypes(['power-rack']);
    expect(avail).not.toContain('barbell');
    expect(avail).not.toContain('machine');
    expect(avail).toContain('dumbbell');
    expect(avail).toContain('cable');
  });

  it('bodyweight is never removed even if all picker IDs are missing', () => {
    const avail = availableCoarseTypes([...VALID_EQUIPMENT_IDS]);
    expect(avail).toContain('bodyweight');
  });
});
