import { describe, it, expect } from 'vitest';
import {
  getBlockLengthWeeks,
  computeMacrocycleBlock,
  getBlockScaling,
  evaluateMariaAdvanceGate,
  effectiveBlockScaling,
} from '../macrocycle.js';
import { BLOCK_LENGTH_WEEKS, BLOCK_SCALING } from '../constants.js';

describe('getBlockLengthWeeks — §9.5 Cluster 4 block length variants', () => {
  it('Forța → 21 săpt (BUILD+PEAK+TRANSITION)', () => {
    expect(getBlockLengthWeeks('forta')).toBe(BLOCK_LENGTH_WEEKS.FORTA);
    expect(getBlockLengthWeeks('forta')).toBe(21);
  });
  it('non-Forța goals → 12 săpt BUILD-only default', () => {
    expect(getBlockLengthWeeks('hipertrofie')).toBe(12);
    expect(getBlockLengthWeeks('recompozitie')).toBe(12);
    expect(getBlockLengthWeeks('longevitate')).toBe(12);
    expect(getBlockLengthWeeks('sanatate')).toBe(12);
  });
});

describe('computeMacrocycleBlock — block/mesocycle/week resolution', () => {
  it('week 0 → block 1 / M1 / W1', () => {
    const block = computeMacrocycleBlock(0, 'hipertrofie');
    expect(block.blockIdx).toBe(1);
    expect(block.mesocycleIdx).toBe(1);
    expect(block.weekInMesocycle).toBe(1);
    expect(block.blockLengthWeeks).toBe(12);
  });

  it('week 4 → block 1 / M2 / W1 (advanced one mesocycle)', () => {
    const block = computeMacrocycleBlock(4, 'hipertrofie');
    expect(block.mesocycleIdx).toBe(2);
    expect(block.weekInMesocycle).toBe(1);
  });

  it('week 11 → block 1 / M3 / W4 (last week of 12-week block)', () => {
    const block = computeMacrocycleBlock(11, 'hipertrofie');
    expect(block.blockIdx).toBe(1);
    expect(block.mesocycleIdx).toBe(3);
    expect(block.weekInMesocycle).toBe(4);
  });

  it('week 12 → block 2 / M1 / W1 (block roll-over)', () => {
    const block = computeMacrocycleBlock(12, 'hipertrofie');
    expect(block.blockIdx).toBe(2);
    expect(block.mesocycleIdx).toBe(1);
    expect(block.weekInMesocycle).toBe(1);
  });

  it('Forța block length = 21', () => {
    const block = computeMacrocycleBlock(0, 'forta');
    expect(block.blockLengthWeeks).toBe(21);
  });

  it('defensive: negative weeks coerce to 0', () => {
    const block = computeMacrocycleBlock(-5, 'hipertrofie');
    expect(block.blockIdx).toBe(1);
    expect(block.weekInMesocycle).toBe(1);
  });

  it('defensive: non-numeric weeks coerce to 0', () => {
    expect(() => computeMacrocycleBlock('foo', 'hipertrofie')).not.toThrow();
    const block = computeMacrocycleBlock('foo', 'hipertrofie');
    expect(block.blockIdx).toBe(1);
  });
});

describe('getBlockScaling — §9.5 Cluster 4 M1 1.00 / M2 1.10 / M3 1.15', () => {
  it('M1 → 1.00 baseline', () => {
    expect(getBlockScaling(1)).toBe(BLOCK_SCALING[1]);
    expect(getBlockScaling(1)).toBe(1.00);
  });
  it('M2 → 1.10 (+10%)', () => {
    expect(getBlockScaling(2)).toBe(BLOCK_SCALING[2]);
    expect(getBlockScaling(2)).toBeCloseTo(1.10, 5);
  });
  it('M3 → 1.15 (+15%)', () => {
    expect(getBlockScaling(3)).toBe(BLOCK_SCALING[3]);
    expect(getBlockScaling(3)).toBeCloseTo(1.15, 5);
  });
  it('out-of-range coerces to M1 baseline (defensive)', () => {
    expect(getBlockScaling(0)).toBe(BLOCK_SCALING[1]);
    expect(getBlockScaling(4)).toBe(BLOCK_SCALING[1]);
    expect(getBlockScaling(null)).toBe(BLOCK_SCALING[1]);
  });
});

