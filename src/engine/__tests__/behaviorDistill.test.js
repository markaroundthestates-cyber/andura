// ══ #59 D107 behavioral-log distillation — tests (SYNTHETIC behavior data) ════
// (1) PURE distillation: a user who rates `greu` but always ENTERS over the rec +
//     hits top reps → a POSITIVE rating-RIR offset (their greu has reserve); a
//     consistent rater → near-zero; sparse data → null (neutral, no tuning yet).
// (2) DEBUG-NOISE separation: `tap` rows are EXCLUDED — only `rec`/`log` feed it.
// (3) Persistence round-trip (synced dp-behavior-tuning, fixed-key object).
// (4) Consumer: flag ON → a learned offset lifts the RIR for a greu set; flag OFF →
//     the legacy 3/1/0 map (byte-identical). + the async persist hook.
// NO real user data — every event is a synthetic literal.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  behavioralRir,
  distillRatingOffset,
  pairRecToLog,
  distillBehavior,
  saveBehaviorTuning,
  behaviorRirOffset,
  distillAndPersistBehaviorTuning,
  BEHAVIOR_TUNING_KEY,
  OFFSET_CLAMP,
  MIN_PAIRS,
} from '../dp/behaviorDistill.js';
import { DP } from '../dp.js';
import { DB } from '../../db.js';
import * as flags from '../../util/featureFlags.js';

// The 3-bucket reverse-map horizon the engine stores (workoutStore RATING_TO_RPE).
const RPE = { usor: 6.5, potrivit: 7.5, greu: 8.5 };

// ── Synthetic behavior-log row builders (the D107 BehaviorEvent shape) ────────
let _idc = 0;
const recRow = (session, exEngine, recKg, recReps) => ({
  id: `r-${_idc++}`, t: 1000 + _idc, kind: 'rec', session, exEngine,
  payload: { recKg, recReps },
});
const logRow = (session, exEngine, p) => ({
  id: `l-${_idc++}`, t: 1000 + _idc, kind: 'log', session, exEngine,
  payload: { ...p },
});
const tapRow = (session) => ({
  id: `t-${_idc++}`, t: 1000 + _idc, kind: 'tap', session,
  payload: { testid: 'some-button' },
});

describe('behavioralRir — true reserve from rec-shown vs log-committed', () => {
  it('entered well over the rec + reps over target → clear reserve', () => {
    const r = behavioralRir({ prescribedKg: 80, enteredKg: 92, reps: 12, repTarget: 8 });
    expect(r).toBeGreaterThan(1);
  });
  it('entered at the rec + reps at target → ~no extra reserve', () => {
    const r = behavioralRir({ prescribedKg: 80, enteredKg: 80, reps: 8, repTarget: 8 });
    expect(r).toBe(0);
  });
  it('returns null for unusable reps', () => {
    expect(behavioralRir({ prescribedKg: 80, enteredKg: 80, reps: 0, repTarget: 8 })).toBeNull();
  });
});

describe('distillRatingOffset — pure inference (synthetic users)', () => {
  // A SANDBAGGER-by-rating: rates `greu` (assumed RIR 0) yet ENTERED 15% over the
  // rec and hit 12 when 8 was asked → real reserve their greu under-reports.
  const overConfidentGreu = Array.from({ length: MIN_PAIRS }, () => ({
    rating: 'greu', prescribedKg: 80, enteredKg: 92, reps: 12, repTarget: 8,
  }));
  // A CONSISTENT rater: `potrivit` (assumed RIR 1) with ~1 RIR of true reserve.
  const consistent = Array.from({ length: MIN_PAIRS }, () => ({
    rating: 'potrivit', prescribedKg: 80, enteredKg: 84, reps: 9, repTarget: 8,
  }));

  it('rates greu but over-loads + tops the reps → POSITIVE offset (don\'t stall the climb)', () => {
    const t = distillRatingOffset(overConfidentGreu);
    expect(t).not.toBeNull();
    expect(t.offset).toBeGreaterThan(0.3);
  });

  it('a consistent rater stays near neutral', () => {
    const t = distillRatingOffset(consistent);
    expect(t).not.toBeNull();
    expect(Math.abs(t.offset)).toBeLessThan(0.5);
  });

  it('a thin history stays neutral (null — no tuning until enough pairs)', () => {
    expect(distillRatingOffset(overConfidentGreu.slice(0, MIN_PAIRS - 1))).toBeNull();
  });

  it('the offset is clamped to the sane band', () => {
    const extreme = Array.from({ length: 60 }, () => ({
      rating: 'greu', prescribedKg: 50, enteredKg: 100, reps: 20, repTarget: 8,
    }));
    const t = distillRatingOffset(extreme);
    expect(t.offset).toBeLessThanOrEqual(OFFSET_CLAMP);
  });

  it('a non-3-bucket rating is skipped (does not corrupt the fold)', () => {
    const junk = Array.from({ length: MIN_PAIRS }, () => ({
      rating: 'meh', prescribedKg: 80, enteredKg: 200, reps: 30, repTarget: 8,
    }));
    expect(distillRatingOffset(junk)).toBeNull(); // 0 qualifying pairs
  });
});

