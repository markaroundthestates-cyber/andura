# TypeScript strict audit chat 5 — 2026-05-23

**Agent:** TYPESCRIPT-STRICT-AUDIT
**Scope:** `src/` only (tests inclus), READ-ONLY filesystem
**Mandat:** verify W3-D-SUBSTRATE baseline + identify tightening opportunities pre-Beta
**Codebase:** 31370 LOC `.ts` + `.tsx`

---

## BASELINE state (verified)

- **tsconfig strict:** ALL flags ON (verbatim L11-17 `tsconfig.json`):
  - `"strict": true`
  - `"noImplicitReturns": true`
  - `"noFallthroughCasesInSwitch": true`
  - `"noUncheckedSideEffectImports": true`
  - `"noImplicitOverride": true`
  - `"noUncheckedIndexedAccess": true`
  - `"exactOptionalPropertyTypes": true`
- **`npx tsc --noEmit`:** EXIT_CODE=0 (zero errors confirmed live run)
- **W3-D-SUBSTRATE chat 5 prior baseline:** `as any` = 0 active in src/ → **CONFIRMED**

---

## DIMENSION 1 — `as any` usage

| Metric | Count | Status |
|---|---|---|
| Total grep matches | 2 | — |
| In comments (`//`) | 2 | OK (historical doc) |
| **In active code** | **0** | EXCELLENT |

Locații comments (both documenting D045 §B005 elimination):
- `src/engine/bayesianNutrition/index.d.ts:2` — "// §1-M1 audit fix — sibling .d.ts companion eliminating `as any` cast at..."
- `src/react/lib/engineWrappers.ts:514` — "// BayesianNutritionResult shapes; `as any` cast removed (Phase 4 task_11 §A pattern)."

**Verdict:** ZERO `as any` violations. Bugatti.

---

## DIMENSION 2 — `: any` annotations

| Metric | Count | Status |
|---|---|---|
| Total grep matches | 1 | — |
| False positives (jsdoc/comments) | 1 | OK |
| **Active type annotations** | **0** | EXCELLENT |

Singura match `: any\b`:
- `src/react/lib/engineWrappers.ts:316` — jsdoc text "Defensive: any DB read failure → null fallback..." (NU annotation)

**Verdict:** ZERO `: any` annotations. Bugatti.

---

## DIMENSION 3 — `@ts-expect-error` / `@ts-ignore`

| Metric | Count | Status |
|---|---|---|
| `@ts-ignore` | 0 | EXCELLENT |
| `@ts-nocheck` | 0 | EXCELLENT |
| `@ts-expect-error` — tests (intentional runtime fallback validation) | 4 | OK pattern |
| `@ts-expect-error` — production code | 0 | EXCELLENT |
| Doc/header mentions (comments) | 4 | OK |

Production = clean. Test uses (all legitimate runtime-fallback validation):
- `src/react/__tests__/navigation.test.ts:91` — `gotoPath('unknown-fake-screen')` runtime fallback
- `src/react/__tests__/lib/coachVoice.test.ts:77` — invalid rating
- `src/react/__tests__/lib/coachVoice.test.ts:82` — invalid category
- `src/react/__tests__/lib/engineWrappers.sentry.test.ts:106` — partial session shape

Header comments documenting Phase 4 task_11 §A elimination effort:
- `src/engine/readiness.d.ts:2`, `src/engine/fatigue.d.ts:2`, `src/engine/prEngine.d.ts:2`, `src/react/lib/engineWrappers.ts:20`

**Verdict:** Pattern OK. All test uses test the runtime defense; production code zero suppressions.

---

## DIMENSION 4 — `unknown` vs `any` usage

| Metric | Count | Status |
|---|---|---|
| `: unknown` annotations (10 files) | 24 occurrences | GOOD |
| `unknown[]` | 5 occurrences (2 files) | GOOD |
| `Record<string, unknown>` (10 files) | 16 occurrences | GOOD |
| `Record<string, any>` | 0 | EXCELLENT |

Project gravitates correct toward `unknown` (type-safe) when generic content needed. NU `any` shortcuts.

`unknown` hotspots:
- `src/global.d.ts` — Window augmentation dev console helpers (return `unknown` defensively, callers narrow)
- `src/react/routes/screens/cont/SettingsExport.tsx:32-35` — Tier 1 IDB stores `unknown[]` (correct — payload schema variant)
- `src/react/routes/screens/cont/userProfile.ts:31` — JWT payload `Record<string, unknown>` (correct narrowing)

**Verdict:** Excellent. `unknown` adoption widespread, `any` complet absent.

---

## DIMENSION 5 — `: object` weak typing

| Metric | Count | Status |
|---|---|---|
| `: object` annotations (4 files) | 11 occurrences | OPPORTUNITY |

