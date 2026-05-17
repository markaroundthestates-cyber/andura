# task_08 — Engine #2 Goal Adaptation Calendar Silent Dispatch Wire

**Phase:** 5 (engine pipeline real wire)
**Type:** Feature — silent engine invoke pe user action
**Deps:** task_05 + task_06 (scheduleAdapter + coachDirector)
**Backup tag:** `pre-phase5-task-08-2026-05-17`
**Est commits:** 1 atomic
**Est tests delta:** +6-10

---

## §1 Scope

Calendar V1 wiki spec (D-LEGACY-076 + augmentat #4 LOCK 2026-05-12) specifică: tap Save după edit week → Engine #2 Goal Adaptation silent compositional re-programming săptămâna curentă (preserving Big 6 priorities) → propagated downstream Engine #1 Periodization multi-week mesocycle constraint. NU notify user (silent), NU toast, NU prompt.

Current `scheduleStore.saveWeekly()` Phase 4 task_19 = stub silent dispatch NO-OP:
```tsx
saveWeekly: () => {
  const _state = get();
  // Side-effect placeholder: engine.dispatchSchedule(_state.days);
  void _state;
  set({ editMode: false });
},
```

Task 08: wire real Engine #2 dispatch via `scheduleAdapter.setCalendarOverride(days)` SAU direct `goalAdaptation.recomputeWeekSchedule(days, ...)` per primary verify ADR 024 + ADR 026 §1.10 Constraint Object immutable propagated downstream.

## §2 Changes

### A. Grep verify engine API ADR primary-source

```bash
grep -rn "goalAdaptation" src/engine/ | head -20
grep -rn "recomputeWeekSchedule" src/engine/ | head
grep -n "calendarOverride" src/engine/scheduleAdapter.js
grep -n "setCalendarOverride" src/engine/scheduleAdapter.js
```

ADR 024 §Goal Adaptation API + ADR 030 D2 thin scope scheduleAdapter pattern.

### B. `src/engine/scheduleAdapter.js` (extend OR verify existing)

Expected expose:
```js
/**
 * Set calendar override mid-week edit. Side-effect: writes to localStorage
 * `wv2-calendar-override` Tier 0 active rolling. Coach context buildCoachContext
 * absorbs invariant via safeCtx.meta.calendarOverride defensive-read per
 * ADR 026 §1.10 Constraint Object immutable propagated downstream.
 *
 * @param {WeekDays} days 7-element array training/rest
 * @returns {void}
 */
export function setCalendarOverride(days) {
  localStorage.setItem('wv2-calendar-override', JSON.stringify({
    days,
    setAt: new Date().toISOString(),
    weekStartISO: weekStartIso(),
  }));
  // Trigger Engine #1 + #2 recompute next buildCoachContext call (lazy invalidation)
}
```

Daca NU exists, create per ADR 030 D2 thin scope pattern. Per memory D-LEGACY-076 S2.A `7c2f520` scheduleAdapter LANDED + S2.B `fce846a` coachContext extend invariant — coachContext absorbs.

### C. `src/react/stores/scheduleStore.ts` (wire)

```tsx
import { setCalendarOverride } from '../../engine/scheduleAdapter.js';

saveWeekly: () => {
  const state = get();
  try {
    setCalendarOverride(state.days);
  } catch (e) {
    console.warn('[scheduleStore] saveWeekly engine dispatch failed:', e);
    // Silent failure — NU break user flow, retry next session
  }
  set({ editMode: false });
},
```

NU show toast (silent per spec). NU notify success/fail explicit user-facing.

### D. `src/engine/coachContext.js` (verify existing extend)

Per S2.B `fce846a` LANDED — already absorbs `wv2-calendar-override` via `safeCtx.meta.calendarOverride`. Verify still wired post Phase 4 batch (no regression).

```bash
grep -n "wv2-calendar-override\|calendarOverride" src/engine/coachContext.js
```

## §3 Acceptance criteria

- [ ] `scheduleStore.saveWeekly()` invokes real `setCalendarOverride(days)`
- [ ] LocalStorage `wv2-calendar-override` written pe save (verify în jsdom test)
- [ ] coachContext.js still absorbs override (regression check)
- [ ] Engine #1 Periodization + Engine #2 Goal Adaptation absorbs ctx.meta.calendarOverride (verified via task_05 + task_06 dependencies invariant)
- [ ] NU toast notification (silent dispatch per spec)
- [ ] Tests +6-10 PASS
- [ ] TS strict 0 errors

## §4 Tests

```bash
src/react/__tests__/scheduleStore.saveWeekly.realWire.test.ts
- saveWeekly writes localStorage wv2-calendar-override
- editMode set false post save
- silent failure mode preserves state când engine throws

src/engine/__tests__/scheduleAdapter.setCalendarOverride.test.js
- writes localStorage cu correct shape (days + setAt + weekStartISO)
- overwrites existing override
```

## §5 Commits (atomic 1)

```
feat(react/stores): scheduleStore saveWeekly real Engine #2 dispatch wire

Replaces Phase 4 task_19 stub silent dispatch NO-OP cu real
scheduleAdapter.setCalendarOverride invocation. LocalStorage
wv2-calendar-override written Tier 0 active rolling pattern ADR 020.
coachContext absorbs via safeCtx.meta.calendarOverride invariant
(S2.B fce846a LANDED, regression check verified).

Engine #1 Periodization + Engine #2 Goal Adaptation absorb via context
downstream lazy invalidation per ADR 026 §1.10 Constraint Object
immutable propagated. NU user-facing toast (silent per Calendar V1 wiki
spec D-LEGACY-076 augmentat #4 LOCK 2026-05-12).
```

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_08_engine_2_calendar_dispatch.md`:
- Engine API verify status (setCalendarOverride existing/new)
- localStorage write pattern Tier 0 confirm
- Silent dispatch invariant
- Regression check coachContext absorbs
