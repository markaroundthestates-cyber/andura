// ══ PLATEAU INTERVENTIONS — 20 intervenții anti-platou ════════════════════
// Fiecare intervenție are: id, label, efficacy (0-1), when (condiții),
// apply (funcție care modifică sesiunea).

export const INTERVENTIONS = [
  {
    id: 'drop_set',
    label: 'Drop Set',
    efficacy: 0.85,
    when: ctx => ctx.stagnationWeeks >= 4 && !ctx.isInCut,
    apply: exercise => ({ ...exercise, technique: 'drop', sets: (exercise.sets || 3) + 1 }),
  },
  {
    id: 'rest_pause',
    label: 'Rest-Pause',
    efficacy: 0.8,
    when: ctx => ctx.stagnationWeeks >= 4,
    apply: exercise => ({ ...exercise, technique: 'rest_pause', restSeconds: 15 }),
  },
  {
    id: 'partial_reps',
    label: 'Reps Parțiale',
    efficacy: 0.7,
    when: ctx => ctx.stagnationWeeks >= 3,
    apply: exercise => ({ ...exercise, technique: 'partial', repsTarget: (exercise.repsTarget || 8) + 4 }),
  },
  {
    id: 'tempo_slowdown',
    label: 'Tempo 3-1-3',
    efficacy: 0.75,
    when: ctx => ctx.stagnationWeeks >= 3,
    apply: exercise => ({ ...exercise, technique: 'tempo', tempo: '3-1-3' }),
  },
  {
    id: 'volume_increase_10pct',
    label: '+10% Volum',
    efficacy: 0.72,
    when: ctx => ctx.stagnationWeeks >= 4 && !ctx.isInCut,
    apply: exercise => ({ ...exercise, sets: Math.ceil((exercise.sets || 3) * 1.1) }),
  },
  {
    id: 'intensity_bump',
    label: 'Intensitate +2.5kg',
    efficacy: 0.68,
    when: ctx => ctx.stagnationWeeks >= 6 && ctx.readiness?.score >= 75,
    apply: exercise => {
      const rec = exercise.recommendation ?? {};
      const newKg = (rec.kg ?? rec.weight ?? 20) + 2.5;
      return { ...exercise, recommendation: { ...rec, kg: newKg, weight: newKg } };
    },
  },
  {
    id: 'exercise_swap',
    label: 'Schimb Exercițiu',
    efficacy: 0.78,
    when: ctx => ctx.stagnationWeeks >= 6,
    apply: exercise => ({ ...exercise, swapRecommended: true }),
  },
  {
    id: 'superset',
    label: 'Superset',
    efficacy: 0.73,
    when: ctx => ctx.stagnationWeeks >= 4 && !ctx.isInCut,
    apply: exercise => ({ ...exercise, technique: 'superset' }),
  },
  {
    id: 'pyramid_up',
    label: 'Piramidă Ascendentă',
    efficacy: 0.7,
    when: ctx => ctx.stagnationWeeks >= 4,
    apply: exercise => ({ ...exercise, technique: 'pyramid_up' }),
  },
  {
    id: 'pyramid_down',
    label: 'Piramidă Descendentă',
    efficacy: 0.69,
    when: ctx => ctx.stagnationWeeks >= 4,
    apply: exercise => ({ ...exercise, technique: 'pyramid_down' }),
  },
  {
    id: 'cluster_set',
    label: 'Cluster Set',
    efficacy: 0.82,
    when: ctx => ctx.stagnationWeeks >= 5,
    apply: exercise => ({ ...exercise, technique: 'cluster', restSeconds: 20 }),
  },
  {
    id: 'giant_set',
    label: 'Giant Set',
    efficacy: 0.74,
    when: ctx => ctx.stagnationWeeks >= 5 && !ctx.isInCut,
    apply: exercise => ({ ...exercise, technique: 'giant_set' }),
  },
  {
    id: 'deload_week',
    label: 'Săptămână Deload',
    efficacy: 0.9,
    when: ctx => ctx.stagnationWeeks >= 8,
    apply: exercise => ({
      ...exercise,
      recommendation: { ...(exercise.recommendation ?? {}), kg: Math.round(((exercise.recommendation?.kg ?? 20) * 0.7) * 2) / 2 },
      sets: 2,
      repsTarget: 12,
    }),
  },
  {
    id: 'unilateral_switch',
    label: 'Versiune Unilaterală',
    efficacy: 0.71,
    when: ctx => ctx.stagnationWeeks >= 5,
    apply: exercise => ({ ...exercise, unilateral: true }),
  },
  {
    id: 'forced_reps',
    label: 'Reps Forțate (cu spotter)',
    efficacy: 0.79,
    when: ctx => ctx.stagnationWeeks >= 6 && !ctx.isInCut,
    apply: exercise => ({ ...exercise, technique: 'forced_reps', requiresSpotter: true }),
  },
  {
    id: 'mechanical_drop',
    label: 'Mechanical Drop Set',
    efficacy: 0.76,
    when: ctx => ctx.stagnationWeeks >= 5,
    apply: exercise => ({ ...exercise, technique: 'mechanical_drop' }),
  },
  {
    id: 'frequency_increase',
    label: 'Frecvență +1/săptămână',
    efficacy: 0.77,
    when: ctx => ctx.stagnationWeeks >= 4 && (ctx.sessionFrequency ?? 3) <= 3,
    apply: exercise => ({ ...exercise, addFrequency: true }),
  },
  {
    id: 'mind_muscle',
    label: 'Focus Mind-Muscle',
    efficacy: 0.65,
    when: ctx => ctx.stagnationWeeks >= 3,
    apply: exercise => ({ ...exercise, technique: 'mind_muscle', tempo: '2-1-2' }),
  },
  {
    id: 'isometric_hold',
    label: 'Hold Izometric 3s',
    efficacy: 0.67,
    when: ctx => ctx.stagnationWeeks >= 3,
    apply: exercise => ({ ...exercise, technique: 'isometric', holdSeconds: 3 }),
  },
  {
    id: 'periodization_wave',
    label: 'Periodizare Wave (3-2-1)',
    efficacy: 0.88,
    when: ctx => ctx.stagnationWeeks >= 7,
    apply: exercise => ({ ...exercise, technique: 'wave_load' }),
  },
];

/**
 * Returnează intervențiile aplicabile în contextul dat, sortate după eficacitate.
 * @param {object} ctx - cu stagnationWeeks, isInCut, readiness, sessionFrequency
 * @returns {Array} intervențiile aplicabile sortate DESC efficacy
 */
export function getApplicableInterventions(ctx) {
  return INTERVENTIONS
    .filter(i => i.when(ctx))
    .sort((a, b) => b.efficacy - a.efficacy);
}

/**
 * Aplică cea mai eficientă intervenție la un exercițiu.
 * @param {object} exercise
 * @param {object} ctx
 * @returns {{ exercise: object, intervention: object|null }}
 */
export function applyBestIntervention(exercise, ctx) {
  const applicable = getApplicableInterventions(ctx);
  if (applicable.length === 0) return { exercise, intervention: null };
  const best = applicable[0];
  return { exercise: best.apply(exercise), intervention: best };
}
