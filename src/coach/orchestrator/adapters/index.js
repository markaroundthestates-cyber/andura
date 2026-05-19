// Adapters barrel export per ADR 030 D1 LOCKED V1 — 8-engine topology.
//
// 1 adapter per engine, additive plug-in pattern (Open-Closed) per ADR 018 §1
// Dimension Registry. Adding engine #9 = new adapter file + add to barrel —
// NU edit central God object.
//
// Pipeline ordering per ADR 026 §42.10 sequential strict (Q-OPEN-4 RESOLVED V1):
//   1. Periodization → 2. Goal Adaptation → 3. Energy Adjustment →
//   4. Bayesian Nutrition → 5. Tempo → 6. Specialization → 7. Warm-up → 8. Deload
//
// V1 status (Faza 3 STRANGLER batch 8 LANDED 2026-05-18 — 8/8 adapters wired COMPLETE):
//   - periodizationAdapter ✅ LANDED batch 1 (commit `de4222b`) — adapter precedent pattern
//   - goalAdaptationAdapter ✅ LANDED batch 2 (commit `905946c`) — first downstream Constraint Object consumer (read-only Hook 1)
//   - energyAdjustmentAdapter ✅ LANDED batch 3 — second downstream + Forward Constraint Object Hook 4 explicit re-emission
//   - bayesianNutritionAdapter ✅ LANDED batch 4 — third downstream consumer (read-only Hook 1, NU re-emit; engine doesn't emit forward_constraint_object)
//   - tempoAdapter ✅ LANDED batch 5 — fourth downstream consumer (read-only Hook 1, NU re-emit; same pattern Bayesian/Goal Adaptation)
//   - specializationAdapter ✅ LANDED batch 6 — fifth downstream consumer (read-only Hook 1, NU re-emit; §36.84 Gap #1 wires weaknessDetector orfan)
//   - warmupAdapter ✅ LANDED batch 7 — sixth downstream consumer (read-only Hook D1, NU re-emit; persona-aware 5-10 min Hybrid + T0 Instant Skip default)
//   - deloadAdapter ✅ LANDED batch 8 ULTIM — seventh downstream consumer (read-only Hook D1, NU re-emit; pipeline §42.10 TERMINAL post Deload completes 8/8 V1 prescriptive engines wired)
//
// See: 03-decisions/_FROZEN/030-adapter-design-pattern.md §2.1 D1
//      03-decisions/_FROZEN/026-offline-coaching-decision-tree-exhaustive.md §42.10 + §1.10

import { periodizationAdapter } from './periodizationAdapter.js';
import { goalAdaptationAdapter } from './goalAdaptationAdapter.js';
import { energyAdjustmentAdapter } from './energyAdjustmentAdapter.js';
import { bayesianNutritionAdapter } from './bayesianNutritionAdapter.js';
import { tempoAdapter } from './tempoAdapter.js';
import { specializationAdapter } from './specializationAdapter.js';
import { warmupAdapter } from './warmupAdapter.js';
import { deloadAdapter } from './deloadAdapter.js';

export { periodizationAdapter };
export { goalAdaptationAdapter };
export { energyAdjustmentAdapter };
export { bayesianNutritionAdapter };
export { tempoAdapter };
export { specializationAdapter };
export { warmupAdapter };
export { deloadAdapter };

/**
 * §8-H1 audit fix — pipeline ordering enforced via explicit ORDERED_ADAPTERS
 * array, NU barrel export order (fragile to refactor / alphabetical sort).
 * Runner SHOULD consume this array to guarantee §42.10 prescriptive sequence.
 * Adding engine #9 = append here + add adapter export above.
 *
 * Ordering invariant: Periodization → Goal Adaptation → Energy Adjustment →
 * Bayesian Nutrition → Tempo → Specialization → Warm-up → Deload
 * (per ADR 026 §42.10 + ADR 030 §2.1 D1 LOCKED V1).
 */
export const ORDERED_ADAPTERS = Object.freeze([
  periodizationAdapter,
  goalAdaptationAdapter,
  energyAdjustmentAdapter,
  bayesianNutritionAdapter,
  tempoAdapter,
  specializationAdapter,
  warmupAdapter,
  deloadAdapter,
]);
