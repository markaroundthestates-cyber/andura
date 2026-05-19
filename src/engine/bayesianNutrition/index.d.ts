// ══ BAYESIAN NUTRITION ENGINE — TS Ambient Types ═════════════════════════
// §1-M1 audit fix — sibling .d.ts companion eliminating `as any` cast at
// engineWrappers.ts call site. Per Phase 4 task_11 §A pattern (readiness.d.ts /
// fatigue.d.ts / prEngine.d.ts). Engine source JSDoc-typed; TS resolves .d.ts
// before .js fallback inference.
//
// Cross-refs:
//   - src/engine/bayesianNutrition/index.js (engine source, JSDoc types)
//   - src/engine/bayesianNutrition/types.js (BayesianNutritionResult shape)
//   - DECISIONS.md §D-LEGACY-017 Bayesian Nutrition Inference

export interface BayesianNutritionContext {
  user?: Record<string, unknown>;
  recentSessions?: ReadonlyArray<Record<string, unknown>>;
  meta?: {
    demographicMu?: number;
    demographicSigma?: number;
    previousPhase?: string;
    currentPhase?: string;
    observations?: ReadonlyArray<{ kcalDaily?: number } & Record<string, unknown>>;
    periodizationConstraint?: Record<string, unknown> | null;
    [k: string]: unknown;
  };
  flags?: Record<string, unknown>;
  [k: string]: unknown;
}

export interface BayesianNutritionResult {
  tier?: string;
  confidence?: string;
  meta?: {
    nutrition_inference_metadata?: {
      posterior?: { mu?: number; sigma?: number };
      prior?: { mu?: number; sigma?: number };
      observations?: ReadonlyArray<unknown>;
    };
    [k: string]: unknown;
  };
  signals?: ReadonlyArray<string>;
  trace?: Record<string, unknown>;
  [k: string]: unknown;
}

export function evaluate(ctx?: BayesianNutritionContext): Promise<BayesianNutritionResult>;
