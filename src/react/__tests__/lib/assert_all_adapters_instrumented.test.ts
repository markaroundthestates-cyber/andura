// ══ ENGINE ADAPTER SENTRY COVERAGE — Anti-drift gate (D063 LOCK V1) ═══════
//
// BLOCKER 2 fix EVAL_AUDIT_NUCLEAR_chat5.md: D063 LOCKED V1 §2 cited this
// file ca LANDED pentru anti-drift gate, dar primary-source slip — file
// never created. Witness suite (`engineWrappers.sentry.test.ts`) proves
// runtime behavior cand engine throws, dar NU prevents future drift când
// new exported adapter added în `engineWrappers.ts` without Sentry wrap.
//
// Anti-drift paradigm (D063 §5 Rationale Bugatti): static scan asserts
// every adapter listed în D063 §2 (11 Big 11 pipeline) has both:
//   1. `captureException(...)` invocation în catch block, AND
//   2. `adapter: '<name>'` tag matching the function name.
//
// Scope per D063 LOCK V1 strict wording: React engineWrappers only
// (`src/react/lib/engineWrappers.ts`). Orchestrator pipeline adapters
// (`src/coach/orchestrator/adapters/*`) = separate post-Beta concern
// (gsd-eval-auditor finding chat 5 BLOCKER 2 caveats).
//
// Future drift scenarios this test catches:
//   - New exported adapter added without Sentry wrap → expected count mismatch
//   - Existing adapter loses captureException (e.g., refactor accident) → regex miss
//   - Adapter tag string drift (typo "getReadinness" instead of "getReadiness") → regex miss

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ENGINE_WRAPPERS_PATH = resolve(__dirname, '../../lib/engineWrappers.ts');

// Big 11 adapters per D063 LOCK V1 §2 — must each have `adapter: '<name>'`
// tag inside a `captureException(...)` call within its function body.
//
// getPatternsBanner has 2 catch paths (STAGNATION + LOW_ADHERENCE) per
// witness suite line 17 comment — counted as 1 adapter, 2 captureException
// sites. Total expected sites = 11 + 1 = 12.
const REQUIRED_ADAPTERS = [
  'getReadiness',
  'getFatigue',
  'getPRDelta',
  'getTodayWorkout',
  'getNutritionTargetsToday',
  'getAdherenceOutput',
  'getPatternsBanner',
  'getProactiveAlerts',
  'getCoachRestReason',
  'getLaggingSignal',
  'getCoachTodayQuote',
  // §F-workout-05 — why-exercise explainer adapter (whyEngine wrap) added
  // post-D063; instrumented identically (captureException + source tag).
  'getWhyExerciseSummary',
  // Schedule day-preview adapter — same pipeline as getTodayWorkout but for a
  // specific weekday (composePlannedWorkoutToday with an injected Date).
  // Instrumented identically (captureException + source tag).
  'getWorkoutForDay',
] as const;

const EXPECTED_CAPTURE_EXCEPTION_SITES = 15; // 11 Big-11 + getPatternsBanner extra sub-path + getWhyExerciseSummary (F-workout-05) + readTdeeEstimateKcal (Piesa 4 Preconizare) + getWorkoutForDay (schedule day-preview)

