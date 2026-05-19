# TASK 02 — Zustand Stores (workoutStore + coachStore)

**Model:** Opus EXCLUSIVELY
**Phase:** B (paralel cu task_03)
**Depends on:** task_01 LANDED
**Estimated touched files:** 2 NEW (workoutStore.ts + coachStore.ts)
**Estimated new tests:** +30-50

---

## §0 Bugatti checklist pre-flight

- [ ] task_01 LANDED (verified via `📤_outbox/LATEST.md` Status=Complete)
- [ ] Branch `feature/v3-react-clasic` HEAD verde (vitest 3784+ PASS post task_01)
- [ ] Backup tag `pre-phase3-task-02-2026-05-16` push origin

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `DECISIONS.md` §D017 §D018 §D-LEGACY-013 §D-LEGACY-027 §D-LEGACY-020 (pure-function ADR 026 §9)
3. `07-meta/karpathy-skills-ref/CLAUDE.md` §1-§4
4. `src/react/stores/appStore.ts` current state (Zustand pattern reference)
5. `04-architecture/mockups/andura-clasic.html` grep pentru `wv2` object + state shape + actions + localStorage keys

---

## §2 Spec exact

### A) `src/react/stores/workoutStore.ts` NEW

Zustand slice pentru workout state machine V2 (`wv2` object din mockup).

```typescript
// ══ WORKOUT STORE — Zustand State Machine V2 ══════════════════════════════
// Per DECISIONS.md §D015 §D016 + mockup wv2 object port React.
// Pure-function actions per ADR 026 §9, side-effects la I/O boundary
// (persist middleware Zustand pentru localStorage sync).
//
// Cross-refs:
//   - DECISIONS.md §D015 STRAT PIVOT React Andura Clasic
//   - DECISIONS.md §D-LEGACY-013 Auto-Aggression Detection (force-typing ELIMINATED)
//   - mockup andura-clasic.html wv2 object reference

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type WorkoutPhase = 'logging' | 'rating' | 'rest' | 'transition' | 'idle';

export interface ExerciseHistoryEntry {
  kg: number;
  reps: number;
  rating: 'usor' | 'potrivit' | 'greu';
}

export interface WorkoutState {
  // Current exercise index în WV2_EXERCISES array
  exIdx: number;
  // Current set index per exerciţiu
  setIdx: number;
  // Current phase state machine
  phase: WorkoutPhase;
  // PR detected în această sesiune
  prHit: boolean;
  // Set history per exerciţiu indexed
  history: Record<number, ExerciseHistoryEntry[]>;
  // Session timestamp ms
  sessionStart: number | null;
  // Last RPE rating din post-rpe
  lastRating: 'usoara' | 'normala' | 'grea' | null;
  // Session paused snapshot (resume card pe Antrenor home)
  pausedSnapshot: PausedSession | null;
  // Last session summary (F2 card Istoric + win-back check)
  lastSession: LastSessionSummary | null;
  // Streak counter (F8)
  streak: number;
}

export interface PausedSession {
  title: string;
  meta: string;
  exIdx: number;
  setIdx: number;
  phase: WorkoutPhase;
  history: Record<number, ExerciseHistoryEntry[]>;
  sessionStart: number;
}

export interface LastSessionSummary {
  title: string;
  meta: string; // "5 seturi · 52 min · 12 450 kg"
  ts: number; // Date.now() la finish
}

export interface WorkoutActions {
  // Lifecycle
  startSession: (sessionStart: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  discardSession: () => void;
  finishSession: (summary: LastSessionSummary) => void;
  // State machine transitions
  setPhase: (phase: WorkoutPhase) => void;
  logSet: (exIdx: number, entry: ExerciseHistoryEntry) => void;
  advanceExercise: () => void;
  markPRHit: () => void;
  setLastRating: (rating: 'usoara' | 'normala' | 'grea') => void;
  // Streak
  incrementStreak: () => void;
  resetStreak: () => void;
  // Reset
  reset: () => void;
}

export const useWorkoutStore = create<WorkoutState & WorkoutActions>()(
  persist(
    (set) => ({
      // Initial state
      exIdx: 0,
      setIdx: 0,
      phase: 'idle',
      prHit: false,
      history: {},
      sessionStart: null,
      lastRating: null,
      pausedSnapshot: null,
      lastSession: null,
      streak: 0,
      // Actions...
      startSession: (sessionStart) => set({ sessionStart, phase: 'logging', exIdx: 0, setIdx: 0, prHit: false, history: {} }),
      pauseSession: () => set((s) => ({ pausedSnapshot: s.sessionStart ? {
        title: 'Push', meta: `ex ${s.exIdx + 1}`, exIdx: s.exIdx, setIdx: s.setIdx,
        phase: s.phase, history: s.history, sessionStart: s.sessionStart,
      } : null, phase: 'idle', sessionStart: null })),
      resumeSession: () => set((s) => s.pausedSnapshot ? {
        exIdx: s.pausedSnapshot.exIdx, setIdx: s.pausedSnapshot.setIdx,
        phase: s.pausedSnapshot.phase, history: s.pausedSnapshot.history,
        sessionStart: s.pausedSnapshot.sessionStart, pausedSnapshot: null,
      } : {}),
      discardSession: () => set({ phase: 'idle', exIdx: 0, setIdx: 0, history: {}, sessionStart: null, prHit: false, pausedSnapshot: null }),
      finishSession: (summary) => set({ phase: 'idle', sessionStart: null, lastSession: summary, exIdx: 0, setIdx: 0, history: {} }),
      setPhase: (phase) => set({ phase }),
      logSet: (exIdx, entry) => set((s) => ({
        history: { ...s.history, [exIdx]: [...(s.history[exIdx] || []), entry] }
      })),
      advanceExercise: () => set((s) => ({ exIdx: s.exIdx + 1, setIdx: 0, phase: 'logging' })),
      markPRHit: () => set({ prHit: true }),
      setLastRating: (rating) => set({ lastRating: rating }),
      incrementStreak: () => set((s) => ({ streak: s.streak + 1 })),
      resetStreak: () => set({ streak: 0 }),
      reset: () => set({
        exIdx: 0, setIdx: 0, phase: 'idle', prHit: false, history: {},
        sessionStart: null, lastRating: null, pausedSnapshot: null,
      }),
    }),
    {
      name: 'wv2-workout-store', // localStorage key prefix
      storage: createJSONStorage(() => localStorage),
      // Persist selective: pausedSnapshot + lastSession + streak (NU sessionStart runtime-only)
      partialize: (state) => ({
        pausedSnapshot: state.pausedSnapshot,
        lastSession: state.lastSession,
        streak: state.streak,
      }),
    }
  )
);
```

