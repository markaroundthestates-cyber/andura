# TASK 21 — Istoric Tab Phase 5 (Tab 3 of 4)

**Model:** Opus EXCLUSIVELY
**Phase:** 5 (Tab 3 of 4)
**Depends on:** task_12 LANDED + task_17 prefer (engine wire stable)
**Estimated touched files:** 2-3 NEW screens Istoric + routing + BottomNav state + tests
**Estimated new tests:** +15-30

---

## §0 Bugatti checklist pre-flight

- [ ] Phase 4 prior tasks LANDED
- [ ] Branch HEAD verde 4072+ PASS
- [ ] Backup tag `pre-phase4-task-21-2026-05-XX` push origin
- [ ] **WORDING CEO scope:** screens RO copy mockup verbatim. Placeholder + flag §6 dacă absent.

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `04-architecture/mockups/andura-clasic.html` grep:
   - `id="istoric"` tab section + screens
   - Session history list markup verbatim
   - Session detail screen markup
   - RO copy all labels + headings + button text
3. `src/react/components/BottomNav.tsx` — Istoric tab stub current state
4. `src/react/stores/workoutStore.ts` — pastSessions storage location
5. `src/react/lib/navigation.ts` — gotoPath additions

---

## §2 Spec exact

### A) `IstoricList.tsx` NEW screen

Past sessions list view — `/istoric` landing:
- Reverse chrono list (newest first)
- Per session card: date + duration + exercise count + summary line (e.g. "Push · 5 exercitii · 45 min")
- Tap session → navigate `/istoric/:sessionId` detail
- Empty state mockup verbatim ("Nu ai antrenamente inca")

### B) `IstoricDetail.tsx` NEW screen

Session detail view — `/istoric/:sessionId`:
- Header: date + duration + workout name/type
- Per exercise: name + sets logged (kg × reps + rating per set)
- Total volume calculated (sum kg*reps all sets)
- PR markers (if applicable, link la task_18 markPRHit data)
- Back button → IstoricList

### C) Routing add

- `/istoric` → IstoricList
- `/istoric/:sessionId` → IstoricDetail

### D) BottomNav third tab activate

Istoric tap → navigate `/istoric`.

### E) Session persistence verify

workoutStore.history currently in-memory? Need persist localStorage for past sessions browse. CC verify existing infra:
- DACĂ already persisted → reuse
- ELSE add persist in workoutStore (Phase 4 task_12 may have addressed?)

---

## §3 Implementation hints

- **Karpathy §4 simplicity:** Phase 5 MVP = list + detail views. ZERO charts/graphs/trends/filters (Phase 6+ enhancements explicit).
- **Mockup parity verbatim:** styling + copy + layout match mockup wv2.
- **Romanian no-diacritics.**
- **D020 test paradigm:** MemoryRouter + store reset beforeEach. Mock session history seed.

---

## §4 Tests vitest + RTL

```typescript
describe('IstoricList screen', () => {
  it('renders empty state cand zero sessions', () => { /* ... */ });
  it('renders session cards reverse chrono', () => { /* ... */ });
  it('session card summary line format', () => { /* ... */ });
  it('tap session navigates detail', () => { /* ... */ });
  // +5-10 more
});

describe('IstoricDetail screen', () => {
  it('renders session header + per exercise data', () => { /* ... */ });
  it('total volume calculation correct', () => { /* ... */ });
  it('back navigates IstoricList', () => { /* ... */ });
  it('invalid sessionId 404 sau redirect', () => { /* ... */ });
  // +4-10 more
});

describe('BottomNav Istoric tab', () => {
  it('Istoric tap navigates /istoric', () => { /* ... */ });
  it('Istoric active state pe /istoric routes', () => { /* ... */ });
});
```

---

## §5 Acceptance criteria

- [ ] `IstoricList.tsx` NEW screen
- [ ] `IstoricDetail.tsx` NEW screen
- [ ] Routing add 2 paths (`/istoric`, `/istoric/:sessionId`)
- [ ] BottomNav Istoric tab activate navigate
- [ ] Persistence verified (localStorage past sessions)
- [ ] Empty state + populated state both render
- [ ] +15-30 tests PASS
- [ ] 4072+ PASS aggregate preserved
- [ ] TS strict delta zero
- [ ] Mockup verbatim RO copy
- [ ] Romanian no-diacritics

---

## §6 Commit strategy

3-5 commits atomic:
1. (optional) `feat(react/store): workoutStore pastSessions persist localStorage`
2. `feat(react/istoric): IstoricList past sessions reverse chrono list`
3. `feat(react/istoric): IstoricDetail session breakdown view`
4. `feat(react/routes): Istoric tab routing 2-path wire`
5. `feat(react/components): BottomNav Istoric tab activate`

---

## §7 Backup tag

```bash
git tag pre-phase4-task-21-2026-05-XX
git push origin pre-phase4-task-21-2026-05-XX
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope + §6 WORDING BACKLOG dacă placeholders.

---

🦫 **task_21 Istoric Tab Phase 5 Tab 3 of 4. Past sessions browse + detail breakdown. Phase 5 MVP list + detail only (ZERO charts/trends Phase 6+). Foundation tab activation Phase 5 milestone. Persona Gigel session retrospective + Persona Marius perf tracking + Persona Maria 65 reassurance vedere progres.**
