// ══ QA-F8 + QA-F9 (audit 2026-06-10) — metadata-derived muscle mapping + decay ══
// Built from the FOUNDER'S REAL live case (test-real-values discipline): his
// Recovery screen read quads/hams/glutes "Loaded" 4.3 DAYS after the leg day,
// while the 11-direct-set shoulder day from 5 HOURS ago read only "Easing" —
// because the curated EXERCISE_MUSCLES map missed every shoulder exercise he
// actually did (Seated DB Press / DB Lateral Raise / Face Pull / Reverse Pec
// Deck) and the decay kept 34% of a monster leg session alive at h=recoveryHours.
import { describe, it, expect } from 'vitest';
import { musclesForExercise, EXERCISE_MUSCLES } from '../muscleMap.js';
import { getRecoveryByGroup } from '../muscleRecovery.js';

const H = 3600000;

describe('QA-F8 — musclesForExercise resolves the whole library', () => {
  it('curated names keep their exact curated heads (curated wins over derivation)', () => {
    expect(musclesForExercise('Leg Press')).toBe(EXERCISE_MUSCLES['Leg Press']);
    expect(musclesForExercise('Romanian Deadlift')).toBe(EXERCISE_MUSCLES['Romanian Deadlift']);
  });

  it("derives the founder's REAL shoulder-day exercises (all missing from curated)", () => {
    // Seated DB Press — umeri primary, press pattern -> front+mid delts
    expect(musclesForExercise('Seated DB Press')?.primary).toEqual(
      expect.arrayContaining(['delt_front', 'delt_mid']),
    );
    // DB Lateral Raise — umeri, lateral pattern -> mid delt
    expect(musclesForExercise('DB Lateral Raise')?.primary).toEqual(['delt_mid']);
    // Face Pull (the curated map only knows 'Face Pulls' WITH s) -> rear delt
    expect(musclesForExercise('Face Pull')?.primary).toEqual(
      expect.arrayContaining(['delt_rear']),
    );
    // Reverse Pec Deck -> rear delt family
    expect(musclesForExercise('Reverse Pec Deck')?.primary).toEqual(
      expect.arrayContaining(['delt_rear']),
    );
    // Cable Overhead Triceps Extension Rope -> long head (overhead pattern)
    expect(musclesForExercise('Cable Overhead Triceps Extension Rope')?.primary).toEqual(['tri_long']);
  });

  it('unknown garbage stays null (same skip contract as before)', () => {
    expect(musclesForExercise('Total Nonsense Movement')).toBeNull();
    expect(musclesForExercise('')).toBeNull();
    expect(musclesForExercise(null)).toBeNull();
  });
});

describe("QA-F9 — decay calibrated on the founder's real history", () => {
  // His REAL leg day (2026-06-06): Leg Press 5 sets (rpe .75/.75/.85/.85/.85),
  // RDL 5 (.75x4/.85), Leg Ext 3 (.65/.75/.85), Leg Curl 3 (.75/.75/.85) — all
  // curated names, so this isolates the K change from the F8 mapping change.
  const T0 = 1780734000000;
  const legDay = [
    ...[7.5, 7.5, 8.5, 8.5, 8.5].map((rpe, i) => ({ ex: 'Leg Press', w: 210, reps: 8, rpe, ts: T0 + i * 180000 })),
    ...[7.5, 7.5, 7.5, 7.5, 8.5].map((rpe, i) => ({ ex: 'Romanian Deadlift', w: 70, reps: 8, rpe, ts: T0 + 1000000 + i * 180000 })),
    ...[6.5, 7.5, 8.5].map((rpe, i) => ({ ex: 'Leg Extension', w: 96, reps: 10, rpe, ts: T0 + 2200000 + i * 120000 })),
    ...[7.5, 7.5, 8.5].map((rpe, i) => ({ ex: 'Leg Curl', w: 66, reps: 10, rpe, ts: T0 + 2700000 + i * 120000 })),
  ];

  it('a 16-set leg day is NOT "fatigued" 4.3 days later (his live complaint), but IS at 24h', () => {
    const at4d = getRecoveryByGroup(legDay, [], T0 + 104 * H);
    expect(at4d['picioare-quads']).not.toBe('fatigued');
    expect(at4d['picioare-hamstrings']).not.toBe('fatigued');
    expect(at4d['fese']).not.toBe('fatigued');
    const at24h = getRecoveryByGroup(legDay, [], T0 + 24 * H);
    expect(at24h['picioare-quads']).toBe('fatigued');
    expect(at24h['picioare-hamstrings']).toBe('fatigued');
  });

  it('the leg day is fully recovered by the NEXT scheduled leg day (7 days)', () => {
    const at7d = getRecoveryByGroup(legDay, [], T0 + 168 * H);
    expect(at7d['picioare-quads']).toBe('recovered');
    expect(at7d['picioare-hamstrings']).toBe('recovered');
    expect(at7d['fese']).toBe('recovered');
  });

  it("his REAL 11-direct-set shoulder day reads fatigued the same evening (was: Easing, sets didn't count)", () => {
    const S0 = 1781103000000;
    const shoulderDay = [
      ...[7.5, 8.5, 8.5].map((rpe, i) => ({ ex: 'Seated DB Press', w: 22.5, reps: 6, rpe, ts: S0 + i * 180000 })),
      ...[8.5, 8.5, 7.5].map((rpe, i) => ({ ex: 'DB Lateral Raise', w: 9, reps: 12, rpe, ts: S0 + 1000000 + i * 150000 })),
      ...[6.5, 7.5, 7.5].map((rpe, i) => ({ ex: 'Face Pull', w: 32, reps: 12, rpe, ts: S0 + 1500000 + i * 150000 })),
      ...[7.5, 7.5, 7.5].map((rpe, i) => ({ ex: 'Reverse Pec Deck', w: 24, reps: 10, rpe, ts: S0 + 2000000 + i * 150000 })),
    ];
    const tonight = getRecoveryByGroup(shoulderDay, [], S0 + 5 * H);
    expect(tonight['umeri']).toBe('fatigued');
  });

  it('a typical 3-set accessory day is partial next evening, recovered well inside the window', () => {
    const A0 = 1781000000000;
    const day = [6.5, 7.5, 8.5].map((rpe, i) => ({ ex: 'Leg Extension', w: 90, reps: 15, rpe, ts: A0 + i * 120000 }));
    // +24h: 50.6 raw * exp(-1.8*24/96)=0.638 -> 32.3 -> partial (hand-traced real values)
    const next = getRecoveryByGroup(day, [], A0 + 24 * H);
    expect(next['picioare-quads']).toBe('partial');
    // +86.4h (0.9*window): *0.198 -> 10.0 -> recovered
    const later = getRecoveryByGroup(day, [], A0 + 0.9 * 96 * H);
    expect(later['picioare-quads']).toBe('recovered');
  });
});

