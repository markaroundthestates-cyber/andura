// ══ PERSONA MATRIX (#70) — 26 persona param-sets ══════════════════════════
// The PERSONA-MATRIX ACCEPTANCE GATE: prove Andura programs like a competent
// coach across a spread of personas with the intelligence flags FORCED ON. This
// is a READ-ONLY validation harness — it forces the path-A + dp_*_v1 flags via
// the SAME localStorage._devFlags override the full-path-sim uses, NO engine
// change, NO real flag-default flip (that is a separate human-gated step).
//
// Each persona maps the high-level profile (age/sex/weight/goal/focus/days/
// experience/constraint) onto the REAL inputs the compose path consumes:
//   - onboarding store data (age, sex, goal, frequency, experience, weight,
//     height, focusPreset, focusPresetPickedAt, targetWeight, targetDate)
//   - sessionTimeBudgetMin (workoutStore) for a time-capped session
//   - pain-cdl DB entries for an injury/medical constraint (deriveInjurySignal
//     → meta.painButtonActive + painAffectedGroups → selection deprioritize)
//
// goal/focusPreset enums are exact (onboardingStore.ts): Goal = auto|forta|masa|
// slabire|mentenanta ; FocusPreset = balanced|v-taper|arms|chest|shoulders|back|
// lower|upper ; Frequency = '2'..'5' (the schedule caps freq at 5 active days —
// 6/7-day asks are mapped to '5' + flagged as the engine's sustainable reframe).

const MS_DAY = 86400000;

// canonical RO muscle-group key → readable label (getExerciseMetadata key space)
export const GROUP_LABEL = {
  spate: 'back/lats', umeri: 'shoulders (lat+rear delt)', piept: 'chest',
  biceps: 'biceps', triceps: 'triceps', core: 'core',
  'picioare-quads': 'quads', 'picioare-hamstrings': 'hams', fese: 'glutes',
  gambe: 'calves', antebrate: 'forearms',
};

// pain region (PAIN_REGION_GROUP_MAP) per constraint → injury cdl region id
export const PAIN_REGION = {
  knee: 'genunchi-drept',        // → picioare-quads + picioare-hamstrings
  lowerBack: 'lombar',           // → spate
  shoulder: 'umar-drept',        // → umeri
};

/**
 * Build a persona. `flagsOn` defaults to the full Andura-ON set (the gate runs
 * ON); the baseline OFF arm is run by the matrix for the gold-ref delta only.
 * `pain` = a region key from PAIN_REGION → seeds a recent pain-cdl entry.
 * `timeCapMin` → sessionTimeBudgetMin. `target`/`deadlineMonth` → goal-realism.
 */
function p(id, name, profile, data, extra = {}) {
  return { id, name, profile, data, ...extra };
}

// The intelligence flags the gate forces ON (path-A composition + load/realism).
// Mirrors fp-config PATH_A_FLAGS + the F3/F6 load+realism flags that touch the
// real compose/dp seam. dark-only flags (dip/auto_pivot) are excluded — no live
// caller in this path (honest per fp-config note).
export const ANDURA_ON_FLAGS = Object.freeze([
  // path-A composition
  'dp_emphasis_specialization_v1', 'dp_coherent_weekly_alloc_v1',
  'dp_learned_volume_v1', 'dp_weekly_recovery_alloc_v1', 'dp_stimulus_per_min_v1',
  // load / realism / safety (path-B + selection)
  'dp_e1rm_v1', 'dp_strength_kalman_v1', 'dp_ceiling_v1', 'dp_population_prior_v1',
  'dp_deficit_throttle_v1', 'dp_energy_volume_v1', 'dp_acwr_readiness_v1',
  'dp_pain_deprioritize_v1', 'dp_pain_memory_v1', 'dp_tendon_cap_v1',
  'dp_fatigue_curve_v1', 'dp_effective_reps_v1',
]);

export const COHORT_START = Date.UTC(2026, 0, 5); // Monday

