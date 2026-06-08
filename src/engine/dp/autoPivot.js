// ══ BUILD F6b V4 #15 — Auto-pivot near ceiling (F6b spec §4) ═════════════════
// The classifier AND the per-lift intervention glue already ship: classifyPlateau
// (ceiling.js:141 → near_ceiling|problem|midrange) + plateauIntervention.js
// (classifyAndIntervene → near_ceiling rotates a same-muscle VARIATION; no goal move)
// behind dp_plateau_intervention_v1. The gap: nothing reads classifyPlateau across
// MANY lifts to make a GOAL-level recommendation. When a user's lifts are broadly
// near their realistic ceiling and they keep forcing PRs that won't come, the bigger
// move is to PROPOSE a goal pivot (strength → hypertrophy / work-capacity / maintenance).
//
// This is a THIN new layer — the aggregator + the proposal decision — over EXISTING
// primitives (Daniel hard rule, mirrored from plateauIntervention.js:7-8: no new
// detector, no new classifier). It reuses classifyPlateau per lift, detectGlobalStagnation
// for the sustained-stagnation gate, and the entire pushBackTiers re-prompt UX
// (evaluateReprompt) for the anti-spam cooldowns. It PROPOSES, never auto-switches:
// the worst case is a dismissable banner; the human-accept gate guards against a
// wrong pivot, the cooldowns against nagging.
//
// PURE — no DB, no side effects, no clock (the caller supplies the per-lift mu+ceiling
// exactly as dp.getSmartRecommendation already supplies them to classifyAndIntervene,
// plus nowMs + the re-prompt bookkeeping it owns). Flag-OFF (dp_auto_pivot_v1) → the
// caller never reaches this → byte-identical. Depends on dp_ceiling_v1 for a real
// mu/ceiling split (without it classifyPlateau degrades to a flat-MAX_KG proximity —
// coarser but functional, per plateauIntervention.js:26-28).

import { classifyPlateau } from './ceiling.js';
import { evaluateReprompt } from '../goalAdaptation/pushBackTiers.js';

// ── Daniel-tunable (F6b §7 — DESIGN PROPOSAL, needs a sim sweep + sanity check +
//    Daniel's wording/threshold call before the flag flips ON: a goal-pivot prompt
//    is a product/UX moment) ──
export const PIVOT_SHARE_THRESHOLD = 0.5; // ≥50% of main lifts near ceiling → propose
export const PIVOT_MIN_LIFTS = 3;         // need ≥3 main lifts to make a population call
export const PIVOT_MIN_STAGNATION_WEEKS = 2; // sustained global stagnation gate (PLATEAU_MIN_WEEKS)

// The pivot targets are the goals the volume/intensity table ALREADY supports
// (resolveGoalId, volumeLandmarks.js:70-87) — no new goal vocab. From a strength
// plateau, the productive moves are: build size where strength is capped (hipertrofie),
// a work-capacity / recomposition lean (recompozitie), or maintenance (sanatate).
export const PIVOT_TARGETS = Object.freeze(['hipertrofie', 'recompozitie', 'sanatate']);

/**
 * Share of the user's main lifts currently classified `near_ceiling`. Reuses the
 * EXISTING classifyPlateau(mu, ceiling) per lift — no new classifier. PURE.
 *
 * @param {Array<{ ex?: string, mu?: number, ceiling?: number }>} lifts per-lift mu+ceiling
 *   (the caller derives these exactly as dp supplies them to classifyAndIntervene)
 * @returns {{ share: number, nearCount: number, total: number }}
 */
export function nearCeilingShare(lifts) {
  if (!Array.isArray(lifts) || lifts.length === 0) return { share: 0, nearCount: 0, total: 0 };
  let nearCount = 0;
  let total = 0;
  for (const l of lifts) {
    if (!l || !Number.isFinite(Number(l.mu)) || Number(l.mu) <= 0) continue;
    total += 1;
    if (classifyPlateau(l.mu, l.ceiling) === 'near_ceiling') nearCount += 1;
  }
  return { share: total > 0 ? nearCount / total : 0, nearCount, total };
}

/**
 * Decide whether to PROPOSE a goal pivot (never auto-apply). Gates on:
 *   1. enough main lifts (≥ PIVOT_MIN_LIFTS) to make a population call;
 *   2. ≥ PIVOT_SHARE_THRESHOLD of them classified near_ceiling (forcing PRs that
 *      won't come) — below this, the per-lift plateauIntervention variation rotation
 *      still handles individual lifts, so no goal-level move;
 *   3. a sustained global stagnation (maxStagnationWeeks ≥ PIVOT_MIN_STAGNATION_WEEKS);
 *   4. the pushBackTiers anti-spam cooldowns (28d rolling / 60d post-goal-shift /
 *      21d post-confirm / 4-per-year cap) — so it never nags.
 *
 * Returns the proposal descriptor (the consumer renders a Tier-2 banner / Tier-3
 * confirm + applies the goal ON ACCEPT, re-routing volume/intensity through the
 * existing goal modifiers), or null when any gate blocks. PURE.
 *
 * @param {object} args
 * @param {Array<{ ex?: string, mu?: number, ceiling?: number }>} args.lifts per-lift mu+ceiling
 * @param {number} args.maxStagnationWeeks detectGlobalStagnation.maxStagnationWeeks
 * @param {string} [args.currentGoalId] resolved goal id (a target == current is dropped)
 * @param {number} args.nowMs current timestamp (ms epoch) — pure, no Date.now
 * @param {object} [args.prompts] re-prompt bookkeeping (the persisted dp-pivot-prompts)
 * @param {number} [args.prompts.lastRepromptMs]
 * @param {number} [args.prompts.lastConfirmMs]
 * @param {number} [args.prompts.lastGoalShiftMs]
 * @param {number} [args.prompts.repromptCountThisYear]
 * @returns {null | {
 *   propose: true,
 *   share: number,
 *   nearCount: number,
 *   total: number,
 *   stagnationWeeks: number,
 *   targets: string[],
 *   blockedReasons: string[],
 * }}
 */
export function proposeGoalPivot({ lifts, maxStagnationWeeks, currentGoalId, nowMs, prompts }) {
  const { share, nearCount, total } = nearCeilingShare(lifts);
  // Gate 1+2: enough lifts + a broad near-ceiling share.
  if (total < PIVOT_MIN_LIFTS) return null;
  if (share < PIVOT_SHARE_THRESHOLD) return null;
  // Gate 3: sustained global stagnation (the user is FORCING PRs that won't come).
  const weeks = Number(maxStagnationWeeks);
  if (!Number.isFinite(weeks) || weeks < PIVOT_MIN_STAGNATION_WEEKS) return null;

  // Gate 4: anti-spam cooldowns — REUSE the pushBackTiers re-prompt logic verbatim.
  const p = prompts && typeof prompts === 'object' ? prompts : {};
  const decision = evaluateReprompt({
    nowMs,
    lastRepromptMs: p.lastRepromptMs,
    lastConfirmMs: p.lastConfirmMs,
    lastGoalShiftMs: p.lastGoalShiftMs,
    repromptCountThisYear: p.repromptCountThisYear,
  });
  if (!decision.shouldPrompt) return null;

  // Drop a target identical to the current goal (don't propose what they're on).
  const cur = typeof currentGoalId === 'string' ? currentGoalId : '';
  const targets = PIVOT_TARGETS.filter((g) => g !== cur);
  if (targets.length === 0) return null;

  return {
    propose: true,
    share,
    nearCount,
    total,
    stagnationWeeks: weeks,
    targets,
    blockedReasons: decision.blockedReasons,
  };
}
