import { describe, it, expect, beforeEach } from 'vitest';
import {
  CALENDAR_OVERRIDE_KEY,
  MISSING_EQUIPMENT_KEY,
  DAY_INDICES,
  DAY_LABELS,
  VALID_EQUIPMENT_IDS,
  mapDateToIndex,
  getWeekStartIso,
  detectMidWeekEdit,
  getCalendarOverride,
  commitCalendarEdit,
  resetWeekOverride,
  getMissingEquipment,
  setMissingEquipment,
  toggleMissingEquipment,
  translateToEngineEquipment,
} from '../scheduleAdapter.js';

describe('scheduleAdapter — constants', () => {
  it('DAY_INDICES Monday=0 through Sunday=6', () => {
    expect(DAY_INDICES.L).toBe(0);
    expect(DAY_INDICES.M).toBe(1);
    expect(DAY_INDICES.M2).toBe(2);
    expect(DAY_INDICES.J).toBe(3);
    expect(DAY_INDICES.V).toBe(4);
    expect(DAY_INDICES.S).toBe(5);
    expect(DAY_INDICES.D).toBe(6);
  });

  it('DAY_LABELS order L→D', () => {
    expect(DAY_LABELS).toEqual(['L', 'M', 'M2', 'J', 'V', 'S', 'D']);
  });

  it('VALID_EQUIPMENT_IDS contains 11 picker entries', () => {
    expect(VALID_EQUIPMENT_IDS).toHaveLength(11);
    expect(VALID_EQUIPMENT_IDS).toContain('gantere');
    expect(VALID_EQUIPMENT_IDS).toContain('banda-elastica');
    expect(VALID_EQUIPMENT_IDS).toContain('smith'); // Smith-machine avoid toggle (2026-06-24)
  });

  it('storage keys match mockup S1.7 demo JS', () => {
    expect(MISSING_EQUIPMENT_KEY).toBe('wv2-missing-equipment');
    expect(CALENDAR_OVERRIDE_KEY).toBe('wv2-calendar-override');
  });
});

describe('scheduleAdapter — mapDateToIndex', () => {
  it('Monday 2026-05-04 → 0', () => {
    expect(mapDateToIndex(new Date(2026, 4, 4))).toBe(0); // May 4, 2026 is Monday
  });

  it('Sunday 2026-05-10 → 6', () => {
    expect(mapDateToIndex(new Date(2026, 4, 10))).toBe(6);
  });

  it('Wednesday 2026-05-06 → 2', () => {
    expect(mapDateToIndex(new Date(2026, 4, 6))).toBe(2);
  });

  it('invalid date returns 0', () => {
    expect(mapDateToIndex(null)).toBe(0);
    expect(mapDateToIndex(new Date('invalid'))).toBe(0);
    expect(mapDateToIndex('2026-05-04')).toBe(0);
  });
});

describe('scheduleAdapter — getWeekStartIso', () => {
  it('returns Monday ISO for any weekday in week', () => {
    expect(getWeekStartIso(new Date(2026, 4, 4))).toBe('2026-05-04');  // Monday itself
    expect(getWeekStartIso(new Date(2026, 4, 6))).toBe('2026-05-04');  // Wednesday
    expect(getWeekStartIso(new Date(2026, 4, 10))).toBe('2026-05-04'); // Sunday end of week
  });

  it('invalid date returns empty string', () => {
    expect(getWeekStartIso(null)).toBe('');
    expect(getWeekStartIso(new Date('invalid'))).toBe('');
  });
});

