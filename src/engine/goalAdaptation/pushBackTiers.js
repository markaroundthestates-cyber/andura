// Cluster 5 — Push-Back Proporțional 3 Tiers + Re-Prompt Anti-Spam Logic per
// ADR 026 §9.2.5 verbatim + ADR 024 §2.7 Q7 + §2.8 Q8 LOCKED V1.
//
// 3 tiers proporțional cu risc:
//   Tier 1 silent: no UI signal, engine internal modifier conservative
//   Tier 2 banner: in-app banner discret 1-2 lines explanation
//   Tier 3 modal:  full screen warning + opt-in confirmare cu max conservative
//                  modifiers (volume cap MEV-50% + intensity cap 75% 1RM)
//
// Risk-tier mapping example verbatim §9.2.5: "Forță + BF% high + age 60+ +
// recent injury → Tier 3 modal".
//
// Re-prompt anti-spam:
//   Trigger 28 zile rolling | Cooldown 21 zile post-confirm |
//   Cooldown 60 zile post Goal Shift | Cap 4/an absolut.
//
// Pure functions — no side effects, no Date.now (caller passes timestamps via ctx).

import {
  PUSHBACK_TIERS,
  PUSHBACK_RISK_THRESHOLDS,
  REPROMPT_LIMITS,
  SEX,
} from './constants.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const YEAR_DAYS = 365;

/**
 * Compute risk score additive per §9.2.5 Cluster 5 example verbatim mapping:
 *   +1: BF% high (>= bfPctHigh persona-specific)
 *   +1: age >= 60 (Maria-tier physiology floor)
 *   +1: recent injury (within injuryWindowDays)
 *   +1: aggressive intensity goal (forta) cu age >= 60
 *
 * @param {Object} input
 * @param {string} input.goalId
 * @param {{age?: number, bfPct?: number, sex?: string}} [input.user]
 * @param {ReadonlyArray<{injury?: boolean, daysAgo?: number}>} [input.recentSessions]
 * @returns {{score: number, reasons: string[]}}
 */
export function computeRiskScore({ goalId, user, recentSessions }) {
  const reasons = [];
  let score = 0;

  if (user) {
    // BF% high check
    const bf = Number(user.bfPct);
    if (Number.isFinite(bf) && bf > 0) {
      const sex = typeof user.sex === 'string' ? user.sex.toLowerCase() : SEX.MALE;
      const threshold = sex === SEX.FEMALE
        ? PUSHBACK_RISK_THRESHOLDS.bfPctHighFemale
        : PUSHBACK_RISK_THRESHOLDS.bfPctHighMale;
      if (bf >= threshold) {
        score += 1;
        reasons.push('bf_pct_high');
      }
    }

    // Age >= 60 check
    const age = Number(user.age);
    if (Number.isFinite(age) && age >= PUSHBACK_RISK_THRESHOLDS.ageOlder) {
      score += 1;
      reasons.push('age_60_plus');

      // Aggressive forta + age >= 60 cumulative risk
      if (goalId === 'forta') {
        score += 1;
        reasons.push('aggressive_forta_at_age_60_plus');
      }
    }
  }

  // Recent injury check (within 6 săpt window)
  if (Array.isArray(recentSessions)) {
    const recentInjury = recentSessions.some((s) => {
      if (!s || s.injury !== true) return false;
      const days = Number(s.daysAgo);
      if (!Number.isFinite(days)) return true; // defensive: injury without timestamp blocks
      return days <= PUSHBACK_RISK_THRESHOLDS.injuryWindowDays;
    });
    if (recentInjury) {
      score += 1;
      reasons.push('recent_injury_6w');
    }
  }

  return { score, reasons };
}

/**
 * Map risk score → push-back tier per §9.2.5 thresholds:
 *   score 0           → Tier 1 silent
 *   score 1           → Tier 2 banner discret
 *   score >= 2        → Tier 3 modal blocking opt-in
 *
 * @param {number} score
 * @returns {import('./types.js').PushBackTier}
 */
export function tierForScore(score) {
  const n = Number(score) || 0;
  if (n >= PUSHBACK_RISK_THRESHOLDS.tier3Threshold) return PUSHBACK_TIERS.TIER_3_MODAL;
  if (n >= PUSHBACK_RISK_THRESHOLDS.tier2Threshold) return PUSHBACK_TIERS.TIER_2_BANNER;
  return PUSHBACK_TIERS.TIER_1_SILENT;
}

/**
 * Tier 3 max conservative modifiers per §9.2.5 verbatim example:
 *   "volume cap MEV-50% + intensity cap 75% 1RM Layer C sanity bound".
 *
 * @returns {{volumeMul: number, intensityCap: number}}
 */
