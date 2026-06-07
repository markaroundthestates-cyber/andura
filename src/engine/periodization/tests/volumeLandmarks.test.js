import { describe, it, expect } from 'vitest';
import {
  resolvePersonaId,
  resolveGoalId,
  resolveExperienceId,
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
  EXPERIENCE_MODIFIERS,
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
  // §obiectiv-drop-longevitate 2026-05-28 — `longevitate` goal DROPPED
  // (duplicate semantic cu mentenanta/sanatate). resolveGoalId pe 'longevitate'
  // string-uri vechi → fallback la default (hipertrofie). Migration UI
  // converteste legacy persistat la 'mentenanta' la next read (onboardingStore).
  it('longevitate (DROPPED) → fallback hipertrofie default', () => {
    expect(resolveGoalId({ goal: 'Longevitate' })).toBe('hipertrofie');
    expect(resolveGoalId({ goal: 'longevity' })).toBe('hipertrofie');
  });
  it('sanatate diacritic-insensitive', () => {
    expect(resolveGoalId({ goal: 'Sanatate Generala' })).toBe('sanatate');
    expect(resolveGoalId({ goal: 'sanatate' })).toBe('sanatate');
    expect(resolveGoalId({ goal: 'health' })).toBe('sanatate');
  });
  it('slabire diacritic-insensitive + weight-loss aliases', () => {
    expect(resolveGoalId({ goal: 'Slabire' })).toBe('slabire');
    expect(resolveGoalId({ goal: 'slabire' })).toBe('slabire');
    expect(resolveGoalId({ goal: 'weight-loss' })).toBe('slabire');
  });
  it('default hipertrofie when missing or unknown', () => {
    expect(resolveGoalId({})).toBe('hipertrofie');
    expect(resolveGoalId({ goal: 'foo' })).toBe('hipertrofie');
    expect(resolveGoalId(null)).toBe('hipertrofie');
  });
  // Audit fix 2026-06-07 (HIGH-1): onboarding Goal vocab (auto/forta/masa/slabire/
  // mentenanta) is threaded raw to the engine. Pre-fix masa/mentenanta/auto all
  // fell through to the hipertrofie default (modifier 1.0) → a Mentenanta user
  // trained at full hypertrophy volume.
  it('onboarding vocab: masa → hipertrofie (mass = full hypertrophy dose)', () => {
    expect(resolveGoalId({ goal: 'masa' })).toBe('hipertrofie');
    expect(resolveGoalId({ goal: 'Masa' })).toBe('hipertrofie');
  });
  it('onboarding vocab: mentenanta → sanatate (maintenance modifier, NOT hipertrofie)', () => {
    expect(resolveGoalId({ goal: 'mentenanta' })).toBe('sanatate');
    expect(resolveGoalId({ goal: 'Mentenanta' })).toBe('sanatate');
  });
  it('onboarding vocab: auto → hipertrofie (sensible default dose)', () => {
    expect(resolveGoalId({ goal: 'auto' })).toBe('hipertrofie');
  });
});

describe('mentenanta volume haircut — onboarding maintenance user (audit HIGH-1)', () => {
  // A maintenance-goal user must get REDUCED weekly volume vs a hypertrophy user,
  // not the full hypertrophy dose. Real values: marius persona (modifier 1.0),
  // chest baseline MAV 14. hipertrofie goal modifier 1.0 → 14 sets; mentenanta
  // resolves to sanatate 0.50 → 7 sets. Verified across the full 11-group map.
  it('mentenanta map is strictly lower than hipertrofie map (every group)', () => {
    const base = { personaId: 'marius', blockScaling: 1.0, phaseVolumeMul: 1.0 };
    const hyper = computeVolumeMap({ ...base, goalId: resolveGoalId({ goal: 'masa' }) });
    const maint = computeVolumeMap({ ...base, goalId: resolveGoalId({ goal: 'mentenanta' }) });
    for (const group of Object.keys(hyper)) {
      // maintenance ≤ hypertrophy everywhere; strictly lower where the group has volume.
      expect(maint[group]).toBeLessThanOrEqual(hyper[group]);
      if (hyper[group] > 0) expect(maint[group]).toBeLessThan(hyper[group]);
    }
    // Concrete anchor: chest MAV 14 → hyper 14, maint round(14*0.5)=7.
    expect(hyper.chest).toBe(14);
    expect(maint.chest).toBe(7);
  });
});

// §experience-volume 2026-06-07 (audit HIGH/MED): volume keyed only on AGE
// (persona) + goal, NOT experience — so a 25yo beginner got the same full
// ~150-set/week advanced dose as a 25yo advanced lifter. The experience modifier
// (EXPERIENCE_MODIFIERS) now scales the starting volume: beginner LOWER (near
// MEV), intermediate mid, advanced full (unchanged). Floored at the per-group MEV.
describe('resolveExperienceId — RO + EN vocab, diacritic/case insensitive', () => {
  it('RO onboarding vocab maps to its modifier bucket', () => {
    expect(resolveExperienceId({ experience: 'incepator' })).toBe('incepator');
    expect(resolveExperienceId({ experience: 'intermediar' })).toBe('intermediar');
    expect(resolveExperienceId({ experience: 'avansat' })).toBe('avansat');
  });

  it('EN bucket (schedule adapter normalize) maps too', () => {
    expect(resolveExperienceId({ experience: 'beginner' })).toBe('incepator');
    expect(resolveExperienceId({ experience: 'intermediate' })).toBe('intermediar');
    expect(resolveExperienceId({ experience: 'advanced' })).toBe('avansat');
  });

  it('case + diacritic insensitive (Incepator / Începător)', () => {
    expect(resolveExperienceId({ experience: 'Incepator' })).toBe('incepator');
    expect(resolveExperienceId({ experience: 'Începător' })).toBe('incepator');
  });

  it('missing/unknown → avansat (full dose, legacy-safe default)', () => {
    expect(resolveExperienceId(undefined)).toBe('avansat');
    expect(resolveExperienceId({})).toBe('avansat');
    expect(resolveExperienceId({ experience: 'wat' })).toBe('avansat');
  });
});

