// ══ ENGINE MOCK BUILDERS — Test-Utility Fixtures ════════════════════════
//
// NIT-CODE-06 Option B (createMockContext builder) per investigation
// 📤_outbox/NIT_CODE_06_AS_UNKNOWN_INVESTIGATION_chat5.md §3 + §4.
//
// Why this file exists:
//   src/engine/*.js engines stay JS per D015 LOCK V1 (ADR engines-stay-pure-JS
//   invariant). JSDoc @returns {Array<any>} surfaces as `any[]` in TS strict
//   mode, so vi.mocked(...).mockReturnValue(literal) cannot narrow partial
//   fixtures without `as unknown as ReturnType<typeof engineFn>` escape hatch.
//
//   These factories concentrate the cast into ONE typed builder per engine,
//   so test bodies stay clean (intent expressed via builder name) and the
//   cast is documented + reversible at a single location.
//
// Cross-refs:
//   - DECISIONS.md §D015 STRAT PIVOT — engines stay JS, React wrappers TS
//   - src/engine/proactiveEngine.js §301 runProactiveChecks (JSDoc Array<any>)
//   - src/engine/adherence.js §6 getAdherenceScore ({score, color, label})
//   - src/engine/bayesianNutrition/index.d.ts BayesianNutritionResult
//   - CODE_STYLE.md §"Test mock typing pattern" (NIT-CODE-06 codification)
//
// Pattern: typed factory functions accept Partial<Shape> overrides + return
// the cast type expected by vi.mocked(...).mockReturnValue(...). Cast is
// hoisted out of test bodies into this single, documented location.

import type { runProactiveChecks } from '../engine/proactiveEngine.js';
import type { getAdherenceScore } from '../engine/adherence.js';
import type { evaluate as evaluateBN } from '../engine/bayesianNutrition/index.js';

// ── Proactive Alert (engine internal shape) ──────────────────────────────
//
// Engine emits {type, severity, message, ...extras} via 10 check functions
// (checkProteinDeficit, checkSleepDebt, ...). No exported interface — shape
// is ad-hoc per JSDoc @returns {Array<any>}. Builder matches Phase 6 task_05
// wrapper expectations (getProactiveAlerts reads alert.type + alert.severity
// + alert.message defensively).

export interface ProactiveAlertMockShape {
  type: string;
  severity: string; // engine emits 'warning' | 'info' | 'success' (also accepts unknown for negative-path tests)
  message: string;
  [k: string]: unknown; // engine checks emit extras (e.g. {ml: number} for hydration)
}

/**
 * Build a single proactive alert literal with sane defaults + overrides.
 * Returns the engine internal shape (not the mapped UI ProactiveAlert).
 */
export function createMockProactiveAlert(
  overrides: Partial<ProactiveAlertMockShape> = {},
): ReturnType<typeof runProactiveChecks>[number] {
  const base: ProactiveAlertMockShape = {
    type: 'mock_alert',
    severity: 'info',
    message: 'mock message',
    ...overrides,
  };
  return base as unknown as ReturnType<typeof runProactiveChecks>[number];
}

/**
 * Build an array of proactive alerts. Useful for vi.mocked(runProactiveChecks)
 * .mockReturnValue(...) — replaces the `as unknown as ReturnType<typeof
 * runProactiveChecks>` cast spread across test bodies.
 */
export function createMockProactiveAlertList(
  items: Array<Partial<ProactiveAlertMockShape>> = [],
): ReturnType<typeof runProactiveChecks> {
  return items.map((item) => createMockProactiveAlert(item)) as unknown as ReturnType<
    typeof runProactiveChecks
  >;
}

// ── Adherence Score (engine internal shape) ──────────────────────────────
//
// Engine returns `{score, color, label}` (src/engine/adherence.js §72).
// `score` is number 0-100; clamping happens in wrapper getAdherenceOutput.
// Builder default = baseline "OK" 75; overrides for negative-path tests
// (score: 'high' as unknown as number, missing score field, null result).

export interface AdherenceScoreMockShape {
  score: number;
  color: string;
  label: string;
}

/**
 * Build an adherence engine result with sane defaults + overrides.
 * For null-return tests, pass `null` directly to mockReturnValueOnce — this
 * builder is for the happy/structural variants.
 */
export function createMockAdherenceScore(
  overrides: Partial<AdherenceScoreMockShape> = {},
): ReturnType<typeof getAdherenceScore> {
  const base: AdherenceScoreMockShape = {
    score: 75,
    color: 'var(--accent)',
    label: 'OK',
    ...overrides,
  };
  return base as unknown as ReturnType<typeof getAdherenceScore>;
}

// ── Bayesian Nutrition Result (engine async shape) ───────────────────────
//
// Engine returns Promise<BayesianNutritionResult> with tier + confidence +
// meta.nutrition_inference_metadata.posterior.{mu, sigma}. Tests need partial
// fixtures — builder accepts deep overrides at meta/posterior level.
//
// Default = minimal-valid MED tier result with posterior.mu = 2500 (mid-range
// kcal). Override `meta` to test floor/baseline/missing-posterior branches.

export interface BNPosteriorMockShape {
  mu?: number;
  sigma?: number;
  observations_count?: number;
  ci_lower?: number;
  ci_upper?: number;
}

export interface BNResultMockShape {
  id: string;
  tier: string;
  confidence: string;
  signals: ReadonlyArray<unknown>;
  recommendations: ReadonlyArray<unknown>;
  trace: Record<string, unknown>;
  meta:
    | {
        nutrition_inference_metadata?: { posterior?: BNPosteriorMockShape };
        likelihood_probabilities?: Record<string, unknown>;
        profile_typing?: Record<string, unknown>;
        ui_tier?: string;
        passive_mode_active?: boolean;
        signals?: ReadonlyArray<unknown>;
      }
    | Record<string, unknown>;
}

/**
 * Build a Bayesian Nutrition engine result with sane defaults + overrides.
 *
 * Default emits tier MED + confidence medium + posterior.mu 2500 (mid-range
 * happy path). Override `meta` shallow to drop nutrition_inference_metadata
 * (tests missing-meta branch). Override `tier: 'none'` for T0 fresh-user
 * baseline-fallback path. For null-return tests pass `null` direct to
 * mockResolvedValueOnce — this builder is for shape variants.
 */
export function createMockBNResult(
  overrides: Partial<BNResultMockShape> = {},
): Awaited<ReturnType<typeof evaluateBN>> {
  const base: BNResultMockShape = {
    id: 'bayesianNutrition',
    tier: 'MED',
    confidence: 'medium',
    signals: [],
    recommendations: [],
    trace: {},
    meta: {
      nutrition_inference_metadata: {
        posterior: { mu: 2500 },
      },
    },
    ...overrides,
  };
  return base as unknown as Awaited<ReturnType<typeof evaluateBN>>;
}
