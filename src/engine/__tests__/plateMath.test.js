// ══ Plate-math — barbell loading hint (Daniel-approved proposal 2026-06-10) ══
// Real barbell-ladder loads, hand-traced decompositions. The contract that
// matters most: NEVER an approximate hint — non-representable → null.
import { describe, it, expect } from 'vitest';
import { platesPerSide, BARBELL_BAR_KG, PLATE_DENOMS } from '../plateMath.js';

describe('platesPerSide — exact greedy decomposition', () => {
  it("70 kg (Daniel's real RDL) → bar 20 + 25/side", () => {
    expect(platesPerSide(70)).toEqual({ barKg: 20, perSide: [25] });
  });

  it('102.5 kg → 25+15+1.25 per side', () => {
    expect(platesPerSide(102.5)).toEqual({ barKg: 20, perSide: [25, 15, 1.25] });
  });

  it('60 kg → 20/side; 47.5 → 10+2.5+1.25/side', () => {
    expect(platesPerSide(60)).toEqual({ barKg: 20, perSide: [20] });
    expect(platesPerSide(47.5)).toEqual({ barKg: 20, perSide: [10, 2.5, 1.25] });
  });

  it('exactly the bar → empty perSide (UI: "doar bara")', () => {
    expect(platesPerSide(20)).toEqual({ barKg: 20, perSide: [] });
  });

  it('below the bar / non-finite → null (no hint)', () => {
    expect(platesPerSide(17.5)).toBeNull();
    expect(platesPerSide(0)).toBeNull();
    expect(platesPerSide(NaN)).toBeNull();
    expect(platesPerSide(undefined)).toBeNull();
  });

  it('NOT exactly representable → null, never approximate (71 → 25.5/side has no 0.5 plate)', () => {
    expect(platesPerSide(71)).toBeNull();
    expect(platesPerSide(70.5)).toBeNull(); // 25.25/side — off the 1.25 grid
    expect(platesPerSide(21)).toBeNull(); // 0.5/side — smaller than the smallest plate
  });

  it('heavy load uses repeated big plates (180 → 25+25+25+5)', () => {
    expect(platesPerSide(180)).toEqual({ barKg: 20, perSide: [25, 25, 25, 5] });
  });

  it('respects a custom bar weight (women bar 15: 60 → 15 + 22.5/side = 20+2.5)', () => {
    expect(platesPerSide(60, 15)).toEqual({ barKg: 15, perSide: [20, 2.5] });
  });

  it('constants are the standard gym set', () => {
    expect(BARBELL_BAR_KG).toBe(20);
    expect([...PLATE_DENOMS]).toEqual([25, 20, 15, 10, 5, 2.5, 1.25]);
  });
});
