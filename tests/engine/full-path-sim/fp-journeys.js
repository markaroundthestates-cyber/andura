// ══ FULL-PATH-SIM — synthetic user journeys + path-A trigger traits ════════
// Each profile carries a persona/goal/age/experience + a TRAIT that is designed
// to make a path-A engine FIRE through the full seam:
//
//   - 'acwr_spike'   — a calm chronic period then an acute volume SPIKE in the
//                      final weeks → computeACWR high → acwrReadinessPenalty cuts
//                      the readiness score under the <60 hold AND the graded
//                      scaleSetsByReadiness, even on a good energy-check day.
//   - 'fatigued_week'— heavy compound days clustered close together so a group's
//                      recovery window has not elapsed → weekly-volume-by-recovery
//                      redistributes (flag ON) / intra-day M1 only (flag OFF).
//   - 'emphasis'     — a user-picked non-balanced focus (arms/chest) → emphasis=
//                      specialization engine target + zero-sum volume trade.
//   - 'learned_vol'  — a long, steady, RESPONSIVE journey (1RM keeps climbing at a
//                      given weekly set count) so learnVolumeLandmarks accumulates
//                      ≥4 week-deltas → personal MEV/MAV moves the volume target.
//   - 'tight_time'   — a small per-session time budget (sessionTimeBudgetMin) on a
//                      legs day → the trim bites → stimulus-per-min drop reorders
//                      which exercises survive (flag ON) vs strict tail (OFF).
//
// Every trait is benign with the flag OFF (the baseline arm) — the trait only
// shapes the journey; the FLAG decides whether the engine acts on it.

import { rng, pick, gauss, clamp } from './fp-config.js';

const ARCHETYPES = ['trusts_coach', 'consistent', 'erratic'];
// RO onboarding goal vocab (buildUserStateForPipeline.goalPhaseForGoal maps these).
const GOALS = ['masa', 'forta', 'slabire', 'mentenanta'];
const EXPS = ['incepator', 'intermediar', 'avansat'];
// The five path-A trait buckets, round-robin so every cohort run exercises all.
const TRAITS = ['acwr_spike', 'fatigued_week', 'emphasis', 'learned_vol', 'tight_time'];
const EMPHASIS_PRESETS = ['arms', 'chest', 'v-taper'];

const round2 = (x) => Math.round(x * 100) / 100;

export function buildJourneyCohort(n, seed) {
  const r = rng(seed);
  const profiles = [];
  for (let i = 0; i < n; i++) {
    const sex = r() < 0.62 ? 'm' : 'f';
    // Spread ages across personas so resolvePersonaId yields maria/gigica/marius
    // (older cohort gets the tendon-cap-adjacent persona caps + maria time cap).
    const age = Math.round(clamp(gauss(r, 40, 16), 18, 70));
    const experience = pick(r, EXPS);
    const baseBw = sex === 'm' ? gauss(r, 84, 15) : gauss(r, 66, 12);
    const weight = Math.round(clamp(baseBw, 45, 140));
    const height = Math.round(sex === 'm' ? gauss(r, 178, 8) : gauss(r, 165, 7));
    const goal = pick(r, GOALS);
    const archetype = pick(r, ARCHETYPES);
    const trait = TRAITS[i % TRAITS.length];
    const emphasisPreset = trait === 'emphasis' ? EMPHASIS_PRESETS[i % EMPHASIS_PRESETS.length] : 'balanced';
    // 4 active days/week (freq '4') → the L/M/Mi/J active-day rotation the
    // frequency split shapes. Hidden true-progress rate per experience.
    const baseGain = experience === 'incepator' ? 0.018 : experience === 'intermediar' ? 0.009 : 0.004;
    const trueProgRate = clamp(gauss(r, baseGain, baseGain * 0.4), 0.001, 0.035);
    const indStrength = clamp(gauss(r, 1.0, 0.13), 0.7, 1.4);
    profiles.push({
      id: `J${String(i).padStart(3, '0')}`,
      sex, age, weight, height, experience, goal, archetype, trait, emphasisPreset,
      frequency: '4',
      indStrength: round2(indStrength), trueProgRate: round2(trueProgRate),
      _seed: (seed ^ (i * 0x9e3779b1)) >>> 0,
    });
  }
  return profiles;
}

// Big-11-ish true working-capacity priors keyed on the EN canonical names the
// engine session pool surfaces for a freq-4 upper/lower rotation. The user lifts
// RELATIVE to these hidden caps so the recommended kg has something real to track.
const TRUE_FRACTION = {
  'Lat Pulldown': 0.8, 'Cable Row': 0.82, 'Bayesian Curl': 0.2, 'Incline DB Curl': 0.16,
  'Face Pulls': 0.3, 'DB Rear Delt Fly': 0.1,
  'DB Shoulder Press': 0.2, 'Incline DB Press': 0.3, 'Pec Deck / Cable Fly': 0.45,
  'DB Lateral Raise': 0.12, 'Pushdown': 0.32, 'Overhead Triceps': 0.22,
  'Leg Press': 2.2, 'Leg Extension': 0.62, 'Leg Curl': 0.5, 'Romanian Deadlift': 1.0,
  'Cable Curl': 0.28, 'Preacher Curl': 0.22,
};
const EXP_MULT = { incepator: 0.62, intermediar: 1.0, avansat: 1.45 };
const SEX_MULT = { m: 1.0, f: 0.66 };

/** Hidden true working capacity for an exercise at a given week index. */
export function trueCapAt(profile, enName, weekIdx) {
  const frac = TRUE_FRACTION[enName] ?? 0.3;
  const base = Math.max(
    2,
    profile.weight * frac * (EXP_MULT[profile.experience] ?? 1) * (SEX_MULT[profile.sex] ?? 1) * profile.indStrength,
  );
  // 'learned_vol' users genuinely respond every week (steady climb → ≥4 deltas);
  // others still climb but noisier (handled by the run loop's rating feedback).
  return base * Math.pow(1 + profile.trueProgRate, weekIdx);
}
