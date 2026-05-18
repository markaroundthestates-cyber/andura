# TASK 03 — Engine Wrappers + Coach Voice Library

**Model:** Opus EXCLUSIVELY
**Phase:** B (paralel cu task_02)
**Depends on:** task_01 LANDED
**Estimated touched files:** 2 NEW (engineWrappers.ts + coachVoice.ts)
**Estimated new tests:** +25-40

---

## §0 Bugatti checklist pre-flight

- [ ] task_01 LANDED
- [ ] Branch `feature/v3-react-clasic` HEAD verde
- [ ] Backup tag `pre-phase3-task-03-2026-05-16` push origin

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8 + §2 (8 Coach Engines pipeline)
2. `DECISIONS.md` §D-LEGACY-013 §D-LEGACY-017 §D-LEGACY-020 §D-LEGACY-023 §D-LEGACY-027 §D-LEGACY-028 §D-LEGACY-029 §D-LEGACY-076 §D-LEGACY-098
3. `src/engine/` directory listing — identific module exact files (bayesianNutrition, fatigueIndex, prEngine, weaknessDetector, specialization, scheduleAdapter, coachDirector, deviationMemory, etc.)
4. `04-architecture/mockups/andura-clasic.html` grep pentru:
   - `COACH_VOICE` object (large lookup library)
   - `coachPick()` function definition
   - Readiness verdict labels + emoji + kcal/protein delta wording
   - F3 fatigue score wording

---

## §2 Spec exact

### A) `src/react/lib/engineWrappers.ts` NEW

Pure-function read-only adapters wrap `src/engine/*` exports. NU recreate logic — doar import + type-safe wrapper + React-friendly interface.

```typescript
// ══ ENGINE WRAPPERS — Pure-Function Adapters src/engine/* ═════════════════
// Per ADR 026 §9 pure-function paradigm + DECISIONS.md §D015 React migration.
// Backend layer (src/engine/*) preserves test coverage 3743 PASS invariant.
// React side imports via these wrappers cu types + simplified interface.
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-017 Bayesian Nutrition Inference
//   - DECISIONS.md §D-LEGACY-027 Engine Energy Adjustment
//   - DECISIONS.md §D-LEGACY-076 Calendar Feature V1 scheduleAdapter
//   - DECISIONS.md §D-LEGACY-098 LOCK 10 MMI Engine #9

// Import engines existing
// (CC verifică exact import paths via src/engine/ directory listing)
import { computeReadiness } from '../../engine/readiness';
import { computeFatigueScore } from '../../engine/fatigueIndex';
import { detectPRs } from '../../engine/prEngine';
import { getTodayPlannedWorkout } from '../../engine/schedule/scheduleAdapter';
import { detectWeakness } from '../../engine/weaknessDetector';
import { runCoachDirector } from '../../engine/coachDirector';

// Type-safe simplified output shapes
export interface ReadinessOutput {
  emoji: string; // "💪" | "✋" | "😴" | "⚡" | "🌱"
  label: string; // "Optim" | "Ok" | "Obosit" | "Foarte obosit" | ...
  kcalDelta: number; // ±N kcal vs baseline
  proteinDelta: number; // ±N g vs baseline
}

export interface FatigueOutput {
  score: number; // 0-100
  color: 'green' | 'yellow' | 'red';
}

export interface PRDelta {
  exerciseId: string;
  type: 'weight' | 'reps' | 'volume';
  prevValue: number;
  newValue: number;
}

export interface PlannedWorkoutOutput {
  workoutTitle: string; // "Push (piept & umeri)"
  exerciseCount: number;
  estimatedDuration: number; // minutes
  intensityMod: 'plus' | 'normal' | 'minus';
}

// Wrappers cu try/catch + fallback safe
export function getReadiness(userId: string): ReadinessOutput | null {
  try {
    const raw = computeReadiness(userId);
    return mapReadiness(raw);
  } catch (e) {
    console.warn('[engineWrappers] getReadiness failed:', e);
    return null;
  }
}

export function getFatigueScore(userId: string): FatigueOutput | null {
  try {
    const raw = computeFatigueScore(userId);
    return { score: raw.score, color: raw.score < 33 ? 'green' : raw.score < 66 ? 'yellow' : 'red' };
  } catch (e) {
    return null;
  }
}

export function getPRDeltas(sessionHistory: unknown): PRDelta[] {
  try {
    return detectPRs(sessionHistory) ?? [];
  } catch (e) {
    return [];
  }
}

export function getTodayWorkout(userId: string, date: Date = new Date()): PlannedWorkoutOutput | null {
  try {
    return getTodayPlannedWorkout(userId, date);
  } catch (e) {
    return null;
  }
}

// Helper internal
function mapReadiness(raw: any): ReadinessOutput { /* ... */ }
```

**CC autonomous note:** Verifică `src/engine/` directory listing + import paths exact. Stub functions dacă engine NU există încă (NU fabrica logic — wire la TODO comment).

### B) `src/react/lib/coachVoice.ts` NEW

Port `COACH_VOICE` lookup library din mockup + `coachPick()` selector.

