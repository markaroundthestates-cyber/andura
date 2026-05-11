// ══ idle.js — V2 vanilla port from renderIdle.js per V1_FEATURES_AUDIT verdict
// Replaces src/pages/coach/renderIdle.js (DEPRECATED, removal Sub-Batch 3).
//
// Applied per V1_FEATURES_AUDIT_V1 LOCK V1 (15 features):
//   KEEP verbatim: F2 last-session-memory, F4 readiness verdict, F6 PR wall,
//                  F7 coachDirector wire, F8 streak counter, F10 stats grid,
//                  F11 PRs notification, F12 rating buttons, F15 per-set RPE.
//   MODIFY simplified: F1 patterns 5→2 (LOW_ADHERENCE + STAGNATION only — others
//                      dropped per Gigel-paranoid surveillance risk),
//                      F3 fatigue single number + color (drop visual bar),
//                      F9 BMR single line (drop strip elaborate),
//                      F14 ratings window 20→90 + Tier archive (rating.js scope).
//   DROP V1: F5 AA friction modal (defer v1.5 inline UX flow),
//            F13 rating notes auto-apply (Anti-RE rule LOCKED V1 PERMANENT).
//
// Mockup FIX wires: FIX 1 Warmup adaptive ctx, FIX 2 Deload variant,
//                   FIX 4 weaknessDetector lagging WHY, FIX 6 Mini-player.

import { DB, tod, todDate } from '../db.js';
import { KCAL_TARGET, PROT_TARGET } from '../constants.js';
import { calculateFatigueScore } from '../engine/fatigue.js';
import {
  getTodayReadiness,
  getReadinessVerdict,
  getReadinessScore,
} from '../engine/readiness.js';
import { coachDirector } from '../engine/coachDirector.js';
import { SYS } from '../engine/sys.js';
import { getLaggingMuscles, getRecoveryByGroup } from '../engine/muscleRecovery.js';

// ── F1 verdict: 2 patterns only (LOW_ADHERENCE + STAGNATION) ───────────────
// Dropped per Gigel-suspect surveillance risk: HIGH_DEVIATION + EARLY_END +
// PEAK_HOURS. Verbatim copy of V1 string formatters for the kept two.
const PATTERN_BANNER_STRINGS_V2 = {
  LOW_ADHERENCE: (p) =>
    `📊 Adherence scazuta ultimele 30 zile: ${p.adherenceRate}%. Reducem volum si verificam contextul.`,
  STAGNATION: (p) =>
    `📊 ${p.exercises?.length || 0} exercitii stagnate 3+ saptamani`,
};

const PATTERN_KEEP_V2 = new Set(['LOW_ADHERENCE', 'STAGNATION']);

export function shouldShowPatternBanner(ctx) {
  if (!ctx) return false;
  if (ctx.patternsSuppressed === true) return false;
  if (!Array.isArray(ctx.patterns)) return false;
  return ctx.patterns.some(p => PATTERN_KEEP_V2.has(p?.type));
}

export function formatPatternMessage(pattern) {
  if (!pattern?.type) return null;
  if (!PATTERN_KEEP_V2.has(pattern.type)) return null;
  const fmt = PATTERN_BANNER_STRINGS_V2[pattern.type];
  return fmt ? fmt(pattern) : null;
}

// ── F3 verdict: single-number fatigue + color (NU bar elaborate) ───────────
export function getSimplifiedFatigue() {
  const f = calculateFatigueScore();
  return {
    score: f.score ?? 0,
    label: f.label || 'N/A',
    color: f.color || 'var(--text3)',
    icon:  f.icon  || '',
    detail: f.detail || '',
  };
}

// ── F8 verdict: streak counter (verbatim port from V1) ─────────────────────
export function computeStreak(logs) {
  const today = tod();
  const uniqueDays = [...new Set((logs || []).filter(l => !l.baseline).map(l => l.date))]
    .sort().reverse();
  let streak = 0;
  for (let i = 0; i < uniqueDays.length; i++) {
    const d = new Date(uniqueDays[i] + ' 12:00');
    const exp = new Date(today + ' 12:00');
    exp.setDate(exp.getDate() - i);
    if (d.toDateString() === exp.toDateString()) streak++;
    else break;
  }
  return streak;
}

// ── F9 verdict: BMR single line (drop strip elaborate) ─────────────────────
export function getBmrLine() {
  const kcalTarget = SYS.getKcalTarget?.() ?? KCAL_TARGET;
  const protTarget = PROT_TARGET;
  return `🎯 Azi: ${kcalTarget} kcal · ${protTarget}g protein`;
}

