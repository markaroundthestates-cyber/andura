/**
 * CDL test fixtures — factory functions for varied entries.
 * Use in tests via composition, NOT raw imports of pre-built arrays.
 *
 * Schema: per ADR 011 (incl. extension 2026-04-26 — autoAggression + rest_marked).
 * outcome.setsRPE: forward-looking field for AA-DETECTION _computeCompositeFatigue signal.
 *
 * Reference: ADR 011 (schema), ADR 013 (AA Detection signals + windows)
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Return YYYY-MM-DD string for N days before today.
 */
export function dateOffset(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

/**
 * Return Unix timestamp for N days before today at given hour (local time).
 */
export function tsOffset(daysAgo, hour = 12) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function dateToTs(dateStr, hour = 12) {
  const [y, m, day] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, day, hour, 0, 0, 0).getTime();
}

let _counter = 0;
function makeId(date) {
  _counter++;
  return `cd_${date}_1200_fx${String(_counter).padStart(3, '0')}`;
}

function defaultContext(overrides = {}) {
  return {
    calibrationLevel: 'PERSONALIZING',
    readinessScore: 75,
    fatigueIndex: 0.3,
    daysSinceLastSession: 2,
    lastSessionType: 'PULL',
    isInCut: false,
    weakGroups: [],
    stagnationWeeks: 0,
    predictionToday: { isHighRisk: false, probability: 0.1 },
    partial: false,
    kcal_target: 2200,
    ...overrides,
  };
}

function defaultProposed(sessionType, exercises, proposedSets, overrides = {}) {
  return {
    sessionType,
    rationale: { winnerId: 'PUSH_ROTATION', winnerPriority: 80, overridden: [] },
    exercises: [...exercises],
    proposedSets,
    volumeMultiplier: 1.0,
    notes: null,
    ...overrides,
  };
}

const PUSH_EXERCISES = ['Incline DB Press', 'Pec Deck', 'DB Shoulder Press', 'Triceps Pushdown'];
const PULL_EXERCISES = ['Lat Pulldown', 'Cable Row', 'Face Pull', 'Bicep Curl'];
const LEGS_EXERCISES = ['Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Curl'];

function exercisesForType(sessionType) {
  if (sessionType === 'PUSH') return PUSH_EXERCISES;
  if (sessionType === 'PULL') return PULL_EXERCISES;
  if (sessionType === 'LEGS') return LEGS_EXERCISES;
  return PUSH_EXERCISES;
}

// ── Factories ─────────────────────────────────────────────────────────────────

/**
 * Real workout entry — executed=true, no deviation.
 * @param {object} opts
 * @param {string} [opts.date]
 * @param {string} [opts.sessionType]
 * @param {string[]} [opts.exercises]
 * @param {number} [opts.proposedSets]
 * @param {number} [opts.actualSets]
 * @param {string} [opts.calibrationLevel]
 * @param {number} [opts.readinessScore]
 * @param {boolean} [opts.isInCut]
 * @param {string[]} [opts.weakGroups]
 * @param {number[]} [opts.setsRPE] - per-set RPE array (forward-looking for AA-DETECTION)
 * @param {string} [opts.rating] - session rating
 * @param {boolean} [opts.earlyStop]
 * @param {number} [opts.kcal_target]
 */
export function realWorkoutEntry(opts = {}) {
  const {
    date = dateOffset(7),
    sessionType = 'PUSH',
    exercises,
    proposedSets = 16,
    actualSets = 16,
    calibrationLevel = 'PERSONALIZING',
    readinessScore = 75,
    isInCut = false,
    weakGroups = [],
    setsRPE = [],
    rating = 'normal',
    earlyStop = false,
    kcal_target = 2200,
  } = opts;

  const exList = exercises ?? exercisesForType(sessionType);
  const ts = dateToTs(date, 9);

  return {
    id: makeId(date),
    ts,
    date,
    synthetic: false,
    superseded: false,
    supersedes: null,
    context: defaultContext({ calibrationLevel, readinessScore, isInCut, weakGroups, kcal_target }),
    proposed: defaultProposed(sessionType, exList, proposedSets),
    outcome: {
      executed: earlyStop ? 'partial' : true,
      deviation: false,
      actualSessionType: sessionType,
      matchScore: actualSets >= proposedSets * 0.8 ? 0.9 : 0.6,
      completedExercises: exList.length,
      totalProposedExercises: exList.length,
      actualSets,
      proposedSets,
      actualExercises: [...exList],
      actualDurationMins: 45,
      earlyStop,
      earlyStopReason: earlyStop ? 'time' : null,
      rating,
      completedAt: dateToTs(date, 10),
      autoAggression: null,
      rest_marked: null,
      setsRPE,
    },
  };
}

