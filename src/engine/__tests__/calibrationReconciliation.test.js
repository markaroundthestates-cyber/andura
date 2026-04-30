// ══ src/engine/calibrationReconciliation.js — ADR 021 algorithm tests ══════
// Coverage: schema constants, helpers (computeEngineTier, maxConfidence,
// mergeVersionVector, mergeObservations), reconcile (full algorithm),
// bumpVersion (local change), Edge Cases EC-1..EC-6 mandatory per ADR 021.

import { describe, it, expect } from 'vitest';
import {
  CONFIDENCE_ORDER,
  ENGINE_TIER_ORDER,
  ENGINE_TIER_THRESHOLDS,
  createInitialCalibrationState,
  computeEngineTier,
  maxConfidence,
  mergeVersionVector,
  mergeObservations,
  reconcile,
  bumpVersion,
} from '../calibrationReconciliation.js';

// ── Schema constants ───────────────────────────────────────────────────────

describe('CONFIDENCE_ORDER (ADR 009 §AMENDMENT 6 nivele canonical)', () => {
  it('lists 6 levels in monotonic progression order', () => {
    expect(CONFIDENCE_ORDER).toEqual([
      'COLD_START',
      'INITIAL',
      'DEVELOPING',
      'PERSONALIZING',
      'PERSONALIZED',
      'OPTIMIZED',
    ]);
  });

  it('is frozen (immutable export)', () => {
    expect(Object.isFrozen(CONFIDENCE_ORDER)).toBe(true);
  });
});

describe('ENGINE_TIER_ORDER (ADR 009 §AMENDMENT data volume axis)', () => {
  it('lists T0/T1/T2 in monotonic order', () => {
    expect(ENGINE_TIER_ORDER).toEqual(['T0', 'T1', 'T2']);
  });

  it('thresholds match ADR 009 §AMENDMENT §Mapare boundaries', () => {
    expect(ENGINE_TIER_THRESHOLDS.T0).toEqual({ min: 0, max: 4 });
    expect(ENGINE_TIER_THRESHOLDS.T1).toEqual({ min: 5, max: 20 });
    expect(ENGINE_TIER_THRESHOLDS.T2.min).toBe(21);
    expect(ENGINE_TIER_THRESHOLDS.T2.max).toBe(Infinity);
  });
});

// ── createInitialCalibrationState ──────────────────────────────────────────

describe('createInitialCalibrationState', () => {
  it('returns canonical fresh state with deviceId VV pre-filled (ADR 021 §Pre-Faza-2)', () => {
    const state = createInitialCalibrationState('device_X', 1700000000000);
    expect(state).toEqual({
      engine_tier: 'T0',
      calibration_confidence: 'COLD_START',
      version_vector: { device_X: 1 },
      last_updated: '2023-11-14T22:13:20.000Z',
      session_count: 0,
      observations: {
        yo_yo_detected: false,
        aa_high_events: [],
        frustration_markers_count: 0,
        plateau_streaks_weeks: 0,
      },
    });
  });

  it('returns empty VV when no deviceId provided', () => {
    const state = createInitialCalibrationState();
    expect(state.version_vector).toEqual({});
  });
});

// ── computeEngineTier (Max Wins Monotonic) ─────────────────────────────────

describe('computeEngineTier', () => {
  it('returns T0 for 0-4 sessions', () => {
    expect(computeEngineTier(0)).toBe('T0');
    expect(computeEngineTier(4)).toBe('T0');
  });

  it('returns T1 for 5-20 sessions', () => {
    expect(computeEngineTier(5)).toBe('T1');
    expect(computeEngineTier(20)).toBe('T1');
  });

  it('returns T2 for 21+ sessions', () => {
    expect(computeEngineTier(21)).toBe('T2');
    expect(computeEngineTier(1000)).toBe('T2');
  });

  it('defensive: negative or non-finite → T0', () => {
    expect(computeEngineTier(-5)).toBe('T0');
    expect(computeEngineTier(NaN)).toBe('T0');
    expect(computeEngineTier(undefined)).toBe('T0');
  });

  it('Max Wins property: tier monotonic non-decreasing in session count', () => {
    const tiers = [0, 4, 5, 20, 21, 100].map(computeEngineTier);
    const indices = tiers.map(t => ENGINE_TIER_ORDER.indexOf(t));
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThanOrEqual(indices[i - 1]);
    }
  });
});

