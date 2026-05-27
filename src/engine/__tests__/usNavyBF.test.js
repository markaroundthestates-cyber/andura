import { describe, it, expect } from 'vitest';
import { estimateBF_USNavy, projectWeightAtTargetBF } from '../usNavyBF.js';

describe('estimateBF_USNavy', () => {
  it('men: 180cm height, 38 neck, 85 waist → ~14-18% (typical average male)', () => {
    const bf = estimateBF_USNavy({ sex: 'M', height_cm: 180, neck_cm: 38, waist_cm: 85 });
    expect(bf).toBeGreaterThanOrEqual(12);
    expect(bf).toBeLessThanOrEqual(20);
  });

  it('women: 165cm, 32 neck, 70 waist, 95 hip → ~24-30% (typical female)', () => {
    const bf = estimateBF_USNavy({
      sex: 'F', height_cm: 165, neck_cm: 32, waist_cm: 70, hip_cm: 95
    });
    expect(bf).toBeGreaterThanOrEqual(22);
    expect(bf).toBeLessThanOrEqual(32);
  });

  it('returns null on missing required fields', () => {
    expect(estimateBF_USNavy({ sex: 'M', height_cm: 180 })).toBeNull();
    expect(estimateBF_USNavy({ sex: 'F', height_cm: 165, neck_cm: 32, waist_cm: 70 })).toBeNull(); // missing hip
    expect(estimateBF_USNavy({})).toBeNull();
  });

  it('returns null when waist ≤ neck (invalid log10 domain)', () => {
    expect(estimateBF_USNavy({ sex: 'M', height_cm: 180, neck_cm: 40, waist_cm: 40 })).toBeNull();
    expect(estimateBF_USNavy({ sex: 'M', height_cm: 180, neck_cm: 50, waist_cm: 40 })).toBeNull();
  });

  it('clamps result between 2 and 60', () => {
    const bf = estimateBF_USNavy({ sex: 'M', height_cm: 180, neck_cm: 30, waist_cm: 200 });
    expect(bf).toBeLessThanOrEqual(60);
  });

  // BUG #12a — plausibility guard: masuratori imposibile umflau estimarea.
  describe('plausibility guard (BUG #12a)', () => {
    it('neck 22cm (imposibil — sub orice gat uman) → null, NU 20.2%', () => {
      // 75/22/182 dadea 20.2% (umflat) pentru un profil de fapt slab (BMI 16.6).
      // Acum respins → consumer cade pe Deurenberg (care citeste corect "slab").
      const bf = estimateBF_USNavy({ sex: 'M', height_cm: 182, neck_cm: 22, waist_cm: 75 });
      expect(bf).toBeNull();
    });

    it('lean profile cu gat realist (34cm) → ~lean (NU umflat)', () => {
      // acelasi profil dar cu gat plauzibil → estimare slaba corecta.
      const bf = estimateBF_USNavy({ sex: 'M', height_cm: 182, neck_cm: 34, waist_cm: 75 });
      expect(bf).not.toBeNull();
      expect(bf).toBeLessThan(15);
    });

    it('neck peste banda (>60) → null', () => {
      expect(estimateBF_USNavy({ sex: 'M', height_cm: 180, neck_cm: 65, waist_cm: 90 })).toBeNull();
    });

    it('waist sub banda (<50) → null', () => {
      expect(estimateBF_USNavy({ sex: 'M', height_cm: 180, neck_cm: 38, waist_cm: 45 })).toBeNull();
    });

    it('height in afara benzii (sub 120 / peste 230) → null', () => {
      expect(estimateBF_USNavy({ sex: 'M', height_cm: 110, neck_cm: 38, waist_cm: 85 })).toBeNull();
      expect(estimateBF_USNavy({ sex: 'M', height_cm: 240, neck_cm: 38, waist_cm: 85 })).toBeNull();
    });

    it('female: hip in afara benzii → null', () => {
      expect(
        estimateBF_USNavy({ sex: 'F', height_cm: 165, neck_cm: 32, waist_cm: 70, hip_cm: 240 }),
      ).toBeNull();
    });

    it('profile plauzibil normal NU e afectat (regresie)', () => {
      // 85/38/180 (test existent) ramane valid in banda.
      const bf = estimateBF_USNavy({ sex: 'M', height_cm: 180, neck_cm: 38, waist_cm: 85 });
      expect(bf).not.toBeNull();
      expect(bf).toBeGreaterThanOrEqual(12);
      expect(bf).toBeLessThanOrEqual(20);
    });
  });
});

describe('projectWeightAtTargetBF', () => {
  it('80kg at 20% BF → target 12% BF projects ~73 kg', () => {
    const targetKg = projectWeightAtTargetBF({ currentKg: 80, currentBF: 20, targetBF: 12 });
    expect(targetKg).toBeGreaterThan(70);
    expect(targetKg).toBeLessThan(76);
  });

  it('returns null on invalid input', () => {
    expect(projectWeightAtTargetBF({})).toBeNull();
    expect(projectWeightAtTargetBF({ currentKg: 0, currentBF: 20, targetBF: 12 })).toBeNull();
    expect(projectWeightAtTargetBF({ currentKg: 80, currentBF: -5, targetBF: 12 })).toBeNull();
    expect(projectWeightAtTargetBF({ currentKg: 80, currentBF: 20, targetBF: 100 })).toBeNull();
  });

  it('targetBF higher than currentBF returns weight gain projection', () => {
    const targetKg = projectWeightAtTargetBF({ currentKg: 70, currentBF: 12, targetBF: 18 });
    expect(targetKg).toBeGreaterThan(70);
  });
});
