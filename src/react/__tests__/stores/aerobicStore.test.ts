// ══ AEROBIC STORE TESTS — class logging + kcal math + weekly count ════════
// Daniel spec 2026-05-30 — Aerobic training mode. Covers:
//   - MET table values (Compendium baked-in)
//   - computeAerobicKcal = MET × weight × (min/60)
//   - logClass persists session + remembers duration (editable memory)
//   - countClassesThisWeek (ISO Mon-Sun week)
//   - aerobicKcalForDate sum (feeds nutrition ease)
//   - duration bounds rejection

import { describe, it, expect, beforeEach } from 'vitest';
import {
  useAerobicStore,
  AEROBIC_MET,
  AEROBIC_CLASS_TYPES,
  DEFAULT_AEROBIC_MINUTES,
  computeAerobicKcal,
  countClassesThisWeek,
  aerobicKcalForDate,
  type AerobicSession,
} from '../../stores/aerobicStore';

function resetStore(): void {
  useAerobicStore.setState({ sessions: [], lastDuration: DEFAULT_AEROBIC_MINUTES, subjectiveByDate: {} });
  localStorage.clear();
}

/** Local ISO YYYY-MM-DD for a Date (mirror store todayIso semantics). */
function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

describe('aerobicStore — MET table', () => {
  it('bakes conservative mid-band MET per class type', () => {
    expect(AEROBIC_MET.aerobic).toBe(6.5);
    expect(AEROBIC_MET.step).toBe(7.5);
    expect(AEROBIC_MET.zumba).toBe(6.5);
    expect(AEROBIC_MET.spinning).toBe(8.5);
    expect(AEROBIC_MET.alta).toBe(6.0);
  });

  it('lists all 5 class types for the picker', () => {
    expect(AEROBIC_CLASS_TYPES).toEqual(['aerobic', 'step', 'zumba', 'spinning', 'alta']);
  });
});

describe('computeAerobicKcal — MET × weight × (min/60)', () => {
  it('spinning 8.5 MET, 70kg, 50min = round(8.5*70*50/60) = 496', () => {
    expect(computeAerobicKcal('spinning', 70, 50)).toBe(496);
  });

  it('aerobic 6.5 MET, 60kg, 60min = 390', () => {
    expect(computeAerobicKcal('aerobic', 60, 60)).toBe(390);
  });

  it('step 7.5 MET, 65kg, 45min = round(7.5*65*45/60) = 366', () => {
    expect(computeAerobicKcal('step', 65, 45)).toBe(366);
  });

  it('returns null when weight missing/invalid', () => {
    expect(computeAerobicKcal('aerobic', null, 50)).toBeNull();
    expect(computeAerobicKcal('aerobic', 0, 50)).toBeNull();
    expect(computeAerobicKcal('aerobic', NaN, 50)).toBeNull();
  });

  it('returns null when minutes invalid', () => {
    expect(computeAerobicKcal('aerobic', 60, 0)).toBeNull();
    expect(computeAerobicKcal('aerobic', 60, NaN)).toBeNull();
  });
});

describe('aerobicStore — logClass', () => {
  beforeEach(resetStore);

  it('persists a session with computed kcal', () => {
    useAerobicStore.getState().logClass({ date: '2026-05-30', type: 'spinning', minutes: 50, weightKg: 70 });
    const { sessions } = useAerobicStore.getState();
    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({ date: '2026-05-30', type: 'spinning', minutes: 50, kcal: 496 });
  });

  it('remembers the last-used duration (editable memory)', () => {
    expect(useAerobicStore.getState().lastDuration).toBe(DEFAULT_AEROBIC_MINUTES);
    useAerobicStore.getState().logClass({ date: '2026-05-30', type: 'aerobic', minutes: 35, weightKg: 60 });
    expect(useAerobicStore.getState().lastDuration).toBe(35);
  });

  it('setLastDuration persists without logging', () => {
    useAerobicStore.getState().setLastDuration(40);
    expect(useAerobicStore.getState().lastDuration).toBe(40);
    expect(useAerobicStore.getState().sessions).toHaveLength(0);
  });

  it('rejects an out-of-bounds duration silently', () => {
    useAerobicStore.getState().logClass({ date: '2026-05-30', type: 'aerobic', minutes: 1, weightKg: 60 });
    useAerobicStore.getState().logClass({ date: '2026-05-30', type: 'aerobic', minutes: 999, weightKg: 60 });
    expect(useAerobicStore.getState().sessions).toHaveLength(0);
  });

  it('stores kcal 0 (still a class) when weight is unknown', () => {
    useAerobicStore.getState().logClass({ date: '2026-05-30', type: 'aerobic', minutes: 50, weightKg: null });
    const { sessions } = useAerobicStore.getState();
    expect(sessions).toHaveLength(1);
    expect(sessions[0]?.kcal).toBe(0);
  });
});

describe('countClassesThisWeek — ISO Mon-Sun', () => {
  it('counts only classes in the current week', () => {
    const now = new Date('2026-05-30T12:00:00'); // Saturday
    const sessions: AerobicSession[] = [
      { date: iso(new Date('2026-05-25T00:00:00')), type: 'aerobic', minutes: 50, kcal: 300, ts: 1 }, // Mon same week
      { date: iso(new Date('2026-05-28T00:00:00')), type: 'step', minutes: 50, kcal: 300, ts: 2 }, // Thu same week
      { date: iso(new Date('2026-05-20T00:00:00')), type: 'zumba', minutes: 50, kcal: 300, ts: 3 }, // prior week
    ];
    expect(countClassesThisWeek(sessions, now)).toBe(2);
  });

  it('returns 0 for empty sessions', () => {
    expect(countClassesThisWeek([], new Date())).toBe(0);
  });
});

describe('aerobicKcalForDate — sums a day (feeds nutrition ease)', () => {
  it('sums every class logged that date', () => {
    const sessions: AerobicSession[] = [
      { date: '2026-05-30', type: 'aerobic', minutes: 50, kcal: 300, ts: 1 },
      { date: '2026-05-30', type: 'spinning', minutes: 30, kcal: 250, ts: 2 },
      { date: '2026-05-29', type: 'step', minutes: 50, kcal: 400, ts: 3 },
    ];
    expect(aerobicKcalForDate(sessions, '2026-05-30')).toBe(550);
    expect(aerobicKcalForDate(sessions, '2026-05-29')).toBe(400);
    expect(aerobicKcalForDate(sessions, '2026-05-28')).toBe(0);
  });
});

describe('aerobicStore — subjective readiness (self-report)', () => {
  beforeEach(resetStore);

  it('records readiness per date', () => {
    useAerobicStore.getState().setSubjectiveReadiness('2026-05-30', 'tired');
    expect(useAerobicStore.getState().subjectiveByDate['2026-05-30']).toBe('tired');
  });

  it('rejects an invalid value silently', () => {
    // @ts-expect-error — guard against a bad value at the boundary.
    useAerobicStore.getState().setSubjectiveReadiness('2026-05-30', 'bogus');
    expect(useAerobicStore.getState().subjectiveByDate['2026-05-30']).toBeUndefined();
  });
});
