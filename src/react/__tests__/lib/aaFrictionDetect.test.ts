// ══ AGGRESSIVE LOAD DETECTOR TESTS — task_14 §A pure helper ══════════════

import { describe, it, expect } from 'vitest';
import { detectAggressiveLoad, deriveThresholds, DEFAULT_THRESHOLDS } from '../../lib/aaFrictionDetect';
import type { SetSample } from '../../lib/aaFrictionDetect';

const T0 = 1_700_000_000_000; // arbitrary epoch ms anchor

describe('detectAggressiveLoad — base cases', () => {
  it('returns trigger=false cand history empty', () => {
    const newSet: SetSample = { kg: 20, reps: 10, timestamp: T0 };
    expect(detectAggressiveLoad([], newSet)).toEqual({ trigger: false });
  });

  it('returns trigger=false cand pattern safe (normal progression)', () => {
    const history: SetSample[] = [{ kg: 20, reps: 10, timestamp: T0 }];
    const newSet: SetSample = { kg: 22.5, reps: 10, timestamp: T0 + 90_000 }; // 90s rest, +12.5% kg
    expect(detectAggressiveLoad(history, newSet)).toEqual({ trigger: false });
  });
});

describe('detectAggressiveLoad — fast_sets pattern', () => {
  it('detects 2 sets < 30s interval', () => {
    const history: SetSample[] = [{ kg: 20, reps: 10, timestamp: T0 }];
    const newSet: SetSample = { kg: 20, reps: 10, timestamp: T0 + 25_000 }; // 25s < 30s
    expect(detectAggressiveLoad(history, newSet)).toEqual({
      trigger: true,
      reason: 'fast_sets',
    });
  });

  it('NU trigger cand interval exactly 30s (boundary inclusive safe)', () => {
    const history: SetSample[] = [{ kg: 20, reps: 10, timestamp: T0 }];
    const newSet: SetSample = { kg: 20, reps: 10, timestamp: T0 + 30_000 };
    expect(detectAggressiveLoad(history, newSet).trigger).toBe(false);
  });

  it('uses last in history (NU first) pentru interval check', () => {
    const history: SetSample[] = [
      { kg: 20, reps: 10, timestamp: T0 },
      { kg: 20, reps: 10, timestamp: T0 + 90_000 }, // 90s rest OK
    ];
    const newSet: SetSample = { kg: 20, reps: 10, timestamp: T0 + 100_000 }; // 10s after LAST
    expect(detectAggressiveLoad(history, newSet)).toEqual({
      trigger: true,
      reason: 'fast_sets',
    });
  });

  // LOW-CODE-08 — edge case timestamp=0 guard (Maria 65 fresh install +
  // legacy data fallback h.timestamp ?? 0 + test fixtures default).
  it('NU trigger fast_sets cand last.timestamp=0 (no real baseline)', () => {
    const history: SetSample[] = [{ kg: 20, reps: 10, timestamp: 0 }];
    const newSet: SetSample = { kg: 20, reps: 10, timestamp: T0 };
    // Without guard: T0 - 0 = T0 >> 30s → no false negative.
    // With guard: explicit skip cand last.timestamp=0 (no baseline available).
    expect(detectAggressiveLoad(history, newSet).reason).not.toBe('fast_sets');
  });

  it('NU trigger fast_sets cand both timestamps=0 (test fixture defaults)', () => {
    const history: SetSample[] = [{ kg: 20, reps: 10, timestamp: 0 }];
    const newSet: SetSample = { kg: 20, reps: 10, timestamp: 0 };
    // Without guard: 0 - 0 = 0 < 30s → FALSE POSITIVE trigger.
    // With guard: skip — neither set has real timestamp.
    expect(detectAggressiveLoad(history, newSet).trigger).toBe(false);
  });

  it('NU trigger fast_sets cand newSet.timestamp=0 (clock unset)', () => {
    const history: SetSample[] = [{ kg: 20, reps: 10, timestamp: T0 }];
    const newSet: SetSample = { kg: 20, reps: 10, timestamp: 0 };
    // Without guard: 0 - T0 = negative << 30s → FALSE POSITIVE trigger.
    // With guard: skip — newSet timestamp invalid.
    expect(detectAggressiveLoad(history, newSet).trigger).toBe(false);
  });
});

describe('detectAggressiveLoad — kg_jump pattern', () => {
  it('detects > 20% kg increase', () => {
    const history: SetSample[] = [{ kg: 20, reps: 10, timestamp: T0 }];
    const newSet: SetSample = { kg: 25, reps: 10, timestamp: T0 + 90_000 }; // +25%
    expect(detectAggressiveLoad(history, newSet)).toEqual({
      trigger: true,
      reason: 'kg_jump',
    });
  });

  it('NU trigger cand exactly 20% (boundary > strict)', () => {
    const history: SetSample[] = [{ kg: 20, reps: 10, timestamp: T0 }];
    const newSet: SetSample = { kg: 24, reps: 10, timestamp: T0 + 90_000 }; // exactly +20%
    expect(detectAggressiveLoad(history, newSet).trigger).toBe(false);
  });

  it('NU trigger cand kg decrease', () => {
    const history: SetSample[] = [{ kg: 30, reps: 10, timestamp: T0 }];
    const newSet: SetSample = { kg: 25, reps: 10, timestamp: T0 + 90_000 };
    expect(detectAggressiveLoad(history, newSet).trigger).toBe(false);
  });

  it('NU divide by zero cand last.kg=0', () => {
    const history: SetSample[] = [{ kg: 0, reps: 10, timestamp: T0 }];
    const newSet: SetSample = { kg: 10, reps: 10, timestamp: T0 + 90_000 };
    expect(detectAggressiveLoad(history, newSet).trigger).toBe(false);
  });
});