// ── maxConfidence (Monotonic Clock) ────────────────────────────────────────

describe('maxConfidence', () => {
  it('returns more progressed of two valid confidences', () => {
    expect(maxConfidence('COLD_START', 'INITIAL')).toBe('INITIAL');
    expect(maxConfidence('INITIAL', 'DEVELOPING')).toBe('DEVELOPING');
    expect(maxConfidence('PERSONALIZING', 'PERSONALIZED')).toBe('PERSONALIZED');
    expect(maxConfidence('OPTIMIZED', 'COLD_START')).toBe('OPTIMIZED');
  });

  it('symmetric: maxConfidence(a, b) === maxConfidence(b, a)', () => {
    expect(maxConfidence('OPTIMIZED', 'INITIAL')).toBe(maxConfidence('INITIAL', 'OPTIMIZED'));
  });

  it('idempotent on equal inputs', () => {
    expect(maxConfidence('PERSONALIZING', 'PERSONALIZING')).toBe('PERSONALIZING');
  });

  it('defensive: unknown enum treated as COLD_START (idx 0)', () => {
    expect(maxConfidence('GIBBERISH', 'INITIAL')).toBe('INITIAL');
    expect(maxConfidence(undefined, 'DEVELOPING')).toBe('DEVELOPING');
  });
});

// ── mergeVersionVector (element-wise MAX) ──────────────────────────────────

describe('mergeVersionVector', () => {
  it('takes element-wise MAX of overlapping keys', () => {
    const result = mergeVersionVector({ A: 5, B: 3 }, { A: 2, B: 7 });
    expect(result).toEqual({ A: 5, B: 7 });
  });

  it('unions disjoint device keys', () => {
    const result = mergeVersionVector({ A: 5 }, { B: 3 });
    expect(result).toEqual({ A: 5, B: 3 });
  });

  it('handles undefined inputs gracefully', () => {
    expect(mergeVersionVector(undefined, undefined)).toEqual({});
    expect(mergeVersionVector({ A: 5 }, undefined)).toEqual({ A: 5 });
  });

  it('idempotent on equal inputs', () => {
    const v = { A: 5, B: 3 };
    expect(mergeVersionVector(v, v)).toEqual(v);
  });
});

// ── mergeObservations (union, monotonic) ───────────────────────────────────

describe('mergeObservations', () => {
  it('OR yo_yo_detected — once true, stays true', () => {
    expect(mergeObservations({ yo_yo_detected: false }, { yo_yo_detected: true }).yo_yo_detected).toBe(true);
    expect(mergeObservations({ yo_yo_detected: true }, { yo_yo_detected: false }).yo_yo_detected).toBe(true);
    expect(mergeObservations({ yo_yo_detected: false }, { yo_yo_detected: false }).yo_yo_detected).toBe(false);
  });

  it('dedupes AA HIGH events by event_id', () => {
    const a = { aa_high_events: [{ event_id: 'e1', ts: 100 }, { event_id: 'e2', ts: 200 }] };
    const b = { aa_high_events: [{ event_id: 'e2', ts: 200 }, { event_id: 'e3', ts: 300 }] };
    const merged = mergeObservations(a, b);
    expect(merged.aa_high_events.map(e => e.event_id).sort()).toEqual(['e1', 'e2', 'e3']);
  });

  it('takes MAX of frustration_markers_count + plateau_streaks_weeks', () => {
    const result = mergeObservations(
      { frustration_markers_count: 3, plateau_streaks_weeks: 2 },
      { frustration_markers_count: 7, plateau_streaks_weeks: 1 }
    );
    expect(result.frustration_markers_count).toBe(7);
    expect(result.plateau_streaks_weeks).toBe(2);
  });

  it('defensive: undefined inputs → safe defaults', () => {
    const result = mergeObservations(undefined, undefined);
    expect(result).toEqual({
      yo_yo_detected: false,
      aa_high_events: [],
      frustration_markers_count: 0,
      plateau_streaks_weeks: 0,
    });
  });
});

// ── reconcile — full algorithm + edge cases ────────────────────────────────

const NOW = 1700000000000; // Nov 14, 2023 fixed epoch

