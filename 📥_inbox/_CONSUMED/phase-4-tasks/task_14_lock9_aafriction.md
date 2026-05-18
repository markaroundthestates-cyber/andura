# TASK 14 — LOCK 9 Anti-Aggressive Loading aaFrictionModal Wire

**Model:** Opus EXCLUSIVELY
**Phase:** 4 (pre-Beta SAFETY GATE sensitive)
**Depends on:** task_12 LANDED (Workout sub-components extracted, handleLogSet clean entry point)
**Estimated touched files:** 1 NEW aaFrictionModal component + Workout.tsx handleLogSet wire + 1 NEW test file + lib helper detect aggressive pattern
**Estimated new tests:** +10-20

---

## §0 Bugatti checklist pre-flight

- [ ] Phase 4 task_12 LANDED 4072 PASS baseline (sau later if batch sequential)
- [ ] Branch HEAD verde
- [ ] Backup tag `pre-phase4-task-14-2026-05-XX` push origin
- [ ] **WORDING CEO scope:** CC preserve mockup `aaFrictionModal` RO text VERBATIM. NU compose user-facing copy autonomous (Anti-paternalism §AR.26 + LOCK V1 CEO wording boundary). DACĂ mockup verbatim absent → placeholder `'PLACEHOLDER_RO_TEXT_LOCK9_TBD'` + flag wording backlog raport §6.

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `DECISIONS.md` §D-LEGACY-040 LOCK 9 anti-aggressive loading safety
3. `04-architecture/mockups/andura-clasic.html` grep `aaFrictionModal` + `aaTriggerCount` + `aaThreshold` + `aa-modal` + `aaShow` + RO text verbatim
4. `src/react/routes/screens/antrenor/Workout.tsx` — handleLogSet entry point post task_12 extraction
5. `src/react/stores/workoutStore.ts` — sessionStart + history + per-set timestamps (if not present, need add per-set timestamp Phase 4)
6. `📤_outbox/LATEST.md` recent envelopes

---

## §2 Spec exact

### A) `src/react/lib/aaFrictionDetect.ts` NEW pure helper

Detect aggressive loading pattern. Pure function — input set history + new set candidate, output boolean trigger.

```typescript
export interface AggressiveLoadCheck {
  trigger: boolean;
  reason?: 'fast_sets' | 'kg_jump' | 'rep_spike';
}

export function detectAggressiveLoad(
  setHistory: { kg: number; reps: number; timestamp: number }[],
  newSet: { kg: number; reps: number; timestamp: number }
): AggressiveLoadCheck;
```

Rules per mockup wv2 D-LEGACY-040:
- **fast_sets:** ≥2 sets logged < 30sec interval (insufficient recovery)
- **kg_jump:** newSet.kg vs prior set kg > 20% increase in same exercise
- **rep_spike:** newSet.reps vs prior set reps > 50% increase same exercise

CC verify exact thresholds via mockup grep — adjust above if mockup differs.

### B) `src/react/components/aaFrictionModal.tsx` NEW component

Centered modal (NU bottom sheet) blocking pe trigger:
- Title + body verbatim mockup (sau placeholder)
- 2 buttons: "Continui oricum" + "Pauza 30s" (sau mockup verbatim)
- Backdrop NU dismiss tap (blocking modal)
- Romanian no-diacritics
- Pure presentational (props: open + reason + onAcknowledge + onForceContinue)

### C) `Workout.tsx` handleLogSet wire

Pre-logSet store dispatch, call `detectAggressiveLoad`. Dacă trigger:
- Set local state `aaModalOpen = true` + `aaReason`
- SUSPEND advance state machine (no logSet, no rest, no transition)
- Modal show → user choose:
  - **Continui oricum:** logSet proceed normal + aaModalOpen=false
  - **Pauza 30s:** logSet proceed + override restCountdown=30 + setPhase('rest') + aaModalOpen=false

### D) `workoutStore` timestamp augment

Verify `ExerciseHistoryEntry` has timestamp field. Dacă NU → add:
```typescript
export interface ExerciseHistoryEntry {
  kg: number;
  reps: number;
  rating: SetRating;
  timestamp: number;  // NEW Phase 4 task_14 — aaFrictionDetect dependency
}
```

logSet action auto-set `timestamp: Date.now()` dacă not provided în call site. Backward compat existing tests = default Date.now() in action.

---

## §3 Implementation hints

