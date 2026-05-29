import { MS_PER_DAY } from '../constants.js';
import { now as clockNow } from './clock.js';

// §07.198-204: nowMs params below DEFAULT to the real clock (clock.js) so
// production is byte-identical to the prior inline Date.now(). Injection exists
// solely to pin the staleness / inactivity-decay / recalibration-due branches
// in tests.
// ══ CALIBRATION TIERS — User maturity levels for engine feature gating ═══════
// 6 tiers from cold start (day 0) to optimized (180+ days).
// Engines only run when enabled for the current tier — prevents false positives
// and unnecessary computation for new users.
//
// ADR 009 §AMENDMENT 2026-04-30 (D1 RESOLVED): canonical 6-tier post-DEVELOPING
// insertion. DEVELOPING (id 2) bridges INITIAL (early data) → PERSONALIZING
// (heavy user weight). Renumber: PERSONALIZING 2→3, PERSONALIZED 3→4,
// OPTIMIZED 4→5. Boundaries DEVELOPING: 14–28 days / 6–11 sessions
// (entry threshold = 14d AND 6 sess; exit at 28d AND 12 sess into PERSONALIZING).
// ADR 012: tier decays -1 per 60 days inactivity, floor at INITIAL.

export const CALIBRATION_LEVELS = {
  COLD_START: {
    id: 0,
    name: 'cold_start',
    displayName: 'Initializare',
    durationDays: 7,
    minSessions: 0,
    maxSessions: 2,
    userWeight: 0.0,
    generalWeight: 1.0,
    recalibrationFrequency: 'per_session',
    patternsEnabled: false,
    weakGroupEnabled: false,
    stagnationEnabled: false,
    predictionEnabled: false,
    bannerText: 'Invatam cum lucrezi · Recomandarile se personalizeaza dupa primele sesiuni',
    description: 'Guidelines bazate pe onboarding (beginner/intermediate/advanced, cut/bulk).',
  },

  INITIAL: {
    id: 1,
    name: 'initial',
    displayName: 'Calibrare initiala',
    durationDays: 14,
    minSessions: 3,
    maxSessions: 5,
    userWeight: 0.5,
    generalWeight: 0.5,
    recalibrationFrequency: 'daily',
    patternsEnabled: true,
    patternMinConfidence: 0.70,
    weakGroupEnabled: false,
    stagnationEnabled: false,
    predictionEnabled: false,
    bannerText: 'Invatam cum lucrezi · Datele se aduna cu fiecare sesiune',
    description: '50% user data + 50% population guideline. Pattern detection activ (high confidence only).',
  },

  DEVELOPING: {
    id: 2,
    name: 'developing',
    displayName: 'Dezvoltare activa',
    durationDays: 28,
    minSessions: 6,
    maxSessions: 11,
    userWeight: 0.65,
    generalWeight: 0.35,
    recalibrationFrequency: 'daily',
    patternsEnabled: true,
    patternMinConfidence: 0.65,
    weakGroupEnabled: false,
    stagnationEnabled: false,
    predictionEnabled: false,
    bannerText: 'Tiparele prind contur · Recomandarile folosesc datele tale',
    description: '65% user data + 35% general. Pattern detection activ (high confidence ≥65%). Bridge tier between INITIAL and PERSONALIZING per ADR 009 §AMENDMENT D1.',
  },

  PERSONALIZING: {
    id: 3,
    name: 'personalizing',
    displayName: 'Personalizare activa',
    durationDays: 90,
    minSessions: 12,
    maxSessions: 40,
    userWeight: 0.8,
    generalWeight: 0.2,
    recalibrationFrequency: 'weekly',
    patternsEnabled: true,
    patternMinConfidence: 0.60,
    weakGroupEnabled: true,
    stagnationEnabled: true,
    predictionEnabled: true,
    bannerText: 'Recomandarile sunt acum in mare parte personalizate · Continuam sa invatam',
    description: '80% user data + 20% general. Toate engines active cu threshold relaxat.',
  },

  PERSONALIZED: {
    id: 4,
    name: 'personalized',
    displayName: 'Personalizat',
    durationDays: 180,
    minSessions: 40,
    maxSessions: 80,
    userWeight: 1.0,
    generalWeight: 0.0,
    recalibrationFrequency: 'weekly',
    patternsEnabled: true,
    patternMinConfidence: 0.50,
    weakGroupEnabled: true,
    stagnationEnabled: true,
    predictionEnabled: true,
    responseProfileEnabled: true,
    bannerText: null,
    description: '100% user data. Rolling window ultimele 5-6 luni. Response Profile activ.',
  },

  OPTIMIZED: {
    id: 5,
    name: 'optimized',
    displayName: 'Optimizat',
    durationDays: Infinity,
    minSessions: 80,
    maxSessions: Infinity,
    userWeight: 1.0,
    generalWeight: 0.0,
    recalibrationFrequency: 'monthly_or_trigger',
    patternsEnabled: true,
    patternMinConfidence: 0.45,
    weakGroupEnabled: true,
    stagnationEnabled: true,
    predictionEnabled: true,
    responseProfileEnabled: true,
    rollingWindowMonths: 6,
    bannerText: null,
    description: 'Sistem optimizat. Rolling window 6 luni, recalibrare lunara + trigger events.',
  },
};

