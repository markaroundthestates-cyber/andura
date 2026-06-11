// ══ EQUIPMENT TEMPLATE LIBRARY — data integrity (rounding-universal arc) ══════
// Pure-data guards: every template is frozen + well-formed, the CEO-gym seeds are
// present with their findings rungs, and lookup works.

import { describe, it, expect } from 'vitest';
import {
  EQUIPMENT_TEMPLATES,
  TEMPLATES_BY_ID,
  getTemplate,
} from '../equipmentTemplates.js';

const FAMILIES = new Set(['cable_stack', 'dumbbell', 'plate_set', 'fixed_bar', 'machine_stack']);

describe('equipmentTemplates — integrity', () => {
  it('the library + every entry is frozen', () => {
    expect(Object.isFrozen(EQUIPMENT_TEMPLATES)).toBe(true);
    for (const t of EQUIPMENT_TEMPLATES) expect(Object.isFrozen(t)).toBe(true);
  });

  it('every template is well-formed (id, known family, ascending positive steps, provenance)', () => {
    for (const t of EQUIPMENT_TEMPLATES) {
      expect(typeof t.id).toBe('string');
      expect(t.id.length).toBeGreaterThan(0);
      expect(FAMILIES.has(t.family), `${t.id} bad family ${t.family}`).toBe(true);
      expect(Array.isArray(t.steps)).toBe(true);
      expect(t.steps.length).toBeGreaterThanOrEqual(2);
      for (let i = 0; i < t.steps.length; i++) {
        expect(Number.isFinite(t.steps[i]), `${t.id}[${i}] not finite`).toBe(true);
        expect(t.steps[i] > 0, `${t.id}[${i}] not positive`).toBe(true);
        if (i > 0) expect(t.steps[i] > t.steps[i - 1], `${t.id} not ascending at ${i}`).toBe(true);
      }
      expect(typeof t.provenance).toBe('string');
      expect(t.provenance.length).toBeGreaterThan(0);
    }
  });

  it('ids are unique', () => {
    const ids = EQUIPMENT_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("CEO-gym seeds present with findings rungs (Daniel's cable / DB / plates)", () => {
    const cable = getTemplate('cable_10lb_daniel');
    expect(cable).toBeTruthy();
    // §LADDERS: 59 + 73 + 78 all on the helcometru (closes the 73 mystery).
    for (const rung of [59, 73, 78]) expect(cable.steps).toContain(rung);

    const db = getTemplate('dumbbell_daniel');
    expect(db).toBeTruthy();
    for (const rung of [7, 12.5, 37.5]) expect(db.steps).toContain(rung);

    const plate = getTemplate('plate_metric_daniel');
    expect(plate).toBeTruthy();
    expect(plate.steps).toContain(2.5); // smallest pair (2×1.25)
  });

  it('TEMPLATES_BY_ID + getTemplate resolve, unknown → null', () => {
    expect(TEMPLATES_BY_ID['cable_10lb_daniel']).toBe(getTemplate('cable_10lb_daniel'));
    expect(getTemplate('does-not-exist')).toBeNull();
    expect(getTemplate('')).toBeNull();
  });
});
