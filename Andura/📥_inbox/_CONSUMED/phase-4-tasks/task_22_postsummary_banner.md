# TASK 22 — PostSummary F11 Banner Extension

**Model:** Opus EXCLUSIVELY
**Phase:** 4 enhancement
**Depends on:** task_10 LANDED (markPRHit propagation Workout→PostSummary) + task_18 prefer (enriched delta object)
**Estimated touched files:** PostSummary.tsx modify + tests augment
**Estimated new tests:** +6-12

---

## §0 Bugatti checklist pre-flight

- [ ] Phase 4 prior tasks LANDED
- [ ] Branch HEAD verde 4072+ PASS
- [ ] Backup tag `pre-phase4-task-22-2026-05-XX` push origin
- [ ] **WORDING CEO scope:** banner copy enhancements = mockup verbatim sau placeholder + flag §6

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `src/react/routes/screens/antrenor/PostSummary.tsx` — current banner Trophy + exercise + deltaKg
3. `src/react/stores/workoutStore.ts` — prData state shape (post task_18 if landed: deltaPct, oneRMEstimate, type)
4. `04-architecture/mockups/andura-clasic.html` grep PostSummary banner markup + RO copy verbatim
5. `📤_outbox/_archive/2026-05/*task_10*.md` — task_10 LANDED banner baseline

---

## §2 Spec exact

### A) PostSummary banner enrichment

Current: Trophy lucide + exercise name + deltaKg.

Phase 4 enhance:
- Display PR type label: "PR greutate" / "PR volum" / "PR repetari" (mockup verbatim)
- Display deltaPct: e.g. "+5%" alongside deltaKg
- Display oneRMEstimate: e.g. "1RM estimat: 75kg"
- Multiple PR types same session: stack banners SAU single banner cu list (mockup decide)

### B) Empty PR session behavior

Cand zero PR hits: banner hidden (current task_10 behavior) — preserve. NU show "no PR" message.

### C) Animation enhance (optional)

Subtle entrance animation banner (CSS transition fade-in 200ms). Phase 4 nice-to-have, optional.

---

## §3 Implementation hints

- **Karpathy §3 surgical:** PostSummary.tsx modify banner section only. ZERO touch other PostSummary content (workout summary, navigation, etc.).
- **WORDING DISCIPLINE:** mockup verbatim labels. Placeholder + flag §6 dacă absent.
- **Backward compat task_10:** PR data minimum (exercise + deltaKg + type) still display correctly dacă task_18 not yet landed. Optional new fields graceful fallback.
- **Romanian no-diacritics rule.**
- **Tests preserve:** existing PostSummary.test.tsx baseline must stay green.

---

## §4 Tests vitest + RTL

```typescript
describe('PostSummary banner enrichment', () => {
  it('renders PR type label per mockup verbatim', () => { /* ... */ });
  it('renders deltaPct alongside deltaKg', () => { /* ... */ });
  it('renders oneRMEstimate cand available', () => { /* ... */ });
  it('multiple PR types stack/list per mockup', () => { /* ... */ });
  it('NU render cand zero PR hits', () => { /* ... */ });
  it('backward compat task_10 minimum data display', () => { /* ... */ });
  // +0-6 more
});
```

---

## §5 Acceptance criteria

- [ ] Banner displays PR type label
- [ ] Banner displays deltaPct
- [ ] Banner displays oneRMEstimate cand available
- [ ] Multiple PR types handling per mockup
- [ ] Empty PR session banner hidden
- [ ] Backward compat existing PostSummary tests preserve
- [ ] +6-12 tests PASS
- [ ] 4072+ PASS aggregate preserved
- [ ] TS strict delta zero
- [ ] Mockup verbatim RO copy
- [ ] Romanian no-diacritics

---

## §6 Commit strategy

1-2 commits atomic:
1. `feat(react/antrenor): PostSummary banner enrichment PR type + deltaPct + 1RM display`
2. (optional) `test(react/antrenor): PostSummary banner enrichment coverage`

---

## §7 Backup tag

```bash
git tag pre-phase4-task-22-2026-05-XX
git push origin pre-phase4-task-22-2026-05-XX
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope + §6 WORDING BACKLOG dacă placeholders.

---

🦫 **task_22 PostSummary F11 banner extension. PR type label + deltaPct + 1RM estimate display. Multiple PR types handling. Mockup verbatim copy. Backward compat task_10 minimum data. Phase 4 enhancement post task_18 enriched delta object. Bugatti craft — small surgical enhancement visible user-facing post-session reward signal.**