- **WORDING DISCIPLINE:** CEO scope LOCK V1. CC preserve mockup RO text verbatim sau placeholder. NU compose autonomous "Stai!" sau "Mai incet!" sau similar. RAPORT §6 wording backlog flag pentru Daniel CEO review pre-Beta.
- **aaFrictionDetect pure function:** ZERO side effects, ZERO React. Lib-level helper testable izolat.
- **Threshold tuning Phase 5+:** thresholds hardcoded Phase 4. Phase 5+ pot fi user-configurable sau Vitality/Adherence engine-driven.
- **Karpathy §3 surgical:** ZERO modify workoutStore beyond timestamp augment. ZERO touch logSet logic existing tests (backward compat default Date.now() fallback).
- **D020 test paradigm:** MemoryRouter + workoutStore reset beforeEach. aaFrictionDetect unit tests pure (zero RTL).

---

## §4 Tests vitest + RTL

```typescript
// src/react/__tests__/lib/aaFrictionDetect.test.ts (~8-12 tests pure)
describe('detectAggressiveLoad', () => {
  it('returns trigger=false cand history empty', () => { /* ... */ });
  it('detects fast_sets pattern 2 sets <30s interval', () => { /* ... */ });
  it('detects kg_jump >20% same exercise', () => { /* ... */ });
  it('detects rep_spike >50% same exercise', () => { /* ... */ });
  it('NU trigger cand thresholds NU exceeded', () => { /* ... */ });
  // +3-7 edge cases (mixed patterns, exact threshold boundaries)
});

// src/react/__tests__/components/aaFrictionModal.test.tsx (~5-8 tests)
describe('aaFrictionModal', () => {
  it('NU render cand open=false', () => { /* ... */ });
  it('renders title + body + 2 buttons cand open=true', () => { /* ... */ });
  it('backdrop tap NU close (blocking)', () => { /* ... */ });
  it('Continui oricum click dispatches onForceContinue', () => { /* ... */ });
  it('Pauza 30s click dispatches onAcknowledge', () => { /* ... */ });
});

// src/react/__tests__/screens/antrenor/Workout.test.tsx augment (~3-5 tests adăugate)
describe('Workout aaFrictionModal wire', () => {
  it('handleLogSet NU trigger modal cand pattern safe', () => { /* ... */ });
  it('handleLogSet triggers aaFrictionModal pe fast_sets pattern', () => { /* ... */ });
  it('Continui oricum proceeds logSet + state machine advance', () => { /* ... */ });
  it('Pauza 30s proceeds logSet + override rest 30sec', () => { /* ... */ });
});
```

---

## §5 Acceptance criteria

- [ ] `aaFrictionDetect.ts` NEW pure helper în `src/react/lib/`
- [ ] `aaFrictionModal.tsx` NEW component în `src/react/components/`
- [ ] Workout.tsx handleLogSet pre-check aaFriction + suspend state machine + modal show
- [ ] 2 button actions (Continui oricum + Pauza 30s) wire correct
- [ ] workoutStore ExerciseHistoryEntry timestamp augment (backward compat default)
- [ ] +10-20 tests PASS
- [ ] 4072+ PASS aggregate preserved
- [ ] TS strict delta zero
- [ ] **WORDING:** mockup verbatim sau placeholder + flag raport §6 backlog
- [ ] Romanian no-diacritics rule

---

## §6 Commit strategy

3-4 commits atomic:
1. `feat(react/store): workoutStore ExerciseHistoryEntry timestamp augment backward compat`
2. `feat(react/lib): aaFrictionDetect pure helper aggressive load pattern detection`
3. `feat(react/components): aaFrictionModal blocking modal 2-button safety acknowledge`
4. `feat(react/antrenor): Workout handleLogSet aaFriction wire suspend state machine`

---

## §7 Backup tag

```bash
git tag pre-phase4-task-14-2026-05-XX
git push origin pre-phase4-task-14-2026-05-XX
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope + §6 WORDING BACKLOG section explicit dacă placeholder used (Daniel CEO review pre-Beta gate).

---

🦫 **task_14 LOCK 9 anti-aggressive loading safety wire. Pre-Beta SAFETY GATE sensitive. D-LEGACY-040 honored. Pure helper detect 3-pattern (fast_sets + kg_jump + rep_spike). Blocking modal 2-button user acknowledge. handleLogSet suspend state machine pre-logSet. WORDING CEO scope = mockup verbatim sau placeholder + flag backlog. Foundation Persona Gigel safety pre-Beta launch.**
