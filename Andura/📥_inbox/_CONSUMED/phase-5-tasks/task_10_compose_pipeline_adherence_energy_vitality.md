# task_10 — Adherence + Energy + Vitality Compose Pipeline

**Phase:** 5 (engine pipeline real wire)
**Type:** Refactor — final compose pipeline integration
**Deps:** task_06 + task_09 (Vitality/Adherence wrappers exist)
**Backup tag:** `pre-phase5-task-10-2026-05-17`
**Est commits:** 1-2 atomic
**Est tests delta:** +10-15

---

## §1 Scope

Coach Director Engine #7 §42.10 canonical pipeline order requires Adherence + Energy + Vitality compose as cumulative modulators BEFORE Goal Adaptation final workout. Per ADR 026 §42.10 + ADR 027 Energy Adjustment + D-LEGACY-012 Vitality Layer.

Current task_06 wires aggregate compose but Adherence/Energy/Vitality modulators may be stub'd or scattered. Task 10: ensure compose pipeline order canonical + integrate trio modulators into single Engine compose stage:
1. Adherence (low/medium/high) → volume tolerance scale
2. Energy (Engine #3 ±15% T1+ asymmetric) → bidirectional readiness modulation
3. Vitality (Tier-progression engine §SUFLET) → cumulative experience modulator

Triple compose feed Goal Adaptation Engine #2 + Periodization Engine #1 SAU emit final `composedModifier` Constraint Object consumed downstream per ADR 026 §1.10 immutable propagation.

## §2 Changes

### A. `src/engine/composeModulators.js` (NEW SAU verify exists)

```js
/**
 * Compose Adherence + Energy + Vitality cumulative modifier output.
 * Pure-function aggregate ADR 026 §9. Returns Constraint Object immutable.
 *
 * @param {object} ctx coach context
 * @returns {object} {volumeScale, intensityScale, recoveryHint, ...}
 */
export function composeAdherenceEnergyVitality(ctx) {
  const adherence = getAdherenceLevel(ctx); // 'low' | 'medium' | 'high'
  const energy = getEnergyAdjustment(ctx); // {volMult: 0.85-1.15, tier-aware}
  const vitality = getVitalityTier(ctx); // 'T0' | 'T1' | 'T2' | 'T3'

  // Adherence volume tolerance scale
  const adherenceVolScale = adherence === 'low' ? 0.7 : adherence === 'medium' ? 0.9 : 1.0;

  // Energy bidirectional readiness ±15% T1+ asymmetric (±10% T0)
  const isT0 = vitality === 'T0';
  const energyAsymmetric = isT0
    ? Math.max(0.9, Math.min(1.1, energy.volMult))
    : Math.max(0.85, Math.min(1.15, energy.volMult));

  // Vitality cumulative experience modifier (T3 advanced specialization unlock)
  const vitalityIntensityScale = vitality === 'T3' ? 1.05 : 1.0;

  return Object.freeze({
    volumeScale: adherenceVolScale * energyAsymmetric,
    intensityScale: vitalityIntensityScale,
    recoveryHint: adherence === 'low' || energy.volMult < 0.9 ? 'gentle' : 'normal',
    tierContext: vitality,
    adherenceLevel: adherence,
  });
}
```

ZERO mutation engines per ADR 026 §9. Output immutable Object.freeze pentru downstream consumers.

### B. `src/engine/coachDirector.js` (integrate compose)

Pipeline order canonical §42.10:
1. Periodization → mesocycle phase
2. **Compose Adherence + Energy + Vitality** (NEW step task_10)
3. Goal Adaptation → template + apply composedModifier.volumeScale
4. Bayesian Nutrition → adaptive TDEE
5. Tempo/Form Cues → persona-aware
6. Specialization → 4-gate (Vitality T1+ + Marius Advanced)
7. Warm-up & Mobility
8. Deload → week 4 check
9. MMI → re-resume gap detect LAST

Refactor `runCoachDirector(ctx)`:
```js
const composedMod = composeAdherenceEnergyVitality(ctx);
const phase = getPeriodizationPhase(ctx, composedMod);
const template = getGoalTemplate(ctx);
const planned = composeWorkout(template, phase, composedMod, ctx);
// composedMod propagated downstream invariant
```

### C. `src/react/lib/engineWrappers.ts` (expose for diagnostics)

```tsx
export interface ComposedModifier {
  volumeScale: number;
  intensityScale: number;
  recoveryHint: 'gentle' | 'normal';
  tierContext: 'T0' | 'T1' | 'T2' | 'T3';
  adherenceLevel: 'low' | 'medium' | 'high';
}

export function getComposedModifier(): ComposedModifier | null { ... }
```

NU display user-facing direct — internal diagnostics + Bugatti audit transparency.

## §3 Acceptance criteria

- [ ] `composeAdherenceEnergyVitality(ctx)` pure-function aggregate exposed
- [ ] coachDirector pipeline order canonical §42.10 respected
- [ ] Compose output immutable Object.freeze (defensive)
- [ ] T0 asymmetric ±10% vs T1+ ±15% energy adjustment (D-LEGACY-021)
- [ ] Vitality T3 unlock intensity scale 1.05 modifier
- [ ] Recovery hint surfaces when adherence low OR energy <0.9
- [ ] Tests +10-15 PASS
- [ ] TS strict 0 errors

## §4 Tests

```bash
src/engine/__tests__/composeAdherenceEnergyVitality.test.js
- low adherence → 0.7 volume scale
- T0 energy clamp ±10%
- T1+ energy clamp ±15%
- T3 vitality intensity 1.05
- recovery hint gentle când adherence low
- output immutable frozen

src/engine/__tests__/coachDirector.pipelineOrder.test.js
- compose runs after Periodization, before Goal Adaptation
- composedMod propagates to Goal Adaptation volumeScale

src/react/__tests__/engineWrappers.getComposedModifier.test.tsx
- exposes diagnostic Composed Modifier shape
- returns null when engine throws
```

## §5 Commits (atomic 1-2)

```
feat(engine): composeAdherenceEnergyVitality cumulative modifier compose

Pure-function aggregate ADR 026 §9. Composes Adherence volume tolerance +
Energy ±15% T1+ asymmetric (±10% T0) + Vitality T3 intensity unlock into
Constraint Object immutable propagated downstream Goal Adaptation +
Periodization per ADR 026 §1.10.

refactor(engine): coachDirector pipeline §42.10 canonical order

Integrates composeAdherenceEnergyVitality between Periodization and Goal
Adaptation. Composed modifier propagated invariant downstream Workout
composition. ZERO engine module mutation cumulative ADR 026 §9.
```

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_10_compose_pipeline.md`:
- Pipeline order §42.10 verify post-task
- ComposedModifier matrix tier × adherence × energy
- Backward compat (engine outputs preserved consumer-side)