describe('scheduleAdapter — detectMidWeekEdit', () => {
  const allActive = DAY_LABELS.map(d => ({ day: d, active: true }));

  it('edit Monday (todayIdx=0): all 7 future, 0 past', () => {
    const r = detectMidWeekEdit(allActive, 0);
    expect(r.past).toHaveLength(0);
    expect(r.future).toHaveLength(7);
    expect(r.todayIdx).toBe(0);
  });

  it('edit Thursday (todayIdx=3): 3 past invariant, 4 future', () => {
    const r = detectMidWeekEdit(allActive, 3);
    expect(r.past).toHaveLength(3);
    expect(r.past.map(d => d.day)).toEqual(['L', 'M', 'M2']);
    expect(r.future).toHaveLength(4);
    expect(r.future.map(d => d.day)).toEqual(['J', 'V', 'S', 'D']);
  });

  it('edit Sunday (todayIdx=6): 6 past, 1 future', () => {
    const r = detectMidWeekEdit(allActive, 6);
    expect(r.past).toHaveLength(6);
    expect(r.future).toHaveLength(1);
    expect(r.future[0].day).toBe('D');
  });

  it('padded with inactive when input < 7 days', () => {
    const r = detectMidWeekEdit([{ day: 'L', active: true }], 3);
    expect(r.past).toHaveLength(3);
    expect(r.future).toHaveLength(4);
    expect(r.future.every(d => d.active === false)).toBe(true);
  });

  it('out-of-range todayIdx clamps to 0', () => {
    expect(detectMidWeekEdit(allActive, -1).todayIdx).toBe(0);
    expect(detectMidWeekEdit(allActive, 7).todayIdx).toBe(0);
    expect(detectMidWeekEdit(allActive, 'foo').todayIdx).toBe(0);
  });

  it('non-array input degrades gracefully', () => {
    const r = detectMidWeekEdit(null, 2);
    expect(r.past).toHaveLength(2);
    expect(r.future).toHaveLength(5);
  });
});

describe('scheduleAdapter — calendar override storage', () => {
  beforeEach(() => { localStorage.clear(); });

  it('getCalendarOverride returns null when empty', () => {
    expect(getCalendarOverride()).toBeNull();
  });

  it('commitCalendarEdit persists with current week tag', () => {
    const now = new Date(2026, 4, 6); // Wednesday, week starts Mon 2026-05-04
    const days = [{ day: 'L', active: true }, { day: 'M', active: false }];
    const override = commitCalendarEdit(days, now);
    expect(override.weekStartIso).toBe('2026-05-04');
    expect(override.selectedDays).toHaveLength(2);
    const got = getCalendarOverride(now);
    expect(got).not.toBeNull();
    expect(got.selectedDays[0].active).toBe(true);
  });

  it('getCalendarOverride returns null when reading from different week (Reset Luni)', () => {
    const monday = new Date(2026, 4, 4);
    commitCalendarEdit([{ day: 'L', active: true }], monday);
    const nextMonday = new Date(2026, 4, 11);
    expect(getCalendarOverride(nextMonday)).toBeNull();
  });

  it('getCalendarOverride returns null on malformed storage', () => {
    localStorage.setItem(CALENDAR_OVERRIDE_KEY, '{not valid json');
    expect(getCalendarOverride()).toBeNull();
  });

  it('getCalendarOverride returns null when selectedDays not array', () => {
    localStorage.setItem(CALENDAR_OVERRIDE_KEY, JSON.stringify({
      selectedDays: 'invalid', weekStartIso: getWeekStartIso(new Date())
    }));
    expect(getCalendarOverride()).toBeNull();
  });

  it('resetWeekOverride clears storage', () => {
    commitCalendarEdit([{ day: 'L', active: true }], new Date());
    resetWeekOverride();
    expect(localStorage.getItem(CALENDAR_OVERRIDE_KEY)).toBeNull();
  });

  it('committedAt timestamp present ISO format', () => {
    const now = new Date(2026, 4, 6, 10, 30);
    const override = commitCalendarEdit([], now);
    expect(override.committedAt).toBe(now.toISOString());
  });
});