function makeBranch(overrides = {}) {
  return {
    engine_tier: 'T0',
    calibration_confidence: 'COLD_START',
    version_vector: { A: 1 },
    last_updated: '2023-01-01T00:00:00.000Z',
    session_count: 0,
    observations: {
      yo_yo_detected: false,
      aa_high_events: [],
      frustration_markers_count: 0,
      plateau_streaks_weeks: 0,
    },
    ...overrides,
  };
}

describe('reconcile — happy path', () => {
  it('merges two device branches into canonical state', () => {
    const a = makeBranch({ session_count: 24, calibration_confidence: 'PERSONALIZING', version_vector: { A: 12 } });
    const b = makeBranch({ session_count: 8, calibration_confidence: 'INITIAL', version_vector: { B: 5 } });
    const result = reconcile(a, b, { now: NOW });

    expect(result.session_count).toBe(24);
    expect(result.engine_tier).toBe('T2');
    expect(result.calibration_confidence).toBe('PERSONALIZING');
    expect(result.version_vector).toEqual({ A: 12, B: 5 });
    expect(result.last_updated).toBe(new Date(NOW).toISOString());
  });

  it('idempotent: reconcile(reconcile(A,B), B) === reconcile(A, B) modulo timestamp', () => {
    const a = makeBranch({ session_count: 10, calibration_confidence: 'INITIAL', version_vector: { A: 3 } });
    const b = makeBranch({ session_count: 5, calibration_confidence: 'DEVELOPING', version_vector: { B: 2 } });
    const once = reconcile(a, b, { now: NOW });
    const twice = reconcile(once, b, { now: NOW });

    expect(twice.session_count).toBe(once.session_count);
    expect(twice.engine_tier).toBe(once.engine_tier);
    expect(twice.calibration_confidence).toBe(once.calibration_confidence);
    expect(twice.version_vector).toEqual(once.version_vector);
    expect(twice.observations).toEqual(once.observations);
  });
});

// ── EC-1..EC-6 mandatory per ADR 021 §Edge cases ───────────────────────────

describe('reconcile — EC-1: same session_count, different confidence', () => {
  it('max progress confidence wins', () => {
    const a = makeBranch({ session_count: 15, calibration_confidence: 'INITIAL' });
    const b = makeBranch({ session_count: 15, calibration_confidence: 'DEVELOPING' });
    const result = reconcile(a, b, { now: NOW });
    expect(result.calibration_confidence).toBe('DEVELOPING');
    expect(result.session_count).toBe(15);
    expect(result.engine_tier).toBe('T1');
  });
});

describe('reconcile — EC-2: yo-yo flag preserved (monotonic negative observation)', () => {
  it('flag set on B, not on A → preserved in canonical', () => {
    const a = makeBranch({ session_count: 30, observations: { yo_yo_detected: false, aa_high_events: [], frustration_markers_count: 0, plateau_streaks_weeks: 0 } });
    const b = makeBranch({ session_count: 10, observations: { yo_yo_detected: true, aa_high_events: [], frustration_markers_count: 0, plateau_streaks_weeks: 0 } });
    const result = reconcile(a, b, { now: NOW });
    expect(result.observations.yo_yo_detected).toBe(true);
    expect(result.session_count).toBe(30);
  });

  it('flag persists across multiple reconciliations (cannot be erased)', () => {
    const seed = makeBranch({ observations: { yo_yo_detected: true, aa_high_events: [], frustration_markers_count: 0, plateau_streaks_weeks: 0 } });
    const clean = makeBranch({ observations: { yo_yo_detected: false, aa_high_events: [], frustration_markers_count: 0, plateau_streaks_weeks: 0 } });
    const r1 = reconcile(seed, clean, { now: NOW });
    const r2 = reconcile(r1, clean, { now: NOW });
    const r3 = reconcile(r2, clean, { now: NOW });
    expect(r3.observations.yo_yo_detected).toBe(true);
  });
});

describe('reconcile — EC-3: idempotent retry safe (network partition mid-sync)', () => {
  it('reconcile is pure — same input always produces same canonical (modulo timestamp)', () => {
    const a = makeBranch({ session_count: 20, calibration_confidence: 'PERSONALIZING', version_vector: { A: 7 } });
    const b = makeBranch({ session_count: 15, calibration_confidence: 'DEVELOPING', version_vector: { B: 4 } });
    const r1 = reconcile(a, b, { now: NOW });
    const r2 = reconcile(a, b, { now: NOW });
    expect(r1).toEqual(r2);
  });
});

