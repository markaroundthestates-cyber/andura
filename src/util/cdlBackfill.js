// ══ CDL BACKFILL — Convert historical logs to synthetic CDL entries ═════════
// Reads existing `logs` from localStorage, groups by session timestamp,
// reconstructs context retrospectively, generates synthetic CDL entries.
// Status: ADR 011 Backfill section
//
// IMPORTANT: synthetic entries weighted 0.5× in adherence/pattern calc (per ADR).
// Daniel must manually review 10 random samples (GATE B) before unblocking 30.4.

import { DB, todTs } from '../db.js';
import { EXERCISE_MUSCLES } from '../engine/muscleMap.js';

const CDL_KEY = 'coach-decisions';

// Muscle group → session type category mapping
const PUSH_MUSCLES = new Set([
  'chest_upper', 'chest_mid', 'chest_lower',
  'delt_front', 'delt_mid',
  'tri_long', 'tri_lateral', 'tri_medial',
]);
const PULL_MUSCLES = new Set([
  'lat', 'mid_trap', 'rear_delt_trap', 'delt_rear',
  'bi_long', 'bi_short',
]);
const LEGS_MUSCLES = new Set([
  'quad', 'hamstring', 'glute', 'calf', 'lower_back',
]);

/** @typedef {{ ts?: number, session?: number|string, ex?: string, w?: number, reps?: number, [k: string]: unknown }} CdlLogEntry */
/** @typedef {{ synthetic?: boolean, [k: string]: unknown }} CdlEntry */

/**
 * @param {string} name
 * @returns {'PUSH'|'PULL'|'LEGS'|null}
 */
function getExerciseCategory(name) {
  const entry = /** @type {Record<string, { primary?: string[] }>} */ (EXERCISE_MUSCLES)[name];
  if (!entry || !entry.primary) return null;
  for (const muscle of entry.primary) {
    if (PUSH_MUSCLES.has(muscle)) return 'PUSH';
    if (PULL_MUSCLES.has(muscle)) return 'PULL';
    if (LEGS_MUSCLES.has(muscle)) return 'LEGS';
  }
  return null;
}

function rand4() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Reverse-infer sessionType from exercise muscle groups.
 * @param {string[]} exercises
 * @returns {'PUSH'|'PULL'|'LEGS'|'MIXED'|'UNKNOWN'}
 */
export function inferSessionType(exercises) {
  if (!exercises || exercises.length === 0) return 'UNKNOWN';

  const cats = { PUSH: 0, PULL: 0, LEGS: 0 };
  let known = 0;

  for (const ex of exercises) {
    const cat = getExerciseCategory(ex);
    if (cat) { cats[cat]++; known++; }
  }

  if (known === 0) return 'UNKNOWN';
  // Require ≥50% of exercises to have known mappings for a reliable determination
  if (known / exercises.length < 0.5) return 'MIXED';

  const dominant = Object.entries(cats).find(([, count]) => count / known > 0.7);
  return dominant ? /** @type {'PUSH'|'PULL'|'LEGS'} */ (dominant[0]) : 'MIXED';
}

/**
 * Reconstruct context retrospectively for a session timestamp.
 * Fields not reconstructible → null, partial: true.
 * @param {number} sessionTs
 * @param {CdlLogEntry[]} allLogs
 * @returns {object}
 */
export function reconstructContext(sessionTs, allLogs) {
  const priorSessionTs = new Set(
    allLogs
      .filter(l => (l.ts ?? 0) < sessionTs && l.session)
      .map(l => l.session)
  );
  const sessionsCount = priorSessionTs.size;

  // Simplified session-count-only calibration thresholds (backfill heuristic).
  // Aligned post ADR 009 §AMENDMENT D1 (6-tier canonical) with detectCalibrationLevel
  // session bands: <3=INITIAL→COLD_START boundary, 3-5=INITIAL, 6-11=DEVELOPING,
  // 12-39=PERSONALIZING, 40+=PERSONALIZED.
  let calibrationLevel;
  if (sessionsCount === 0) calibrationLevel = 'COLD_START';
  else if (sessionsCount < 6) calibrationLevel = 'INITIAL';
  else if (sessionsCount < 12) calibrationLevel = 'DEVELOPING';
  else if (sessionsCount < 40) calibrationLevel = 'PERSONALIZING';
  else calibrationLevel = 'PERSONALIZED';

  const sortedPriorTs = /** @type {number[]} */ ([...priorSessionTs].map(Number).sort((a, b) => a - b));
  const lastSessionTs = sortedPriorTs.length > 0
    ? sortedPriorTs[sortedPriorTs.length - 1] ?? null
    : null;

  const daysSinceLastSession = typeof lastSessionTs === 'number'
    ? (sessionTs - lastSessionTs) / 86400000
    : null;

  let lastSessionType = null;
  if (typeof lastSessionTs === 'number') {
    const lastLogs = allLogs.filter(l => l.session === lastSessionTs);
    const lastExercises = [...new Set(lastLogs.map(l => l.ex).filter(/** @returns {x is string} */ (x) => Boolean(x)))];
    lastSessionType = lastExercises.length > 0 ? inferSessionType(lastExercises) : null;
  }

  return {
    calibrationLevel,
    readinessScore: null,
    fatigueIndex: null,
    daysSinceLastSession,
    lastSessionType,
    isInCut: null,
    weakGroups: [],
    stagnationWeeks: 0,
    predictionToday: null,
    partial: true,
  };
}