// Profiles. data = onboarding fields. extra = { pain, timeCapMin, target,
// deadlineMonth, days (informational only — frequency caps at 5), expectReframe,
// expectBackSafe, note }.
export const PERSONAS = [
  p(0, 'Daniel', '41 M 108→90 cut, v-taper, 4d, advanced (GOLD-REF)',
    { age: 41, sex: 'm', goal: 'slabire', frequency: '4', experience: 'avansat', weight: 108, height: 183, focusPreset: 'v-taper', targetWeight: 90 },
    { goldRef: true }),
  p(1, 'Maria', '28 F 62kg lean-bulk glutes 4d intermediate',
    { age: 28, sex: 'f', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 62, height: 168, focusPreset: 'lower' }),
  p(2, 'Gigica', '52 M 95→82 lose, knees, balanced 3d returning-beginner',
    { age: 52, sex: 'm', goal: 'slabire', frequency: '3', experience: 'incepator', weight: 95, height: 178, focusPreset: 'balanced', targetWeight: 82 },
    { pain: 'knee', expectBackSafe: false }),
  p(3, 'Maria-65', '65 F 70kg maintenance/bone no-focus 2d beginner machines',
    { age: 65, sex: 'f', goal: 'mentenanta', frequency: '2', experience: 'incepator', weight: 70, height: 162, focusPreset: 'balanced' }),
  p(4, 'Andrei', '19 M 64kg hardgainer-mass chest 5d beginner-int',
    { age: 19, sex: 'm', goal: 'masa', frequency: '5', experience: 'incepator', weight: 64, height: 180, focusPreset: 'chest' }),
  p(5, 'Cristina', '34 F 72kg recomp arms 4d intermediate 45min-cap',
    { age: 34, sex: 'f', goal: 'mentenanta', frequency: '4', experience: 'intermediar', weight: 72, height: 170, focusPreset: 'arms' },
    { timeCapMin: 45 }),
  p(6, 'Marius', '27 M 88kg strength back 6d advanced',
    { age: 27, sex: 'm', goal: 'forta', frequency: '5', experience: 'avansat', weight: 88, height: 182, focusPreset: 'back' },
    { days: 6, note: 'asked 6d → engine caps frequency at 5' }),
  p(7, 'Gigel', '40 M 100→85 lose upper 1d',
    { age: 40, sex: 'm', goal: 'slabire', frequency: '2', experience: 'incepator', weight: 100, height: 176, focusPreset: 'upper', targetWeight: 85 },
    { days: 1, note: 'asked 1d → engine floor is 2d/week split' }),
  p(8, 'Vlad', '16 M 58kg mass+sport balanced 3d novice',
    { age: 16, sex: 'm', goal: 'masa', frequency: '3', experience: 'incepator', weight: 58, height: 172, focusPreset: 'balanced' }),
  p(9, 'Ioana', '31 F 68kg postpartum lose+core 3d',
    { age: 31, sex: 'f', goal: 'slabire', frequency: '3', experience: 'incepator', weight: 68, height: 166, focusPreset: 'balanced', targetWeight: 60 }),
  p(10, 'Bogdan', '45 M 110kg obese+HTN health+lose no-focus 3d total-beginner',
    { age: 45, sex: 'm', goal: 'slabire', frequency: '3', experience: 'incepator', weight: 110, height: 178, focusPreset: 'balanced', targetWeight: 90 }),
  p(11, 'Sorin', '38 M 78kg strength(powerlifting) 4d intermediate',
    { age: 38, sex: 'm', goal: 'forta', frequency: '4', experience: 'intermediar', weight: 78, height: 175, focusPreset: 'balanced' }),
  p(12, 'Elena', '42 F 60kg glutes+shoulders 5d advanced',
    { age: 42, sex: 'f', goal: 'masa', frequency: '5', experience: 'avansat', weight: 60, height: 165, focusPreset: 'lower' }),
  p(13, 'Radu', '29 M 82kg shoulder-impingement upper-painfree+mass balanced 4d',
    { age: 29, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 82, height: 180, focusPreset: 'balanced' },
    { pain: 'shoulder', expectBackSafe: false, expectShoulderSafe: true }),
  p(14, 'Gabriela', '24 F 55kg upper-only-refuses-legs aesthetics 3d intermediate',
    { age: 24, sex: 'f', goal: 'masa', frequency: '3', experience: 'intermediar', weight: 55, height: 164, focusPreset: 'upper' },
    { note: 'refuses legs → upper focus = leg-maintenance, not leg-zero' }),
  p(15, 'Mihai', '35 M 90kg home(DB+bench+pullup) mass+back 4d',
    { age: 35, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 90, height: 183, focusPreset: 'back', equipmentProfile: ['dumbbell', 'bodyweight'] },
    { expectEquipment: ['dumbbell', 'bodyweight'], note: 'home DB+bench+pullup → only DB/bodyweight lifts (#82)' }),
  p(16, 'Ana', '50 F 65kg perimenopause strength+bone balanced-lower 3d intermediate',
    { age: 50, sex: 'f', goal: 'forta', frequency: '3', experience: 'intermediar', weight: 65, height: 167, focusPreset: 'lower' }),
  p(17, 'Cosmin', '22 M 70kg skinny-fat-recomp arms+chest 4d beginner',
    { age: 22, sex: 'm', goal: 'mentenanta', frequency: '4', experience: 'incepator', weight: 70, height: 178, focusPreset: 'arms' }),
  p(18, 'Daniela', '27 F 75→65 aggressive-cut tone 6d intermediate',
    { age: 27, sex: 'f', goal: 'slabire', frequency: '5', experience: 'intermediar', weight: 75, height: 169, focusPreset: 'balanced', targetWeight: 65 },
    { days: 6, note: 'aggressive cut + 6d ask → engine caps 5 + reduces volume' }),
  p(19, 'Florin', '60 M 85kg detrained-former-lifter functional+mass 4d',
    { age: 60, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 85, height: 180, focusPreset: 'balanced' }),
  p(20, 'Tudor', '33 M 95kg advanced-BB contest-prep-8wk-cut weak(calves/rear-delt) 5d',
    { age: 33, sex: 'm', goal: 'slabire', frequency: '5', experience: 'avansat', weight: 95, height: 184, focusPreset: 'shoulders', targetWeight: 88 }),
  // unrealistic — expect goal-realism reframe (no literal impossible program)
  p(21, 'Catalin', '30 M 95kg +8kg-muscle+abs-in-12wk (UNREALISTIC) 4d',
    { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 95, height: 182, focusPreset: 'balanced', targetWeight: 103 },
    { deadlineWeeks: 12, expectReframe: true, note: '+8kg lean mass in 12wk is not realistic' }),
  p(22, 'Stefan', '23 M beginner wants-7d-hard (UNWISE) → sustainable reframe',
    { age: 23, sex: 'm', goal: 'masa', frequency: '5', experience: 'incepator', weight: 72, height: 178, focusPreset: 'balanced' },
    { days: 7, expectReframe: true, note: 'beginner asking 7d hard → engine caps 5 + beginner volume' }),
  p(23, 'Andreea', '35 F glutes+legs refuses-squat/deadlift 4d intermediate',
    { age: 35, sex: 'f', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 66, height: 168, focusPreset: 'lower', refusedPatterns: ['squat', 'deadlift'] },
    { expectNoRefused: ['squat', 'deadlift'], note: 'refuses squat/deadlift → glute/leg work via machines (#81 hard exclusion)' }),
  p(24, 'Ion', '58 M 92kg disc-herniation strength/health 2d → back-safe',
    { age: 58, sex: 'm', goal: 'forta', frequency: '2', experience: 'intermediar', weight: 92, height: 179, focusPreset: 'balanced' },
    { pain: 'lowerBack', expectBackSafe: true }),
  p(25, 'Larisa', '26 F 63kg vague-tone-up no-focus 3d beginner → sane default',
    { age: 26, sex: 'f', goal: 'mentenanta', frequency: '3', experience: 'incepator', weight: 63, height: 166, focusPreset: 'balanced' }),
];

export { MS_DAY };
