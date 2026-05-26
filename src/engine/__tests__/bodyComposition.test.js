import { describe, it, expect } from 'vitest';
import { estimateBF_Deurenberg } from '../bodyComposition.js';

describe('estimateBF_Deurenberg', () => {
  it('80kg / 180cm / 30yo male → BMI 24.7 → ~20.3% (worked example)', () => {
    // BMI = 80 / 1.8^2 = 24.691
    // BF% = 1.20*24.691 + 0.23*30 - 10.8*1 - 5.4 = 29.629 + 6.9 - 16.2 = 20.33
    const bf = estimateBF_Deurenberg({ sex: 'm', weightKg: 80, heightCm: 180, ageYears: 30 });
    expect(bf).not.toBeNull();
    expect(bf).toBeCloseTo(20.3, 1);
  });

  it('female has higher bf than male same anthropometrics (sex factor)', () => {
    const m = estimateBF_Deurenberg({ sex: 'm', weightKg: 70, heightCm: 170, ageYears: 35 });
    const f = estimateBF_Deurenberg({ sex: 'f', weightKg: 70, heightCm: 170, ageYears: 35 });
    expect(f).toBeGreaterThan(m);
    expect(f - m).toBeCloseTo(10.8, 1); // exactly the sex factor delta
  });

  it('accepts "male"/"female" string variants', () => {
    expect(estimateBF_Deurenberg({ sex: 'male', weightKg: 80, heightCm: 180, ageYears: 30 }))
      .toBe(estimateBF_Deurenberg({ sex: 'm', weightKg: 80, heightCm: 180, ageYears: 30 }));
    expect(estimateBF_Deurenberg({ sex: 'female', weightKg: 70, heightCm: 170, ageYears: 35 }))
      .toBe(estimateBF_Deurenberg({ sex: 'f', weightKg: 70, heightCm: 170, ageYears: 35 }));
  });

  it('returns null on invalid / missing inputs', () => {
    expect(estimateBF_Deurenberg({})).toBeNull();
    expect(estimateBF_Deurenberg({ sex: 'm', weightKg: 80, heightCm: 180 })).toBeNull();
    expect(estimateBF_Deurenberg({ sex: 'm', weightKg: 0, heightCm: 180, ageYears: 30 })).toBeNull();
    expect(estimateBF_Deurenberg({ sex: 'm', weightKg: 80, heightCm: 0, ageYears: 30 })).toBeNull();
    expect(estimateBF_Deurenberg({ weightKg: 80, heightCm: 180, ageYears: 30 })).toBeNull();
    expect(estimateBF_Deurenberg({ sex: 'm', weightKg: NaN, heightCm: 180, ageYears: 30 })).toBeNull();
  });

  it('clamps to physiological band 2-60', () => {
    // Very high BMI + old → would exceed 60 unclamped.
    const high = estimateBF_Deurenberg({ sex: 'f', weightKg: 200, heightCm: 150, ageYears: 70 });
    expect(high).toBeLessThanOrEqual(60);
    expect(high).toBeGreaterThanOrEqual(2);
    // Very low BMI + young male → could go below 2 unclamped.
    const low = estimateBF_Deurenberg({ sex: 'm', weightKg: 50, heightCm: 195, ageYears: 18 });
    expect(low).toBeGreaterThanOrEqual(2);
  });

  it('is pure — same input same output', () => {
    const a = estimateBF_Deurenberg({ sex: 'm', weightKg: 85, heightCm: 178, ageYears: 42 });
    const b = estimateBF_Deurenberg({ sex: 'm', weightKg: 85, heightCm: 178, ageYears: 42 });
    expect(a).toBe(b);
  });
});
