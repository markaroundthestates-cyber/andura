// Coach Brain Eval — Andura-side runner.
//
// Per COACH_BRAIN_EVAL_DESIGN.md §2.1 + §7.4: target the CANONICAL orchestrator
// layer (runPipeline + buildEngineContext), NOT the legacy coachDirector
// (which reads localStorage + has side effects). Pure, frozen, Result-typed.

import { runPipeline } from '../../src/coach/orchestrator/index.js';
import { ORDERED_ADAPTERS } from '../../src/coach/orchestrator/adapters/index.js';
import { buildEngineContext } from '../../src/coach/orchestrator/contextBuilder.js';
import { normalize } from './normalize.js';

/**
 * Build the canonical EngineContext from a scenario userState (single frozen
 * object, §2.3 identical-input contract source).
 *
 * @param {{userState: object}} scenario
 */
export function buildCtx(scenario) {
  return buildEngineContext(scenario.userState);
}

/**
 * Run the full 8-adapter pipeline over a scenario and normalize the result.
 *
 * @param {{id:string, userState:object, archetype?:string, params?:object}} scenario
 * @returns {Promise<{scenario:object, ctx:object, results:Array, decision:object}>}
 */
export async function runScenario(scenario) {
  const ctx = buildCtx(scenario);
  const results = await runPipeline(ctx, ORDERED_ADAPTERS);
  const decision = normalize(results);
  return { scenario, ctx, results, decision };
}

/**
 * Run many scenarios sequentially. Deterministic + pure → order-independent,
 * but kept sequential for stable memory profile at 50k scale.
 *
 * @param {Array<object>} scenarios
 * @returns {Promise<Array<{scenario:object, decision:object}>>}
 */
export async function runAll(scenarios) {
  const out = [];
  for (const s of scenarios) {
    const { decision } = await runScenario(s);
    out.push({ scenario: s, decision });
  }
  return out;
}
