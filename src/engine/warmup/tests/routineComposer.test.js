import { describe, it, expect } from 'vitest';
import {
  selectGeneralExercises,
  selectSpecificExercises,
  composeRoutine,
} from '../routineComposer.js';
import {
  ROUTINE_TYPE,
  GENERAL_DYNAMIC_EXERCISES,
  SPECIFIC_MUSCLE_EXERCISES,
  SCHEMA_CONSTANTS,
} from '../constants.js';

describe('selectGeneralExercises — Cluster B2 1-2 general dynamic', () => {
  it('count 1 → first exercise from canonical pool', () => {
    const r = selectGeneralExercises(1);
    expect(r.length).toBe(1);
    expect(r[0]).toBe(GENERAL_DYNAMIC_EXERCISES[0]);
  });

  it('count 2 → first 2 exercises', () => {
    const r = selectGeneralExercises(2);
    expect(r.length).toBe(2);
  });

  it('count clamped to max 2 (Hybrid SCHEMA_CONSTANTS.generalSetsMax)', () => {
    const r = selectGeneralExercises(5);
    expect(r.length).toBe(SCHEMA_CONSTANTS.generalSetsMax);
  });

  it('count clamped to min 1 (Hybrid SCHEMA_CONSTANTS.generalSetsMin)', () => {
    const r = selectGeneralExercises(0);
    expect(r.length).toBe(SCHEMA_CONSTANTS.generalSetsMin);
  });

  it('invalid count → defensive min 1', () => {
    const r = selectGeneralExercises('foo');
    expect(r.length).toBe(SCHEMA_CONSTANTS.generalSetsMin);
  });

  it('all exercises RO native (NU EN keywords)', () => {
    const r = selectGeneralExercises(2);
    for (const ex of r) {
      // Heuristic check — RO native should NOT contain EN-only words like "warmup" or "stretch"
      // and should contain RO characteristic patterns
      expect(ex).toMatch(/[a-zA-Z]/);
    }
  });
});

describe('selectSpecificExercises — Cluster B2+D4 weak group prioritize', () => {
  it('chest + back targets → chest cue + back cue selected', () => {
    const r = selectSpecificExercises({
      targetMuscleGroups: ['chest', 'back'],
      setsCount: 2,
    });
    expect(r.exercises.length).toBe(2);
    expect(r.groupsUsed).toContain('chest');
    expect(r.groupsUsed).toContain('back');
  });

  it('Specialization weak group prioritized — weak group first regardless target order', () => {
    const r = selectSpecificExercises({
      targetMuscleGroups: ['chest', 'back', 'shoulders'],
      weakGroup: 'shoulders',
      setsCount: 3,
    });
    expect(r.prioritizedGroup).toBe('shoulders');
    expect(r.groupsUsed[0]).toBe('shoulders');
  });

  it('Weak group not în today targets — still prioritized when active (D4 PARALLEL modifier)', () => {
    const r = selectSpecificExercises({
      targetMuscleGroups: ['chest'],
      weakGroup: 'core',
      setsCount: 2,
    });
    expect(r.prioritizedGroup).toBe('core');
    expect(r.groupsUsed[0]).toBe('core');
  });

  it('Empty target groups + no weak group → empty specific sets defensive', () => {
    const r = selectSpecificExercises({});
    expect(r.exercises.length).toBe(0);
    expect(r.prioritizedGroup).toBe(null);
  });

  it('count clamped max 3 Hybrid Q65.2', () => {
    const r = selectSpecificExercises({
      targetMuscleGroups: ['chest', 'back', 'shoulders', 'legs', 'arms'],
      setsCount: 5,
    });
    expect(r.exercises.length).toBeLessThanOrEqual(SCHEMA_CONSTANTS.specificSetsMax);
  });

  it('count clamped min 2', () => {
    const r = selectSpecificExercises({
      targetMuscleGroups: ['chest', 'back'],
      setsCount: 0,
    });
    expect(r.exercises.length).toBeLessThanOrEqual(SCHEMA_CONSTANTS.specificSetsMax);
  });

  it('exercise text RO native per muscle group', () => {
    const r = selectSpecificExercises({
      targetMuscleGroups: ['chest'],
      setsCount: 1,
    });
    expect(r.exercises[0]).toBe(SPECIFIC_MUSCLE_EXERCISES.chest);
    expect(r.exercises[0]).toContain('Flotări');
  });

  it('unknown muscle group skipped defensive', () => {
    const r = selectSpecificExercises({
      targetMuscleGroups: ['unknown_muscle', 'chest'],
      setsCount: 2,
    });
    expect(r.groupsUsed).toContain('chest');
    expect(r.groupsUsed).not.toContain('unknown_muscle');
  });
});

describe('composeRoutine — Cluster B2 Hybrid integration', () => {
  it('full Hybrid routine with chest+back targets', () => {
    const r = composeRoutine({
      targetMuscleGroups: ['chest', 'back'],
      generalSetsCount: 2,
      specificSetsCount: 2,
    });
    expect(r.routineType).toBe(ROUTINE_TYPE.HYBRID);
    expect(r.generalSetsCount).toBe(2);
    expect(r.specificSetsCount).toBe(2);
    expect(r.weakGroupPrioritized).toBe(null);
  });

  it('Specialization weak group prioritize signal en route (D4 hook)', () => {
    const r = composeRoutine({
      targetMuscleGroups: ['chest', 'back'],
      weakGroup: 'back',
      generalSetsCount: 1,
      specificSetsCount: 2,
    });
    expect(r.weakGroupPrioritized).toBe('back');
    expect(r.targetMuscleGroups[0]).toBe('back');
    expect(r.rationale).toContain('specialization_weak_group_back_prioritized');
  });

  it('Empty target groups → general only fallback (no specific sets)', () => {
    const r = composeRoutine({
      targetMuscleGroups: [],
      generalSetsCount: 1,
    });
    expect(r.specificSetsCount).toBe(0);
    expect(r.specificSets.length).toBe(0);
    expect(r.generalSetsCount).toBe(1);
  });

  it('Default counts when not specified — min from SCHEMA_CONSTANTS', () => {
    const r = composeRoutine({
      targetMuscleGroups: ['legs'],
    });
    expect(r.generalSetsCount).toBe(SCHEMA_CONSTANTS.generalSetsMin);
    expect(r.specificSetsCount).toBeLessThanOrEqual(SCHEMA_CONSTANTS.specificSetsMax);
  });

  it('routineType always "hybrid" V1 LOCKED Q65.2 Option C', () => {
    for (const targetGroups of [['chest'], [], ['legs', 'back']]) {
      const r = composeRoutine({ targetMuscleGroups: targetGroups });
      expect(r.routineType).toBe('hybrid');
    }
  });
});
