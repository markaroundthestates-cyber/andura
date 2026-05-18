# task_08 — Adherence Engine Real Wire

**Phase:** 6 (engine pipeline real wire)
**Type:** Refactor — replace baseline streak proxy cu real Adherence Engine
**Deps:** task_07 LANDED
**Backup tag:** `pre-phase6-task-08-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +6-8

---

## §1 Scope

`engineSignalsAggregate.deriveAdherenceFromStreak()` task_07 = streak + last30 simple proxy. Real Adherence Engine `src/engine/adherence.js` (per `DECISIONS §D-LEGACY-022` ADR 022) calcule adherence score per user behavior pattern (planned vs actual sessions ratio + skip detection + retry compliance). Phase 6 wraps real engine output.

## §2 Changes

### A. Grep verify primary-source

```bash
grep -n "export" src/engine/adherence.js
head -50 src/engine/adherence.js
```

Engine likely exports `computeAdherenceScore(userState)` sync function returning 0-100.

### B. `src/react/lib/engineWrappers.ts` (extend)

```tsx
import { computeAdherenceScore } from '../../engine/adherence.js';

export interface AdherenceOutput {
  score: number; // 0-100
  source: 'engine' | 'baseline';
  windowDays: number; // observation window
}

const BASELINE_ADHERENCE_OUTPUT: AdherenceOutput = {
  score: 50,
  source: 'baseline',
  windowDays: 30,
};

/**
 * Real wire Adherence Engine #4. Returns score 0-100 + observation window.
 * Baseline fallback graceful când engine throws sau T0 fresh user.
 */
export function getAdherenceOutput(userState?: object): AdherenceOutput {
  try {
    const raw = computeAdherenceScore(userState || {});
    if (raw == null || typeof raw !== 'number') return BASELINE_ADHERENCE_OUTPUT;
    const safeScore = Math.max(0, Math.min(100, raw));
    return {
      score: safeScore,
      source: 'engine',
      windowDays: 30,
    };
  } catch (e) {
    console.warn('[engineWrappers] getAdherenceOutput failed:', e);
    return BASELINE_ADHERENCE_OUTPUT;
  }
}
```

### C. `src/react/lib/engineSignalsAggregate.ts` (refactor)

Replace `deriveAdherenceFromStreak()` cu real engine call:

```tsx
import { getAdherenceOutput } from './engineWrappers';

export function getEngineSignals(): EngineSignals {
  const readiness = getReadiness();
  const fatigue = getFatigue();
  const adherence = getAdherenceOutput();
  // ... vitality + energyDirection unchanged
  return {
    vitalityScore,
    adherenceScore: adherence.score,
    energyDirection,
    source: adherence.source === 'engine' || readiness !== null || fatigue !== null
      ? 'engine'
      : 'baseline',
  };
}
```

Delete `deriveAdherenceFromStreak()` helper task_07 — replaced by engine real wire.

### D. Tests `src/react/__tests__/engineWrappers.getAdherenceOutput.test.tsx`

```js
- engine output consumed când succeeds
- baseline fallback când engine throws
- score clamped 0-100 invariant
- non-number engine output → baseline
- null engine output → baseline
- empty userState → defaults graceful
```

## §3 Acceptance criteria

- [ ] `getAdherenceOutput()` export LANDED
- [ ] `engineSignalsAggregate` consume real engine adherence (NU streak proxy)
- [ ] `deriveAdherenceFromStreak` helper deleted (replaced)
- [ ] BASELINE_ADHERENCE preserved fallback T0
- [ ] Tests +6 minim PASS
- [ ] TS strict 0 errors

## §4 Tests delta target +6-8

## §5 Commit

```
refactor(react/lib): Adherence Engine real wire replace streak proxy

Phase 6 final engine pipeline real wire — replaces task_07 streak + last30
proxy cu real computeAdherenceScore() engine output via getAdherenceOutput
wrapper. Score clamped 0-100 invariant + baseline fallback graceful.

Closes Phase 6 §8 engine pipeline real wire 8/8 tasks complete (#1.A→1.C +
#2.A→2.B + #3.A→3.B + #4 + #5). Replaces all Phase 5 baseline proxies cu
real engine outputs via pipeline §42.10 + standalone engines (Adherence #4 +
PR Engine + Streak Counter).
```

## §6 Next

task_09 Cont Tab settings-profile screen (sub-screen mockup parity).