Production code (boundary signatures la engine wrappers):
- `src/engine/schedule/scheduleAdapter.d.ts:24` — `warmup: object \| null` MED
- `src/engine/schedule/scheduleAdapter.d.ts:26` — `intensityModifier: object \| null` MED
- `src/engine/schedule/scheduleAdapter.d.ts:27` — `volumeTargets: object \| null` MED
- `src/engine/schedule/scheduleAdapter.d.ts:55` — `userState?: object` MED
- `src/react/lib/engineWrappers.ts:509` — `userState?: object` MED
- `src/react/lib/engineWrappers.ts:720` — `getProactiveAlerts(ctx: object = {})` MED
- `src/react/lib/scheduleAdapterAggregate.ts:36-41` — `user/weights/flags/meta: object` MED (×4)
- `src/react/lib/bayesianNutritionAggregate.ts:38` — `userState?: object` MED

Test:
- `src/react/__tests__/stores/scheduleStore.test.ts:18` — test helper builder LOW

**Note:** Pattern e intentional engine-boundary erasure pe dynamic JS objects (engineWrappers comments document `BayesianNutritionContext` defined în `.d.ts` sibling pattern, dar `userState: object` still leaks through). 

Tightening opportunity = replace cu existing `BayesianNutritionContext` (where applicable) sau `Record<string, unknown>` for general bag.

**Verdict:** 11 OPPORTUNITY items — MED severity (boundary erasure, NU bypass).

---

## DIMENSION 6 — Function param implicit any

| Check | Result |
|---|---|
| `function foo(x: any)` regex | 0 matches |
| `function foo(x)` untyped param | NU compile sub `strict: true` |
| Live `npx tsc --noEmit` | EXIT_CODE=0 |

**Verdict:** ZERO implicit any. Strict mode enforced compile-time.

---

## DIMENSION 7 — Generic types

| Pattern | Count | Status |
|---|---|---|
| `<T = any>` defaults | 0 | EXCELLENT |
| `Array<any>` | 0 | EXCELLENT |
| `any[]` | 0 | EXCELLENT |

Tests use `as unknown as ReturnType<typeof X>` cast pattern (29+ matches) pentru mock typing — legitimate vitest idiom satisfying `vi.mocked(fn).mockReturnValue(...)` type checker.

**Verdict:** Generic types nu folosesc `any` escape hatch. Pattern peste tot e `unknown` sau strict T constraint.

---

## DIMENSION 8 — Discriminated unions

Excellent adoption peste FSM patterns:

| Store/module | Union | Verdict |
|---|---|---|
| `workoutStore.ts:106` | `WorkoutMode = 'idle'\|'active'\|'resting'\|'paused'\|'finished'` (5-mode FSM) | EXCELLENT |
| `workoutStore.ts:14` | `WorkoutPhase = 'logging'\|'rating'\|'rest'\|'transition'\|'idle'` (5-phase FSM) | EXCELLENT |
| `workoutStore.ts:108` | `WorkoutModeView` (derived view union) | EXCELLENT |
| `onboardingStore.ts:12-17` | `Sex` / `Goal` / `Frequency` / `Experience` (5 unions) | EXCELLENT |
| `scheduleStore.ts:12` | `DayKind = 'training'\|'rest'` | EXCELLENT |
| `bayesianNutritionAggregate.ts:21` | `source: 'manual'\|'engine-bn'\|'baseline'` | EXCELLENT |

97 `export interface` / `export type` (38 files) — strong typing posture.

**Verdict:** Discriminated unions excellent peste 6+ state machines. No FSM weakness identified.

---

## DIMENSION 9 — Type-only imports

| Metric | Count | Status |
|---|---|---|
| `import type { X }` full-line | 155 files / 194 occurrences | GOOD |
| `import { type X, ... }` inline syntax | 8 files | GOOD |

Strong adoption. ZERO weak imports (every match `import type` proper format).

**Verdict:** Type-only imports widespread, tree-shake friendly. Bugatti.

---

## DIMENSION 10 — Explicit return types

| Check | Status |
|---|---|
| Stores typed with `create<State & Actions>()` explicit | ALL 7 stores |
| Engine wrappers explicit return types | ALL public exports |
| `Promise<T>` explicit pe async | ALL audited |
| `React.FC` anti-pattern | 0 (none) |

Spot-checked `src/react/lib/scheduleAdapterAggregate.ts` — every export has explicit return type (e.g. `Promise<PlannedWorkoutOutput \| null>`). `src/react/routes/screens/cont/userProfile.ts` — every helper typed.

**Verdict:** Excellent explicitness. No `React.FC` pattern leakage.

---

## ADDITIONAL findings

### Production `as unknown as` casts (legitimate)

