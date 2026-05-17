# TASK 08 — Workout State Machine UI (Workout.tsx)

**Model:** Opus EXCLUSIVELY
**Phase:** C (paralel cu task_04 task_05 task_06 task_07 task_09)
**Depends on:** task_01 + task_02 + task_03 LANDED
**Estimated touched files:** 1 rewrite stub (Workout.tsx) + 4-6 sub-components
**Estimated new tests:** +30-50

---

## §0 Bugatti checklist pre-flight

- [ ] task_01 + task_02 + task_03 LANDED
- [ ] Branch HEAD verde
- [ ] Backup tag `pre-phase3-task-08-2026-05-16` push origin

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `DECISIONS.md` §D-LEGACY-027 §D-LEGACY-029 §D-LEGACY-076 §D-LEGACY-098 (all engines compose pipeline)
3. `04-architecture/mockups/andura-clasic.html` grep:
   - `id="workout"` screen section + `wv2-log-zone` + `wv2-rating-zone` + `wv2-rest-overlay` + `wv2-transition`
   - `wv2.exIdx` + `wv2.setIdx` + `wv2.phase` state machine transitions
   - `WV2_EXERCISES` seed data array
   - `wv2Render()` UI render function
   - `wv2-timer` session timer + `wv2-rest-overlay` rest countdown
   - `session-mini-player` pill mini-player + `markActiveSession` + `clearActiveSession`
   - `confirmExitWorkout` 3-option sheet (Continui / Salveaza si reia / Renunt)
   - `startInactivityWatch` + `stopInactivityWatch` inactivity timer
   - `acquireWakeLock` + `releaseWakeLock` screen wake API
   - Anti-aggressive loading aaFrictionModal (LOCK 9) — Phase 3 placeholder

---

## §2 Spec exact

### A) `Workout.tsx` rewrite stub → real (state machine UI)

Workout screen orchestrates wv2 state machine cu 4 sub-zones:
1. **Header:** workout title + session timer + exercise progress "Ex 2/5"
2. **Log zone** (phase=logging): current exercise + previous set history + set input (kg/reps) + set rating buttons + "Salveaza set" button + "Skip rest" optional
3. **Rating zone** (phase=rating): post-set rating 3-button RO (Usor / Potrivit / Greu) → log set
4. **Rest overlay** (phase=rest): countdown timer + "Salt rest" button → next set
5. **Transition** (phase=transition): "Urmatorul exercitiu" + brief coach line → next exercise

Plus:
- **Floating exit button:** top-right "X" → `confirmExitWorkout` 3-option sheet
- **Session mini-player pill:** sticky bottom-above-nav (mockup `.session-pill`) — render în Layout?? Or render aici cu portal?

Phase 3 decision: session pill render în Workout component (parent Layout always renders BottomNav). Phase 4+ refactor cu Layout portal sau global mini-player component.

```tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { gotoPath } from '../../../lib/navigation';
import { coachPick } from '../../../lib/coachVoice';

// Phase 3 demo seed data — Phase 4+ engineWrappers.getTodayWorkout
const WV2_EXERCISES = [
  { id: 'bench-press', name: 'Bench Press', sets: 4, targetReps: 10, targetKg: 22.5, restSec: 90 },
  { id: 'overhead-press', name: 'Overhead Press', sets: 4, targetReps: 8, targetKg: 17.5, restSec: 120 },
  { id: 'incline-db', name: 'Incline DB', sets: 3, targetReps: 12, targetKg: 14, restSec: 75 },
  { id: 'lateral-raise', name: 'Lateral Raise', sets: 3, targetReps: 15, targetKg: 6, restSec: 60 },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', sets: 3, targetReps: 12, targetKg: 25, restSec: 60 },
];

export function Workout(): JSX.Element {
  const navigate = useNavigate();
  const { exIdx, setIdx, phase, history, sessionStart, startSession, logSet, setPhase, advanceExercise, pauseSession, discardSession } = useWorkoutStore();
  
  const [elapsed, setElapsed] = useState(0);
  const [restCountdown, setRestCountdown] = useState(0);
  const [kgInput, setKgInput] = useState<number>(WV2_EXERCISES[0].targetKg);
  const [repsInput, setRepsInput] = useState<number>(WV2_EXERCISES[0].targetReps);
  const [exitSheetOpen, setExitSheetOpen] = useState(false);

  // Init session on mount (if NU paused snapshot)
  useEffect(() => {
    if (phase === 'idle') startSession(Date.now());
  }, [phase, startSession]);

  // Session timer
  useEffect(() => {
    if (!sessionStart) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStart) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStart]);

  // Rest countdown timer
  useEffect(() => {
    if (phase !== 'rest') return;
    const interval = setInterval(() => {
      setRestCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('logging');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, setPhase]);

  // Wake lock acquire on mount + release on unmount
  useEffect(() => {
    let lock: any = null;
    (async () => {
      try {
        // @ts-expect-error wakeLock API
        if (navigator.wakeLock) lock = await navigator.wakeLock.request('screen');
      } catch (e) { /* fail silent */ }
    })();
    return () => { if (lock) lock.release(); };
  }, []);

  const currentExercise = WV2_EXERCISES[exIdx];
  const currentSetIdx = (history[exIdx]?.length || 0);
  const isLastSetOfExercise = currentSetIdx + 1 >= currentExercise.sets;
  const isLastExercise = exIdx + 1 >= WV2_EXERCISES.length;

  function handleLogSet(rating: 'usor' | 'potrivit' | 'greu') {
    logSet(exIdx, { kg: kgInput, reps: repsInput, rating });
    if (isLastSetOfExercise) {
      if (isLastExercise) {
        navigate(gotoPath('post-rpe'));
      } else {
        setPhase('transition');
        setTimeout(() => { advanceExercise(); setKgInput(WV2_EXERCISES[exIdx + 1].targetKg); setRepsInput(WV2_EXERCISES[exIdx + 1].targetReps); }, 1500);
      }
    } else {
      setRestCountdown(currentExercise.restSec);
      setPhase('rest');
    }
  }

  function handleExit(action: 'continue' | 'pause' | 'discard') {
    if (action === 'continue') { setExitSheetOpen(false); return; }
    if (action === 'pause') { pauseSession(); navigate(gotoPath('antrenor')); return; }
    if (action === 'discard') { discardSession(); navigate(gotoPath('antrenor')); return; }
  }

  return (
    <section className="paper-bg min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-paper border-b border-line p-4 flex items-center justify-between">
        <div>
          <h1 className="body-text font-semibold text-ink">{currentExercise.name}</h1>
          <p className="small-text text-ink3">Ex {exIdx + 1}/{WV2_EXERCISES.length} · {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</p>
        </div>
        <button onClick={() => setExitSheetOpen(true)} className="p-2 rounded-full text-ink3">X</button>
      </header>

      {/* Log zone */}
      {phase === 'logging' && (
        <div className="p-6">
          <p className="small-text text-ink3 mb-2">Set {currentSetIdx + 1}/{currentExercise.sets}</p>
          {/* Set history previous */}
          <div className="mb-4">
            {(history[exIdx] || []).map((h, i) => (
              <div key={i} className="flex justify-between p-2 text-ink2 small-text">
                <span>Set {i + 1}</span>
                <span>{h.kg} kg × {h.reps} reps · {h.rating}</span>
              </div>
            ))}
          </div>
          {/* Input current set */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1">
              <label className="small-text text-ink3">Kg</label>
              <input type="number" value={kgInput} onChange={(e) => setKgInput(Number(e.target.value))} className="w-full p-3 border border-line-strong rounded-xl" />
            </div>
            <div className="flex-1">
              <label className="small-text text-ink3">Reps</label>
              <input type="number" value={repsInput} onChange={(e) => setRepsInput(Number(e.target.value))} className="w-full p-3 border border-line-strong rounded-xl" />
            </div>
          </div>
          {/* Rating 3-button RO */}
          <p className="body-text text-ink mb-3">Cum a fost setul?</p>
          <div className="flex gap-3">
            <button onClick={() => handleLogSet('usor')} className="flex-1 py-3 bg-paper2 border border-line-strong rounded-xl text-ink">Usor</button>
            <button onClick={() => handleLogSet('potrivit')} className="flex-1 py-3 bg-paper2 border border-line-strong rounded-xl text-ink">Potrivit</button>
            <button onClick={() => handleLogSet('greu')} className="flex-1 py-3 bg-paper2 border border-line-strong rounded-xl text-ink">Greu</button>
          </div>
        </div>
      )}

      {/* Rest overlay */}
      {phase === 'rest' && (
        <div className="fixed inset-0 bg-paper/95 flex flex-col items-center justify-center z-50">
          <p className="small-text text-ink3 mb-2">Pauza</p>
          <p className="text-6xl font-bold text-ink">{Math.floor(restCountdown / 60)}:{String(restCountdown % 60).padStart(2, '0')}</p>
          <button onClick={() => { setRestCountdown(0); setPhase('logging'); }} className="mt-6 px-6 py-3 bg-brick text-white rounded-xl">Sari pauza</button>
        </div>
      )}

      {/* Transition */}
      {phase === 'transition' && (
        <div className="fixed inset-0 bg-paper flex flex-col items-center justify-center">
          <p className="display-text font-semibold text-ink mb-2">Urmatorul:</p>
          <p className="body-text text-ink2">{WV2_EXERCISES[exIdx + 1]?.name}</p>
          <p className="coach-quote small-text text-ink2 mt-4 italic">„{coachPick('transition', undefined, 0)}"</p>
        </div>
      )}

      {/* Exit confirm sheet */}
      {exitSheetOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-end justify-center z-50">
          <div className="bg-paper rounded-t-2xl p-6 w-full max-w-md">
            <h2 className="body-text font-bold text-ink mb-2">Iesi din sesiune?</h2>
            <p className="small-text text-ink2 mb-4">Ai facut {exIdx}/{WV2_EXERCISES.length} exercitii. Cum continui?</p>
            <button onClick={() => handleExit('continue')} className="w-full py-3 bg-ink text-paper rounded-xl body-text font-semibold mb-2">Continui sesiunea</button>
            <button onClick={() => handleExit('pause')} className="w-full py-3 bg-white border border-line-strong rounded-xl text-ink body-text font-semibold mb-2">Salveaza si reia mai tarziu</button>
            <button onClick={() => handleExit('discard')} className="w-full py-2 text-brick small-text">Renunt la sesiune</button>
          </div>
        </div>
      )}
    </section>
  );
}
```

