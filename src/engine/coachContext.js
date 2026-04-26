// ══ COACH CONTEXT — Sursă unică de adevăr pentru toate engines ══════════
// Engines nu mai citesc din localStorage direct — primesc context de aici.
import { getMuscleState } from './muscleMap.js';
import { DB, tod } from '../db.js';
import { getUserConfig } from '../config/user.js';
import { KCAL_TARGET, TARGET_DATE } from '../constants.js';
import { analyzeFromCDL } from './patternLearning.js';
import * as coachDecisionLog from '../util/coachDecisionLog.js';
import { CALIBRATION_LEVELS } from './calibration.js';

export function buildCoachContext() {
  const now = new Date();
  const july20_2026 = TARGET_DATE;

  const allLogs = getAllLogs();
  const recentLogs = getLastNSessions(3);

  const phase = getPhaseFromStorage();
  const kcalTarget = getKcalTarget();

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
    patterns: getActivePatterns(),
    ...getCDLPatterns(),
    currentDate: now,
    isBeforeJuly20_2026: now < july20_2026,
    isDeficit: kcalTarget < 2200,
    isInCut: phase === 'CUT' || (phase === 'AUTO' && now < july20_2026)
  };
}

function calculateVolumeMultiplier(readinessScore) {
  if (readinessScore === null) return 1.0;
  if (readinessScore >= 85) return 1.1;
  if (readinessScore >= 70) return 1.0;
  if (readinessScore >= 55) return 0.85;
  if (readinessScore >= 40) return 0.7;
  return 0;
}

// ── Readiness helpers ──────────────────────────────────────────────────────
// Suportă două formate: { score, emoji } (vitest) și număr 1-5 (app real)

function getTodayReadinessScore() {
  try {
    const todayDate = tod();
    const all = JSON.parse(localStorage.getItem('readiness') || '{}');
    const val = all[todayDate];
    if (val === null || val === undefined) return null;
    if (typeof val === 'object' && val.score !== undefined) return val.score;
    // Format real: număr 1–5 → convertit în scor 0–100
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
    // Suportă atât string JSON ("AUTO") cât și string plain (AUTO)
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
    const unavailable = JSON.parse(localStorage.getItem('unavailable-equipment') || '[]');
    const all = ['matrix_cable', 'bailib_stack', 'pec_deck', 'leg_machine', 'leg_press_plates', 'dumbbell'];
    return all.filter(e => !unavailable.includes(e));
  } catch {
    return ['matrix_cable', 'bailib_stack', 'pec_deck', 'leg_machine', 'leg_press_plates', 'dumbbell'];
  }
}

function getUnavailableEquipment() {
  try { return JSON.parse(localStorage.getItem('unavailable-equipment') || '[]'); }
  catch { return []; }
}

// ── CDL pattern helpers (ADR 011) ─────────────────────────────────────────
// CDL-sourced patterns for banner — suppressed when real CDL entries < threshold.
// Separate from getActivePatterns() to preserve coachDirector.applyPatterns compat.

function getCDLPatterns() {
  try {
    const entries = coachDecisionLog.readAllActive(e =>
      e.synthetic !== true &&
      e.outcome != null &&
      e.outcome.executed != null
    );
    const realCDLCount = entries.length;
    const minReal = CALIBRATION_LEVELS.INITIAL.minSessions;
    const patternsSuppressed = realCDLCount < minReal;
    const cdlPatterns = patternsSuppressed ? [] : analyzeFromCDL({ windowDays: 30 });
    return { cdlPatterns, realCDLCount, patternsSuppressed };
  } catch {
    return { cdlPatterns: [], realCDLCount: 0, patternsSuppressed: true };
  }
}

// ── Legacy pattern helpers ─────────────────────────────────────────────────
// Citește din 'auto-recommendations' (teste/UI) și 'applied-patterns' (engine)
// Normalizează type la lowercase pentru coachDirector.applyPatterns

function getActivePatterns() {
  try {
    const autoRecs = JSON.parse(localStorage.getItem('auto-recommendations') || '[]');
    const applied = JSON.parse(localStorage.getItem('applied-patterns') || '[]');
    const all = [...autoRecs, ...applied];
    return all.map(p => ({
      ...p,
      type: (p.type || '').toLowerCase(),
      confidence: p.confidence ?? (p.earlyEndRate ? p.earlyEndRate / 100 : 0.5)
    }));
  } catch { return []; }
}
