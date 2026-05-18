# PROMPT_CC — Phase 5 ORCHESTRATOR Continuous Autonomous Batch 20 tasks

**Date:** 2026-05-17
**Model:** Opus EXCLUSIVELY (hardcoded — Sonnet concediat permanent D-LEGACY-* metoda hibridă)
**Branch:** `feature/v3-react-clasic`
**Workdir:** `C:\Users\Daniel\Documents\salafull`
**Trigger:** Daniel paste acest fișier în CC terminal `claude --dangerously-skip-permissions`
**Policy:** SEQUENTIAL fail-stop, atomic per-task commits, backup tag per-task push origin, vitest verde mandatory pre-commit, ZERO `--no-verify`.

---

## §0 Run order (20 task)

Execute IN ORDER. Fail-stop pe primul fail. Citește acel task sketch + execute + commit + push tag + scrie raport intermediat în `📤_outbox/_archive/2026-05/NN_TASK_<id>.md` (NU LATEST.md până batch close). La task closure: write FINAL `📤_outbox/LATEST.md` raport agregat §0-§N (pattern Phase 4 batch precedent).

### Cap-coadă pre-Beta (4)
1. `task_01_calendar_edit_color.md` — Calendar7Day edit-mode color `#d4e6cb` per wiki spec V1 + test update
2. `task_02_wording_sweep.md` — Sweep batch 22 placeholdere RO autonomous compose (D024 NEW pre-Beta wording autonomous OK)
3. `task_03_sessions_history_persist.md` — sessionsHistory persist real + IstoricDetail per-exercise breakdown wire
4. `task_04_typescript_strict_pass2.md` — Cleanup `any` casts + tighter types pass-2

### Phase 5 Engine pipeline real wire (8)
5. `task_05_schedule_adapter_aggregate.md` — scheduleAdapter aggregate `getDailyWorkout` engine export
6. `task_06_coach_director_wire.md` — Coach Director orchestrator real wire React (replace PHASE_4_DEMO_PUSH)
7. `task_07_bayesian_nutrition_real.md` — Bayesian Nutrition Inference real wire (replace 2640/180 stubs)
8. `task_08_engine_2_calendar_dispatch.md` — Engine #2 Goal Adaptation Calendar silent dispatch wire saveWeekly
9. `task_09_aafriction_dynamic_thresholds.md` — aaFriction Vitality/Adherence-driven thresholds
10. `task_10_compose_pipeline_adherence_energy_vitality.md` — Adherence + Energy + Vitality compose integrate
11. `task_11_pr_streak_engines_wire.md` — PR Engine + Streak Counter wire Istoric + Progres real
12. `task_12_dexie_persistence_unified.md` — IndexedDB Dexie React unified persistence migration

