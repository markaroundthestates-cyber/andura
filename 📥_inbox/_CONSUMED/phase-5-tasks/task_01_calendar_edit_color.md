# task_01 — Calendar7Day Edit-Mode Color `#d4e6cb` Per Wiki Spec V1

**Phase:** 5 (cap-coadă)
**Type:** Bug fix surgical
**Deps:** none (atomic standalone)
**Backup tag:** `pre-phase5-task-01-2026-05-17`
**Est commits:** 1 atomic
**Est tests delta:** +2-3 (color assert EDIT vs LOCKED states)

---

## §1 Scope

Calendar V1 wiki spec `99-archive/wiki-pre-2026-05-15/concepts/calendar-feature-v1-spec.md` §UX states 3 LOCKED post-S1.6 simplification specifică color SSOT palette dual-state:

- **LOCKED state:** training cells `#3d7a4a` (verde inchis "Greu") + rest `var(--paper-2)` (neutru)
- **EDIT state:** training cells `#d4e6cb` (verde deschis, semnal "asta e programul, modifică ce vrei") + rest `var(--paper-2)` (neutru)

Codul curent `src/react/components/Calendar7Day.tsx` aplică `#3d7a4a` la training day INDIFERENT de `editMode` — bug Daniel observed direct verbat 2026-05-17 chat ACASĂ: *"calendarul vezi ca are 2 culori cand dai edit... un verde inchis si unu deschis"*.

## §2 Changes

**File 1: `src/react/components/Calendar7Day.tsx`** (1 edit, ~3 LOC)

Înainte (linia ~75-78 day button style):
```tsx
style={{
  background: trainingDay ? '#3d7a4a' : 'var(--paper-2)',
  color: trainingDay ? '#ffffff' : 'var(--ink)',
}}
```

După:
```tsx
style={{
  background: trainingDay
    ? (editMode ? '#d4e6cb' : '#3d7a4a')
    : 'var(--paper-2)',
  color: trainingDay
    ? (editMode ? 'var(--ink)' : '#ffffff')
    : 'var(--ink)',
}}
```

Rationale color contrast: verde deschis `#d4e6cb` cu text alb = ilizibil (WCAG fail). Verde deschis + text dark `var(--ink)` = readable. Verde inchis `#3d7a4a` + text alb = current.

**File 2: `src/react/__tests__/Calendar7Day.test.tsx`** (existing test file augment, +2-3 tests)

Add tests:
```tsx
it('locked state training day uses verde inchis #3d7a4a', () => {
  // render store cu DEFAULT_WEEK + editMode false
  // assert day-0 (L=training) data-kind=training + style.background contains '#3d7a4a'
});

it('edit state training day uses verde deschis #d4e6cb', () => {
  // render + click pencil edit toggle → editMode true
  // assert day-0 style.background contains '#d4e6cb'
  // assert day-0 style.color contains 'var(--ink)'
});

it('rest day color invariant cross-states', () => {
  // toggle editMode + assert rest cell background stays var(--paper-2)
});
```

## §3 Acceptance criteria

- [ ] Calendar7Day.tsx style conditional background+color per editMode (training only — rest invariant)
- [ ] Wiki spec citation comment block added top of style block
- [ ] 2-3 NEW test cases asserting LOCKED vs EDIT colors
- [ ] Vitest verde (4209 → 4211+ PASS)
- [ ] TS strict 0 errors preserved
- [ ] ZERO style mockup `andura-clasic.html` mutation (read-only verify spec)

## §4 Tests

Vitest baseline: 4209 PASS @ `f3cb7dc`. Expected post-task: 4211-4212 PASS (+2-3 NEW).

Grep evidence pre-edit:
```bash
grep -n "#3d7a4a" src/react/components/Calendar7Day.tsx
grep -n "editMode" src/react/components/Calendar7Day.tsx
grep -rn "Calendar7Day" src/react/__tests__/
```

## §5 Commit

Single atomic:
```
fix(react/components): Calendar7Day edit-mode color #d4e6cb per wiki spec V1

Wiki spec 99-archive/wiki-pre-2026-05-15/concepts/calendar-feature-v1-spec.md
§UX states 3 LOCKED post-S1.6 specifies dual-state color SSOT palette:
- LOCKED training: #3d7a4a verde inchis
- EDIT training: #d4e6cb verde deschis (signal "asta e programul, modifica")
- rest: var(--paper-2) cross-states invariant

Current code applied #3d7a4a all states (Phase 4 task_19 oversight).
Surgical fix: style.background + style.color conditional pe editMode.
Tests +2-3 assert LOCKED vs EDIT colors.

Per DECISIONS.md §D-LEGACY-076 Calendar Feature V1 wiki spec.
Backup tag pre-phase5-task-01-2026-05-17 pushed origin pre-execute.
```

## §6 Raport intermediat format

Write `📤_outbox/_archive/2026-05/NN_TASK_01_calendar_edit_color.md`:
- §1 Commit SHA + diff stats
- §2 Tests delta (baseline → final)
- §3 Acceptance ✓
- §4 Issues (NONE expected)
- §5 Next task pointer (task_02 wording sweep)
