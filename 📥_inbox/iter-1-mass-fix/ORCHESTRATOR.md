---
title: Iter 1 Mass Fix Orchestrator — D043 Convergence Loop
status: DESIGN_LANDED_PENDING_DANIEL_APPROVE
authority: Daniel CEO directive verbatim 2026-05-20 birou "Atomic fix sau batch cu orchestrator, de cate prompturi e nevoie... pot fi si 500, ca sa taiem cat mai mult din munca"
gate: D042 + D043 LOCKED V1 ABSOLUTE — ZERO bug-uri outstanding pre-Beta
last_updated: 2026-05-20
design_session: 2026-05-20 birou Co-CTO Opus 4.7 1M
---

# ORCHESTRATOR — Iter 1 Mass Fix Convergence Loop D043

## §0 Executive summary

**Total backlog actionable:** ~890 raw findings → de-dup + pattern-cluster → **~340 atomic tasks** + **~20 deferred Cluster E (Daniel CEO sessions)**.

**Atomic prompt count:** **~340 prompts**, NOT 500. Pattern-clustering (P1 SubHeader closes 15 findings, P5 ConfirmModal closes 7, P4 CoachTodayCard wire closes 5, etc.) cuts ~140 findings via shared-fix tasks. Daniel ceiling "500 max" honored cu margin.

**BATCH groupings:** **28 BATCH-uri CC autonomous** (A×8 + B×5 + C×8 + D×7).

**Estimated CC autonomous duration:** **~95-115h cumulative Opus continuous** (~11-15 working days @ 8-10h/day sustainable per Phase 6 BATCH 24-task LANDED rate D026).

**Wave 1 critical-path BATCHes (must run sequential, blocks everything else):** **4 BATCHes (~12-15h)** — Auth chain wire + index.html/security headers/Sentry + CoachToday/Rest engine wire + ConfirmModal shared.

**Wave 2 parallel-safe BATCHes:** **20 BATCHes** runnable across 2-3 concurrent CC sessions Daniel-orchestrated.

**Wave 3 paradigm Daniel-decisions:** **20 deferred Cluster E items**, throughput Daniel availability.

**Convergence target:** **0/0 dual-source findings** post audit-nuclear V4 re-run + Track 7 scan post-iter-1 LANDED → Daniel single comprehensive smoke a-z → Beta launch capable.

---

## §1 Why fresh design (NU follow CONSUMED predecessor)

Daniel handover directive verbatim: *"NU primi spec pre-built. NU follow predecessor Co-CTO plan. Citește audit-urile, vezi findings reale, gândește fresh."*

Predecessor CONSUMED plan estimated **~450-550 atomic prompts**. Fresh design after sampling 4 real finding files (`audit-nuclear-2026-05-19/findings-§01.md` + `§04.md` + `§07.md` + `§31.md` + `mockup-vs-prod-parity-2026-05-20/findings-antrenor.md` + `findings-wave-f-missing.md` + `findings-pass3-cross-screen-patterns.md` + `findings-pass4-polish-backlog.md`) reveals:

1. **Audit Nuclear cross-references itself heavy.** §31-C1/C2/C3 explicitly cite "Per §7-C2/C1/C3 reaffirmed" → already deduplicated by audit. ~50 such cross-refs in 698 findings. Net actionable: ~648.

2. **Mockup-vs-Prod Pass 3 patterns close N findings cu 1 task.** P1 SubHeader (15 screens × 1 finding each) = 1 task closes 15. P5 ConfirmModal (7 missing) = 1 task closes 7. P4 HARDCODED Coach cards (5 CRIT) = 1 task closes 5. P3 emoji traffic-light (3 locations) = 1 task closes 3. P2 Lora italic consistency (~6 screens) = 1 task closes 6. Net: ~36 findings collapse into 5 atomic tasks.