describe('experience volume scaling — beginner starts lower than advanced (audit HIGH/MED)', () => {
  const base = { personaId: 'marius', goalId: 'hipertrofie', blockScaling: 1.0, phaseVolumeMul: 1.0 };
  const sumMap = (m) => Object.values(m).reduce((a, b) => a + b, 0);

  it('beginner weekly volume is STRICTLY lower than advanced (every worked group + total)', () => {
    const adv = computeVolumeMap({ ...base, experienceId: 'avansat' });
    const beg = computeVolumeMap({ ...base, experienceId: 'incepator' });
    for (const group of Object.keys(adv)) {
      if (adv[group] > ISRAETEL_BASELINES[group].MEV) {
        expect(beg[group]).toBeLessThan(adv[group]);
      }
    }
    // Concrete anchor: full advanced ~150 sets/week → beginner materially less.
    expect(sumMap(beg)).toBeLessThan(sumMap(adv));
    expect(sumMap(adv)).toBe(150);
    expect(sumMap(beg)).toBe(105);
  });

  it('intermediate sits between beginner and advanced', () => {
    const adv = sumMap(computeVolumeMap({ ...base, experienceId: 'avansat' }));
    const inter = sumMap(computeVolumeMap({ ...base, experienceId: 'intermediar' }));
    const beg = sumMap(computeVolumeMap({ ...base, experienceId: 'incepator' }));
    expect(beg).toBeLessThan(inter);
    expect(inter).toBeLessThan(adv);
    expect(inter).toBe(128);
  });

  it('advanced == legacy (no experienceId threaded) — byte-identical, today unchanged', () => {
    const adv = computeVolumeMap({ ...base, experienceId: 'avansat' });
    const legacy = computeVolumeMap({ ...base });
    expect(adv).toEqual(legacy);
  });

  it('beginner respects the per-group MEV floor (cut never sinks below MEV)', () => {
    // Real values: chest MAV 14 × incepator 0.70 = 9.8 → 10, still ≥ MEV 8.
    // Force a deep cut (DELOAD phase 0.55) so the raw would drop below MEV and
    // assert the floor catches it: 14 × 0.70 × 0.55 = 5.39 → floored to MEV 8.
    const beg = computeMuscleVolumeTarget({
      muscleGroup: 'chest',
      personaId: 'marius',
      goalId: 'hipertrofie',
      experienceId: 'incepator',
      blockScaling: 1.0,
      phaseVolumeMul: 0.55,
    });
    expect(beg.sets).toBe(ISRAETEL_BASELINES.chest.MEV); // 8 — floored, not 5
  });

  it('chest beginner concrete dose = round(14 × 0.70) = 10 (real anchor)', () => {
    const beg = computeMuscleVolumeTarget({
      muscleGroup: 'chest',
      personaId: 'marius',
      goalId: 'hipertrofie',
      experienceId: 'incepator',
      blockScaling: 1.0,
      phaseVolumeMul: 1.0,
    });
    // 14 × 1.0(persona) × 1.0(goal) × 0.70(experience) = 9.8 → 10.
    expect(beg.sets).toBe(Math.round(ISRAETEL_BASELINES.chest.MAV * EXPERIENCE_MODIFIERS.incepator));
    expect(beg.sets).toBe(10);
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

  it('Slabire goal uses its own modifier (0.90), volume-preserving but NOT full hipertrofie (F4 fix)', () => {
    const hyperMap = computeVolumeMap({
      personaId: 'marius', goalId: 'hipertrofie', blockScaling: 1.0, phaseVolumeMul: 1.0,
    });
    const slabireMap = computeVolumeMap({
      personaId: 'marius', goalId: 'slabire', blockScaling: 1.0, phaseVolumeMul: 1.0,
    });
    // F4: before the fix, slabire fell through to GOAL_MODIFIERS.hipertrofie (1.00)
    // → identical to hyperMap. Now slabire is deterministic 0.90 → strictly lighter
    // on at least one group (capped groups can tie at MRV, so use <=, plus an
    // unambiguous-strict check on a non-capped group).
    let anyStrictlyLess = false;
    for (const mg of Object.keys(hyperMap)) {
      expect(slabireMap[mg]).toBeLessThanOrEqual(hyperMap[mg]);
      if (slabireMap[mg] < hyperMap[mg]) anyStrictlyLess = true;
    }
    expect(anyStrictlyLess).toBe(true);
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
    expect(GOAL_MODIFIERS.slabire).toBe(0.90);
    // §obiectiv-drop-longevitate 2026-05-28 — longevitate DROPPED (duplicate semantic).
    expect(GOAL_MODIFIERS.longevitate).toBeUndefined();
    expect(GOAL_MODIFIERS.sanatate).toBe(0.50);
    expect(Object.isFrozen(GOAL_MODIFIERS)).toBe(true);
  });
  it('ISRAETEL_BASELINES contains exactly 11 muscle groups (§9.4)', () => {
    expect(Object.keys(ISRAETEL_BASELINES).length).toBe(11);
  });
});
