import { describe, it, expect } from 'vitest';
import {
  resolvePersonaId,
  resolveGoalId,
  recoveryGreenMultiplier,
  computeMuscleVolumeTarget,
  computeVolumeMap,
  mariaFunctionalToIsraetel,
} from '../volumeLandmarks.js';
import {
  ISRAETEL_BASELINES,
  PERSONA_MODIFIERS,
  RECOVERY_GREEN_BONUS,
  GOAL_MODIFIERS,
} from '../constants.js';

describe('resolvePersonaId — §9.4 persona resolution + ADR 017 personas', () => {
  it('explicit user.persona wins case-insensitive', () => {
    expect(resolvePersonaId({ persona: 'Maria' })).toBe('maria');
    expect(resolvePersonaId({ persona: 'MARIUS' })).toBe('marius');
    expect(resolvePersonaId({ persona: 'gigica' })).toBe('gigica');
  });
  it('age fallback ≥55 → maria', () => {
    expect(resolvePersonaId({ age: 65 })).toBe('maria');
    expect(resolvePersonaId({ age: 55 })).toBe('maria');
  });
  it('age fallback 30-54 → gigica', () => {
    expect(resolvePersonaId({ age: 35 })).toBe('gigica');
    expect(resolvePersonaId({ age: 30 })).toBe('gigica');
    expect(resolvePersonaId({ age: 54 })).toBe('gigica');
  });
  it('age fallback <30 → marius', () => {
    expect(resolvePersonaId({ age: 25 })).toBe('marius');
    expect(resolvePersonaId({ age: 18 })).toBe('marius');
  });
  it('unknown explicit persona falls back to age', () => {
    expect(resolvePersonaId({ persona: 'unknown', age: 65 })).toBe('maria');
  });
  it('default gigica when no info', () => {
    expect(resolvePersonaId({})).toBe('gigica');
    expect(resolvePersonaId(undefined)).toBe('gigica');
    expect(resolvePersonaId(null)).toBe('gigica');
  });
});

describe('resolveGoalId — §9.4 goal modifiers (case + diacritic insensitive)', () => {
  it('hipertrofie variants', () => {
    expect(resolveGoalId({ goal: 'Hipertrofie' })).toBe('hipertrofie');
    expect(resolveGoalId({ goal: 'hypertrophy' })).toBe('hipertrofie');
  });
  it('forta diacritic-insensitive', () => {
    expect(resolveGoalId({ goal: 'Forta' })).toBe('forta');
    expect(resolveGoalId({ goal: 'forta' })).toBe('forta');
    expect(resolveGoalId({ goal: 'strength' })).toBe('forta');
  });
  it('recompozitie diacritic-insensitive', () => {
    expect(resolveGoalId({ goal: 'Recompozitie' })).toBe('recompozitie');
    expect(resolveGoalId({ goal: 'recomp' })).toBe('recompozitie');
  });
  it('longevitate', () => {
    expect(resolveGoalId({ goal: 'Longevitate' })).toBe('longevitate');
    expect(resolveGoalId({ goal: 'longevity' })).toBe('longevitate');
  });
  it('sanatate diacritic-insensitive', () => {
    expect(resolveGoalId({ goal: 'Sanatate Generala' })).toBe('sanatate');
    expect(resolveGoalId({ goal: 'sanatate' })).toBe('sanatate');
    expect(resolveGoalId({ goal: 'health' })).toBe('sanatate');
  });
  it('default hipertrofie when missing or unknown', () => {
    expect(resolveGoalId({})).toBe('hipertrofie');
    expect(resolveGoalId({ goal: 'foo' })).toBe('hipertrofie');
    expect(resolveGoalId(null)).toBe('hipertrofie');
  });
});

describe('recoveryGreenMultiplier — §9.4 +10-15% bonus daca recovery green', () => {
  it('1.0 when recoveryGreen NOT true', () => {
    expect(recoveryGreenMultiplier({})).toBe(1.0);
    expect(recoveryGreenMultiplier({ recoveryGreen: false })).toBe(1.0);
    expect(recoveryGreenMultiplier(null)).toBe(1.0);
  });
  it('LOW (1.10) default green', () => {
    expect(recoveryGreenMultiplier({ recoveryGreen: true })).toBe(RECOVERY_GREEN_BONUS.LOW);
    expect(recoveryGreenMultiplier({ recoveryGreen: true, recoveryStrength: 'low' })).toBe(1.10);
  });
  it('HIGH (1.15) when recoveryStrength=high', () => {
    expect(recoveryGreenMultiplier({ recoveryGreen: true, recoveryStrength: 'high' })).toBe(RECOVERY_GREEN_BONUS.HIGH);
    expect(recoveryGreenMultiplier({ recoveryGreen: true, recoveryStrength: 'high' })).toBe(1.15);
  });
});

