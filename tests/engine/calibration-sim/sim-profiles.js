// ══ CALIBRATION-SIM — synthetic profiles + hidden ground truth ═════════════
// Ported verbatim from salafull/scripts/admin/_SIM_profiles.mjs (relative import).
// Each profile carries a HIDDEN per-exercise true working capacity; the user
// reacts to Andura's recommendation RELATIVE to this hidden truth.

import { rng, pick, gauss, clamp, SESS_MIN, SESS_MAX } from './sim-config.js';

export const EXERCISE_POOL = {
  push: ['DB Shoulder Press', 'Incline DB Press', 'Pec Deck / Cable Fly', 'DB Lateral Raise', 'Overhead Triceps', 'Pushdown'],
  pull: ['Lat Pulldown', 'Cable Row', 'Face Pulls', 'Bayesian Curl', 'Incline DB Curl', 'DB Rear Delt Fly'],
  legs: ['Leg Press', 'Leg Extension', 'Leg Curl', 'Romanian Deadlift'],
  arms: ['Cable Curl', 'Preacher Curl', 'Incline DB Curl', 'Pushdown', 'Overhead Triceps', 'Bayesian Curl'],
};

export const FOCUS_ROTATION = {
  balanced: [EXERCISE_POOL.push, EXERCISE_POOL.pull, EXERCISE_POOL.legs],
  'v-taper': [EXERCISE_POOL.pull, EXERCISE_POOL.push, ['Lat Pulldown', 'Cable Row', 'DB Lateral Raise', 'DB Rear Delt Fly']],
  arms: [EXERCISE_POOL.arms, EXERCISE_POOL.push, EXERCISE_POOL.pull],
  chest: [['Incline DB Press', 'Pec Deck / Cable Fly', 'DB Shoulder Press', 'Pushdown', 'Overhead Triceps'], EXERCISE_POOL.pull, EXERCISE_POOL.legs],
  lower: [EXERCISE_POOL.legs, EXERCISE_POOL.push, EXERCISE_POOL.pull],
};

const TRUE_BW_FRACTION = {
  'Leg Press': 2.2, 'Leg Extension': 0.62, 'Leg Curl': 0.5, 'Romanian Deadlift': 1.0,
  'Lat Pulldown': 0.8, 'Cable Row': 0.82, 'Chest-Supported Row': 0.7,
  'Incline DB Press': 0.3, 'Flat DB Press': 0.34, 'DB Shoulder Press': 0.2,
  'Pec Deck / Cable Fly': 0.45, 'Cable Fly': 0.22,
  'Lateral Raises': 0.12, 'Rear Delt Fly': 0.1,
  'DB Lateral Raise': 0.12, 'DB Rear Delt Fly': 0.1,
  'Face Pulls': 0.3, 'Bayesian Curl': 0.2, 'Incline DB Curl': 0.16,
  'Cable Curl': 0.28, 'Preacher Curl': 0.22,
  Pushdown: 0.32, 'Overhead Triceps': 0.22,
};
const TRUE_FRACTION_DEFAULT = 0.25;

const EXP_TRUE_MULT = { beginner: 0.62, intermediate: 1.0, advanced: 1.45 };
const SEX_TRUE_MULT = { m: 1.0, f: 0.66 };

const ARCHETYPES = ['trusts_coach', 'ego_lifter', 'timid', 'consistent', 'erratic'];
const GOALS = ['hypertrophy', 'strength', 'fat-loss'];
const FOCI = ['balanced', 'v-taper', 'arms', 'chest', 'lower'];
const EXPS = ['beginner', 'intermediate', 'advanced'];

export function buildCohort(n, seed) {
  const r = rng(seed);
  const profiles = [];
  for (let i = 0; i < n; i++) {
    const sex = r() < 0.62 ? 'm' : 'f';
    const age = Math.round(clamp(gauss(r, 33, 11), 16, 68));
    const experience = pick(r, EXPS);
    const baseBw = sex === 'm' ? gauss(r, 84, 15) : gauss(r, 66, 12);
    const bodyweightKg = Math.round(clamp(baseBw, 45, 140));
    const height = Math.round(sex === 'm' ? gauss(r, 178, 8) : gauss(r, 165, 7));
    const goal = pick(r, GOALS);
    const focus = pick(r, FOCI);
    const archetype = pick(r, ARCHETYPES);
    const indStrength = clamp(gauss(r, 1.0, 0.13), 0.7, 1.4);
    const baseGain = experience === 'beginner' ? 0.02 : experience === 'intermediate' ? 0.009 : 0.004;
    const trueProgRate = clamp(gauss(r, baseGain, baseGain * 0.4), 0.001, 0.04);
    const setNoise = clamp(gauss(r, 0.06, 0.02), 0.02, 0.14);
    const sessionCount = Math.round(clamp(gauss(r, 42, 6), SESS_MIN, SESS_MAX));

    const trueCap0 = {};
    const allEx = new Set();
    FOCUS_ROTATION[focus].forEach((day) => day.forEach((e) => allEx.add(e)));
    for (const ex of allEx) {
      const frac = TRUE_BW_FRACTION[ex] ?? TRUE_FRACTION_DEFAULT;
      const expMult = EXP_TRUE_MULT[experience];
      const sexMult = SEX_TRUE_MULT[sex];
      const exVar = clamp(gauss(r, 1.0, 0.15), 0.6, 1.5);
      let cap = bodyweightKg * frac * expMult * sexMult * indStrength * exVar;
      cap = Math.max(cap, 2);
      trueCap0[ex] = cap;
    }

    profiles.push({
      id: `P${String(i).padStart(3, '0')}`,
      sessionCount,
      sex, age, bodyweightKg, height, experience, goal, focus, archetype,
      indStrength: round2(indStrength), trueProgRate: round4(trueProgRate), setNoise: round3(setNoise),
      trueCap0, rotation: FOCUS_ROTATION[focus],
      _seed: (seed ^ (i * 0x9e3779b1)) >>> 0,
    });
  }
  return profiles;
}

export function trueCapAt(profile, ex, sessionIdx) {
  const base = profile.trueCap0[ex];
  if (base == null) return null;
  return base * Math.pow(1 + profile.trueProgRate, sessionIdx);
}

const round2 = (x) => Math.round(x * 100) / 100;
const round3 = (x) => Math.round(x * 1000) / 1000;
const round4 = (x) => Math.round(x * 10000) / 10000;
