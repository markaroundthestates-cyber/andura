// ══ SIMULATOR RUNNER — orchestrates pruning → pipeline → invariants → flags ══
// Per `04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1.md` §5 + §6 + §8 storage.

import { pruneInvalidCombos, PRUNE_VERDICTS } from './pruning.js';
import { runEnginesPipeline } from './pipeline.js';
import { validateBranch } from './invariants.js';
import { flagBranch, claudeReasoningRequired } from './flagging.js';

/** @typedef {import('./types.js').ConstraintObject} ConstraintObject */
/** @typedef {import('./types.js').BranchReport} BranchReport */

/**
 * Generate deterministic branch_id per design §4.
 * @param {ConstraintObject} c
 */
export function branchId(c) {
  const personaTag = String(c.persona.name).toLowerCase().replace(/[^a-z0-9]+/g, '');
  const goalPhase = `${c.goal.template}-${c.goal.phase}`.toLowerCase();
  const equipTag = c.equipment.length === 0 ? 'none' : c.equipment.map((e) => String(e).toLowerCase()).join('+');
  const recoveryTag = (c.recovery.injury_flags.length > 0 ? c.recovery.injury_flags.map((f) => String(f).toLowerCase()).join('+') : 'clean')
    + `-vit-${c.recovery.vitality_tier.toLowerCase()}`;
  return [
    personaTag,
    goalPhase,
    c.experience,
    equipTag,
    `${c.schedule.frequency}x`,
    c.history.tier,
    recoveryTag,
  ].join('-');
}

/**
 * Run full simulation pipeline for a list of candidate ConstraintObjects.
 *
 * @param {ReadonlyArray<ConstraintObject>} candidates
 * @returns {Promise<{
 *   branches: BranchReport[],
 *   pruned: { rule: string, branch: ConstraintObject }[],
 *   tripwires: ConstraintObject[],
 *   summary: {
 *     total_candidates: number,
 *     valid_branches: number,
 *     auto_resolved: number,
 *     flagged: number,
 *     invariant_violations: number,
 *     pruned_count: number,
 *     tripwire_count: number,
 *   },
 *   performance: {
 *     median_ms: number,
 *     p95_ms: number,
 *     budget_met: boolean,
 *   }
 * }>}
 */
export async function runFullSimulation(candidates) {
  const { valid, pruned, tripwires } = pruneInvalidCombos(candidates);

  /** @type {BranchReport[]} */
  const branches = [];
  /** @type {number[]} */
  const perBranchMs = [];

  for (const c of valid) {
    const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const out = await runEnginesPipeline(c);
    const invariants = validateBranch(out, c);
    const partialReport = { input: c, engines_pipeline_output: out, invariants_check: invariants };
    const flags = flagBranch(partialReport);
    const claude_reasoning_required = claudeReasoningRequired(flags);
    const status = flags.length > 0 ? 'FLAGGED' : 'AUTO_RESOLVED';

    /** @type {BranchReport} */
    const report = {
      branch_id: branchId(c),
      input: c,
      engines_pipeline_output: out,
      invariants_check: invariants,
      flags,
      claude_reasoning_required,
      status,
    };
    branches.push(report);
    const t1 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    perBranchMs.push(t1 - t0);
  }

  const auto_resolved = branches.filter((b) => b.status === 'AUTO_RESOLVED').length;
  const flagged = branches.filter((b) => b.status === 'FLAGGED').length;
  const invariant_violations = branches.filter((b) => b.flags.includes('invariant_violation')).length;

  // Performance budget per design §7: median <50ms, P95 <100ms.
  const sorted = [...perBranchMs].sort((a, b) => a - b);
  const median_ms = sorted.length === 0 ? 0 : sorted[Math.floor(sorted.length / 2)];
  const p95_ms = sorted.length === 0 ? 0 : sorted[Math.floor(sorted.length * 0.95)];

  return {
    branches,
    pruned,
    tripwires,
    summary: {
      total_candidates: candidates.length,
      valid_branches: valid.length,
      auto_resolved,
      flagged,
      invariant_violations,
      pruned_count: pruned.length,
      tripwire_count: tripwires.length,
    },
    performance: {
      median_ms,
      p95_ms,
      budget_met: median_ms < 50 && p95_ms < 100,
    },
  };
}

/**
 * Filter only flagged branches — input pentru Faza 2 filter workflow.
 * Per design §8 storage layout: `simulations/scenarios_coverage_v1_flagged_only.json`.
 * @param {ReadonlyArray<BranchReport>} branches
 */
export function filterFlaggedOnly(branches) {
  return branches.filter((b) => b.claude_reasoning_required);
}

// re-export pruning verdicts for runner consumers
export { PRUNE_VERDICTS };