### B) Sub-components extract (optional Phase 3, must Phase 4)

- `src/react/components/Workout/SessionTimer.tsx`
- `src/react/components/Workout/RestOverlay.tsx`
- `src/react/components/Workout/SetLogInput.tsx`
- `src/react/components/Workout/SetRatingButtons.tsx`
- `src/react/components/Workout/ExitConfirmSheet.tsx`
- `src/react/components/Workout/SessionPill.tsx`

Phase 3 acceptable: monolitic Workout.tsx + extracted sub-components on iteration. Sau direct decomposed dacă CC autonomous prefera.

---

## §3 Implementation hints

- Phase 3 demo: `WV2_EXERCISES` hardcoded seed array. Phase 4+ wire la `engineWrappers.getTodayWorkout(userId)` result.
- Wake lock API: optional, fail silent dacă browser nu suporta.
- Inactivity watch (mockup `startInactivityWatch`): Phase 3 NU implementat (Phase 4+ adds idle detection).
- Anti-aggressive loading (LOCK 9, D-LEGACY-040): Phase 3 NU wired (Phase 4+ adds aaFrictionModal).
- Romanian no-diacritics rule preserved.
- ZERO modals per mockup V1 LOCKED (exit sheet = bottom sheet acceptable, NU centered modal).

---

## §4 Tests vitest + RTL (MemoryRouter per D020)

### A) `Workout.test.tsx`

```typescript
describe('Workout state machine', () => {
  beforeEach(() => { useWorkoutStore.getState().reset(); });

  it('renders log zone phase=logging', () => { /* ... */ });
  it('renders 3 rating buttons (Usor/Potrivit/Greu)', () => { /* ... */ });
  it('log set advances to rest phase cand NU last set', () => { /* ... */ });
  it('log last set of exercise advances la transition phase + advance exercise', () => { /* ... */ });
  it('log last set of last exercise navigates post-rpe', () => { /* ... */ });
  it('rest overlay countdown decrements', () => { /* ... */ }); // vi.useFakeTimers()
  it('skip rest button triggers logging phase imediat', () => { /* ... */ });
  it('exit X button opens confirm sheet 3-option', () => { /* ... */ });
  it('exit Continue closes sheet, NU navigate', () => { /* ... */ });
  it('exit Pause saves pausedSnapshot + navigates antrenor', () => { /* ... */ });
  it('exit Discard clears state + navigates antrenor', () => { /* ... */ });
  it('session timer increments per second', () => { /* ... */ }); // vi.useFakeTimers()
  // ... +15-20 more (edge cases: input invalid, PR detection stub, etc.)
});
```

---

## §5 Acceptance criteria

- [ ] Workout.tsx full state machine UI (logging/rating/rest/transition + exit confirm)
- [ ] 5 sub-zones rendered conditional pe phase
- [ ] Session timer + rest countdown functional
- [ ] Exit confirm 3-option sheet (Continui / Salveaza / Renunt)
- [ ] log set → advance state machine correctly per isLastSetOfExercise + isLastExercise
- [ ] Wake lock acquire on mount + release on unmount (fail silent)
- [ ] Romanian no-diacritics preserved
- [ ] vitest count: +30-50 new tests
- [ ] TS strict compile clean

---

## §6 Commit strategy

3-4 commits atomic:
1. `feat(react/antrenor): Workout state machine UI core (log zone + rating buttons + state transitions)`
2. `feat(react/antrenor): Workout rest overlay + transition phase + timer effects`
3. `feat(react/antrenor): Workout exit confirm 3-option sheet + pause/discard wiring`
4. `test(react/antrenor): cover Workout state machine transitions + timers + exit flows`

---

## §7 Backup tag

```bash
git tag pre-phase3-task-08-2026-05-16
git push origin pre-phase3-task-08-2026-05-16
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope.

---

🦫 **task_08 Workout state machine. Phase C paralel. Most complex component Phase 3. 4 phases UI conditional. Exit sheet 3-option. Romanian no-diacritics preserved.**
