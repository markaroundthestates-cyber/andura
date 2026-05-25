// SHAPE audit Gap HIGH #1 — toEngineSession transform tests.
//
// Verifies LastSessionSummary → engine recentSessions[*] shape derives the
// signal fields engine consumers read (rir / daysAgo) from honest summary
// data, and does NOT fabricate fields (energy/injury/weekIdx) absent from the
// store. Pure transform — `now` injected for deterministic daysAgo.

import { describe, it, expect } from 'vitest';
import { toEngineSession } from '../../lib/scheduleAdapterAggregate';
import type { LastSessionSummary } from '../../stores/workoutStore';
import { MS_PER_DAY } from '../../../constants.js';

const NOW = new Date(2026, 4, 25, 12, 0, 0).getTime();

function summary(over: Partial<LastSessionSummary> = {}): LastSessionSummary {
  return {
    title: 'Push',
    meta: '5 seturi · 52 min · 12 450 kg',
    ts: NOW,
    sets: 5,
    durationMin: 52,
    volumeKg: 12450,
    ...over,
  };
}

function breakdown(ratings: Array<'usor' | 'potrivit' | 'greu'>) {
  return [
    {
      exerciseId: 'flat-db-press',
      exerciseName: 'Flat DB Press',
      sets: ratings.map((rating, i) => ({
        kg: 30,
        reps: 10,
        rating,
        timestamp: NOW - i * 60000,
      })),
      totalVolume: 300 * ratings.length,
      peakOneRM: 40,
    },
  ];
}

describe('toEngineSession — daysAgo derivation', () => {
  it('derives daysAgo=0 for a session finished today', () => {
    expect(toEngineSession(summary({ ts: NOW }), NOW).daysAgo).toBe(0);
  });

  it('derives daysAgo from ts (exact floor)', () => {
    const ts = NOW - 5 * MS_PER_DAY - 3600000; // 5 days + 1h ago
    expect(toEngineSession(summary({ ts }), NOW).daysAgo).toBe(5);
  });

  it('clamps negative daysAgo to 0 (future ts / clock skew defensive)', () => {
    const ts = NOW + 2 * MS_PER_DAY;
    expect(toEngineSession(summary({ ts }), NOW).daysAgo).toBe(0);
  });

  it('uses Date.now() default when now arg omitted', () => {
    const out = toEngineSession(summary({ ts: Date.now() }));
    expect(out.daysAgo).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(out.daysAgo)).toBe(true);
  });
});

describe('toEngineSession — rir derivation from per-set ratings', () => {
  it('maps dominant "greu" rating → rir 1 (engine isMariusDualSignalGreen band)', () => {
    const out = toEngineSession(summary({ exercises: breakdown(['greu', 'greu', 'usor']) }), NOW);
    expect(out.rir).toBe(1);
  });

  it('maps dominant "potrivit" rating → rir 2', () => {
    const out = toEngineSession(summary({ exercises: breakdown(['potrivit', 'potrivit', 'greu']) }), NOW);
    expect(out.rir).toBe(2);
  });

  it('maps dominant "usor" rating → rir 3', () => {
    const out = toEngineSession(summary({ exercises: breakdown(['usor', 'usor', 'usor', 'potrivit']) }), NOW);
    expect(out.rir).toBe(3);
  });

  it('omits rir when summary carries no per-set breakdown (pre-Phase-5 session)', () => {
    // base summary() omits exercises entirely (pre-Phase-5 persisted shape).
    const out = toEngineSession(summary(), NOW);
    expect(out.rir).toBeUndefined();
    expect('rir' in out).toBe(false);
  });

  it('omits rir when exercises present but contain zero sets', () => {
    const out = toEngineSession(
      summary({
        exercises: [
          { exerciseId: 'x', exerciseName: 'X', sets: [], totalVolume: 0, peakOneRM: 0 },
        ],
      }),
      NOW,
    );
    expect(out.rir).toBeUndefined();
  });
});

describe('toEngineSession — Bugatti truth (no fabricated fields)', () => {
  it('does NOT fabricate energy / injury / weekIdx (no honest store source)', () => {
    const out = toEngineSession(summary({ exercises: breakdown(['greu']) }), NOW);
    expect('energy' in out).toBe(false);
    expect('injury' in out).toBe(false);
    expect('weekIdx' in out).toBe(false);
  });

  it('preserves all original summary fields (additive transform)', () => {
    const base = summary({ exercises: breakdown(['potrivit']) });
    const out = toEngineSession(base, NOW);
    expect(out.title).toBe(base.title);
    expect(out.meta).toBe(base.meta);
    expect(out.ts).toBe(base.ts);
    expect(out.sets).toBe(base.sets);
    expect(out.durationMin).toBe(base.durationMin);
    expect(out.volumeKg).toBe(base.volumeKg);
    expect(out.exercises).toBe(base.exercises);
  });

  it('does not mutate the input summary', () => {
    const base = summary({ exercises: breakdown(['greu']) });
    const snapshot = JSON.stringify(base);
    toEngineSession(base, NOW);
    expect(JSON.stringify(base)).toBe(snapshot);
  });
});