3. **Pass 4 polish findings aggregable per file.** Antrenor.tsx font-weight + padding + border-radius all in same file = 1 task, NU 3. Spans 20+ screens × 3 token dims = ~60 atomic NIT findings collapse into ~20 per-file tasks.

4. **Positives/no-op findings already flagged.** ~80 "Resolution: Acceptable" / "OK" / "positive finding" entries în audit-nuclear are NOT actionable.

5. **Vanilla legacy cleanup batch.** §1-H2 + §1-M3 + §1-M4 + §4-M1 + §22 dead code (vanilla portion) = 1 archive-move task closes ~30 individual findings.

**Final count: ~340 atomic tasks**, NOT 450-550. Daniel "500 max" cap respected cu ~30% margin. Maximum work cuts achieved per directive *"ca sa taiem cat mai mult din munca"*.

---

## §2 Cluster strategy (Karpathy-driven 5 clusters)

Primary axis = Karpathy 4 principii. Secondary axis = parallelization safety per file-scope.

| Cluster | Karpathy | Tasks | BATCH-uri | Parallel | Throughput |
|---------|----------|-------|-----------|----------|------------|
| **A** | Surgical Changes (1-3 LOC per task) | ~180 | 8 (~22 tasks/BATCH) | Infinite | ~30-40h |
| **B** | Simplicity First (delete/restructure) | ~50 | 5 (~10 tasks/BATCH) | Per file scope | ~12-15h |
| **C** | Think Before Coding (new component) | ~80 | 8 (~10 tasks/BATCH) | Per component | ~30-40h |
| **D** | Goal-Driven multi-file refactor | ~30 | 7 (~4 tasks/BATCH) | Sequential | ~20-25h |
| **E** | Paradigm Daniel CEO decisions | ~20 | N/A (Daniel sessions) | N/A | Daniel availability |
| **Total CC** | — | **~340** | **28** | — | **~92-120h** |

**Cluster A — Surgical Changes** (~180 tasks):
- Text swaps mockup verbatim (~70 tasks): missing date header, missing subtitle, CTA label divergences, italic Lora consistency, NO_DIACRITICS verify
- Token alignment Pass 4 polish (~50 tasks): font-weight 600→700, padding asymmetric per-screen, border-radius drift
- Emoji adds (~5 tasks): traffic-light EnergyCheck + PostRpe + SetRatingButtons
- Console.* strip + Vite drop config (~10 tasks)
- Env vars migration (~8 tasks): VITE_FIREBASE_API_KEY + RTDB_URL + SENTRY_DSN
- Comments + JSDoc cleanup (~12 tasks)
- Misc surgical (~25 tasks): App.tsx delete, persona class hoist, image alt text, autocomplete attrs, aria-* adds

**Cluster B — Simplicity First** (~50 tasks):
- Vanilla legacy archive (`src/pages/*.js` + `src/components/*.js` + `src/styles/main.css` + themes → `src/_legacy-vanilla/`) — closes ~30 findings as single task (§1-H2 + §1-M3 + §1-M4 + §4-M1 + §22.* vanilla)
- Dual SW resolve (delete `public/sw.js`, keep vite-plugin-pwa) — §1-H6 + §4-H7
- Phase 5+ stub cleanup post-engine integration (~5 tasks)
- BodyData drift remove decision Daniel-approved (~3 tasks)
- CevaNuMerge prune-to-mockup per Daniel reglaj (Cluster E decision dependent)
- Misc dead code removal (~10 tasks)