export function tier3ConservativeModifiers() {
  return Object.freeze({
    volumeMul:    PUSHBACK_RISK_THRESHOLDS.tier3MaxConservativeVolMul,
    intensityCap: PUSHBACK_RISK_THRESHOLDS.tier3MaxConservativeIntensityCap,
  });
}

/**
 * Compute full push-back signal per §9.2.5 Cluster 5.
 *
 * @param {Object} input
 * @param {string} input.goalId
 * @param {{age?: number, bfPct?: number, sex?: string}} [input.user]
 * @param {ReadonlyArray<Object>} [input.recentSessions]
 * @returns {import('./types.js').PushBackSignal}
 */
export function computePushBackSignal({ goalId, user, recentSessions }) {
  const { score, reasons } = computeRiskScore({ goalId, user, recentSessions });
  const tier = tierForScore(score);

  /** @type {import('./types.js').PushBackSignal} */
  const signal = {
    tier,
    riskScore: score,
    reasons,
  };

  if (tier === PUSHBACK_TIERS.TIER_3_MODAL) {
    signal.conservativeModifiers = tier3ConservativeModifiers();
  }

  return signal;
}

/**
 * Compute days elapsed între two timestamps (ms epoch). Defensive 0 când
 * either invalid or `to` < `from`.
 *
 * @param {number} from - earlier timestamp (ms epoch)
 * @param {number} to   - later timestamp (ms epoch)
 * @returns {number}
 */
function daysBetween(from, to) {
  const f = Number(from);
  const t = Number(to);
  if (!Number.isFinite(f) || !Number.isFinite(t) || t < f) return 0;
  return Math.floor((t - f) / DAY_MS);
}

/**
 * Re-prompt evaluation anti-spam logic per §9.2.5 + ADR 024 §2.8 Q8 LOCKED.
 *
 * Order of checks (any block → shouldPrompt = false):
 *   1. Cap absolut max 4 re-prompts/an
 *   2. Cooldown 60 zile post Goal Shift
 *   3. Cooldown 21 zile post-confirm (user răspuns "Da, încă X")
 *   4. Trigger 28 zile rolling (rolling window din ultima interacțiune)
 *
 * Caller passes nowMs (timestamp ms epoch) explicit — pure function NU
 * Date.now per ADR 018 §2 deterministic contract.
 *
 * @param {Object} input
 * @param {number} input.nowMs                                - Current timestamp (ms epoch)
 * @param {number} [input.lastRepromptMs]                     - Last re-prompt fired timestamp (ms epoch)
 * @param {number} [input.lastConfirmMs]                      - Last "Da, încă X" confirm timestamp
 * @param {number} [input.lastGoalShiftMs]                    - Last Goal Shift Event Handler timestamp
 * @param {number} [input.repromptCountThisYear]              - Cumulative count în ultimul an rolling
 * @returns {import('./types.js').RepromptDecision}
 */
export function evaluateReprompt({
  nowMs,
  lastRepromptMs,
  lastConfirmMs,
  lastGoalShiftMs,
  repromptCountThisYear,
}) {
  const blockedReasons = [];

  // 1. Cap absolut 4/an
  const count = Number(repromptCountThisYear) || 0;
  if (count >= REPROMPT_LIMITS.capPerYear) {
    blockedReasons.push('cap_per_year_reached');
  }

  // 2. Cooldown 60 zile post Goal Shift
  if (Number.isFinite(lastGoalShiftMs)) {
    const days = daysBetween(lastGoalShiftMs, nowMs);
    if (days < REPROMPT_LIMITS.cooldownPostGoalShiftDays) {
      blockedReasons.push('cooldown_post_goal_shift');
    }
  }

  // 3. Cooldown 21 zile post-confirm
  if (Number.isFinite(lastConfirmMs)) {
    const days = daysBetween(lastConfirmMs, nowMs);
    if (days < REPROMPT_LIMITS.cooldownPostConfirmDays) {
      blockedReasons.push('cooldown_post_confirm');
    }
  }

  // 4. Trigger 28 zile rolling
  if (Number.isFinite(lastRepromptMs)) {
    const days = daysBetween(lastRepromptMs, nowMs);
    if (days < REPROMPT_LIMITS.triggerRollingDays) {
      blockedReasons.push('rolling_window_28d');
    }
  }

  return {
    shouldPrompt: blockedReasons.length === 0,
    blockedReasons,
  };
}

// Internal helper used by tests
export const __testing__ = Object.freeze({ daysBetween, DAY_MS, YEAR_DAYS });
