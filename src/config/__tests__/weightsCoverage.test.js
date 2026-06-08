// ══ EQUIPMENT-WEIGHT CONFIG COVERAGE — the 143 CORE_AUTO (Wave 2 #7) ════════
// Guards: every CORE_AUTO resolves an EXPLICIT equipment ladder (no silent
// bailib_stack DEFAULT fallthrough — the chest-fly-32kg / odd-DB bug class
// task-list #35), and the headline fly cases now snap to a sane light load.

import { describe, it, expect } from 'vitest';
import {
  EXERCISE_EQUIPMENT_MAP,
  EQUIPMENT_WEIGHTS,
  roundToEquipmentWeight,
  getEquipmentType,
} from '../weights.js';
import { EXERCISE_METADATA as lib } from '../../engine/exerciseLibrary.js';

const coreAuto = Object.entries(lib)
  .filter(([, v]) => v.status === 'CORE_AUTO')
  .map(([k]) => k);

describe('weights — config coverage for the 143 CORE_AUTO', () => {
  it('there are 143 CORE_AUTO (scope guard)', () => {
    expect(coreAuto).toHaveLength(143);
  });

  it('every CORE_AUTO is EXPLICITLY mapped (no silent bailib_stack default)', () => {
    const unmapped = coreAuto.filter((n) => !(n in EXERCISE_EQUIPMENT_MAP));
    expect(unmapped, `unmapped → bailib default: ${unmapped.join(', ')}`).toEqual([]);
  });

  it('every CORE_AUTO ladder key exists in EQUIPMENT_WEIGHTS', () => {
    for (const n of coreAuto) {
      const ladder = EXERCISE_EQUIPMENT_MAP[n];
      expect(EQUIPMENT_WEIGHTS[ladder], `${n} → ${ladder}`).toBeDefined();
      expect(Array.isArray(EQUIPMENT_WEIGHTS[ladder]) && EQUIPMENT_WEIGHTS[ladder].length).toBeGreaterThan(1);
    }
  });

  it('getEquipmentType never returns the bailib_stack default for a CORE_AUTO', () => {
    // bailib_stack IS a legit ladder for pulldowns/rows, but it must be EXPLICITLY
    // assigned (in the map), never reached as the `|| 'bailib_stack'` fallthrough.
    for (const n of coreAuto) {
      expect(getEquipmentType(n)).toBe(EXERCISE_EQUIPMENT_MAP[n]);
    }
  });
});

describe('weights — chest-fly bug class (task-list #35) before/after', () => {
  // A free DB fly / cable crossover is a LIGHT isolation (true ~5-12kg). Before
  // #7 they fell to bailib_stack (5kg floor, 5kg steps) → an 8kg fly snapped UP
  // to 10kg on a ROW grid (the chest-fly-32kg / odd-DB class). Now they snap on
  // light ladders to a load near the prescribed value.
  it('DB Fly snaps a light fly target to a light DB load (not the row floor)', () => {
    expect(EXERCISE_EQUIPMENT_MAP['DB Fly']).toBe('light_iso_db');
    expect(roundToEquipmentWeight(8, 'DB Fly')).toBe(8); // exact, not 10
    expect(roundToEquipmentWeight(6, 'DB Fly')).toBe(6);
  });

  it('Cable Crossover High-to-Low snaps to a fine light cable load', () => {
    expect(EXERCISE_EQUIPMENT_MAP['Cable Crossover High-to-Low']).toBe('light_iso_cable');
    expect(roundToEquipmentWeight(8, 'Cable Crossover High-to-Low')).toBeCloseTo(7.5, 5);
  });

  it('a fly never snaps to a heavy row/pec-deck floor for a light target', () => {
    for (const fly of ['DB Fly', 'Cable Crossover High-to-Low', 'Cable Fly']) {
      // a 5kg fly target must not be inflated to a 10kg+ row/plate floor
      expect(roundToEquipmentWeight(5, fly), fly).toBeLessThanOrEqual(6);
    }
  });
});