// ── F10 verdict: stats grid ─────────────────────────────────────────────────
export function computeStatsGrid(logs) {
  const week = (logs || []).filter(l => !l.baseline);
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const lastWeekSets = week.filter(l => new Date(l.date) >= weekAgo).length;
  const streak = computeStreak(logs);
  const kcalBurn = Math.round((SYS.getCurrentKg?.() ?? 75) * 0.09 * 50);
  return { streak, lastWeekSets, kcalBurn };
}

// ── FIX 4 weaknessDetector lagging WHY line (mockup 6-fixes integration) ──
export function getLaggingWhyLine(logs) {
  const recovery = getRecoveryByGroup(logs);
  const lagging = getLaggingMuscles({ logs });
  if (lagging.length === 0) return null;
  const top = lagging[0];
  const recoveredGroups = Object.entries(recovery)
    .filter(([, s]) => s === 'recovered')
    .map(([g]) => g);
  const recoveredLabel = recoveredGroups[0] ?? null;
  if (recoveredLabel) {
    return `${capitalize(recoveredLabel)} recuperat · ${top.label.toLowerCase()} sub-volum 2 sapt — focus azi pe acel grup.`;
  }
  return `${top.label} sub-volum 2 saptamani — coach prioritizeaza azi.`;
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── F4 verdict: readiness verdict + score (verbatim port) ──────────────────
export function getReadinessDisplay() {
  const todayR = getTodayReadiness();
  if (todayR == null) return { score: null, verdict: null, todayR: null };
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yDate = todDate(yesterday);
  const kcals = DB.get('kcals') || {};
  const prots = DB.get('prots') || {};
  const score = getReadinessScore(
    todayR, kcals[yDate], prots[yDate], KCAL_TARGET, PROT_TARGET
  );
  const isInCut = (DB.get('phase-override') === 'CUT');
  const verdict = score != null ? getReadinessVerdict(score, { isInCut }) : null;
  return { score, verdict, todayR };
}

// ── FIX 6 Mini-player conditional render (mockup 6-fixes integration) ─────
// Render small pill only when there's an active paused/dirty session in flight.
export function shouldShowMiniPlayer(dirSession) {
  return Boolean(dirSession && dirSession.active === true);
}

// ── FIX 1 Warmup adaptive context + FIX 2 Deload variant ──────────────────
// Hook points — coachDirector output exposes session.warmup / session._deload.
// idle.js renders these flags into the WHY banner sections.
export function getWarmupContextLine(session) {
  if (!session?.warmup) return null;
  const w = session.warmup;
  return `Incalzire ${w.durationMin || '~5'} min · ${w.routine || 'standard'}`;
}

export function getDeloadBanner(session) {
  if (!session?._deload) return null;
  return 'Saptamana deload activata — volum/intensitate reduse pentru recuperare.';
}

// ── F6 PR wall: import only (rendering deferred to V2 mockup component) ───
// Mockup FIX 5 wires F11 banner "Vezi toate" link → goto('pr-wall') drill screen.
// Pure entrypoint: caller imports renderPRWall directly. NO re-export from idle.js
// to avoid coupling V2 idle to V1 V1 DOM pr.js.

// ── F7: coachDirector session build (verbatim wire) ────────────────────────
export async function buildIdleSession(sessionType) {
  try {
    return await coachDirector.buildSession(sessionType);
  } catch {
    return null;
  }
}

// ── Top-level orchestrator: builds the idle screen data shape consumed by
// the V2 vanilla DOM renderer. Pure function (no DOM mutation here).
//
// @param {object} opts
// @param {string} opts.sessionType  - PUSH | PULL | UMERI_BRATE | FULL_UPPER | UPPER_PICIOARE
// @returns {Promise<object>} — idle screen view-model
export async function buildIdleViewModel({ sessionType } = {}) {
  const logs = DB.get('logs') || [];
  const session = await buildIdleSession(sessionType);
  const readiness = getReadinessDisplay();
  const stats = computeStatsGrid(logs);
  const fatigue = getSimplifiedFatigue();
  const bmrLine = getBmrLine();
  const laggingWhy = getLaggingWhyLine(logs);
  const warmupCtx = getWarmupContextLine(session);
  const deloadBanner = getDeloadBanner(session);
  const miniPlayer = shouldShowMiniPlayer(session);

  let patternsBanner = [];
  if (shouldShowPatternBanner(session?.context)) {
    patternsBanner = (session.context.patterns || [])
      .map(formatPatternMessage)
      .filter(Boolean);
  }

  return {
    session,
    readiness,
    stats,
    fatigue,
    bmrLine,
    laggingWhy,
    warmupCtx,
    deloadBanner,
    miniPlayer,
    patternsBanner,
  };
}