### B) `src/react/stores/coachStore.ts` NEW

Zustand slice pentru coach context (rest day vs workout day + persona tweaks + reactivate dismissed).

```typescript
// ══ COACH STORE — Zustand Coach Context Slice ═════════════════════════════
// Per DECISIONS.md §D-LEGACY-052 Andura Suflet + §D-LEGACY-065 Gigel Test.
// _schedContext + persona variant + win-back dismiss flag.
//
// In prod _schedContext va veni din coachDirector.buildSession() result —
// Phase 3 placeholder hardcoded 'workout' (Tweaks panel mockup override).

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type SchedContext = 'workout' | 'rest';
export type Persona = 'maria' | 'gigel' | 'marius';

export interface CoachState {
  schedContext: SchedContext;
  persona: Persona;
  reactivateDismissed: boolean;
}

export interface CoachActions {
  setSchedContext: (ctx: SchedContext) => void;
  setPersona: (p: Persona) => void;
  dismissReactivate: () => void;
  resetDismissReactivate: () => void;
}

export const useCoachStore = create<CoachState & CoachActions>()(
  persist(
    (set) => ({
      schedContext: 'workout',
      persona: 'gigel',
      reactivateDismissed: false,
      setSchedContext: (schedContext) => set({ schedContext }),
      setPersona: (persona) => set({ persona }),
      dismissReactivate: () => set({ reactivateDismissed: true }),
      resetDismissReactivate: () => set({ reactivateDismissed: false }),
    }),
    {
      name: 'wv2-coach-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

---

## §3 Implementation hints

- Mockup `wv2` object reference: vezi tail JS mockup pentru exact field shapes + transitions.
- Persist middleware Zustand: `partialize` selective ce salvăm vs ce e runtime-only.
- Anti-paternalism (D-LEGACY-061): NU motivational copy hardcoded în store. Doar state.
- Pure-function actions: `set()` callback receives previous state, returns new state slice (NU mutation).
- TS strict: type imports `import type` pentru types only.

---

## §4 Tests vitest (pure-function, NU jsdom needed)

### A) `src/react/__tests__/stores/workoutStore.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkoutStore } from '../../stores/workoutStore';

