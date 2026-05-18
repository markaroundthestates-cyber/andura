# PROMPT_CC — Phase 6 ORCHESTRATOR Continuous Autonomous Batch 24 tasks

**Date:** 2026-05-18
**Model:** Opus EXCLUSIVELY (hardcoded — Sonnet concediat permanent)
**Branch:** `feature/v3-react-clasic`
**Workdir:** `C:\Users\Daniel\Documents\salafull`
**Trigger:** Daniel paste acest fișier în CC terminal `claude --dangerously-skip-permissions`
**Policy:** SEQUENTIAL fail-stop, atomic per-task commits, backup tag per-task push origin, vitest verde mandatory pre-commit, ZERO `--no-verify`.

---

## §0 Run order (24 task)

Execute IN ORDER. Fail-stop pe primul fail. Citește acel task sketch + execute + commit + push tag + scrie raport intermediat în `📤_outbox/_archive/2026-05/NN_TASK_<id>.md` (NU LATEST.md până batch close). La task closure: write FINAL `📤_outbox/LATEST.md` raport agregat §0-§N.

### Engine pipeline real wire (8 — unlocks Phase 6 §8 LATEST top priority)

1. `task_01_schedule_adapter_get_daily_workout.md` — `scheduleAdapter.getDailyWorkout(ctx, date)` NEW backend export invoke `runPipeline` 8 adapters + sessionBuilder integrate
2. `task_02_schedule_adapter_aggregate_real_wire.md` — React `scheduleAdapterAggregate.ts` replace `PHASE_5_BASELINE_PUSH` cu `getDailyWorkout` call real
3. `task_03_engine_wrappers_bn_async.md` — `engineWrappers.ts` async `getNutritionTargetsToday` real wire `bayesianNutrition.evaluate(ctx)`
4. `task_04_bayesian_nutrition_aggregate_real.md` — React `bayesianNutritionAggregate.ts` replace `BASELINE_KCAL/PROTEIN` cu engine output
5. `task_05_engine_wrappers_coach_director_run.md` — `engineWrappers.ts` `getCoachRunOutput` wire `coachDirector.run(ctx)` real pipeline
6. `task_06_coach_director_aggregate_real.md` — React `coachDirectorAggregate.ts` replace simple bundle cu patterns banner + PR Wall + alerts
7. `task_07_aafriction_real_signals.md` — `aaFrictionDetect.deriveThresholds` wire real Vitality/Adherence din `engineSignalsAggregate`
8. `task_08_adherence_engine_real_wire.md` — Adherence Engine real wire în `engineSignalsAggregate.ts` (replace `BASELINE_ADHERENCE` 50 proxy)

### Cont Tab sub-screens (9 — mockup parity D013+D015 React Andura Clasic)

9. `task_09_cont_settings_profile.md` — `settings-profile` screen Big 6 edit (varsta + gen + obiectiv + frecventa + experienta + greutate)
10. `task_10_cont_settings_notifications.md` — `settings-notifications` (toggle on/off + frecventa daily/weekly + reminder Mon-Sun)
11. `task_11_cont_settings_subscription.md` — `settings-subscription` (Beta gratuit info + paywall placeholder post-Beta)
12. `task_12_cont_settings_appearance.md` — `settings-appearance` (theme dark/light + bottom nav style)
13. `task_13_cont_settings_prefs.md` — `settings-prefs` (units kg/lb + week start L/D + locale ro-RO fixed)
14. `task_14_cont_settings_privacy.md` — `settings-privacy` (data export consent toggle + telemetry opt-in)
15. `task_15_cont_settings_terms.md` — `settings-terms` (T&C re-display + Medical Disclaimer re-display)
16. `task_16_cont_settings_export.md` — `settings-export` (download `.json` local export user data complete)
17. `task_17_cont_settings_danger.md` — `settings-danger` (delete account + reset all data + logout)

### Polish pre-Beta (7 — closure foundation)

18. `task_18_ts_unchecked_indexed_access.md` — TS strict `noUncheckedIndexedAccess` flag enable (50 errors per-file fix granular)
19. `task_19_ts_exact_optional_property_types.md` — TS strict `exactOptionalPropertyTypes` flag enable
20. `task_20_error_boundary_layout_root.md` — `ErrorBoundary` wire `Layout` root + `Suspense` lazy code-split routes
21. `task_21_vite_plugin_pwa_service_worker.md` — `vite-plugin-pwa` service worker offline mode
22. `task_22_progres_full_dashboard.md` — `Progres` tab full dashboard (TDEE strip + fatigue strip + heat map weekly + charts)
23. `task_23_istoric_full_dashboard.md` — `Istoric` tab full timeline + PR Wall + drill-downs `IstoricDetail`
24. `task_24_decisions_d026_milestone_close.md` — `DECISIONS.md` D026 append Phase 6 STRATEGY closure + milestone tag `phase-6-batch-landed-2026-05-XX` push origin

---

## §1 Pre-flight checks (per-task mandatory)

ÎNAINTE de orice mutație:
1. `git status` clean (modulo `.smart-env/` cache noise OK)
2. `git fetch origin` + `git pull --ff-only origin feature/v3-react-clasic`
3. `npm test` (vitest) verde pe HEAD curent — baseline noted în raport §2
4. `npm run typecheck` (`tsc --noEmit`) — 0 errors baseline
5. Read sketch task complet §0-§6
6. Grep evidence inline per §AR.21 (file/function references verbatim verify)
7. Backup tag `pre-phase6-task-NN-2026-05-18` push origin pre-execute