**Cluster C — Think Before Coding** (~80 tasks):
- Auth wire chain (sendMagicLink + AuthCallback verify + ProtectedRoute Firebase listener + Sentry init wire + env vars) — 8 tasks Wave 1 critical
- ConfirmModal shared + 7 use sites — 8 tasks Wave 1 critical (P5 closes 7 CRIT)
- CoachTodayCard + CoachRestCard engine wire from getCoachToday aggregate — 2 tasks Wave 1 critical (P4 closes 5 CRIT)
- SubHeader shared component + 15 use sites — 16 tasks (P1 closes 15)
- WorkoutPreview 3 missing sections (Session header card + Warmup row + Exercise list numbered) — 3 tasks
- Istoric calendars (calendar heatmap month-navigable + 90-day ratings heatmap) — 2 tasks
- Antrenor Obiectiv/Programe 6-row selector — 1 task (Daniel "6 obiective V1 LOCK")
- Progres Alerte azi 3-row banner + Compozitie + Tinte sections — 3 tasks
- SVG ring RestOverlay countdown — 1 task
- SessionTimer workout menu (pain + finish-early) — 1 task
- SettingsProfile Compozitie corporala + Tinte personale — 2 tasks
- MISSING screens (weight-timeline + loguri-greutate + support + about + faq + settings-themes) — 6 tasks
- CoachDeloadCard 3rd variant Antrenor — 1 task
- Index.html rewrite (manifest + theme-color + apple-touch-icon + viewport-fit + drop dark color-scheme) — 1 task Wave 1 critical (D1)
- CSP + security headers meta — 1 task Wave 1 critical (D1)
- Misc new components (~25 tasks)

**Cluster D — Goal-Driven multi-file refactor** (~30 tasks):
- Bundle code-split route-based React.lazy + Suspense — 1 task (§5-C1 + §5-C3)
- Tailwind ↔ CSS vars migration — 1 task (§1-C3)
- ESLint install + apply + ci.yml integration — 1 task (§1-C4)
- Persona wrapper hoist Layout.tsx — 1 task (§1-H3)
- Inter font self-host /public/fonts/ — 1 task (§1-H4)
- Zod runtime validation at boundaries — 5 tasks (§3-C2)
- Branded types + FSM discriminated unions — 5 tasks (§14)
- Reduced-motion + skip-link + autocomplete a11y triple — 3 tasks (§6-C1+C2+C3)
- Deploy.yml test gate refactor — 1 task (§33-C1+C2+C3)
- Firebase rules CLI deploy procedure — 1 task (§4-C6)
- Telemetry opt-in flow honor Sentry — 1 task (§17.1)
- DST tests + isoWeek audit — 2 tasks (§11-C1)
- GDPR functional verify (privacy + T&C + wipe) — 3 tasks (§28-C1+C2+C3)
- Backup/restore DR runbook + fresh device test — 2 tasks (§26-C1+C2)
- Misc (~3 tasks)

**Cluster E — Paradigm Daniel CEO** (~20 deferred):
- SettingsPrefs PARADIGM SWAP (destructive vs preferences) — most severe content mismatch
- CevaNuMerge 1 vs 5 options paradigm
- PainButton 3 types vs 15 regions paradigm
- EquipmentSwap per-ex swap vs global busy/available paradigm
- AparateLipsa 10 flat vs 3 categories grouped paradigm
- SettingsNotifications domain vs attribute grouping
- F-antrenor-11 Phase 6 prod-extras (PatternsBanner + AlertsBanner + StatsGrid + ReadinessVerdict + PRNotificationBanner + PRWallRecent + BodyData) keep+amend mockup v1.1 OR remove
- AaFrictionModal wording review (D033 rename PerSetSafetyModal pending)
- F5 vs LOCK 9 disambiguation final
- WORDING backlog 22 items D024 review
- Mockup follow-up items v1.1 candidates (~5 items)

**Total CC autonomous: 180 + 50 + 80 + 30 = 340 atomic tasks across 28 BATCH-uri.**
**Total deferred Daniel: 20 paradigm items.**

---

## §3 Execution sequencing (Wave 1 critical path + Wave 2 parallel)

### §3.1 Wave 1 — Critical path (must run sequential, BLOCKS Wave 2)

Reason: Wave 1 BATCHes either (a) unblock auth-gated screen access for testing OR (b) close highest-impact CRIT findings that Wave 2 tasks depend on (e.g., ConfirmModal must exist before use sites can be wired).