### Phase 6 Cont Tab + foundations (6)
13. `task_13_cont_tab_landing_subs.md` — Cont Tab 4 landing + 9 sub-screens mockup parity
14. `task_14_onboarding_t0_big6.md` — Onboarding T0 Big 6 React port (screen-onb-1..7)
15. `task_15_splash_landing.md` — Splash + landing React port (mockup #screen-splash)
16. `task_16_auth_magic_link.md` — Auth Magic Link React port (reuse Firebase logic)
17. `task_17_tc_medical_disclaimer_modals.md` — T&C + Medical Disclaimer Modal React port (LOCK 4)
18. `task_18_settings_persist_theme.md` — Settings persist real + theme toggle dark/light

### Polish pre-Beta (2)
19. `task_19_error_boundaries_loading.md` — Error boundaries per route + loading skeletons + Suspense lazy
20. `task_20_lighthouse_bundle_pwa.md` — Lighthouse audit + bundle size optimization + PWA manifest icons

---

## §1 Pre-flight checks (per-task mandatory)

ÎNAINTE de orice mutație:
1. `git status` clean (modulo `.smart-env/` cache noise OK)
2. `git fetch origin` + `git pull --ff-only origin feature/v3-react-clasic`
3. `npm test` (vitest) verde pe HEAD curent — baseline noted în raport §2
4. `npm run typecheck` (`tsc --noEmit`) — 0 errors baseline
5. Read sketch task complet §0-§6
6. Grep evidence inline per §AR.21 (file/function references verbatim verify)
7. Backup tag `pre-phase5-task-NN-2026-05-17` push origin pre-execute

## §2 Atomic commit discipline (Karpathy §3 surgical)

- 1 task = 1 commit cumulative SAU multiple atomic single-concern commits IF spec §B explicit multi-block (e.g. lib + component + integrate = 3 commits)
- NEVER `git add -A` (`.smart-env/` cache + temp files noise) — explicit `git add <file>` per file modified
- Commit message format: `feat(react/<area>): <subject>` sau `fix(react/<area>): ...` sau `refactor(...)`
- Pre-commit hook MUST be verde (vitest + typecheck) — ZERO `--no-verify` bypass
- Post-commit: `git push origin feature/v3-react-clasic`

## §3 Tests preserve invariant

- Vitest local PASS count crește per task (NU scade) — baseline 4209 PASS @ `f3cb7dc`
- TS strict 0 errors invariant
- Test files: 213 PASS @ baseline — growth OK, regression NOT ok
- Daca task introduce side-effect testing pattern: prefer pure-function helpers extracted + tested separate vs React Testing Library full mount

## §4 Wording autonomy LOCK NEW

**D024 LOCKED V1 (2026-05-17):** Pre-Beta UI wording RO Co-CTO autonomous compose OK. Daniel verifică post-Beta la review a-z. NU surface options Daniel mid-build pentru wording. NU placeholder `_TBD` markers — compose final text inline.

Constraint invariant: ZERO diacritice UI/tests (NO_DIACRITICS_RULE D-LEGACY-064 LOCK V1 PERMANENT). Anti-paternalism ABSOLUTE D-LEGACY-061 (engine = generic invariant, NU user-specific hard-coded). Mockup `andura-clasic.html` verbatim copy preferat când disponibil; autonomous compose când absent.

## §5 Failure recovery

Pe fail (test red SAU typecheck error SAU pre-commit reject):
1. STOP batch — NU continua task urmatorul
2. `git reset --hard <backup-tag>` rollback la pre-task state clean
3. Write raport `📤_outbox/LATEST.md` cu §"Issue" detaliat (file+line+error+attempted-fix)
4. Daniel intervine fresh chat → analyze + decide

NU partial commits, NU `--no-verify` bypass, NU skip teste. Bugatti craft strict.

## §6 Raport final batch close

Post task_20 LANDED (sau fail-stop mid-batch):
1. Aggregate raport `📤_outbox/LATEST.md` cu §0-§N (model Phase 4 batch precedent):
   - §0 Orchestrator policy compliance checklist
   - §1 Commits aggregate table (SHA + task + subject)
   - §2 Tests aggregate (baseline → final + delta + test files count + TS errors)
   - §3 Modificări aggregate (NEW files + modified files cumulative)
   - §4 Issues per-task observations
   - §5 Acceptance criteria per task ✓
   - §6 Wording autonomous-composed inline (NU backlog placeholders)
   - §7 Backup tags pushed origin per-task
   - §8 Phase 6/7 carry-forward explicit + Bugatti audit nuclear pre-Launch gate path
2. Archive `📥_inbox/phase-5-tasks/` → `📥_inbox/_CONSUMED/phase-5-tasks/` (git mv preserve history)
3. DECISIONS.md append D025 STRATEGY "Phase 5 BATCH 20 task LANDED" + frontmatter update
4. Milestone tag `phase-5-batch-landed-2026-05-XX` push origin

---

## §7 Hard constraints invariant

- ZERO `src/engine/*` mutation per ADR 026 §9 pure-function paradigm (engineWrappers React-side adapters only)
- ZERO breaking change additive schema (preserve `localStorage` keys + IndexedDB Dexie unified migration via task_12 additive layer NU destructive)
- ZERO mockup `andura-clasic.html` mutation (DESIGN MASTER source-of-truth read-only)
- ZERO Tier 0 storage paradigm breaking change (`wv2-*` localStorage keys preserved invariant)
- ZERO `.smart-env/` files commits
- NO_DIACRITICS_RULE UI/tests/mockups strict (D-LEGACY-064 LOCK V1 PERMANENT)
- Anti-paternalism ABSOLUTE engine generic invariant (D-LEGACY-061)
- Mobile-first responsive (max-width: 380px target Maria 65 + Marius mid-range Android)

---

## §8 Context cumulative

- HEAD baseline: `f3cb7dc` @ `feature/v3-react-clasic` (Phase 4 batch handover commit)
- Tests: 4209 PASS / 213 test files / TS 0 errors
- DECISIONS.md latest_entry: D023 (2026-05-17 MCP filesystem Windows emoji)
- Mockup DESIGN MASTER: `04-architecture/mockups/andura-clasic.html` (4753 LOC, verbatim source)
- React structure: `src/react/{components,lib,routes,stores,__tests__}`
- Backend reusable: `src/engine/*` + `src/auth/*` + `src/schema/*` + `src/storage/*` + `src/ui/*` (vanilla legacy + React shared layer)

---

🦫 **Bugatti craft. Sequential autonomous fail-stop. Karpathy §3 surgical per-task. Phase 5 batch 20 task continuous = backlog cap-coadă + engine real wire + Phase 6 foundations + polish. Daniel zero touch pre-Beta a-z review per D-LEGACY-079 Co-CTO autonomy LOCK V1 PERMANENT.**