```typescript
// ══ COACH VOICE — Lookup Library + coachPick() Selector ═══════════════════
// Per DECISIONS.md §D-LEGACY-052 Andura Suflet brand soul.
// Port from mockup andura-clasic.html static lookup.
// Pure-function, NU side-effects, NU date/random side (seeded random via opt arg).

// Romanian no-diacritics RULE D-LEGACY-064 — UI strings strip diacritice
export const COACH_VOICE = {
  endSession: {
    usoara: [
      'Bun. Forma curata, intensitate masurata. Asa.',
      'Solid azi. Nu fortat, nu plictisit. Echilibru.',
      // ... port from mockup
    ],
    normala: [
      'Treaba buna. Vad efortul.',
      // ...
    ],
    grea: [
      'A fost greu. Ai dus pana la capat.',
      // ...
    ],
  },
  reflectie: [
    'Ultima oara ai impins +2.5 kg la bench. Vad progresul.',
    // ...
  ],
  // ... alte categorii din mockup (preSession, restCue, transitionCue, etc.)
} as const;

export type CoachVoiceCategory = keyof typeof COACH_VOICE;

/**
 * Pure-function selector. Seed-able pentru reproducibility tests.
 * Default uses Math.random() la I/O boundary (NU pure în default mode — caller responsibility).
 */
export function coachPick(
  category: string,
  rating?: 'usoara' | 'normala' | 'grea',
  seed?: number
): string {
  let pool: readonly string[] = [];

  if (category === 'endSession' && rating) {
    pool = COACH_VOICE.endSession[rating];
  } else if (category === 'reflectie') {
    pool = COACH_VOICE.reflectie;
  }
  // ... alte categorii

  if (pool.length === 0) return '';
  const idx = seed !== undefined ? seed % pool.length : Math.floor(Math.random() * pool.length);
  return pool[idx];
}
```

---

## §3 Implementation hints

- `src/engine/` directory listing: CC verifică exact modules existing pre-write wrappers. Pentru engines NU existing (e.g. dacă `coachDirector` nu e fully implemented), wrap cu TODO comment + return null fallback, NU fabricate logic.
- Mockup `COACH_VOICE` library = LARGE (mockup 4753 LOC, COACH_VOICE secțiune undeva în JS). CC grep landmark + port verbatim Romanian strings strip diacritice.
- `coachPick` pure mode: dacă caller pasează `seed`, deterministic. Default `Math.random()` = side-effect la I/O boundary acceptable (per ADR 026 §9 "side-effects la I/O boundary").
- TS strict: `as const` pe COACH_VOICE pentru literal types.

---

## §4 Tests vitest (pure-function unit tests)

### A) `src/react/__tests__/lib/engineWrappers.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { getReadiness, getFatigueScore, getPRDeltas, getTodayWorkout } from '../../lib/engineWrappers';

// Mock src/engine/* exports
vi.mock('../../../engine/readiness', () => ({
  computeReadiness: vi.fn(() => ({ score: 75, label: 'Optim' })),
}));
vi.mock('../../../engine/fatigueIndex', () => ({
  computeFatigueScore: vi.fn(() => ({ score: 45 })),
}));
// ... mocks pentru toate engines wrapped

describe('engineWrappers', () => {
  it('getReadiness maps raw la simplified output', () => {
    const r = getReadiness('user-123');
    expect(r).not.toBeNull();
    expect(r?.label).toBeDefined();
  });

  it('getFatigueScore maps color from score threshold', () => {
    const r = getFatigueScore('user-123');
    expect(r?.color).toBe('yellow'); // 45 → yellow
  });

  it('getPRDeltas returns [] cand throws', () => {
    // Setup mock să arunce
    expect(getPRDeltas(null)).toEqual([]);
  });

  // ... +10-15 tests
});
```

### B) `src/react/__tests__/lib/coachVoice.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { coachPick, COACH_VOICE } from '../../lib/coachVoice';

describe('coachPick deterministic seed', () => {
  it('seed=0 returns first item endSession.usoara', () => {
    const r = coachPick('endSession', 'usoara', 0);
    expect(r).toBe(COACH_VOICE.endSession.usoara[0]);
  });

  it('seed modulo pool length wraps correctly', () => {
    const r = coachPick('endSession', 'usoara', 100);
    expect(r).toBe(COACH_VOICE.endSession.usoara[100 % COACH_VOICE.endSession.usoara.length]);
  });

  it('unknown category returns empty string', () => {
    const r = coachPick('unknown-cat', undefined, 0);
    expect(r).toBe('');
  });

  it('Romanian no-diacritics strip verified pe entire library', () => {
    const allStrings = JSON.stringify(COACH_VOICE);
    // Verify no diacritice
    expect(/[ăâîșțĂÂÎȘȚ]/.test(allStrings)).toBe(false);
  });

  // ... +10-15 tests
});
```

---

## §5 Acceptance criteria

- [ ] `engineWrappers.ts` exports 4+ wrapper functions (getReadiness, getFatigueScore, getPRDeltas, getTodayWorkout, ...)
- [ ] `coachVoice.ts` exports `COACH_VOICE` lookup + `coachPick()` selector
- [ ] Romanian no-diacritics rule preserved (no `[ăâîșțĂÂÎȘȚ]`)
- [ ] Pure-function design: seed-able coachPick, try/catch wrappers safe fallback
- [ ] vitest count: +25-40 new tests
- [ ] TS strict compile clean
- [ ] Pre-commit hook verde

---

## §6 Commit strategy

2 commits atomic:
1. `feat(react/lib): engineWrappers pure-function adapters src/engine/* React-friendly interface`
2. `feat(react/lib): coachVoice library + coachPick deterministic selector port mockup`

---

## §7 Backup tag

```bash
git tag pre-phase3-task-03-2026-05-16
git push origin pre-phase3-task-03-2026-05-16
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope.

---

🦫 **task_03 Adapters. Phase B paralel cu task_02. Pure-function paradigm. Backend src/engine/* preserved invariant.**