```
BATCH_C1 (Auth chain) → BATCH_D1 (index.html + CSP + Sentry) → BATCH_C2 (CoachToday/Rest engine wire) → BATCH_C3 (ConfirmModal + 7 uses)
```

ETA Wave 1: **~12-15h cumulative** Opus continuous (~2 days).

### §3.2 Wave 2 — Parallel-safe (Daniel-spawned concurrent CC sessions)

Post Wave 1 LANDED + git push, Daniel can spawn 2-3 concurrent CC sessions:
- **Session 1:** Cluster A BATCHes (A1 → A8 sequential within session, parallel across sessions)
- **Session 2:** Cluster B BATCHes (B1 → B5 sequential)
- **Session 3:** Cluster C BATCHes C4 → C8 (SubHeader, WorkoutPreview, Istoric heatmaps, MISSING screens, sub-screen sections)

Cluster D BATCHes (D2 → D7) run sequential în 4th session (multi-file scope = single CC session more reliable).

ETA Wave 2: **~70-90h cumulative across 3 sessions** → **~3-5 calendar days** if Daniel sustains 3 concurrent CC sessions; ~7-10 days if single-session sequential.

### §3.3 Wave 3 — Paradigm Daniel sessions (Cluster E)

Throughput = Daniel availability. Estimated **~10-15 short discussion sessions** (Daniel chooses paradigm direction per item) → CC executes chosen direction post-decision (~5-10h cumulative implementation post-Daniel-decision).

ETA Wave 3: **~3-5 working days Daniel + ~1 day CC implementation post-decisions**.

### §3.4 Iter 1 EXIT gate

Post Wave 1 + Wave 2 + Wave 3 LANDED:
1. Run audit-nuclear V4 procedure (D029 mirror) pe HEAD post-iter-1 → ~698 findings expected ~150-250 remaining (~70% closed)
2. Run Track 7 scan automated systems → ratchet thresholds re-baseline
3. Run mockup-vs-prod parity V2 audit pe HEAD post-iter-1 → ~263 findings expected ~50-100 remaining (~70% closed)
4. Aggregate `_aggregate-findings-iter-1-exit.md` cu remaining count + dual-source convergence delta
5. Decision: **iter 1 EXIT** dacă remaining ≤ ~200 dual-source (≥77% closure) → trigger iter 2 mass fix planning. Daniel single comprehensive smoke a-z DEFERRED până final iter convergence ZERO findings dual-source.

ETA iter 1 EXIT audit: **~12-15h CC continuous** (~2 days).

---

## §4 Atomic task spec format

Per atomic task = single Markdown file `task_NNN_<cluster>_<title-slug>.md`:

```markdown
# Task NNN — <Short title>

**Cluster:** A | B | C | D
**Karpathy:** Surgical Changes | Simplicity First | Think Before Coding | Goal-Driven
**Effort:** S (≤30min) | M (≤4h) | L (multi-file)
**Beta blocker:** YES (Wave 1) | YES (Wave 2) | NO (Wave 3)
**Source finding(s):** NC§NN-XN OR MP-<screenId>-<NN> (cite primary-source verbatim per D008)
**File(s) touched:** src/...:<line> + ...
**Dependencies:** task_XXX (if blocked by other task closing first)

## §A Pre-flight
Read primary-source line cited. ZERO recall din memorie. D008 anti-halucinare.

## §B Implementation
Surgical edit spec exact, anti-overengineering. Karpathy applied attribution explicit.

## §C Tests
Vitest/Playwright assertion update if needed. NU expand scope.

## §D Commit
Atomic single-concern Bugatti commit message format:
`fix(<cluster>-<NNN>): <short description> (<source-citation>)`

## §E Verify post-edit
`gitnexus_detect_changes()` per CLAUDE.md mandatory + grep test command + expected output.
```