describe('scheduleAdapter — missing equipment storage', () => {
  beforeEach(() => { localStorage.clear(); });

  it('getMissingEquipment returns empty array when storage empty', () => {
    expect(getMissingEquipment()).toEqual([]);
  });

  it('setMissingEquipment + getMissingEquipment round-trip valid IDs', () => {
    setMissingEquipment(['gantere', 'leg-press']);
    expect(getMissingEquipment().sort()).toEqual(['gantere', 'leg-press']);
  });

  it('setMissingEquipment filters out invalid IDs at write time', () => {
    setMissingEquipment(['gantere', 'invalid-id', 'NOT_REAL']);
    expect(getMissingEquipment()).toEqual(['gantere']);
  });

  it('getMissingEquipment filters legacy S1.5 era strings (exercise names)', () => {
    // S1.5 era pushed RO exercise names directly — list-based normalization
    // 2026-05-12 strips on hydrate parity mockup hydrateAparateLipsa()
    localStorage.setItem(MISSING_EQUIPMENT_KEY,
      JSON.stringify(['Impins inclinat', 'gantere', 'Ridicari laterale']));
    expect(getMissingEquipment()).toEqual(['gantere']);
  });

  it('getMissingEquipment returns [] on non-array stored value', () => {
    localStorage.setItem(MISSING_EQUIPMENT_KEY, JSON.stringify({ not: 'array' }));
    expect(getMissingEquipment()).toEqual([]);
  });

  it('getMissingEquipment returns [] on malformed JSON', () => {
    localStorage.setItem(MISSING_EQUIPMENT_KEY, 'garbage{');
    expect(getMissingEquipment()).toEqual([]);
  });

  it('toggleMissingEquipment adds when absent', () => {
    expect(toggleMissingEquipment('gantere')).toEqual(['gantere']);
    expect(getMissingEquipment()).toEqual(['gantere']);
  });

  it('toggleMissingEquipment removes when present', () => {
    setMissingEquipment(['gantere', 'leg-press']);
    expect(toggleMissingEquipment('gantere').sort()).toEqual(['leg-press']);
  });

  it('toggleMissingEquipment unknown ID is no-op', () => {
    setMissingEquipment(['gantere']);
    expect(toggleMissingEquipment('invalid-id')).toEqual(['gantere']);
    expect(getMissingEquipment()).toEqual(['gantere']);
  });

  it('toggleMissingEquipment non-string is no-op', () => {
    setMissingEquipment(['gantere']);
    expect(toggleMissingEquipment(null)).toEqual(['gantere']);
    expect(toggleMissingEquipment(42)).toEqual(['gantere']);
  });
});

describe('scheduleAdapter — translateToEngineEquipment', () => {
  it('gantere → dumbbell', () => {
    expect(translateToEngineEquipment(['gantere'])).toEqual(['dumbbell']);
  });

  it('aparat-cablu → matrix_cable + bailib_stack', () => {
    expect(translateToEngineEquipment(['aparat-cablu']).sort())
      .toEqual(['bailib_stack', 'matrix_cable']);
  });

  it('multi-input dedupes engine IDs (cablu+tractiuni both touch bailib_stack)', () => {
    const r = translateToEngineEquipment(['aparat-cablu', 'aparat-tractiuni']).sort();
    expect(r).toEqual(['bailib_stack', 'matrix_cable']);
  });

  it('user IDs with empty mapping return no engine effect (banca, bara, etc)', () => {
    expect(translateToEngineEquipment(['banca-inclinata'])).toEqual([]);
    expect(translateToEngineEquipment(['power-rack', 'banda-elastica'])).toEqual([]);
  });

  it('unknown user IDs silently skipped', () => {
    expect(translateToEngineEquipment(['gantere', 'unknown-thing'])).toEqual(['dumbbell']);
  });

  it('non-array input returns []', () => {
    expect(translateToEngineEquipment(null)).toEqual([]);
    expect(translateToEngineEquipment('gantere')).toEqual([]);
  });

  it('empty list returns []', () => {
    expect(translateToEngineEquipment([])).toEqual([]);
  });

  it('all 11 picker entries map without throwing (incl. coarse-less smith)', () => {
    expect(() => translateToEngineEquipment([...VALID_EQUIPMENT_IDS])).not.toThrow();
  });
});
