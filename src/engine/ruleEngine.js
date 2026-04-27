// ══ RULE ENGINE — Evaluare reguli cu priorități numerice ══════════════════
// Fiecare regulă are o prioritate (100=critical, 0=lowest).
// evaluate(ctx) returnează { action, trace, winner, overridden }
// Dacă o regulă mai prioritară se activează, cele mai mici sunt înregistrate în `overridden`.
import { READINESS_PR, READINESS_LOW } from './readiness.js';

export const RULES = {
  REST_DAY:              { id: 'REST_DAY',              priority: 100, action: 'rest' },
  DELOAD:                { id: 'DELOAD',                priority: 95,  action: 'deload' },
  CUT_CONSERVATIVE:      { id: 'CUT_CONSERVATIVE',      priority: 85,  action: 'conservative' },
  WEAK_GROUP_PRIORITY:   { id: 'WEAK_GROUP_PRIORITY',   priority: 70,  action: 'prioritize_weak' },
  VOLUME_COMPENSATION:   { id: 'VOLUME_COMPENSATION',   priority: 60,  action: 'compensate_volume' },
  STAGNATION_WEEK_8:     { id: 'STAGNATION_WEEK_8',     priority: 50,  action: 'deload_stagnation' },
  STAGNATION_WEEK_6:     { id: 'STAGNATION_WEEK_6',     priority: 45,  action: 'technique_focus' },
  STAGNATION_WEEK_4:     { id: 'STAGNATION_WEEK_4',     priority: 40,  action: 'volume_increase' },
  PATTERN_EARLY_END:     { id: 'PATTERN_EARLY_END',     priority: 30,  action: 'shorten_session' },
};

/**
 * @param {object} ctx - CoachContext (readiness, isInCut, fatigueIndex, stagnationWeeks,
 *                        weakGroups, patterns, missedSessions)
 * @returns {{ action: string, trace: Array, winner: object|null, overridden: Array }}
 */
export function evaluate(ctx) {
  const fired = [];

  // Priority 100 — REST: readiness critically low
  if (ctx.readiness?.score !== null && ctx.readiness?.score < READINESS_LOW) {
    fired.push({
      ...RULES.REST_DAY,
      reason: `readiness=${ctx.readiness.score} < ${READINESS_LOW}`,
    });
  }

  // Priority 95 — DELOAD: cumulative fatigue above threshold
  const fatigueIndex = ctx.fatigueIndex ?? 0;
  if (fatigueIndex >= 0.85) {
    fired.push({
      ...RULES.DELOAD,
      reason: `fatigueIndex=${fatigueIndex.toFixed(2)} ≥ 0.85`,
    });
  }

  // Priority 85 — CUT_CONSERVATIVE: in cut phase with high readiness → cap PR attempts
  if (ctx.isInCut && (ctx.readiness?.score ?? 0) >= READINESS_PR) {
    fired.push({
      ...RULES.CUT_CONSERVATIVE,
      reason: `CUT phase + readiness=${ctx.readiness?.score} ≥ 85 — no PR attempts`,
    });
  }

  // Priority 70 — WEAK_GROUP_PRIORITY: detectable muscle group imbalance
  const weakGroups = ctx.weakGroups ?? [];
  if (weakGroups.length > 0) {
    fired.push({
      ...RULES.WEAK_GROUP_PRIORITY,
      reason: `Weak groups detected: ${weakGroups.slice(0, 3).join(', ')}`,
      data: { weakGroups },
    });
  }

  // Priority 60 — VOLUME_COMPENSATION: missed sessions this week
  const missedSessions = ctx.missedSessions ?? 0;
  if (missedSessions >= 1 && missedSessions <= 2) {
    fired.push({
      ...RULES.VOLUME_COMPENSATION,
      reason: `${missedSessions} missed session(s) this week`,
      data: { missedSessions },
    });
  }

  // Priority 50 — STAGNATION_WEEK_8: 8+ consecutive stagnation weeks
  const stagnationWeeks = ctx.stagnationWeeks ?? 0;
  if (stagnationWeeks >= 8) {
    fired.push({
      ...RULES.STAGNATION_WEEK_8,
      reason: `${stagnationWeeks} weeks of stagnation — recommend deload`,
    });
  } else if (stagnationWeeks >= 6) {
    // Priority 45 — STAGNATION_WEEK_6
    fired.push({
      ...RULES.STAGNATION_WEEK_6,
      reason: `${stagnationWeeks} weeks of stagnation — technique focus`,
    });
  } else if (stagnationWeeks >= 4) {
    // Priority 40 — STAGNATION_WEEK_4
    fired.push({
      ...RULES.STAGNATION_WEEK_4,
      reason: `${stagnationWeeks} weeks of stagnation — add volume`,
    });
  }

  // Priority 30 — PATTERN_EARLY_END: early-stop patterns detected
  const earlyEndPattern = ctx.patterns?.find(p => p.type === 'EARLY_END' || p.type === 'early_end' || p.type === 'session_short');
  if (earlyEndPattern) {
    fired.push({
      ...RULES.PATTERN_EARLY_END,
      reason: `Early-end pattern: ${earlyEndPattern.type}`,
      data: { pattern: earlyEndPattern },
    });
  }

  if (fired.length === 0) {
    return { action: 'normal', trace: [], winner: null, overridden: [] };
  }

  // Sort by priority DESC — highest priority wins
  fired.sort((a, b) => b.priority - a.priority);
  const [winner, ...rest] = fired;

  return {
    action: winner.action,
    winner,
    trace: fired,
    overridden: rest,
  };
}

/**
 * Convenience: evaluate and return just the action string.
 */
export function evaluateAction(ctx) {
  return evaluate(ctx).action;
}
