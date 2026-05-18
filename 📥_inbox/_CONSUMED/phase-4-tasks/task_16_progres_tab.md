# TASK 16 — Progres Tab Phase 4-5 (log-weight + body-data Tab 2 of 4)

**Model:** Opus EXCLUSIVELY
**Phase:** 4-5 boundary (NEW tab + 2 sub-screens)
**Depends on:** task_12 LANDED (Antrenor stable)
**Estimated touched files:** 2 NEW screen files + routing modify + BottomNav state + 2 NEW test files + workoutStore augment (if needed)
**Estimated new tests:** +25-50

---

## §0 Bugatti checklist pre-flight

- [ ] Phase 4 prior tasks LANDED 4072+ PASS baseline
- [ ] Branch HEAD verde
- [ ] Backup tag `pre-phase4-task-16-2026-05-XX` push origin
- [ ] **WORDING CEO scope:** screens RO copy = mockup verbatim. NU compose autonomous user-facing text. Placeholder + flag dacă mockup absent §6.

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `04-architecture/mockups/andura-clasic.html` grep:
   - `id="progres"` tab section + `progresRender()` function
   - `id="log-weight"` screen + form fields + submit pattern
   - `id="body-data"` screen + measurements fields
   - `BottomNav` second tab activation + state
   - RO copy verbatim all text (labels, buttons, headings)
3. `src/react/routes/index.tsx` SAU `src/react/routes/router.tsx` — current routing structure
4. `src/react/components/BottomNav.tsx` — current 4-tab definition (Antrenor active, Progres/Istoric/Cont stubs)
5. `src/react/stores/` — existing stores list (need progresStore? body-data store? or persist via existing pattern)
6. `src/react/lib/navigation.ts` — gotoPath helper paths

---

## §2 Spec exact

### A) `src/react/routes/screens/progres/LogWeight.tsx` NEW screen

Daily weight log entry screen — Tab Progres sub-route `/progres/log-weight`.

Fields per mockup verbatim:
- Weight input (kg, decimal, validation 30-300 range)
- Date picker (default today)
- Optional note textarea
- Submit button + Cancel/Back

Submit action: persist weight entry → localStorage Phase 4 SAU progresStore Phase 5 (CC decide based on existing infra).

### B) `src/react/routes/screens/progres/BodyData.tsx` NEW screen

Body measurements entry screen — Tab Progres sub-route `/progres/body-data`.

Fields per mockup verbatim (CC grep exact list):
- Likely: waist, chest, hips, biceps, thigh measurements (cm)
- Optional photo upload? — CC verify mockup
- Date picker
- Submit + Cancel

### C) Routing modify

Add routes:
- `/progres` → Progres tab landing (overview or redirect la log-weight default)
- `/progres/log-weight` → LogWeight screen
- `/progres/body-data` → BodyData screen

### D) BottomNav second tab activate

Current BottomNav likely has Progres tab stub (per Phase 3 task_03 4-tab layout). Activate navigation: tap Progres → navigate `/progres`.

### E) Optional store augment

`progresStore.ts` NEW pentru weight entries + body data entries:
- `weightLog: { kg, date, note? }[]`
- `bodyData: { date, measurements: { waist?, chest?, ... } }[]`
- Actions: addWeightEntry, addBodyDataEntry
- Persist localStorage Phase 4 simple pattern

DACĂ infra existing covers (e.g. unified userDataStore) → reuse. CC decide smallest blast radius.

---

## §3 Implementation hints

- **Karpathy §4 simplicity:** Phase 4 MVP version = simple form + persist + list view. ZERO advanced charts/visualizations (Phase 5+ adăugare).
- **Mockup parity LOCKED V1:** styling + copy + layout match mockup wv2 verbatim. CC grep mockup html secțiuni `#progres` + `#log-weight` + `#body-data`.
- **WORDING DISCIPLINE:** CEO scope. CC preserve mockup RO verbatim. Placeholder + flag §6 dacă mockup absent pentru anumite fields.
- **Romanian no-diacritics rule** all UI text.
- **D020 test paradigm:** MemoryRouter + store reset beforeEach. Integration tests per screen.
- **Tab 2 of 4 invariant:** Antrenor Tab 1 (LANDED Phase 3) + Progres Tab 2 (THIS task) + Istoric Tab 3 (future Phase 5) + Cont Tab 4 (future Phase 6).
- **NU compose visualizations:** simple list/form Phase 4. Charts/graphs Phase 5+ explicit task.

---

## §4 Tests vitest + RTL (D020 MemoryRouter)

```typescript
// src/react/__tests__/screens/progres/LogWeight.test.tsx (~12-20 tests)
describe('LogWeight screen', () => {
  it('renders form fields verbatim mockup', () => { /* ... */ });
  it('weight input accepts decimal', () => { /* ... */ });
  it('date defaults today', () => { /* ... */ });
  it('submit valid persists entry', () => { /* ... */ });
  it('submit invalid (out of range) blocks + error', () => { /* ... */ });
  it('cancel navigates back progres landing', () => { /* ... */ });
  // +6-14 more (validation edges, optional note, persistence proof)
});

// src/react/__tests__/screens/progres/BodyData.test.tsx (~10-20 tests)
describe('BodyData screen', () => {
  it('renders all measurement fields per mockup', () => { /* ... */ });
  it('partial entry valid (NU all fields required)', () => { /* ... */ });
  it('submit persists entry', () => { /* ... */ });
  // ... +7-17 more
});

// src/react/__tests__/components/BottomNav.test.tsx augment (~3-5 tests)
describe('BottomNav Progres tab', () => {
  it('Progres tap navigates /progres', () => { /* ... */ });
  it('Progres active state pe /progres routes', () => { /* ... */ });
});
```

---

## §5 Acceptance criteria

- [ ] `LogWeight.tsx` NEW screen `/progres/log-weight`
- [ ] `BodyData.tsx` NEW screen `/progres/body-data`
- [ ] Routing add 3 paths (`/progres`, `/progres/log-weight`, `/progres/body-data`)
- [ ] BottomNav Progres tab activate navigate
- [ ] Persistence wire (localStorage simple sau progresStore NEW)
- [ ] +25-50 tests PASS
- [ ] 4072+ PASS aggregate preserved
- [ ] TS strict delta zero
- [ ] Mockup verbatim RO copy + styling parity
- [ ] Romanian no-diacritics rule

---

## §6 Commit strategy

4-6 commits atomic:
1. (optional) `feat(react/store): progresStore weight + body data persist localStorage`
2. `feat(react/progres): LogWeight screen form + submit + validation`
3. `feat(react/progres): BodyData screen measurements form`
4. `feat(react/routes): Progres tab routing 3-path wire`
5. `feat(react/components): BottomNav Progres tab activate`
6. `test(react/progres): LogWeight + BodyData integration coverage`

---

## §7 Backup tag

```bash
git tag pre-phase4-task-16-2026-05-XX
git push origin pre-phase4-task-16-2026-05-XX
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope + §6 WORDING BACKLOG section explicit dacă placeholder used (Daniel CEO review pre-Beta gate).

---

🦫 **task_16 Progres Tab Phase 4-5 boundary. Tab 2 of 4 (Antrenor LANDED + Progres THIS + Istoric Phase 5 + Cont Phase 6). 2 NEW screens minimum viabile (LogWeight + BodyData) per mockup wv2 verbatim. Karpathy §4 simplicity — form + persist + list, ZERO Phase 4 charts/viz. WORDING CEO scope = mockup verbatim sau placeholder. Foundation tab expansion strategy Phase 5+ feature wire (charts, trends, photo timeline).**