**Generation strategy:** ORCHESTRATOR design session does NOT pre-generate all 340 task_NNN.md files (context-prohibitive + churn risk). Instead:
- `_MASTER_BACKLOG.md` = compact TSV-style table all 340 atomic tasks cu source-citation + dependencies + cluster + Karpathy + effort
- Per-cluster file `_CLUSTER_<X>.md` = task list cu titles + scopes
- Per-BATCH file `BATCH_NN.md` = which task IDs included + parallelization rules
- Sample atomic task files (5 templates, one per cluster + one Wave 1) = format reference
- **At execution time:** per BATCH session, CC autonomous expands cluster line items → atomic task files inline as part of BATCH execution. Eliminates 340-file proliferation maintenance burden.

---

## §5 BATCH execution protocol

Per `BATCH_NN.md`:

```markdown
# BATCH NN — <Cluster + theme>

**Tasks included:** task_NNN → task_MMM (range continuous within cluster)
**Parallelization:** safe parallel (different files) | sequential (file dependency)
**Estimated duration:** ~Xh CC continuous Opus
**Pre-requisite BATCHes:** BATCH_XX (must LAND first per DAG)
**Fail-stop:** per task atomic commit; fail mid-BATCH → mark task FAILED + skip + continue

## Pre-flight BATCH
1. `git tag pre-batch-NN-<short>` backup
2. `npm run test:run` baseline green verify (4522 PASS expected per D026 + post-Phase-7 fix)
3. Pre-BATCH GitNexus index freshness verify per CLAUDE.md (`gitnexus://repo/andura/context`)

## Tasks loop sequence
1. Read task_<first>.md → execute → commit atomic
2. ...
3. Read task_<last>.md → execute → commit atomic

## Post-BATCH
1. `npm run test:run` post-BATCH green verify
2. `git tag post-batch-NN-<short>` milestone
3. `git push origin main` manual final (per D031 push-discipline)
4. Update `_progress.md` BATCH LANDED checkpoint
5. Daniel post-BATCH review (optional — Daniel CEO discretion)
```

---

## §6 Fail-stop recovery protocol

Per task atomic commit. Fail mid-BATCH:

1. Mark task `FAILED` în BATCH log section `## Failures`
2. `git stash` partial changes
3. Skip to next task — DO NOT abort BATCH
4. Continue BATCH until LANDED
5. Post-BATCH: enumerate failed tasks în `_progress.md §Failures`
6. Daniel review failed tasks → either (a) Daniel decision deferred (re-paste single failing task next session) OR (b) Daniel decision re-scope task

**Rationale:** fail-stop BATCH-level wastes ~22h work (per Cluster A BATCH average). Per-task fail-stop preserves ~95% BATCH value cu surgical retry cost (1 task re-paste = ~30min Opus).

---

## §7 DAG dependencies (critical path)

See `_DAG.md` Mermaid graph + critical-path enumerate.

**Hard blockers (Wave 1 sequence):**
- BATCH_C1 (Auth wire) BLOCKS Wave 2 (auth-gated screen capture testing impossible)
- BATCH_D1 (index.html + CSP + Sentry init) BLOCKS Wave 2 (security baseline + production observability mandatory)
- BATCH_C2 (Coach engine wire) BLOCKS BATCH_C7 (Antrenor sub-screen wiring depends on Coach card props)
- BATCH_C3 (ConfirmModal shared) BLOCKS BATCH_C8 (7 use-site wirings reference shared component)

**Soft dependencies (within Wave 2):**
- BATCH_B1 (vanilla archive) BEFORE BATCH_D6 (Tailwind ↔ CSS vars — vanilla legacy purge clean)
- BATCH_D6 (Tailwind CSS vars) BEFORE BATCH_A5 (token alignment utilities)
- BATCH_C5 (SubHeader shared) BEFORE BATCH_C6 (SubHeader 15 use sites)

---

## §8 Anti-recurrence invariants