describe('reconcile — EC-4: defensive against missing/empty branch (Tier 2 restore)', () => {
  it('reconcile with empty initial state gracefully restores from non-empty branch', () => {
    const empty = createInitialCalibrationState('A', NOW);
    const populated = makeBranch({
      session_count: 50,
      calibration_confidence: 'PERSONALIZED',
      version_vector: { A: 25, B: 10 },
      observations: { yo_yo_detected: false, aa_high_events: [{ event_id: 'aa_1' }], frustration_markers_count: 3, plateau_streaks_weeks: 2 },
    });
    const result = reconcile(empty, populated, { now: NOW });
    expect(result.session_count).toBe(50);
    expect(result.calibration_confidence).toBe('PERSONALIZED');
    expect(result.version_vector).toEqual({ A: 25, B: 10 });
    expect(result.observations.aa_high_events).toHaveLength(1);
  });
});

describe('reconcile — EC-5: anonymous → auth UUID merge', () => {
  it('reconciles 2 anonymous device VVs (Daniel D12 scenario phone + PC)', () => {
    const anonPhone = makeBranch({
      session_count: 8,
      calibration_confidence: 'INITIAL',
      version_vector: { anon_phone_uuid: 4 },
    });
    const anonPC = makeBranch({
      session_count: 12,
      calibration_confidence: 'DEVELOPING',
      version_vector: { anon_pc_uuid: 6 },
    });
    const result = reconcile(anonPhone, anonPC, { now: NOW });
    expect(result.session_count).toBe(12);
    expect(result.engine_tier).toBe('T1');
    expect(result.calibration_confidence).toBe('DEVELOPING');
    expect(result.version_vector).toEqual({
      anon_phone_uuid: 4,
      anon_pc_uuid: 6,
    });
  });
});

describe('reconcile — EC-6: clock skew (last_updated NOT tie-breaker)', () => {
  it('reconcile ignores last_updated for canonical decisions; only used as output stamp', () => {
    const a = makeBranch({
      session_count: 30,
      calibration_confidence: 'PERSONALIZING',
      last_updated: '2026-01-01T00:00:00.000Z', // older
    });
    const b = makeBranch({
      session_count: 5,
      calibration_confidence: 'INITIAL',
      last_updated: '2026-12-31T00:00:00.000Z', // newer (clock skew?)
    });
    const result = reconcile(a, b, { now: NOW });
    // Canonical reflects max session count + max confidence, NOT newer last_updated
    expect(result.session_count).toBe(30);
    expect(result.calibration_confidence).toBe('PERSONALIZING');
    // Output last_updated = reconciliation time (NOW), not branch timestamps
    expect(result.last_updated).toBe(new Date(NOW).toISOString());
  });
});

// ── bumpVersion (local change increments VV) ───────────────────────────────

describe('bumpVersion', () => {
  it('increments deviceId entry by 1', () => {
    const state = makeBranch({ version_vector: { A: 5, B: 3 } });
    const bumped = bumpVersion(state, 'A', { now: NOW });
    expect(bumped.version_vector).toEqual({ A: 6, B: 3 });
    expect(bumped.last_updated).toBe(new Date(NOW).toISOString());
  });

  it('initializes deviceId to 1 if absent', () => {
    const state = makeBranch({ version_vector: { A: 5 } });
    const bumped = bumpVersion(state, 'C', { now: NOW });
    expect(bumped.version_vector.C).toBe(1);
    expect(bumped.version_vector.A).toBe(5);
  });

  it('does not mutate input (immutable update)', () => {
    const state = makeBranch({ version_vector: { A: 5 } });
    const original = JSON.parse(JSON.stringify(state));
    bumpVersion(state, 'A', { now: NOW });
    expect(state).toEqual(original);
  });

  it('returns state unchanged if deviceId absent', () => {
    const state = makeBranch({ version_vector: { A: 5 } });
    expect(bumpVersion(state, '', { now: NOW })).toBe(state);
    expect(bumpVersion(state, undefined, { now: NOW })).toBe(state);
  });

  it('returns state unchanged if state null/undefined', () => {
    expect(bumpVersion(null, 'A')).toBeNull();
    expect(bumpVersion(undefined, 'A')).toBeUndefined();
  });
});
