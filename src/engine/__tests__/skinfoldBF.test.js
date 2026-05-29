import { describe, it, expect } from 'vitest';
import { estimateBF_skinfold3 } from '../skinfoldBF.js';

describe('estimateBF_skinfold3 — Jackson-Pollock 3-site + Siri', () => {
  it('men: age 30, chest 12, abdomen 20, thigh 14 (sum 46) → ~13.9%', () => {
    // D = 1.10938 - 0.0008267*46 + 0.0000016*46^2 - 0.0002574*30 = 1.0670154
    // BF = 495/1.0670154 - 450 = 13.89 → 13.9
    const bf = estimateBF_skinfold3({
      sex: 'M',
      age: 30,
      chest_mm: 12,
      abdomen_mm: 20,
      thigh_mm: 14,
    });
    expect(bf).toBeCloseTo(13.9, 1);
  });

  it('women: age 30, triceps 18, suprailiac 14, thigh 24 (sum 56) → ~22.8%', () => {
    // D = 1.0994921 - 0.0009929*56 + 0.0000023*56^2 - 0.0001392*30 = 1.0469265
    // BF = 495/1.0469265 - 450 = 22.84 → 22.8
    const bf = estimateBF_skinfold3({
      sex: 'F',
      age: 30,
      triceps_mm: 18,
      suprailiac_mm: 14,
      thigh_mm: 24,
    });
    expect(bf).toBeCloseTo(22.8, 1);
  });

  it('uses MEN sites (chest/abdomen) — women sites ignored for male', () => {
    const bf = estimateBF_skinfold3({
      sex: 'M',
      age: 30,
      chest_mm: 12,
      abdomen_mm: 20,
      thigh_mm: 14,
      triceps_mm: 99, // out-of-band but irrelevant for men
      suprailiac_mm: 99,
    });
    expect(bf).toBeCloseTo(13.9, 1);
  });

  it('uses WOMEN sites (triceps/suprailiac) — men-only sites ignored for female', () => {
    const bf = estimateBF_skinfold3({
      sex: 'F',
      age: 30,
      triceps_mm: 18,
      suprailiac_mm: 14,
      thigh_mm: 24,
      chest_mm: 99, // out-of-band but irrelevant for women
      abdomen_mm: 99,
    });
    expect(bf).toBeCloseTo(22.8, 1);
  });

  it('returns null on missing age', () => {
    expect(
      estimateBF_skinfold3({ sex: 'M', chest_mm: 12, abdomen_mm: 20, thigh_mm: 14 })
    ).toBeNull();
  });

  it('returns null on missing a required site (men)', () => {
    expect(estimateBF_skinfold3({ sex: 'M', age: 30, chest_mm: 12, abdomen_mm: 20 })).toBeNull();
  });

  it('returns null on missing a required site (women)', () => {
    expect(
      estimateBF_skinfold3({ sex: 'F', age: 30, triceps_mm: 18, thigh_mm: 24 })
    ).toBeNull();
  });

  it('plausibility guard: site 0mm (caliper cannot read) → null', () => {
    expect(
      estimateBF_skinfold3({ sex: 'M', age: 30, chest_mm: 0, abdomen_mm: 20, thigh_mm: 14 })
    ).toBeNull();
  });

  it('plausibility guard: site 250mm (absurd / unit confusion) → null', () => {
    expect(
      estimateBF_skinfold3({ sex: 'M', age: 30, chest_mm: 250, abdomen_mm: 20, thigh_mm: 14 })
    ).toBeNull();
  });

  it('clamps result between 2 and 60', () => {
    const bf = estimateBF_skinfold3({
      sex: 'M',
      age: 60,
      chest_mm: 50,
      abdomen_mm: 50,
      thigh_mm: 50,
    });
    expect(bf).toBeLessThanOrEqual(60);
    expect(bf).toBeGreaterThanOrEqual(2);
  });

  it('returns null on empty args', () => {
    expect(estimateBF_skinfold3()).toBeNull();
    expect(estimateBF_skinfold3({})).toBeNull();
  });
});
