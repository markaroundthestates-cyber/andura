// FAZA-4: not yet wired up — planned cold start session generation per ADR-009
// ══ COLD START GUIDELINES — Intelligent defaults for new users ═════════════
// Cold start does NOT mean silence. It means population-prior guidelines
// scaled by onboarding data (experience, goal, equipment).

const BASE_WEIGHTS = {
  'DB Shoulder Press': 10,
  'Incline DB Press': 15,
  'Pec Deck': 20,
  'Lateral Raises': 5,
  'Pushdown': 15,
  'Lat Pulldown': 30,
  'Cable Row': 30,
  'Face Pulls': 15,
  'Bayesian Curl': 8,
  'Incline DB Curl': 5,
  'Overhead Triceps': 15,
  'Rear Delt Fly': 15,
  'Cable Curl': 10,
  'Preacher Curl': 8,
  'Leg Press': 80,
  'Leg Extension': 30,
  'Leg Curl': 25,
};

const EXPERIENCE_MULTIPLIER = { beginner: 0.7, intermediate: 1.0, advanced: 1.3 };

/**
 * Population-prior start weight for an exercise scaled by experience.
 * Exported for the React scheduleAdapter cold-start path (new user, no
 * logged history) — keyed on the ENGLISH canonical exercise name + the
 * English experience bucket (beginner|intermediate|advanced). RO onboarding
 * strings must be mapped to English BEFORE calling (a naive RO pass falls to
 * the x1.0 multiplier default).
 * @param {string} exerciseName
 * @param {string} experience
 */
export function suggestStartWeight(exerciseName, experience) {
  const baseMap = /** @type {Record<string, number>} */ (BASE_WEIGHTS);
  const multMap = /** @type {Record<string, number>} */ (EXPERIENCE_MULTIPLIER);
  const base = baseMap[exerciseName] ?? 10;
  const mult = multMap[experience] ?? 1.0;
  return Math.round(base * mult);
}

/** @type {Record<string, Record<string, Array<{name: string, sets: number, reps: string}>>>} */
const EXERCISE_BANK = {
  PUSH: {
    beginner: [
      { name: 'DB Shoulder Press', sets: 3, reps: '10-12' },
      { name: 'Incline DB Press',  sets: 3, reps: '8-10'  },
      { name: 'Pec Deck',          sets: 3, reps: '12-15' },
      { name: 'Lateral Raises',    sets: 3, reps: '12-15' },
      { name: 'Pushdown',          sets: 3, reps: '10-12' },
    ],
    intermediate: [
      { name: 'DB Shoulder Press', sets: 4, reps: '10-12' },
      { name: 'Incline DB Press',  sets: 4, reps: '8-10'  },
      { name: 'Pec Deck',          sets: 3, reps: '12-15' },
      { name: 'Lateral Raises',    sets: 4, reps: '12-15' },
      { name: 'Overhead Triceps',  sets: 3, reps: '10-12' },
      { name: 'Pushdown',          sets: 3, reps: '10-12' },
    ],
    advanced: [
      { name: 'DB Shoulder Press', sets: 4, reps: '8-12'  },
      { name: 'Incline DB Press',  sets: 4, reps: '6-10'  },
      { name: 'Pec Deck',          sets: 4, reps: '10-15' },
      { name: 'Lateral Raises',    sets: 4, reps: '12-15' },
      { name: 'Overhead Triceps',  sets: 3, reps: '8-12'  },
      { name: 'Pushdown',          sets: 3, reps: '8-12'  },
      { name: 'Rear Delt Fly',     sets: 3, reps: '12-15' },
    ],
  },
  PULL: {
    beginner: [
      { name: 'Lat Pulldown',   sets: 3, reps: '8-12'  },
      { name: 'Cable Row',      sets: 3, reps: '8-12'  },
      { name: 'Face Pulls',     sets: 3, reps: '12-15' },
      { name: 'Bayesian Curl',  sets: 3, reps: '10-12' },
      { name: 'Incline DB Curl',sets: 3, reps: '10-12' },
    ],
    intermediate: [
      { name: 'Lat Pulldown',   sets: 4, reps: '8-12'  },
      { name: 'Cable Row',      sets: 4, reps: '8-12'  },
      { name: 'Face Pulls',     sets: 3, reps: '12-15' },
      { name: 'Bayesian Curl',  sets: 3, reps: '10-12' },
      { name: 'Incline DB Curl',sets: 3, reps: '10-12' },
      { name: 'Rear Delt Fly',  sets: 3, reps: '12-15' },
    ],
    advanced: [
      { name: 'Lat Pulldown',   sets: 4, reps: '6-12'  },
      { name: 'Cable Row',      sets: 4, reps: '6-12'  },
      { name: 'Face Pulls',     sets: 4, reps: '12-15' },
      { name: 'Bayesian Curl',  sets: 4, reps: '10-12' },
      { name: 'Incline DB Curl',sets: 3, reps: '10-12' },
      { name: 'Rear Delt Fly',  sets: 3, reps: '12-15' },
    ],
  },
  UMERI_BRATE: {
    beginner: [
      { name: 'DB Shoulder Press', sets: 3, reps: '10-12' },
      { name: 'Lateral Raises',    sets: 3, reps: '12-15' },
      { name: 'Bayesian Curl',     sets: 3, reps: '10-12' },
      { name: 'Pushdown',          sets: 3, reps: '10-12' },
    ],
    intermediate: [
      { name: 'DB Shoulder Press', sets: 4, reps: '10-12' },
      { name: 'Lateral Raises',    sets: 4, reps: '12-15' },
      { name: 'Rear Delt Fly',     sets: 3, reps: '12-15' },
      { name: 'Bayesian Curl',     sets: 3, reps: '10-12' },
      { name: 'Pushdown',          sets: 3, reps: '10-12' },
    ],
    advanced: [
      { name: 'DB Shoulder Press', sets: 4, reps: '8-12'  },
      { name: 'Lateral Raises',    sets: 4, reps: '12-15' },
      { name: 'Rear Delt Fly',     sets: 3, reps: '12-15' },
      { name: 'Bayesian Curl',     sets: 4, reps: '10-12' },
      { name: 'Overhead Triceps',  sets: 3, reps: '8-12'  },
      { name: 'Pushdown',          sets: 3, reps: '8-12'  },
    ],
  },
};

