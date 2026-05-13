// ══ COACH CONTEXT — Sursa unica de adevar pentru toate engines ══════════
// Engines nu mai citesc din localStorage direct — primesc context de aici.
import { getMuscleState } from './muscleMap.js';
import { DB, tod } from '../db.js';
import { getUserConfig } from '../config/user.js';
import { KCAL_TARGET, TARGET_DATE } from '../constants.js';
import { analyzeFromCDL } from './patternLearning.js';
import * as coachDecisionLog from '../util/coachDecisionLog.js';
import { CALIBRATION_LEVELS } from './calibration.js';
import { aggregateAutoAggression } from './autoAggressionDetection.js';
import { READINESS_PR, READINESS_HIGH, READINESS_MED, READINESS_LOW } from './readiness.js';
import {
  getMissingEquipment,
  translateToEngineEquipment,
  getCalendarOverride,
} from './schedule/scheduleAdapter.js';

export function buildCoachContext() {
  const now = new Date();
  const july20_2026 = TARGET_DATE;

  const allLogs = getAllLogs();
  const recentLogs = getLastNSessions(3);

  const phase = getPhaseFromStorage();
  const kcalTarget = getKcalTarget();

  // ADR 013 — aggregate AA signals over 30d window (include today, idempotent)
  const _aaCutoff = new Date();
  _aaCutoff.setDate(_aaCutoff.getDate() - 30);
  const _recentCDLForAA = coachDecisionLog.readAllActive(e => {
    const d = new Date(e.date);
    return d >= _aaCutoff;
  });
  const autoAggression = aggregateAutoAggression(_recentCDLForAA);

  return {
    user: {
      phase,
      kcalTarget,
      weight: getCurrentWeight(),
      bodyweightTrend: getBodyweightTrend7d(),
      phaseChangeDate: getPhaseChangeDate(),
      targetWeight: getUserConfig().bio.targetKg,
      targetDate: july20_2026
    },
    readiness: {
      score: getTodayReadinessScore(),
      emoji: getTodayReadinessEmoji(),
      isSet: isTodayReadinessSet(),
      volumeMultiplier: calculateVolumeMultiplier(getTodayReadinessScore())
    },
    muscleState: getMuscleState(allLogs),
    equipment: {
      available: getAvailableEquipment(),
      unavailable: getUnavailableEquipment()
    },
    allLogs,
    recentLogs,
    ..._buildCDLPatterns(),
    autoAggression,
    currentDate: now,
    isBeforeJuly20_2026: now < july20_2026,
    isDeficit: kcalTarget < 2200,
    isInCut: phase === 'CUT' || (phase === 'AUTO' && now < july20_2026),
    // Calendar V1 S2 wiring — UI-side scheduleAdapter exposes override via
    // ctx.meta for engine orchestrator pipeline §42.10 consumption per
    // ADR 026 §9 (engines remain pure-function; meta carries scheduling hints).
    meta: {
      calendarOverride: getCalendarOverride(now),
    }
  };
}

function calculateVolumeMultiplier(readinessScore) {
  if (readinessScore === null) return 1.0;
  if (readinessScore >= READINESS_PR)   return 1.1;
  if (readinessScore >= READINESS_HIGH) return 1.0;
  if (readinessScore >= READINESS_MED)  return 0.85;
  if (readinessScore >= READINESS_LOW)  return 0.7;
  return 0;
}

// ── Readiness helpers ──────────────────────────────────────────────────────
// Suporta doua formate: { score, emoji } (vitest) si numar 1-5 (app real)

function getTodayReadinessScore() {
  try {
    const todayDate = tod();
    const all = JSON.parse(localStorage.getItem('readiness') || '{}');
    const val = all[todayDate];
    if (val === null || val === undefined) return null;
    if (typeof val === 'object' && val.score !== undefined) return val.score;
    // Format real: numar 1–5 → convertit in scor 0–100
    const readinessPoints = { 5: 40, 4: 35, 3: 25, 2: 15, 1: 0 };
    return Math.max(10, Math.min(100, 60 + (readinessPoints[val] ?? 0)));
  } catch { return null; }
}

function getTodayReadinessEmoji() {
  try {
    const todayDate = tod();
    const all = JSON.parse(localStorage.getItem('readiness') || '{}');
    const val = all[todayDate];
    if (!val) return '😐';
    if (typeof val === 'object' && val.emoji) return val.emoji;
    const emojiMap = { 5: '🔥', 4: '😊', 3: '😐', 2: '😕', 1: '😴' };
    return emojiMap[val] || '😐';
  } catch { return '😐'; }
}

function isTodayReadinessSet() {
  try {
    const todayDate = tod();
    const all = JSON.parse(localStorage.getItem('readiness') || '{}');
    const val = all[todayDate];
    return val !== undefined && val !== null;
  } catch { return false; }
}

// ── Phase / Kcal helpers ───────────────────────────────────────────────────