Per task + BATCH:
- **D008** primary-source verify MANDATORY (read file line cited verbatim, NO recall)
- **D023** MCP filesystem write_file pentru vault writes (Windows emoji paths)
- **D041** anti-inflation per task report: "Closed N findings @ source A + M @ source B = TTT" — NU compound
- **gitnexus_impact** before edit + **gitnexus_detect_changes** before commit per CLAUDE.md
- **D031** push manual final per BATCH milestone, NU per task

---

## §9 Convergence checkpoint iter 1 EXIT

Post all 28 BATCHes LANDED + Cluster E paradigm decisions implemented:

1. **Audit Nuclear V4** re-run D029 procedure pe HEAD curent → measure delta vs `b705c3f` baseline 56.5% production readiness
2. **Mockup-vs-Prod V2** re-run pe HEAD curent → measure delta vs `caaae99` baseline 36% mockup parity
3. **Track 7 systems scan** aggregate (Tier 1 Vitest+Playwright+Lighthouse+axe+bundle+health + Tier 2 Checkly synthetic + Tier 3 Stagehand exploration nightly)
4. **Aggregate convergence report** `📤_outbox/iter-1-convergence-2026-XX-XX/_aggregate-findings.md` cu remaining count + Beta blocker list
5. **Daniel CEO review** convergence delta → decision **CONTINUE iter 2 mass fix** (dacă remaining ≥ ~100) OR **EXIT iter convergence loop** (dacă remaining = 0/0 dual-source) → trigger Daniel single comprehensive smoke a-z → Beta launch capable

**ETA iter 1 EXIT audit:** ~12-15h CC continuous (~2 days).
**ETA iter 2 (estimated):** ~50% scope of iter 1 (post-Pareto closure) → ~50-70h CC autonomous + ~10-20 Cluster E remaining items.

---

## §10 Daniel CEO approval gate

This design = LANDED draft. Daniel CEO reviews:
1. Cluster A/B/C/D/E split rationale + atomic count ~340 vs predecessor ~450-550
2. Wave 1 critical-path BATCHes (4 BATCHes ~12-15h)
3. ETA codified (~95-115h CC + ~3-5 days Daniel sessions Cluster E)
4. Convergence iter 1 EXIT gate criterion
5. Master backlog rows sample (read `_MASTER_BACKLOG.md` head 50)
6. Sample atomic task spec format (read `task_001_C001_Auth_sendMagicLink_wire.md` + 4 others)

**Post-approval triggers:**
- Daniel paste `BATCH_C1` execution prompt în new CC session ACASĂ → Wave 1 starts
- Per BATCH LANDED Daniel review → either continue Wave 1 OR pause for issue

**Anti-pattern avoidance:**
- NU plan churn (revise design mid-execution unless Daniel CEO override)
- NU intermediate verification proposals pre-Beta (D012 Co-CTO autonomy boundary)
- NU compound "ready to start" estimates (D041)

---

## §11 Skills used design session

- ✅ Sequential Thinking — cluster strategy reasoning + Pareto identify ~140 dedup via patterns
- ✅ Karpathy 4 principii — cluster axis primary
- ✅ Anti-halucinare D008 — sampled 8 real finding files line-cited, NO recall
- ✅ Impeccable /critique — self-review pre-LANDED (predecessor plan 450-550 count critiqued + reduced 30% via pattern dedup)
- ✅ /qa + /review — embedded per cluster spec
- 🔲 GitNexus — N/A design phase (no src/ touches); MANDATORY pre-execution per CLAUDE.md
- 🔲 Context7 — N/A design phase; available at execution time

---

🦫 **Iter 1 Mass Fix Orchestrator Design LANDED. ~340 atomic tasks across 28 BATCH-uri. Wave 1 critical-path 4 BATCHes ~12-15h. D042+D043 ABSOLUTE gate. Pending Daniel CEO approve → trigger BATCH_C1 execution session.**
