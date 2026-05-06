// Cluster B5 + B6 Cooldown Management per ADR 026 §9.6.2 verbatim.
//
// B5 Cooldown N=12 weeks same group anti-obsession (Q10=B):
//    Post-specialization-block exit (4 weeks ON + 12 weeks cooldown = ~16 weeks
//    cycle minimum same group). Anti-obsession protection — preserve programming
//    variety, prevent overfocus single muscle group long-term injury risk.
// B6 Hard reject 12 weeks cooldown anti-nagging (Q16=A match Q10):
//    User rejects proposal → engine NU re-prompts same group for 12 weeks.
//    Anti-nagging UX — respect user decision F4 autonomy. Q16=A consistency
//    with Q10=B cooldown duration uniform 12-week protection regardless of
//    acceptance/rejection path.
//
// Pure functions — no side effects. Caller supplies cooldown history (Map or
// Object: groupId → {endTimestampMs, reason}) — orchestrator persists per ADR
// 030 D2 thin scope.

import { COOLDOWN_WEEKS } from './constants.js';

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Compute weeks elapsed between two epoch timestamps.
 *
 * @param {number} fromMs
 * @param {number} toMs
 * @returns {number} Weeks elapsed (may be fractional)
 */
function weeksBetween(fromMs, toMs) {
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) return 0;
  const delta = toMs - fromMs;
  if (delta <= 0) return 0;
  return delta / MS_PER_WEEK;
}

/**
 * Lookup cooldown entry per muscle group from history Map/Object.
 *
 * History shape: groupId → {endTimestampMs: number, reason: 'completed_exit'|
 * 'hard_reject'}. Caller (orchestrator) persists across sessions per ADR 030
 * D2 thin scope; engine consumes read-only.
 *
 * @param {Object|Map<string, Object>|null|undefined} history
 * @param {string} group
 * @returns {{endTimestampMs: number|null, reason: string|null}}
 */
export function getCooldownEntry(history, group) {
  if (typeof group !== 'string' || group.length === 0) {
    return { endTimestampMs: null, reason: null };
  }

  let entry = null;
  if (history instanceof Map) {
    entry = history.get(group) ?? null;
  } else if (history && typeof history === 'object') {
    entry = history[group] ?? null;
  }

  if (!entry || typeof entry !== 'object') {
    return { endTimestampMs: null, reason: null };
  }

  const endMs = Number.isFinite(entry.endTimestampMs) ? entry.endTimestampMs : null;
  const reason = typeof entry.reason === 'string' ? entry.reason : null;
  return { endTimestampMs: endMs, reason };
}

/**
 * Evaluate cooldown state per Cluster B5 Q10=B + B6 Q16=A verbatim — N=12
 * weeks same group anti-obsession + hard reject 12 weeks anti-nagging.
 *
 * Returns CooldownState cu blocked + group + weeksRemaining + reason +
 * rationale for transparency CDL audit trail.
 *
 * @param {Object} input
 * @param {string|null} [input.targetGroup]              - Candidate target weak group
 * @param {Object|Map<string, Object>|null} [input.history] - Cooldown history per group
 * @param {number} [input.nowMs]                          - Caller-provided epoch (NU Date.now per ADR 018 §2 deterministic)
 * @returns {import('./types.js').CooldownState}
 */
export function evaluateCooldown({ targetGroup, history, nowMs }) {
  const safeTarget = typeof targetGroup === 'string' ? targetGroup.toLowerCase() : null;

  if (!safeTarget) {
    return {
      blocked:         false,
      group:           null,
      weeksRemaining:  null,
      reason:          'no_cooldown',
      rationale:       'no_target_group_no_cooldown_evaluation',
    };
  }

  const entry = getCooldownEntry(history, safeTarget);

  if (entry.endTimestampMs === null) {
    return {
      blocked:         false,
      group:           safeTarget,
      weeksRemaining:  null,
      reason:          'no_cooldown',
      rationale:       `no_cooldown_history_for_group_${safeTarget}_eligible_specialization`,
    };
  }

  // Determine cooldown end based on entry reason — both reasons use 12-week
  // duration per Q10=B + Q16=A match.
  const cooldownEndMs = entry.endTimestampMs + COOLDOWN_WEEKS * MS_PER_WEEK;
  const safeNow = Number.isFinite(nowMs) ? nowMs : null;

  if (safeNow === null) {
    // Defensive: caller missed nowMs — V1 conservative assume cooldown active
    // (anti-bypass via missing timestamp). Orchestrator must supply nowMs.
    return {
      blocked:         true,
      group:           safeTarget,
      weeksRemaining:  COOLDOWN_WEEKS,
      reason:          entry.reason ?? 'unknown',
      rationale:       `now_ms_missing_conservative_block_default_q10_b_q16_a_anti_bypass`,
    };
  }

  if (safeNow >= cooldownEndMs) {
    return {
      blocked:         false,
      group:           safeTarget,
      weeksRemaining:  null,
      reason:          'no_cooldown',
      rationale:       `cooldown_expired_for_group_${safeTarget}_eligible_re_specialization`,
    };
  }

  const weeksRemaining = weeksBetween(safeNow, cooldownEndMs);
  return {
    blocked:         true,
    group:           safeTarget,
    weeksRemaining:  Math.ceil(weeksRemaining),
    reason:          entry.reason ?? 'unknown',
    rationale: `cooldown_active_group_${safeTarget}_${entry.reason ?? 'unknown'}_weeks_remaining_${Math.ceil(weeksRemaining)}_q10_b_q16_a_anti_obsession_anti_nagging`,
  };
}

/**
 * Build cooldown extension entry per user rejection or completed exit per
 * Cluster B5 Q10=B + B6 Q16=A. Caller persists to orchestrator state per
 * ADR 030 D2 thin scope.
 *
 * @param {Object} input
 * @param {string} input.group
 * @param {number} input.nowMs                          - Event timestamp (now)
 * @param {string} input.reason                          - 'completed_exit' | 'hard_reject'
 * @returns {{group: string, endTimestampMs: number, reason: string, cooldownEndMs: number}}
 */
export function buildCooldownEntry({ group, nowMs, reason }) {
  const safeGroup = typeof group === 'string' ? group.toLowerCase() : '';
  const safeNow = Number.isFinite(nowMs) ? nowMs : 0;
  const safeReason = (reason === 'completed_exit' || reason === 'hard_reject')
    ? reason
    : 'completed_exit';
  return {
    group:           safeGroup,
    endTimestampMs:  safeNow,
    reason:          safeReason,
    cooldownEndMs:   safeNow + COOLDOWN_WEEKS * MS_PER_WEEK,
  };
}