// Fallback for session types not in bank
EXERCISE_BANK['UPPER_PICIOARE'] = EXERCISE_BANK['PULL'] ?? {};
EXERCISE_BANK['FULL_UPPER']     = EXERCISE_BANK['PULL'] ?? {};
EXERCISE_BANK.LEGS = {
  beginner:     [
    { name: 'Leg Press',     sets: 3, reps: '10-12' },
    { name: 'Leg Extension', sets: 3, reps: '12-15' },
    { name: 'Leg Curl',      sets: 3, reps: '10-12' },
  ],
  intermediate: [
    { name: 'Leg Press',     sets: 4, reps: '10-12' },
    { name: 'Leg Extension', sets: 4, reps: '12-15' },
    { name: 'Leg Curl',      sets: 3, reps: '10-12' },
  ],
  advanced: [
    { name: 'Leg Press',     sets: 4, reps: '8-12'  },
    { name: 'Leg Extension', sets: 4, reps: '12-15' },
    { name: 'Leg Curl',      sets: 4, reps: '10-12' },
  ],
};

/**
 * Generate a cold start session based on onboarding data.
 * Returns a session with coldStart=true and exercise weights from population priors.
 * @param {string} sessionType
 * @param {{ experience?: string, goal?: string }} [onboardingData]
 */
export function generateColdStartSession(sessionType, onboardingData = {}) {
  const experience = onboardingData.experience ?? 'beginner';
  const goal       = onboardingData.goal ?? 'cut';

  const bank = EXERCISE_BANK[sessionType] ?? EXERCISE_BANK['PULL'] ?? {};
  const exercises = (bank[experience] ?? bank['beginner'] ?? []).map((ex) => {
    const weight = suggestStartWeight(ex.name, experience);
    let reps = ex.reps;

    // Cap rep range for CUT — isolation capped at 10, floor at 6
    if (goal === 'cut' && typeof reps === 'string') {
      const [min, max] = reps.split('-').map(Number);
      reps = `${Math.min(Math.max(6, min ?? 6), 10)}-${Math.min(10, max ?? 10)}`;
    }

    return {
      name: ex.name,
      sets: ex.sets,
      reps,
      recommendation: {
        kg: weight,
        weight,
        reps: typeof reps === 'string' ? parseInt(reps.split('-')[1] ?? reps) : reps,
        status: 'INIT',
        rationale: `Greutate de start pentru ${experience} (${goal})`,
        isInitial: true,
      },
    };
  });

  return {
    type: sessionType,
    coldStart: true,
    exercises,
    reason: `Guideline bazat pe experienta (${experience}) si obiectiv (${goal})`,
    calibrationLevel: null, // filled by CoachDirector
  };
}
