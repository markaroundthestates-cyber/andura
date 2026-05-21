// Cluster B4 — Mood Linear Sum Weighted normalized + Cluster D3 Profile Typing
// per ADR 026 §9.4.2 + §9.4.4 verbatim.
//
// B4 Mood scoring Linear Sum Weighted normalized (LVM defer v1.5)
//    energy-readiness + emoji + sleep-self-report aggregate
//    V1 = simple weighted normalize (sum ÷ count, scale 0-1)
//
// D3 Profile Typing thresholds:
//    Adaptive 0.55-0.85 T1+ cu 0.70 default T0
//    Hamming hysteresis 15% — anti-flap profile change
//    2 sesiuni consecutive 14 zile window = qualifier explicit
//
// D6 Anti-spam aliniat Engine #2 28 zile rolling cooldown + cap 4/an
//
// Pure functions — no side effects, no Date.now.

import {
  PROFILE_TYPING,
  ANTI_SPAM,
  CALIBRATION_TIERS,
} from './constants.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Mood scoring Linear Sum Weighted normalized per Cluster B4 verbatim.
 *
 * Inputs:
 *   - energyReadiness (0-1 normalized self-report)
 *   - emoji (mapped 🟢=1.0 / 🟡=0.5 / 🔴=0.0)
 *   - sleepSelfReport (0-1 normalized hours/quality)
 *
 * V1 = simple weighted normalize (sum ÷ count, scale 0-1).
 * LVM (latent variable model) defer v1.5 cu post-Beta data signal validation.
 *
 * @param {Object} input
 * @param {number} [input.energyReadiness]
 * @param {string} [input.emoji]              - 'green' | 'yellow' | 'red'
 * @param {number} [input.sleepSelfReport]
 * @returns {number}
 */
export function computeMoodScore({ energyReadiness, emoji, sleepSelfReport }) {
  /** @type {number[]} */
  const components = [];

  if (energyReadiness != null && Number.isFinite(energyReadiness) && energyReadiness >= 0 && energyReadiness <= 1) {
    components.push(energyReadiness);
  }

  if (typeof emoji === 'string') {
    const e = emoji.toLowerCase();
    if (e === 'green' || e === '🟢') components.push(1.0);
    else if (e === 'yellow' || e === '🟡') components.push(0.5);
    else if (e === 'red' || e === '🔴') components.push(0.0);
  }

  if (sleepSelfReport != null && Number.isFinite(sleepSelfReport) && sleepSelfReport >= 0 && sleepSelfReport <= 1) {
    components.push(sleepSelfReport);
  }

  if (components.length === 0) return 0.5; // neutral default
  const sum = components.reduce((s, v) => (s ?? 0) + (v ?? 0), 0);
  return (sum ?? 0) / components.length;
}

/**
 * Resolve Profile Typing threshold per Cluster D3 verbatim:
 *   T0 default 0.70
 *   T1+ Adaptive 0.55-0.85 (V1 default 0.70 midpoint, post-Beta calibration)
 *
 * @param {Object} input
 * @param {import('./types.js').CalibrationTier} input.tier
 * @param {number} [input.adaptiveValue]    - Optional override 0.55-0.85
 * @returns {number}
 */
export function resolveProfileTypingThreshold({ tier, adaptiveValue }) {
  if (tier === CALIBRATION_TIERS.T0) return PROFILE_TYPING.t0Default;
  // T1, T2 — adaptive 0.55-0.85 (clamp)
  if (adaptiveValue != null && Number.isFinite(adaptiveValue)) {
    return Math.min(
      PROFILE_TYPING.t1PlusMax,
      Math.max(PROFILE_TYPING.t1PlusMin, adaptiveValue),
    );
  }
  return PROFILE_TYPING.t0Default; // V1 default midpoint cand no adaptiveValue
}

/**
 * Hamming hysteresis 15% anti-flap check per Cluster D3 verbatim.
 *
 * Returns true daca incoming threshold differs >15% from current → flip allowed.
 * Returns false daca diff <=15% → suppress flap (preserve current threshold).
 *
 * @param {Object} input
 * @param {number} input.currentThreshold
 * @param {number} input.incomingThreshold
 * @returns {boolean}
 */
