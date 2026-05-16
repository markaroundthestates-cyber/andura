// Tests for Calendar V1 S2 wiring: coachContext extends equipment fields
// with user-driven aparate-lipsa picker (wv2-missing-equipment) AND injects
// ctx.meta.calendarOverride from scheduleAdapter.
//
// Scope per ADR 026 §9: engines remain pure-function — coachContext.js is
// the SSOT for all engines (per file header L1-2). This test suite verifies
// the integration boundary, not engine internals.

import { describe, it, expect, beforeEach } from 'vitest';
import { buildCoachContext } from '../coachContext.js';
import {
  MISSING_EQUIPMENT_KEY,
  CALENDAR_OVERRIDE_KEY,
  setMissingEquipment,
  commitCalendarEdit,
} from '../schedule/scheduleAdapter.js';

const ENGINE_EQUIPMENT_ALL = ['matrix_cable', 'bailib_stack', 'pec_deck', 'leg_machine', 'leg_press_plates', 'dumbbell'];

describe('coachContext — missing equipment integration (Calendar V1 S2)', () => {
  beforeEach(() => { localStorage.clear(); });

  it('empty missing-equipment list → all engine equipment available (legacy behavior preserved)', () => {
    const ctx = buildCoachContext();
    expect(ctx.equipment.available.sort()).toEqual([...ENGINE_EQUIPMENT_ALL].sort());
    expect(ctx.equipment.unavailable).toEqual([]);
  });

  it('user marks "gantere" missing → dumbbell removed from available', () => {
    setMissingEquipment(['gantere']);
    const ctx = buildCoachContext();
    expect(ctx.equipment.available).not.toContain('dumbbell');
    expect(ctx.equipment.unavailable).toContain('dumbbell');
  });

  it('user marks "aparat-cablu" missing → both matrix_cable AND bailib_stack removed', () => {
    setMissingEquipment(['aparat-cablu']);
    const ctx = buildCoachContext();
    expect(ctx.equipment.available).not.toContain('matrix_cable');
    expect(ctx.equipment.available).not.toContain('bailib_stack');
    expect(ctx.equipment.unavailable).toContain('matrix_cable');
    expect(ctx.equipment.unavailable).toContain('bailib_stack');
  });

  it('legacy unavailable-equipment + user-driven wv2-missing-equipment MERGE (both contribute)', () => {
    localStorage.setItem('unavailable-equipment', JSON.stringify(['pec_deck']));
    setMissingEquipment(['gantere']);
    const ctx = buildCoachContext();
    expect(ctx.equipment.unavailable.sort()).toEqual(['dumbbell', 'pec_deck']);
    expect(ctx.equipment.available).not.toContain('pec_deck');
    expect(ctx.equipment.available).not.toContain('dumbbell');
  });

  it('overlapping legacy + user-driven DEDUPLICATED (no double-count)', () => {
    // Edge case: legacy already has dumbbell, user also marks gantere → still just dumbbell once
    localStorage.setItem('unavailable-equipment', JSON.stringify(['dumbbell']));
    setMissingEquipment(['gantere']);
    const ctx = buildCoachContext();
    expect(ctx.equipment.unavailable.filter(e => e === 'dumbbell')).toHaveLength(1);
  });

  it('user marks 5 picker entries with NO engine mapping → ZERO engine impact', () => {
    setMissingEquipment(['banca-inclinata', 'banca-plana', 'bara-halterelor', 'power-rack', 'banda-elastica']);
    const ctx = buildCoachContext();
    // None of these 5 picker entries map to engine equipment domain (V1 limitation,
    // capability not modelled). User selection recorded but engines unaffected.
    expect(ctx.equipment.available.sort()).toEqual([...ENGINE_EQUIPMENT_ALL].sort());
    expect(ctx.equipment.unavailable).toEqual([]);
  });

  it('user marks all 10 picker entries → engine domain reduced to non-mapped only', () => {
    const allTen = ['banca-inclinata', 'banca-plana', 'bara-halterelor', 'gantere', 'aparat-cablu',
                    'power-rack', 'leg-press', 'aparat-extensii', 'aparat-tractiuni', 'banda-elastica'];
    setMissingEquipment(allTen);
    const ctx = buildCoachContext();
    // 5 engine IDs blocked: dumbbell, matrix_cable, bailib_stack, leg_press_plates, leg_machine
    // pec_deck remains available (no picker entry maps to it in current translation)
    expect(ctx.equipment.available).toEqual(['pec_deck']);
    expect(ctx.equipment.unavailable.sort()).toEqual(
      ['bailib_stack', 'dumbbell', 'leg_machine', 'leg_press_plates', 'matrix_cable'].sort()
    );
  });

  it('malformed wv2-missing-equipment storage → falls back to legacy-only behavior', () => {
    localStorage.setItem(MISSING_EQUIPMENT_KEY, 'garbage{');
    localStorage.setItem('unavailable-equipment', JSON.stringify(['pec_deck']));
    const ctx = buildCoachContext();
    expect(ctx.equipment.unavailable).toEqual(['pec_deck']);
  });

  it('legacy invalid user IDs (S1.5 era exercise names) are filtered out via scheduleAdapter hydration', () => {
    // S1.5 era pushed RO exercise names — list-based normalization 2026-05-12
    // strips on read.
    localStorage.setItem(MISSING_EQUIPMENT_KEY, JSON.stringify(['Impins inclinat', 'gantere']));
    const ctx = buildCoachContext();
    // Only 'gantere' is a valid picker ID → translates to 'dumbbell'.
    expect(ctx.equipment.unavailable).toEqual(['dumbbell']);
  });
});

describe('coachContext — calendar override injection (Calendar V1 S2)', () => {
  beforeEach(() => { localStorage.clear(); });

  it('absent override → ctx.meta.calendarOverride is null', () => {
    const ctx = buildCoachContext();
    expect(ctx.meta).toBeDefined();
    expect(ctx.meta.calendarOverride).toBeNull();
  });

  it('committed override visible on ctx.meta.calendarOverride (same week)', () => {
    // Note: buildCoachContext uses new Date() internally — we commit using the
    // same wallclock so weekStartIso matches. Real determinism comes from
    // scheduleAdapter unit tests; this verifies the injection wire.
    commitCalendarEdit([
      { day: 'L', active: true },
      { day: 'M', active: false },
    ]);
    const ctx = buildCoachContext();
    expect(ctx.meta.calendarOverride).not.toBeNull();
    expect(Array.isArray(ctx.meta.calendarOverride.selectedDays)).toBe(true);
    expect(ctx.meta.calendarOverride.selectedDays).toHaveLength(2);
  });

  it('malformed override storage → ctx.meta.calendarOverride is null (graceful fallback)', () => {
    localStorage.setItem(CALENDAR_OVERRIDE_KEY, 'corrupt-json{');
    const ctx = buildCoachContext();
    expect(ctx.meta.calendarOverride).toBeNull();
  });

  it('ctx.meta is always present (engine contract — never undefined)', () => {
    // Engines defensive-read meta via `safeCtx.meta && typeof safeCtx.meta === 'object'`,
    // but explicit invariant: buildCoachContext always returns meta object.
    const ctx = buildCoachContext();
    expect(ctx.meta).toBeDefined();
    expect(typeof ctx.meta).toBe('object');
  });
});
