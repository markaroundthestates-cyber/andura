// Coach Brain Eval — scenario generator (persona-based, parametrized, seeded).
//
// Per COACH_BRAIN_EVAL_DESIGN.md §3: reuse the 3 canonical personas
// (Gigel T0 / Marius T2 / Maria 65 T3) + edge cases, varying the §3.2 decision
// dimensions (readiness/energy, mesocycle week, phase, weakGroups, pain/injury).
//
// Output = `userState` objects in the SHAPE engines consume (verified via
// src/engine/periodization/index.js + adapters): user.{sex,age,kg,bf,experience,
// goal,energyEmoji,persona}, recentSessions[{date,volume,intensity,energy,rir,
// weekIdx,injury,daysAgo}], weights{}, profileTier, flags{}, meta{weeksElapsed,
// observations[], recentObservedWeights[], emoji, ...}. buildEngineContext()
// freezes it into the canonical EngineContext; runPipeline consumes that.
//
// ZERO Date.now / Math.random — Mulberry32 seeded (same pattern as
// tests/fixtures/personas.ts) → identical seed = identical scenario,
// reproducible at 5k / 50k scale.

// Deterministic seeded RNG (Mulberry32) — mirror tests/fixtures/personas.ts:45.
function mulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick one element of arr deterministically from rng.
function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length) % arr.length];
}

// Canonical persona archetypes — the demographic seed each scenario varies.
// Ages chosen so resolvePersonaId (src/engine/periodization/volumeLandmarks.js:39)
// resolves the intended persona: >=55 maria, >=30 gigica, <30 marius.
export const ARCHETYPES = Object.freeze({
  gigel: Object.freeze({
    id: 'gigel',
    user: { sex: 'M', age: 32, kg: 88, bf: 24, experience: 'novice', persona: 'gigica' },
    profileTier: 'T0',
    historyDays: 0,
  }),
  marius: Object.freeze({
    id: 'marius',
    user: { sex: 'M', age: 28, kg: 82, bf: 14, experience: 'advanced', persona: 'marius' },
    profileTier: 'T2',
    historyDays: 30,
  }),
  maria: Object.freeze({
    id: 'maria',
    user: { sex: 'F', age: 67, kg: 64, bf: 32, experience: 'beginner', persona: 'maria', joints: ['knee-left'] },
    profileTier: 'T3',
    historyDays: 90,
  }),
});

const GOALS = ['hipertrofie', 'forta', 'recompozitie', 'longevitate', 'sanatate'];
const ENERGY = ['green', 'yellow', 'red'];
// weekInMesocycle = (weeksElapsed % 4) + 1. weeksElapsed 3/7/11 → week 4 (DELOAD).
const WEEKS_ELAPSED = [0, 1, 2, 3, 5, 7, 8, 11];

/**
 * Generate a session-history array shaped for the engines (volume/intensity/
 * energy/rir per session) — distinct from the weight-log history in personas.ts.
 * These feed periodization (recentSessions) + readiness/recovery signals.
 *
 * @param {() => number} rng
 * @param {number} days
 * @param {{energyBias?: string, injuryDaysAgo?: number|null, volumeMul?: number}} opts
 */
function genRecentSessions(rng, days, opts = {}) {
  const { energyBias = null, injuryDaysAgo = null, volumeMul = 1 } = opts;
  const sessions = [];
  const sessionCount = Math.min(days, Math.round(days / 2) + (days > 0 ? 1 : 0));
  const start = new Date('2026-01-01T00:00:00Z').getTime();
  for (let i = 0; i < sessionCount; i++) {
    const date = new Date(start + i * 2 * 86400000).toISOString().slice(0, 10);
    const volume = +(10 + rng() * 8).toFixed(0) * volumeMul;
    const intensity = +(0.70 + rng() * 0.18).toFixed(2);
    const energy = energyBias || pick(rng, ENERGY);
    const rir = 1 + Math.floor(rng() * 3); // 1..3
    const weekIdx = (i % 4) + 1;
    const s = { date, volume, intensity, energy, rir, weekIdx };
    sessions.push(s);
  }
  // Inject an injury entry when requested (recent → blocks Maria advance + extension).
  if (injuryDaysAgo != null && sessions.length > 0) {
    sessions[0] = { ...sessions[0], injury: true, daysAgo: injuryDaysAgo };
  }
  return sessions;
}