describe('detectAggressiveLoad — rep_spike pattern', () => {
  it('detects > 50% rep increase', () => {
    const history: SetSample[] = [{ kg: 20, reps: 8, timestamp: T0 }];
    const newSet: SetSample = { kg: 20, reps: 15, timestamp: T0 + 90_000 }; // +87.5%
    expect(detectAggressiveLoad(history, newSet)).toEqual({
      trigger: true,
      reason: 'rep_spike',
    });
  });

  it('NU trigger cand exactly 50% (boundary > strict)', () => {
    const history: SetSample[] = [{ kg: 20, reps: 8, timestamp: T0 }];
    const newSet: SetSample = { kg: 20, reps: 12, timestamp: T0 + 90_000 }; // exactly +50%
    expect(detectAggressiveLoad(history, newSet).trigger).toBe(false);
  });

  it('NU divide by zero cand last.reps=0', () => {
    const history: SetSample[] = [{ kg: 20, reps: 0, timestamp: T0 }];
    const newSet: SetSample = { kg: 20, reps: 10, timestamp: T0 + 90_000 };
    expect(detectAggressiveLoad(history, newSet).trigger).toBe(false);
  });
});

describe('detectAggressiveLoad — priority order (fast_sets > kg_jump > rep_spike)', () => {
  it('fast_sets wins over kg_jump cand both triggered', () => {
    const history: SetSample[] = [{ kg: 20, reps: 10, timestamp: T0 }];
    const newSet: SetSample = { kg: 30, reps: 10, timestamp: T0 + 10_000 }; // 10s rest + 50% kg
    expect(detectAggressiveLoad(history, newSet).reason).toBe('fast_sets');
  });

  it('kg_jump wins over rep_spike cand both triggered safe interval', () => {
    const history: SetSample[] = [{ kg: 20, reps: 8, timestamp: T0 }];
    const newSet: SetSample = { kg: 30, reps: 15, timestamp: T0 + 90_000 }; // safe interval + 50% kg + 87% reps
    expect(detectAggressiveLoad(history, newSet).reason).toBe('kg_jump');
  });
});

describe('deriveThresholds — task_09 Vitality/Adherence dynamic', () => {
  it('returns DEFAULT_THRESHOLDS when no opts', () => {
    const t = deriveThresholds();
    expect(t.kgJumpThreshold).toBe(DEFAULT_THRESHOLDS.kgJumpThreshold);
    expect(t.repSpikeThreshold).toBe(DEFAULT_THRESHOLDS.repSpikeThreshold);
  });

  it('high vitality + adherence → laxer thresholds', () => {
    const t = deriveThresholds({ vitalityScore: 90, adherenceScore: 90 });
    expect(t.kgJumpThreshold).toBeGreaterThan(DEFAULT_THRESHOLDS.kgJumpThreshold);
    expect(t.repSpikeThreshold).toBeGreaterThan(DEFAULT_THRESHOLDS.repSpikeThreshold);
  });

  it('low vitality + adherence → stricter thresholds', () => {
    const t = deriveThresholds({ vitalityScore: 10, adherenceScore: 10 });
    expect(t.kgJumpThreshold).toBeLessThan(DEFAULT_THRESHOLDS.kgJumpThreshold);
    expect(t.repSpikeThreshold).toBeLessThan(DEFAULT_THRESHOLDS.repSpikeThreshold);
  });

  it('thresholds clamped in safe range [0.15, 0.25] kg + [0.40, 0.60] reps', () => {
    const t = deriveThresholds({ vitalityScore: 100, adherenceScore: 100 });
    expect(t.kgJumpThreshold).toBeLessThanOrEqual(0.25);
    expect(t.repSpikeThreshold).toBeLessThanOrEqual(0.60);
    const t2 = deriveThresholds({ vitalityScore: 0, adherenceScore: 0 });
    expect(t2.kgJumpThreshold).toBeGreaterThanOrEqual(0.15);
    expect(t2.repSpikeThreshold).toBeGreaterThanOrEqual(0.40);
  });

  it('detectAggressiveLoad respects custom thresholds', () => {
    const history: SetSample[] = [{ kg: 20, reps: 10, timestamp: 0 }];
    const newSet: SetSample = { kg: 24, reps: 10, timestamp: 60_000 }; // +20%
    // Default 20% strict: NU trigger
    expect(detectAggressiveLoad(history, newSet).trigger).toBe(false);
    // Stricter 15%: trigger
    expect(
      detectAggressiveLoad(history, newSet, {
        fastSetsIntervalMs: 30_000,
        kgJumpThreshold: 0.15,
        repSpikeThreshold: 0.50,
      }).trigger,
    ).toBe(true);
  });
});