describe('workoutStore state machine', () => {
  beforeEach(() => { useWorkoutStore.getState().reset(); localStorage.clear(); });

  it('startSession transitions idle → logging', () => {
    useWorkoutStore.getState().startSession(Date.now());
    expect(useWorkoutStore.getState().phase).toBe('logging');
  });

  it('logSet appends entry la history per exIdx', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().logSet(0, { kg: 22.5, reps: 10, rating: 'potrivit' });
    expect(useWorkoutStore.getState().history[0]).toHaveLength(1);
  });

  it('advanceExercise increments exIdx + resets setIdx + phase logging', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().advanceExercise();
    expect(useWorkoutStore.getState().exIdx).toBe(1);
    expect(useWorkoutStore.getState().setIdx).toBe(0);
  });

  it('pauseSession captures snapshot + transitions idle', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().logSet(0, { kg: 20, reps: 10, rating: 'usor' });
    useWorkoutStore.getState().pauseSession();
    expect(useWorkoutStore.getState().pausedSnapshot).not.toBeNull();
    expect(useWorkoutStore.getState().phase).toBe('idle');
  });

  it('resumeSession restores from pausedSnapshot', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().logSet(0, { kg: 20, reps: 10, rating: 'usor' });
    useWorkoutStore.getState().pauseSession();
    useWorkoutStore.getState().resumeSession();
    expect(useWorkoutStore.getState().pausedSnapshot).toBeNull();
    expect(useWorkoutStore.getState().history[0]).toHaveLength(1);
  });

  it('discardSession clears everything', () => {
    useWorkoutStore.getState().startSession(Date.now());
    useWorkoutStore.getState().logSet(0, { kg: 20, reps: 10, rating: 'usor' });
    useWorkoutStore.getState().discardSession();
    expect(useWorkoutStore.getState().history).toEqual({});
  });

  it('finishSession saves lastSession summary', () => {
    useWorkoutStore.getState().finishSession({ title: 'Push', meta: '5 seturi · 52 min', ts: Date.now() });
    expect(useWorkoutStore.getState().lastSession?.title).toBe('Push');
  });

  it('incrementStreak +1', () => {
    useWorkoutStore.getState().incrementStreak();
    expect(useWorkoutStore.getState().streak).toBe(1);
  });

  it('persist partialize selectiv (pausedSnapshot + lastSession + streak)', async () => {
    useWorkoutStore.getState().incrementStreak();
    // Asigurate persist write
    await new Promise((r) => setTimeout(r, 10));
    const raw = localStorage.getItem('wv2-workout-store');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.streak).toBe(1);
    expect(parsed.state.sessionStart).toBeUndefined();
  });

  // ... +5-10 more edge cases (markPRHit, setLastRating, multi-exercise flow)
});
```

### B) `src/react/__tests__/stores/coachStore.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useCoachStore } from '../../stores/coachStore';

describe('coachStore', () => {
  beforeEach(() => {
    useCoachStore.setState({ schedContext: 'workout', persona: 'gigel', reactivateDismissed: false });
    localStorage.clear();
  });

  it('default schedContext = workout', () => {
    expect(useCoachStore.getState().schedContext).toBe('workout');
  });

  it('setSchedContext rest', () => {
    useCoachStore.getState().setSchedContext('rest');
    expect(useCoachStore.getState().schedContext).toBe('rest');
  });

  it('setPersona maria', () => {
    useCoachStore.getState().setPersona('maria');
    expect(useCoachStore.getState().persona).toBe('maria');
  });

  it('dismissReactivate flag', () => {
    useCoachStore.getState().dismissReactivate();
    expect(useCoachStore.getState().reactivateDismissed).toBe(true);
  });

  // ... persist tests similar workoutStore
});
```

---

## §5 Acceptance criteria

- [ ] `workoutStore.ts` exports `useWorkoutStore` cu state + actions + persist middleware
- [ ] `coachStore.ts` exports `useCoachStore` cu schedContext + persona + reactivateDismissed
- [ ] Persist middleware functional (localStorage sync)
- [ ] vitest count: +30-50 new tests
- [ ] TS strict compile clean
- [ ] Pre-commit hook verde per commit

---

## §6 Commit strategy

2 commits atomic:
1. `feat(stores): workoutStore Zustand state machine V2 + persist middleware`
2. `feat(stores): coachStore Zustand schedContext + persona + reactivateDismissed`

---

## §7 Backup tag

```bash
git tag pre-phase3-task-02-2026-05-16
git push origin pre-phase3-task-02-2026-05-16
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope (per orchestrator §3).

---

🦫 **task_02 Stores. Phase B paralel cu task_03. Pure-function paradigm. Persist selective.**
