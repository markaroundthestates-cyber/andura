// FAZA-4: not yet wired up — planned cold start session generation per ADR-009
// ══ COLD START GUIDELINES — Intelligent defaults for new users ═════════════
// Cold start does NOT mean silence. It means population-prior guidelines
// scaled by onboarding data (experience, goal, equipment).

import { getExerciseMetadata } from './exerciseLibrary.js';

const BASE_WEIGHTS = {
  'DB Shoulder Press': 10,
  'Incline DB Press': 15,
  'Pec Deck': 20,
  // Chest-fly ISOLATIONS (the composer emits these full canonical names, never
  // bare 'Pec Deck'). A fly is an isolation — it must NOT inherit the chest-PRESS
  // floor. Machine pec-deck heavier than a free fly; cable/DB fly lighter (DB per
  // hand). (Daniel coach audit 2026-06-06: 'Pec Deck / Cable Fly' missed both
  // tables -> piept 0.50 press fallback -> a fly priced as a bench press ~32kg.)
  'Pec Deck / Cable Fly': 20,
  'Cable Fly': 12,
  'DB Fly': 12,
  'Lateral Raises': 5,
  'Pushdown': 15,
  'Lat Pulldown': 30,
  'Cable Row': 30,
  'Face Pulls': 10,
  'Bayesian Curl': 8,
  'Incline DB Curl': 5,
  'Overhead Triceps': 10,
  'Rear Delt Fly': 5,
  'Cable Curl': 10,
  'Preacher Curl': 8,
  // Canonical CORE_AUTO tiny-isolation names (Gigel sim Target 3): the flat (no-
  // bodyweight) prior. Without an entry the flat path floors at 10kg, which then
  // dominated the bodyweight-scaled ~5kg via Math.max(flat, scaled) — re-flooring
  // a rear-delt fly. Pin the realistic light priors (mirror the legacy 5/Rear Delt
  // Fly + 5/Lateral Raises values onto the names the composer actually emits).
  'DB Rear Delt Fly': 5,
  'Cable Rear Delt Fly': 5,
  'Reverse Pec Deck': 8,
  'DB Lateral Raise': 5,
  'Cable Lateral Raise': 5,
  'Machine Lateral Raise': 7,
  'Leaning Lateral Raise': 5,
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
  // ── Cable/barbell compound cold-start fractions raised (Gigel sim Target 4) ──
  // 50-Gigel sim 2026-06-06: barbell mean signed-err -0.59, cable -0.30; RDL/Face
  // Pull/Leg Press the worst offenders (RDL -45% to -75%, Face Pull -53% to -76%).
  // The old fractions seeded these compounds ~55-67% of true, freezing the first
  // sessions absurdly low. Raised toward realistic starts (still conservative — the
  // first set's RIR recalibrates, and Target 1's re-anchor now absorbs the override
  // fast). Romanian Deadlift gets an EXPLICIT entry (it fell to the hamstrings×
  // barbell fallback ~0.51); Face Pull keyed on the canonical CORE_AUTO name (only
  // legacy 'Face Pulls' existed → the live name fell to the umeri-iso fallback ~0.11).
  // Heavy compound legs (machine, both legs)
  'Leg Press': 1.9,
  'Leg Extension': 0.42,
  'Leg Curl': 0.34,
  // Heavy posterior-chain barbell hinge
  'Romanian Deadlift': 0.80,
  // Compound upper — pulls/rows (full stack, both arms)
  'Lat Pulldown': 0.72,
  'Cable Row': 0.72,
  'Chest-Supported Row': 0.62,
  // Rear-delt / rotator cable compound-ish pull (canonical CORE_AUTO name)
  'Face Pull': 0.16,
  // Compound upper — DB presses (PER HAND)
  'Flat DB Press': 0.22,
  'Incline DB Press': 0.20,
  'DB Shoulder Press': 0.14,
  'Pec Deck': 0.30,
  // Chest-fly ISOLATIONS — keyed on the EXACT engineNames the composer emits
  // (scheduleAdapterAggregate.compose.ts:183). A fly is an isolation share, NOT
  // the chest-PRESS share (FALLBACK_MUSCLE_FRACTION piept 0.50). Machine pec-deck
  // ~0.30 (the bare 'Pec Deck' intent, now keyed to the live name); a free cable/
  // DB fly is lighter (DB per hand) ~0.18. Lands a fly clearly BELOW a press for
  // the same user (Daniel coach audit 2026-06-06: 'chest fly 10 x 32').
  'Pec Deck / Cable Fly': 0.30,
  'Cable Fly': 0.18,
  'DB Fly': 0.18,
  // Larger cable isolation
  'Pushdown': 0.22,
  'Overhead Triceps': 0.11,
  'Cable Curl': 0.16,
  // Rear-delt / rotator small isolation (NOT a compound-row share)
  'Face Pulls': 0.10,
  // Small isolation (DB per hand / fine cable)
  'Bayesian Curl': 0.13,
  'Incline DB Curl': 0.085,
  'Preacher Curl': 0.13,
  'Lateral Raises': 0.075,
  // Rear-delt fly is a tiny isolation, NOT a Cable-Row-share movement. The
  // pec_deck stack still floors the 78kg start at its 18kg minimum plate (the
  // real machine minimum, weights.js:12), but this fraction stops the heavy-user
  // blow-up (was 0.22 -> 32kg at 136kg bodyweight).
  'Rear Delt Fly': 0.06,
  // ── Canonical CORE_AUTO tiny-isolation names the composer actually emits ─────
  // (Gigel sim 2026-06-06, Target 3). The legacy keys above ('Rear Delt Fly',
  // 'Lateral Raises') are NOT what scheduleAdapterAggregate emits — the live names
  // are these. Without explicit entries they fell to the coarse umeri-isolation
  // fallback (0.16 × equip), which on a cable variant priced an 80kg user's rear-
  // delt fly ~9kg. Pin the tiny fraction directly (paired with the light ladders
  // in weights.js so the snap stays light, never the 18kg pec_deck floor).
  'DB Rear Delt Fly': 0.06,
  'Cable Rear Delt Fly': 0.06,
  'Reverse Pec Deck': 0.12,
  'DB Lateral Raise': 0.075,
  'Cable Lateral Raise': 0.075,
  'Machine Lateral Raise': 0.10,
  'Leaning Lateral Raise': 0.075,
});