describe('pairRecToLog — debug-noise vs engine-signal separation', () => {
  beforeEach(() => { _idc = 0; });

  it('EXCLUDES tap rows; pairs rec→log on session+exEngine', () => {
    const events = [
      tapRow(50), tapRow(50), // founder debug noise — must NOT appear
      recRow(50, 'Flat DB Press', 80, 8),
      logRow(50, 'Flat DB Press', { rating: 'greu', enteredKg: 90, reps: 12 }),
      tapRow(50),
    ];
    const pairs = pairRecToLog(events);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].rating).toBe('greu');
    // repTarget falls back to the paired rec's recReps; prescribedKg to recKg.
    expect(pairs[0].prescribedKg).toBe(80);
    expect(pairs[0].repTarget).toBe(8);
    expect(pairs[0].enteredKg).toBe(90);
  });

  it('uses the SELF-CONTAINED log prescription when present (no rec needed)', () => {
    const events = [
      logRow(51, 'Lat Pulldown', {
        rating: 'usor', prescribedKg: 60, prescribedReps: 10, enteredKg: 60, reps: 8,
      }),
    ];
    const pairs = pairRecToLog(events);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].prescribedKg).toBe(60);
    expect(pairs[0].repTarget).toBe(10);
  });

  it('drops a log with no rating / no entered load', () => {
    const events = [
      logRow(52, 'X', { enteredKg: 60, reps: 8 }),       // no rating
      logRow(52, 'X', { rating: 'greu', reps: 8 }),       // no enteredKg
    ];
    expect(pairRecToLog(events)).toHaveLength(0);
  });
});

describe('distillBehavior — end-to-end from synthetic log rows', () => {
  beforeEach(() => { _idc = 0; });

  it('an over-confident-greu user across a full log → a positive offset tuning', () => {
    const events = [];
    for (let s = 0; s < MIN_PAIRS; s++) {
      events.push(tapRow(s)); // noise interleaved — must be ignored
      events.push(recRow(s, 'Flat DB Press', 80, 8));
      events.push(logRow(s, 'Flat DB Press', { rating: 'greu', enteredKg: 92, reps: 12 }));
    }
    const tuning = distillBehavior(events);
    expect(tuning).not.toBeNull();
    expect(tuning.ratingRirOffset.offset).toBeGreaterThan(0.3);
    expect(tuning.ratingRirOffset.n).toBe(MIN_PAIRS);
  });

  it('a sparse log → null (no tuning artifact)', () => {
    const events = [
      recRow(0, 'X', 80, 8),
      logRow(0, 'X', { rating: 'greu', enteredKg: 92, reps: 12 }),
    ];
    expect(distillBehavior(events)).toBeNull();
  });

  it('determinism — same input → same tuning', () => {
    const mk = () => {
      _idc = 0;
      const ev = [];
      for (let s = 0; s < MIN_PAIRS; s++) {
        ev.push(recRow(s, 'X', 80, 8));
        ev.push(logRow(s, 'X', { rating: 'greu', enteredKg: 90, reps: 11 }));
      }
      return ev;
    };
    expect(distillBehavior(mk())).toEqual(distillBehavior(mk()));
  });
});

