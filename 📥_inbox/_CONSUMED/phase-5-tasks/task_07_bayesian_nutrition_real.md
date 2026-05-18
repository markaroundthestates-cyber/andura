# task_07 — Bayesian Nutrition Inference Real Wire

**Phase:** 5 (engine pipeline real wire)
**Type:** Feature — engine consumer wire
**Deps:** task_06 (coachDirector exists)
**Backup tag:** `pre-phase5-task-07-2026-05-17`
**Est commits:** 2 atomic (wrapper + NutritionInline consume)
**Est tests delta:** +8-12

---

## §1 Scope

Bayesian Nutrition Inference Engine #3 (DECISIONS §D-LEGACY-017 ADR 022) live în `src/engine/bayesianNutrition.js` cu LOCK 8 kcal floor 1200 observation filter (D-LEGACY-041). React `NutritionInline.tsx` Phase 4 task_20 hardcodes stub:
- Auto target kcal: 2640 (mockup verbatim L1812)
- Auto target protein: 180g (mockup verbatim L1825)

Task 07: replace stubs cu real engine call adaptive TDEE per user observation log + LOCK 8 floor filter preserved invariant.

## §2 Changes

### A. Grep verify engine API

```bash
ls -la src/engine/bayesianNutrition.js && grep -n "export" src/engine/bayesianNutrition.js
```

Expected exports `getKcalTarget()` + `getProteinTarget()` sau aggregate `getNutritionTargets()`.

### B. `src/react/lib/engineWrappers.ts` (extend)

```tsx
import { getNutritionTargets } from '../../engine/bayesianNutrition.js';

export interface NutritionTargets {
  kcalTarget: number;
  proteinTargetG: number;
  source: 'engine' | 'fallback';
  confidence: number; // 0-1 Kalman filter state
}

export function getNutritionTargetsToday(): NutritionTargets {
  try {
    const raw = getNutritionTargets();
    if (!raw || raw.kcalTarget == null) {
      return { kcalTarget: 2640, proteinTargetG: 180, source: 'fallback', confidence: 0 };
    }
    // LOCK 8 floor filter invariant D-LEGACY-041
    const safeKcal = Math.max(raw.kcalTarget, 1200);
    return {
      kcalTarget: safeKcal,
      proteinTargetG: raw.proteinTargetG,
      source: 'engine',
      confidence: raw.confidence ?? 0.5,
    };
  } catch (e) {
    console.warn('[engineWrappers] getNutritionTargetsToday failed:', e);
    return { kcalTarget: 2640, proteinTargetG: 180, source: 'fallback', confidence: 0 };
  }
}
```

### C. `src/react/components/NutritionInline.tsx` (consume)

Replace hardcoded:
```tsx
// Before:
const AUTO_KCAL = 2640;
const AUTO_PROTEIN = 180;

// After:
const targets = useMemo(() => getNutritionTargetsToday(), []);
// Use targets.kcalTarget / targets.proteinTargetG inline
// Optionally render source indicator (engine vs fallback) — preserve "Auto din engine" label per mockup L1832
```

Source indicator visual subtle:
- "Auto din engine" (default, când source=engine)
- "Estimare" subtler (când source=fallback, NU show indicator "fallback" — Gigel test pass)

### D. `src/react/stores/nutritionStore.ts` (preserve)

Manual override pattern Phase 4 preserved invariant — user can manually log kcal/protein chips cu pencil edit. Engine auto-target = default value când no manual log. Manual log = priority displayed.

## §3 Acceptance criteria

- [ ] NutritionInline uses real `getNutritionTargetsToday()` (NU hardcoded 2640/180)
- [ ] LOCK 8 floor 1200 invariant preserved (Math.max guard)
- [ ] Source indicator subtle (NU "fallback" jargon Gigel-confusing)
- [ ] Manual override priority preserved (user log > engine auto)
- [ ] Tests +8-12 PASS
- [ ] TS strict 0 errors

## §4 Tests

```bash
src/react/__tests__/engineWrappers.getNutritionTargetsToday.test.tsx
- returns engine output when available
- falls back to 2640/180 when engine throws
- enforces LOCK 8 floor 1200 (raw 800 → 1200)
- preserves protein target unmodified

src/react/__tests__/NutritionInline.engineWire.test.tsx
- renders engine target by default
- preserves manual override priority
- shows "Auto din engine" label when source=engine
```

## §5 Commits (atomic 2)

```
feat(react/lib): engineWrappers getNutritionTargetsToday real Bayesian wire

Replaces Phase 4 task_20 stub 2640 kcal / 180g protein hardcoded cu real
bayesianNutrition.getNutritionTargets() Kalman filter adaptive TDEE.
LOCK 8 kcal floor 1200 invariant preserved (Math.max guard) per
DECISIONS §D-LEGACY-041 observation filter NU adjustment.

feat(react/components): NutritionInline consume real engine targets

Replaces hardcoded constants. Source indicator subtle (engine vs fallback
neutral wording NU jargon). Manual override priority preserved invariant.
Mockup verbatim L1800-1834 copy preserved cumulative.
```

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_07_bayesian_nutrition_real.md`:
- Engine API signature verify
- Fallback path (engine null → 2640/180)
- LOCK 8 floor 1200 invariant confirm
- Manual override priority preserved
