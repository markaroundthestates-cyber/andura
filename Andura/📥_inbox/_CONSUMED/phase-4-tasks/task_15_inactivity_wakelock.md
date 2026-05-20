# TASK 15 — Inactivity Watch + Wake Lock Visibility-Change Re-acquire

**Model:** Opus EXCLUSIVELY
**Phase:** 4
**Depends on:** task_12 LANDED (Workout.tsx structure post-extract)
**Estimated touched files:** Workout.tsx effects modify + 1 NEW pure lib helper (optional) + tests augment
**Estimated new tests:** +6-12

---

## §0 Bugatti checklist pre-flight

- [ ] Phase 4 task_12 LANDED 4072 PASS baseline (sau later batch sequential)
- [ ] Branch HEAD verde
- [ ] Backup tag `pre-phase4-task-15-2026-05-XX` push origin

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `04-architecture/mockups/andura-clasic.html` grep `startInactivityWatch` + `stopInactivityWatch` + `inactivityTimeout` + threshold seconds value verbatim
3. `src/react/routes/screens/antrenor/Workout.tsx` — current wake lock effect (~lines 100-130 mount-only)
4. `📤_outbox/LATEST.md` recent task_12 envelope

---

## §2 Spec exact

### A) Inactivity watch — Workout.tsx augment

Detect user inactivity during session (no input log >Xsec → prompt resume sau auto-exit).

- **Threshold:** mockup `inactivityTimeout` verbatim value (likely 600s = 10min, CC verify)
- **Reset triggers:** any of (kg/reps input change, rating button click, skip rest click)
- **Timeout action:** show inactivity prompt OR auto-pause session (CC verify mockup behavior pattern)
- **Cleanup:** clear timer on unmount + on phase transition (rest → logging cycles)

Implementation pattern useEffect cu `setTimeout` + dependency `[lastActivityTimestamp, phase]`. lastActivityTimestamp local useState reset pe orice trigger.

### B) Wake lock visibility-change re-acquire

Currently Workout.tsx wake lock = mount-only acquire. Browser tab background → wake lock released by OS. Tab foreground → NU re-acquire (existing pattern).

**Fix:** add `visibilitychange` event listener — pe `document.visibilityState === 'visible'` re-call `navigator.wakeLock.request('screen')` dacă lock null.

```typescript
useEffect(() => {
  // ... existing acquire on mount
  
  function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && !lockRef.current) {
      // re-acquire
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

Fail silent pe orice eroare (Phase 4 invariant per existing pattern).

### C) Optional helper extraction

Inactivity watch logic + wake lock visibility = local Workout.tsx effects. Defer lib extraction Phase 5+ dacă reuse needed alta screen (Phase 4 single-consumer scope task_12 Karpathy §3 simplicity).

---

## §3 Implementation hints

- **Karpathy §3 surgical:** Workout.tsx effects augment, ZERO refactor existing handlers/state.
- **Wake lock ref pattern:** existing `lock` captured în useEffect closure NU accesibil din visibilitychange handler. Use `useRef<WakeLockSentinel | null>(null)` pentru shared mutable ref.
- **Inactivity threshold per mockup verbatim** — CC verify exact value, NU guess.
- **Timer cleanup:** clearTimeout în useEffect cleanup + reset on state changes.
- **Romanian no-diacritics** any UI text (inactivity prompt copy if added) — CEO wording scope if user-facing copy needed, defer placeholder + flag raport §6.

---

## §4 Tests vitest + RTL

```typescript
// src/react/__tests__/screens/antrenor/Workout.test.tsx augment

describe('Workout inactivity watch', () => {
  it('inactivity timer starts on mount', () => { /* vi.useFakeTimers */ });
  it('timer resets on input change', () => { /* ... */ });
  it('timer resets on rating button click', () => { /* ... */ });
  it('timer reaches threshold → triggers action per mockup', () => { /* ... */ });
  it('cleanup clears timer on unmount', () => { /* ... */ });
});

describe('Workout wake lock visibility re-acquire', () => {
  it('visibilitychange visible re-acquires wake lock cand lock null', () => { /* ... */ });
  it('visibilitychange hidden NU re-acquire', () => { /* ... */ });
  it('fail silent dacă wakeLock API absent', () => { /* ... */ });
});
```

Mock `document.visibilityState` + `navigator.wakeLock.request` în test setup.

---

## §5 Acceptance criteria

- [ ] Workout.tsx inactivity watch useEffect (threshold mockup verbatim)
- [ ] Workout.tsx wake lock visibilitychange re-acquire useEffect
- [ ] Activity reset triggers wire (input + rating + skip)
- [ ] +6-12 tests PASS
- [ ] 4072+ PASS aggregate preserved
- [ ] TS strict delta zero
- [ ] Romanian no-diacritics
- [ ] Mockup behavior parity per wv2 reference

---

## §6 Commit strategy

2 commits atomic:
1. `feat(react/antrenor): Workout wake lock visibilitychange re-acquire pattern`
2. `feat(react/antrenor): Workout inactivity watch timeout reset pe activity triggers`

---

## §7 Backup tag

```bash
git tag pre-phase4-task-15-2026-05-XX
git push origin pre-phase4-task-15-2026-05-XX
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope.

---

🦫 **task_15 Inactivity watch + Wake lock visibility-change. Polish wv2 reference port post-extract. Workout.tsx effects augment surgical Karpathy §3. Single-consumer Phase 4 scope (lib extraction defer Phase 5+ dacă cross-screen reuse emerges). Browser tab background → wake lock auto-release → foreground re-acquire. User inactivity → mockup-defined prompt sau auto-pause behavior.**