/**
 * Synthetic backfill entry — synthetic=true, all extension fields null.
 * @param {object} opts
 * @param {string} [opts.date]
 * @param {string} [opts.sessionType]
 * @param {number} [opts.actualSets]
 */
export function syntheticEntry(opts = {}) {
  const {
    date = dateOffset(30),
    sessionType = 'PUSH',
    actualSets = 14,
  } = opts;

  const exList = exercisesForType(sessionType);
  const ts = dateToTs(date, 9);

  return {
    id: makeId(date),
    ts,
    date,
    synthetic: true,
    superseded: false,
    supersedes: null,
    context: {
      ...defaultContext(),
      partial: true,
      readinessScore: null,
      weakGroups: null,
    },
    proposed: {
      sessionType,
      rationale: { winnerId: 'SYNTHETIC_BACKFILL', winnerPriority: null, overridden: [] },
      exercises: [...exList],
      proposedSets: actualSets,
      volumeMultiplier: 1.0,
      notes: null,
    },
    outcome: {
      executed: true,
      deviation: false,
      actualSessionType: sessionType,
      matchScore: 0.9,
      completedExercises: exList.length,
      totalProposedExercises: exList.length,
      actualSets,
      proposedSets: actualSets,
      actualExercises: [...exList],
      actualDurationMins: null,
      earlyStop: false,
      earlyStopReason: null,
      rating: null,
      completedAt: dateToTs(date, 10),
      autoAggression: null,
      rest_marked: null,
      setsRPE: [],
    },
  };
}

/**
 * Skip entry — executed=false, rest_marked 3-state.
 * @param {object} opts
 * @param {string} [opts.date]
 * @param {string} [opts.sessionType]
 * @param {null|true|false} [opts.restMarkedValue] - null=no prompt, true=rest legitim, false=explicit skip
 */
export function skipEntry(opts = {}) {
  const {
    date = dateOffset(3),
    sessionType = 'PUSH',
    restMarkedValue = null,
  } = opts;

  const exList = exercisesForType(sessionType);
  const ts = dateToTs(date, 9);

  return {
    id: makeId(date),
    ts,
    date,
    synthetic: false,
    superseded: false,
    supersedes: null,
    context: defaultContext(),
    proposed: defaultProposed(sessionType, exList, 16),
    outcome: {
      executed: false,
      deviation: false,
      actualSessionType: null,
      matchScore: null,
      completedExercises: 0,
      totalProposedExercises: exList.length,
      actualSets: 0,
      proposedSets: 16,
      actualExercises: [],
      actualDurationMins: null,
      earlyStop: false,
      earlyStopReason: null,
      rating: null,
      completedAt: null,
      autoAggression: null,
      rest_marked: restMarkedValue,
      setsRPE: [],
    },
  };
}

/**
 * Deviation entry — executed=true, deviation=true, actualVolume > proposedVolume.
 * Used to test volume creep signal (ADR 013 signal #1).
 * @param {object} opts
 * @param {string} [opts.date]
 * @param {string} [opts.sessionType] - proposed session type
 * @param {number} [opts.proposedSets]
 * @param {number} [opts.actualSets] - should be > proposedSets for volume creep
 * @param {string[]} [opts.addedExercises] - exercises added beyond proposed
 * @param {number[]} [opts.setsRPE]
 */
export function deviationEntry(opts = {}) {
  const {
    date = dateOffset(5),
    sessionType = 'PUSH',
    proposedSets = 16,
    actualSets = 20,
    addedExercises = ['Cable Fly'],
    setsRPE = [],
  } = opts;

  const proposedEx = exercisesForType(sessionType);
  const actualEx = [...proposedEx, ...addedExercises];
  const ts = dateToTs(date, 9);

  return {
    id: makeId(date),
    ts,
    date,
    synthetic: false,
    superseded: false,
    supersedes: null,
    context: defaultContext(),
    proposed: defaultProposed(sessionType, proposedEx, proposedSets),
    outcome: {
      executed: true,
      deviation: true,
      actualSessionType: sessionType,
      matchScore: null,
      completedExercises: actualEx.length,
      totalProposedExercises: proposedEx.length,
      actualSets,
      proposedSets,
      actualExercises: actualEx,
      actualDurationMins: 60,
      earlyStop: false,
      earlyStopReason: null,
      rating: 'normal',
      completedAt: dateToTs(date, 10),
      autoAggression: null,
      rest_marked: null,
      setsRPE,
    },
  };
}

