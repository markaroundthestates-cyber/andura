// Adapter ENGINE_THREW catch coverage — ADR 030 D4 violation insurance.
//
// Existing per-adapter parity tests force a FAKE throwing adapter (which the
// orchestrator catches as ADAPTER_THREW), so the adapters' OWN try/catch — the
// block that wraps an engine throw into `{ ok:false, error:{ code:ENGINE_THREW,
// severity:'hard' } }` + Sentry capture — was never executed (only deloadParity
// spied the real engine). This file closes that gap for the remaining adapters
// by spying the engine `evaluate` and rejecting once, exercising the real
// adapter catch per §3.6 ENGINE_THREW taxonomy.

import { describe, it, expect, vi } from 'vitest';
import * as periodizationEngine from '../../../engine/periodization/index.js';
import * as goalAdaptationEngine from '../../../engine/goalAdaptation/index.js';
import * as energyAdjustmentEngine from '../../../engine/energyAdjustment/index.js';
import * as bayesianNutritionEngine from '../../../engine/bayesianNutrition/index.js';
import * as tempoEngine from '../../../engine/tempo/index.js';
import * as specializationEngine from '../../../engine/specialization/index.js';
import * as warmupEngine from '../../../engine/warmup/index.js';
import { periodizationAdapter } from '../adapters/periodizationAdapter.js';
import { goalAdaptationAdapter } from '../adapters/goalAdaptationAdapter.js';
import { energyAdjustmentAdapter } from '../adapters/energyAdjustmentAdapter.js';
import { bayesianNutritionAdapter } from '../adapters/bayesianNutritionAdapter.js';
import { tempoAdapter } from '../adapters/tempoAdapter.js';
import { specializationAdapter } from '../adapters/specializationAdapter.js';
import { warmupAdapter } from '../adapters/warmupAdapter.js';
import { runPipeline } from '../index.js';
import { buildEngineContext } from '../contextBuilder.js';

// Periodization needs no upstream Constraint Object; every downstream adapter
// requires ctx.meta.constraintObject to pass its prerequisite guard and reach
// the engine call (then the spy throws → adapter catch).
const baseUser = { user: { sex: 'M', age: 30, kg: 80, bf: 18 } };
const ctxNoCO = buildEngineContext(baseUser);
const ctxWithCO = buildEngineContext({
  ...baseUser,
  meta: {
    constraintObject: Object.freeze({
      phase: 'LOAD',
      intensity_pct_1rm: { floor: 0.7, ceiling: 0.85 },
      volume_per_muscle: {},
      immutable_snapshot: true,
    }),
  },
});

const CASES = [
  { name: 'periodization', module: periodizationEngine, adapter: periodizationAdapter, ctx: ctxNoCO },
  { name: 'goalAdaptation', module: goalAdaptationEngine, adapter: goalAdaptationAdapter, ctx: ctxWithCO },
  { name: 'energyAdjustment', module: energyAdjustmentEngine, adapter: energyAdjustmentAdapter, ctx: ctxWithCO },
  { name: 'bayesianNutrition', module: bayesianNutritionEngine, adapter: bayesianNutritionAdapter, ctx: ctxWithCO },
  { name: 'tempo', module: tempoEngine, adapter: tempoAdapter, ctx: ctxWithCO },
  { name: 'specialization', module: specializationEngine, adapter: specializationAdapter, ctx: ctxWithCO },
  { name: 'warmup', module: warmupEngine, adapter: warmupAdapter, ctx: ctxWithCO },
];

describe('Adapter own try/catch → ENGINE_THREW (ADR 030 §3.6 D4 insurance)', () => {
  for (const { name, module, adapter, ctx } of CASES) {
    it(`${name}: engine evaluate throws via spy → { ok:false, error.code ENGINE_THREW, severity hard }`, async () => {
      const spy = vi
        .spyOn(module, 'evaluate')
        .mockRejectedValueOnce(new Error(`simulated ${name} engine fault`));
      try {
        const results = await runPipeline(ctx, [adapter]);
        expect(results).toHaveLength(1);
        expect(results[0].ok).toBe(false);
        // Real adapter catch (NOT orchestrator ADAPTER_THREW) per §3.6 taxonomy.
        expect(results[0].error.code).toBe('ENGINE_THREW');
        expect(results[0].error.severity).toBe('hard');
        expect(results[0].error.message).toMatch(new RegExp(`${name} engine fault`));
      } finally {
        spy.mockRestore();
      }
    });
  }
});