const TIER_ORDER = ['COLD_START', 'INITIAL', 'DEVELOPING', 'PERSONALIZING', 'PERSONALIZED', 'OPTIMIZED'];

/**
 * Apply inactivity decay: -1 tier per 60 inactive days, floor at INITIAL.
 * COLD_START is unaffected (separate cold-start path).
 *
 * @param {string} currentLevel
 * @param {number} daysSinceLastSession
 * @returns {string}
 */
export function _applyInactivityDecay(currentLevel, daysSinceLastSession) {
  if (currentLevel === 'COLD_START') return 'COLD_START';
  const decayLevels = Math.floor(daysSinceLastSession / 60);
  if (decayLevels === 0) return currentLevel;
  const currentIdx = TIER_ORDER.indexOf(currentLevel);
  if (currentIdx === -1) return currentLevel;
  const newIdx = Math.max(1, currentIdx - decayLevels); // 1 = INITIAL floor
  return TIER_ORDER[newIdx] ?? 'INITIAL';
}

/**
 * @typedef {{ session?: string|number, date?: string|number, ts?: number, baseline?: boolean, [k: string]: unknown }} CalibLog
 * @typedef {{ allLogs?: CalibLog[], allSessions?: unknown[], nowMs?: number, [k: string]: unknown }} CalibCtx
 *
 * Detect calibration level from log history.
 * Uses unique session count (by session ID or date) and first-session age.
 * Applies inactivity decay (ADR 012): -1 tier per 60 inactive days, floor INITIAL.
 *
 * @param {CalibCtx} ctx
 * @returns {(typeof CALIBRATION_LEVELS)[keyof typeof CALIBRATION_LEVELS]}
 */