export function exceedsHammingHysteresis({ currentThreshold, incomingThreshold }) {
  const curr = Number(currentThreshold);
  const inc = Number(incomingThreshold);
  if (!Number.isFinite(curr) || !Number.isFinite(inc)) return false;
  if (curr === 0) return Math.abs(inc) > PROFILE_TYPING.hammingHysteresisPct;
  const diff = Math.abs(inc - curr) / Math.abs(curr);
  return diff > PROFILE_TYPING.hammingHysteresisPct;
}

/**
 * 2 sesiuni consecutive 14 zile window qualifier per Cluster D3 verbatim.
 *
 * Returns true daca ≥2 sessions consecutive align cu incoming threshold in
 * trailing 14 zile window.
 *
 * @param {Object} input
 * @param {ReadonlyArray<{thresholdAligned?: boolean, daysAgo?: number}>} [input.recentSessions]
 * @param {number} [input.minConsecutive]
 * @param {number} [input.windowDays]
 * @returns {boolean}
 */
export function meetsConsecutiveQualifier({
  recentSessions,
  minConsecutive = PROFILE_TYPING.minConsecutiveSessions,
  windowDays = PROFILE_TYPING.windowDays,
}) {
  if (!Array.isArray(recentSessions)) return false;
  let count = 0;
  for (const s of recentSessions) {
    if (!s) break;
    const daysAgo = Number(s.daysAgo);
    if (!Number.isFinite(daysAgo) || daysAgo > windowDays) break;
    if (s.thresholdAligned !== true) break;
    count += 1;
    if (count >= minConsecutive) return true;
  }
  return count >= minConsecutive;
}

/**
 * Evaluate Profile Typing flip decision per Cluster D3 cumulative gating:
 *   1. Hamming hysteresis 15% (anti-flap noise)
 *   2. 2 sesiuni consecutive 14 zile window (qualifier explicit)
 *
 * @param {Object} input
 * @param {number} input.currentThreshold
 * @param {number} input.incomingThreshold
 * @param {ReadonlyArray<Object>} [input.recentSessions]
 * @returns {import('./types.js').ProfileTypingState}
 */
export function evaluateProfileTypingFlip({ currentThreshold, incomingThreshold, recentSessions }) {
  const hammingExceeds = exceedsHammingHysteresis({ currentThreshold, incomingThreshold });
  const qualifierMet = meetsConsecutiveQualifier({ recentSessions });

  let flapSuppressed = false;
  let resolvedThreshold = currentThreshold;
  let consecutiveCount = 0;

  if (Array.isArray(recentSessions)) {
    for (const s of recentSessions) {
      if (!s) break;
      const daysAgo = Number(s.daysAgo);
      if (!Number.isFinite(daysAgo) || daysAgo > PROFILE_TYPING.windowDays) break;
      if (s.thresholdAligned !== true) break;
      consecutiveCount += 1;
    }
  }

  if (hammingExceeds && qualifierMet) {
    resolvedThreshold = incomingThreshold;
  } else {
    flapSuppressed = !hammingExceeds || !qualifierMet;
  }

  return {
    threshold: resolvedThreshold,
    flapSuppressed,
    consecutiveSessionsAlignedCurrent: consecutiveCount,
  };
}

/**
 * Anti-spam re-prompt evaluation per Cluster D6 verbatim aliniat ADR 024 §2.8 Q8 LOCKED.
 *
 * 28 zile rolling cooldown + cap 4 prompts/year.
 *
 * Caller passes nowMs explicit (NU Date.now per ADR 018 §2 deterministic).
 *
 * @param {Object} input
 * @param {number} input.nowMs
 * @param {number} [input.lastPromptMs]
 * @param {number} [input.promptCountThisYear]
 * @returns {{shouldPrompt: boolean, blockedReasons: string[]}}
 */
export function evaluateAntiSpam({ nowMs, lastPromptMs, promptCountThisYear }) {
  const blockedReasons = [];

  // Cap 4/year
  const count = Number(promptCountThisYear) || 0;
  if (count >= ANTI_SPAM.maxPromptsPerYear) {
    blockedReasons.push('cap_4_per_year_reached');
  }

  // 28 zile rolling cooldown
  if (lastPromptMs != null && Number.isFinite(lastPromptMs)) {
    const days = Math.floor((Number(nowMs) - lastPromptMs) / DAY_MS);
    if (days < ANTI_SPAM.cooldownDays) {
      blockedReasons.push('rolling_28d_cooldown');
    }
  }

  return {
    shouldPrompt:    blockedReasons.length === 0,
    blockedReasons,
  };
}
