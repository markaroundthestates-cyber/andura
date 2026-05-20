# TASK 20 — Nutrition Logging Port LOCK 11

**Model:** Opus EXCLUSIVELY
**Phase:** 4-5 boundary (LOCK 11 pre-Beta sensitive)
**Depends on:** task_16 LANDED (Progres tab structure) preferable
**Estimated touched files:** 2-3 NEW screens nutrition + routing + store + tests
**Estimated new tests:** +20-40

---

## §0 Bugatti checklist pre-flight

- [ ] Phase 4 prior tasks LANDED
- [ ] Branch HEAD verde 4072+ PASS
- [ ] Backup tag `pre-phase4-task-20-2026-05-XX` push origin
- [ ] **WORDING CEO scope STRICT:** LOCK 11 pre-Beta = ALL user-facing RO copy mockup verbatim. Placeholder + flag §6 dacă mockup absent. CC NU compose autonomous.

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `04-architecture/mockups/andura-clasic.html` grep:
   - Nutrition section markup (likely `#nutritie` sau `#alimentatie`)
   - Form fields verbatim (meal types, foods, quantities)
   - RO copy all labels + buttons + headings
   - Sub-tab placement (Progres? Standalone?) — CC verify mockup structure
3. `DECISIONS.md` LOCK 11 references (UI nutrition logging port)
4. `src/react/stores/` — existing data persistence patterns
5. `src/react/lib/navigation.ts` — gotoPath additions

---

## §2 Spec exact

### A) Routing + tab placement

CC verify mockup structure. Likely options:
- Sub-route Progres tab: `/progres/nutritie` (consistent task_16 Progres tab pattern)
- Standalone tab if 5-tab BottomNav (mockup decide)

Phase 4 MVP: sub-route Progres tab `/progres/nutritie` default unless mockup contrary.

### B) `LogMeal.tsx` NEW screen

Meal log entry form:
- Meal type select (breakfast/lunch/dinner/snack — mockup verbatim RO labels)
- Foods list input (text + qty + unit)
- Optional total kcal estimate field
- Date + time
- Submit + Cancel

### C) `NutritionToday.tsx` NEW screen (optional Phase 4)

Today's logged meals summary view:
- Group by meal type
- Total kcal sum
- Edit/delete actions per entry

Phase 4 MVP: LogMeal only. NutritionToday Phase 5 defer dacă scope tight.

### D) `nutritionStore.ts` NEW SAU userDataStore augment

State:
```typescript
mealLog: {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: string;  // freeform or array
  qty?: number;
  unit?: string;
  kcalEstimate?: number;
  dateISO: string;
  timestamp: number;
}[]
```

Actions: addMealEntry, deleteMealEntry, persist localStorage.

---

## §3 Implementation hints

- **WORDING DISCIPLINE LOCK 11:** strict. CC mockup verbatim. Placeholder + flag dacă absent. NU compose meal type labels autonomous ("Mic dejun" / "Pranz" / "Cina" / "Gustare").
- **Karpathy §4 simplicity:** freeform text foods input Phase 4 MVP. ZERO food database lookup, ZERO macro auto-calc, ZERO photo recognition (Phase 5+ enhancements explicit).
- **Mockup parity verbatim:** field types + order + button labels + section grouping = match mockup wv2.
- **Romanian no-diacritics rule.**

---

## §4 Tests vitest + RTL

```typescript
describe('LogMeal screen', () => {
  it('renders form fields verbatim mockup', () => { /* ... */ });
  it('meal type select 4 options (mockup verbatim)', () => { /* ... */ });
  it('submit valid persists nutritionStore entry', () => { /* ... */ });
  it('submit invalid (empty foods) blocks + error', () => { /* ... */ });
  it('cancel navigates back progres', () => { /* ... */ });
  // +10-20 more (validation, persistence, edge cases)
});

describe('nutritionStore', () => {
  it('addMealEntry persists localStorage', () => { /* ... */ });
  it('deleteMealEntry removes by id', () => { /* ... */ });
  // +3-5 more
});
```

---

## §5 Acceptance criteria

- [ ] `LogMeal.tsx` NEW screen
- [ ] (optional) `NutritionToday.tsx` NEW screen
- [ ] `nutritionStore.ts` NEW SAU userDataStore augment
- [ ] Routing add `/progres/nutritie` sau echivalent
- [ ] Mockup verbatim RO copy all fields + buttons
- [ ] localStorage persistence
- [ ] +20-40 tests PASS
- [ ] 4072+ PASS aggregate preserved
- [ ] TS strict delta zero
- [ ] Romanian no-diacritics
- [ ] WORDING BACKLOG §6 dacă placeholders used

---

## §6 Commit strategy

3-5 commits atomic:
1. `feat(react/store): nutritionStore mealLog persist localStorage`
2. `feat(react/progres): LogMeal screen form + submit + validation`
3. (optional) `feat(react/progres): NutritionToday today's meals summary view`
4. `feat(react/routes): nutritie sub-route Progres tab wire`
5. (optional) `test(react/progres): nutrition logging + store coverage`

---

## §7 Backup tag

```bash
git tag pre-phase4-task-20-2026-05-XX
git push origin pre-phase4-task-20-2026-05-XX
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope + §6 WORDING BACKLOG section EXPLICIT (LOCK 11 pre-Beta sensitive).

---

🦫 **task_20 Nutrition Logging Port LOCK 11 pre-Beta sensitive. WORDING DISCIPLINE STRICT mockup verbatim. Phase 4 MVP = freeform text foods input + meal type select + persist. ZERO food DB / macro calc / photo recognition (Phase 5+ enhancements). Sub-route Progres tab consistent task_16 pattern. Foundation tracking nutrition Persona Gigel daily simple workflow.**
