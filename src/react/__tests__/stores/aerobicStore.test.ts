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
  AEROBIC_BACKLOG_DAYS,
  computeAerobicKcal,
  countClassesThisWeek,
  aerobicKcalForDate,
  aerobicTodayIso,
  aerobicMinDateIso,
  clampAerobicDateIso,
  type AerobicSession,
} from '../../stores/aerobicStore';

function resetStore(): void {
  useAerobicStore.setState({ sessions: [], lastDuration: DEFAULT_AEROBIC_MINUTES, subjectiveByDate: {}, deletedTs: [] });
  localStorage.clear();
}

/** Local ISO YYYY-MM-DD for a Date (mirror store todayIso semantics). */
function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

describe('aerobicStore — MET table', () => {
  it('bakes real-world calibrated conservative MET per class type', () => {
    expect(AEROBIC_MET.aerobic).toBe(5.0);
    expect(AEROBIC_MET.step).toBe(6.0);
    expect(AEROBIC_MET.zumba).toBe(5.5);
    expect(AEROBIC_MET.spinning).toBe(7.0);
    expect(AEROBIC_MET.alta).toBe(4.5);
  });

  it('lists all 5 class types for the picker', () => {
    expect(AEROBIC_CLASS_TYPES).toEqual(['aerobic', 'step', 'zumba', 'spinning', 'alta']);
  });
});

describe('computeAerobicKcal — MET × weight × (min/60)', () => {
  it('spinning 7.0 MET, 70kg, 50min = round(7.0*70*50/60) = 408', () => {
    expect(computeAerobicKcal('spinning', 70, 50)).toBe(408);
  });

  it('aerobic 5.0 MET, 60kg, 60min = 300', () => {
    expect(computeAerobicKcal('aerobic', 60, 60)).toBe(300);
  });

  it('step 6.0 MET, 65kg, 45min = round(6.0*65*45/60) = 293', () => {
    expect(computeAerobicKcal('step', 65, 45)).toBe(293);
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
    expect(sessions[0]).toMatchObject({ date: '2026-05-30', type: 'spinning', minutes: 50, kcal: 408 });
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

describe('aerobicStore — removeSession (delete a mislogged class)', () => {
  beforeEach(resetStore);

  it('removes the class by ts and records a tombstone', () => {
    useAerobicStore.getState().logClass({ date: '2026-05-30', type: 'spinning', minutes: 50, weightKg: 70 });
    const ts = useAerobicStore.getState().sessions[0]!.ts;
    useAerobicStore.getState().removeSession(ts);
    expect(useAerobicStore.getState().sessions).toHaveLength(0);
    expect(useAerobicStore.getState().deletedTs).toContain(ts);
  });

  it('decrements the weekly count when a class is deleted', () => {
    const now = new Date();
    // Seed two distinct sessions (explicit ts — logClass uses Date.now() which
    // can collide within the same ms on a fast machine).
    useAerobicStore.setState({
      sessions: [
        { date: iso(now), type: 'aerobic', minutes: 50, kcal: 300, ts: 1000 },
        { date: iso(now), type: 'step', minutes: 40, kcal: 280, ts: 2000 },
      ],
    });
    expect(countClassesThisWeek(useAerobicStore.getState().sessions, now)).toBe(2);
    useAerobicStore.getState().removeSession(1000);
    expect(countClassesThisWeek(useAerobicStore.getState().sessions, now)).toBe(1);
  });

  it('is a safe no-op for an absent ts (no tombstone, no change)', () => {
    useAerobicStore.getState().logClass({ date: '2026-05-30', type: 'aerobic', minutes: 50, weightKg: 60 });
    useAerobicStore.getState().removeSession(999999);
    expect(useAerobicStore.getState().sessions).toHaveLength(1);
    expect(useAerobicStore.getState().deletedTs).toHaveLength(0);
  });
});

describe('backward logging — date window helpers (decision #45)', () => {
  // Fixed reference date so the window math is deterministic (2026-06-07).
  const ref = new Date('2026-06-07T12:00:00');

  it('aerobicTodayIso = local YYYY-MM-DD', () => {
    expect(aerobicTodayIso(ref)).toBe('2026-06-07');
  });

  it('aerobicMinDateIso = today − backlog days (the picker floor)', () => {
    // 2026-06-07 minus 30 days = 2026-05-08.
    expect(AEROBIC_BACKLOG_DAYS).toBe(30);
    expect(aerobicMinDateIso(ref)).toBe('2026-05-08');
  });

  it('clamp passes a date inside the window through unchanged', () => {
    expect(clampAerobicDateIso('2026-06-05', ref)).toBe('2026-06-05'); // 2 days ago
    expect(clampAerobicDateIso('2026-06-07', ref)).toBe('2026-06-07'); // today
    expect(clampAerobicDateIso('2026-05-08', ref)).toBe('2026-05-08'); // floor
  });

  it('clamp BLOCKS the future — a tomorrow date snaps to today', () => {
    expect(clampAerobicDateIso('2026-06-08', ref)).toBe('2026-06-07');
    expect(clampAerobicDateIso('2027-01-01', ref)).toBe('2026-06-07');
  });

  it('clamp snaps a date older than the window to the floor', () => {
    expect(clampAerobicDateIso('2026-01-01', ref)).toBe('2026-05-08');
  });

  it('clamp falls back to today on garbage input', () => {
    expect(clampAerobicDateIso('not-a-date', ref)).toBe('2026-06-07');
    // @ts-expect-error — boundary garbage.
    expect(clampAerobicDateIso(null, ref)).toBe('2026-06-07');
  });
});

describe('aerobicStore — logClass backward / future-block (decision #45)', () => {
  beforeEach(resetStore);

  it('logs a class dated 2 days ago UNDER that date (backward logging)', () => {
    const now = new Date();
    const twoDaysAgo = aerobicTodayIso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2));
    useAerobicStore.getState().logClass({ date: twoDaysAgo, type: 'spinning', minutes: 50, weightKg: 70 });
    const { sessions } = useAerobicStore.getState();
    expect(sessions).toHaveLength(1);
    expect(sessions[0]?.date).toBe(twoDaysAgo);
    // Backdated session still carries a fresh ts (sync union dedupe key).
    expect(typeof sessions[0]?.ts).toBe('number');
  });

  it('aerobicKcalForDate finds the backdated class under its day, not today', () => {
    const now = new Date();
    const today = aerobicTodayIso(now);
    const twoDaysAgo = aerobicTodayIso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2));
    useAerobicStore.getState().logClass({ date: twoDaysAgo, type: 'aerobic', minutes: 60, weightKg: 60 });
    const { sessions } = useAerobicStore.getState();
    expect(aerobicKcalForDate(sessions, twoDaysAgo)).toBe(300); // 5.0*60*1
    expect(aerobicKcalForDate(sessions, today)).toBe(0); // not logged today
  });

  it('HARD-BLOCKS a future date — snaps it to today', () => {
    const now = new Date();
    const today = aerobicTodayIso(now);
    const tomorrow = aerobicTodayIso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    useAerobicStore.getState().logClass({ date: tomorrow, type: 'step', minutes: 40, weightKg: 60 });
    expect(useAerobicStore.getState().sessions[0]?.date).toBe(today);
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
