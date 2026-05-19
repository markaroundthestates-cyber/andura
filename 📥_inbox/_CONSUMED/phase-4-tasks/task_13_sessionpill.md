# TASK 13 — SessionPill Global Layout Portal

**Model:** Opus EXCLUSIVELY
**Phase:** 4
**Depends on:** task_12 LANDED (Workout sub-components extracted)
**Estimated touched files:** 1 NEW SessionPill component + Layout.tsx modify + Workout.tsx integration (remove pill scope if any) + 1 NEW test file
**Estimated new tests:** +8-15

---

## §0 Bugatti checklist pre-flight

- [ ] Phase 4 task_12 LANDED 4072 PASS baseline
- [ ] Branch HEAD verde post task_12 commit `e4e2533` (sau later if batch)
- [ ] Backup tag `pre-phase4-task-13-2026-05-XX` push origin

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `src/react/routes/Layout.tsx` — current Layout structure (BottomNav, Outlet)
3. `src/react/stores/workoutStore.ts` — phase + sessionStart + history state
4. `src/react/routes/screens/antrenor/Workout.tsx` — handleExit pause flow
5. `04-architecture/mockups/andura-clasic.html` grep `session-pill` + `session-mini-player` + `markActiveSession` + `clearActiveSession`
6. `📤_outbox/LATEST.md` task_12 envelope §6 carry-forward

---

## §2 Spec exact

### A) `src/react/components/SessionPill.tsx` NEW component

Render sticky-above-BottomNav cand workoutStore.phase ≠ 'idle' AND current route ≠ '/antrenor/workout' (anti-duplicate while ON workout screen).

- Props: zero (consumes workoutStore selectors direct + useLocation + useNavigate)
- Renders: exercise name current + elapsed MM:SS live + tap area → navigate `/antrenor/workout`
- Position: `fixed bottom-[var(--bottomnav-height)] left-0 right-0` cu z-index sub modals dar peste content
- Mockup ref `.session-pill` styling preserved (background paper2 + border-line + padding)
- Romanian no-diacritics rule

### B) Layout.tsx modify

Render `<SessionPill />` conditional în Layout.tsx între `<Outlet />` și `<BottomNav />` (sau echivalent layout slot).

```tsx
<Outlet />
<SessionPill />
<BottomNav />
```

SessionPill component decide self conditional render (phase + route check) — Layout NU branch logic, pure pass-through.

### C) Workout.tsx integration

Workout.tsx parent NU render SessionPill local (Layout global handles). ZERO modify Workout.tsx în acest task DACĂ pill nu există deja inline (verify task_12 final state).

---

## §3 Implementation hints

- **useLocation route guard:** `useLocation().pathname` check vs gotoPath('workout') resolved string. ZERO duplicate render workout screen activ.
- **Live elapsed:** SessionPill maintains own setInterval ~1Hz pentru elapsed display. Per-frame OK (1 fps minimal CPU).
- **Tap area:** entire pill clickable → `navigate(gotoPath('workout'))`. ZERO close button (resume only behavior).
- **Edge case paused:** dacă workoutStore.pausedSnapshot exists + phase === 'idle' → display "Sesiunea pe pauza · Reia" (mockup verbatim) cu tap → resume. CC verify mockup wording pre-implement.
- **Karpathy §3 surgical:** ZERO touch existing Workout.tsx logic. ZERO global state changes workoutStore. Read-only consumer.
- **D020 test paradigm:** MemoryRouter + workoutStore reset beforeEach.

---

## §4 Tests vitest + RTL

```typescript
describe('SessionPill', () => {
  it('NU render cand phase=idle + NU paused', () => { /* ... */ });
  it('renders cand phase=logging + route NU workout', () => { /* ... */ });
  it('NU render cand route=workout (anti-duplicate)', () => { /* ... */ });
  it('renders exercise name current + elapsed MM:SS', () => { /* ... */ });
  it('renders cu paused state cand pausedSnapshot exists', () => { /* ... */ });
  it('tap navigates /antrenor/workout', () => { /* ... */ });
  it('elapsed updates per second', () => { /* ... */ }); // vi.useFakeTimers
  // +1-8 more edge cases
});
```

---

## §5 Acceptance criteria

- [ ] `SessionPill.tsx` NEW în `src/react/components/`
- [ ] Layout.tsx render `<SessionPill />` între Outlet și BottomNav
- [ ] Conditional render phase ≠ idle AND route ≠ workout
- [ ] Live elapsed update 1Hz
- [ ] Tap navigate workout route
- [ ] Paused state separate copy (mockup verbatim)
- [ ] +8-15 tests PASS
- [ ] 4072+ PASS aggregate preserved
- [ ] TS strict delta zero

---

## §6 Commit strategy

2-3 commits atomic:
1. `feat(react/components): SessionPill global mini-player component`
2. `feat(react/routes): Layout integrate SessionPill conditional render`
3. (optional) `test(react/components): SessionPill conditional render + tap navigate coverage`

---

## §7 Backup tag

```bash
git tag pre-phase4-task-13-2026-05-XX
git push origin pre-phase4-task-13-2026-05-XX
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope.

---

🦫 **task_13 SessionPill global Layout portal. Cross-tab persistence active workout. Read-only consumer workoutStore + useLocation guard anti-duplicate. Pure presentational + minimal self-managed setInterval. Phase 4 feature add post UI extraction stabilizată. Foundation pentru cross-tab UX continuity user persona Gigel ("am inceput sesiunea, am dat tap pe Cont sa verific ceva, vad pill jos = pot reveni direct").**