// Generic fraction for exercises with no explicit pattern entry AND no usable
// metadata — small isolation level (conservative; never aggressive for a truly
// unknown movement).
const BW_FRACTION_DEFAULT = 0.12;

// ── Metadata-aware fallback (Daniel audit 2026-06-05) ────────────────────────
// The explicit BW_FRACTION table covers ~17 staple lifts. Every OTHER exercise
// (Romanian Deadlift, Hip Thrust, Bulgarian Split Squat, Front Squat, ...) fell
// to BW_FRACTION_DEFAULT (0.12 — isolation level), so a heavy compound surfaced
// at the equipment floor: a 108kg user was offered RDL @ 9kg. Instead of
// enumerating hundreds of movements, derive a sensible fraction from the
// exercise's PRIMARY MUSCLE (canonical RO group) damped by its EQUIPMENT type
// (barbell/machine carry more total load than per-hand dumbbells). Still
// deliberately CONSERVATIVE — the first real set's RIR + AaFriction's
// over-recommendation guard recalibrate, so a touch light beats overshoot.
const FALLBACK_MUSCLE_FRACTION = /** @type {Record<string, number>} */ ({
  'picioare-quads': 0.70,
  'fese': 0.70,
  'picioare-hamstrings': 0.60,
  'spate': 0.55,
  'gambe': 0.60,
  'piept': 0.50,
  // 'umeri' is a single 96-exercise bucket mixing overhead PRESSES (compound,
  // ~0.25 share) with lateral-raise / rear-delt / front-raise / face-pull / cuff
  // ISOLATIONS (tiny share). A flat 0.25 gave a rear-delt fly the shoulder-PRESS
  // load (~20kg @ 78kg). Resolved per movement pattern in _shoulderFraction below
  // — this entry is the PRESS value (the fallback when the name is not a known
  // isolation pattern).
  'umeri': 0.25,
  'triceps': 0.20,
  'biceps': 0.18,
  'antebrate': 0.14,
  'core': 0.14,
});

