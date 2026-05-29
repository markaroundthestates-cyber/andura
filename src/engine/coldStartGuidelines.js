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

// ── Bodyweight-scaled cold-start (anti "Flat DB Press 10kg pentru 110kg") ────
// The flat BASE_WEIGHTS table is calibrated for a ~70kg reference lifter. For a
// heavy trained user it under-prescribes massively (the bug: 110kg user offered
// the equipment floor). The fix scales the start by the user's BODYWEIGHT via a
// per-movement-pattern coefficient (working weight as a fraction of bodyweight),
// then by SEX and EXPERIENCE. Numbers stay CONSERVATIVE on purpose: the first
// real set's RIR + AaFriction's over_recommendation guard recalibrate after, so
// we'd rather start a touch light than overshoot a beginner. The result is
// clamped to the exercise's valid equipment range by the caller's
// roundToEquipmentWeight snap (never below the equipment floor, never absurd).

// BASE_WEIGHTS priors above are tuned around a ~70kg reference lifter; the
// bodyweight model below scales away from that reference, floored at the prior.

// Working weight as a FRACTION of bodyweight, per movement pattern, for a
// reference INTERMEDIATE MALE. These are deliberately conservative cold-start
// anchors (a trained lifter can do more — the first set proves it):
//   - Heavy compound legs (Leg Press): big machine, large fraction.
//   - Compound pulls/presses (Lat Pulldown, Cable Row, Flat/Incline DB Press
//     per-hand): mid fraction.
//   - Small isolation (Lateral Raises, curls, Face Pulls): small fraction.
// Keyed on the ENGLISH canonical exercise name. Anything not listed falls back
// to a generic isolation fraction (safe, low) so an unknown exercise can never
// resolve to an aggressive start.
const BW_FRACTION = /** @type {Record<string, number>} */ ({
  // Heavy compound legs (machine, both legs)
  'Leg Press': 1.6,
  'Leg Extension': 0.42,
  'Leg Curl': 0.34,
  // Compound upper — pulls/rows (full stack, both arms)
  'Lat Pulldown': 0.62,
  'Cable Row': 0.62,
  'Chest-Supported Row': 0.55,
  // Compound upper — DB presses (PER HAND)
  'Flat DB Press': 0.22,
  'Incline DB Press': 0.20,
  'DB Shoulder Press': 0.14,
  'Pec Deck': 0.30,
  // Larger cable isolation
  'Pushdown': 0.22,
  'Overhead Triceps': 0.20,
  'Cable Curl': 0.16,
  'Face Pulls': 0.22,
  // Small isolation (DB per hand / fine cable)
  'Bayesian Curl': 0.13,
  'Incline DB Curl': 0.085,
  'Preacher Curl': 0.13,
  'Lateral Raises': 0.075,
  'Rear Delt Fly': 0.22,
});

// Generic fraction for exercises with no explicit pattern entry — small
// isolation level (conservative; never aggressive for an unknown movement).
const BW_FRACTION_DEFAULT = 0.12;

// Sex factor on the bodyweight-derived start. Female lifters carry a lower
// share of bodyweight as working weight on most patterns at equal training age;
// male = reference 1.0. Conservative single factor (the first set recalibrates).
const SEX_FACTOR = /** @type {Record<string, number>} */ ({ m: 1.0, f: 0.78 });

/**
 * Bodyweight-scaled cold-start weight for an exercise. CONSERVATIVE by design:
 *   weight = bodyweight × patternFraction × sexFactor × experienceMult
 * Falls back to the flat experience-scaled BASE_WEIGHTS prior when no usable
 * bodyweight is supplied (preserves the legacy 2-arg behavior byte-for-byte).
 * Caller is expected to snap the result to the equipment stack
 * (roundToEquipmentWeight), which enforces the never-below-floor clamp.
 * @param {string} exerciseName
 * @param {string} experience EN bucket (beginner|intermediate|advanced)
 * @param {number} [bodyweightKg]
 * @param {string} [sex] 'm' | 'f'
 */
function _profileScaledStart(exerciseName, experience, bodyweightKg, sex) {
  const multMap = /** @type {Record<string, number>} */ (EXPERIENCE_MULTIPLIER);
  const expMult = multMap[experience] ?? 1.0;
  const fracMap = BW_FRACTION;
  const frac = fracMap[exerciseName] ?? BW_FRACTION_DEFAULT;
  const sexMap = SEX_FACTOR;
  const sexF = (typeof sex === 'string' && sexMap[sex] != null) ? sexMap[sex] : 1.0;
  return bodyweightKg * frac * sexF * expMult;
}

/**
 * Population-prior start weight for an exercise scaled by experience — and, when
 * a real bodyweight is supplied, by BODYWEIGHT + SEX (per movement pattern) so a
 * heavy trained user starts realistically instead of at the equipment floor.
 * Exported for the React scheduleAdapter cold-start path (new user, no logged
 * history) — keyed on the ENGLISH canonical exercise name + the English
 * experience bucket (beginner|intermediate|advanced). RO onboarding strings must
 * be mapped to English BEFORE calling (a naive RO pass falls to the x1.0 mult).
 *
 * Backward compatible: called with only (name, experience) — no profile — it
 * returns the legacy flat experience-scaled prior unchanged.
 * @param {string} exerciseName
 * @param {string} experience
 * @param {{ bodyweightKg?: number | null, sex?: string | null }} [profile]
 */
export function suggestStartWeight(exerciseName, experience, profile) {
  const baseMap = /** @type {Record<string, number>} */ (BASE_WEIGHTS);
  const multMap = /** @type {Record<string, number>} */ (EXPERIENCE_MULTIPLIER);
  const mult = multMap[experience] ?? 1.0;
  // Legacy flat prior (no bodyweight) — preserved exactly for back-compat.
  const flat = (baseMap[exerciseName] ?? 10) * mult;
  const bw = profile && Number(profile.bodyweightKg);
  if (!bw || !Number.isFinite(bw) || bw <= 0) {
    return Math.round(flat);
  }
  // Profile-scaled start. Floor at the flat prior so the bodyweight model can
  // only RAISE a too-low start, never drop a sensible exercise below its
  // population prior for a light user.
  const scaled = _profileScaledStart(
    exerciseName,
    experience,
    bw,
    profile ? profile.sex ?? undefined : undefined,
  );
  return Math.round(Math.max(flat, scaled));
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