/**
 * Synthesize outcome from session logs. Synthetic = assumes executed match.
 * @param {CdlLogEntry[]} sessionLogs
 * @returns {object}
 */
export function synthesizeOutcome(sessionLogs) {
  const exercises = [...new Set(sessionLogs.map(l => l.ex).filter(/** @returns {x is string} */ (x) => Boolean(x)))];
  const actualSets = sessionLogs.length;
  const timestamps = sessionLogs.map(l => l.ts ?? 0).filter(t => t > 0);
  const completedAt = timestamps.length > 0 ? Math.max(...timestamps) : 0;
  const minTs = timestamps.length > 0 ? Math.min(...timestamps) : 0;
  const actualDurationMins = (timestamps.length >= 2 && completedAt > minTs)
    ? Math.round((completedAt - minTs) / 60000)
    : null;

  return {
    executed: true,
    completedAt,
    actualSessionType: inferSessionType(exercises),
    actualExercises: exercises,
    actualSets,
    actualDurationMins,
    proposedSets: actualSets,
    completedExercises: exercises.length,
    totalProposedExercises: exercises.length,
    deviation: false,
    matchScore: 1.0,
    earlyStop: false,
    rating: null,
  };
}

/**
 * Main backfill entry point. Iterates sessions grouped by `session` ts,
 * generates synthetic CDL entries.
 * @param {{ dryRun?: boolean, force?: boolean }} [opts]
 * @returns {{ entriesCreated: number, errors: unknown[], skipped: unknown[] }}
 */
export function runBackfill({ dryRun = false, force = false } = {}) {
  /** @type {CdlLogEntry[]} */
  const logs = DB.get('logs') ?? [];
  /** @type {CdlEntry[]} */
  let existingEntries = DB.get(CDL_KEY) ?? [];
  /** @type {unknown[]} */
  const skipped = [];
  /** @type {unknown[]} */
  const errors = [];
  let entriesCreated = 0;

  const syntheticExist = existingEntries.some(e => e.synthetic === true);
  if (syntheticExist && !force) {
    throw new Error('Backfill already executed. Use { force: true } to re-run');
  }
  if (force) {
    existingEntries = existingEntries.filter(e => e.synthetic !== true);
  }

  /** @type {Record<string, CdlLogEntry[]>} */
  const bySession = {};
  for (const log of logs) {
    if (!log.session) {
      skipped.push({ sessionTs: null, reason: 'missing ts', sessionData: log });
      continue;
    }
    if (!log.ex || (log.w === undefined && log.reps === undefined)) {
      skipped.push({ sessionTs: log.session, reason: 'invalid format', sessionData: log });
      continue;
    }
    const skey = String(log.session);
    bySession[skey] = bySession[skey] || [];
    bySession[skey].push(log);
  }

  const sessionTsList = Object.keys(bySession).map(Number).sort((a, b) => a - b);

  for (const ts of sessionTsList) {
    const sessionLogs = bySession[String(ts)] ?? [];
    const exercises = [...new Set(sessionLogs.map(l => l.ex).filter(/** @returns {x is string} */ (x) => Boolean(x)))];

    if (exercises.length === 0) {
      skipped.push({ sessionTs: ts, reason: 'no exercises' });
      continue;
    }

    const sessionType = inferSessionType(exercises);
    if (sessionType === 'UNKNOWN') {
      skipped.push({ sessionTs: ts, reason: 'unknown muscle group', sessionData: { exercises } });
      continue;
    }

    try {
      const context = reconstructContext(ts, logs);
      const outcome = synthesizeOutcome(sessionLogs);
      const sessionDate = todTs(ts);

      const syntheticEntry = {
        id: `cdl_synth_${ts}_${rand4()}`,
        ts,
        date: sessionDate,
        synthetic: true,
        superseded: false,
        supersedes: null,
        context,
        proposed: {
          sessionType,
          rationale: { winnerId: 'SYNTHETIC_BACKFILL', winnerPriority: null, overridden: [] },
          exercises,
          proposedSets: sessionLogs.length,
          volumeMultiplier: 1.0,
          notes: '',
        },
        outcome,
      };

      if (!dryRun) existingEntries.push(syntheticEntry);
      entriesCreated++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      errors.push({ sessionTs: ts, error: msg, stack });
    }
  }

  if (!dryRun) DB.set(CDL_KEY, existingEntries);

  return { entriesCreated, errors, skipped };
}

/**
 * Return random sample of synthetic entries for Daniel manual review.
 * @param {number} [count=10]
 * @returns {CdlEntry[]}
 */
export function getValidationSamples(count = 10) {
  /** @type {CdlEntry[]} */
  const all = DB.get(CDL_KEY) ?? [];
  const synthetic = all.filter(e => e.synthetic === true);
  const arr = [...synthetic];
  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    const swap = arr[j];
    if (tmp !== undefined && swap !== undefined) {
      arr[i] = swap;
      arr[j] = tmp;
    }
  }
  return arr.slice(0, count);
}

if (typeof window !== 'undefined') {
  window.runBackfill = runBackfill;
  window.getValidationSamples = getValidationSamples;
}