describe('evaluateMariaAdvanceGate — §9.5 Maria adaptive override', () => {
  it('non-Maria persona always allowed (gate Maria-specific)', () => {
    const result = evaluateMariaAdvanceGate({
      personaId: 'marius',
      profileTier: 'COLD_START',
      recentSessions: [{ injury: true, daysAgo: 5 }],
    });
    expect(result.allowed).toBe(true);
  });

  it('Maria + tier ≥ DEVELOPING + zero injury → allowed', () => {
    const result = evaluateMariaAdvanceGate({
      personaId: 'maria',
      profileTier: 'DEVELOPING',
      recentSessions: [],
    });
    expect(result.allowed).toBe(true);
    expect(result.signals).toContain('maria_advance_gate_open');
  });

  it('Maria + tier STABLE + zero injury → allowed', () => {
    const result = evaluateMariaAdvanceGate({
      personaId: 'maria',
      profileTier: 'STABLE',
      recentSessions: [],
    });
    expect(result.allowed).toBe(true);
  });

  it('Maria + tier OPTIMIZED + zero injury → allowed', () => {
    const result = evaluateMariaAdvanceGate({
      personaId: 'maria',
      profileTier: 'OPTIMIZED',
      recentSessions: [],
    });
    expect(result.allowed).toBe(true);
  });

  it('Maria + tier below DEVELOPING → blocked (signal tier)', () => {
    const result = evaluateMariaAdvanceGate({
      personaId: 'maria',
      profileTier: 'COLD_START',
      recentSessions: [],
    });
    expect(result.allowed).toBe(false);
    expect(result.signals).toContain('maria_advance_gate_blocked_tier');
  });

  it('Maria + missing profileTier → blocked (signal tier)', () => {
    const result = evaluateMariaAdvanceGate({
      personaId: 'maria',
      profileTier: null,
      recentSessions: [],
    });
    expect(result.allowed).toBe(false);
    expect(result.signals).toContain('maria_advance_gate_blocked_tier');
  });

  it('Maria + tier OK + injury within 6 săpt → blocked (signal injury)', () => {
    const result = evaluateMariaAdvanceGate({
      personaId: 'maria',
      profileTier: 'STABLE',
      recentSessions: [{ injury: true, daysAgo: 30 }],
    });
    expect(result.allowed).toBe(false);
    expect(result.signals).toContain('maria_advance_gate_blocked_injury');
  });

  it('Maria + tier OK + injury older than 6 săpt → allowed', () => {
    const result = evaluateMariaAdvanceGate({
      personaId: 'maria',
      profileTier: 'STABLE',
      recentSessions: [{ injury: true, daysAgo: 50 }],
    });
    expect(result.allowed).toBe(true);
  });

  it('Maria + tier OK + injury without timestamp → blocked (defensive)', () => {
    const result = evaluateMariaAdvanceGate({
      personaId: 'maria',
      profileTier: 'STABLE',
      recentSessions: [{ injury: true }],
    });
    expect(result.allowed).toBe(false);
    expect(result.signals).toContain('maria_advance_gate_blocked_injury');
  });
});

describe('effectiveBlockScaling — Maria gate clamps at M1 when blocked', () => {
  it('Maria blocked + M2 → scaling clamps at M1 1.00', () => {
    const result = effectiveBlockScaling({
      mesocycleIdx: 2,
      personaId: 'maria',
      profileTier: 'COLD_START',
      recentSessions: [],
    });
    expect(result.scaling).toBe(BLOCK_SCALING[1]);
    expect(result.scaling).toBe(1.00);
  });

  it('Maria blocked + M3 → scaling clamps at M1 1.00', () => {
    const result = effectiveBlockScaling({
      mesocycleIdx: 3,
      personaId: 'maria',
      profileTier: 'COLD_START',
      recentSessions: [],
    });
    expect(result.scaling).toBe(1.00);
  });

  it('Maria blocked + M1 → scaling is M1 anyway (no change)', () => {
    const result = effectiveBlockScaling({
      mesocycleIdx: 1,
      personaId: 'maria',
      profileTier: 'COLD_START',
      recentSessions: [],
    });
    expect(result.scaling).toBe(1.00);
  });

  it('Maria allowed + M2 → scaling 1.10', () => {
    const result = effectiveBlockScaling({
      mesocycleIdx: 2,
      personaId: 'maria',
      profileTier: 'STABLE',
      recentSessions: [],
    });
    expect(result.scaling).toBe(BLOCK_SCALING[2]);
    expect(result.scaling).toBeCloseTo(1.10, 5);
  });

  it('Marius M3 → scaling 1.15 regardless tier', () => {
    const result = effectiveBlockScaling({
      mesocycleIdx: 3,
      personaId: 'marius',
      profileTier: 'COLD_START',
      recentSessions: [],
    });
    expect(result.scaling).toBe(BLOCK_SCALING[3]);
  });

  it('gateSignals propagated', () => {
    const result = effectiveBlockScaling({
      mesocycleIdx: 2,
      personaId: 'maria',
      profileTier: 'COLD_START',
      recentSessions: [],
    });
    expect(result.gateSignals).toContain('maria_advance_gate_blocked_tier');
  });
});