/**
 * Entry with autoAggression populated.
 * @param {object} opts
 * @param {string} [opts.date]
 * @param {'none'|'LOW'|'MED'|'HIGH'} [opts.tier]
 * @param {string[]} [opts.signals]
 * @param {boolean} [opts.escalating]
 * @param {boolean} [opts.amplified]
 * @param {string|null} [opts.amplifierReason]
 */
export function entryWithAA(opts = {}) {
  const {
    date = dateOffset(2),
    tier = 'LOW',
    signals = ['volume_creep'],
    escalating = false,
    amplified = false,
    amplifierReason = null,
  } = opts;

  const base = realWorkoutEntry({ date });
  return {
    ...base,
    outcome: {
      ...base.outcome,
      autoAggression: {
        tier,
        signals,
        escalating,
        amplified,
        amplifierReason,
      },
    },
  };
}

// ── Pre-built scenarios ───────────────────────────────────────────────────────

/**
 * Scenario: 3+ consecutive volume creep sessions within 21 days (signal #1 trigger).
 * Each entry has deviation=true AND actualSets > proposedSets (added exercises).
 * @param {object} opts
 * @param {number} [opts.count] - number of entries (min 3)
 * @param {string[]} [opts.sessionTypeRotation] - cycle through these types
 * @param {string} [opts.baseDate] - YYYY-MM-DD of most recent entry; defaults to 7 days ago
 * @param {number} [opts.spreadDays] - days between entries (default 3, keeps within 21d for count=3)
 * @returns {object[]}
 */
export function scenarioVolumeCreep(opts = {}) {
  const {
    count = 3,
    sessionTypeRotation = ['PUSH', 'PULL', 'LEGS'],
    baseDate,
    spreadDays = 3,
  } = opts;

  const endDate = baseDate ? new Date(baseDate) : new Date(dateOffset(5));
  const entries = [];

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i * spreadDays);
    const date = d.toISOString().slice(0, 10);
    const sessionType = sessionTypeRotation[i % sessionTypeRotation.length];

    entries.push(deviationEntry({
      date,
      sessionType,
      proposedSets: 16,
      actualSets: 20,
      addedExercises: ['Extra Set Exercise'],
    }));
  }

  return entries;
}

/**
 * Scenario: 3+ ISO weeks recovery debt (signal #5 trigger, Mon-Sun weeks).
 * Each week has < 2 rest_marked=true days.
 * @param {object} opts
 * @param {number} [opts.weekCount] - consecutive ISO weeks (default 3)
 * @param {number} [opts.restDaysPerWeek] - rest_marked=true days per week (default 0 — max debt)
 * @param {number} [opts.workoutsPerWeek] - workout entries per week (default 5)
 * @returns {object[]}
 */
export function scenarioRecoveryDebt(opts = {}) {
  const {
    weekCount = 3,
    restDaysPerWeek = 0,
    workoutsPerWeek = 5,
  } = opts;

  const entries = [];
  const today = new Date();

  // Start from (weekCount * 7) days ago, build forward week by week
  for (let w = weekCount - 1; w >= 0; w--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (w + 1) * 7);

    // Align to Monday of that ISO week
    const dow = weekStart.getDay(); // 0=Sun..6=Sat
    const daysToMon = dow === 0 ? -6 : 1 - dow;
    weekStart.setDate(weekStart.getDate() + daysToMon);

    // Build 7 days for this week
    const sessionTypes = ['PUSH', 'PULL', 'LEGS', 'PUSH', 'PULL', 'LEGS', 'PUSH'];
    let workoutsAdded = 0;
    let restAdded = 0;

    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + d);
      const date = day.toISOString().slice(0, 10);

      if (restAdded < restDaysPerWeek) {
        // Mark as rest legitim
        entries.push(skipEntry({ date, sessionType: sessionTypes[d], restMarkedValue: true }));
        restAdded++;
      } else if (workoutsAdded < workoutsPerWeek) {
        entries.push(realWorkoutEntry({ date, sessionType: sessionTypes[d] }));
        workoutsAdded++;
      } else {
        // Remaining days: explicit skip (NOT rest — contributes to debt)
        entries.push(skipEntry({ date, sessionType: sessionTypes[d], restMarkedValue: false }));
      }
    }
  }

  return entries;
}

