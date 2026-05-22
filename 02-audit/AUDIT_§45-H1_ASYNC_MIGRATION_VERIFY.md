# Audit §45-H1 — Phase 6 task_02 Option C async migration consumers verify

**Status:** AUDIT-COMPLETE
**Date:** 2026-05-23
**Authority:** §45.2.2 audit-nuclear-2026-05-19 closure
**Scope:** Verify all consumers of async aggregates (`getCoachToday`, `getNutritionTargetTodayReal`) use async-aware pattern (useState + useEffect + .then) per DECISIONS.md §D027 LOCKED V1 Option C async migration.
**Cross-ref:** DECISIONS.md §D027 + ADR-ENGINE-MATH-LOCKED-VALUES.md

---

## §1 — Async aggregate consumer matrix

| Consumer file | Aggregate | Pattern | Verdict |
|---|---|---|---|
| `src/react/routes/screens/antrenor/Antrenor.tsx:77-84` | `getCoachToday()` | `useState<CoachTodayOutput \| null>(null)` + `useEffect(() => { getCoachToday().then(...) })` + cancelled guard | PASS |
| `src/react/routes/screens/progres/Progres.tsx:28-35` | `getCoachToday()` | Same pattern + cancelled guard | PASS |
| `src/react/components/NutritionInline.tsx:55-62` | `getNutritionTargetTodayReal(dateISO)` | `useState<NutritionTarget \| null>(null)` + `useEffect([dateISO], () => { ... })` + cancelled guard | PASS |
| `src/react/routes/screens/antrenor/Workout.tsx:293` | `getEngineSignals()` SYNC | Direct call (sync function correctly used sync) | PASS (sync NOT async) |

---

## §2 — Async vs sync aggregate distinction

**`getCoachToday()` IS async** because it awaits `getTodayWorkout()` internally (coachDirectorAggregate.ts:65):
```ts
const plannedWorkout = await getTodayWorkout();
```

Source: `getTodayWorkout()` itself wraps async `composePlannedWorkoutToday()` (engineWrappers.ts:242-249).

**`getNutritionTargetTodayReal(dateISO)` IS async** per Bayesian Nutrition engine evaluate path (async closure via Kalman update + posterior compute).

**`getEngineSignals()` IS sync** because it composes only sync wrappers (`getReadiness()` + `getFatigue()` + `getAdherenceOutput()`) — no internal await. Used correctly sync in Workout.tsx:293.

---

## §3 — Cancelled-guard pattern verification

Each async consumer follows React idiomatic cancellation pattern to prevent state update on unmounted component:

```tsx
useEffect(() => {
  let cancelled = false;
  getCoachToday().then((c) => {
    if (!cancelled) setCoach(c);
  });
  return () => { cancelled = true; };
}, []);
```

**Verdict:** ALL consumers implement cancelled guard correctly. No risk of `setState` after unmount; no memory leaks.

---

## §4 — Loading state handling

| Consumer | Loading approach |
|---|---|
| Antrenor.tsx | `const readiness = coach?.readiness ?? null;` — optional chaining + null fallback to baseline UI render. Defensive: child components handle null gracefully. |
| Progres.tsx | `const alerts = coach?.alerts ?? [];` — empty array fallback during loading. |
| NutritionInline.tsx | `engineTarget?.kcalTarget ?? AUTO_KCAL_TARGET` — mockup-verbatim sync baseline preserved during loading, swapped on resolve. |

**Verdict:** Loading state handled idiomatic — no spinner ceremony, immediate baseline render + engine refinement on resolve. Aligns Bugatti UX (zero flicker).

---

## §5 — Race condition / stale resolution audit

**Test case:** rapid component remount before previous `getCoachToday()` resolves.

Antrenor.tsx pattern: dependencies `[]` empty array → effect runs once on mount. Cancelled guard prevents stale setState. SAFE.

NutritionInline.tsx pattern: dependencies `[dateISO]` → effect re-runs on date change. Cancelled guard ensures only latest fetch wins. SAFE.

**Verdict:** No race condition risk in current consumer set. Pattern matches React.dev async-effect documentation.

---

## §6 — Source flag propagation

Each aggregate emits `source: 'engine' | 'baseline'` field allowing consumers to differentiate authoritative engine output vs cold-start baseline.

Audit observation: Antrenor.tsx + Progres.tsx + NutritionInline.tsx do NOT currently render the `source` flag visibly (could be exposed as dev-mode indicator post-Beta). Acceptable for V1 — flag exists for telemetry / debugging not user-facing UX.

---

## §7 — Findings summary

**Total async consumers audited:** 3 (Antrenor.tsx + Progres.tsx + NutritionInline.tsx).
**Sync consumers audited:** 1 (Workout.tsx getEngineSignals).

**Drift incidents:** 0.

**Verify-PASS:**
- Antrenor.tsx async getCoachToday.
- Progres.tsx async getCoachToday.
- NutritionInline.tsx async getNutritionTargetTodayReal.
- Workout.tsx sync getEngineSignals (correctly sync since aggregate composes sync wrappers only).

**Anti-drift forward guard:** new aggregates added in Phase 7+ must:
1. Declare `async` if any internal `await` triggers (composer of async wrappers must propagate Promise).
2. Consumers MUST use useState + useEffect + .then + cancelled guard pattern.
3. Sync aggregates may be used direct in render OR effect; async never in render body (React rule).
4. Test guard: each async aggregate test should cover (a) resolved-state UI render, (b) loading-state UI render, (c) cancellation on unmount.

---

## §8 — Cross-references

- DECISIONS.md §D027 LOCKED V1 — Option C async migration paradigm.
- src/react/lib/coachDirectorAggregate.ts — async getCoachToday SoT.
- src/react/lib/bayesianNutritionAggregate.ts — async getNutritionTargetTodayReal.
- src/react/lib/engineSignalsAggregate.ts — sync getEngineSignals.
- 02-audit/AUDIT_§47-H2_ENGINE_UI_WIRING.md — engine -> UI passive consume invariant.
- src/react/lib/engineWrappers.ts (commit `631ff655` §48-H1) — Sentry instrumentation safety net adjacent.

---

## §9 — Audit verdict LOCKED

**Phase 6 task_02 Option C async migration consumer set = VERIFIED per audit posture.**

All async consumers use idiomatic React pattern. Sync vs async distinction preserved correctly. Loading state handled Bugatti (zero flicker baseline + refine on resolve). Race conditions guarded via cancelled flag. Source flag propagated for telemetry future use.

Authority: §45-H1 audit-nuclear-2026-05-19 closure — Co-CTO autonomous per D024 LOCKED V1 PERMANENT.