// Founder 2026-10-14 ("ieri am avut doar 4 exercitii... vreau sa fie intentional"):
// Monday's Reverse Pec Deck loaded lat + mid_trap like a row, so Tuesday's pull day
// read the back "unrecovered" and cut it (back cut on 12 of 13 back days in his
// Sep-Oct replay; 7 with the fix, the rest the day after a pull session).
describe('dp_rear_delt_no_back_load_v1 — rear-delt isolation is not back work', () => {
  const withFlag = (on, fn) => {
    localStorage.setItem('_devFlags', JSON.stringify({ dp_rear_delt_no_back_load_v1: on }));
    try { return fn(); } finally { localStorage.removeItem('_devFlags'); }
  };

  it('Reverse Pec Deck / Face Pull / DB Rear Delt Fly load no lat or mid_trap (like the curated twins)', () => {
    withFlag(true, () => {
      for (const ex of ['Reverse Pec Deck', 'Face Pull', 'DB Rear Delt Fly', 'Band Pull-Apart']) {
        const m = musclesForExercise(ex);
        expect(m?.primary).toEqual(expect.arrayContaining(['delt_rear']));
        expect([...(m?.primary ?? []), ...(m?.secondary ?? [])]).not.toEqual(expect.arrayContaining(['lat']));
        expect(m?.secondary ?? []).not.toContain('mid_trap');
      }
      expect(EXERCISE_MUSCLES['Rear Delt Fly'].secondary).toEqual([]);
    });
  });

  it('real back work and other umeri+spate lifts keep their back heads', () => {
    withFlag(true, () => {
      expect(musclesForExercise('Chest-Supported Row')?.primary).toEqual(expect.arrayContaining(['lat', 'mid_trap']));
      expect(musclesForExercise('Y Raise')?.secondary ?? []).toEqual(expect.arrayContaining(['lat', 'mid_trap']));
    });
  });

  it('a pec-deck day the evening before no longer makes the back read loaded', () => {
    const now = Date.UTC(2026, 9, 13, 5, 30);
    const logs = [1, 2, 3].map((i) => ({ ex: 'Reverse Pec Deck', w: 50, rpe: 7.5, ts: now - 16 * H - i * 180000 }));
    expect(withFlag(false, () => getRecoveryByGroup(logs, undefined, now).spate)).not.toBe('recovered');
    expect(withFlag(true, () => getRecoveryByGroup(logs, undefined, now).spate)).toBe('recovered');
  });

  it('flag off → the previous derivation exactly (cache keyed by the flag)', () => {
    const off = withFlag(false, () => musclesForExercise('Reverse Pec Deck'));
    expect(off?.secondary).toEqual(expect.arrayContaining(['lat', 'mid_trap']));
  });
});
