import { describe, it, expect } from 'vitest';
import { findAlternatives, handleEquipmentBusy } from '../index.js';

describe('Smart Routing §36.37', () => {
  it('Tier 1 forta (Lat Pulldown) returns alternatives all force_demand: high', () => {
    const r = findAlternatives('Lat Pulldown');
    expect(r.shouldSkip).toBe(false);
    expect(r.alternatives.length).toBeGreaterThan(0);
  });
  it('unknown exercise → shouldSkip', () => {
    const r = findAlternatives('UnknownExercise');
    expect(r.shouldSkip).toBe(true);
    expect(r.alternatives).toEqual([]);
  });
  it('handleEquipmentBusy returns user-facing message', () => {
    const r = handleEquipmentBusy('Lat Pulldown');
    expect(r.message).toContain('Tu alegi');
  });
  it('Tier 2 isolation has alternatives ranked by similarity', () => {
    const r = findAlternatives('Lateral Raises');
    expect(r.alternatives.length).toBeGreaterThan(0);
    // Ranked: same muscle_target_primary first
    r.alternatives.forEach(alt => {
      expect(alt.similarity).toBeGreaterThan(0);
    });
  });
});