function getPhaseFromStorage() {
  try {
    const raw = localStorage.getItem('phase-override');
    if (!raw) return 'AUTO';
    // Suporta atat string JSON ("AUTO") cat si string plain (AUTO)
    try { return JSON.parse(raw); }
    catch { return raw; }
  } catch { return 'AUTO'; }
}

function getKcalTarget() {
  try {
    const raw = localStorage.getItem('current-kcal');
    if (raw === null) return KCAL_TARGET;
    const val = Number(raw);
    return isNaN(val) ? KCAL_TARGET : val;
  } catch { return KCAL_TARGET; }
}

function getPhaseChangeDate() {
  try { return DB.get('phase-change-date') || null; }
  catch { return null; }
}

// ── Logs helpers ───────────────────────────────────────────────────────────

function getAllLogs() {
  try { return JSON.parse(localStorage.getItem('logs') || '[]'); }
  catch { return []; }
}

function getLastNSessions(n) {
  const logs = getAllLogs();
  const byDate = {};
  for (const log of logs) {
    const date = log.date;
    if (!date) continue;
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(log);
  }
  const dates = Object.keys(byDate).sort().reverse().slice(0, n);
  return dates.map(d => ({ date: d, logs: byDate[d] }));
}

// ── Weight helpers ─────────────────────────────────────────────────────────

function getCurrentWeight() {
  try {
    const weights = JSON.parse(localStorage.getItem('weights') || '{}');
    const dates = Object.keys(weights).sort().reverse();
    return dates.length > 0 ? weights[dates[0]] : getUserConfig().bio.currentKgFallback;
  } catch { return getUserConfig().bio.currentKgFallback; }
}

function getBodyweightTrend7d() {
  try {
    const weights = JSON.parse(localStorage.getItem('weights') || '{}');
    const dates = Object.keys(weights).sort().reverse().slice(0, 7);
    if (dates.length < 2) return 0;
    const oldest = weights[dates[dates.length - 1]];
    const newest = weights[dates[0]];
    return newest - oldest;
  } catch { return 0; }
}

// ── Equipment helpers ──────────────────────────────────────────────────────

function getAvailableEquipment() {
  try {
    const legacy = JSON.parse(localStorage.getItem('unavailable-equipment') || '[]');
    // Calendar V1 S2 2026-05-13: also merge user-driven aparate-lipsa picker
    // (wv2-missing-equipment) translated to engine equipment domain. Tier 0
    // active rolling per ADR 020 §1.4 — both legacy + user-driven blockers
    // contribute. Set dedup ensures no double-count.
    const userDriven = translateToEngineEquipment(getMissingEquipment());
    const unavailable = new Set([...legacy, ...userDriven]);
    const all = ['matrix_cable', 'bailib_stack', 'pec_deck', 'leg_machine', 'leg_press_plates', 'dumbbell'];
    return all.filter(e => !unavailable.has(e));
  } catch {
    return ['matrix_cable', 'bailib_stack', 'pec_deck', 'leg_machine', 'leg_press_plates', 'dumbbell'];
  }
}

function getUnavailableEquipment() {
  let legacy = [];
  try { legacy = JSON.parse(localStorage.getItem('unavailable-equipment') || '[]'); }
  catch { legacy = []; }
  // Calendar V1 S2 2026-05-13: merge with aparate-lipsa user-driven list.
  const userDriven = translateToEngineEquipment(getMissingEquipment());
  return [...new Set([...legacy, ...userDriven])];
}

// ── CDL pattern helpers (ADR 011) ─────────────────────────────────────────
// ctx.patterns is the single source of truth — CDL-backed, suppressed below threshold.

function _getRealCDLEntryCount() {
  try {
    return coachDecisionLog.readAllActive(e =>
      e.synthetic !== true &&
      e.outcome != null &&
      e.outcome.executed != null
    ).length;
  } catch { return 0; }
}

function _deriveCDLConfidence(pattern) {
  switch (pattern.type) {
    case 'EARLY_END':    return (pattern.earlyEndRate ?? 0) / 100;
    case 'LOW_ADHERENCE': return Math.max(0, (100 - (pattern.adherenceRate ?? 100)) / 100);
    case 'HIGH_DEVIATION': return (pattern.deviationRate ?? 0) / 100;
    case 'STAGNATION':   return 0.85;
    default:             return 0.5;
  }
}

function _buildCDLPatterns() {
  const realCDLCount = _getRealCDLEntryCount();
  const patternsSuppressed = realCDLCount < CALIBRATION_LEVELS.INITIAL.minSessions;
  let patterns = [];
  if (!patternsSuppressed) {
    try {
      patterns = analyzeFromCDL({ windowDays: 30 }).map(p => ({
        ...p,
        confidence: p.confidence ?? _deriveCDLConfidence(p),
      }));
    } catch (e) {
      console.warn('[coachContext] analyzeFromCDL failed:', e);
    }
  }
  return { patterns, realCDLCount, patternsSuppressed };
}
