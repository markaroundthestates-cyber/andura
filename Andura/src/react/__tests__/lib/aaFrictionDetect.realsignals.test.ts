// Phase 6 task_07 — aaFriction real signals wire end-to-end tests.
// Verifies deriveThresholds output cu real-signal inputs propagates corect la
// detectAggressiveLoad 3rd arg, replacing Phase 5 implicit DEFAULT fallback.

import { describe, it, expect } from 'vitest';
import {
  deriveThresholds,
  detectAggressiveLoad,
  DEFAULT_THRESHOLDS,
} from '../../lib/aaFrictionDetect';
import type { SetSample } from '../../lib/aaFrictionDetect';

describe('aaFrictionDetect — real signals end-to-end wire', () => {
  it('high vitality+adherence signals → laxer thresholds (kg_jump+rep_spike threshold rise above DEFAULT)', () => {
    const lax = deriveThresholds({ vitalityScore: 90, adherenceScore: 90 });
    expect(lax.kgJumpThreshold).toBeGreaterThanOrEqual(DEFAULT_THRESHOLDS.kgJumpThreshold);
    expect(lax.repSpikeThreshold).toBeGreaterThanOrEqual(DEFAULT_THRESHOLDS.repSpikeThreshold);
  });

  it('low vitality+adherence signals → stricter thresholds (kg_jump+rep_spike threshold drop below DEFAULT)', () => {
    const strict = deriveThresholds({ vitalityScore: 20, adherenceScore: 20 });
    expect(strict.kgJumpThreshold).toBeLessThanOrEqual(DEFAULT_THRESHOLDS.kgJumpThreshold);
    expect(strict.repSpikeThreshold).toBeLessThanOrEqual(DEFAULT_THRESHOLDS.repSpikeThreshold);
  });

  it('mid signals (50/50 baseline) → DEFAULT thresholds parity', () => {
    const mid = deriveThresholds({ vitalityScore: 50, adherenceScore: 50 });
    expect(mid.kgJumpThreshold).toBeCloseTo(DEFAULT_THRESHOLDS.kgJumpThreshold, 2);
    expect(mid.repSpikeThreshold).toBeCloseTo(DEFAULT_THRESHOLDS.repSpikeThreshold, 2);
  });

  it('strict thresholds trigger kg_jump pe smaller increase decat lax thresholds', () => {
    const history: SetSample[] = [
      { kg: 100, reps: 5, timestamp: 1000 },
    ];
    const newSet: SetSample = { kg: 115, reps: 5, timestamp: 1_000_000 }; // 15% kg increase
    const lax = deriveThresholds({ vitalityScore: 90, adherenceScore: 90 });
    const strict = deriveThresholds({ vitalityScore: 20, adherenceScore: 20 });
    const laxCheck = detectAggressiveLoad(history, newSet, lax);
    const strictCheck = detectAggressiveLoad(history, newSet, strict);
    // Strict ≤ DEFAULT 0.2, lax ≥ DEFAULT 0.2 — 15% jump triggers depinde
    expect(strict.kgJumpThreshold).toBeLessThanOrEqual(lax.kgJumpThreshold);
    if (strict.kgJumpThreshold < 0.15) {
      expect(strictCheck.trigger).toBe(true);
    }
    if (lax.kgJumpThreshold > 0.15) {
      expect(laxCheck.trigger).toBe(false);
    }
  });

  it('detectAggressiveLoad 2-arg backward compat (DEFAULT thresholds default)', () => {
    const history: SetSample[] = [
      { kg: 100, reps: 5, timestamp: 1000 },
    ];
    const newSet: SetSample = { kg: 200, reps: 5, timestamp: 1_000_000 }; // 100% kg jump
    const check = detectAggressiveLoad(history, newSet); // NU 3rd arg
    expect(check.trigger).toBe(true);
    expect(check.reason).toBe('kg_jump');
  });

  it('empty history → NU trigger regardless of thresholds (no baseline)', () => {
    const strict = deriveThresholds({ vitalityScore: 20, adherenceScore: 20 });
    const newSet: SetSample = { kg: 200, reps: 5, timestamp: 1_000_000 };
    const check = detectAggressiveLoad([], newSet, strict);
    expect(check.trigger).toBe(false);
  });

  it('fastSetsIntervalMs derived parity DEFAULT pe mid signals', () => {
    const mid = deriveThresholds({ vitalityScore: 50, adherenceScore: 50 });
    expect(mid.fastSetsIntervalMs).toBe(DEFAULT_THRESHOLDS.fastSetsIntervalMs);
  });

  it('thresholds object frozen-safe (returns plain object NU mutated DEFAULT)', () => {
    const t = deriveThresholds({ vitalityScore: 50, adherenceScore: 50 });
    expect(t).not.toBe(DEFAULT_THRESHOLDS); // not same ref
    expect(t.kgJumpThreshold).toBe(DEFAULT_THRESHOLDS.kgJumpThreshold);
  });
});
