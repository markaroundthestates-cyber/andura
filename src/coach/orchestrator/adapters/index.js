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
// V1 status (Faza 3 STRANGLER batch 5 LANDED 2026-05-08 — 5/8 adapters wired):
//   - periodizationAdapter ✅ LANDED batch 1 (commit `de4222b`) — adapter precedent pattern
//   - goalAdaptationAdapter ✅ LANDED batch 2 (commit `905946c`) — first downstream Constraint Object consumer (read-only Hook 1)
//   - energyAdjustmentAdapter ✅ LANDED batch 3 — second downstream + Forward Constraint Object Hook 4 explicit re-emission
//   - bayesianNutritionAdapter ✅ LANDED batch 4 — third downstream consumer (read-only Hook 1, NU re-emit; engine doesn't emit forward_constraint_object)
//   - tempoAdapter ✅ LANDED batch 5 — fourth downstream consumer (read-only Hook 1, NU re-emit; same pattern Bayesian/Goal Adaptation)
//   - 3 remaining adapters PENDING — Faza 3 batches 6-8 sequential per pipeline order
//
// See: 03-decisions/030-adapter-design-pattern.md §2.1 D1
//      03-decisions/026-offline-coaching-decision-tree-exhaustive.md §42.10 + §1.10

export { periodizationAdapter } from './periodizationAdapter.js';
export { goalAdaptationAdapter } from './goalAdaptationAdapter.js';
export { energyAdjustmentAdapter } from './energyAdjustmentAdapter.js';
export { bayesianNutritionAdapter } from './bayesianNutritionAdapter.js';
export { tempoAdapter } from './tempoAdapter.js';

// Faza 3 batches 6-8 PENDING (sequential per ADR 026 §42.10):
// export { specializationAdapter } from './specializationAdapter.js';     // batch 6
// export { warmupAdapter } from './warmupAdapter.js';                     // batch 7
// export { deloadAdapter } from './deloadAdapter.js';                     // batch 8
