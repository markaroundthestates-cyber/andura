// ══ #6 — canonical writeback regression (closes the b32abac3 strand class) ════
// PROVES: a log written under an RO / legacy display name now lands under the EN
// canonical engineName the engine (DP.getLogs) reads — so the value can never
// strand off the engine key again (the "weight didn't move" / cold-start-forever
// bug). And the common case (engineName already canonical) stays byte-identical.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildLogEntriesFromSummary } from '../workoutStore.logic';
import { DB } from '../../../db.js';
import { DP } from '../../../engine/dp.js';
import * as featureFlags from '../../../util/featureFlags.js';
import type { LastSessionSummary } from '../workoutStore.types';

const SESSION = 1_700_000_000_000;

function summaryWith(ex: { exerciseName: string; engineName?: string }): LastSessionSummary {
  return {
    meta: '1 set',
    exercises: [
      {
        exerciseName: ex.exerciseName,
        ...(ex.engineName ? { engineName: ex.engineName } : {}),
        sets: [{ kg: 60, reps: 8, rating: 'potrivit', timestamp: SESSION + 1 }],
        totalVolume: 480,
        peakOneRM: 75,
      },
    ],
  } as unknown as LastSessionSummary;
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// The behavioral writeback resolution is gated behind dp_library_chains_v1
// (default OFF). Force it ON for the resolution assertions; a dedicated test
// covers the OFF (byte-identical) path.
function flagOn() {
  vi.spyOn(featureFlags, 'isEnabled').mockImplementation(
    (f: string) => f === 'dp_library_chains_v1'
  );
}

describe('#6 canonical writeback — RO/legacy display name resolves to the engine key (flag ON)', () => {
  beforeEach(flagOn);

  it('a legacy-session entry carrying ONLY an RO display name lands under the EN canonical', () => {
    // Legacy in-flight set: no engineName, exerciseName is the RO display string.
    const entries = buildLogEntriesFromSummary(
      summaryWith({ exerciseName: 'Genuflexiuni cu bara sus' }),
      SESSION
    );
    expect(entries).toHaveLength(1);
    // It is keyed under the EN canonical, NOT the RO display.
    expect(entries[0]?.ex).toBe('Barbell Back Squat (High Bar)');
    expect(entries[0]?.ex).not.toBe('Genuflexiuni cu bara sus');

    // End-to-end: persist + the engine finds it under the canonical key (and NOT
    // under the RO display name) — the exact strand the #41 guard names.
    DB.set('logs', entries);
    expect(DP.getLogs('Barbell Back Squat (High Bar)')).toHaveLength(1);
    expect(DP.getLogs('Genuflexiuni cu bara sus')).toHaveLength(0);
  });

  it('a legacy pre-F-1 synonym name resolves to its CORE_AUTO canonical', () => {
    const entries = buildLogEntriesFromSummary(
      summaryWith({ exerciseName: 'Pushdown' }),
      SESSION
    );
    expect(entries[0]?.ex).toBe('Cable Triceps Pushdown Straight Bar');
  });

  it('an already-canonical engineName is BYTE-IDENTICAL (the common path, no churn)', () => {
    const entries = buildLogEntriesFromSummary(
      summaryWith({ exerciseName: 'Impins plat cu gantere', engineName: 'Flat DB Press' }),
      SESSION
    );
    // engineName present + canonical → identity. The key is unchanged.
    expect(entries[0]?.ex).toBe('Flat DB Press');
    DB.set('logs', entries);
    expect(DP.getLogs('Flat DB Press')).toHaveLength(1);
  });

  it('an unknown name passes through unchanged (a brand-new exercise still cold-starts)', () => {
    const entries = buildLogEntriesFromSummary(
      summaryWith({ exerciseName: 'Totally Made Up Lift 9000' }),
      SESSION
    );
    expect(entries[0]?.ex).toBe('Totally Made Up Lift 9000');
  });
});

describe('#6 writeback flag OFF (default) — byte-identical legacy derivation', () => {
  it('does NOT resolve a legacy synonym when dp_library_chains_v1 is OFF', () => {
    // Default flag state (no mock) → OFF → the raw ex.engineName ?? exerciseName.
    const entries = buildLogEntriesFromSummary(
      summaryWith({ exerciseName: 'Pushdown' }),
      SESSION
    );
    expect(entries[0]?.ex).toBe('Pushdown'); // unresolved — pre-#6 behavior
  });

  it('engineName still wins over exerciseName when OFF (legacy fallback intact)', () => {
    const entries = buildLogEntriesFromSummary(
      summaryWith({ exerciseName: 'Impins plat cu gantere', engineName: 'Flat DB Press' }),
      SESSION
    );
    expect(entries[0]?.ex).toBe('Flat DB Press');
  });
});
