# TASK 11 — Tech Debt Cleanup (TS errors + persona drift)

**Model:** Opus EXCLUSIVELY
**Phase:** 4 (paralel cu task_10 — files disjoint, safe paralel single-terminal)
**Depends on:** Phase 3 LANDED milestone
**Estimated touched files:** 4-5 (engineWrappers.ts + test + coachStore + appStore + mockup CSS reference check)
**Estimated new tests:** +5-10 (regression cover post-fix)

---

## §0 Bugatti checklist pre-flight

- [ ] Phase 3 milestone tag verified
- [ ] Branch HEAD verde 4048 PASS
- [ ] Backup tag `pre-phase4-task-11-2026-05-XX` push origin

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `📥_inbox/_CONSUMED/phase-3-tasks/task_04_antrenor_home.md` §4 — persona drift flag origin
3. `📥_inbox/_CONSUMED/phase-3-tasks/task_02_stores.md` — coachStore persona field type
4. Run `npx tsc --noEmit` initial → catalog cele 8 errors verbatim
5. `04-architecture/mockups/andura-clasic.html` grep `persona-gigica` vs `persona-gigel` (mockup uses `gigica` legacy line 371)

---

## §2 Spec exact

### A) Fix 8 pre-existing TS errors

Carry-forward task_04-09 flagged "8 pre-existing engineWrappers errors preserved zero new". Phase 4 dedicated fix:

Suspected sources (verify cu `tsc --noEmit`):
- `src/react/lib/engineWrappers.ts` — FatigueOutput shape mismatch (interface vs implementation)
- `src/react/lib/engineWrappers.ts` — undefined branches uncovered (strict null checks)
- `src/react/__tests__/lib/engineWrappers.test.ts` — unused @ts-expect-error directive (no error to suppress)

Fix strategy:
- FatigueOutput: align interface cu real engine output; OR cast at boundary cu validation
- Undefined branches: add fallback values OR narrow types upstream
- @ts-expect-error: remove unused; add comment explaining if kept for future

### B) Persona drift bridge decision

Conflict:
- `coachStore.persona: 'gigel' | 'maria' | 'marius'` (data layer)
- Mockup `andura-clasic.html:371` `<body class="persona-gigica">` (CSS layer)
- Antrenor.tsx applies `persona-${persona}` → produces `.persona-gigel` (mismatch cu mockup CSS rules `.persona-gigica`)

3 opțiuni:
1. **CSS bridge:** Antrenor wrapper apply both classes `persona-${persona} persona-${persona}ica` ugly hack
2. **Data migrate:** coachStore.persona keys change `'gigel' → 'gigica'` (breaking change cross-codebase)
3. **CSS rename mockup:** mockup `.persona-gigica` → `.persona-gigel` (mockup updates, consumer code unchanged)

Recomandare CC decizie tactical: **Opțiunea 3** — mockup CSS rename `.persona-gigica` → `.persona-gigel`. Reasons:
- coachStore data layer e canonical post-Phase 3 (4048 PASS)
- mockup = reference design, NU live production
- Rename single occurrence (line 371) + any internal CSS rule referencing `.persona-gigica`
- Aligns mockup terminology cu PRIMER §1 personas official

### C) `LastSessionSummary` numeric fields (carry-forward task_09 §4)

**Cross-ref task_10 §2 D** — same refactor. Could land either task_10 OR task_11. Prefer task_10 (engine-adjacent), but task_11 candidate dacă blast radius smaller pe pure tech debt branch.

---

## §3 Implementation hints

- TS fixes = NU touch behavior, doar types. Tests must pass identical post-fix.
- Persona rename mockup: verify ALL CSS rules referencing `.persona-gigica` (not just body class)
- Run full test suite post-each-fix să confirm zero regression
- 4048 PASS baseline must maintain (zero failure introduced)

---

## §4 Tests vitest + RTL

Regression cover post-fix:
- `engineWrappers.test.ts` rehabilitated tests cover branches fixed (~5 tests)
- `Antrenor.test.tsx` persona-aware test updated daca rename impact CSS class assertions (~2-3 tests)

---

## §5 Acceptance criteria

- [ ] `npx tsc --noEmit` returns ZERO errors (down from 8)
- [ ] All 4048+ tests PASS post-fix (zero regression)
- [ ] Persona drift resolved (decision LOCKED cu rationale)
- [ ] Mockup CSS `.persona-gigica` → `.persona-gigel` (if Opțiunea 3 chosen)
- [ ] vitest delta +5-10 tests regression cover

---

## §6 Commit strategy

2-3 commits atomic:
1. `fix(react/lib): engineWrappers TS strict compile clean (FatigueOutput + null branches + unused @ts-expect-error)`
2. `refactor(mockup): persona CSS rename gigica → gigel align coachStore taxonomy`
3. `test(react): regression cover engineWrappers + Antrenor persona post-rename` (optional dacă tests deja green)

---

## §7 Backup tag

```bash
git tag pre-phase4-task-11-2026-05-XX
git push origin pre-phase4-task-11-2026-05-XX
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope.

---

🦫 **task_11 Phase 4 tech debt cleanup. 8 TS errors eliminated + persona drift LOCKED. Paralel safe cu task_10 (files disjoint engineWrappers vs Workout/Preview/PostRpe consumers). Foundation curat pentru Phase 4 task_12+ UI extraction + LOCK 9 safety.**