export function detectCalibrationLevel(ctx) {
  /** @type {CalibLog[]} */
  const allLogs = ctx.allLogs ?? [];
  const nowMs = ctx.nowMs == null ? clockNow() : ctx.nowMs;

  // Count unique sessions — a session = unique session timestamp or workout date
  const sessionKeys = new Set();
  for (const log of allLogs) {
    const key = log.session ?? log.date;
    if (!key) continue;
    const s = String(key);
    // Normalize ISO timestamps to date part; keep arbitrary session IDs as-is
    sessionKeys.add(/^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : s);
  }
  const sessionsCount = ctx.allSessions?.length ?? sessionKeys.size;

  // First session date
  /** @type {Date[]} */
  const dates = allLogs
    .map(l => {
      const raw = l.date || l.ts;
      const d = raw ? new Date(raw) : null;
      return d && !isNaN(d.getTime()) ? d : null;
    })
    .filter(/** @returns {d is Date} */ (d) => Boolean(d));
  const firstDate = dates.length > 0
    ? new Date(Math.min(...dates.map(d => d.getTime())))
    : new Date(nowMs);
  const daysSinceFirst = (nowMs - firstDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceFirst < 7 || sessionsCount < 3)         return CALIBRATION_LEVELS.COLD_START;

  // Conservative routing per ADR 009 §AMENDMENT: stay in lower tier if EITHER
  // dimension below threshold (||). Transition out only when BOTH satisfied.
  let levelName;
  if (daysSinceFirst < 14 || sessionsCount < 6)        levelName = 'INITIAL';
  else if (daysSinceFirst < 28 || sessionsCount < 12)  levelName = 'DEVELOPING';
  else if (daysSinceFirst < 90 || sessionsCount < 40)  levelName = 'PERSONALIZING';
  else if (daysSinceFirst < 180 || sessionsCount < 80) levelName = 'PERSONALIZED';
  else                                                  levelName = 'OPTIMIZED';

  // ADR 012: apply inactivity decay using most-recent non-baseline log date
  // Uses already-computed `dates` array (handles both l.date and l.ts fields).
  /** @type {Date[]} */
  const nonBaselineDates = allLogs
    .filter(l => !l.baseline)
    .map(l => {
      const raw = l.date || l.ts;
      const d = raw ? new Date(raw) : null;
      return d && !isNaN(d.getTime()) ? d : null;
    })
    .filter(/** @returns {d is Date} */ (d) => Boolean(d));
  if (nonBaselineDates.length > 0) {
    const lastDate = new Date(Math.max(...nonBaselineDates.map(d => d.getTime())));
    const daysSince = Math.floor((nowMs - lastDate.getTime()) / MS_PER_DAY);
    levelName = _applyInactivityDecay(levelName, daysSince);
  }

  return /** @type {(typeof CALIBRATION_LEVELS)[keyof typeof CALIBRATION_LEVELS]} */ (
    (/** @type {Record<string, unknown>} */ (CALIBRATION_LEVELS))[levelName]
  );
}

/**
 * Whether a recalibration run is due based on tier frequency and last run timestamp.
 *
 * @param {{ recalibrationFrequency?: string }} level
 * @param {string|number|Date|null|undefined} lastRecalibration
 * @param {number} [nowMs] Injected epoch ms; defaults to real clock.
 * @returns {boolean}
 */
export function shouldRecalibrate(level, lastRecalibration, nowMs) {
  if (!lastRecalibration) return true;

  const ms = nowMs == null ? clockNow() : nowMs;
  const hoursSince = (ms - new Date(lastRecalibration).getTime()) / (1000 * 60 * 60);

  switch (level.recalibrationFrequency) {
    case 'per_session':        return false;           // triggered after session, not time-based
    case 'daily':              return hoursSince >= 20; // slack for timezone drift
    case 'weekly':             return hoursSince >= 24 * 7;
    case 'monthly_or_trigger': return hoursSince >= 24 * 30;
    default:                   return false;
  }
}

/**
 * Feature flag: weakness-prioritized session ordering.
 * When true, buildSession moves weak-group exercises to positions 1-2.
 * Default false — opt-in only.
 */
export const contextSelectionEnabled = false;

/**
 * Filter logs to the rolling window defined for the level.
 * Only OPTIMIZED (6 months) currently has a window; others return all logs.
 *
 * @param {CalibLog[]} logs
 * @param {{ rollingWindowMonths?: number }} level
 * @param {number} [nowMs] Injected epoch ms; defaults to real clock.
 * @returns {CalibLog[]}
 */
export function applyRollingWindow(logs, level, nowMs) {
  if (!level.rollingWindowMonths) return logs;
  const ms = nowMs == null ? clockNow() : nowMs;
  const cutoff = ms - level.rollingWindowMonths * 30 * MS_PER_DAY;
  return logs.filter(log => {
    const raw = log.date || log.ts;
    const d = raw ? new Date(raw) : null;
    return d && !isNaN(d.getTime()) && d.getTime() >= cutoff;
  });
}
