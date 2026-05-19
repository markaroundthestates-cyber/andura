---
title: ORCHESTRATOR_PHASE_2_ROUTING_SKELETON_2026-05-16.md
type: cc-autonomous-orchestrator
model: Opus EXCLUSIVELY
phase: Phase 2 Routing Skeleton — React Andura Clasic build
authority: DECISIONS.md §D015 STRAT PIVOT + §D016 PROC + Co-CTO LOCK 2026-05-16 chat (routing C hybrid + scope slice mic)
mode: sequential 1→N fail-stop
depends-on: Phase 1 Foundation LANDED (3750 PASS baseline, branch feature/v3-react-clasic, src/react/ structure ready)
created: 2026-05-16
---

# ORCHESTRATOR — Phase 2 Routing Skeleton React Andura Clasic

**Model: Opus EXCLUSIVELY.** Bugatti craft invariante (vezi Phase 1 ORCHESTRATOR §"Bugatti standards" + §"Fail-stop rules" — same regime apply, NU repeat aici).

## Scope LOCK 2026-05-16 (Co-CTO autonomous tactical)

- **Routing strategy = C hybrid**: top-level routes `/` (Splash), `/auth`, `/onboarding/:step`, `/confirm-*` (destructive modals) — NU bottom nav vizibil. Nested routes `/app/{antrenor,progres,istoric,cont}/*` — bottom nav persistent + active tab derivat din path prefix.
- **Phase 2 = slice mic**: routing skeleton + Layout `<Outlet />` + BottomNav 4 taburi LOCKED V1 + 4 placeholder tab screens (`<h1>Antrenor</h1>` etc.) + `<ProtectedRoute>` wrapper + Splash/Auth/Onboarding stubs. NU content full tabs (Phase 3+).
- **Router pattern = `createBrowserRouter`** data router modern React Router v6.28 (deja installed).
- **Convention mapping mockup `goto()`** = `goto('antrenor')` → `navigate('/app/antrenor')`; `goto('auth')` → `navigate('/auth')`; `goto('onb-1')` → `navigate('/onboarding/1')`; etc. Documented în `src/react/lib/navigation.ts` helper.
- **Auth gating** = `<ProtectedRoute>` wrapper la `/app/*` parent route, citește `useAppStore.isAuthenticated` (stub `false` Phase 2 — Phase 3+ wire real Firebase Magic Link).

## Branch

Continue pe `feature/v3-react-clasic` (Phase 1 LANDED). NU branch nou.

## Pre-flight verification (BEFORE Task 1)

```bash
git status --short                                # expect: clean (.smart-env/ drift acceptable)
git branch --show-current                         # expect: feature/v3-react-clasic
git log --oneline -3                              # expect: top 3 commits Phase 1 + LATEST raport
npm run test:run -- --silent 2>&1 | tail -10      # expect: 3750 PASS baseline
```

Dacă any check fail → STOP, raport `📤_outbox/LATEST.md` §"Pre-flight failure".

## Backup tag pre-Phase-2

```bash
git tag pre-phase-2-routing-skeleton-2026-05-16
git push origin pre-phase-2-routing-skeleton-2026-05-16
```

## Execution

Read sequential 1→N, fail-stop:

1. `📥_inbox/PHASE2_TASK_1_ROUTER_PROTECTED_NAV.md` — Zustand auth slice extension, `<ProtectedRoute>` wrapper, BottomNav 4 taburi component, navigation helper mockup `goto()` convention
2. `📥_inbox/PHASE2_TASK_2_SCREENS_LAYOUT_ROUTER.md` — Layout `<Outlet />` shell, 4 placeholder tab screens, Splash/Auth/Onboarding stubs, Router config + wire în main.tsx
3. `📥_inbox/PHASE2_TASK_3_TESTS_COMMIT_PUSH_REPORT.md` — RTL tests routing + nav + ProtectedRoute, atomic commits Bugatti, push origin, `📤_outbox/LATEST.md` raport, archive CONSUMED

## Bugatti invariante (referință Phase 1 standards)

- Pre-commit hook verde mandatory pe FIECARE commit (3750 PASS preservat + Phase 2 ~10-15 new tests cumulative)
- ZERO `--no-verify` bypass
- ZERO modificări `src/` vanilla legacy (vezi Phase 1 lista invariante)
- Surgical touch + Romanian-first NO_DIACRITICS_RULE preserved
- TypeScript strict mode (NU `any` unjustified)
- Atomic commits single-concern (~3-5 commits Phase 2)

## Final raport (post Task 3 complete)

`📤_outbox/LATEST.md` overwrite cu raport standard §0-§5 (Phase 1 paradigm format).

## Archive CONSUMED post-success

`📥_inbox/PHASE2_*.md` × 4 → `📤_outbox/_archive/2026-05/<NN+1..NN+4>_*_CONSUMED.md` (scan ultim NN counter increment).

## Restore point

Backup tag `pre-phase-2-routing-skeleton-2026-05-16` @ Phase 1 closure commit `08333ea`.

---

🦫 **Phase 2 Routing Skeleton = foundation reusable Phase 3+ tab content migrations. C hybrid routing + slice mic Bugatti craft.**