describe('persistence — synced dp-behavior-tuning (fixed-key object)', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips the tuning + the offset read', () => {
    saveBehaviorTuning({ ratingRirOffset: { offset: 1.0, n: 10 } });
    expect(behaviorRirOffset()).toBe(1.0);
    expect(DB.get(BEHAVIOR_TUNING_KEY).ratingRirOffset.n).toBe(10);
  });

  it('returns 0 when no tuning exists (neutral)', () => {
    expect(behaviorRirOffset()).toBe(0);
  });

  it('an under-MIN_PAIRS offset is not trusted (0)', () => {
    saveBehaviorTuning({ ratingRirOffset: { offset: 1.2, n: MIN_PAIRS - 1 } });
    expect(behaviorRirOffset()).toBe(0);
  });

  it('rejects an invalid artifact', () => {
    expect(saveBehaviorTuning(null).error).toBe('invalid_tuning');
    expect(saveBehaviorTuning([]).error).toBe('invalid_tuning');
  });
});

describe('distillAndPersistBehaviorTuning — async session-end hook', () => {
  beforeEach(() => { localStorage.clear(); _idc = 0; });

  it('reads the injected log, distills, persists; EMA-continues from the prior', async () => {
    const events = [];
    for (let s = 0; s < MIN_PAIRS; s++) {
      events.push(recRow(s, 'X', 80, 8));
      events.push(logRow(s, 'X', { rating: 'greu', enteredKg: 92, reps: 12 }));
    }
    const tuning = await distillAndPersistBehaviorTuning(async () => events);
    expect(tuning).not.toBeNull();
    expect(behaviorRirOffset()).toBeGreaterThan(0.3);
  });

  it('a throwing reader never throws (fail-silent → null)', async () => {
    await expect(
      distillAndPersistBehaviorTuning(async () => { throw new Error('idb down'); })
    ).resolves.toBeNull();
  });
});

describe('DP._rirFromRpe — behavior-distill consumer', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('FLAG OFF (default) — the legacy 3/1/0 map (byte-identical)', () => {
    // dp_behavior_distill_v1 flipped default-ON (Wave 2026-06-14); pin it OFF to
    // assert the legacy 3/1/0 map (no learned offset) explicitly.
    localStorage.setItem('_devFlags', JSON.stringify({ dp_behavior_distill_v1: false }));
    saveBehaviorTuning({ ratingRirOffset: { offset: 1.5, n: 10 } }); // present but flag off
    expect(DP._rirFromRpe(RPE.greu, 'Flat DB Press')).toBe(0);
    expect(DP._rirFromRpe(RPE.potrivit, 'Flat DB Press')).toBe(1);
    expect(DP._rirFromRpe(RPE.usor, 'Flat DB Press')).toBe(3);
    // …and with NO exercise (the global offset path) it is still legacy when OFF.
    expect(DP._rirFromRpe(RPE.greu)).toBe(0);
  });

  it('FLAG ON + a positive offset — lifts a greu set off RIR 0 (climb resumes), even with no ex', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_behavior_distill_v1');
    saveBehaviorTuning({ ratingRirOffset: { offset: 1.5, n: 10 } });
    // greu base 0 + 1.5 offset → 1.5. The offset is GLOBAL → applies without an ex.
    expect(DP._rirFromRpe(RPE.greu)).toBe(1.5);
    expect(DP._rirFromRpe(RPE.greu, 'Flat DB Press')).toBe(1.5);
  });

  it('FLAG ON + a negative offset — never drops RIR below 0', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_behavior_distill_v1');
    saveBehaviorTuning({ ratingRirOffset: { offset: -1.5, n: 10 } });
    expect(DP._rirFromRpe(RPE.greu)).toBe(0);       // 0 + (-1.5) clamped at 0
    expect(DP._rirFromRpe(RPE.usor)).toBe(1.5);     // 3 + (-1.5) → 1.5
  });

  it('FLAG ON but no trusted tuning — the legacy map (byte-identical)', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_behavior_distill_v1');
    expect(DP._rirFromRpe(RPE.greu)).toBe(0);
  });
});