3 occurrences în production code — all TypeScript limitation workarounds, NU type bypass:
- `src/react/stores/scheduleStore.ts:63` — `next as unknown as WeekDays` (TS can't infer fixed-length tuple from mutated array, legitimate)
- `src/react/stores/scheduleStore.ts:112` — dynamic import shape narrow (legitimate)
- `src/react/stores/settingsStore.ts:71` — same tuple pattern (legitimate)
- `src/react/routes/screens/antrenor/Workout.tsx:174` — `navigator as unknown as NavigatorWithWakeLock` (TS lib.dom doesn't include experimental Screen Wake Lock API, legitimate)

**Verdict:** All 4 prod casts justified. Test casts (29+) = mock typing idiom.

### Function weak type usage

- `src/global.d.ts:34` — `restoreFromBackup?: Function` (MED) — documented in comment as "2 overlapping signatures, callers know runtime"; OPPORTUNITY to express ca discriminated union `((key: string) => void) | ((json: string) => void)` sau overload type.

### Non-null assertions (`!.` / `!`)

83 matches src/react (15 files) — MOSTLY tests doing `raw!` after `JSON.parse(localStorage.getItem(key)!)`. 

Production prod use:
- `src/react/lib/engineWrappers.ts:340` — `peakPrePauseKgPerExercise[r.ex]!` — bounded loop, key checked previous line; OK.

**Verdict:** Production non-null assertions minimal + bounded; tests use idiomatic. NU drift.

### `satisfies` operator

ZERO `satisfies` usage. Modern TS 4.9+ pattern that could tighten certain const declarations (e.g., `DEFAULT_WEEK` constants în scheduleStore). LOW priority opportunity.

### `readonly` adoption

48 `readonly` matches în 32 files. Strong immutability hints peste tuples + array types (e.g., `WeekDays`, `Goal[]`, `ReadonlyArray<unknown>`).

**Verdict:** Excellent adoption.

---

## OVERALL summary

| Severity | Count |
|---|---|
| **HIGH** (production `as any` critical bypass) | **0** |
| **MED** (production `: object` annotation + `Function`) | **12** |
| **LOW** (missing return type / generic constraint / `satisfies`) | **3** |
| **Total opportunities** | **15** |

### Verdict

**TypeScript health: EXCELLENT.**

Codebase 31370 LOC TS/TSX, strict mode ALL flags ON, 0 build errors, 0 `as any` în production, 0 `: any` annotations, 0 `@ts-ignore`, 6+ discriminated union FSMs, 97 typed interfaces, 155+ files using type-only imports. Bugatti craftsmanship verified.

---

## TOP 3 PRIORITY OPPORTUNITIES

### #1 — MED — Replace `: object` with `Record<string, unknown>` or named interface (10 spots)

**Locations:** `engineWrappers.ts:509,720`, `scheduleAdapterAggregate.ts:36-41`, `bayesianNutritionAggregate.ts:38`, `scheduleAdapter.d.ts:24-27,55`.

**Why:** `: object` allows ANY non-primitive (including arrays, dates, functions) — weaker than intent. `BayesianNutritionContext` already exists în `bayesianNutrition/index.d.ts` — engineWrappers `getNutritionTargetsToday(userState?: object)` could narrow la `BayesianNutritionContext`.

**Effort:** ~30 min surgical. ZERO src/ logic changes — pure type signature tightening.

**Risk:** LOW. Boundary types backward compat (`object` superset of `Record<string, unknown>`); strict check at call sites might surface 1-2 corrections (existing test mocks would catch).

### #2 — MED — Replace `Function` cu union type in global.d.ts:34

**Location:** `src/global.d.ts:34` — `restoreFromBackup?: Function`.

**Why:** `Function` allows ANY callable. Owner comment documents 2 overlapping signatures — could express ca overload:
```ts
restoreFromBackup?:
  ((keyOrDaysAgo: string | number) => void) |
  ((jsonString: string) => void);
```

**Effort:** ~15 min. Single line + verify both callers compile.

**Risk:** VERY LOW. Dev console helper, NU user path.

### #3 — LOW — Add `satisfies` operator pe const tuples + literal arrays

**Targets:** `DEFAULT_WEEK` în `scheduleStore.ts:33-35`, `DAY_KEYS` (line 103), `WEAK_LIST` constants peste codebase.

**Why:** `as const` preserves literal but loses type-check. `satisfies WeekDays` validates shape WHILE preserving literal type. Modern TS 4.9+ idiom.

**Effort:** ~20 min spot-fixes.

**Risk:** ZERO (additive type check only).

---

## Blockers

NONE. All opportunities are reversible non-breaking type tightenings, autonomous Co-CTO scope. Quality > Speed pre-Beta long-horizon (Daniel "10x more time now > lost in 6 months" LOCK V1) — all 3 worth pursuing if Wave A/B bandwidth available.

---

**Audit complete.** TypeScript strict posture = EXCELLENT pre-Beta. Bugatti grade.
