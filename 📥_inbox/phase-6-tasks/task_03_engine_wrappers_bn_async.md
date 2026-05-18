# task_03 — engineWrappers BN Async Wrapper

**Phase:** 6 (engine pipeline real wire)
**Type:** Feature — async wrapper Bayesian Nutrition engine
**Deps:** task_02 LANDED
**Backup tag:** `pre-phase6-task-03-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +8-10

---

## §1 Scope

`bayesianNutritionAggregate.ts` Phase 5 task_07 hardcodes `BASELINE_KCAL_TARGET=2640` + `BASELINE_PROTEIN_TARGET=180` (mockup verbatim L1812/L1825). Real engine `src/engine/bayesianNutrition/index.js` cu `async evaluate(ctx)` pure-function Kalman filter adaptive TDEE — needs async wrapper React-friendly în `engineWrappers.ts`.

## §2 Changes

### A. Grep verify primary-source

```bash
ls -la src/engine/bayesianNutrition/
grep -n "export" src/engine/bayesianNutrition/index.js
```

Engine signature verified: `async function evaluate(ctx) → Promise<BNResult>` cu blueprint `.meta = { kcal_target, protein_target_g, fat_g, carbs_g, confidence, ... }`.

### B. `src/react/lib/engineWrappers.ts` (extend)

```tsx
import { evaluate as evaluateBN } from '../../engine/bayesianNutrition/index.js';

export interface NutritionTargetsEngine {
  kcalTarget: number;
  proteinTargetG: number;
  fatG: number;
  carbsG: number;
  source: 'engine' | 'baseline';
  confidence: number; // 0-1
}

const BASELINE_NUTRITION: NutritionTargetsEngine = {
  kcalTarget: 2640,
  proteinTargetG: 180,
  fatG: 70,
  carbsG: 280,
  source: 'baseline',
  confidence: 0,
};

const KCAL_FLOOR_DAILY_MIN = 1200; // LOCK 8 D-LEGACY-041 floor filter invariant

/**
 * Real wire Bayesian Nutrition Engine adaptive TDEE per user observation log.
 * LOCK 8 floor 1200 invariant preserved (Math.max guard) per
 * DECISIONS §D-LEGACY-041 observation filter NU adjustment.
 *
 * Returns baseline fallback dacă engine throws sau ctx empty (T0 fresh).
 */
export async function getNutritionTargetsToday(
  userState?: object,
): Promise<NutritionTargetsEngine> {
  try {
    const ctx = userState || {};
    const result = await evaluateBN(ctx);
    if (!result?.meta || result.tier === 'none') return BASELINE_NUTRITION;
    const meta = result.meta;
    const safeKcal = Math.max(meta.kcal_target || 0, KCAL_FLOOR_DAILY_MIN);
    return {
      kcalTarget: safeKcal,
      proteinTargetG: meta.protein_target_g || BASELINE_NUTRITION.proteinTargetG,
      fatG: meta.fat_g || BASELINE_NUTRITION.fatG,
      carbsG: meta.carbs_g || BASELINE_NUTRITION.carbsG,
      source: 'engine',
      confidence: result.confidence === 'high' ? 1 : result.confidence === 'medium' ? 0.5 : 0.2,
    };
  } catch (e) {
    console.warn('[engineWrappers] getNutritionTargetsToday failed:', e);
    return BASELINE_NUTRITION;
  }
}
```

### C. Tests `src/react/__tests__/engineWrappers.getNutritionTargetsToday.test.tsx`

```js
- returns engine output cand evaluate succeeds
- falls back to baseline cand engine throws
- enforces LOCK 8 floor 1200 (raw 800 → 1200)
- preserves protein target unmodified
- confidence mapping high=1 / medium=0.5 / low=0.2
- tier 'none' empty ctx → baseline
- engine result null → baseline
- engine result missing meta → baseline
```

## §3 Acceptance criteria

- [ ] `getNutritionTargetsToday()` async export LANDED
- [ ] LOCK 8 floor 1200 invariant preserved
- [ ] Baseline fallback wired (engine throws / tier none)
- [ ] Tests +8 minim PASS
- [ ] TS strict 0 errors

## §4 Tests delta target +8-10

## §5 Commit

```
feat(react/lib): engineWrappers getNutritionTargetsToday async BN engine wrapper

NEW async export invokes bayesianNutrition.evaluate(ctx) Kalman filter
adaptive TDEE pipeline output. LOCK 8 kcal floor 1200 invariant preserved
(Math.max guard) per DECISIONS §D-LEGACY-041. Baseline fallback graceful
when engine throws or tier 'none' (T0 fresh user pre-observation).

Unlocks task_04 React bayesianNutritionAggregate real wire consumer.
```

## §6 Next

task_04 React `bayesianNutritionAggregate.ts` replace baselines consume `getNutritionTargetsToday()`.