## §2 Atomic commit discipline (Karpathy §3 surgical)

- 1 task = 1 commit cumulative SAU multiple atomic single-concern commits IF spec §B explicit multi-block
- NEVER `git add -A` — explicit `git add <file>` per file modified
- Commit message format: `feat(<area>): <subject>` sau `fix(<area>): ...` sau `refactor(...)`
- Pre-commit hook MUST be verde (vitest + typecheck) — ZERO `--no-verify` bypass
- Post-commit: `git push origin feature/v3-react-clasic`

## §3 Tests preserve invariant

- Vitest local PASS count crește per task (NU scade) — baseline 4303 PASS post task #1.A LANDED
- TS strict 0 errors invariant
- Pattern parity Phase 5 BATCH precedent

## §4 Wording autonomy LOCK D024 V1 (2026-05-17/18 reaffirmed)

Pre-Beta UI wording RO Co-CTO autonomous compose OK. Daniel verifică post-Beta la review a-z. NU surface options Daniel mid-build. NU placeholder `_TBD` markers — compose final text inline.

Constraint invariant: ZERO diacritice UI/tests (NO_DIACRITICS_RULE). Anti-paternalism ABSOLUTE. Mockup `04-architecture/mockups/andura-clasic.html` verbatim copy preferat când disponibil; autonomous compose când absent.

## §5 Failure recovery

Pe fail (test red SAU typecheck error SAU pre-commit reject):
1. STOP batch — NU continua task urmatorul
2. `git reset --hard <backup-tag>` rollback la pre-task state clean
3. Write raport `📤_outbox/LATEST.md` cu §"Issue" detaliat (file+line+error+attempted-fix)
4. Daniel intervine fresh chat → analyze + decide

NU partial commits, NU `--no-verify` bypass, NU skip teste. Bugatti craft strict.

## §6 Raport final batch close

Post task_24 LANDED (sau fail-stop mid-batch):
1. Aggregate raport `📤_outbox/LATEST.md` cu §0-§N (model Phase 5 BATCH precedent):
   - §0 Orchestrator policy compliance checklist
   - §1 Commits aggregate table (SHA + task + subject)
   - §2 Tests aggregate (baseline → final + delta + test files count + TS errors)
   - §3 Modificări aggregate (NEW files + modified files cumulative)
   - §4 Issues per-task observations
   - §5 Acceptance criteria per task ✓
   - §6 Wording autonomous-composed inline
   - §7 Backup tags pushed origin per-task
   - §8 Phase 7 carry-forward (Daniel Gates smoke production + Bugatti audit nuclear pre-Launch gate path)
2. Archive `📥_inbox/phase-6-tasks/` → `📥_inbox/_CONSUMED/phase-6-tasks/` (git mv preserve history)
3. DECISIONS.md append D026 STRATEGY "Phase 6 BATCH 24 task LANDED" + frontmatter update (handled via task_24)
4. Milestone tag `phase-6-batch-landed-2026-05-XX` push origin (handled via task_24)

---

## §7 Hard constraints invariant

- ZERO `src/engine/*` mutation per ADR 026 §9 — EXCEPȚIE acceptată pentru `src/engine/schedule/scheduleAdapter.js` task_01 (adapter UI-side per ADR 030 D2, NU engine pure-function — primary-source verified scheduleAdapter NU este engine pure, are localStorage edges)
- ZERO breaking change additive schema
- ZERO mockup `andura-clasic.html` mutation (DESIGN MASTER source-of-truth read-only)
- ZERO Tier 0 storage paradigm breaking change (`wv2-*` localStorage keys preserved invariant)
- ZERO `.smart-env/` files commits
- NO_DIACRITICS_RULE UI/tests/mockups strict (D-LEGACY-064 LOCK V1 PERMANENT)
- Anti-paternalism ABSOLUTE engine generic invariant (D-LEGACY-061)
- Mobile-first responsive (max-width: 380px target Maria 65 + Marius mid-range Android)
- D024 wording autonomous compose LOCKED V1 — toate placeholder `_TBD` markers replaced inline

---

## §8 Context cumulative

- HEAD baseline: `810c783` @ `feature/v3-react-clasic` (Phase 6 task #1.A deloadAdapter batch 8 ULTIM LANDED 2026-05-18)
- Tests: 4303 PASS / TS 0 errors / Pipeline §42.10 COMPLETE 8/8 V1 prescriptive engines wired
- DECISIONS.md latest_entry: D025 (2026-05-18 Phase 5 BATCH 20-task closure STRATEGY) — D026 appended via task_24
- Mockup DESIGN MASTER: `04-architecture/mockups/andura-clasic.html` (4437 LOC, verbatim source) — Cont sub-screens sections (`#screen-cont` + `#screen-settings-*`)
- React structure: `src/react/{components,lib,routes,screens,stores,__tests__}`
- Backend reusable: `src/engine/*` + `src/coach/orchestrator/*` (8 adapters wired + runPipeline) + `src/auth/*` + `src/schema/*` + `src/storage/*` + `src/ui/*`

---

🦫 **Phase 6 BATCH 24 task = engine pipeline real wire (8) + Cont sub-screens (9) + polish pre-Beta (7). Bugatti craft. Sequential autonomous fail-stop. Karpathy §3 surgical per-task. Daniel zero touch pre-Beta a-z review per Co-CTO autonomy LOCKED V1 PERMANENT. Closure unlocks Phase 7 = Daniel Gates smoke production + Bugatti Full Audit pre-Launch nuclear gate.**
