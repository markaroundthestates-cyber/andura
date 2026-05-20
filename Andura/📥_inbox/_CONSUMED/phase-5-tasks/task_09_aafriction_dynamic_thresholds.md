# task_09 — aaFriction Dynamic Thresholds Vitality/Adherence-Driven

**Phase:** 5 (engine pipeline real wire)
**Type:** Refactor — replace hardcoded thresholds cu engine-driven
**Deps:** task_06 coachDirector (Vitality + Adherence engines accessible)
**Backup tag:** `pre-phase5-task-09-2026-05-17`
**Est commits:** 1 atomic
**Est tests delta:** +6-10

---

## §1 Scope

Phase 4 task_14 LOCK 9 aaFrictionDetect helper `src/react/lib/aaFrictionDetect.ts` uses hardcoded thresholds:
- fast_sets: avg interval < X seconds across N consecutive sets
- kg_jump: weight increase > Y% vs previous set
- rep_spike: reps increase > Z% vs previous set

Per LOCK 9 LOOP CLOSE accelerated learning wired (D-LEGACY-040) — Vitality Layer engine tier-progression + Adherence detection should drive dynamic thresholds:
- T0 user (new) → lenient thresholds (avoid spam friction Maria-frighten)
- T1+ experienced + high Vitality → tighter thresholds (Marius push detection accurate)
- Adherence low (rare gym attendance) → looser thresholds (don't add modal friction on rare sessions)

Task 09: refactor aaFrictionDetect → accept dynamic threshold params + Vitality/Adherence-driven via engineWrappers consumer.

## §2 Changes

### A. `src/react/lib/aaFrictionDetect.ts` (refactor signature)

Before:
```tsx
const FAST_SETS_THRESHOLD_SEC = 45;
const KG_JUMP_THRESHOLD_PCT = 15;
const REP_SPIKE_THRESHOLD_PCT = 20;

export function detectAggressiveLoading(setHistory: ExerciseHistoryEntry[]): AggressiveReason | null { ... }
```

After:
```tsx
export interface AggressiveThresholds {
  fastSetsSec: number; // default 45
  kgJumpPct: number;  // default 15
  repSpikePct: number; // default 20
}

export const DEFAULT_THRESHOLDS: AggressiveThresholds = {
  fastSetsSec: 45,
  kgJumpPct: 15,
  repSpikePct: 20,
} as const;

export function detectAggressiveLoading(
  setHistory: ExerciseHistoryEntry[],
  thresholds: AggressiveThresholds = DEFAULT_THRESHOLDS
): AggressiveReason | null { ... }
```

### B. `src/react/lib/engineWrappers.ts` (NEW threshold derive function)

```tsx
import { getVitalityTier } from '../../engine/vitality.js';
import { getAdherenceLevel } from '../../engine/adherence.js';

export function deriveAggressiveThresholds(): AggressiveThresholds {
  try {
    const tier = getVitalityTier(); // T0/T1/T2/T3
    const adherence = getAdherenceLevel(); // 'low' | 'medium' | 'high'

    // T0 + low adherence → lenient (avoid Maria-spam)
    if (tier === 'T0' || adherence === 'low') {
      return { fastSetsSec: 30, kgJumpPct: 25, repSpikePct: 30 };
    }
    // T1+ + high adherence → tight (Marius accurate detection)
    if ((tier === 'T1' || tier === 'T2' || tier === 'T3') && adherence === 'high') {
      return { fastSetsSec: 50, kgJumpPct: 12, repSpikePct: 15 };
    }
    return DEFAULT_THRESHOLDS;
  } catch (e) {
    console.warn('[engineWrappers] deriveAggressiveThresholds failed, using defaults:', e);
    return DEFAULT_THRESHOLDS;
  }
}
```

NU expose internal labels T0/T1 user-facing — purely internal pipeline.

### C. `src/react/components/Workout/Workout.tsx` (consume dynamic)

```tsx
const thresholds = useMemo(() => deriveAggressiveThresholds(), []);
// On handleLogSet pe attempt:
const reason = detectAggressiveLoading(setHistory, thresholds);
if (reason) { /* show modal */ }
```

NU recompute thresholds per-set (memoize once per session start).

### D. Engine helpers verify exist src/engine

```bash
ls -la src/engine/vitality.js src/engine/adherence.js 2>/dev/null
grep -n "export" src/engine/vitality.js src/engine/adherence.js 2>/dev/null
```

Daca NU exist: create thin defensive wrappers reading DB tier + recent session attendance. NU mutate underlying state.

## §3 Acceptance criteria

- [ ] aaFrictionDetect accepts optional thresholds param (backward compat default)
- [ ] `deriveAggressiveThresholds()` derives per Vitality tier + Adherence level
- [ ] T0/low-adherence path returns LENIENT thresholds (Maria-friendly)
- [ ] T1+/high-adherence path returns TIGHT thresholds (Marius-accurate)
- [ ] NU expose internal tier labels user-facing (Gigel-test compliant)
- [ ] Tests +6-10 PASS
- [ ] TS strict 0 errors

## §4 Tests

```bash
src/react/__tests__/aaFrictionDetect.dynamicThresholds.test.ts
- accepts custom thresholds param
- default thresholds when no param
- lenient thresholds — fast_sets requires <30s (vs default 45s)
- tight thresholds — kg_jump requires <12% (vs default 15%)

src/react/__tests__/engineWrappers.deriveAggressiveThresholds.test.ts
- T0 → lenient
- T1+high adherence → tight
- T1+medium adherence → default
- fallback to default cand engine throws
```

## §5 Commits (atomic 1)

```
feat(react/lib): aaFriction dynamic thresholds Vitality+Adherence-driven

Replaces Phase 4 task_14 hardcoded thresholds (45s/15%/20%) cu engine-
derived via deriveAggressiveThresholds() Vitality tier + Adherence level
lookup. T0+low-adherence → lenient (Maria anti-spam); T1+high → tight
(Marius accurate). NU expose internal tier labels user-facing per Gigel
test.

Per LOCK 9 LOOP CLOSE accelerated learning wired D-LEGACY-040 — engine
"I'm wrong" self-vindeca within 2-3 sessions invariant preserved.
Memoize thresholds per session start (NU recompute per-set).
```

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_09_aafriction_dynamic_thresholds.md`:
- Thresholds derive matrix (T0/T1+ × adherence low/med/high)
- Engine helper verify status
- Backward compat preserved (default param)
- LOCK 9 LOOP CLOSE invariant