/**
 * Scenario: composite fatigue — ≥50% Hard/Very Hard sets per session (signal #4 input).
 * Returns entries where each session has setsRPE with ≥50% at RPE 9-10.
 * @param {object} opts
 * @param {number} [opts.count] - number of sessions (default 3, within 7 days)
 * @param {number[]} [opts.setsRPE] - custom RPE array; default is majority Hard/Very Hard
 * @param {number} [opts.spreadDays] - days between entries (default 2)
 * @param {boolean} [opts.includeEarlyStop] - if true, one entry has earlyStop=true (negates signal)
 * @returns {object[]}
 */
export function scenarioCompositeFatigue(opts = {}) {
  const {
    count = 3,
    setsRPE = [9, 10, 9, 9, 8],   // 4/5 = 80% Hard/Very Hard
    spreadDays = 2,
    includeEarlyStop = false,
  } = opts;

  const entries = [];
  const sessionTypes = ['PUSH', 'PULL', 'LEGS'];

  for (let i = 0; i < count; i++) {
    const daysAgo = (count - 1 - i) * spreadDays + 1;
    const date = dateOffset(daysAgo);
    const sessionType = sessionTypes[i % sessionTypes.length];
    const isLast = i === count - 1;

    entries.push(realWorkoutEntry({
      date,
      sessionType,
      proposedSets: setsRPE.length,
      actualSets: setsRPE.length,
      setsRPE: [...setsRPE],
      earlyStop: includeEarlyStop && isLast,
    }));
  }

  return entries;
}

/**
 * Scenario: hyperfocus pattern (8h+ in app, 4+ days/week).
 * Returns { cdlEntries, hyperfocusData } — CDL entries as supporting context
 * plus hyperfocusData object for _detectHyperfocusAmplifier.
 * @param {object} opts
 * @param {number} [opts.hoursInApp7d] - total hours in app over 7 days (default 60)
 * @param {number} [opts.daysWithHyperfocus] - days with 8h+ activity (default 5)
 * @param {number} [opts.entryCount] - supporting CDL entries to include (default 5)
 * @returns {{ cdlEntries: object[], hyperfocusData: { hoursInApp7d: number, daysWithHyperfocus: number } }}
 */
export function scenarioHyperfocus(opts = {}) {
  const {
    hoursInApp7d = 60,
    daysWithHyperfocus = 5,
    entryCount = 5,
  } = opts;

  const cdlEntries = [];
  const sessionTypes = ['PUSH', 'PULL', 'LEGS', 'PUSH', 'PULL'];

  for (let i = 0; i < entryCount; i++) {
    const daysAgo = i + 1;
    const date = dateOffset(daysAgo);
    cdlEntries.push(realWorkoutEntry({
      date,
      sessionType: sessionTypes[i % sessionTypes.length],
      setsRPE: [9, 10, 9, 8, 9],
    }));
  }

  return {
    cdlEntries,
    hyperfocusData: { hoursInApp7d, daysWithHyperfocus },
  };
}

/**
 * Scenario: clean profile — no AA signals, healthy pattern.
 * All workouts executed, normal RPE, proper rest days.
 * @param {object} opts
 * @param {number} [opts.count] - number of entries (default 10, ~2 weeks)
 * @param {number} [opts.spreadDays] - days between sessions (default 2)
 * @returns {object[]}
 */
export function scenarioClean(opts = {}) {
  const {
    count = 10,
    spreadDays = 2,
  } = opts;

  const entries = [];
  const sessionTypes = ['PUSH', 'PULL', 'LEGS', 'PUSH', 'PULL'];

  for (let i = 0; i < count; i++) {
    const daysAgo = (count - 1 - i) * spreadDays + 1;
    const date = dateOffset(daysAgo);
    const sessionType = sessionTypes[i % sessionTypes.length];

    entries.push(realWorkoutEntry({
      date,
      sessionType,
      proposedSets: 16,
      actualSets: 15,
      setsRPE: [8, 7, 8, 8, 7],   // OK range — no Hard/Very Hard majority
      rating: 'normal',
      earlyStop: false,
    }));
  }

  // Intersperse rest days (rest_marked=true) — every ~5 sessions add 1 rest day
  const withRest = [];
  let restInserted = 0;
  for (let i = 0; i < entries.length; i++) {
    withRest.push(entries[i]);
    if ((i + 1) % 4 === 0 && restInserted < Math.floor(count / 4)) {
      const prevDate = new Date(entries[i].date);
      prevDate.setDate(prevDate.getDate() + 1);
      const restDate = prevDate.toISOString().slice(0, 10);
      withRest.push(skipEntry({ date: restDate, sessionType: 'PUSH', restMarkedValue: true }));
      restInserted++;
    }
  }

  return withRest;
}
