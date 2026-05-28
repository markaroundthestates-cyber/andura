// ══ ANDURA PULSE — mock data, shaped on the real store outputs ═════════════
// Shapes kept identical to engineWrappers / workoutStore / progresStore /
// nutritionStore so porting back into React is just a source swap.

window.AnduraData = (function () {
  // ReadinessOutput { score, label, key, color, canPR }
  const readiness = { score: 82, label: 'Good shape', key: 'GOOD', color: 'var(--aqua)', canPR: true };

  // FatigueOutput { score, label, key }
  const fatigue = { score: 34, label: 'On track', key: 'ON_TRACK' };

  const streak = 12;

  // PlannedWorkoutOutput
  const plannedWorkout = {
    workoutTitle: 'Push — chest, shoulders, triceps',
    estimatedDuration: 52,
    exerciseCount: 5,
    intensityMod: 'plus', // plus | normal | minus
    volumeKg: 4820,
    coachQuote: 'Chest has recovered since Tuesday — let\u2019s make it clean.',
    laggingSignal: 'Right shoulder fell behind. Today we catch it up.',
    warmupMin: 6,
    exercises: [
      { id: 'bench', name: 'Barbell Bench Press', muscle: 'Chest', sets: 4, targetReps: 8, targetKg: 80, restSec: 120, why: 'Heavy compound for the chest — the base of your pressing strength.', cue: 'Shoulder blades pinned, bar to mid-chest, drive through the floor.', alt: 'Incline Dumbbell Press' },
      { id: 'incline-db', name: 'Incline Dumbbell Press', muscle: 'Upper chest', sets: 3, targetReps: 10, targetKg: 30, restSec: 90, why: 'Hits the upper chest, your weaker area right now.', cue: 'Elbows around 45°, control the lower half, no bouncing off the chest.', alt: 'Machine Chest Press' },
      { id: 'ohp', name: 'Seated Overhead Press', muscle: 'Shoulders', sets: 3, targetReps: 8, targetKg: 45, restSec: 100, why: 'Shoulder strength — straight at the lagging delt.', cue: 'Brace your core, press just in front of your forehead, full lockout.', alt: 'Dumbbell Shoulder Press' },
      { id: 'lateral', name: 'Lateral Raises', muscle: 'Shoulders', sets: 3, targetReps: 14, targetKg: 12, restSec: 60, why: 'Shoulder width, isolation volume.', cue: 'Lead with the elbows, stop at shoulder height, no swinging.', alt: 'Cable Lateral Raise' },
      { id: 'triceps', name: 'Cable Triceps Extensions', muscle: 'Triceps', sets: 3, targetReps: 12, targetKg: 25, restSec: 60, why: 'Closes the pressing session with triceps.', cue: 'Pin your elbows, full stretch at the top, hard squeeze at the bottom.', alt: 'Overhead Rope Extension' },
    ],
  };

  // weight — recent points { day, kg }
  const weightLog = [
    { day: 'W1', kg: 84.2 }, { day: 'W2', kg: 83.8 }, { day: 'W3', kg: 83.9 },
    { day: 'W4', kg: 83.3 }, { day: 'W5', kg: 82.9 }, { day: 'W6', kg: 82.6 },
    { day: 'W7', kg: 82.1 }, { day: 'now', kg: 81.7 },
  ];

  // nutrition — bayesian real target (NOT 2640 flat)
  const nutrition = {
    kcalTarget: 2480, proteinTarget: 176, bmr: 1820, tdee: 2730,
    phase: 'CUT', // CUT | BULK | MAINTAIN | RECOMP
    deltaKcal: -250,
    bodyFat: 16.4, bfMethod: 'US-Navy',
    projection: 'In ~4 weeks: 80.2 kg · ~14.8% body fat if you hold the pace.',
  };

  // muscle recovery Big-11 { name, pct } pct = recovered
  const recovery = [
    { name: 'Chest', pct: 88 }, { name: 'Back', pct: 95 }, { name: 'Shoulders', pct: 62 },
    { name: 'Biceps', pct: 100 }, { name: 'Triceps', pct: 74 }, { name: 'Quads', pct: 40 },
    { name: 'Hamstrings', pct: 55 }, { name: 'Glutes', pct: 48 }, { name: 'Calves', pct: 90 },
    { name: 'Abs', pct: 100 }, { name: 'Forearms', pct: 82 },
  ];

  // history sessions { title, date, durationMin, volumeKg, sets, exercises, rating, prHit }
  const history = [
    { title: 'Pull — back & biceps', date: 'Yesterday · 18:24', durationMin: 58, volumeKg: 5210, sets: 16, exercises: 5, rating: 'right', prHit: true },
    { title: 'Legs', date: 'Tuesday · 19:02', durationMin: 64, volumeKg: 6840, sets: 18, exercises: 5, rating: 'hard', prHit: false },
    { title: 'Push — chest & shoulders', date: 'Sunday · 11:10', durationMin: 49, volumeKg: 4610, sets: 15, exercises: 5, rating: 'right', prHit: true },
    { title: 'Pull — back & biceps', date: 'Friday · 18:40', durationMin: 55, volumeKg: 4980, sets: 16, exercises: 5, rating: 'easy', prHit: false },
    { title: 'Legs', date: 'Wednesday · 18:15', durationMin: 61, volumeKg: 6520, sets: 17, exercises: 5, rating: 'right', prHit: false },
  ];

  // muscle groups from a session (for summary) { label, sets }
  const sessionMuscles = [
    { label: 'Chest', sets: 7 }, { label: 'Shoulders', sets: 6 }, { label: 'Triceps', sets: 3 },
  ];

  // onboarding options
  const goals = [
    { id: 'auto', label: 'Auto', sub: 'Coach picks for you, adapts over time', badge: 'recommended' },
    { id: 'strength', label: 'Strength', sub: 'Heavy weights, fewer reps' },
    { id: 'muscle', label: 'Build muscle', sub: 'Visibly grow your muscle' },
    { id: 'cut', label: 'Lose fat', sub: 'Drop fat, keep muscle' },
    { id: 'maintain', label: 'Maintain', sub: 'Keep your current shape' },
  ];
  const levels = [
    { id: 'beginner', label: 'Beginner', sub: 'Under 1 year in the gym' },
    { id: 'intermediate', label: 'Intermediate', sub: '1–3 years, solid technique' },
    { id: 'advanced', label: 'Advanced', sub: '3+ years, you know your stuff' },
  ];

  // energy check
  const energy = [
    { level: 'excellent', label: 'Excellent', hint: 'Coach raises intensity +15%', color: 'var(--volt)', readiness: 5 },
    { level: 'good', label: 'Good', hint: 'Solid energy, full session', color: 'var(--aqua)', readiness: 4 },
    { level: 'normal', label: 'Normal', hint: 'Standard session, baseline', color: '#e8c84d', readiness: 3 },
    { level: 'low', label: 'Low', hint: 'Coach trims the volume a bit', color: 'var(--ember)', readiness: 2 },
    { level: 'tired', label: 'Tired', hint: 'Coach lightens the session now', color: '#ff5d6c', readiness: 1 },
  ];

  function todayHeader() {
    const wd = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${wd[d.getDay()]}, ${mo[d.getMonth()]} ${d.getDate()} · ${hh}:${mm}`;
  }

  return {
    readiness, fatigue, streak, plannedWorkout,
    weightLog, nutrition, recovery, history, sessionMuscles,
    goals, levels, energy, todayHeader,
  };
})();