/**
 * Generate weight-delta observations for Bayesian Nutrition (meta.observations).
 * kcalDaily intentionally spans below 1200 sometimes so the kcal-floor invariant
 * is exercised end-to-end (filterKcalFloorObservations excludes < 1200).
 *
 * @param {() => number} rng
 * @param {number} n
 * @param {{kcalBase?: number, allowSubFloor?: boolean}} opts
 */
function genObservations(rng, n, opts = {}) {
  const { kcalBase = 2200, allowSubFloor = false } = opts;
  const obs = [];
  for (let i = 0; i < n; i++) {
    const weightDelta = +((rng() - 0.5) * 0.6).toFixed(3);
    let kcalDaily = Math.round(kcalBase + (rng() - 0.5) * 600);
    if (allowSubFloor && rng() < 0.15) kcalDaily = Math.round(800 + rng() * 350); // sub-1200 spike
    obs.push({ weightDelta, kcalDaily });
  }
  return obs;
}

/**
 * Build a single scenario (deterministic from seed). Returns
 * `{ id, archetype, params, userState }`. `userState` → buildEngineContext().
 *
 * @param {number} seed
 * @param {{archetype?: string}} [forced] - pin archetype (else seed-derived)
 */
export function generateScenario(seed, forced = {}) {
  const rng = mulberry32(seed);
  const archKey = forced.archetype || pick(rng, ['gigel', 'marius', 'maria']);
  const arch = ARCHETYPES[archKey];

  const goal = pick(rng, GOALS);
  const energyEmoji = pick(rng, ENERGY);
  const weeksElapsed = pick(rng, WEEKS_ELAPSED);
  const injuryDaysAgo = rng() < 0.18 ? Math.floor(rng() * 50) : null; // ~18% have injury
  const allowSubFloor = rng() < 0.3;

  const recentSessions = genRecentSessions(rng, arch.historyDays, {
    energyBias: rng() < 0.4 ? energyEmoji : null,
    injuryDaysAgo,
    volumeMul: 1,
  });

  const obsCount = arch.historyDays === 0 ? 0 : Math.min(arch.historyDays, 20);
  const observations = genObservations(rng, obsCount, {
    kcalBase: arch.id === 'maria' ? 1700 : arch.id === 'marius' ? 2400 : 2000,
    allowSubFloor,
  });

  const recentObservedWeights = observations.map((o, i) => +(arch.user.kg + i * (o.weightDelta || 0)).toFixed(2));

  // Lagging-group target for Specialization. The weaknessDetector resolves a
  // target from exercise-name logs (ex/w/reps via Brzycki 1RM + resolveGroup
  // taxonomy) — too brittle to fabricate faithfully here. Instead use the
  // engine's documented meta.userOverrideWeakGroup (F4 user-agency target),
  // which deterministically supplies a target so the activation path is
  // exercised. Proposal acceptance toggled to reach ACTIVE vs PROPOSAL_PENDING.
  const laggingGroup = pick(rng, ['piept', 'spate', 'umeri', 'biceps']);
  const proposalAccepted = rng() < 0.5;

  // goalPhase mirror for engines that read meta.goalPhase (specialization gate).
  // CUT goal -> CUT phase (disables spec); bulk/hipertrofie -> BULK; else MAINTAIN.
  const goalPhase = goal === 'recompozitie' ? 'RECOMP'
    : (goal === 'hipertrofie' || goal === 'forta') ? 'BULK'
    : (goal === 'sanatate' || goal === 'longevitate') ? 'MAINTAIN' : 'CUT';

  const userState = {
    user: {
      ...arch.user,
      goal,
      energyEmoji,
    },
    recentSessions,
    weights: arch.id === 'gigel' ? {} : { squat: 100, bench: 70, deadlift: 130 },
    profileTier: arch.profileTier,
    flags: {},
    meta: {
      weeksElapsed,
      emoji: energyEmoji,
      observations,
      recentObservedWeights,
      // demographic prior so Bayesian has a prior source (richer posterior).
      demographicMu: 0,
      demographicSigma: 0.5,
      // Specialization engine reads persona/goalPhase/target from meta (NOT user).
      persona: arch.user.persona,
      goalPhase,
      userOverrideWeakGroup: laggingGroup,
      userProposalAccepted: proposalAccepted,
      // Pain signal when archetype has a recent injury (Maria knee etc.).
      painButtonActive: injuryDaysAgo != null && injuryDaysAgo <= 14,
      painAffectedGroups: injuryDaysAgo != null && injuryDaysAgo <= 14 ? (arch.user.joints || []) : [],
    },
  };

  return {
    id: `s${seed}-${arch.id}`,
    archetype: arch.id,
    params: { goal, energyEmoji, weeksElapsed, injuryDaysAgo, allowSubFloor, historyDays: arch.historyDays },
    userState,
  };
}