describe('Sentry adapter coverage anti-drift gate (D063 LOCK V1)', () => {
  const source = readFileSync(ENGINE_WRAPPERS_PATH, 'utf-8');

  it('all Big 11 adapters have adapter: <name> tag inside captureException', () => {
    const missing: string[] = [];
    for (const adapter of REQUIRED_ADAPTERS) {
      // Match `adapter: 'getXxx'` as literal Sentry tag string — line-precise,
      // ignores whitespace variants (single/double quote, surrounding spaces).
      const tagPattern = new RegExp(
        `adapter:\\s*['"\`]${adapter}['"\`]`,
      );
      if (!tagPattern.test(source)) missing.push(adapter);
    }
    expect(missing, `Adapters missing Sentry tag: ${missing.join(', ')}`).toEqual([]);
  });

  it('captureException invocation count matches 12 expected sites (11 + getPatternsBanner extra)', () => {
    // Match function-call form `captureException(` — excludes import lines,
    // type annotations, comments referencing the symbol.
    const matches = source.match(/captureException\s*\(/g) ?? [];
    expect(matches.length).toBe(EXPECTED_CAPTURE_EXCEPTION_SITES);
  });

  it('captureException helper imported from util/sentry.js (consent gate D055)', () => {
    // D055 consent gate: captureException helper goes through util/sentry.js
    // wrapper (NU direct @sentry/browser import). Drift catch: future refactor
    // bypasses consent gate via direct import → telemetryOptIn check skipped.
    const importPattern = /import\s*\{[^}]*captureException[^}]*\}\s*from\s*['"`][^'"`]*util\/sentry(?:\.js)?['"`]/;
    expect(importPattern.test(source)).toBe(true);
  });

  it('every adapter tag co-occurs with source: engine-adapter-fallback', () => {
    // Invariant: every Sentry capture from engineWrappers MUST carry
    // `source: 'engine-adapter-fallback'` for ops dashboard filter. Drift
    // catch: new adapter added cu Sentry wrap dar lipseste source tag.
    const sourceTagPattern = /source:\s*['"`]engine-adapter-fallback['"`]/g;
    const matches = source.match(sourceTagPattern) ?? [];
    // Each captureException site carries source tag → count parity.
    expect(matches.length).toBe(EXPECTED_CAPTURE_EXCEPTION_SITES);
  });

  it('every exported function with try/catch has captureException in catch block', () => {
    // Heuristic static scan: find every `} catch (e) {` block inside an
    // exported function body and assert captureException is invoked within
    // the next ~10 lines (catch handlers in engineWrappers.ts are short).
    //
    // Whitelist exception: private helpers (NOT exported) whose catches
    // return null without Sentry capture by design — defensive DB / JSON
    // read fallbacks, NOT engine-adapter-fallback semantic.
    //   - `buildSilentMmiContext`: DB.get failure → null cap context fallback
    //   - `getPhaseOverrideKcalToday`: localStorage JSON parse failure → null
    //      (silent override absent, baseline pipeline preserved)
    //   - `readPainCdl`: DB.get('pain-cdl') failure → undefined (recovery falls
    //      back to log-only state, conservative baseline — NU engine-adapter-fallback)
    //   - `detectAutoPhaseKey`: progresStore read / pure detector failure →
    //      'MAINTENANCE' (faza neutra onesta cold-start, NU engine-adapter-fallback)
    //   - `resolveActivePhase`: localStorage JSON parse failure → goal-derived
    //      phase fallback (silent override absent, coherent pipeline preserved)
    const PRIVATE_HELPERS_NO_SENTRY = [
      'buildSilentMmiContext',
      'getPhaseOverrideKcalToday',
      'readPainCdl',
      'detectAutoPhaseKey',
      'resolveActivePhase',
    ];

    const lines = source.split(/\r?\n/);
    const orphanCatches: Array<{ line: number; context: string }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      // Match `} catch (e) {` or `} catch {` patterns
      if (!/\}\s*catch\s*(?:\([^)]*\))?\s*\{/.test(line)) continue;

      // Look back ~50 lines to find enclosing function name (works for
      // declarations 1-50 lines above catch — engineWrappers.ts adapters
      // fit this window).
      let enclosingFn: string | null = null;
      for (let j = i - 1; j >= Math.max(0, i - 50); j--) {
        const lookback = lines[j]!;
        const fnMatch = lookback.match(
          /(?:export\s+)?(?:async\s+)?function\s+(\w+)/,
        );
        if (fnMatch) {
          enclosingFn = fnMatch[1]!;
          break;
        }
      }

      if (enclosingFn && PRIVATE_HELPERS_NO_SENTRY.includes(enclosingFn)) continue;

      // Look forward ~15 lines for captureException invocation in catch body.
      let foundCapture = false;
      for (let k = i; k < Math.min(lines.length, i + 15); k++) {
        if (/captureException\s*\(/.test(lines[k]!)) {
          foundCapture = true;
          break;
        }
      }

      if (!foundCapture) {
        orphanCatches.push({
          line: i + 1,
          context: `${enclosingFn ?? '<unknown>'}: ${line.trim()}`,
        });
      }
    }

    expect(
      orphanCatches,
      `Catch blocks without captureException: ${orphanCatches
        .map((o) => `L${o.line} ${o.context}`)
        .join(' | ')}`,
    ).toEqual([]);
  });
});