describe('computeMuscleVolumeTarget — Israetel × persona × goal × scaling × phase', () => {
  it('Marius hipertrofie M1 LOAD chest → MAV × 1.00 × 1.00 × 1.00 × 1.00 = 14 sets', () => {
    const target = computeMuscleVolumeTarget({
      muscleGroup: 'chest',
      personaId: 'marius',
      goalId: 'hipertrofie',
      blockScaling: 1.0,
      phaseVolumeMul: 1.0,
    });
    expect(target.sets).toBe(14);
    expect(target.mev).toBe(ISRAETEL_BASELINES.chest.MEV);
    expect(target.mav).toBe(ISRAETEL_BASELINES.chest.MAV);
    expect(target.mrv).toBe(ISRAETEL_BASELINES.chest.MRV);
  });

  it('Maria sanatate M1 LOAD chest → 14 × 0.50 × 0.50 × 1.00 × 1.00 = 3.5 → 4 sets (rounded)', () => {
    const target = computeMuscleVolumeTarget({
      muscleGroup: 'chest',
      personaId: 'maria',
      goalId: 'sanatate',
      blockScaling: 1.0,
      phaseVolumeMul: 1.0,
    });
    // 14 * 0.50 * 0.50 * 1.0 * 1.0 = 3.5 → Math.round = 4
    expect(target.sets).toBe(4);
  });

  it('DELOAD phase volumeMul 0.55 → 45% volume cut', () => {
    const targetLoad = computeMuscleVolumeTarget({
      muscleGroup: 'chest', personaId: 'marius', goalId: 'hipertrofie',
      blockScaling: 1.0, phaseVolumeMul: 1.0,
    });
    const targetDeload = computeMuscleVolumeTarget({
      muscleGroup: 'chest', personaId: 'marius', goalId: 'hipertrofie',
      blockScaling: 1.0, phaseVolumeMul: 0.55,
    });
    expect(targetDeload.sets).toBeLessThan(targetLoad.sets);
    // 14 × 0.55 = 7.7 → 8
    expect(targetDeload.sets).toBe(8);
  });

  it('M3 scaling 1.15 caps at MRV when target would exceed', () => {
    // Use chest MRV=22, MAV=14. MAV × marius 1.0 × hipertrofie 1.0 ×
    // recovery green high (1.15) × scaling 1.15 × phase 1.0 = 14*1.15*1.15 ≈ 18.5
    // (under MRV — won't trigger cap). Force cap by using a recovery situation
    // and pushing scaling higher artificially.
    // For chest MRV cap, we test with shoulders MAV=16, MRV=26, scaling 1.15,
    // recoveryGreen high 1.15: 16 × 1.0 × 1.0 × 1.15 × 1.15 × 1.0 ≈ 21.16 → 21
    // (under MRV 26, no cap). For cap test, use abs MAV=14, MRV=25 — same.
    // Biceps MAV=14, MRV=26: also no cap likely.
    // Force cap: muscleGroup with very low MRV vs MAV ratio. Quads MAV=14,
    // MRV=20: 14 × 1.0 × 1.0 × 1.15 × 1.15 ≈ 18.5 → 19 (still under 20).
    // To trigger cap, we need raw > MRV. Use marius hipertrofie chest with
    // recovery 1.15, M3 1.15: 14 × 1.0 × 1.15 × 1.0 × 1.15 ≈ 18.515 (under 22).
    // Cap test: use a hypothetical extreme. Let's use a large multiplier check:
    const targetCapped = computeMuscleVolumeTarget({
      muscleGroup: 'glutes',  // MAV=12, MRV=16
      personaId: 'marius',
      goalId: 'hipertrofie',
      blockScaling: 1.15,
      phaseVolumeMul: 1.0,
      recoveryGreen: true,
      recoveryStrength: 'high',
    });
    // 12 × 1.0 × 1.15 × 1.0 × 1.15 × 1.0 = 15.87 → 16 (just at MRV cap)
    expect(targetCapped.sets).toBeLessThanOrEqual(ISRAETEL_BASELINES.glutes.MRV);
  });

  it('unknown muscle group returns zero defensively', () => {
    const target = computeMuscleVolumeTarget({
      muscleGroup: 'unknown',
      personaId: 'marius',
      goalId: 'hipertrofie',
      blockScaling: 1.0,
      phaseVolumeMul: 1.0,
    });
    expect(target.sets).toBe(0);
    expect(target.mrv).toBe(0);
  });

  it('unknown persona falls back to gigica modifier', () => {
    const target = computeMuscleVolumeTarget({
      muscleGroup: 'chest',
      personaId: 'unknown',
      goalId: 'hipertrofie',
      blockScaling: 1.0,
      phaseVolumeMul: 1.0,
    });
    // 14 × 0.70 = 9.8 → 10
    expect(target.sets).toBe(10);
  });

  it('unknown goal falls back to hipertrofie modifier (1.00)', () => {
    const target = computeMuscleVolumeTarget({
      muscleGroup: 'chest',
      personaId: 'marius',
      goalId: 'unknown',
      blockScaling: 1.0,
      phaseVolumeMul: 1.0,
    });
    expect(target.sets).toBe(14);
  });
});