// Shoulder ISOLATION movements inside the coarse 'umeri' bucket — lateral /
// rear-delt / front raises, face pulls, reverse pec deck, rotator-cuff work.
// These carry a tiny fraction of bodyweight, NOT the overhead-press share. Any
// 'umeri' exercise whose name matches this gets UMERI_ISOLATION_FRACTION instead
// of the 0.25 press fraction. Keyed on the ENGLISH canonical name the composer
// passes (scheduleAdapterAggregate.compose.ts:140,174).
const UMERI_ISOLATION_RE =
  /lateral|side rais|rear delt|reverse pec|face pull|front rais|rotation|pull-?apart|cuban|scaption|y raise|y-t-w|external rotat|internal rotat/i;
const UMERI_ISOLATION_FRACTION = 0.16; // pre-equipment-damp; ×cable 0.70 ≈ 0.11

// Equipment damping on the muscle fraction. machine/barbell load the full bar/
// stack; dumbbell values are PER HAND (so a smaller share); cable/band lighter.
// bodyweight movements never reach suggestStartWeight via the composer (the
// bodyweight branch uses added-load 0), but keep 0 for safety.
const FALLBACK_EQUIP_FACTOR = /** @type {Record<string, number>} */ ({
  machine: 1.0,
  barbell: 0.85,
  cable: 0.70,
  dumbbell: 0.40,
  band: 0.30,
  bodyweight: 0,
});

// Reference bodyweight the flat (no-profile) fallback prices the fraction at.
const FALLBACK_REFERENCE_BW = 70;

/**
 * Conservative bodyweight FRACTION for an exercise that is not in the explicit
 * BW_FRACTION table, derived from its metadata (muscle_target_primary ×
 * equipment_type). Unknown muscle → the isolation-level BW_FRACTION_DEFAULT (so
 * an unrecognised movement still can never resolve aggressive). Pure.
 * @param {string} exerciseName English canonical name
 * @returns {number}
 */
function _fallbackFraction(exerciseName) {
  const meta = getExerciseMetadata(exerciseName);
  let base = meta ? FALLBACK_MUSCLE_FRACTION[meta.muscle_target_primary] : undefined;
  if (base == null) return BW_FRACTION_DEFAULT;
  // Sub-split the coarse 'umeri' bucket: a lateral/rear-delt/front-raise/face-pull
  // isolation must NOT inherit the overhead-press fraction (0.25). (Daniel coach
  // audit 2026-06-05: rear-delt fly was priced at the press share ~20kg.)
  if (meta.muscle_target_primary === 'umeri' && UMERI_ISOLATION_RE.test(exerciseName)) {
    base = UMERI_ISOLATION_FRACTION;
  }
  const eqF = meta && FALLBACK_EQUIP_FACTOR[meta.equipment_type] != null
    ? FALLBACK_EQUIP_FACTOR[meta.equipment_type]
    : 0.70;
  return base * eqF;
}

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
  const frac = fracMap[exerciseName] ?? _fallbackFraction(exerciseName);
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
  // Flat prior (no bodyweight). Explicit BASE_WEIGHTS entry first; otherwise the
  // metadata-aware fallback priced at the reference bodyweight (floored at 10 so
  // isolation never drops below the equipment floor), NOT the old blanket 10kg
  // that put every unlisted compound at the floor.
  const flat =
    (baseMap[exerciseName] ??
      Math.max(10, Math.round(_fallbackFraction(exerciseName) * FALLBACK_REFERENCE_BW))) * mult;
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