/**
 * Generate N scenarios with stratified, deterministic seeds. Stratification:
 * cycle through the 3 archetypes so every batch covers all personas evenly
 * (anti-skew — a pure random archetype pick can starve maria at small N).
 *
 * @param {number} count
 * @param {{baseSeed?: number}} [opts]
 * @returns {Array<ReturnType<typeof generateScenario>>}
 */
export function generateScenarios(count, opts = {}) {
  const { baseSeed = 1 } = opts;
  const archKeys = ['gigel', 'marius', 'maria'];
  const out = [];
  for (let i = 0; i < count; i++) {
    const archetype = archKeys[i % archKeys.length];
    out.push(generateScenario(baseSeed + i, { archetype }));
  }
  return out;
}

/**
 * Curated edge-case scenarios that deterministically hit specific decision
 * branches (week-4 deload, sub-floor kcal, injury, cold-start, specialization
 * gate). Used as a guaranteed-coverage seed set + oracle proof sample.
 */
export function edgeScenarios() {
  const make = (id, archetype, metaPatch, userPatch) => {
    const base = generateScenario(7000 + id.length, { archetype });
    return {
      ...base,
      id: `edge-${id}`,
      params: { ...base.params, edge: id },
      userState: {
        ...base.userState,
        user: { ...base.userState.user, ...(userPatch || {}) },
        meta: { ...base.userState.meta, ...(metaPatch || {}) },
      },
    };
  };
  return [
    // Deload week-4 must trigger SCHEDULED_LINEAR regardless of persona.
    make('deload-week4-marius', 'marius', { weeksElapsed: 3 }),
    make('deload-week4-maria', 'maria', { weeksElapsed: 7 }),
    make('deload-week4-gigel', 'gigel', { weeksElapsed: 11 }),
    // Non-deload baseline weeks for monotonicity contrast.
    make('load-week1-marius', 'marius', { weeksElapsed: 0 }),
    // Cold-start novice — minimal signal.
    make('coldstart-gigel', 'gigel', { weeksElapsed: 0, observations: [] }, { goal: 'hipertrofie' }),
    // Sub-floor kcal observations — kcal-floor filter must exclude < 1200.
    make('subfloor-kcal-maria', 'maria', {
      weeksElapsed: 1,
      observations: [
        { weightDelta: -0.1, kcalDaily: 900 },
        { weightDelta: -0.2, kcalDaily: 1100 },
        { weightDelta: 0.0, kcalDaily: 1300 },
      ],
    }),
    // Red energy distress — readiness gating toward rest/deload.
    make('red-energy-marius', 'marius', { weeksElapsed: 1, emoji: 'red' }, { energyEmoji: 'red' }),
    // Specialization gate: Marius advanced + bulk → eligible path.
    make('spec-gate-marius', 'marius', { weeksElapsed: 1 }, { goal: 'hipertrofie' }),
    // Maria + knee injury recent → recovery/advance-gate block.
    make('injury-maria', 'maria', { weeksElapsed: 1 }),
  ];
}