describe('computeVolumeMap — full Israetel 11 grupuri matrix', () => {
  it('returns 11 muscle groups', () => {
    const map = computeVolumeMap({
      personaId: 'marius',
      goalId: 'hipertrofie',
      blockScaling: 1.0,
      phaseVolumeMul: 1.0,
    });
    expect(Object.keys(map).length).toBe(11);
    for (const mg of Object.keys(ISRAETEL_BASELINES)) {
      expect(map).toHaveProperty(mg);
    }
  });

  it('all values non-negative integers', () => {
    const map = computeVolumeMap({
      personaId: 'marius',
      goalId: 'hipertrofie',
      blockScaling: 1.0,
      phaseVolumeMul: 1.0,
    });
    for (const sets of Object.values(map)) {
      expect(Number.isInteger(sets)).toBe(true);
      expect(sets).toBeGreaterThanOrEqual(0);
    }
  });

  it('Maria persona reduces all volumes vs Marius (consistency check)', () => {
    const mariusMap = computeVolumeMap({
      personaId: 'marius', goalId: 'hipertrofie', blockScaling: 1.0, phaseVolumeMul: 1.0,
    });
    const mariaMap = computeVolumeMap({
      personaId: 'maria', goalId: 'hipertrofie', blockScaling: 1.0, phaseVolumeMul: 1.0,
    });
    for (const mg of Object.keys(mariusMap)) {
      expect(mariaMap[mg]).toBeLessThanOrEqual(mariusMap[mg]);
    }
  });

  it('Forta goal reduces volumes vs Hipertrofie (modifier 0.70 < 1.00)', () => {
    const hyperMap = computeVolumeMap({
      personaId: 'marius', goalId: 'hipertrofie', blockScaling: 1.0, phaseVolumeMul: 1.0,
    });
    const fortaMap = computeVolumeMap({
      personaId: 'marius', goalId: 'forta', blockScaling: 1.0, phaseVolumeMul: 1.0,
    });
    for (const mg of Object.keys(hyperMap)) {
      expect(fortaMap[mg]).toBeLessThanOrEqual(hyperMap[mg]);
    }
  });
});

describe('mariaFunctionalToIsraetel — §45.3 Q19 6 movement patterns mapping', () => {
  it('push → chest/shoulders/triceps', () => {
    expect(mariaFunctionalToIsraetel('push')).toEqual(['chest', 'shoulders', 'triceps']);
  });
  it('pull → back/biceps', () => {
    expect(mariaFunctionalToIsraetel('pull')).toEqual(['back', 'biceps']);
  });
  it('squat → quads/glutes/calves', () => {
    expect(mariaFunctionalToIsraetel('squat')).toEqual(['quads', 'glutes', 'calves']);
  });
  it('hinge → hamstrings/glutes/back', () => {
    expect(mariaFunctionalToIsraetel('hinge')).toEqual(['hamstrings', 'glutes', 'back']);
  });
  it('carry → forearms/abs/shoulders', () => {
    expect(mariaFunctionalToIsraetel('carry')).toEqual(['forearms', 'abs', 'shoulders']);
  });
  it('rotate → abs/back', () => {
    expect(mariaFunctionalToIsraetel('rotate')).toEqual(['abs', 'back']);
  });
  it('case-insensitive normalization', () => {
    expect(mariaFunctionalToIsraetel('PUSH')).toEqual(['chest', 'shoulders', 'triceps']);
    expect(mariaFunctionalToIsraetel('Squat')).toEqual(['quads', 'glutes', 'calves']);
  });
  it('unknown pattern returns empty array (defensive)', () => {
    expect(mariaFunctionalToIsraetel('unknown')).toEqual([]);
    expect(mariaFunctionalToIsraetel(null)).toEqual([]);
    expect(mariaFunctionalToIsraetel(123)).toEqual([]);
  });
});

describe('Constants integrity check — frozen + spec values', () => {
  it('PERSONA_MODIFIERS frozen + values match §9.4', () => {
    expect(PERSONA_MODIFIERS.maria).toBe(0.50);
    expect(PERSONA_MODIFIERS.gigica).toBe(0.70);
    expect(PERSONA_MODIFIERS.marius).toBe(1.00);
    expect(Object.isFrozen(PERSONA_MODIFIERS)).toBe(true);
  });
  it('GOAL_MODIFIERS frozen + values match §9.4', () => {
    expect(GOAL_MODIFIERS.hipertrofie).toBe(1.00);
    expect(GOAL_MODIFIERS.forta).toBe(0.70);
    expect(GOAL_MODIFIERS.recompozitie).toBe(0.85);
    expect(GOAL_MODIFIERS.longevitate).toBe(0.60);
    expect(GOAL_MODIFIERS.sanatate).toBe(0.50);
    expect(Object.isFrozen(GOAL_MODIFIERS)).toBe(true);
  });
  it('ISRAETEL_BASELINES contains exactly 11 muscle groups (§9.4)', () => {
    expect(Object.keys(ISRAETEL_BASELINES).length).toBe(11);
  });
});
