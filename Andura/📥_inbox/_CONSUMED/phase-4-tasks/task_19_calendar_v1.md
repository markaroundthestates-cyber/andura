# TASK 19 — Calendar V1 7-day Strip Antrenor Tab

**Model:** Opus EXCLUSIVELY
**Phase:** 4 (Calendar V1 spec LOCKED memory)
**Depends on:** task_12 LANDED + task_17 prefer (engine wire for Engine #2 silent save trigger)
**Estimated touched files:** Calendar component NEW + Antrenor.tsx integrate + workoutStore weekly state + tests
**Estimated new tests:** +15-25

---

## §0 Bugatti checklist pre-flight

- [ ] Phase 4 prior tasks LANDED
- [ ] Branch HEAD verde 4072+ PASS
- [ ] Backup tag `pre-phase4-task-19-2026-05-XX` push origin
- [ ] **WORDING CEO scope:** day cell labels + Save button copy = mockup verbatim sau placeholder + flag §6

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `04-architecture/mockups/andura-clasic.html` grep:
   - Calendar strip markup (7-day L-Ma-Mi-J-V-S-D)
   - Color tokens `#3d7a4a` (training) + `var(--paper-2)` (rest)
   - Save button copy verbatim
   - Position: below "Vrei altceva azi?" + above "Obiectiv"
   - Locked state default behavior + edit affordance
3. `src/react/routes/screens/antrenor/Antrenor.tsx` — integrate position
4. `src/react/stores/workoutStore.ts` SAU `src/react/stores/scheduleStore.ts` — weekly schedule state location
5. `src/lib/engines/` — Engine #2 reference (Adherence? Schedule? CC grep)

---

## §2 Spec exact

### A) `src/react/components/Calendar7Day.tsx` NEW

7-day strip horizontal scrollable mobile:
- L · Ma · Mi · J · V · S · D labels top
- Per-day cell:
  - **Training day** (default per schedule): background `#3d7a4a`
  - **Rest day** (default per schedule): background `var(--paper-2)`
- **Locked state default:** tap day cell = no-op (display only). Edit button toggle unlock.
- **Edit mode:** tap day cell toggles training ↔ rest. Save button bottom commits change.
- **Save action:** dispatch silently la Engine #2 (Adherence sau Schedule engine) — NU show success toast (silent per spec memory).
- **Ephemeral weekly:** state resets next Monday. Workouts auto-regenerate per Engine logic.

### B) Antrenor.tsx integrate

Render `<Calendar7Day />` între "Vrei altceva azi?" section și "Obiectiv" section. CC verify mockup exact placement.

### C) workoutStore SAU scheduleStore weekly state

State shape:
```typescript
weeklySchedule: {
  weekStartISO: string;  // Monday ISO date
  days: ('training' | 'rest')[];  // 7 entries L-D
  editMode: boolean;
}
```

Actions:
- `setEditMode(boolean)`
- `toggleDay(idx: number)` — flips training/rest
- `saveWeekly()` — dispatch Engine #2 + reset editMode false
- `resetWeekly(weekStartISO)` — Monday auto-reset

### D) Pending clarifications (CC flag raport §6)

Per memory: implementation pending clarifications NEED Daniel CEO decision:
1. **Locked day cells show workout type labels?** (e.g. "Push" / "Pull" / "Legs" / "Odihna" sub day letter)
2. **Mid-week edits forward-only or full-week?** (e.g. luni current → can only edit Ma-D, sau toate L-D)
3. **0/7 day validation extremes** (toate rest = valid? toate training = valid? rules unknown)

**CC Implementation Phase 4 minimum viable:**
- 1: NU show workout type labels (just letter L/Ma/etc + color). Phase 5 enhance dacă Daniel decides.
- 2: full-week edits allowed (no forward-only restriction). Phase 5 adjust dacă needed.
- 3: NO validation (0/7 valid both). Phase 5 add validation rules dacă Daniel decides.

Document Phase 4 default choices în raport §6 + flag pentru Daniel CEO review.

---

## §3 Implementation hints

- **Karpathy §4 simplicity:** Phase 4 MVP = locked default + edit mode toggle + save dispatch. ZERO advanced features (drag-drop reorder, multi-week view, workout type assignment).
- **Engine #2 silent dispatch:** find existing Adherence/Schedule engine API. Wire-through call NU re-implement.
- **Color tokens exact:** `#3d7a4a` training + `var(--paper-2)` rest per memory spec.
- **Mobile horizontal scroll:** 7 cells visible mobile width fit OR scroll. CC layout decide responsive.
- **Romanian no-diacritics:** L/Ma/Mi/J/V/S/D + any text.

---

## §4 Tests vitest + RTL

```typescript
describe('Calendar7Day', () => {
  it('renders 7 day cells L-Ma-Mi-J-V-S-D', () => { /* ... */ });
  it('training day cell background #3d7a4a', () => { /* ... */ });
  it('rest day cell background var(--paper-2)', () => { /* ... */ });
  it('locked state tap day no-op', () => { /* ... */ });
  it('edit mode toggle activates day cell taps', () => { /* ... */ });
  it('toggleDay flips training ↔ rest', () => { /* ... */ });
  it('save dispatches Engine #2 + exits edit mode', () => { /* ... */ });
  it('save NU show toast (silent)', () => { /* ... */ });
  it('Monday auto-reset triggers resetWeekly', () => { /* ... */ });
  // +6-16 more (state persistence, mid-week edits, etc.)
});

describe('Antrenor.tsx integrate Calendar', () => {
  it('Calendar rendered between Vrei altceva and Obiectiv sections', () => { /* ... */ });
});
```

---

## §5 Acceptance criteria

- [ ] `Calendar7Day.tsx` NEW component
- [ ] Antrenor.tsx integrate poziție corectă (între Vrei altceva + Obiectiv)
- [ ] Color tokens exact #3d7a4a + var(--paper-2)
- [ ] Locked default + edit toggle + save dispatch silent
- [ ] Engine #2 wire (Adherence/Schedule dispatch)
- [ ] Monday auto-reset weekly state
- [ ] Pending clarifications Phase 4 defaults documented §6 + flag
- [ ] +15-25 tests PASS
- [ ] 4072+ PASS aggregate preserved
- [ ] TS strict delta zero
- [ ] Romanian no-diacritics

---

## §6 Commit strategy

3-4 commits atomic:
1. `feat(react/store): weeklySchedule state + toggleDay + saveWeekly + Monday reset`
2. `feat(react/components): Calendar7Day strip locked default + edit mode + color tokens`
3. `feat(react/antrenor): Antrenor integrate Calendar7Day between Vrei altceva + Obiectiv`
4. (optional) `test(react/components): Calendar7Day full coverage + Antrenor integration`

---

## §7 Backup tag

```bash
git tag pre-phase4-task-19-2026-05-XX
git push origin pre-phase4-task-19-2026-05-XX
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope + §6 PENDING CLARIFICATIONS section explicit pentru Daniel CEO review (locked cell labels? mid-week scope? validation rules?).

---

🦫 **task_19 Calendar V1 7-day strip Antrenor. Spec LOCKED memory (color tokens + position + locked default + Engine #2 silent + ephemeral weekly). CC Phase 4 MVP defaults (no workout type labels, full-week edits, no validation) + pending clarifications flag §6 Daniel CEO. Foundation Phase 5+ advanced calendar features (drag-reorder, multi-week view, workout assignment).**
