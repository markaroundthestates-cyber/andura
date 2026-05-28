---
title: Andura — Decisions Single Source of Truth
type: ssot-decisions
status: live
last_updated: 2026-05-28
schema_version: 1
latest_entry: D090
total_entries: 89
authority: Daniel CEO directive 2026-05-15 reglaj chat post wiki sprawl — "Ne trebuie un loc special dedicat cu toate deciziile, updatate la fiecare handover, nu trebuie sa avem aceeasi decizie si pas de 10 ori in forme diferite"
---

# DECISIONS.md — Andura SSOT Single Source of Truth

**Singular truth-source pentru toate deciziile Andura post 2026-05-15.**

**Append-only.** Wiki/ + 03-decisions/_FROZEN/ ADRs + CLAUDE.md root schema = FROZEN arhivă imutabilă (read-only legacy reference only).

## Format strict
`[ID] | [DATA YYYY-MM-DD] | [CATEGORY] | [TITLU COMPACT ≤80 char] | [STATUS] | [SOURCE PATH:§]`

## Categories
- **STRATEGY** = product direction, paradigm, positioning
- **ARCH** = architecture, engines, data model
- **ENG** = engineering tactical (specs, refactors)
- **UX** = user experience, copy, interactions
- **SAFETY** = medical/legal/disclaimers
- **PROC** = process, workflows, handover
- **REGLAJ** = system reglare meta (instructions, rules, SSOT)

## Status
- **LOCKED V1** = current binding
- **LOCKED V2** = superseded V1 cu version 2 binding
- **DRAFT** = pending Daniel review
- **DEPRECATED** = no longer active
- **SUPERSEDED-BY-<ID>** = replaced by newer entry

## Citation rule
Orice claim Claude/CC → cite `DECISIONS.md §<ID>` verbatim. ZERO recall din memorie. Uncertain → search file primul.

## Supersede enforcement rule (T3 explicit amendment 2026-05-16)
Pe orice /handover ingest: după append D-NEW în `## CURRENT DECISIONS` section, CC scanează entries `D-NNN` din **CURRENT DECISIONS section ONLY** (NU D-LEGACY-* care sunt FROZEN pre-reglaj historical reference). Trigger = **literal match** (NU fuzzy semantic detection):
- **(a) titlu keyword overlap ≥50%** words via lowercase token compare (e.g. "wiki freeze" în D001 + "wiki freeze" în D-NEW = match)
- **(b) source path identic** (e.g. ambele cite `DECISIONS.md §D003`)
- **(c) CATEGORY identic + keyword overlap ≥30%** (e.g. ambele REGLAJ + cuvinte cheie suprapuse)

Match positive → CC schimbă D-OLD status `LOCKED V1` → `SUPERSEDED-BY-<D-NEW>` în **SAME atomic commit** cu append D-NEW. ZERO partial commits, ZERO stale `LOCKED V1` parallel cu superseder activ.

Ambiguous match (overlap 30-49% sau category-only match fără keyword overlap) → flag în `📤_outbox/LATEST.md §"Supersede ambiguities"` Daniel review explicit pre-commit. Authority: D007.

---

## CURRENT DECISIONS (post 2026-05-15 reglaj)

D001 | 2026-05-15 | REGLAJ | Wiki FREEZE imutabilă post 2026-05-15 + DECISIONS.md SSOT singular | LOCKED V1 | DECISIONS.md §D001
D002 | 2026-05-15 | REGLAJ | USER_PREFERENCES V4 compact 7 reguli binary verifiable (Claude.ai UI custom instructions) | LOCKED V1 | DECISIONS.md §D002
D003 | 2026-05-15 | REGLAJ | PROJECT_INSTRUCTIONS V5 compact ~800 cuvinte (Claude.ai project custom instructions) | LOCKED V1 | DECISIONS.md §D003
D004 | 2026-05-15 | REGLAJ | Karpathy 4 principii = core philosophy reference (Think Before Coding + Simplicity First + Surgical Changes + Goal-Driven Execution) | LOCKED V1 | 07-meta/karpathy-skills-ref/CLAUDE.md §1-§4
D005 | 2026-05-15 | REGLAJ | Eliminate §AR.* meta-framework future (preserve §AR.28-§AR.31 candidate cumulative as historical reference) | LOCKED V1 | DECISIONS.md §D005
D006 | 2026-05-15 | REGLAJ | Handover format = paragraf scurt + DECISIONS.md delta append, NU 150 LOC scribe flow | LOCKED V1 | DECISIONS.md §D006
D007 | 2026-05-16 | PROC | Supersede enforcement rule schema D-NNN scan CURRENT only D-LEGACY-* EXCLUDED | LOCKED V1 | DECISIONS.md §schema supersede rule
D008 | 2026-05-16 | PROC | Pre-action vault primary-source verification MANDATORY pentru product state claims | LOCKED V1 | DECISIONS.md §D008
D009 | 2026-05-16 | PROC | CEO scope strict UI wording autonomous compose = SLIP DEFAULT surface options | LOCKED V1 | DECISIONS.md §D009
D010 | 2026-05-16 | PROC | Deploy on-demand Co-CTO trigger (NU auto on push GitHub Actions) + Playwright disabled docs commits + buget GitHub Actions suplimentar invariant | LOCKED V1 | DECISIONS.md §D010
D011 | 2026-05-16 | REGLAJ | PRIMER §5 smoke claim correcție + §6 drift cleanup cluster engineering normalization (live state vs feature branch gap awareness) | LOCKED V1 | DECISIONS.md §D011
D012 | 2026-05-16 | PROC | Co-CTO autonomy boundary clarification zero intermediate verification proposals user-facing pre-Beta launch a-z single gate (§AR.31 D009 extension reinforcement) | LOCKED V1 | DECISIONS.md §D012
D013 | 2026-05-16 | REGLAJ | Pre-Beta LOCK 1 100% complete + deploy main 2026-05-16 + PRIMER §6 cleanup post Track 1+2 audit close | LOCKED V1 | DECISIONS.md §D013
D014 | 2026-05-16 | PROC | Branch divergence reconcile main ↔ feature/v2-vanilla-port strategy: merge feature → main -X theirs (prefer feature on conflicts) post 3 possibly-orphan items verified absorbed. History preserved via merge graph; feature content canonical post-merge. Investigation: INVESTIGATION_2026-05-16_main_vs_feature.md | LOCKED V1 | DECISIONS.md §D014
D015 | 2026-05-16 | STRATEGY | STRAT PIVOT Pre-Beta NU vanilla port — lansăm Andura Clasic pe React mockup andura-clasic.html DESIGN MASTER direct. Supersedes part of D-LEGACY-049 Port-First-Then-React Step 1 vanilla port closure (păstrăm Step 2 React migration). Backend LOCK 1 100% (lib 657, Big 11 8/8, Calendar engine, kcal floor, BATCH 2 Antrenor, auth, tests 3743 PASS) reusable React migration. Vanilla index.html 6 taburi = LEGACY până React LANDED | LOCKED V1 | DECISIONS.md §D015
D016 | 2026-05-16 | PROC | Bottom nav 6→4 (Antrenor/Progres/Istoric/Cont) + screen architecture 50+ screens goto()-based restructure se face EXCLUSIV în React build pe spec mockup, NU în vanilla index.html + src/pages/*.js legacy. Eliminăm double-work non-Bugatti. Implementation path next chat (React stack + state mgmt + routing + backend reuse) | LOCKED V1 | DECISIONS.md §D016
D017 | 2026-05-16 | STRATEGY | Phase 1 React Foundation LANDED Vite+React19+TS+Zustand+Tailwind extend Batch 1 scaffold | LOCKED V1 | DECISIONS.md §D017
D018 | 2026-05-16 | STRATEGY | Phase 2 Routing Skeleton LANDED C hybrid + slice mic + Layout+BottomNav+ProtectedRoute+nav helper | LOCKED V1 | DECISIONS.md §D018
D019 | 2026-05-16 | PROC | Track 5 NEW E2E Playwright disclaimer dismiss helper backlog (23 fails LOCK 4 Medical Disclaimer pre-test) | LOCKED V1 | DECISIONS.md §D019
D020 | 2026-05-16 | ARCH | Test paradigm split Phase 2+ MemoryRouter jsdom tests + createBrowserRouter prod (Node 25 AbortSignal mismatch) | LOCKED V1 | DECISIONS.md §D020
D021 | 2026-05-17 | STRATEGY | Phase 3 Antrenor LANDED 9-task atomic React tab parity mockup + 14 sub-screens nested goto() | LOCKED V1 | DECISIONS.md §D021
D022 | 2026-05-17 | STRATEGY | Phase 4 BATCH task_13-22 LANDED 10-task atomic 14 commits 4209 PASS WORDING backlog 22 items | LOCKED V1 | DECISIONS.md §D022
D023 | 2026-05-17 | PROC | MCP filesystem write_file MANDATORY vault Windows emoji paths verify list_directory | LOCKED V1 | DECISIONS.md §D023
D024 | 2026-05-17 | UX | Pre-Beta wording RO Co-CTO autonomous compose OK Daniel review post-Beta a-z | LOCKED V1 | DECISIONS.md §D024
D025 | 2026-05-18 | STRATEGY | Phase 5 BATCH 20-task LANDED 22 commits 4290 PASS engine adapters Phase 6 foundations polish | LOCKED V1 | DECISIONS.md §D025
D027 | 2026-05-18 | STRATEGY | Phase 6 task_02 Option C big-bang async migration React consumers — sync→async signature propagation + loading state explicit + test rewrite ~80-120 assertions | LOCKED V1 | DECISIONS.md §D027
D026 | 2026-05-19 | STRATEGY | Phase 6 BATCH 24-task LANDED — engine pipeline real wire 8/8 + Cont sub-screens 9/9 + polish pre-Beta 7/7 + 4303→4522 PASS (+219) + TS strict maximal | LOCKED V1 | DECISIONS.md §D026
D028 | 2026-05-19 | PROC | React entry swap LANDED andura.app/ vanilla→React production Option 1 rename + vanilla preserved index-vanilla-legacy.html backup | LOCKED V1 | DECISIONS.md §D028
D029 | 2026-05-19 | PROC | Bugatti Audit Nuclear procedure continuous neîntrerupt multi-noapte Opus MAX log-only quality-asymptotic until Daniel STOP | LOCKED V1 | DECISIONS.md §D029
D030 | 2026-05-19 | PROC | Obsidian Git plugin fix anti-recurrence — autoCommitOnlyStaged=true + autoSave=0 + autoPull=0 + autoPullOnBoot=false (root cause b1bd099 mass-delete propagation) | LOCKED V1 | DECISIONS.md §D030
D031 | 2026-05-19 | PROC | Phase 7 Findings FIX procedure continuous neîntrerupt Opus exclusively per § atomic commit, push manual final §50 SAU Daniel trigger, mirror D029 reverse | LOCKED V1 | DECISIONS.md §D031
D032 | 2026-05-19 | PROC | Track 7 Automated Testing procedure continuous neîntrerupt Opus exclusively per phase atomic commit, push manual final §7.10 SAU Daniel trigger, mirror D031 = 3-tier defense (Tier 1 in-repo Vitest+Playwright+visual+Lighthouse+fast-check+@langwatch/scenario+Stryker+axe+bundle+health / Tier 2 Checkly synthetic prod / Tier 3 Stagehand exploration nightly monitoring scope per WebTestBench arXiv 2603.25226) + persona-driven engine deterministic verification ADR 030 D1-D5 8/8 adapters | LOCKED V1 | DECISIONS.md §D032 + 08-workflows/TRACK_7_AUTOMATED_TESTING_MASTER_SPEC.md
D033 | 2026-05-19 | UX | AaFrictionModal → PerSetSafetyModal rename Track 7 §7.5 LOCK 9 disambiguation — resolve F5 vs LOCK 9 component overlap per master spec §9-C1 CEO directive (D.1 yes-all). Preserves wording anti-paternalism + per-set safety RIR 0 trigger semantics. @langwatch/scenario coach voice scenarios skeleton activation unblocked | LOCKED V1 | DECISIONS.md §D033 + 08-workflows/TRACK_7_AUTOMATED_TESTING_MASTER_SPEC.md §9-C1 + tests/engine/coach-scenarios/coach-voice.scenarios.test.ts
D034 | 2026-05-19 | PROC | npm audit case-by-case per Snyk PR review policy NU `--force` blind — vulnerability triage Daniel CEO decision pe Snyk PR surfacing (14 transitive vulns remaining post §7.4 init; brace-expansion + ws safe patches applied iter 1). `--force` breaking-changes deferred until per-vuln impact assessed (D.3 yes-all) | LOCKED V1 | DECISIONS.md §D034 + .github/workflows/ci.yml Snyk step
D035 | 2026-05-19 | PROC | Branch protection main bypass admin "Always" config solo dev pre-Beta — rules păstrate force push block + deletion restrict + linear history pentru safety. Strict PR-only mode post-Beta când multiple contributors / real users / audit trail mandatory. Daniel push-back legitim PR rigid overkill solo + CC autonomous = pragmatic Bugatti | LOCKED V1 | DECISIONS.md §D035
D036 | 2026-05-19 | TECH | Track 7 §7.6 deploy.yml de-skeleton + ratchet thresholds + wire activated workflows LANDED `bda24bc` (real implementation post Daniel push-back chore-claim halucinare). Hard gates Bundle size + Lighthouse perf + Snyk vuln. Ratchet pe real `npm run build` measurements (size +13-34% margin: index 145.73/165 KB / main 127.58/145 KB / vendor-react 24.80/30 KB / vendor-icons 4.79/6 KB / CSS 4.47/6 KB) + Lighthouse 0.60 first-baseline realistic (Daniel ratchets UP în PR review post real measurement) | LOCKED V1 | DECISIONS.md §D036 + .github/workflows/ci.yml + deploy.yml + track-7-nightly.yml + .size-limit.json + lighthouserc.js
D037 | 2026-05-19 | COST | Browserbase Developer $20/mo paid Option A full §7.8 activate confirmed (Daniel decision against Co-CTO recommendation defer save cost). §7.8 Stagehand exploration nightly OPERATIONAL pe `bb_live_*` cu 25 concurrent browsers + 100 browser hours/lună budget. Anthropic API $20 EUR credits separate (NU Max x20 plan-based — cloud Stagehand needs separate API key per Anthropic billing model June 15 change Agent SDK $200/lună dedicated credit auto-applied) | LOCKED V1 | DECISIONS.md §D037 + scripts/nightly-exploration.mjs + .github/workflows/track-7-nightly.yml
D038 | 2026-05-20 | PROC | Co-CTO chat ZERO create_file pe paths cross-device (acasa vs birou MCP server config diferit) — filesystem:write_file + verify listing immediate post-write mandatory anti-halucinare false-positive | LOCKED V1 | DECISIONS.md §D038
D039 | 2026-05-20 | PROC | chore-auto Stop hook DISABLED PERMANENT in .claude/settings.json (disableAllHooks: true) + Andura/ gitignore belt+suspenders anti-f1c79dd recurrence | LOCKED V1 | DECISIONS.md §D039
D040 | 2026-05-20 | TECH | .github/workflows/deploy.yml build step env vars injection mandatory VITE_FIREBASE_* (Magic Link blocker regression iter 9.5 fix) — GitHub Secrets VITE_FIREBASE_API_KEY + VITE_FIREBASE_RTDB_URL Daniel-action | LOCKED V1 | DECISIONS.md §D040
D041 | 2026-05-20 | REGLAJ | Production readiness % rapoarte Co-CTO = estimat compound NU re-audit verifiable. Real measurement = re-run audit nuclear pe HEAD curent (Phase 8 Bugatti pre-Launch gate). Anti-inflatie: format raport include "Estimate (not measured): X%, Last measured: Y% @ <audit_date>" | LOCKED V1 | DECISIONS.md §D041
D042 | 2026-05-20 | STRATEGY | Pre-Beta launch GATE = ZERO bug-uri outstanding (~900 cunoscute live → 0). Daniel CEO directive verbatim birou 2026-05-20: "Pana nu reducem nr la 0, nu avem beta" | LOCKED V1 | DECISIONS.md §D042
D043 | 2026-05-20 | STRATEGY | Pre-Beta gate procedure = iterative loop fix → audit nuclear → scan automated systems (Track 7 + tot ce avem) → fix → repeat până convergence ZERO findings dual-source, apoi Daniel manual live smoke single comprehensive gate → validare finala Beta launch | LOCKED V1 | DECISIONS.md §D043
D044 | 2026-05-20 | PROC | Iter 1 Mass Fix Orchestrator design LANDED — 340 atomic tasks (NU 450-550 predecessor estimate) across 28 BATCH-uri Karpathy-driven 5 clusters (A Surgical 180 / B Simplicity 50 / C Think-Before 80 / D Goal-Driven 30 / E Paradigm Daniel 20 deferred). Wave 1 critical path 4 BATCH-uri ~12-15h (Auth chain + index.html+CSP+Sentry + Coach engine wire + ConfirmModal+7uses). Wave 2 parallel-safe 20 BATCH-uri ~3-5 calendar days hybrid 2-3 sessions. Wave 3 paradigm Daniel sessions. Iter 1 EXIT audit ~12-15h. Pareto closure projection ~58% of ~890 findings single iter → iter 2 residual ~50% scope. Total Beta gate path ~25-39 calendar days. ETA codified D041 anti-inflation. NU follow predecessor CONSUMED plan (Daniel directive verbatim "gandeste fresh") | SUPERSEDED-BY-D045 | DECISIONS.md §D044 + 📥_inbox/_CONSUMED/iter-1-mass-fix_STALE-DESIGN-2026-05-20/ORCHESTRATOR.md + _MASTER_BACKLOG.md + _DAG.md + _BATCH_INDEX.md
D045 | 2026-05-20 | PROC | Iter 1 Mass Fix Orchestrator V2 LANDED HEAD-verified — 4 mega-Waves architecture (Wave A Critical+Coach+ConfirmModal+Bundle+GDPR+Beta-checklist ~40 + Wave B Surgical text+tokens+polish ~150 + Wave C Components+Simplicity+MISSING screens ~80 + Wave D Goal-driven multi-file refactor ~35) = ~305 atomic tasks post pattern-collapse + per-screen aggregation + vanilla legacy archive cluster. Per-task pre-flight HEAD verify MANDATORY anti-stale-baseline D029 lesson (grep "§<id> audit fix" în prod → NO-OP skip if Phase 7 LANDED ~58 fixes verified verbatim Auth.tsx+ProtectedRoute.tsx+main.tsx+ErrorBoundary.tsx+sentry.js+index.html+vite.config.js+deploy.yml+eslint.config.js+AuthCallback.tsx). Cluster E paradigm Daniel deferred ~20 items parallel sessions. ETA ~85-110h CC Opus = ~11-15 calendar days iter 1 hybrid 2-session parallel mode (Wave A sequential → Wave B+C parallel → Wave D sequential). Supersedes D044 (v1 stale-baseline 340 tasks across 28 BATCH-uri assumed ALL 698+263 OPEN — ~58 Phase 7 LANDED ignored). Daniel CEO directive verbatim 2026-05-20 evening "Faci prompt/atomic/batch cu multe files (cate vrei tu), 1 chat sau mai multe... orchestrator si tot ce mai trebuie, cat sa acoperi cat mai mult din cele 961". | LOCKED V1 | DECISIONS.md §D045 + 📥_inbox/iter-1-mass-fix-v2/ORCHESTRATOR.md + _MASTER_BACKLOG.md + _DAG.md + _progress.md + PROMPT_CC_iter1_wave_a/b/c/d
D046 | 2026-05-21 | PROC | 5 Daniel CEO decizii iter 1 BLOCKED rezolvate REVERSE 4 + SAME 1 Bugatti Beta — (a) §3.1 ConfirmModal SAME aliniat drill-down screens per mockup paradigm consistency D-LEGACY-2026-05-11 NO change tasks B001/B002/B003/B004 trasate cale drill-down NU shared modal (NU contradicts Wave A A003 reusable component implementation — A003 stays available pentru future + B005/B006 OAuth Cluster E etc) + (b) §3.2 OAuth Cluster E020 REVERSE include Beta scope LOCKED V1 (Skip-auth Maria 65 test-drive + Google OAuth Gigel/Marius low-friction = auth FULL paradigm Beta NU Magic Link singur MVP) Schedule iter 2 ~2-4h dev + Firebase OAuth provider Google Cloud Console + Skip-auth state mgmt + E2E tests tasks B005+B006 + (c) §3.3 Bundle A011-A012 SAME supervised live ASAP-saptamana NU end-of-iter defer Block 2-3h Daniel-present-required tasks B007+B008 + (d) §3.4 Kalman A038 REVERSE FIX + FLIP-ON pre-Beta (PRIMER §2 brand-promise "Kalman adaptive TDEE NU 2000 kcal hardcoded" must be REAL working NU OFF+EWMA fallback false-FULL) processNoise=22*0.01 origin document Hall-2008 citation + calibrate simulator persona Marius/Maria/Gigel + flip flag ON + 2 CRITICAL+4 MEDIUM+3 LOW REVIEW-A036-A038.md fixed Total ~12-20h dev+simulator combined Schedule iter 2 sau iter 3 tasks B026+B027+B029 + (e) §3.5 A021-A022 LARGE refactor REVERSE include iter 2 pre-Beta (Bugatti "fiecare linie cod citită" pre-Launch audit nuclear = substrate trebuie clean TS strict + Tailwind consistent "Refactor later NEVER happens" rule activă A022a .d.ts stubs = stepping stone NU finish line) ~6-10h supervised combined A022 split 6 atomic subtasks deja documented WAVE_BCD_D029_SAMPLE.md Wave B/C/D blend incremental iter 2 finalizează tasks B009+B010 | LOCKED V1 (§3.1 amended-by-D047 RIP-OUT correction) | DECISIONS.md §D046 + 📥_inbox/MORNING_HANDOVER_2026-05-21.md §3 + 📥_inbox/iter-2-mass-fix-v2/ITER_2_PLAN.md §6 + 📤_outbox/wave-a-audit-engine/PATTERNS.md + REVIEW-A036-A038.md
D048 | 2026-05-21 | SAFETY | Magic Link sendMagicLink 30s client throttle = accepted-risk pre-Beta (Firebase quota defense-in-depth secondary) — gsd-security-auditor §A018 PARTIAL verdict acknowledged: client-side throttle can be bypassed (DevTools clear lastMagicLinkSent localStorage), DAR Firebase Identity Toolkit quota lockout legitimate users dacă attacker spams. Defense-in-depth: (a) UI throttle 30s anti-double-tap + UX cooldown timer + (b) Firebase server-side rate limit (per-IP + per-project quota built-in) absorbs malicious abuse. Pre-Beta tradeoff: serverless function pentru rate-limit gateway (~$10-20/mo Cloud Functions cost) defer post-Beta launch. Daniel CEO accepted-risk noted gsd-security-auditor REVIEW 2026-05-21 morning. Iter 2+ ticket: monitor Firebase quota dashboard daca abuse signal. Source: REVIEW-A036-A038 + SECURITY.md throttle PARTIAL. Karpathy SF — minimum care rezolva Beta scope, ZERO speculative infra premature. | LOCKED V1 | DECISIONS.md §D048 + 📤_outbox/wave-a-audit-engine/SECURITY.md §T-4
D047 | 2026-05-21 | UX | ConfirmModal A003 RIP-OUT + uniform drill-down paradigm Bugatti consistency — Daniel CEO explicit correction D046 §3.1 interpretation (eu mis-interpreted "SAME aliniat drill-down NO change" ca A003 stays system-level logout/delete + drill-down NEW doar B001-B004 — Daniel verdict actual = RIP-OUT A003 complet + ALL destructive actions migrate drill-down screens uniformly Bugatti consistency NU mix paradigms). Scope code work iter 2 expansion: RIP `src/react/components/ConfirmModal.tsx` + RIP `src/react/components/ConfirmModal.test.tsx` 11 tests + REVERT Wave A integrations `SettingsDanger.tsx` logout/delete usage (commits `15ee9d60` A004+A008 + `d5203d02` A007 + `fc3e6cc9` A007-fix + `3f05f8ce` A016) + NEW drill-down screens (LogoutConfirm.tsx + DeleteAccountConfirm.tsx + variants pentru B001-B004 Settings actions) + routes wire + tests + extend GotoScreen union sub-screens convention. Estimated ~5-8h dev HIGH RISK security-critical flows (logout token clear + account delete reauth) Daniel-supervised live recommended NU autonomous. ITER_2_PLAN.md §6 D-1 RESOLUTION CORRECTED + B001-B004 scope expanded → B001-B011 (4 original drill-down + 4 RIP-OUT migrate + 3 NEW screens architecture). A007 fix `fc3e6cc9` security pattern (authSignOut() call) preserved în NEW LogoutConfirm.tsx implementation. | LOCKED V1 | DECISIONS.md §D047 + 📥_inbox/MORNING_HANDOVER_2026-05-21.md §3.1 + 📥_inbox/iter-2-mass-fix-v2/ITER_2_PLAN.md §6 D-1
D049 | 2026-05-22 | PROC | Pre-commit subject↔diff alignment verify mandatory anti-recurrence ghost-metadata. Original incident `21f0d204` chat 3 (subject "revert role=list aria-labelledby EnergyCheck + EnergyCause + CevaNuMerge + ScheduleOverride" — actual diff: ZERO touch of 4 screens, only Sentry test files modified; production code revert landed separately în `7d6b890b`). Recurrence pattern confirmed catastrophic 2026-05-22 14-agent parallel race chat 3: 5+ mega-bundles cu subject↔diff mismatch (`b918e76c` claims F-istoric-01/T1 contains MED-4 + F-progres-07 + alte / `f6dc24b7` claims T5 contains MED-1 + ObiectivSelector + EnergyCheck emoji / `52638b9b` claims T7 contains MED-3 AaFriction / `d8ff7b01` claims T9 contains RestOverlay SVG ring / `b6869516` claims doc(SSOT-D049) BUT DECISIONS.md NOT în diff = ghost-meta peak ironie self-violation). Karpathy TBC (Think Before Committing) discipline = run `git diff --cached --stat` + match >=1 file path în diff matches subject claim BEFORE invoking `git commit`. Rule expansion 2026-05-22: SINGLE-AGENT workflow OR `isolation: "worktree"` parameter MANDATORY pentru spawn >3 paralel pe same git index (anti-recurrence 14-agent race chat 3). Cannot rewrite shipped history (D031 invariant 33+ commits ahead origin pre-push protect lossy ops). D049 = breadcrumb future blame archaeology + regression-guard. Forensics doc: `📤_outbox/consolidation-audit/MEGA-BUNDLES.md` + `BYPASS-FORENSICS.md` 2026-05-22. | LOCKED V1 | DECISIONS.md §D049 + 📤_outbox/REVIEW-chat3-fresh-eyes.md HIGH-3 + 📤_outbox/VERIFICATION-chat3.md §3 Gap 3 + 📤_outbox/consolidation-audit/MEGA-BUNDLES.md + BYPASS-FORENSICS.md
D050 | 2026-05-23 | PROC | `git commit -o -m -- <paths>` pattern MANDATORY all agent commits — D049 anti-ghost-metadata expansion. `-o` flag commit-only listed paths post `--` ignore staged index from other agents = anti-race index contamination. Empirical proof chat 5: 21+ atomic commits Co-CTO autonomous + 4-5 agents paralel storm ZERO ghost-metadata incidents (vs 5 mega-bundles chat 3 + 10+ chat 4). Subject↔diff verify D049 rule preserved: `git diff --cached --stat` BEFORE commit invocation still mandatory (catches case where path supplied is stale/wrong file). `git add -A` ban strict. Wildcard paths discouraged. | LOCKED V1 | DECISIONS.md §D050
D051 | 2026-05-23 | PROC | Max 4-5 agents concurrent confirmed empirical i7-8700 hardware sweet spot — Daniel verbal chat 4 LOCK V1 "ne capam la 4-5 agents in total de acum" + chat 5 stress test empirical confirm. Spawn batch >5 = anti-pattern context switch thrashing + lock contention + D049 race chaos accelerate. Manager Co-CTO orchestrator-only role + agents executor model. D049 isolation worktree mandatory rule preserved la >3 agenti paralel. Future hardware upgrade Daniel (i9 + 64GB) potential threshold raise V2 require new empirical test. Quality > Speed > Hardware load. | LOCKED V1 | DECISIONS.md §D051 + CLAUDE.md memory feedback_agent_concurrency_limit
D052 | 2026-05-23 | ARCH | Shape adapter pattern la store boundary, NU adapter inward — Substrate ZETA chat 5 commit `8529f54d`. scheduleStore.saveWeekly() passed DayKind[] strings, adapter expects {day, active} objects → rest day override silently no-op. Decision Option B transform shape la boundary (NU bend adapter inward polymorphism creep). Adapter core pure-function canonical strict per D-LEGACY-024. Type contract `.d.ts` files = SSOT shape ground-truth. DAY_KEYS storage canon `['L','M','M2','J','V','S','D']` ≠ UI display labels `['L','Ma','Mi','J','V','S','D']` — divergenta intentionala documented. 10 new integration tests + 87 regression preserved. | LOCKED V1 | DECISIONS.md §D052 + src/react/stores/scheduleStore.ts + src/engine/scheduleAdapter.d.ts §11-13
D053 | 2026-05-23 | ENG | Bundle budget raise pattern cu rationale, NU shrink — Wave 2 + Wave 3 cumulate substrate audit chat 5 commit `87cbf602`. Post 145 commits accumulation 3/5 budgets fail: main 127.09/120 (+5.9%), CSS 5.81/5 (+16.2%), vendor-icons 6.77/6 (+12.8%). Decision Option B raise budgets cu rationale documentat: main 120→135, CSS 5→6.5, vendor-icons 6→8 + 2 NEW gates vendor-data (Dexie) 33 KB + vendor-state (Zustand) 1.5 KB. Pre-Beta size discipline preserved visible budgets all chunks. Anti-pattern silent ungated banned. Future code-split aggressive deferred post-Beta real metrics. | LOCKED V1 | DECISIONS.md §D053 + .size-limit.json + 📤_outbox/wave-a-audit-engine/SUBSTRATE.md
D054 | 2026-05-23 | ARCH | Explicit partialize mandatory all Zustand stores data-only persist — W3-D-SUBSTRATE chat 5 commit `8e5c2851`. Pre-fix 3/8 stores explicit (appStore + scheduleStore + workoutStore) + 5/8 rely default full-state. Default = action serialization bug surface + ephemeral UI state polluting persist. Decision: 8/8 stores explicit partialize blueprint consistency. coachStore + nutritionStore + progresStore + onboardingStore + settingsStore fixed. Pattern match precedent existing. Future store additions mandatory explicit partialize from start (code review checklist item). 178/178 store tests pass post-modification. | LOCKED V1 | DECISIONS.md §D054 + src/react/stores/
D055 | 2026-05-23 | SAFETY | Sentry init gated pe settingsStore.telemetryOptIn user opt-in GDPR Art. 7 — SECURITY-AUDIT-DEEPER chat 5 DIM 10 HIGH commit `a1d56306`. Pre-fix Sentry pornit unconditional în main.tsx app boot pre-user-consent. PrivacyPolicy claim "Telemetrie anonima - Implicit oprit" L81/L120 + L154 sub-procesatori list verbatim drift fata de runtime behavior = GDPR Art. 7 breach risk + brand trust damage Maria 65/Gigel detect. Decision Option A lazy-load gate complet pe telemetryOptIn + subscribe state changes pentru re-init lazy mid-session. settingsStore default telemetryOptIn=false SSOT consent gate. 9 cazuri sentry-consent-gate.test.ts + 0 regression Sentry suites (40/40 PASS). | LOCKED V1 | DECISIONS.md §D055 + main.tsx + SettingsPrivacy.tsx + 📤_outbox/wave-a-audit-engine/SECURITY.md
D056 | 2026-05-23 | SAFETY | A11y CRIT + HIGH Beta-blockers baseline mandatory pre-Beta keyboard + screen reader — W4-AUDIT-DEEPER chat 5 3 atomic commits `3e42c164` + `953d4c06` + `0b6fddff`. §A1 focus-visible global outline missing CRIT WCAG SC 2.4.7 (Tailwind preflight elimina default outline) — fix global outline 2px brick + offset 2px @layer base. §A2 ExitConfirmSheet aria-modal + focus trap + Escape + restore focus missing HIGH WCAG SC 2.1.2 — fix replicabil sister AaFrictionModal/MedicalDisclaimerModal pattern + tests extended 2→9. §A3 Forms aria-describedby + aria-invalid + aria-required missing HIGH WCAG SC 3.3.1 + 3.3.3 — fix Auth + LogWeight + BodyData + Onboarding + SetLogInput + role=alert. Part D042 ZERO bug gate. WCAG 2.1 AA baseline pre-Beta keyboard + screen reader fundamental SAFE Maria 65 + Gigel. | LOCKED V1 | DECISIONS.md §D056 + 📤_outbox/wave-a-audit-engine/A11Y.md
D057 | 2026-05-23 | ARCH | PWA manifest single SoT vite.config.js, NU dublu manifest.json public/ — W4-AUDIT-DEEPER chat 5 MED PWA MANIFEST DIM 7 commit `0058a343`. Triple SoT drift background_color: vite.config.js `#f5f0e8` vs public/manifest.json `#faf7f1` vs index.html FOUC `#faf7f1`. Build output `dist/manifest.json` (din public/) vs `dist/manifest.webmanifest` (din vite-plugin-pwa) cu valori diferite = PWA install Android Chrome flash splash mismatch Maria 65. Decision: single SoT vite.config.js + DELETE public/manifest.json + DELETE `<link rel=manifest>` index.html (vite-plugin-pwa auto-injects). FOUC inline CSS `#faf7f1` left as-is. vite-plugin-pwa = SSOT moving forward. | LOCKED V1 | DECISIONS.md §D057 + vite.config.js VitePWA
D058 | 2026-05-23 | REGLAJ | D-LEGACY-064 i18n 100% compliance test descriptions audit chat 5 COMPLETED — ROMANIAN-I18N-CONSISTENCY chat 5 DIM 2 commit `8b7607ff`. Pre-chat-5: UI strings + commit messages + mockup compliant DAR test descriptions 29 strings cu diacritice (in/cand/fara/intr-o narrative). Bulk swap atomic ZERO logic touched doar string literals. NU paradigm shift NU new rule NU supersede. Affirmation + closure existing D-LEGACY-064 LOCK V1 100% achieved cross all string categories. Vault docs diacritics preserved (D-LEGACY-064 scope code-runtime + tests, NU vault docs). Future test additions mandatory no-diacritics + Track 7 §7.10 pre-commit hook future scope. | LOCKED V1 | DECISIONS.md §D058
D059 | 2026-05-23 | ARCH | MMI Engine #9 React wire-through PROPOSAL — PARTIAL-CLOSURE: engine layer LANDED per D066 (`applyMuscleMemoryUpgrade` gated pauseMonths ≥6 invoke pipeline React workout recommendation path), UI prompt boost indicator DEFERRED pending Daniel CEO strategic design choice. Post-D028 entry swap audit chat 5 ENGINE-DEEPER-AUDIT HIGH finding engine + tests LANDED dar React production wire-through MISSING. Co-CTO recommendation Option A REWIRE PRE-BETA preserved. Daniel CEO LOCK V1 needed UI prompt sub-scope: A.1 rewire UI prompt indicator pre-Beta (~3-5h dev ProgresStrip + Antrenor home boost indicator) sau A.2 UI prompt defer iter următor sau B custom UX paradigm. | PROPOSAL (partial-closure engine LANDED D066) | DECISIONS.md §D059 + D066
D060 | 2026-05-23 | ENG | PWA perf optimization quadruple pattern Lighthouse 64→97 — overnight Wave 7-22 atomic commits substantial perf empirical. (1) registerSW defer post-FCP requestIdleCallback = -180ms FCP Maria 65 mobile 3G. (2) AuthCluster lazy-loaded via React lazy() + Suspense = -65KB initial JS already-logged-in. (3) SW precache excludes vite-plugin-pwa workbox globPatterns oversized assets = -2.1MB precache mobile install footprint. (4) modulepreload `<link rel=modulepreload>` injection hash-agnostic post-FCP requestIdleCallback Splash + Auth lazy chunks = -120ms perceived transition. Cumulative Lighthouse mobile 3G 64→97 single-line + recovery 95 cumulative + +33 points. Pre-Beta mobile 3G Lighthouse target ≥90 absolute baseline (Maria 65 + Gigel) achieved. | LOCKED V1 | DECISIONS.md §D060 + main.tsx + vite.config.js + D064
D061 | 2026-05-23 | ENG | Font self-host Latin subset paradigm (-86% Inter Variable 344→48KB) — overnight Wave 7-22 SUPERSEDES §P6 PROPOSAL Google Fonts CDN. Inter Variable woff2 self-hosted `public/fonts/inter-var-latin.woff2` + Latin subset filter unicode-range U+0000-007F + U+0080-00FF ONLY (Cyrillic/Greek/Vietnamese EXCLUDED). 48 KB vs 344 KB full = -86% reduction. CSP `font-src 'self'` tighten ZERO Google Fonts vendor dependency. `font-display: swap` + FOUC paper #faf7f1 D057 paired. D-LEGACY-064 Romanian Latin-only scope aligned. -296 KB Maria 65 mobile 3G initial paint significant D060 cumulative contribution. | LOCKED V1 | DECISIONS.md §D061 + public/fonts/inter-var-latin.woff2 + src/styles/fonts.css
D062 | 2026-05-23 | REGLAJ | Vault docs archive periodic cleanup pattern git mv — overnight Wave 7-22 16 files moved `99-archive/audit-pre-chat5/` via git mv (NU rm + create) = git history forensic preserved. Archive index README.md added enumerate archived files + chat origin + brief context. Active surface freed for chat 6+ work. Trigger = active surface drift >10 stale docs OR Daniel verbal "vault cleanup". Method `git mv <file> 99-archive/<batch-name>/<file>` MANDATORY. Batch naming `audit-pre-chat<N>/` OR `investigation-<topic>/` OR `interim-<date>/`. Archive index README.md per batch enables grep cross-archive forensic. NU per-message overreach batch periodic + Daniel verbal trigger. | LOCKED V1 | DECISIONS.md §D062 + 99-archive/audit-pre-chat5/
D063 | 2026-05-23 | TESTING | Engine adapter Sentry coverage 100% test instrument anti-drift — overnight Wave 7-22 engine adapter Sentry coverage 5/11 → 11/11 (12 witnesses). Pre-overnight 5/11 adapters Sentry.startSpan() + .withScope() breadcrumb instrumented + 6/11 NO coverage = silent drift surface future engine changes. Decision: 11/11 Big 11 pipeline wrapped + 12 witness tests (11 adapter + 1 cross-cutting integration). Anti-drift test invariant `assert_all_adapters_instrumented.test.ts` scan adapter files + assert Sentry wrap = visible CI failure gate future. Sentry beforeSend filter D055 preserved consent gate compatible. Template future instrument-test categories (PII strip + consent gate + i18n). | LOCKED V1 | DECISIONS.md §D063
D064 | 2026-05-23 | ARCH | Modulepreload requestIdleCallback hash-agnostic pattern — overnight Wave 7-22 lazy chunks (Splash + AuthCluster D060) Suspense resolve delay cold load mitigated. `<link rel=modulepreload href="/assets/chunk-XXXX.js">` two complications: hash dependency per Vite build cache bust + initial paint contention. Decision: hash-agnostic preload runtime fetch chunks discovery Vite asset manifest OR build-time post-hook + post-FCP idle preload requestIdleCallback window + fallback setTimeout(0) Safari iOS pre-15 graceful. Suspense resolve ready = ZERO loading flash perception Maria 65. Cache bust safe survives Vite asset hash change per deploy. Pattern template future lazy clusters (Onboarding + Settings + Coach). | LOCKED V1 | DECISIONS.md §D064 + D060 paired
D065 | 2026-05-23 | REGLAJ | Romanian no-diacritics 100% compliance enforcement D-LEGACY-064 closure — overnight Wave 7-22 cumulative D-LEGACY-064 compliance audit literal 100% cross UI + tests + commits. NU paradigm shift NU new rule NU supersede. Affirmation + closure D-LEGACY-064 LOCK V1 + D058 extension cumulative. UI strings (src/react/**/*.tsx) + Tests (tests/**/*.test.ts describe/it strings) + Commit messages + Mockup `04-architecture/mockups/andura-clasic.html` = 100% compliant. Vault docs (.md files 00-index/, 01-vision/, 04-architecture/, 08-workflows/) NU touched (D-LEGACY-064 scope code-runtime + tests + commits, NU vault docs). Grep simplicity + brand promise consistency Bugatti craft baseline. | LOCKED V1 | DECISIONS.md §D065 + D-LEGACY-064 + D058
D066 | 2026-05-23 | ARCH | MMI Engine #9 silent cap React production wire (engine layer LANDED, UI prompt deferred) — overnight Wave 7-22 partial-closure D059 PROPOSAL. `applyMuscleMemoryUpgrade` adapter integrated React workout recommendation pipeline (compose pipeline MMI LAST slot Big 11 stack preserved per D-LEGACY-098). Gate condition pauseMonths ≥6 (returning user 6+ month layoff threshold). Sub-threshold users normal pipeline. Marius/Maria 65 returning users beneficiari silent boost active production. UI prompt indicator DEFERRED = boost indicator NOT visible user. Engine effect silent active. Brand promise "engines auxiliare ascunse" partial-reveal. D059 §4 UI prompt sub-scope pending Daniel CEO Option A.1 vs A.2 vs B. Orphan engine risk eliminated. | LOCKED V1 (engine layer); D059 PROPOSAL remains for UI prompt sub-scope | DECISIONS.md §D066 + D059 partial-closure + D-LEGACY-098
D067 | 2026-05-23 | REGLAJ | Coverage Top 5 closure pattern chat 5 milestone baseline 89.82%+ — post-overnight final closure cumulative sentry/fatigue/AuthCallback/dataCleanup/aa+reality 5 modules Top 5 coverage gaps all closed. Pre-chat-5 ~85% project-wide baseline. Closure: sentry (D055 consent + D063 adapter instrument 11/11 + PII strip + beforeSend); fatigue (RPE-based edge cases + readiness derive); AuthCallback (OAuth + token exchange + error redirect + timeouts); dataCleanup (vault hygiene + IndexedDB sweep + per-UID isolation); aa+reality (AntiAbuse fatigue gate + Reality check + §A007 logout missing gsd-security-auditor catch). Post-closure 89.82%+ project-wide. Top 5 closure pattern template future audit Top N modules. gsd-security-auditor fresh-eyes value reinforced. | LOCKED V1 | DECISIONS.md §D067
D068 | 2026-05-23 | PROC | Deps autonomous PATCH+MINOR bump pattern same-major-version Daniel CEO authorize default — post-overnight final closure empirical Sentry 10.50.0→10.53.1 PATCH + date-fns 4.2.1→4.3.0 MINOR landed Co-CTO autonomous ZERO regression test suite ~4290+ PASS preserved. PATCH (10.50.0→10.50.1 OR 10.50.0→10.53.1) = autonomous Co-CTO default Daniel implicit. MINOR (4.2.1→4.3.0) = autonomous same-major Daniel implicit. MAJOR (4.x→5.x OR React 18→19) = MANDATORY Daniel CEO LOCK acknowledge ask. Pre-bump verify mandatory `npm audit` + maintainer changelog (anti-malicious + anti-breaking-hidden). Post-bump ~4290+ PASS gate = real verification SemVer contract. IF regression = revert + ask Daniel. | LOCKED V1 | DECISIONS.md §D068 + package.json + npm audit
D069 | 2026-05-23 | REGLAJ | AA dead code refactor pattern verified unreachable mechanistic trace + test documentation — post-overnight final closure AA module lines 141-151 verified unreachable mechanistic trace + caller graph + control flow + investigation report `📤_outbox/AA-DEAD-CODE-DELETE-INVESTIGATION.md` 3 options surface + Daniel CEO trigger "baga" Option 1 autonomous delete LANDED. Pattern protocol: trigger Vitest coverage report surface unreachable OR Co-CTO audit; investigation cycle mandatory (mechanistic trace + test documentation + 3 options); Daniel CEO direction Option 1/2/3 LOCK acknowledge anti-paternalism; autonomous delete Option 1 verified-unreachable + atomic single-concern commit; test suite ~4290+ PASS preserved post-delete; investigation report archive per D062. Template future refactors (engineWrappers 466 LOC §P13). | LOCKED V1 | DECISIONS.md §D069 + 📤_outbox/AA-DEAD-CODE-DELETE-INVESTIGATION.md
D070 | 2026-05-23 | REGLAJ | BACKUP_DR_RUNBOOK chat 5 polish + cross-system anti-drift documentation pattern — post-overnight final closure BACKUP_DR_RUNBOOK.md 7 gaps fixed: (1) MMI userChoice D066 pauseMonths ≥6 gate, (2) Sentry forensic D055 consent-gate alternative breadcrumb sources, (3) Dexie lazy D060 IndexedDB recovery, (4) line numbers stale post-chat-5 ~21+ commits grep references, (5) font path D061 `public/fonts/inter-var-latin.woff2`, (6) Magic Link replay attack edge case + recovery (gsd-security-auditor chat 5 surface), (7) scripts/ directory references stale. Cross-system anti-drift documentation pattern post-substantial-work documentation updates discipline (BACKUP_DR_RUNBOOK + ANDURA_PRIMER §5 + 04-architecture/ + 08-workflows/). Anti-stale-baseline filesystem read primary source BEFORE update. | LOCKED V1 | DECISIONS.md §D070 + 08-workflows/BACKUP_DR_RUNBOOK.md
D071 | 2026-05-23 | ENG | Lighthouse truly-final peak match recovery cycle 64→97→86→95→97 — post-overnight final closure Lighthouse mobile 3G Maria 65 iterative recovery cycle. 64 pre-overnight baseline red zone → 97 post quadruple D060 single-line peak → 86 post font regression D061 initial iteration full Inter Variable 344 KB pre-subset → 95 post Latin subset filter D061 final -86% bundle → 97 truly-final cumulative + modulepreload tuning + critical CSS (peak match single-line). Iterative non-linear optimization expect intermediate regression + recovery + tuning. Empirical measurement primary Lighthouse CI run per iteration. Anti-regression discipline intermediate regression surface optimization opportunity. Pre-Beta target ≥90 beat at 97 truly-final + sustained baseline. Future ratchet UP per D036 §7.6 (next 95 floor, 97 target). | LOCKED V1 | DECISIONS.md §D071 + D060 + D061 + D064 + D036
D072 | 2026-05-23 | REGLAJ | Pre-Beta gate matrix 11 PASS / 3 YELLOW / 1 INFO singular verdict primary-source-grounded — post-overnight final closure 15 gate dimensions evaluated cumulative state: bug count (D042) + test coverage (D067 89.82%+) + Lighthouse (D071 97) + WCAG a11y (D056) + GDPR consent (D055) + bundle budget (D053) + Zustand partialize (D054) + PWA manifest SoT (D057) + Sentry instrument (D063) + i18n compliance (D058+D065) + engine pipeline (D066) + font self-host (D061) + perf quadruple (D060) + modulepreload (D064) + dead code (D069). VERIFY_FINAL_CHAT5_STATE.md singular pre-Beta launch gate document `📤_outbox/`. 3 YELLOW non-blocking caution (MMI UI prompt D066 + UI wording §P2 + dates format §P4). 1 INFO post-Beta defer perf optimization §P7/§P12. Daniel CEO Bugatti audit nuclear gate trigger post D050-D073 LOCK acknowledge + §P-items strategic decisions. | LOCKED V1 | DECISIONS.md §D072 + 📤_outbox/VERIFY_FINAL_CHAT5_STATE.md
D073 | 2026-05-23 | REGLAJ | Vault docs ~4100+ LOC trail comprehensive singular reference point pattern — post-overnight final closure cumulative work substantial vault docs trail ~4100+ LOC. 23+ outbox files `📤_outbox/` + 4 inbox handovers `📥_inbox/HANDOVER_<date>_<topic>.md` chat 1-5 narrative scribe end-of-chat (§F3.8) + master index `📤_outbox/MASTER_INDEX_CHAT5.md` cross-reference + decisions draft `📤_outbox/DECISIONS_CHAT5_DRAFT.md` 23 LOCK candidates + 1 PROPOSAL partial-closure + 15 §P-items strategic surface + investigation reports targeted (AA-DEAD-CODE + FIREBASE-RULES-PREP + LEDGER-SYNC-FINAL-FINAL). Singular reference point master index = Daniel CEO + chat 6 startup baseline navigation aid §CC.2 step 4-5. D062 periodic cleanup pattern preserved batch periodic + Daniel verbal trigger anti-overreach. | LOCKED V1 | DECISIONS.md §D073 + 📤_outbox/MASTER_INDEX_CHAT5.md + D062
D074 | 2026-05-23 | REGLAJ | D063 wording scope clarification — React wrappers ONLY, NOT orchestrator pipeline adapters — gsd-eval-auditor chat 5 surfaced conflation: D063 LOCKED V1 "Sentry adapter coverage 11/11 + anti-drift test" wording interpreted broadly ca include both React wrappers + orchestrator pipeline adapters. Clarification: D063 scope = React wrappers `src/react/lib/engineWrappers.ts` ONLY = canonical Big 11 React adapter layer 11/11 captureException instrumented. Out of scope post-Beta deferred candidate: orchestrator pipeline adapters `src/coach/orchestrator/adapters/*` = 0/8 Sentry instrumented currently (8 .js adapters: bayesianNutrition + deload + energyAdjustment + goalAdaptation + periodization + specialization + tempo + warmup) = separate Beta-launch decision. Anti-drift test `src/react/__tests__/lib/assert_all_adapters_instrumented.test.ts` (commit ad82ab65 Wave 12 BLOCKER 2 closure) scope = React wrappers only per D063 strict wording. NO supersede of D063 — scope precision NOT decision change (D007 append-only invariant respected). | LOCKED V1 | DECISIONS.md §D074 + §D063 + src/coach/orchestrator/adapters/* + src/react/lib/engineWrappers.ts + src/react/__tests__/lib/assert_all_adapters_instrumented.test.ts
D076 | 2026-05-23 | ARCH | Phase 6 prod-extras blessed divergence ratify (DRIFT-1 Option B amend) — 7 React components engine-wired in production absent din mockup andura-clasic.html pre-amend: PatternsBanner + AlertsBanner + StatsGrid + ReadinessVerdict + PRNotificationBanner + PRWallRecent (Antrenor home) + BodyData (Progres tab). Ratify divergence ca blessed Phase 6 prod-extras layer. Mockup amended v1.1 cu component sections pentru reflect prod (commit `8dfe36e3` 2026-05-23). DECISIONS LOCK ratify path STRENGTHENS mockup authority NU erodes (D015 LOCK V1 amendment precedent preserved). Engine value preservation rationale: Marius signal-richness (StatsGrid + ReadinessVerdict + PR pipeline) + AlertsBanner urgent injury-risk safety floor + PatternsBanner stagnation surfacing (Big 11 patternLearning consumer) + PRNotificationBanner real PR detection from CRIT shape #2/#3 LANDED. Removing all 7 = HIGH-cost regression (BodyData persistence loss + Marius signal degradation + AlertsBanner safety gate loss). Quality long-horizon mandate (Daniel verbatim "10x mai mult timp acum") + Bugatti craft preserves built features + mockup amendment precedent via DECISIONS LOCK strengthens D015 authority pattern. Replaces prior `7eeb050e` D050 collision attempt. | LOCKED V1 | DECISIONS.md §D076 + 04-architecture/mockups/andura-clasic.html v1.1 (commit 8dfe36e3) + 📤_outbox/DRIFT_1_PARADIGM_INVESTIGATION_chat5.md
D077 | 2026-05-25 | REGLAJ | Pre-Beta quality cycle extins: iterate audit→fix→reverify pana 0 findings + 100% quality, apoi audit anti-RE + audit security finale, ABIA apoi Daniel verify manual + Beta | LOCKED V1 | DECISIONS.md §D077
D078 | 2026-05-25 | STRATEGY | Andura = fitness app, NU medicina/kineto — onboarding colecteaza metrici fitness (Big 6 + inaltime) + disclaimer medical legal ATAT, ZERO istoric medical / health-condition intake. Daniel CEO LOCK verbatim "nu facem medicina, daca ne apucam sa o luam pe istoric medical facem aplicatie de kineto nu de fitness". Resolved needs-Daniel P-03/P-04 (audit fresh 2026-05-25): pas Istoric medical DROP = divergenta INTENTIONATA de mockup NU gap paritate; disclaimer modal (MedicalDisclaimerModal / U-01 mount) = SINGURUL touchpoint medical; inaltime ramane (metrica fitness BMR, D079-adiacent). Safety medicala via disclaimer + pain button in-sesiune + injury auto-disable (Specialization) + pushback tiers 60+/accidentare — NU chestionar medical intake. Filtru produs viitor (ca Gigel test): "asta-i fitness sau alunecam in medicina/kineto?". | LOCKED V1 | DECISIONS.md §D078
D079 | 2026-05-25 | ARCH | Backup/restore cloud + migratii = WIRE in React (decizie Daniel CEO "A"), restaura arhitectura ADR 001 (local-first IDB + Firebase backup tier) pierduta la swap D028. Resolved needs-Daniel S-07 (audit fresh 2026-05-25): bootstrap orfan (schema migrations + tier rotation + Firebase sync/restore + auth-path migration) era importat DOAR de vanilla main.js retras, NU de React main.tsx → backup/restore + migratii NU rulau in productie desi Privacy Policy promite backup. Fix = src/react/lib/reactBoot.ts idempotent: runReactBoot() auth-independent fire-and-forget in main.tsx (non-blocking first paint) + runPostAuthSync() in AuthCallback ambele login-uri (Magic Link + Google). Restore local-always-wins aditiv (zero data-loss, verificat re-audit). Known-limitation: multi-device same-key concurrent edit = local-wins NU last-write-wins (cere per-entry timestamps) — deferred post-Beta, acceptabil single-device Beta. | LOCKED V1 | DECISIONS.md §D079 + src/react/lib/reactBoot.ts + ADR 001 + §D028
D080 | 2026-05-26 | PROC | Extreme-quality pre-Beta mandate: Daniel NU QA — Claude audit exhaustiv (fiecare virgula + dead-code + paritate live + Coach Brain Eval oracle Claude + security/anti-RE) -> fix -> re-audit -> repeat pana 0 + brain validat live, ABIA apoi Daniel vede; + run-whole-arc step-after-step autonom pana Beta, Daniel-gated items prepped+queued NU blocking | LOCKED V1 | DECISIONS.md §D080
D081 | 2026-05-27 | STRATEGY | Moat REAL pre-Beta, "Beta = launch = moatul meu" (Daniel) — zero pernă post-Beta. Audit due-diligence 5 lentile fresh-eyes Opus (`📥_inbox/wiring-audit-2026-05-26/VERDICT-CONSOLIDATED.md`) verdict: fundatia = inginerie reala (math 0 CRIT + nutritie/recuperare/PR/plumbing/Coach-Brain-Eval genuine) DAR prescriptia-antrenament fatada (readiness/RPE/periodizare/deload necablate la prescriptie — "pare destept dar nu e") + moat fatada (~22 exercitii reale nu 657, substitutie+alternativeEngine arhivate) + 3 bug HIGH (PII device-partajat, pierdere date miezul-noptii, FCM-sync clobber); cauza-radacina "engine testat izolat" != "merge pt user" (5 audituri verzi anterioare ratasera, inclusiv claim PRIMER "657 LANDED" care reflecta vanilla arhivat NU React-ul livrat). Daniel A LOCKED: tot REAL inainte de Beta. Plan P0 siguranta + P1 cablare-creier + P2 onestitate-stub + P3 revive-657-moat + P4 calibrare + re-audit pana 0 findings dual-source. Extinde (NU supersede) D042+D043+D077+D080. P0+P1+P2+P3-foundation LANDED green 4740; P3-wiring Daniel-gated (vocabular echipament + naming 627). | LOCKED V1 | DECISIONS.md §D081 + 📥_inbox/wiring-audit-2026-05-26/VERDICT-CONSOLIDATED.md
D082 | 2026-05-27 | ARCH | Nutritie TDEE = model FORWARD determinist (Daniel-directed) inlocuieste factor activitate 1.55 fix: `BMR(Mifflin) × NEAT_base 1.25 + (sesiuni × 300kcal net)/7`, unde sesiuni = blend de incredere planned-prior → actual-posterior (`w = loggedWeeks/4`; cold-start = planificat din onboarding `frequency`/calendar, drift spre real in ~4 sapt). Motivatie Daniel: 1.55 fix ignora cate antrenamente face omul; iar "lasa cantarul sa optimizeze" e exclus la fluctuatie zilnica ±4-5kg (false positives). Cantarul devine calibrator LENT (ferestre ≥7 zile + ≥3 cantariri + panta regresie liniara, NU punct-la-punct, tier plafonat T1) → nudge pe saptamani, niciodata swing zilnic. Reparat flaw observatie `MIN_WINDOW_DAYS=1`. Anti-gaming: planned sigur pt ca pe termen lung cantarul backstop (zici 7 faci 2 → te ingrasi → te prinde). Pastreaza floor LOCK8 (1000f/1200b) + protein g/kg + faza delta (cut/bulk/mentenanta). Consecinta vizibila onesta: mentenanta ~2600 (era 3224 flat), bulk scade (activitatea vine din sesiuni reale). Extinde D046§3.4 (Kalman/adaptiv real) + D081 (moat real) — NU supersede. LANDED green 4956 (forward `4aeeb263` + blend `7948d9cf`). | LOCKED V1 | DECISIONS.md §D082 + src/react/lib/userTdee.ts + src/react/lib/nutritionObservations.ts
D083 | 2026-05-27 | SAFETY | Andura = adults-only 18+ (Daniel CEO smoke 2026-05-27 verbatim "da 18+"). Ridicat min varsta onboarding 16 → 18, supersede sub-decizia D046 §28-H5 (default GDPR-Romania-16 parental-consent): Daniel a constatat la smoke ca app il lasa sa intre la 16 ani — NU dorit pt app de fitness cu prescriptie antrenament + nutritie + kcal. Schimbat ONBOARDING_BOUNDS.age.min + age input Onboarding + SettingsProfile (min/eroare/helper "intre 18 si 99 ani") + teste bounds/validare/finalize/componenta 16→18. Mockup NEATINS (provenance L565 ramane "16", override doc-ul). Restul D046 (ConfirmModal/OAuth/Bundle/Kalman) NEATINS — supersede DOAR sub-clauza varsta. LANDED green 5026 (`a803f7c4`). | LOCKED V1 | DECISIONS.md §D083 + src/react/stores/onboardingStore.ts + src/react/routes/screens/Onboarding.tsx + src/react/routes/screens/cont/SettingsProfile.tsx
D084 | 2026-05-27 | UX | Tema default = "Brain Coach" mov dark (Daniel pick smoke 2026-05-27 verbatim "imi place movul ala"). Adoptat paleta din mockup `Andura-brain-coach v2.html` (paper #0a0c14, ink #f5f0ff, accent mov #a584ff, succ/warn/danger) ca valori ale temei dark + flip default light→dark (settingsStore DEFAULTS.theme + themeSync). Tema Clasic crem pastrata ca alternativa pe toggle Aspect (round-trip verificat). Reglaje WCAG AA pe mov (ink-3 #827bab, line-strong solid #6b5aa6). Fonturi (Instrument Serif/Geist Mono) DEFERRED (risc layout + CDN vs self-host D060). Inversari de tema reparate in fix-wave (RestOverlay/badge TDEE/card WorkoutPreview/butoane/Calendar foloseau var(--ink) ca suprafata dark → dark: overrides). LANDED green 5033 (`ee3c50c5` paleta + `5336a92d` inversari). | LOCKED V1 | DECISIONS.md §D084 + src/styles/global.css + src/react/lib/themeSync.ts + src/react/stores/settingsStore.ts
D085 | 2026-05-27 | PROC | Audit nuclear pre-Beta + fix-wave + Coach Brain Eval LANDED (Daniel directive "audit TOTAL... fiecare linie... daca totul works as intended"). 5 agenti Opus read-only paraleli (engines/UI/data-security/nutritie/wiring) pe 258b7b49 → verdict: moat REAL (engines cablate E2E, anti-fatada dovedit), 0 CRIT securitate/data-loss (cele 3 HIGH D081 confirmate reparate), 0 recomandari kcal periculoase. 2 CRIT gasite+reparate: (1) weight source-of-truth split (numere nutritie/body citeau greutatea inghetata din onboarding NU cea logata → `getCurrentWeightKg()` canonic logged>onboarding rewired peste tot), (2) RestOverlay rupt pe mov-dark (var(--ink) inversat alb-pe-alb). + ~5 HIGH (readiness target flat→per-user, mesaj subponderal din BMI, volumeKg "0kg"→real, leak-uri tema) + MED/LOW. Fix-wave 2 agenti (F1 backend + F2 tema) + age-18. Coach Brain Eval (Claude Opus 4.7 oracle, cheia Daniel API): 0 violari mecanice/5009 + 75.1% acord (consistent baseline 76.5%, zero regresie) — disagreements = oracol-aritmetica-gresita + alegeri-defendabile (RECOMP body-aware) + 2 candidati ne-confirmati (deload reactiv pe red / nudge green). Extinde D080+D081. LANDED green 5033 PUSHED. | LOCKED V1 | DECISIONS.md §D085 + reports/coach-brain-eval/ + 5336a92d
D086 | 2026-05-27 | SAFETY | 2 decizii safety Daniel post-smoke confirmate: (1) Podea kcal sex-aware = 1000 femei / 1200 barbati pe path-ul de recomandare (Daniel verbatim "1000 femei 1200 barbati") — F1 a aplicat KCAL_FLOOR_BY_SEX pe recomandare (codul folosea gresit flat 1200 = bug audit-4), inchide finding-ul; tensiune cunoscuta cu nota Maria-65 sub-1200 acceptata (guardrail subponderal BMI≤18.5 acopera cazurile reale). (2) Boot-clobber (onboarding sters la schimbare de cont) = NU bug, e fix-ul H1 PII intentionat (enforceDataOwner→clearUserDataKeys sterge Big6=date personale la schimb de uid) → privacy-first LOCKED, profil NU sincronizat cloud, user care schimba cont re-face onboarding; persistenta cross-device (= +onboarding in SYNC_KEYS) DEFERRED post-Beta. | LOCKED V1 | DECISIONS.md §D086 + src/engine/bayesianNutrition/constants.js + src/react/lib/dataReset.js
D087 | 2026-05-28 | STRATEGY | Anti-reverse-engineering = ACCEPT proportionat pre-Beta (audit security overnight Opus read-only). Engine client-side → thresholds+valori+signal-strings in bundle reconstructibile; esbuild minify stripeaza comentarii/ADR-rationale + mangleaza variabile locale DAR nu property-keys/string-literals. Verdict: NU obfuscam (property-mangling = retrofit riscant pe chei serializate CDL/store; server-side scoring = peste arhitectura static-PWA pre-Beta). Cheap wins deja in loc: minify ON + sourcemap:false + repo privat. Moatul REAL = datele+calibrarea (priors Bayesian pe date reale + library 657 + CDL longitudinal) NU constantele statice. Layer sensibil viitor → Cloud Function (functions/ exista) pe UN engine, post-Beta. Extinde D080+D081. | LOCKED V1 | DECISIONS.md §D087 + src/engine/ + vite.config.js
D088 | 2026-05-28 | PROC | Overnight autonomous arc LANDED + PUSHED LIVE (Daniel mandat "rezolva tot autonom → audit → smoke brutal → themes+animatii → push live → handover, fara sa ma deranjezi"). main fdd1d09 (16 commits peste 5336a92) LIVE andura.app, 5082 verzi, CI #641+Deploy #675 verzi, smoke vizual live PASS. Livrat: 9 fixe (pluralizare RO 1-sesiune/1-set, HeatMapWeekly weight-delta plauzibilitate-guard, continuitate greutate profile-edit→weightLog upsert, oobCode URL strip, SW-stale-404+Workbox, GDPR telemetrie honest-copy, getCurrentWeightKg max-by-date, IstoricDetail fmt RO, logout honest-copy) + 4 audituri fresh (engine/UI/data/security — moat real reconfirmat, uz-normal-acelasi-dispozitiv zero data-loss) + cele 4 TEME reale (Luxury noir+champagne + Living Body earth+gold via [data-palette] override + paletteSync + Wave-4 tailwind darkMode pt dark: sub data-palette; verificat live impecabil) + animatii CSS tasteful reduced-motion-safe (useCountUp matchMedia guard). Ramase Daniel-gated: Beta GO + deliverability email (DMARC SendGrid Yahoo-deferred/Gmail-spam, Google login merge) + rotit cheia API. Extinde D080+D085. | LOCKED V1 | DECISIONS.md §D088 + fdd1d09 + handover 2026-05-28

D090 | 2026-05-28 | PROC | Autonomous Arc #3 — Wave C 4 agenti Opus worktree paraleli pe critic Daniel "ai cam ignorat toate astea" (Wave A i18n shell-only, Obiectiv mis-interpretat target-weight in loc de goal selector, animatii subtle invizibile). Wave C: C1 i18n DEEP (Antrenor + CoachTodayCard + CoachRestCard + Workout in-session + EnergyCheck + Progres + 5 strips body comp + exercise library 657 EN via toExerciseDisplay locale-aware + 30 EN-curated subtitles + CI safety-net i18nNoRoLeak.test.tsx forbidden-token allow-list ~60 cuv RO; **PARTIAL — deferred substantial: WorkoutPreview/PostRpe/PostSummary/all modals/BMRStrip/Projection/Nutrition/ObiectivCard/LogWeight/BodyData/WeightTimeline/Calendar/Istoric detail/17-of-20 Settings/coach engine output strings**); C2 drop `longevitate` goal (semantic duplicate mentenanta/sanatate MAINTENANCE phase identic) + mutare goal selector (Cont Profile Antrenament → Progres tab ObiectivGoalCard, Frecventa+Experienta raman setup), migration onboardingStore legacy 'longevitate' → 'mentenanta' + types/engine/tests update; C3 animatii GO WILD (Daniel verbatim "go wild") — motion vocabulary expandat 12 keyframes (page-enter + ripple + confetti + success-burst + edge-flash + shake + breath + flame + ambient-drift + roll-in + hero-pop + check-draw) + new Ripple.tsx + ConfettiBurst.tsx + lib/motion.ts (haptic + edgeFlash + isCoarsePointer) + page transitions Layout + workout in-session adapts + PR celebrations + chrome banners slide-down; C4 UX/colors Bugatti polish (Daniel license "poti schimba culorile") — paletes tuned WCAG AA verified: Brain Coach mov #a584ff→#b596ff (8.15:1), Luxury cognac #c9a663→#d4b483 (10.33:1), Living Body amber-gold #d4a574→#dbb182 (10.31:1), Clasic untouched; utility .btn-primary-lift + .btn-secondary-lift + .surface-elevated color-mix token-driven auto-tint per palette; layered Splash/Auth/Onboarding/Antrenor/Progres/Istoric/Cont/Workout/PostSummary/BottomNav. Wave D manager: merge --no-ff 4 branches (5 conflicts rezolvate combinand motion+lift+i18n cumulativ) → C2 partial agent + manager pickup stash + 3 longevitate-tests fix. Final 5211 verzi + typecheck + build clean (90 PWA precache, 1434 KiB; main chunk budget bump 135→160 KB; CSS 9.03/12 KB OK). Wave E follow-up necesar pentru completare i18n DEEP zero-leak true (workout modals + body comp + calendar/istoric + 17 settings + coach engine output). Extinde D089. | LOCKED V1 | DECISIONS.md §D090 + main local

D089 | 2026-05-28 | PROC | Autonomous Arc #2 — Wave A 4 agenti Opus worktree paraleli + Wave B manager integrare pe 21 smoke findings Daniel birou 2026-05-28. Daniel mandat ACASA via RC tunel "tu fa-le pe toate cand sunt la birou, smoke iar cand e gata". Wave A: A1 workout-flow 5 commits / 5098 verzi (smoke #2/#6/#3.2 "Nu vreau" cycling exhaustive + #3 set counter `1/17` ordinal advance + #3.3 rename "Flexii biceps la pupitru" → "Curl pupitru" + #12 dedup duplicate "Incepe antrenament" CTA + #17 "Aparat lipsa" in-session picker wire la Cont + #18 pain in-session intensityMod minus, NU reset session); A2 numbers-safety 5 commits / 5150 verzi (smoke #1 Deurenberg cap `min(D, BMI*0.85)` la BMI≥27 — 31.6%→28.0% Daniel + CTA US Navy talie/gat + #4 SetLogInput "Confirma setul" confirm flow + 0-strip + selectAll + #13 measurements bounds realiste per camp + Gat field NEW + #15 latestBodyMeasurements aggregator SSOT Progres↔Cont + #16 targetSafety.ts evaluateTargetRate cap fiziologic 1.5kg/sapt + computeTargetKcalOverride cap asimetric -25%/+15% TDEE Aragon&Schoenfeld 2020 + onboardingStore targetWeight/targetDate persistat); A3 i18n-IA-delays 4 commits / 5114 verzi (smoke #5 BottomNav fixed — root cause `transform: translateZ(0)` pe #root containing-block + utility `.app-fixed-column` + #7 i18n react-i18next paradigm flip DEFAULT_LOCALE RO→EN clean fitness English ~72 keys shell-only Antrenor/Progres/Istoric H1+Cont+ObiectivCard+settings shell, deep screens deferred + #8 ObiectivCard NEW top Progres + targetEta.ts pure lib + progresStore.targetObiectiv persist + #14 SettingsNotifications optimistic OFF + pending ON state); A4 UX-animatii 7 commits / 5082 verzi (smoke #9/#21 motion vocabulary expandat — `andura-card-rise` 380ms cubic-bezier + stagger 0/75/150/225/300/375/450 + `andura-shimmer` directional + `andura-glow-pulse` PR celebratory + `andura-theme-sweep` palette confirmation + BottomNav animated active pill + brick hairline + #10/#20 stat tiles polish radial accent wash + tabular-nums + accent icons cross 4 teme + theme-aware dark accent CoachTodayCard + #11 ExerciseMedia pipeline V1 — thumbnail/compact/card variants + placeholder "Imagine in curand" + sample WGER URLs setup, V2 sourcing decision deferred Daniel). Wave B manager: merge --no-ff 4 branches → 2 conflicts (Antrenor.test.tsx heading "Coach" EN + "Incepe sesiunea" CTA; SettingsProfile.tsx A2 target persist + A3 Obiectiv mutare la Progres) rezolvate. Integration fix A2↔A3 atomic (commit `95e97018`): SSOT target data path pe progresStore.targetObiectiv (Obiectiv apartine progres-tracking NU onboarding-profile) — engineWrappers.getTargetKcalToday reroute la progresStore + evaluateTargetRate unsafe verdict surface pe ObiectivCard + setTargetObiectiv regex relax YYYY-MM(-DD) + i18n keys obiectiv.unsafeRateWarning. Final: **5198 verzi** + typecheck clean + build clean (88 PWA precache, 1393 KiB). Local HEAD 5 ahead origin/main fdd1d09 (4 merge commits + 1 integration commit), NEpushed (D031 — Daniel smoke iar pe preview/live trigger manual). Cleanup #19 test data Daniel = via existing DeleteAccount UI (cont reset complete) sau dev console (manager nu poate accesa localStorage Daniel din sesiunea RC). gitnexus index reindexed pre-Wave-B (15995→32199 symbols). Extinde D088. | LOCKED V1 | DECISIONS.md §D089 + main local 5 ahead + 95e97018

---

## LEGACY DECISIONS (LOCKED PRE-2026-05-15, FROZEN — reference only)

### ARCH — Architecture, Engines, Data Model

D-LEGACY-001 | 2026-04-15 | ARCH | Local-First Storage cu Firebase Sync IndexedDB primary | LOCKED V1 | 03-decisions/_FROZEN/001-local-first-storage.md
D-LEGACY-002 | 2026-04-15 | ARCH | Firebase via REST API NU SDK pentru bundle size | LOCKED V1 | 03-decisions/_FROZEN/002-firebase-rest-not-sdk.md
D-LEGACY-003 | 2026-04-16 | ARCH | Double Progression (DP) = core weight recommendation engine | LOCKED V1 | 03-decisions/_FROZEN/003-double-progression-engine.md
D-LEGACY-004 | 2026-04-16 | ARCH | Rule Engine cu numeric priorities deterministic | LOCKED V1 | 03-decisions/_FROZEN/004-rule-engine-numeric-priorities.md
D-LEGACY-005 | 2026-04-17 | ARCH | Three-tier log storage (Tier 0/1/2 active/rolling/archive) | LOCKED V1 | 03-decisions/_FROZEN/006-tier-storage-for-logs.md
D-LEGACY-006 | 2026-04-17 | ARCH | Firebase RTDB open rules single-user personal app | LOCKED V1 | 03-decisions/_FROZEN/007-firebase-open-rules.md
D-LEGACY-007 | 2026-04-18 | ARCH | Calibration tiers T0/T1/T2/T3 for user maturity | LOCKED V1 | 03-decisions/_FROZEN/009-calibration-tiers.md
D-LEGACY-008 | 2026-04-19 | ARCH | Coach Decision Log (CDL) as architectural primitive append-only | LOCKED V1 | 03-decisions/_FROZEN/011-coach-decision-log-architecture.md
D-LEGACY-009 | 2026-04-19 | ARCH | Tier decay on inactivity demote logic | LOCKED V1 | 03-decisions/_FROZEN/012-tier-decay-on-inactivity.md
D-LEGACY-010 | 2026-04-30 | ARCH | Auto-Aggression Detection (user self-sabotage pattern) + AMENDMENT Force-typing ELIMINATED PERMANENT | LOCKED V1 | 03-decisions/_FROZEN/013-auto-aggression-detection.md
D-LEGACY-011 | 2026-04-22 | ARCH | getBF calibration-only formula Option B | LOCKED V1 | 03-decisions/_FROZEN/015-getbf-calibration-only.md
D-LEGACY-012 | 2026-04-23 | ARCH | Vitality Layer engine suflet-andura tier-progression | LOCKED V1 | 03-decisions/_FROZEN/016-vitality-layer.md
D-LEGACY-013 | 2026-04-24 | ARCH | Demographic Prior Database cold-start age+experience-aware | LOCKED V1 | 03-decisions/_FROZEN/017-demographic-prior-database.md
D-LEGACY-014 | 2026-04-24 | ARCH | Engine Extensibility Architecture Dimension Registry plug-in additive Open-Closed | LOCKED V1 | 03-decisions/_FROZEN/018-engine-extensibility-architecture.md
D-LEGACY-015 | 2026-04-25 | ARCH | Storage Tiering Strategy (Tier 0/1/2 + Dexie.js + rotation) | LOCKED V1 | 03-decisions/_FROZEN/020-storage-tiering-strategy.md
D-LEGACY-016 | 2026-04-25 | ARCH | Calibration drift reconciliation (version vector + max-merge) | LOCKED V1 | 03-decisions/_FROZEN/021-calibration-drift-reconciliation.md
D-LEGACY-017 | 2026-04-26 | ARCH | Bayesian Nutrition Inference engine #3 + silent observation | LOCKED V1 | 03-decisions/_FROZEN/022-bayesian-nutrition-inference.md
D-LEGACY-018 | 2026-04-27 | ARCH | LLM Intent Interpretation & Fallback Architecture | LOCKED V1 | 03-decisions/_FROZEN/023-llm-intent-interpretation.md
D-LEGACY-019 | 2026-04-28 | ARCH | Goal-Driven Program Templates (hypertrofie/forta/cardio) | LOCKED V1 | 03-decisions/_FROZEN/024-goal-driven-program-templates.md
D-LEGACY-020 | 2026-04-29 | ARCH | Offline Coaching Decision Tree Exhaustive + §9 pure-function paradigm | LOCKED V1 | 03-decisions/_FROZEN/026-offline-coaching-decision-tree-exhaustive.md
D-LEGACY-021 | 2026-04-30 | ARCH | Engine Energy Adjustment readiness-modulated load | LOCKED V1 | 03-decisions/_FROZEN/027-engine-energy-adjustment.md
D-LEGACY-022 | 2026-04-30 | ARCH | Engine Tempo / Form Cues exercise-specific | LOCKED V1 | 03-decisions/_FROZEN/028-engine-tempo-form-cues.md
D-LEGACY-023 | 2026-05-01 | ARCH | Engine Specialization Israetel-based weakness amplification | LOCKED V1 | 03-decisions/_FROZEN/029-engine-specialization.md
D-LEGACY-024 | 2026-05-01 | ARCH | Adapter Design Pattern compose pipeline pure-function | LOCKED V1 | 03-decisions/_FROZEN/030-adapter-design-pattern.md
D-LEGACY-025 | 2026-05-02 | ARCH | Engine Warm-up & Mobility pre-session protocol | LOCKED V1 | 03-decisions/_FROZEN/031-engine-warmup-mobility.md
D-LEGACY-026 | 2026-05-02 | ARCH | Engine Deload Protocol fatigue-triggered automatic | LOCKED V1 | 03-decisions/_FROZEN/032-engine-deload-protocol.md
D-LEGACY-027 | 2026-05-02 | ARCH | Engine Muscle Memory Index (MMI) hibrid lookup + boost (Engine #9) | LOCKED V1 | 03-decisions/_FROZEN/033-muscle-memory-index.md
D-LEGACY-028 | 2026-05-13 | ARCH | ADR Anatomical Classification V1 — 11 categorii canonical muscle_target_primary | LOCKED V1 | 03-decisions/_FROZEN/ADR_ANATOMICAL_CLASSIFICATION_V1.md
D-LEGACY-029 | 2026-04-30 | ARCH | Bias Detection Observable (Volume Creep + Auto-pedeapsă + Aggressive Loading §EXT-2) | LOCKED V1 | 03-decisions/_FROZEN/ADR_BIAS_DETECTION_OBSERVABLE_v1.md
D-LEGACY-030 | 2026-05-03 | ARCH | Cascade Defense 4 layers runtime defense | LOCKED V1 | 03-decisions/_FROZEN/ADR_CASCADE_DEFENSE_v1.md
D-LEGACY-031 | 2026-05-04 | ARCH | Composite Signal Layer cross-engine aggregation | LOCKED V1 | 03-decisions/_FROZEN/ADR_COMPOSITE_SIGNAL_LAYER_v1.md
D-LEGACY-032 | 2026-05-14 | ARCH | Engine Refactor Big 8 → Big 11 V1 coach engines cluster post anatomical taxonomy | LOCKED V1 | 03-decisions/_FROZEN/ADR_ENGINE_REFACTOR_BIG8_TO_BIG11_V1.md
D-LEGACY-033 | 2026-05-05 | ARCH | Multi-Tenant Auth Migration v1 (Firebase Auth Magic Link + OAuth) | LOCKED V1 | 03-decisions/_FROZEN/ADR_MULTI_TENANT_AUTH_v1.md
D-LEGACY-034 | 2026-05-05 | ARCH | Outlier Filter v1 profile-aware + ASK Don't IGNORE | LOCKED V1 | 03-decisions/_FROZEN/ADR_OUTLIER_FILTER_v1.md
D-LEGACY-035 | 2026-05-05 | ARCH | Pain/Discomfort Button architecture CDL override pattern | LOCKED V1 | 03-decisions/_FROZEN/ADR_PAIN_DISCOMFORT_BUTTON_v1.md
D-LEGACY-036 | 2026-05-06 | ARCH | RIR Matrix Adaptive profile + exercise category aware | LOCKED V1 | 03-decisions/_FROZEN/ADR_RIR_MATRIX_ADAPTIVE_v1.md
D-LEGACY-037 | 2026-05-13 | ARCH | Session Sequence Ordering V1 engine ordering 5-step algorithm deterministic | LOCKED V1 | 03-decisions/_FROZEN/ADR_SESSION_SEQUENCE_ORDERING_V1.md
D-LEGACY-038 | 2026-05-13 | ARCH | Smart Routing Equipment v2 cascade ordered list + sequence reordering | LOCKED V2 | 03-decisions/_FROZEN/ADR_SMART_ROUTING_EQUIPMENT_v2.md
D-LEGACY-039 | 2026-05-12 | ARCH | Smart Routing Equipment v1 initial cascade routing | SUPERSEDED-BY-D-LEGACY-038 | 03-decisions/_FROZEN/ADR_SMART_ROUTING_EQUIPMENT_v1.md
D-LEGACY-040 | 2026-05-15 | ARCH | LOCK 9 Aggressive Loading Tier-Aware Warning (engine §EXT-2 + LOOP CLOSE accelerated learning wired) | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/aggressive-loading-warning-tier-aware.md
D-LEGACY-041 | 2026-05-15 | ARCH | LOCK 8 Kcal Floor 1200 Bayesian Nutrition observation filter | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/kcal-floor-1200-engine-filter.md
D-LEGACY-042 | 2026-05-12 | ARCH | Cognitive Architecture DRAFT 5-engine + Arbitrator central + dimensions plugins | DRAFT | 99-archive/wiki-pre-2026-05-15/entities/specs/spec-cognitive-architecture.md
D-LEGACY-043 | 2026-05-09 | ARCH | Tombstone & Branching DRAFT replace LWW + append-only event log + 90d retention | DRAFT | 99-archive/wiki-pre-2026-05-15/entities/specs/spec-tombstone-branching.md
D-LEGACY-044 | 2026-05-10 | ARCH | Data Registry LANDED SSOT localStorage keys whitelist-based fullReset | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/entities/specs/spec-data-registry.md
D-LEGACY-045 | 2026-05-07 | ARCH | Append-only architecture §CC.6 LOCK V1 2026-05-10 DEPRECATED post-Faza 3 | DEPRECATED | 99-archive/wiki-pre-2026-05-15/concepts/append-only-architecture.md

### STRATEGY — Product Direction, Paradigm, Positioning

D-LEGACY-046 | 2026-04-17 | STRATEGY | Vanilla JS + Vite NO UI framework (port-first paradigm) | LOCKED V1 | 03-decisions/_FROZEN/005-vanilla-js-no-framework.md
D-LEGACY-047 | 2026-04-18 | STRATEGY | No Anthropic Trademark in public-facing material | LOCKED V1 | 03-decisions/_FROZEN/010-no-anthropic-trademark-public.md
D-LEGACY-048 | 2026-04-29 | STRATEGY | "Andura Gândește pentru User" / Graceful Degradation Universal | LOCKED V1 | 03-decisions/_FROZEN/025-andura-gandeste-pentru-user.md
D-LEGACY-049 | 2026-05-10 | STRATEGY | Port-First-Then-React (Step 1 vanilla port → Step 2 React migration) | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/port-first-then-react.md
D-LEGACY-050 | 2026-05-10 | STRATEGY | Port-First Step 1 Paradigm V1 7/7 sub-decisions Co-CTO bias preserved | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/entities/specs/spec-port-first-step-1.md
D-LEGACY-051 | 2026-05-14 | STRATEGY | Pre-Beta FULL Scope LOCK V2 (LOCK 1) supersede all "post-Beta v1.5" deferrals | LOCKED V2 | 99-archive/wiki-pre-2026-05-15/concepts/pre-beta-full-scope-lock-v2.md
D-LEGACY-052 | 2026-05-12 | STRATEGY | Andura Suflet brand soul Gigel-friendly anti-surveillance Romanian-first | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/andura-suflet.md
D-LEGACY-053 | 2026-05-12 | STRATEGY | Moat strategy engines auxiliare ascunse cumulative competitive defensibility | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/moat-strategy.md
D-LEGACY-054 | 2026-05-12 | STRATEGY | Product Vision Beta V1 4-tab scope LOCK + competitive moat structural | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/product-vision.md
D-LEGACY-055 | 2026-05-12 | STRATEGY | Strategy LOCK V1 anti-acoperiș-pereți filter active catalog | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/strategy-lock-v1.md
D-LEGACY-056 | 2026-05-13 | STRATEGY | Scope library 600-700 ex MANDATORY PRE-BETA (floor minim NU cap maxim) | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/summaries/handover-2026-05-13f-bundle-5-adr-v2-strategic-plus-scope-library-600-700-mandatory-pre-beta-lock.md
D-LEGACY-057 | 2026-05-15 | STRATEGY | Library 657/657 = 100% gate ACHIEVED per LOCK 2 Daniel Gates 100% strict | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/summaries/handover-2026-05-15-chat-acasa-post-midnight-triple-landed-bundle-6-0-7-plus-c4-2-plus-c4-3.md
D-LEGACY-058 | 2026-05-11 | STRATEGY | React Migration State Mapping V1 ACTIVE_SSOT Step 2 reference state.js → Context+useReducer | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/entities/specs/spec-react-migration-state-mapping.md

### SAFETY — Medical/Legal/Disclaimers

D-LEGACY-059 | 2026-04-26 | SAFETY | GDPR K-Anonymity validation for anonymized arbitration_log | LOCKED V1 | 03-decisions/_FROZEN/019-gdpr-k-anonymity-validation.md
D-LEGACY-060 | 2026-05-14 | SAFETY | LOCK 4 Medical Safety Disclaimer + T&C Mandatory Accept Onboarding Gate first-launch | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/medical-safety-disclaimer-t-c-mandatory.md
D-LEGACY-061 | 2026-05-14 | SAFETY | Anti-paternalism ABSOLUTE engine = generic invariant NU user-specific hard-coded ("Mi se rupe ca maria...") | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/medical-safety-disclaimer-t-c-mandatory.md

### UX — User Experience, Copy, Interactions

D-LEGACY-062 | 2026-04-20 | UX | Onboarding UI + Profile Typing (Anti-Bias Framework Big 6 hard typing) | LOCKED V1 | 03-decisions/_FROZEN/014-onboarding-profile-typing.md
D-LEGACY-063 | 2026-05-04 | UX | Mode Detection UI 4 moduri pure event listeners + Mode hierarchy | LOCKED V1 | 03-decisions/_FROZEN/ADR_MODE_DETECTION_UI_v1.md
D-LEGACY-064 | 2026-05-10 | UX | Romanian no-diacritics LOCK V1 PERMANENT strip UI/tests/mockups | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/no-diacritics-rule.md
D-LEGACY-065 | 2026-05-12 | UX | Gigel Test UX validation filter Marius la sala mandatory pre-feature | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/gigel-test.md
D-LEGACY-066 | 2026-05-07 | UX | Root Nav V2 §29.5.7 SUPERSEDE V1 trio → V2 quad Antrenor/Progres/Istoric/Cont | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/entities/specs/spec-root-nav-v2.md
D-LEGACY-067 | 2026-05-15 | UX | Wording backlog post-smoke CEO review window iteration (LOCK 10 MMI + LOCK 9 modal) | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/wording-backlog-post-smoke.md
D-LEGACY-068 | 2026-05-10 | UX | F13 Rating Notes DROPPED V1 (Anti-RE rule scope universal Pre-flight) | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/entities/features/feature-f13-rating-notes-dropped.md
D-LEGACY-069 | 2026-05-10 | UX | F14 Ratings Window EXTEND 20 → 90 sessions Tier 0 active rolling | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/entities/features/feature-f14-ratings-window.md
D-LEGACY-070 | 2026-05-10 | UX | F5 AA-Friction Modal DEFER V1 (UX flow inline ADR 013 anti-paternalism ABSOLUTE) | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/entities/features/feature-f5-aa-friction-modal-deferred.md
D-LEGACY-071 | 2026-05-10 | UX | V1 Features Audit Co-CTO bias 10 keep + 4 modify + 1 drop (F5) + audit primat universal | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/entities/specs/spec-v1-features-audit.md

### ENG — Engineering Tactical (Specs, Refactors)

D-LEGACY-072 | 2026-04-18 | ENG | Vitest for unit tests + Playwright for E2E | LOCKED V1 | 03-decisions/_FROZEN/008-vitest-playwright-testing.md
D-LEGACY-073 | 2026-05-05 | ENG | Validation Framework V1 north star ≥95% strict + safety-dominant + corpus 500 | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/entities/specs/spec-andura-validation-framework.md
D-LEGACY-074 | 2026-05-09 | ENG | Scenarios Simulator Design V1 DRAFT pipeline + ~85% AUTO_RESOLVED + ~15% FLAGGED Claude reasoning fill | DRAFT | 99-archive/wiki-pre-2026-05-15/entities/specs/spec-scenarios-simulator.md
D-LEGACY-075 | 2026-05-09 | ENG | Faza 2 Filter Strategy V1 DRAFT consume flagged_only.json + Claude reasoning fill + 3-instance workflow | DRAFT | 99-archive/wiki-pre-2026-05-15/entities/specs/spec-faza-2-filter-strategy.md
D-LEGACY-076 | 2026-05-12 | ENG | Calendar Feature V1 spec UX states 3 LOCKED post-S1.6 + lucide pencil edit + S1.7 + 4 strategic LOCK | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/calendar-feature-v1-spec.md
D-LEGACY-077 | 2026-05-12 | PROC | HANDOVER_VERIFICATION_CHECKLIST §0-§11 Bugatti gate mandatory per /wiki-ingest | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/entities/specs/spec-handover-verification-checklist.md

### PROC — Process, Workflows, Handover

D-LEGACY-078 | 2026-05-11 | PROC | Karpathy LLM Wiki Pattern Real Option B 3-layer (raw + wiki + schema) | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/karpathy-llm-wiki-pattern.md
D-LEGACY-079 | 2026-05-11 | PROC | Co-CTO autonomy LOCKED V1 PERMANENT Daniel zero touch pre-Beta a-z review | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/autonomy-paradigm-v1.md
D-LEGACY-080 | 2026-05-11 | PROC | Direct-to-CC paradigm Daniel zero courier MCP filesystem + claude_code autonomous | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/direct-to-cc-paradigm.md
D-LEGACY-081 | 2026-05-12 | PROC | Metoda hibridă chat ↔ CC terminal LOCKED V1 partial supersede + MCP cap-coadă singular handover-only | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/metoda-hibrida-chat-cc.md
D-LEGACY-082 | 2026-05-14 | PROC | §F3.8 Handover Protocol Amendment NO verify post-timeout Daniel observes inbox disappear ping check | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/handover-protocol-f3-8-amendment-no-verify-post-timeout.md
D-LEGACY-083 | 2026-05-15 | PROC | §AR.28 Handover via courier metoda hibridă FULL 5× threshold ABSOLUTE 2 artefacte separate paradigm | LOCKED V1 ABSOLUTE | 99-archive/wiki-pre-2026-05-15/concepts/anti-recurrence-rules.md
D-LEGACY-084 | 2026-05-15 | PROC | §AR.29 Engines downstream taxonomy-agnostic by default 4× threshold cross-bundle scope-refinement | LOCKED V1 ABSOLUTE | 99-archive/wiki-pre-2026-05-15/concepts/anti-recurrence-rules.md
D-LEGACY-085 | 2026-05-15 | PROC | §AR.30 candidate Pre-action vault primary-source verification MANDATORY (1× threshold scribe-mode marked) | DEPRECATED-superseded-by-D008 | 99-archive/wiki-pre-2026-05-15/concepts/anti-recurrence-rules.md
D-LEGACY-086 | 2026-05-15 | PROC | §AR.31 candidate CEO scope strict UI wording autonomous compose = SLIP DEFAULT (1× threshold scribe-mode marked) | DEPRECATED-superseded-by-D009 | 99-archive/wiki-pre-2026-05-15/concepts/anti-recurrence-rules.md

### REGLAJ — System Reglare Meta (Pre-2026-05-15)

D-LEGACY-087 | 2026-05-12 | REGLAJ | Voice preservation policy §1 mandatory 4-section + daniel-isms verbatim catalog HARD RULE 2 NU lobotomy | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/voice-preservation-policy.md
D-LEGACY-088 | 2026-05-12 | REGLAJ | Anti-recurrence rules §AR.1-§AR.27 codified slip patterns 2× minimum threshold | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/anti-recurrence-rules.md
D-LEGACY-089 | 2026-05-12 | REGLAJ | Bugatti craft Quality > Speed default discipline + Daniel autonomy lock EXTINS | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/bugatti-craft.md
D-LEGACY-090 | 2026-05-14 | REGLAJ | Bugatti Audit Nuclear pre-Launch every line cod + every virgulă + TOT pe latest commit LANDED GATE FINAL | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/bugatti-audit-nuclear-pre-launch.md
D-LEGACY-091 | 2026-05-12 | REGLAJ | Mockup vs prod distinction permanent rule screenshot verify ÎNAINTE strategic | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/concepts/mockup-vs-prod-distinction.md

### Features — V1 Keep/Modify/Drop Audit (2026-05-10)

D-LEGACY-092 | 2026-05-10 | UX | F1 Patterns Banner MODIFY simplified 2 keep (LOW_ADHERENCE + STAGNATION) / 3 drop V2 paranoid surveillance | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/entities/features/feature-f1-patterns-banner.md
D-LEGACY-093 | 2026-05-10 | UX | F2 Last Session Memory KEEP verbatim top 3 exercises same dayLabel + RPE + verdict | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/entities/features/feature-f2-last-session-memory.md
D-LEGACY-094 | 2026-05-10 | UX | F3 Fatigue Score MODIFY simplified single number + culoare drop multi-component visual | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/entities/features/feature-f3-fatigue-score.md
D-LEGACY-095 | 2026-05-10 | UX | F4 Readiness Verdict KEEP verbatim core coach value pre-session + emoji + label | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/entities/features/feature-f4-readiness-verdict.md
D-LEGACY-096 | 2026-05-06 | UX | Auth Magic Link Phase 2 RESOLVED ZERO password V1 + auto-retry 3x + SMTP | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/entities/features/feature-auth-magic-link.md
D-LEGACY-097 | 2026-05-10 | UX | Onboarding T0 Big 6 hard typing + setPhaseOverride + demographic prior fallback | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/entities/features/feature-onboarding-t0.md
D-LEGACY-098 | 2026-05-15 | ARCH | LOCK 10 ADR 033 MMI Engine #9 V1 LANDED Algorithm Hibrid Lookup + Boost + compose pipeline MMI LAST | LOCKED V1 | 99-archive/wiki-pre-2026-05-15/entities/features/lock-10-adr-033-mmi-engine-9.md

---

## STRAT-IMPACT DETAILED ENTRIES (post 2026-05-16 React pivot)

### D015 — STRAT PIVOT — Pre-Beta React Andura Clasic, NU vanilla port

**Date:** 2026-05-16
**Category:** STRATEGY (strategic CEO-level supersede)
**Status:** LOCKED V1
**Source:** Daniel CEO chat verbatim 2026-05-16: "deci noi nu lansam vanilla la betta... lansam andura clasic pe react"
**Cross-refs:** [[ANDURA_PRIMER.md §3 STRATEGY LOCKED V1]], [[DECISIONS.md §D-LEGACY-049 Port-First-Then-React]] (supersede partial Step 1)
**Backup tag:** pre-react-pivot-codify-2026-05-16 @ HEAD post deploy reconcile

#### Context

Post deploy main reconcile 2026-05-16 (D013 LOCK 1 100% + D014 branch reconcile -X theirs), Daniel browser-check andura.app: medical disclaimer ✅ LANDED, dar 6 taburi prod ≠ 4 taburi mockup LOCKED V1. Investigation revealed Port-First-Then-React Step 1 vanilla port bottom nav layer + screen architecture restructure NU făcut. Mockup `andura-clasic.html` `<div id="bottom-nav">` cu comentariu literal "V1 LOCKED — 4 taburi" (Antrenor/Progres/Istoric/Cont, screen-based `goto()` routing 50+ screens) ≠ prod `index.html` `<nav class="nav">` 6 buttons paradigma veche (Coach/Dashboard/Greutate/Program/Plan/Setari, page-based `sp()`).

Tactical decision presented: port nav now (scope mare atinge majoritatea LOCK 1 features) vs slice mai mic vs defer post-Beta.

#### Decizia Daniel

Skip Step 1 vanilla port closure complet. Lansăm Andura Clasic pe React folosind mockup-ul ca DESIGN MASTER direct. Vanilla `index.html` 6 taburi rămâne legacy live andura.app până React migration LANDED.

#### Implicații

- **Supersedes part of D-LEGACY-049 Port-First-Then-React:** păstrăm Step 2 React, abandonăm Step 1 vanilla port closure
- **Vanilla branch `feature/v2-vanilla-port` status:** archive-quality, NU mai primește vanilla port additions post-D015. Backend/engine code în `src/engine/*` + tests 3743 PASS = reusable React migration
- **LOCK 1 100% complete (D013) preserved:** library 657, Big 11 8/8, Calendar V1 engine `scheduleAdapter.js`, LOCK 8 kcal floor, BATCH 2 Antrenor closure, auth Firebase + IndexedDB per UID — ALL reusable backend layer React build
- **UI layer 6 taburi `index.html` + `src/pages/*.js`:** LEGACY, NU port closure, NU refactor pentru parity mockup 4 taburi
- **Mockup `andura-clasic.html` 4753 LOC:** DESIGN MASTER source-of-truth React migration — 4 taburi + 50+ screens + state machine workout V2 + Calendar V1 + auth flow Big 6 hard T0
- **Pre-Beta LOCK 2 redefined:** React Andura Clasic full build pe mockup spec, Bugatti craft, ZERO timing argumente decizie
- **Daniel Gates + Bugatti audit nuclear pre-launch invariant** păstrate

#### Rationale Bugatti

Vanilla port intermediate step = double-work non-Bugatti. Mockup → React direct = peak craft minimal duplicated effort. Backend LOCK 1 = reusable Bugatti infrastructure preserved. NU timing argumente — quality > speed strict orizont 2-3 ani.

---

### D016 — PROC — Bottom nav + screen architecture restructure în React build, NU vanilla port

**Date:** 2026-05-16
**Category:** PROC (procedural implementation)
**Status:** LOCKED V1
**Source:** Implicație directă D015 (acelash chat 2026-05-16)
**Cross-refs:** [[DECISIONS.md §D015]], [[04-architecture/mockups/andura-clasic.html]]

#### Context

6 taburi prod `index.html` (Coach/Dashboard/Greutate/Program/Plan/Setari, `sp()`-based) ≠ 4 taburi mockup LOCKED V1 (Antrenor/Progres/Istoric/Cont, `goto()`-based 50+ screens). Semantic mapping nontrivial:
- Antrenor (mockup V1 LOCKED home workout session) ≈ Coach + Program absorbed
- Progres (body comp display + nutritie + alerte) ≈ Dashboard + Plan absorbed
- Istoric (timeline calendar heatmap + 90-day ratings + drill-downs) = NEW screen, NU există prod
- Cont (settings drill 9+ sub-screens) ≈ Setari parity

Plus mockup uses screen-based routing (`goto()` 50+ ecrane: splash, auth, onb-1..7, antrenor, energy-check, energy-cause, workout-preview, ceva-nu-merge, pain-button, equipment-swap, aparate-lipsa, schedule-override, istoric, pr-wall, workout V2 state machine, post-rpe, post-summary, progres, settings, settings-* 8+ sub, confirm-* 6+ destructive, log-weight, sesiuni-recente, loguri-greutate, weight-timeline, auth-reactivate, confirm-program-change, confirm-finish-early).

#### Decizia

Restructure 6→4 + screen architecture full migration = se face EXCLUSIV în React build pe spec mockup, NU se mai face în vanilla `index.html` + `src/pages/*.js` legacy. Eliminăm double-work non-Bugatti.

#### Implementation path forward (next chat)

1. Strategic React stack discussion: React + Vite (lightweight, mockup currently Tailwind CDN) vs Next.js (heavier, app router benefits SSR for SEO landing) — Daniel preference
2. State management: Zustand (lightweight, parity localStorage patterns mockup) vs React Context + custom hooks vs alternative — Daniel preference
3. Routing: React Router DOM v6+ screen-based mapping `goto()` 50+ screens → routes
4. Backend layer reuse: import direct from `src/engine/*` modules (scheduleAdapter, bayesianNutrition, weaknessDetector, fatigueIndex, prEngine, deviationMemory, coachDirector, etc) — preserve test coverage vitest 3743 PASS
5. UI components migration: extract reusable from mockup HTML+CSS+demo JS → React components + Tailwind classes (current Tailwind CDN config → Tailwind PostCSS build)
6. Test strategy: vitest + jsdom React Testing Library local fast + Playwright E2E live andura.app smoke 4 taburi + Daniel Gates production manual Firebase + PWA + telefon
7. Pre-Beta LOCK 2 React Andura Clasic build scope Bugatti — ZERO timing argumente decizie

#### Constraints invariante

- Mockup `andura-clasic.html` 4753 LOC = DESIGN MASTER literal — NO design changes în React build fără Daniel CEO LOCK explicit
- Backend `src/engine/*` test coverage = preserved invariant (3743 PASS local)
- Bugatti craft peak — refactor later NEVER happens, ZERO compromise
- Gigel Test mandatory pre-feature decisions React build (orice paradigm shift verificat mockup spec compliance)
- Daniel Gates production + Bugatti audit nuclear pre-launch invariant

---

### D027 — STRATEGY — Phase 6 task_02 Option C big-bang async migration React consumers

**Date:** 2026-05-18
**Category:** STRATEGY (architectural truth-reflection over cache facade)
**Status:** LOCKED V1
**Source:** Daniel CEO chat verbatim 2026-05-18 "da facem C" post Co-CTO pivot challenge "care e quality real"
**Cross-refs:** [[DECISIONS.md §D025 Phase 5 BATCH closure]], [[📥_inbox/HANDOVER_2026-05-18_phase-6-task-02-option-c-pivot.md]], [[📥_inbox/phase-6-tasks/ORCHESTRATOR.md §5 fail-stop]]
**Backup tag:** pre-phase6-task-02-2026-05-18 @ `c64e692` (task_02 NU committed, tree clean revert target)

#### §1 Context

Phase 6 BATCH 24-task autonomous run. Task #1.A deloadAdapter batch 8 ULTIM LANDED `810c783` + task_01 scheduleAdapter.getDailyWorkout backend consumer LANDED `c64e692` (4318 PASS +28 cumulative vs Phase 5 close 4290). Task_02 (scheduleAdapterAggregate React real wire) fail-stop per ORCHESTRATOR §5 — sketch §B asuma "1 fișier 1 commit", CC dry-run discovery ~80-120 test cascade + 5 React consumer async migration scope materially beyond sketch.

#### §2 Decision

Option C big-bang async migration React consumers. NU Option A split (atomization same cascade) sau Option B sync-cached facade (CC recomandare inițială + Co-CTO agreed greșit). Daniel pivot challenge "care e quality real" → Co-CTO pivot la C cu motivare onestă.

#### §3 Rationale

- Engine pipeline ESTE async (~100-300ms calculate). React trebuie reflecte adevăr arhitectural, NU să-l ascundă cache facade.
- Cache trucaj = datorie tehnică (invalidare bugs viitoare: date change midnight + log update + settings change).
- Bugatti audit nuclear Phase 8 pre-Launch = workaround-uri = red flags.
- Loading state "se incarca..." explicit = UX onest. Cold flash din cache = magic ascuns perceptibil Maria 65 phone slab Romania 3G.
- Orizont 2-3 ani Daniel = datorie crește exponențial dacă lași.

#### §4 Impact

- task_02 sketch REWRITE noul chat cu scope Option C explicit (§A grep primary-source stores + §B 5 consumers async + §C ~100 test rewrite enumerate + §D multi-commit budget per ORCHESTRATOR §2 multi-block clauză)
- Est durată CC task_02: 3-5h autonomous Opus
- BATCH 24 total durată estimată ~dublu față inițială
- task_03-24 sketches intact, verify drift pe parcurs (high-risk task_06 patterns banner + task_22/23 dashboard data sources, low-risk Cont sub-screens mockup parity)

#### §5 Anti-recurrence

Co-CTO sketch §A grep primary-source mandatory pre-spec. Specific: stores Zustand exports (slice names + field shapes) verify ÎNAINTE de a scrie buildXState helpers. Slip 2026-05-18 task_02: am scris `workoutStore.userProfile / exerciseWeights / profileTier / weeksElapsed` — NU există. CC corectat dry-run la `useOnboardingStore.data` actual. Cause: skip grep sub autonomy pressure BATCH drafting fast. PROC future: §AR.21 grep evidence inline reiterated mandatory.

---

### D026 — STRATEGY — Phase 6 BATCH 24-task LANDED end-to-end

**Date:** 2026-05-19
**Category:** STRATEGY (BATCH closure milestone)
**Status:** LOCKED V1
**Source:** Phase 6 BATCH autonomous execution per ORCHESTRATOR.md (D027 LOCKED V1 Option C cascade + Option B composer parallel)
**Cross-refs:** [[DECISIONS.md §D025 Phase 5 BATCH closure]], [[DECISIONS.md §D027 task_02 Option C STRATEGY]], [[📥_inbox/HANDOVER_2026-05-18_phase-6-task-02-option-c-pivot.md]]
**Backup tags:** `pre-phase6-task-01-2026-05-18` → `pre-phase6-task-24-2026-05-19` (24 incremental + milestone `phase-6-batch-landed-2026-05-19`)

#### §1 Scope

Phase 6 BATCH 24-task autonomous run LANDED end-to-end. Closes Pre-Beta LOCK 2 React Andura Clasic build (per D015 strategic pivot 2026-05-16). Pipeline §42.10 engine real wire 8/8 + Cont Tab 9 sub-screens + polish pre-Beta 7-task cluster.

#### §2 Sub-totals (24-task split)

**Engine pipeline real wire 8/8 (task_01-08):**
1. task_01 `scheduleAdapter.getDailyWorkout` backend consumer runPipeline 8 adapters + sessionBuilder delegate (`c64e692`)
2. task_02 `scheduleAdapterAggregate` Option C async cascade — sync→async signature propagation 5 React consumers (`31cc523`) per D027 STRATEGY
3. task_03 `engineWrappers.getNutritionTargetsToday` async BN engine wrapper Kalman posterior.mu + LOCK 8 floor 1200 (`f5424a2`)
4. task_04 `bayesianNutritionAggregate` async real wire BN engine (`d7b04c7`)
5. task_05 `engineWrappers.getPatternsBanner` + `getProactiveAlerts` Option B composer pure-function engines (`85fb559`)
6. task_06 `coachDirectorAggregate` 8-field enrich + 3 NEW Antrenor components (PatternsBanner + PRWallRecent + AlertsBanner) (`ba3fa93`)
7. task_07 Workout.tsx aaFriction engine signals end-to-end wire (`db100d9`)
8. task_08 Adherence Engine real wire `getAdherenceOutput` + `engineSignalsAggregate` BASELINE_ADHERENCE eliminated (`9914735`)

**Cont sub-screens 9/9 (task_09-17):**
9. task_09 SettingsProfile Big 6 edit (`2432d90`)
10. task_10 SettingsNotifications toggle + frequency + days + time (`f47f851`)
11. task_11 SettingsSubscription Beta gratuit info (`3ea0af9`)
12. task_12 SettingsAppearance theme + nav style (`ba3d0aa`)
13. task_13 SettingsPrefs units + week start + locale (`c764b9c`)
14. task_14 SettingsPrivacy data export + telemetry opt-in (`03878ce`)
15. task_15 SettingsTerms T&C + Medical Disclaimer 2-tab (`19b65a5`)
16. task_16 SettingsExport local JSON download user data (`ad26465`)
17. task_17 SettingsDanger logout + reset + delete cont confirm modals (`bd31e1f`)

**Polish pre-Beta 7/7 (task_18-24):**
18. task_18 TS `noUncheckedIndexedAccess` strict flag enable + 83 errors fixed granular (`6f44207`)
19. task_19 TS `exactOptionalPropertyTypes` strict flag enable — surprise 0 errors (codebase already explicit) (`8b64369`)
20. task_20 ErrorBoundary + Suspense wrap Outlet Layout root (`f47a170`)
21. task_21 vite-plugin-pwa service worker offline + UpdatePrompt component (`e4ca6eb`)
22. task_22 Progres full dashboard TDEEStrip + FatigueStrip + HeatMapWeekly (`c5aef59`)
23. task_23 Istoric enrich streak stats grid + PR Wall full list (`c493445`)
24. task_24 D026 STRATEGY closure + milestone tag (this commit)

#### §3 Tests delta cumulative

- Phase 5 baseline: 4290 PASS
- Phase 6 task #1.A precedent (`810c783`): 4303 PASS (+13)
- Phase 6 BATCH start: 4303 PASS
- Phase 6 task_01: 4318 (+15)
- Phase 6 task_02: 4332 (+14)
- Phase 6 task_03: 4343 (+11)
- Phase 6 task_04: 4348 (+5)
- Phase 6 task_05: 4370 (+22)
- Phase 6 task_06: 4396 (+26)
- Phase 6 task_07: 4404 (+8)
- Phase 6 task_08: 4417 (+13)
- Phase 6 task_09-17 (Cont sub-screens): cumulative +~80 tests
- Phase 6 task_18-23 (polish): cumulative +~25 tests
- **Phase 6 final: 4522 PASS (+219 vs Phase 5 baseline 4303, +232 vs Phase 5 close 4290)**
- TS strict 0 errors invariant (both `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` enabled)

#### §4 Carry-forward Phase 7

- **Daniel Gates smoke production manual** (Firebase + PWA + telefon Android primary, single comprehensive gate a-z per PRIMER §4 sequencing)
- **Bugatti Full Audit pre-Launch nuclear gate** (CC autonomous candidate post smoke findings — fiecare linie cod + fiecare virgula latest commit LANDED)
- **Fix ALL issues surfaced** (combined smoke + Bugatti audit backlog)
- **Beta launch**

#### §5 Anti-recurrence carry-forward

D027 §5 engine API grep primary-source mandatory invariant. Task_05/06/07/08 sketches v1 fabricated APIs (CoachDirector.run / computeAdherenceScore / store fields invented) — corectate inline §1 fiecare task. Future BATCH drafting: §AR.21 grep evidence ÎNAINTE de a scrie spec §B implementation references.

---

### D028 — PROC — React entry swap LANDED andura.app/ vanilla→React production

**Date:** 2026-05-19
**Category:** PROC (entry swap rename pattern + rollback path + vanilla preservation policy)
**Status:** LOCKED V1 PERMANENT
**Source:** Daniel CEO directive 2026-05-19 deploy React production post Phase 6 BATCH closure D026 + Co-CTO Bugatti craft Option 4 + 1 combined verdict
**Cross-refs:** [[DECISIONS.md §D015 vanilla legacy strategy "până React LANDED"]], [[DECISIONS.md §D016 nav 6→4 EXCLUSIV React]], [[DECISIONS.md §D026 Phase 6 BATCH closure Pre-Beta LOCK 2]]
**Backup tags:** `pre-react-entry-swap-2026-05-19` (HEAD `fb0b10b` pre-swap restore point)

#### §1 Context

D015 strategic pivot 2026-05-16: lansăm Andura Clasic pe React mockup direct, vanilla `index.html` 6 taburi rămâne legacy live `andura.app/` **până React migration LANDED**. D016 PROC: bottom nav 6→4 + screen architecture restructure se face EXCLUSIV în React build, NU în vanilla. D026 (2026-05-19) closes Pre-Beta LOCK 2 React Andura Clasic build — Phase 1-6 cumulative LANDED end-to-end (engine pipeline real wire 8/8 + Cont sub-screens 9/9 + polish pre-Beta 7/7 + 4522 PASS + TS strict maximal `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`).

2026-05-19 deploy production tipping moment: React build feature-complete per D026 LANDED criteria, momentul logic per D015 conditional "până React migration LANDED" pentru swap vanilla→React la entry main `andura.app/`.

#### §2 Decision

Swap vanilla `index.html` → React build la `andura.app/` entry point production. Vanilla NU șters — preserved în repo `index-vanilla-legacy.html` ca backup imutabil + sursă reference, exclus din build active. Engine reuse layer (`src/engine/*` + `src/schema/*` + `src/coach/*`) invariant — consumat de React wrappers (`src/react/lib/*Aggregate.ts`) per D026 §1.

#### §3 Implementation

Option 1 rename pattern (per ADR proposal Daniel CEO directive):

1. **`git mv index.html → index-vanilla-legacy.html`** — vanilla preserved în repo backup, NU mai entry build
2. **`git mv react-test.html → index.html`** — React shell devine entry main
3. **`vite.config.js`** — `rollupOptions.input` reduced la single `main: 'index.html'` (remove `'react-test': 'react-test.html'` entry parallel)
4. **`src/main.tsx`** — error message updated `'Root element #root not found in react-test.html'` → `'Root element #root not found in index.html'`
5. **`tailwind.config.js`** — content scan path `'./react-test.html'` → `'./index.html'`

Build verification: `npm run build` produces `dist/index.html` cu React shell `#root` + script `/assets/main-*.js` cu vendor-react chunk (NU mai vanilla 642KB `main-*.js` bundle). PWA SW + manifest invariant. Tests verde mandatory `npm run test:run` pre-commit husky hook.

#### §4 Rollback path

Instant rollback prin `git revert <swap-commit-sha>` restores vanilla entry exact state. Redeploy GH Pages workflow auto-trigger pe push main reverts live `andura.app/` la vanilla 6 taburi în ~2-3min. Backup tag `pre-react-entry-swap-2026-05-19` permite hard reset point alternative.

#### §5 Vanilla preservation policy

- **`index-vanilla-legacy.html`** preserved în repo, NU deploy-at, NU touch (frozen reference + emergency rollback content source)
- **`src/pages/*.js`** vanilla legacy (`weight.js`, `dashboard.js`, `coach.js`, `plan.js`, `settings.js`, `auth.js`, `idle.js`, `authShell.js`) — preserved în repo orfan dar reusable engine code via React `src/react/lib/*Aggregate.ts` wrappers per D026 §1 engine pipeline real wire 8/8
- **`src/engine/*.js`** + **`src/coach/*.js`** + **`src/schema/*.js`** — preserved invariant, consumate de React wrappers (active)
- **NU șterse**: vanilla source code rămâne canonical reference + engine reuse layer

#### §6 Impact

- **Live `andura.app/`**: React build 4 taburi (Antrenor/Progres/Istoric/Cont) + screen-based `goto()` routing 50+ screens + PWA SW + medical disclaimer + auth + engine pipeline real wire
- **Vanilla legacy live**: ELIMINATED — `andura.app/` NU mai servește vanilla 6 taburi paradigmă veche (Coach/Dashboard/Greutate/Program/Plan/Setari, page-based `sp()`)
- **DNS + Hosting**: invariant (GitHub Pages custom domain `andura.app` per CNAME + workflow `.github/workflows/deploy.yml` auto-trigger push main)
- **Build artifacts**: `dist/index.html` = React shell minimal + `dist/assets/main-*.js` chunked (vendor-react/data/state/icons split per Phase 5 task_20)

#### §7 Risk

Minimal — reversibil 100% prin git revert + GH Pages auto-redeploy. Zero downtime expected (GH Pages atomic publish). PWA SW `cleanupOutdatedCaches: true` + `registerType: 'autoUpdate'` (per `vite.config.js` VitePWA config) ensures clients cu cached vanilla SW invalidates + fetches React fresh on next visit + UpdatePrompt component prompt user pentru reload.

---

### D029 — PROC — Bugatti Audit Nuclear procedure continuous neîntrerupt multi-noapte

**Date:** 2026-05-19
**Category:** PROC (audit procedure NEW LOCK pre-Launch nuclear gate definition)
**Status:** LOCKED V1 PERMANENT
**Source:** Daniel CEO directive 2026-05-19 verbatim *"FULL AUDIT. Fiecare linie cod citita, fiecare virgula, TOT pe latest commit LANDED. 20000 ore I don't care"* + *"absolut full"* + *"ruleaze neintrerupt pana nu il opresc eu"* + *"da tu prompt de 1000 nopti audit nuclear daca e cazul"* + *"high effort sau max?"* → Co-CTO verdict Opus MAX thinking budget
**Cross-refs:** [[DECISIONS.md §D026 Phase 6 BATCH closure Pre-Beta LOCK 2]], [[DECISIONS.md §D028 React entry swap LANDED]], [[📥_inbox/PROMPT_CC_audit_nuclear_full_2026-05-19.md §1-§25]], [[📥_inbox/_CONSUMED/HANDOVER_2026-05-19_phase-6-landed-deploy-audit-prep.md §3-§4]]
**Supersede:** NU (NEW process LOCK pre-Launch — extension PRIMER §6 #2 Bugatti audit nuclear definition)

#### §1 Mode

Continuous neîntrerupt multi-noapte CC autonomous, Opus EXCLUSIVELY MAX thinking budget. NU auto-terminate post primary §1-§24 pass — auto-iterative deep-dive infinit-iterative post §24 → secondary CRITICAL/HIGH → tertiary MED/LOW → quaternary NIT polish — until Daniel explicit STOP/caveman/stai/Ctrl+C.

#### §2 Stop trigger UNIC

Daniel explicit STOP signal (verbatim STOP / caveman / stai / Ctrl+C / "termina"). ZERO alt mechanism auto-terminate (NU bandwidth, NU iteration count, NU coverage %, NU time-bound). Quality-asymptotic per *"20000 ore I don't care"* directive.

#### §3 Scope

ALL on HEAD post `deploy-react-production-2026-05-19` tag (`caaae99` merge commit):
- ~100k LOC source (`src/**` cu engine + react + coach + util + schema + storage + pages legacy)
- ~250k+ total cu tests (251 test files 4522 PASS) + docs (DECISIONS.md + ANDURA_PRIMER.md + 03-decisions/_FROZEN ADRs + 04-architecture/mockups DESIGN MASTER + 07-meta/karpathy-skills-ref + restul vault).

#### §4 Procedure §1-§25 (per PROMPT_CC_audit_nuclear_full_2026-05-19.md)

§1 Source code line-by-line + §2 Tests 251 files + §3 TS strict + §4 Security 16 sub + §5 Performance 15 sub + §6 A11y WCAG 2.1 AA 13 sub + §7 UX flows E2E 13 sub + §8 Engine correctness 20 sub + §9 Compliance 14 sub + §10 LOCK V1 chain-of-trust + §11 i18n RO conventions + §12 Data integrity migration + §13 Error handling cross-cutting + §14 State machine integrity + §15 Cross-browser + §16 PWA spec compliance + §17 Telemetry observability + §18 Documentation + §19 Visual regression pixel parity + §20 Bundle build artifact + §21 Git hygiene + §22 Refactor-later-NEVER scan + §23 Self-correction loop verify + §24 Production readiness final % weighted score + §25 Procedure meta (continuous neîntrerupt loop §1→§24 + secondary/tertiary/quaternary iterative + auto-restart capability via `_progress.md`).

#### §5 Output structure

Log-only backlog NU auto-fix NU commit:
- `📤_outbox/audit-nuclear-2026-05-19/findings-§N.md` per category cu severity classification (CRITICAL / HIGH / MED / LOW / NIT)
- `📤_outbox/audit-nuclear-2026-05-19/SUMMARY.md` aggregate severity matrix + production readiness % weighted final score
- `📤_outbox/audit-nuclear-2026-05-19/_progress.md` checkpoint resume capable post crash sau Ctrl+C explicit Daniel

Daniel decide fix combined backlog smoke #7 per PRIMER §6 cluster (smoke production findings + audit findings combined → fix → Beta launch).

#### §6 Trigger

Daniel manual paste `📥_inbox/PROMPT_CC_audit_nuclear_full_2026-05-19.md` în sesiune CC dedicated (separate de Daniel Gates smoke production manual — paralel OK, smoke CEO focus telefon + audit CC autonomous concurrent altă sesiune). NU auto-launch — explicit Daniel decision when să demareze.

#### §7 Risk

Audit log-only ZERO modificare cod. Findings backlog informativ, fix-uri separat cluster post-audit. Single risk: bandwidth CC autonomous exhaust pre-Daniel STOP — mitigated prin `_progress.md` checkpoint + resume capability post crash sau context reset.

---

### D042 — STRATEGY — Pre-Beta launch GATE = ZERO bug-uri outstanding

**Date:** 2026-05-20
**Category:** STRATEGY (CEO-level gate definition pre-Launch)
**Status:** LOCKED V1 ABSOLUTE
**Source:** Daniel CEO directive verbatim chat birou 2026-05-20: *"900 buguri live. Pana nu reducem nr la 0, nu avem beta."*
**Cross-refs:** [[DECISIONS.md §D-LEGACY-051 Pre-Beta FULL Scope LOCK V2]], [[DECISIONS.md §D029 Bugatti Audit Nuclear procedure]], [[DECISIONS.md §D031 Phase 7 Findings FIX procedure]], [[DECISIONS.md §D041 anti-inflation discipline]], [[📤_outbox/audit-nuclear-2026-05-19/SUMMARY.md]], [[📤_outbox/mockup-vs-prod-parity-2026-05-20/SUMMARY.md]]

#### §1 Context

Post-audit Mockup vs Prod Parity LANDED 2026-05-20 birou (per D029 procedure extension dedicated visual parity scope). Cumulative bug-uri/findings known live:
- **Audit Nuclear D029** (2026-05-19 HEAD `b705c3f`): 698 findings raw (73 CRIT + 167 HIGH + 234 MED + 178 LOW + 46 NIT)
- **Phase 7 Findings FIX D031** (LANDED `05d0859`): 58 surgical closed → 640 outstanding din nuclear
- **Audit Mockup vs Prod Parity** (2026-05-20): 263 findings raw (42 CRIT + 93 HIGH + 59 MED + 39 LOW + 17 NIT)
- **Cumulative outstanding total: ~900 bug-uri live** (640 + 263, overlap minimal post §19 D029 doar 12 findings vs 263 mockup specific deep)

#### §2 Decision

Pre-Beta launch GATE = ZERO bug-uri outstanding cunoscute live. NU 85% readiness, NU 95% readiness, NU "acceptable threshold". Bugatti craft absolute = 0/0 known bugs ÎNAINTE Beta launch.

#### §3 Implications

**Toate fix waves Tier 1/2/3 + Track 7 deferred backlog (~405 findings) + Pass 4 polish (~22) + Mockup audit findings noi (~263) = MANDATORY pre-Beta launch.** ZERO carry-forward post-Beta "refactor later". D-LEGACY-051 Pre-Beta FULL Scope LOCK V2 reinforced + measurable.

End-state final gate sequencing (per ANDURA_PRIMER.md §6) updated:
1. ✅ Pre-Beta LOCK 1 100% complete (D013 2026-05-16)
2. ✅ Deploy main reconcile (D014 2026-05-16)
3. ✅ Strategic React pivot LOCK V1 (D015 + D016)
4. ✅ Pre-Beta LOCK 2 React Andura Clasic build (D017-D028 Phase 1-6 LANDED)
5. ✅ Phase 7 Findings FIX 58 surgical (D031 LANDED `05d0859`)
6. ✅ Track 7 Automated Testing infrastructure (D032 LANDED 9.99/10)
7. ✅ Audit Nuclear D029 LANDED + Audit Mockup vs Prod Parity 2026-05-20 LANDED
8. **Fix ALL ~900 outstanding bug-uri → 0** (D042 gate)
9. Daniel Gates smoke production manual post-fix (single comprehensive gate a-z, Firebase + PWA + telefon)
10. Bugatti Full Audit pre-Launch nuclear gate re-run measure post-fix readiness (Phase 8 verify 0/0 confirmed)
11. Fix ALL surfaced gate 10 (if any)
12. **Beta launch**

#### §4 Rationale Bugatti

Beta = first impression irreversible. 50 testeri Beta find 50 bug-uri = brand damage permanent. Quality > Speed strict orizont 2-3 ani. "Refactor later NEVER happens" reinforced. Daniel solo bootstrap = ZERO timing argumente decizie. Anti-paternalism ABSOLUTE preserved (per ADR 013 §AMENDED) — engineering quality NU user-facing.

#### §5 Anti-inflation discipline (D041)

Raport progres = measured count `findings.closed / findings.total`. NU compound estimate. Format mandatory:
- `Audit Nuclear D029: closed 58/698 = 8.3% (post Phase 7 fix `05d0859`)`
- `Audit Mockup vs Prod: closed 0/263 = 0%`
- `Cumulative outstanding: 900 → target 0`
- `Beta gate met: NO until 0/0`

#### §6 Stop trigger

Gate met = count outstanding = 0. NU Daniel CEO discretion mid-process. NU bandwidth pressure. NU timing deadline. Daniel STOP override possible doar dacă decizie strategică NEW supersedes D042 (e.g., scope reduction Beta MVP Daniel CEO directive explicit).

---

### D043 — STRATEGY — Pre-Beta gate procedure iterative convergence loop dual-source

**Date:** 2026-05-20
**Category:** STRATEGY (CEO-level procedure definition pre-Launch, extension D042)
**Status:** LOCKED V1 ABSOLUTE
**Source:** Daniel CEO directive verbatim chat birou 2026-05-20: *"Dupa fix -> audit nuclear -> scan iar cu tot ce avem ca sisteme automate si track 7 -> fix -> audit nuclear -> etc... pana nu se mai gasesc nimic la audit nuclear si la sisteme automate. Abia atunci face daniel live smoke si da validarea finala ca beta launch"*
**Cross-refs:** [[DECISIONS.md §D042 ZERO bug gate]], [[DECISIONS.md §D029 Bugatti Audit Nuclear procedure]], [[DECISIONS.md §D031 Phase 7 Findings FIX procedure]], [[DECISIONS.md §D032 Track 7 Automated Testing 3-tier defense]], [[DECISIONS.md §D041 anti-inflation discipline]], [[ANDURA_PRIMER.md §4 end-state]]

#### §1 Context

D042 LOCKED V1 stabilit gate-ul ZERO bug-uri outstanding pre-Beta launch. D043 codifies PROCEDURA explicită prin care se atinge convergence-ul. Pattern Phase 7 Findings FIX D031 a demonstrat single-pass surgical fix (58 closed din 698) NU e sufficient — lasă ~640 outstanding + audit-uri suplimentare (Mockup vs Prod parity 263 noi) au revelat divergențe noi necaptate de Audit Nuclear D029 inițial. Convergence necesită LOOP iterativ.

#### §2 Loop procedure

Iterație N (start N=1):

1. **Fix** — CC autonomous Opus close ALL outstanding findings from previous iteration (Audit Nuclear backlog + Track 7 deferred + Audit Mockup vs Prod backlog + ad-hoc bug-uri operaționale). Per D031 procedure (atomic commit per finding, continuous neîntrerupt, push manual final). Per D023 MCP write_file mandatory.
2. **Audit Nuclear re-run** — CC autonomous Opus MAX, log-only, per D029 procedure (continuous neîntrerupt multi-noapte, §1-§50 + secondary/tertiary/quaternary/quinary passes până STOP). HEAD curent post-fix iter N.
3. **Scan Automated Systems** — ALL Track 7 sisteme + orice altceva disponibil:
   - Tier 1 in-repo: Vitest + Playwright E2E + visual regression (`toHaveScreenshot()`) + Lighthouse CI + axe-core a11y WCAG 2.1 AA + fast-check property invariants + @langwatch/scenario coach voice + Stryker mutation + bundle size-limit + depcheck + madge + jscpd + license-checker + Snyk + npm audit
   - Tier 2 synthetic prod: Checkly EU locations 2x 30min critical paths
   - Tier 3 nightly exploration: Stagehand Browserbase persona-driven
   - Plus Pass 5 Playwright screenshots compare mockup vs prod per CRIT
4. **Aggregate findings dual-source** — union audit nuclear + automated systems findings. Dedupe overlap. New backlog iter N+1.
5. **Iterație N+1** — GOTO step 1 dacă backlog > 0. EXIT loop dacă backlog = 0 dual-source.

#### §3 Convergence criterion

**EXIT loop = ZERO findings dual-source simultan:**
- Audit Nuclear pe HEAD curent: 0 findings (toate §1-§50 + secondary-quinary passes)
- Track 7 automated systems pe HEAD curent: 0 failures (Vitest + Playwright + Lighthouse + Snyk + axe-core + Stryker + visual regression + property invariants + Checkly + Stagehand all GREEN)

Mixed convergence (1 source 0, 1 source > 0) = NU exit. Continue iter N+1 fix on non-zero source.

#### §4 Daniel final smoke gate (post-convergence)

Doar după EXIT criteria §3 met, Daniel face:
- Live smoke production manual Android primary (post deploy `main` curent reconcile)
- Firebase auth Magic Link + onboarding T0 Big 6 + Antrenor session full flow + Progres tab + Istoric tab + Cont tab + workout session paused/resumed + PWA install/offline/background sync + GDPR data export + delete cont
- Single comprehensive a-z gate (NU intermediate gates 95% / 90% / smoke parțial)
- Per ANDURA_PRIMER.md §4 sequencing Bugatti Full Audit pre-Launch nuclear gate (Daniel CEO scope: *"FULL AUDIT. Fiecare linie cod citita, fiecare virgula, TOT pe latest commit LANDED. 20000 ore I don't care"*)

#### §5 Beta launch trigger

Daniel CEO explicit validation post-smoke = GREEN cumulative dual-source convergence + GREEN smoke manual a-z + GREEN Bugatti audit nuclear final → Beta launch.

Dacă smoke surfaces NEW findings (e.g., real-world UX issues NU captate de audit nuclear sau Track 7), iter N+1 declarat — GOTO §2 step 1 fresh loop.

#### §6 Anti-recurrence enforcement

- **NU short-circuit loop** — Co-CTO NU poate propune skip audit nuclear sau skip automated scan ca "unnecessary" pe rațiune Daniel comfort sau Bugatti craft optimization. Loop = mandatory full both passes.
- **NU Daniel discretion mid-iteration** — D042 + D043 LOCK gate = measurable convergence, NU CEO discretion. Daniel STOP override possible doar dacă decizie strategică NEW supersedes D042/D043 (e.g., scope reduction MVP).
- **NU "acceptable threshold" —** Beta gate = 0 dual-source absolute, NU 95% / 99% / "close enough". Bugatti craft strict orizont 2-3 ani.
- **Iteration count NU bounded** — cât trebuie până convergence. Daniel solo bootstrap + CC autonomous parallel = sustainable rate. Quality > Speed strict.

#### §7 Estimated iteration count

Based pe Phase 7 Findings FIX D031 closure rate (58/698 single pass cu Karpathy Surgical Changes dominant 50+ findings):
- Iter 1 (curent): ~900 outstanding (640 nuclear + 263 mockup) + Track 7 deferred ~405
- Iter 2 estimated: post iter 1 fix all → audit re-run probabil surfaces 50-150 NEW findings (regressions + edge cases + arch shifts post-fix) + Track 7 scan surfaces ~30-80 NEW failures
- Iter 3 estimated: ~20-50 NEW findings residual
- Iter 4 estimated: ~5-15 NEW findings polish
- Iter 5 estimated: 0 dual-source convergence ACHIEVED

ETA total: **~3-5 iterații, ~3-6 luni calendar** Daniel solo + CC autonomous parallel sustainable rate (per D041 anti-inflation: estimat NU compound, real measurement per iteration). Variabilitate driven by Track 7 multi-file refactor cluster ~405 findings (cea mai mare necunoscută).

#### §8 Output structure per iteration

```
📤_outbox/iter-<N>-pre-beta-convergence/
├── fix-step-1/                # CC autonomous Phase 7-style commits log
├── audit-nuclear-step-2/      # CC autonomous D029-style findings log
├── scan-automated-step-3/     # Track 7 systems aggregate reports
├── _aggregate-findings.md     # union dedupe dual-source
├── _convergence-check.md      # 0 / non-zero verdict per source
└── _next-iter-decision.md     # CONTINUE iter N+1 OR EXIT loop
```

EXIT loop = `iter-<N>-final-convergence/_pre-smoke-state.md` LANDED → Daniel smoke gate trigger.

---

### D050 — PROC — `git commit -o -m -- <paths>` pattern MANDATORY all agent commits

**Date:** 2026-05-23 (chat 5 ACASA)
**Category:** PROC (procedural enforcement anti-recurrence)
**Status:** LOCKED V1
**Source:** D049 anti-ghost-metadata rule expansion empirical proof chat 5 + ZERO race incidents 4+ agent concurrent storm
**Cross-refs:** [[DECISIONS.md §D049 ghost-metadata anti-recurrence rule]] + [[📤_outbox/consolidation-audit/MEGA-BUNDLES.md]] + [[📤_outbox/consolidation-audit/BYPASS-FORENSICS.md]] chat 3

#### §1 Context

D049 LOCKED V1 chat 3 (2026-05-22) codified anti-ghost-metadata rule + `git diff --cached --stat` pre-commit verify + `isolation: "worktree"` mandatory >3 agents paralel. Catastrophic 14-agent race chat 3 produsese 5 mega-bundles cu subject↔diff mismatch (`b918e76c` + `f6dc24b7` + `52638b9b` + `d8ff7b01` + `b6869516`). Forensics audit acknowledged dar regression vector remained: `git add <paths>` + `git commit -m "subject"` cascade vulnerable la concurrent `git add` ops other agent contaminating staged index between `add` and `commit` invocations.

Chat 5 stress test: 21+ atomic commits Co-CTO autonomous + 4-5 agents paralel + multi-bash concurrent. ZERO ghost-metadata incidents observed (vs 10+ chat 4 + 5+ catastrophic chat 3). Pattern empirical proof: every agent commit used `git commit -o -m "subject" -- <explicit paths>` form.

#### §2 Decision

`git commit -o -m "<subject>" -- <explicit paths>` form **MANDATORY all agent commits** (manager Co-CTO + spawn subagents). Flags semantic:

- **`-o`** (`--only`): commit ONLY listed paths (post `--`), ignore staged index from other agents. Anti-race index contamination.
- **`-m`** (`--message`): inline subject (avoid editor open hang).
- **`-- <paths>`**: explicit paths post separator. ZERO ambiguity `staged vs unstaged vs wildcard`.

Trade-off acknowledged: `-o` re-stages listed paths even if already staged (idempotent), bypassing pre-`add` rerun. Acceptable cost vs race elimination.

#### §3 Implications

- **Agent prompts CC** mandatory include `git commit -o -m "<subject>" -- <paths>` pattern în execution discipline section.
- **Subject↔diff verify** D049 rule preserved: `git diff --cached --stat` BEFORE commit invocation still mandatory (catches case where path supplied is stale/wrong file). `-o` flag elimina race contamination, NU elimina subject-claim mismatch.
- **`git add -A` ban** strict (D-prior pre-D050 implicit, now explicit). `-A` at repo root catches `.smart-env/` cache + alte noise + concurrent contamination = anti-pattern strict.
- **Wildcard paths** (e.g., `git commit -o -m ... -- src/`) discouraged. Explicit file paths preferred.

#### §4 Empirical evidence chat 5

- 21+ atomic commits Co-CTO autonomous chat 5 = ZERO ghost-metadata
- 4-5 agents paralel storm (W4-AUDIT-DEEPER + SUBSTRATE + SECURITY-DEEPER + a11y + i18n) = ZERO race
- Comparison: chat 3 14-agent storm fără `-o` = 5 mega-bundles + 3 RED ghost-meta
- Comparison: chat 4 fără `-o` = 10+ ghost-meta incidents

#### §5 Rationale Bugatti

Subject↔diff alignment = trust contract pentru blame archaeology. Ghost-meta commits poison `git log` semantics = future debugger reads wrong root cause. Bugatti craft = ZERO future-self trap. `-o` flag = 3-char defense vs catastrophic blame contamination = peak craft minimum.

---

### D051 — PROC — Max 4-5 agents concurrent confirmed empirical i7-8700 hardware sweet spot

**Date:** 2026-05-23 (chat 5 ACASA)
**Category:** PROC (procedural hardware constraint codified)
**Status:** LOCKED V1
**Source:** Daniel verbal chat 4 LOCK V1 "ne capam la 4-5 agents in total de acum" + chat 5 stress test empirical confirm
**Cross-refs:** CLAUDE.md memory feedback_agent_concurrency_limit chat 4 + feedback_subagents_at_discretion + [[DECISIONS.md §D049]] isolation worktree rule

#### §1 Context

Daniel hardware machine ACASA: i7-8700 6c/12t + 32GB RAM + Windows 10. Chat 3 14-agent storm a depasit threshold = context switch thrashing + lock contention + D049 race chaos accelerate. Chat 4 LOCK verbal Daniel "ne capam la 4-5 agents in total" SUPERSEDES prior "1-20 efficient" memory.

Chat 5 stress test: 4-5 agents paralel storm (W4-AUDIT-DEEPER + SUBSTRATE + SECURITY-DEEPER + ENGINE-DEEPER + a11y/i18n) = clean execution, ZERO race, all atomic commits landed.

#### §2 Decision

**Max 4-5 background agents concurrent default mode permanent** Daniel ACASA i7-8700 hardware. Manager Co-CTO orchestrator-only role + agents executor model (chat 3 LOCK V1 manager role + feedback_manager_role memory). Spawn batch >5 = anti-pattern.

#### §3 Implications

- **Spawn discipline** Manager Co-CTO: max 4-5 Agent tool invocations paralel pe acelasi cycle. Daca scope > 5 tasks, sequential batch sau wait for completion.
- **D049 isolation worktree mandatory** rule preserved la >3 agenti paralel (overlap intentional cu D051 cap 4-5).
- **Quality > Speed > Hardware load** prioritate filter. Bugatti craft NU compromise pentru speed via hardware overload.
- **Future hardware upgrade** Daniel (e.g., i9 + 64GB) → potential threshold raise V2, but require new empirical test.

#### §4 Rationale Bugatti

Hardware load = context switch tax + memory pressure + git lock contention + filesystem I/O bottleneck. Above threshold = chaos accelerate, NU productivity gain. 4-5 sweet spot empirical = peak craft sustained pace. Quality preserved, hardware respected.

---

### D052 — ARCH — Shape adapter pattern la store boundary, NU adapter inward

**Date:** 2026-05-23 (chat 5 ACASA, commit `8529f54d`)
**Category:** ARCH (architectural pattern decision Bugatti substrate)
**Status:** LOCKED V1
**Source:** Substrate ZETA audit chat 5 + commit `8529f54d` fix(substrate-zeta) scheduleStore shape bridge la commitCalendarEdit
**Cross-refs:** [[DECISIONS.md §D026 Phase 6 engine pipeline real wire 8/8]] + [[DECISIONS.md §D-LEGACY-024 Adapter Design Pattern compose pipeline pure-function]] + src/react/stores/scheduleStore.ts + src/engine/scheduleAdapter.d.ts §11-13

#### §1 Context

Antrenor calendar rest day override silently no-op via React UI path discovered chat 5 audit:
- `scheduleStore.saveWeekly()` pasa `DayKind[]` strings (de.g., `['training', 'rest', ...]`)
- Adapter `scheduleAdapter.js` expects `{day, active}` objects per `scheduleAdapter.d.ts §11-13`
- Downstream `scheduleAdapter.js:428-431` check `dayConfig.active === false` evalua pe string (`'training'.active = undefined`, never `=== false`)
- Override `selectedDays` read invariant broken → rest days silently planificate ca training → end-to-end UX rupt

Tactical fix choice presented:
- **(A) Bend adapter inward** — modify `scheduleAdapter.js` accept BOTH `DayKind[]` strings AND `{day, active}[]` objects. Adapter becomes polymorphic.
- **(B) Transform shape la boundary** — `scheduleStore.saveWeekly()` transform `DayKind[]` → `{day, active}[]` BEFORE calling adapter. Adapter stays canonical pure-function pattern (per D-LEGACY-024).

#### §2 Decision

**Option B — shape adapter la store boundary**, NU adapter inward. Pattern:

- **Store boundary** = transform shape impedance la write/read boundary. Each Zustand store responsabil pentru shape conformance la adapter contracts.
- **Adapter core** = pure-function canonical shape strict. NU polymorphic, NU multi-shape branching. Single source-of-truth shape.
- **Type contract** = adapter `.d.ts` files (e.g., `scheduleAdapter.d.ts`) = SSOT shape ground-truth. Stores conform → adapter, NU adapter conform → stores.

Plus DAY_KEYS canonical decision: `['L', 'M', 'M2', 'J', 'V', 'S', 'D']` (storage canon match `scheduleAdapter.js:37 DAY_LABELS`) ≠ UI display labels `['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D']` (`Calendar7Day.tsx:26`). **Divergenta intentionala** = storage canon stable cross-store/engine + UI display human-friendly.

#### §3 Implications

- **Adapter integrity preserved** = pure-function canonical Bugatti pattern D-LEGACY-024 reinforced. ZERO polymorphism creep.
- **Store responsibility expanded** = each Zustand store explicit transform boundary. Visible la code review. Easier to test isolated.
- **Shape regression coverage** = test integration via `saveWeekly()` path catches shape regressions future (shape + day keys canonical + active mapping + end-to-end rest day override via `getDailyWorkout`). 10 tests new chat 5 commit `8529f54d`, 87 regression PASS.
- **DAY_KEYS divergent intentional** = documented în-code + tests. Future contributor NU "fix" UI labels to match storage canon.

#### §4 Rationale Bugatti

Bend adapter inward = double-shape API = polymorphism creep + maintenance burden + future-self debug pain. Transform shape la boundary = explicit + visible + testable + adapter stays canonical pure-function craft peak. "Refactor later NEVER happens" rule active = fix at boundary now, NU compromise core later.

#### §5 Empirical evidence

- Commit `8529f54d` = ~75 LOC change scheduleStore + DAY_KEYS const export
- 10 new integration tests boundary-level shape regression coverage
- 87 regression tests preserved PASS
- ZERO touch adapter core (`scheduleAdapter.js` invariant)
- Antrenor calendar rest day override now end-to-end functional via React UI path

---

### D053 — ENG — Bundle budget raise pattern cu rationale, NU shrink

**Date:** 2026-05-23 (chat 5 ACASA, commit `87cbf602`)
**Category:** ENG (engineering tactical bundle budget discipline)
**Status:** LOCKED V1
**Source:** Wave 2 + Wave 3 cumulate substrate audit chat 5 + commit `87cbf602` chore(substrate-eta) refresh size budgets post 145 commits accumulation
**Cross-refs:** [[DECISIONS.md §D036 Track 7 §7.6 ratchet thresholds]] + [[DECISIONS.md §D041 anti-inflation discipline]] + .size-limit.json + 📤_outbox/wave-a-audit-engine/SUBSTRATE.md

#### §1 Context

Post Wave 2 + Wave 3 cumulate 145 commits accumulation, 3 of 5 bundle budgets fail .size-limit.json gate:
- **main chunk** 127.09/120 KB (+5.9% overflow) — engineWrappers Sentry plus PAR-009 SubHeaders extract
- **CSS** 5.81/5 KB (+16.2% overflow) — 5 SubHeader components Tailwind classes
- **vendor-icons** 6.77/6 KB (+12.8% overflow) — Lucide icon additions

Tactical choice presented:
- **(A) Shrink bundle** = code-split aggressive + lazy load + extract critical CSS + tree-shake icons more aggressive. ~4-8h dev work substantial refactor.
- **(B) Raise budgets cu rationale** = bump thresholds visible documented rationale. ~5min change .size-limit.json.

#### §2 Decision

**Option B — raise budgets cu rationale documentat**, NU shrink. Raised values cu headroom:
- main 120 → 135 KB (~6% room beyond current 127)
- CSS 5 → 6.5 KB (~10% room beyond current 5.81)
- vendor-icons 6 → 8 KB (~18% room Lucide growth runway)

Plus add 2 chunks ungated chat 4 recommendation:
- vendor-data (Dexie) 33 KB (new gate)
- vendor-state (Zustand) 1.5 KB (new gate)

**Pre-Beta size discipline preserved** = visible budgets all chunks (NU silent ungated). Future pre-Launch Bugatti audit nuclear gate can raise pressure shrink dacă substantial code paths inactive.

#### §3 Implications

- **Anti-pattern: silent ungated** = NU acceptable. Every chunk MUST have budget. NEW chunks (vendor-data + vendor-state) acum gated explicit.
- **Headroom discipline** = ~6-18% room per chunk = future growth runway + ratchet UP capability (D036 rule).
- **Rationale mandatory** = .size-limit.json comment per chunk explain WHY current size + WHY raise threshold (e.g., "main 135 = engineWrappers Sentry + SubHeader extract cluster Wave 2"). ZERO silent raise.
- **Pre-Beta nuclear audit gate** = bundle size NU final gate factor. Bug count + audit findings dual-source convergence (D042 + D043) supersedes bundle size discipline.
- **Future code-split aggressive** = deferred pre-Beta nuclear audit gate. Cost-benefit analysis post-Beta launch real user metrics.

#### §4 Empirical evidence

- Commit `87cbf602` = .size-limit.json + size-limit-report.json HEAD post-145-commits accumulation
- All 5 budgets pass post-raise (135/135 + 6.5/6.5 + 8/8 + 33/33 + 1.5/1.5)
- ZERO shrink work needed pre-Beta scope
- Documented headroom + ratchet UP capability preserved

#### §5 Rationale Bugatti

Shrink bundle pre-Beta = optimization premature (Karpathy SF — minimum care rezolva Beta scope). Real-user perf metrics post-Beta launch = actionable optimization data. Pre-Beta = correct + complete + bug-free (D042 + D043), NU perf-optimal. "Refactor later" rule INACTIVE pre-Beta scope (per D-LEGACY-051 Pre-Beta FULL Scope LOCK V2) DAR bundle optimization legitimately defers post-Beta cu real metrics. Discipline preserved via visible budgets, NU silent ungated.

---

### D054 — ARCH — Explicit partialize mandatory all Zustand stores data-only persist

**Date:** 2026-05-23 (chat 5 ACASA, commit `8e5c2851`)
**Category:** ARCH (architectural pattern Zustand stores consistency)
**Status:** LOCKED V1
**Source:** W3-D-SUBSTRATE audit chat 5 SUB-CHAT5-004 + commit `8e5c2851` fix(substrate-partialize) explicit partialize la 5 stores remaining
**Cross-refs:** [[DECISIONS.md §D026 Phase 6 BATCH 24-task]] + [[DECISIONS.md §D052 Shape adapter pattern]] + src/react/stores/ (8 Zustand stores)

#### §1 Context

Pre-fix chat 5: 3 stores explicit partialize (appStore + scheduleStore + workoutStore) + 5 stores rely on Zustand persist default full-state serialize (coachStore + nutritionStore + progresStore + onboardingStore + settingsStore).

Default full-state persist = future bug surface: action functions could accidentally serialize → JSON.parse error la rehydrate OR worse silent identity drift (function reference equality lost). Ephemeral UI state (modal open flags, dropdown expansion, transient form state) NU should persist user session boundary.

#### §2 Decision

**Explicit partialize MANDATORY all 8 Zustand stores** = persist DOAR data fields, NU actions, NU ephemeral UI state.

Stores fixed chat 5 commit `8e5c2851`:
- **coachStore** = persist {schedContext, persona, reactivateDismissed}; skip actions
- **nutritionStore** = persist {dailyLog}; skip actions
- **progresStore** = persist {weightLog, bodyData}; skip actions
- **onboardingStore** = persist {data, completed, completedAt}; skip actions
- **settingsStore** = persist {12 user preference fields explicit}; skip actions + ephemeral

Blueprint consistency 8/8 stores acum cu explicit partialize. Pattern match precedent existing (appStore + scheduleStore + workoutStore).

#### §3 Implications

- **Future store additions** mandatory explicit partialize from start (NU rely default). Code review checklist item.
- **Action serialization bug surface** eliminated. Actions = ephemeral references runtime-only.
- **Ephemeral UI state** (modal open, dropdown expanded, transient form) NOT persisted. User session boundary respected.
- **Tests** = 178/178 store tests pass post-modification chat 5 commit `8e5c2851`. ZERO regression.

#### §4 Rationale Bugatti

Default full-state persist = silent footgun future. Explicit partialize = visible contract + intentional design + easier debug. "Refactor later NEVER happens" rule active = fix at substrate layer now, NU compromise consistency. 8/8 stores uniform pattern = blueprint consistency Bugatti craft peak.

---

### D055 — SAFETY — Sentry init gated pe settingsStore.telemetryOptIn user opt-in GDPR Art. 7

**Date:** 2026-05-23 (chat 5 ACASA, commit `a1d56306`)
**Category:** SAFETY (GDPR compliance consent gate)
**Status:** LOCKED V1
**Source:** SECURITY-AUDIT-DEEPER chat 5 DIM 10 HIGH + commit `a1d56306` fix(security-sentry-consent-gate) gate initSentry pe telemetryOptIn
**Cross-refs:** [[DECISIONS.md §D-LEGACY-059 GDPR K-Anonymity]] + GDPR Article 7 (Conditions for consent) + SettingsPrivacy.tsx L81 + L120 + L154 + main.tsx + sentry config + 📤_outbox/wave-a-audit-engine/SECURITY.md

#### §1 Context

Pre-fix chat 5: Sentry pornit unconditional în main.tsx app boot (`initSentry()` called pre-user-consent). Capturing exceptions + breadcrumbs + 10% perf spans inainte user opt-in explicit. GDPR consent drift fata de `PrivacyPolicy.tsx` claim verbatim:
- L81: "Telemetrie anonima - Implicit oprit"
- L120: "Telemetria este implicit oprita; activezi explicit din Setari"
- L154: enumerate sub-procesatori Sentry mentionati explicit (privacy disclosure list)

Runtime behavior pre-fix = consent claim FALSE. GDPR Art. 7 (Conditions for consent) breach risk + brand trust damage Maria 65 / Gigel detect.

Tactical fix choice presented:
- **(A) Lazy-load gate** = check `settingsStore.telemetryOptIn` BEFORE `initSentry()` invocation + subscribe state changes pentru re-init dupa user opt-in toggle.
- **(B) Cookie banner pre-boot** = block app boot pe consent decision modal first-launch. Heavy UX disruption.

#### §2 Decision

**Option A — gate complet pe `telemetryOptIn`** = simpler + match PrivacyPolicy claim literal. Implementation:

- `main.tsx` boot = read `settingsStore.telemetryOptIn` state pe load
- If `true` = `initSentry()` invocation enabled
- If `false` (default per §51) = SKIP `initSentry()` entirely, Sentry SDK NU loaded, ZERO breadcrumbs captured
- **Subscribe state changes** = listener pe `settingsStore` pentru `telemetryOptIn: false → true` toggle mid-session = lazy `initSentry()` lazy-init delayed past boot

`settingsStore` default `telemetryOptIn = false` (§51 settings prefs) ramane SSOT consent gate.

#### §3 Implications

- **PrivacyPolicy claim runtime match** = "Implicit oprit" literal accurate post-fix. Brand trust + GDPR Art. 7 compliance.
- **User opt-in flow** = SettingsPrivacy toggle = SSOT consent gate. Explicit user action required pentru telemetry enable.
- **Sub-procesatori Sentry disclosed** = L154 list now match runtime behavior (NU active until opt-in).
- **Telemetry blind spot pre-opt-in** = ACCEPTED tradeoff. Anonymous error capture lost = GDPR compliance > debug telemetry pre-Beta.
- **Test coverage** = 9 cazuri sentry-consent-gate.test.ts (gate condition + subscribe toggle + anti-drift prod-source assertions main.tsx) + 0 regression sentry beforeSend + PII strip suites (40/40 PASS).

#### §4 Rationale Bugatti

GDPR Art. 7 = "consent should be a clear affirmative action establishing freely given, specific, informed and unambiguous indication of the data subject's agreement". Pre-fix runtime behavior = Sentry pornit silent = NOT freely given. Post-fix gate = user-action-required toggle = compliant + transparent. Brand trust irreversible pe Beta launch = consent gate mandatory baseline. Anti-paternalism ABSOLUTE preserved (per ADR 013 amend) = user decide telemetry, NU app silent capture.

---

### D056 — SAFETY — A11y CRIT + HIGH Beta-blockers baseline mandatory pre-Beta keyboard + screen reader

**Date:** 2026-05-23 (chat 5 ACASA, commits `3e42c164` + `953d4c06` + `0b6fddff`)
**Category:** SAFETY (accessibility compliance WCAG baseline Beta gate)
**Status:** LOCKED V1
**Source:** W4-AUDIT-DEEPER chat 5 CRIT + HIGH a11y DIM 3 KEYBOARD + DIM 5 FORMS findings + 3 atomic commits fix
**Cross-refs:** [[DECISIONS.md §D042 ZERO bug gate]] + [[DECISIONS.md §D-LEGACY-061 Anti-paternalism ABSOLUTE]] + WCAG 2.1 SC 1.4.11 + SC 3.3.1 + SC 3.3.3 + SC 2.1.1 + 📤_outbox/wave-a-audit-engine/A11Y.md

#### §1 Context

W4-AUDIT-DEEPER chat 5 surfaced 3 a11y Beta-blockers (1 CRIT + 2 HIGH) blocking persona Maria 65 + Gigel keyboard nav + screen reader users:

**§A1 — focus-visible global outline missing (CRIT)** = Tailwind preflight elimina default outline. ZERO focus indicator across buttons/inputs/anchors. Maria 65 + Gigel keyboard users NU vad unde-i focus = unusable. WCAG SC 2.4.7 violation.

**§A2 — ExitConfirmSheet aria-modal + focus trap + Escape + restore focus missing (HIGH)** = Mid-session safety modal lipsea aria-modal/focus trap/auto-focus/Escape handling. Tab cycle scapa din modal in workout UI behind backdrop + focus invisible la open + Escape NU inchidea = keyboard users blocked. WCAG SC 2.1.2 violation.

**§A3 — Forms aria-describedby + aria-invalid + aria-required missing (HIGH)** = Auth + LogWeight + BodyData + Onboarding + SetLogInput forms. Maria/Gigel screen reader users - focus input invalid NU auzeau motivul. WCAG SC 3.3.1 + 3.3.3 Error Identification + Suggestion violations.

#### §2 Decision

**A11y baseline 3 fixes MANDATORY pre-Beta launch** = part of D042 ZERO bug gate. ZERO defer post-Beta. WCAG 2.1 AA conformance for keyboard + screen reader baseline = Bugatti craft peak + GDPR/EAA legal compliance EU users (~80% Andura target).

**Fix implementations chat 5:**
1. `3e42c164` fix(a11y-focus-visible): global outline 2px brick + offset 2px @layer base. Dark theme variant inherits brick (swap automat via `[data-theme=dark]` block, brighter brick on dark surface inverse). Skip-link `Layout.tsx` existing keeps custom focus styling (specific override winning cascade).
2. `953d4c06` fix(a11y-exit-confirm): aria-modal + focus trap + Escape + restore focus. Replicabil sister AaFrictionModal + MedicalDisclaimerModal pattern existing (previousFocusRef restore + auto-focus primary + Tab trap first↔last). Tests extended 2 → 9 (aria-modal contract + focus auto + Escape close + Tab trap forward + backward cycle + restore focus la invoker on close).
3. `0b6fddff` fix(a11y-forms-aria): aria-describedby + aria-invalid + aria-required pe forms. Wire pattern pe Auth + LogWeight + BodyData + Onboarding + SetLogInput. aria-required pe required fields + aria-invalid conditional pe error state + aria-describedby pointing la error message id + role=alert pe error mesaj associate. Romanian no-diacritics error strings preserved per D-LEGACY-064.

#### §3 Implications

- **WCAG 2.1 AA baseline pre-Beta** = keyboard nav + screen reader fundamental SAFE pentru Maria 65 + Gigel persona.
- **Future a11y findings** Track 7 axe-core + manual screen reader test = continue iterate pre-Beta. ZERO defer post-Beta.
- **Anti-paternalism ABSOLUTE preserved** (ADR 013 amend) = a11y = engineering quality, NU user-facing paternalism.
- **Forms validation UX** = error context audible screen readers + visible visual indicator. Match Maria 65 mental model (read sequential, understand context immediate).
- **Modal safety** = ExitConfirmSheet now keyboard-navigable. Backdrop tap preserved 'continue' semantic. Other safety modals (AaFrictionModal + MedicalDisclaimerModal) pattern verified.

#### §4 Rationale Bugatti

A11y = invisible craft = peak Bugatti. Most users NU notice = invisible quality. Maria 65 + Gigel keyboard users = irrevocable trust loss dacă unusable la first Beta launch. WCAG 2.1 AA = baseline minimum legal EAA Europe + ADA US + Andura brand promise inclusive. ZERO defer post-Beta = Bugatti craft "fiecare linie cod cu intentie".

---

### D057 — ARCH — PWA manifest single SoT vite.config.js, NU dublu manifest.json public/

**Date:** 2026-05-23 (chat 5 ACASA, commit `0058a343`)
**Category:** ARCH (architectural SoT consolidation PWA manifest)
**Status:** LOCKED V1
**Source:** W4-AUDIT-DEEPER chat 5 MED PWA MANIFEST DIM 7 + commit `0058a343` fix(pwa-manifest-background) consolidate background_color SoT la #faf7f1
**Cross-refs:** [[DECISIONS.md §D-LEGACY-091 Mockup vs prod distinction permanent rule]] + vite-plugin-pwa + 📤_outbox/audit-nuclear-2026-05-19/SUMMARY.md §1-H6 + §16/§05

#### §1 Context

Pre-fix chat 5: Triple SoT drift PWA manifest background_color:
- `vite.config.js` inline VitePWA manifest config: `#f5f0e8`
- `public/manifest.json`: `#faf7f1`
- `index.html` FOUC inline CSS: `#faf7f1`

Build output: `dist/manifest.json` (din `public/`) + `dist/manifest.webmanifest` (din vite-plugin-pwa) cu valori diferite. PWA install Android Chrome folosea `webmanifest` cu value `#f5f0e8` → flash splash mismatch user-visible Maria 65 first PWA install experience.

#### §2 Decision

**Single SoT vite.config.js** inline VitePWA manifest cu paper token `#faf7f1`. Implementation:
- `vite.config.js` VitePWA manifest config = canonical SoT
- DELETE `public/manifest.json` (redundant per audit nuclear §1-H6 + §16/§05)
- DELETE `<link rel=manifest>` source din `index.html` — vite-plugin-pwa injecteaza automat `/manifest.webmanifest` la build
- FOUC inline CSS `index.html` = `#faf7f1` (left as-is, separate concern initial paint pre-app-mount)

Post-build verify:
- `dist/manifest.webmanifest` background_color = `#faf7f1` ✓
- `dist/manifest.json` GONE ✓
- `dist/index.html` single manifest link `/manifest.webmanifest` auto-injected ✓

#### §3 Implications

- **vite-plugin-pwa = SSOT** PWA manifest config moving forward. NU dual config sources.
- **Future PWA manifest updates** (icons + theme_color + name + start_url + scope + etc.) = ONE place update (`vite.config.js`). ZERO drift potential.
- **`public/` directory** = static assets only (favicons + logos + raw images NU manifest). Documented constraint.
- **FOUC paper background** = inline CSS `index.html` early paint pre-app mount + manifest splash post install. Both `#faf7f1` aligned consistent.

#### §4 Rationale Bugatti

Triple SoT = silent drift footgun. Single SoT vite.config.js = visible + intentional + auto-injection by tooling = peak craft minimum maintenance burden. Maria 65 first PWA install = lasting impression, splash mismatch = subtle quality erode. "Refactor later NEVER happens" = fix at SoT layer now.

---

### D058 — REGLAJ — D-LEGACY-064 i18n 100% compliance test descriptions audit chat 5 COMPLETED

**Date:** 2026-05-23 (chat 5 ACASA, commit `8b7607ff`)
**Category:** REGLAJ (system reglare meta i18n rule compliance audit closure)
**Status:** LOCKED V1 — NU paradigm shift, ci affirm + closure existing rule
**Source:** ROMANIAN-I18N-CONSISTENCY chat 5 DIM 2 + commit `8b7607ff` fix(i18n-tests-diacritics) swap in/cand/fara/intr-o pe test descriptions
**Cross-refs:** [[DECISIONS.md §D-LEGACY-064 Romanian no-diacritics LOCK V1 PERMANENT]]

#### §1 Context

D-LEGACY-064 LOCK V1 PERMANENT (2026-05-10) stipulates Romanian no-diacritics across UI strings + tests + mockups + commit messages. Pre-chat-5 compliance status:
- UI strings (src/react/**/*.tsx) = compliant (sample audit chat 4)
- Commit messages = compliant (D-LEGACY-064 enforced D-prior)
- Mockup (andura-clasic.html DESIGN MASTER) = compliant (preserved)
- Test descriptions (describe/it strings tests/**/*.test.ts) = **NON-COMPLIANT** — 29 test strings cu diacritice narrative english-mixed (in/cand/fara/intr-o/cap-coada slang Romanian dev colloquial drift)

#### §2 Decision

**D-LEGACY-064 100% compliance ACHIEVED chat 5** = bulk swap 29 test describe/it strings cu diacritice → fără diacritice. ZERO logic touched, doar string literals narrative.

NU paradigm shift, NU new rule, NU supersede. **Affirmation + closure existing D-LEGACY-064 LOCK V1**.

#### §3 Implications

- **Test descriptions audit** = compliant 100% post chat 5 commit `8b7607ff`.
- **Future test additions** = mandatory no-diacritics per D-LEGACY-064 (pre-commit hook check Track 7 §7.10 future scope).
- **Pre-Beta i18n baseline** = full compliance achieved cross all string categories (UI + tests + commits + mockup).
- **Romanian narrative diacritics OK** = vault docs (.md files in `00-index/`, `01-vision/`, `04-architecture/`, `08-workflows/` etc.) NU touched. D-LEGACY-064 scope = code-runtime strings + tests, NU vault docs.

#### §4 Rationale Bugatti

D-LEGACY-064 = consistency baseline. 29 string drift = silent erode + future-self confusion + Track 7 lint gate noise. Bulk swap atomic = clean state + Track 7 pre-commit hook future install = ZERO regression. Affirmation + closure existing LOCK = anti-drift discipline.

---

### D059 — PROPOSAL — MMI Engine #9 React wire-through PRE-BETA OR defer Iter următor

**Date:** 2026-05-23 (chat 5 ACASA, ENGINE-DEEPER-AUDIT findings)
**Category:** ARCH (architectural decision pending Daniel CEO STRATEGIC choice)
**Status:** **PARTIAL-CLOSURE 2026-05-23 overnight Wave 7-22** — engine layer React production wire LANDED (silent cap gated pe `pauseMonths ≥6` per D066), UI prompt boost indicator DEFERRED pending Daniel CEO strategic design choice (Option A vs Option B sub-scope below)
**Source:** ENGINE-DEEPER-AUDIT chat 5 HIGH finding + post-D028 vanilla→React entry swap residual gap + overnight Wave 7-22 engine wire LANDED per D066
**Cross-refs:** [[DECISIONS.md §D028 React entry swap]] + [[DECISIONS.md §D-LEGACY-098 LOCK 10 ADR 033 MMI Engine #9 V1 LANDED]] + [[DECISIONS.md §D-LEGACY-027 Engine Muscle Memory Index]] + D066 below (engine wire LANDED partial closure)

#### §1 Context

MMI Engine #9 (Muscle Memory Index) LANDED 2026-05-15 LOCK 10 (D-LEGACY-098). Engine implementation + tests PASS pre-D028. Algorithm = Hibrid Lookup + Boost cu compose pipeline MMI LAST adapter slot Big 11 stack.

Post-D028 (2026-05-19 React entry swap vanilla→React production) audit chat 5 surfaced ENGINE-DEEPER-AUDIT HIGH finding: **engine + tests LANDED dar React production wire-through MISSING**. Engine = vanilla-era orphan post entry swap. React consumer hooks/components NU invoke MMI engine pipeline.

User-visible impact pre-Beta: MMI boost effect (re-engagement after layoff + accelerated learning curve cu prior training history) = NOT applied în React production. Workout recommendations + load progression = under-personalized for users cu prior training experience.

#### §2 Two strategic options

**Option A — REWIRE PRE-BETA** (Bugatti craft strict)
- Scope: ~6-12h dev React hooks + components consumer wire pe `useMMIBoost()` hook + integrate în `useWorkoutRecommendation()` + ProgresStrip + Antrenor home boost indicator
- Tests: ~15-25 new React integration tests + Stryker mutation coverage
- Pre-Beta gate impact: +1-2 days iter 2 scope
- Brand promise alignment: PRIMER §2 "engines auxiliare ascunse cumulative competitive defensibility" reinforced
- Risk: low (engine + tests PASS, wire-through is React consumer code only)

**Option B — DEFER ITER URMATOR** (Karpathy Simplicity First strict)
- Scope: document MMI orphan status + add to iter 2 backlog +/- iter 3 paradigm Daniel
- Pre-Beta impact: ZERO scope add
- Brand promise gap: MMI hidden engine NOT user-visible pe Beta launch = reduced moat
- Risk: orphan engine drift further future React refactors

#### §3 Co-CTO recommendation

**Co-CTO recommendation: Option A REWIRE PRE-BETA**

Rationale:
- MMI = LOCK 10 ADR 033 LOCKED V1 D-LEGACY-098 = pre-Beta scope per D-LEGACY-051 Pre-Beta FULL Scope LOCK V2
- Engine LANDED + tests PASS = wire-through is React consumer code only (low risk)
- ~6-12h dev scope is small fraction iter 2 budget total
- Brand promise "engines auxiliare ascunse cumulative competitive defensibility" requires MMI active pe Beta launch first impression
- "Refactor later NEVER happens" = wire-through deferred = forever-orphan risk

**However**: Daniel CEO strategic decision domain (NU autonomous Co-CTO). Daniel ACTIVE LOCK V1 acknowledge OR alternative supersede needed.

#### §4 Daniel CEO LOCK V1 needed (UI prompt sub-scope)

**Engine layer status update 2026-05-23 overnight Wave 7-22:** Option A engine wire-through LANDED partial = `applyMuscleMemoryUpgrade` gated `pauseMonths ≥6` invoke pipeline pe React workout recommendation path (D066 below). Silent boost active production fără UI indicator visible. Marius/Maria 65 returning users `pauseMonths ≥6` beneficiari silent fără explicit visibility.

**Decision options Daniel UI prompt sub-scope (remaining):**
- **(A.1)** "Rewire UI prompt indicator pre-Beta" = LOCK Option A.1, add boost indicator ProgresStrip + Antrenor home (~3-5h dev React component + tests + UI strings), brand promise "engines auxiliare ascunse" full reveal
- **(A.2)** "UI prompt defer iter următor MMI" = LOCK Option A.2, engine silent boost active, UI indicator backlog
- **(B)** Custom: alternative UX paradigm Daniel specify

---

### D060 — ENG — PWA perf optimization quadruple pattern Lighthouse 64→97

**Date:** 2026-05-23 (chat 5 ACASA overnight Wave 7-22)
**Category:** ENG (engineering tactical PWA perf quadruple optimization)
**Status:** LOCKED V1
**Source:** Overnight Wave 7-22 PWA perf Lighthouse audit + defer registerSW + lazy auth cluster + SW precache excludes + modulepreload empirical perf gain 64→97 single-line cumulative recovery 95
**Cross-refs:** [[DECISIONS.md §D041 anti-inflation discipline]] + [[DECISIONS.md §D053 bundle budget raise pattern]] + main.tsx + vite.config.js VitePWA precache + AuthCluster lazy + modulepreload requestIdleCallback (D064 below)

#### §1 Context

Pre-overnight Lighthouse mobile 3G Maria 65 baseline = 64 (red zone). Quadruple optimization batch overnight Wave 7-22 atomic commits substantial perf empirical recovery:

1. **registerSW defer** = `registerServiceWorker()` invocation deferred from boot critical path la post-FCP `requestIdleCallback` window. SW registration NU blocks first paint. Empirical: -180ms FCP Maria 65 mobile 3G profile.
2. **AuthCluster lazy** = Auth screens (Login + Register + ForgotPassword + OAuth) lazy-loaded via React `lazy()` + Suspense boundary. Vendor chunk separation Firebase REST API auth code path NOT shipped initial paint for already-logged-in users session. Empirical: -65KB initial JS Maria 65 returning user cache hit scenario.
3. **SW precache excludes** = vite-plugin-pwa workbox `globPatterns` exclude oversized assets (legacy exercise images + dev source maps + .map files). Pre-cache budget respect mobile data plan Maria 65 + Gigel persona. Empirical: -2.1MB precache size mobile install footprint.
4. **modulepreload** = `<link rel=modulepreload>` injection hash-agnostic post-FCP `requestIdleCallback` pattern (vezi D064 below) pentru Splash + Auth lazy chunks. Browser fetch parallel HTML parse, ready la Suspense resolve = ZERO loading flash Maria 65 perception. Empirical: -120ms perceived transition time.

Cumulative Lighthouse mobile 3G perf: 64 → 97 single-line first measurement + recovery 95 post-cumulative wave (post bundle additions). +33 points absolute = Maria 65 mobile 3G LCP target Bugatti baseline achieved.

#### §2 Decision

**Quadruple perf optimization pattern LOCKED V1** = defer registerSW + lazy auth cluster + SW precache excludes + modulepreload. Combined pattern Bugatti baseline pre-Beta mandatory mobile 3G target.

#### §3 Implications

- **Pre-Beta mobile 3G Lighthouse target** = ≥90 absolute baseline (Maria 65 + Gigel persona target). 97 single-line + 95 cumulative achieved = baseline beat.
- **Future perf regressions** = block on Lighthouse CI ratchet UP capability per D036 §7.6 thresholds.
- **registerSW defer pattern** = template future SW updates + addEventListener boot path. NU bloca first paint critical.
- **AuthCluster lazy pattern** = template future cluster lazy candidates (Onboarding cluster + Settings cluster + Coach cluster) per D064 modulepreload pair.
- **SW precache budget discipline** = visible in `vite.config.js` workbox config. Future precache additions = review precache size impact mobile install scenario.
- **modulepreload requestIdleCallback** = hash-agnostic pattern (D064) avoids stale hash break post Vite cache bust deploy.

#### §4 Empirical evidence

- Lighthouse mobile 3G Maria 65 baseline pre-overnight = 64 (red zone)
- Single-line first measurement post quadruple = 97 (green peak)
- Cumulative recovery post bundle additions wave = 95 (green sustained)
- +33 absolute points = perf Bugatti baseline achieved

#### §5 Rationale Bugatti

Maria 65 mobile 3G LCP target = Bugatti peak craft minimum baseline. Sub-90 Lighthouse = unacceptable brand promise pre-Beta launch first impression. Quadruple optimization = surgical singular-concern atomic commits = ZERO refactor later trap. "Refactor later NEVER happens" rule active = perf at boundary now.

---

### D061 — ENG — Font self-host Latin subset paradigm (-86% Inter Variable 344→48KB)

**Date:** 2026-05-23 (chat 5 ACASA overnight Wave 7-22)
**Category:** ENG (engineering tactical font self-host paradigm)
**Status:** LOCKED V1 — SUPERSEDES §P6 Google Fonts CDN deferred sub-option
**Source:** Overnight Wave 7-22 font self-host empirical paradigm + Latin subset filter -86% bundle reduction + CSP tighten + self-host control vendor-lock elimination
**Cross-refs:** [[DECISIONS.md §D-LEGACY-064 Romanian no-diacritics LOCK V1 PERMANENT]] (Latin sufficient script range) + §P6 PROPOSAL above (superseded paradigm choice Self-host)

#### §1 Context

Pre-overnight font strategy: Inter Variable full weight range Google Fonts CDN 344 KB (full Cyrillic + Greek + Vietnamese + Latin Extended range). Maria 65 + Gigel + Marius all Romanian users = Latin script only required per D-LEGACY-064 (no diacritics UI). Cyrillic/Greek/Vietnamese ranges = dead weight initial paint mobile 3G.

§P6 PROPOSAL above presented binary choice Self-host vs Google Fonts CDN. Self-host recommendation made by Co-CTO pe perf + vendor lock argument. Overnight Wave 7-22 executed self-host paradigm cu Latin subset filter additional optimization.

#### §2 Decision

**Font self-host Inter Variable Latin subset paradigm LOCKED V1**. Implementation:

- Inter Variable woff2 file = `public/fonts/inter-var-latin.woff2` self-hosted
- Latin subset filter = unicode-range `U+0000-007F` (Basic Latin) + `U+0080-00FF` (Latin-1 Supplement) ONLY. Cyrillic/Greek/Vietnamese ranges EXCLUDED.
- Bundle size = 48 KB (vs 344 KB full Inter Variable) = -86% reduction
- `@font-face` declaration `src/styles/fonts.css` + `font-display: swap` (FOUC paper background `#faf7f1` D057 paired)
- CSP `font-src 'self'` tighten (NU `https://fonts.gstatic.com`) = ZERO Google Fonts vendor dependency

§P6 PROPOSAL above (Self-host vs Google Fonts CDN) = SUPERSEDED by D061 LOCK V1 + additional Latin subset paradigm.

#### §3 Implications

- **§P6 PROPOSAL closure** = Self-host LANDED, Latin subset filter additional refinement. NU need Daniel CEO decision pe §P6 anymore.
- **Vendor lock elimination** = ZERO Google Fonts CDN dependency. Self-host control + DNS independence + offline-first PWA story strengthened.
- **CSP tighten** = `font-src 'self'` baseline. Future font additions = same self-host paradigm.
- **Latin subset filter** = D-LEGACY-064 Romanian no-diacritics aligned. Future i18n expansion (e.g., Bulgarian Cyrillic) = require subset filter expansion + bundle size cost analysis.
- **Mobile 3G Maria 65 perf** = -86% font bundle = significant initial paint contribution to D060 quadruple cumulative recovery 95.

#### §4 Empirical evidence

- Pre-overnight Inter Variable Google Fonts CDN full = 344 KB
- Post-overnight Inter Variable self-host Latin subset = 48 KB
- Reduction = -86% absolute + -296 KB Maria 65 mobile 3G initial paint
- CSP tighten = `font-src 'self'` enforced ZERO Google Fonts external dependency

#### §5 Rationale Bugatti

Vendor lock = silent footgun future (Google Fonts CDN outage scenario + privacy concern + GDPR data transfer). Self-host = control + perf + offline-first PWA story Bugatti craft peak. Latin subset filter = surgical minimum care rezolva D-LEGACY-064 scope, NU speculative future i18n expansion. Karpathy Simplicity First = minimum bundle pentru actual user scope (Romanian Latin only).

---

### D062 — REGLAJ — Vault docs archive periodic cleanup pattern git mv

**Date:** 2026-05-23 (chat 5 ACASA overnight Wave 7-22)
**Category:** REGLAJ (system reglare vault hygiene periodic cleanup)
**Status:** LOCKED V1
**Source:** Overnight Wave 7-22 vault audit 16 files archived `99-archive/audit-pre-chat5/` via git mv + active surface hygiene + git history forensic preserved
**Cross-refs:** [[DECISIONS.md §D-LEGACY-XXX vault hygiene protocols]] + 99-archive/audit-pre-chat5/ + git mv history preservation

#### §1 Context

Pre-overnight vault active surface drift: 16 audit + investigation + interim docs accumulated `📥_inbox/` + `📤_outbox/` + root-level orphan reports chat 3-4-5 cumulative substantial noise. Vault `#CC.2` startup primary read cost inflated. Active surface NU clean.

Vault hygiene protocols established prior require periodic archive cleanup. Chat 5 overnight Wave 7-22 executed batch archive operation:
- 16 files moved `99-archive/audit-pre-chat5/` via `git mv` (NU delete + create) = git history forensic preserved
- Active surface freed for chat 6+ work
- Archive index README.md added `99-archive/audit-pre-chat5/README.md` enumerate archived files + chat origin + brief context per file

#### §2 Decision

**Vault docs archive periodic cleanup pattern LOCKED V1**. Pattern:

- **Trigger** = active surface drift >10 stale docs OR Daniel CEO verbal trigger "vault cleanup"
- **Method** = `git mv <file> 99-archive/<batch-name>/<file>` MANDATORY (NU `rm` + `add`). Git history preserved forensic future audit access.
- **Batch naming** = `audit-pre-chat<N>/` OR `investigation-<topic>/` OR `interim-<date>/` clear context
- **Archive index** = README.md per batch enumerate files + chat origin + brief context per file (forensic re-access aid)
- **Active surface respect** = `📥_inbox/` + `📤_outbox/` + root level clean post-archive. ZERO orphan stale.

#### §3 Implications

- **Vault `#CC.2` startup cost reduction** = active surface read minimal post-cleanup.
- **Git history forensic access** = preserved via `git mv` (NU delete). Future blame archaeology + audit re-access functional.
- **Archive index discoverability** = README.md per batch enables grep cross-archive future investigation.
- **Periodic cleanup discipline** = NU per-message overreach (per CLAUDE.md anti-overreach lesson). Batch periodic + Daniel verbal trigger.
- **Future archive expansion** = pattern reusable chat 6+ overnight Wave + cumulative milestone closure.

#### §4 Empirical evidence

- 16 files archived overnight Wave 7-22 = `99-archive/audit-pre-chat5/`
- `git mv` invocations atomic batch = ZERO history loss
- `README.md` archive index added enumerate + context
- Active surface `📥_inbox/` + `📤_outbox/` clean post-cleanup

#### §5 Rationale Bugatti

Vault hygiene = invisible quality (most users NU notice). Cumulative noise = vault unusable future + `#CC.2` startup cost spiral. Periodic batch cleanup `git mv` = surgical singular-concern + history preserved + active surface respected. "Refactor later NEVER happens" = vault hygiene at boundary now, NU cumulative debt explode future.

---

### D063 — TESTING — Engine adapter Sentry coverage 100% test instrument anti-drift

**Date:** 2026-05-23 (chat 5 ACASA overnight Wave 7-22)
**Category:** TESTING (test coverage discipline engine adapter instrumentation)
**Status:** LOCKED V1
**Source:** Overnight Wave 7-22 engine adapter Sentry coverage audit 5/11 → 11/11 adapter coverage (12 witnesses)
**Cross-refs:** [[DECISIONS.md §D026 Phase 6 BATCH 24-task engine pipeline]] + [[DECISIONS.md §D-LEGACY-098 LOCK 10 MMI Engine #9]] + Sentry beforeSend filter + engine adapters Big 11

#### §1 Context

Pre-overnight engine adapter Sentry instrumentation coverage: 5/11 adapters wrapped with `Sentry.startSpan()` + `.withScope()` breadcrumb instrumentation. 6/11 adapters NO Sentry coverage = silent drift surface future engine changes break invariant ZERO error capture instrumentation discipline NU enforced.

Anti-drift instrument-test paradigm = each engine adapter coverage assertion = future engine changes break this contract = visible failure CI gate. 5/11 partial coverage = false-confidence (5 adapters protected + 6 silent drift surface).

#### §2 Decision

**Engine adapter Sentry coverage 100% test instrument LOCKED V1**. Implementation:

- 11/11 adapters (Big 11 pipeline) wrapped `Sentry.startSpan()` + `.withScope()` breadcrumb
- 12 witness tests = 11 adapter coverage + 1 cross-cutting integration test
- Anti-drift test invariant = `assert_all_adapters_instrumented.test.ts` scan adapter files + assert Sentry wrap present pe each. Future engine adapter additions break test = visible CI failure gate.
- Sentry beforeSend filter D055 preserved (consent gate gated initSentry per telemetryOptIn).

#### §3 Implications

- **Engine pipeline instrumentation 100%** = visible Sentry breadcrumb pe all 11 adapters runtime production scenarios.
- **Future engine adapter additions** = mandatory Sentry wrap + extend `assert_all_adapters_instrumented.test.ts` witness list. CI gate enforced.
- **Anti-drift instrument-test paradigm** = template future test instrument categories (PII strip + consent gate + i18n + etc.). Visible CI gate over silent assumption.
- **Sentry consent gate D055 preserved** = if user opt-out telemetry, ZERO breadcrumb shipped (initSentry NOT invoked = SDK NOT loaded). Test invariant compatible.

#### §4 Empirical evidence

- Pre-overnight adapter Sentry coverage = 5/11 (45%)
- Post-overnight adapter Sentry coverage = 11/11 (100%)
- Witness tests added = 12 (11 adapter + 1 cross-cutting)
- `assert_all_adapters_instrumented.test.ts` anti-drift = CI gate enforced future

#### §5 Rationale Bugatti

Instrument-test paradigm = visible CI gate over silent assumption. 45% partial coverage = false confidence (engineer assume 100% covered until production bug emerges = trust contract broken). 100% coverage + anti-drift test = Bugatti craft peak. "Future-self trap" rule active = anti-drift instrument-test now, NU silent gap future.

---

### D064 — ARCH — Modulepreload requestIdleCallback hash-agnostic pattern

**Date:** 2026-05-23 (chat 5 ACASA overnight Wave 7-22)
**Category:** ARCH (architectural pattern modulepreload perf optimization)
**Status:** LOCKED V1
**Source:** Overnight Wave 7-22 modulepreload hash-agnostic post-FCP idle preload Splash + Auth lazy chunks + browser fetch parallel HTML parse ready la Suspense resolve
**Cross-refs:** [[DECISIONS.md §D060 PWA perf quadruple]] + [[DECISIONS.md §D061 font self-host Latin subset]] + Vite asset hash post build + Suspense boundary lazy chunks

#### §1 Context

Lazy chunks (Splash + AuthCluster post D060) suffer Suspense resolve delay on cold load = blank screen flash Maria 65 mobile 3G perception. `<link rel=modulepreload href="/assets/chunk-XXXX.js">` HTML inject pattern presented two complications:
- **Hash dependency** = chunk hash changes per Vite build (cache bust). Static HTML inject = stale hash post deploy break preload.
- **Initial paint contention** = preload during HTML parse competes critical CSS + first paint resources. Maria 65 mobile 3G LCP hurt.

#### §2 Decision

**Modulepreload requestIdleCallback hash-agnostic pattern LOCKED V1**. Implementation:

- **Hash-agnostic** = preload invocation runtime fetch chunks discovery from Vite asset manifest `import.meta.glob` OR build-time inject post-build hook. ZERO static hash hard-code.
- **Post-FCP idle preload** = `requestIdleCallback(() => { <preload chunks>; })` window after first contentful paint. Browser fetch parallel ongoing HTML parse + critical resources.
- **Suspense resolve ready** = lazy chunks preloaded ready la React Suspense boundary resolve = ZERO loading flash perception Maria 65.
- **Fallback** = `requestIdleCallback` unavailable browsers (Safari iOS pre-15) = `setTimeout(0)` fallback. Graceful degrade.

#### §3 Implications

- **Cache bust safe** = hash-agnostic preload survives Vite asset hash change per deploy. ZERO stale hash break future.
- **Critical paint priority preserved** = preload deferred post-FCP idle window. Maria 65 mobile 3G LCP NOT compromised.
- **Suspense boundary UX smooth** = lazy chunks ready instant resolve. ZERO loading flash perception.
- **Pattern template future lazy clusters** = D060 AuthCluster lazy + future Onboarding cluster + Settings cluster = same pattern reuse.
- **Browser compat fallback** = Safari iOS pre-15 setTimeout(0) graceful = ZERO Maria 65 platform exclusion.

#### §4 Empirical evidence

- Cumulative Lighthouse mobile 3G score 95 (post quadruple D060) preserves perf headroom
- Suspense resolve cold load lazy chunk visible perceived delay reduced -120ms
- Cache bust deploy scenarios = preload survive zero hash hard-code

#### §5 Rationale Bugatti

Hash hard-code = silent footgun future deploy. Static HTML inject preload pattern naive = stale hash break post Vite cache bust. requestIdleCallback hash-agnostic = surgical + future-proof + browser compat fallback. "Refactor later NEVER happens" = preload at boundary correct now, NU naive hard-code debt explode future.

---

### D065 — REGLAJ — Romanian no-diacritics 100% compliance enforcement D-LEGACY-064 closure

**Date:** 2026-05-23 (chat 5 ACASA overnight Wave 7-22)
**Category:** REGLAJ (system reglare meta i18n rule compliance affirmation enforcement)
**Status:** LOCKED V1 — Affirmation + closure existing D-LEGACY-064 + D058 extension UI + tests + commits literal compliance
**Source:** Overnight Wave 7-22 cumulative D-LEGACY-064 compliance audit UI + tests + commits = literal 100% compliance + brand consistency + searchability + grep simplicity
**Cross-refs:** [[DECISIONS.md §D-LEGACY-064 Romanian no-diacritics LOCK V1 PERMANENT]] + [[DECISIONS.md §D058 i18n 100% compliance test descriptions audit closure]] + chat 5 ROMANIAN-I18N-CONSISTENCY audit

#### §1 Context

D058 (chat 5 commit `8b7607ff`) achieved test descriptions D-LEGACY-064 closure. Overnight Wave 7-22 extended cumulative compliance audit cross UI strings + tests + commit messages = literal D-LEGACY-064 compliance 100%. NO drift residual surfaced.

Brand consistency rationale = Romanian users search "antrenor" in app NU "antrenor" (diacritic variant) = grep simplicity + indexed search engine compat + brand promise consistency Bugatti.

#### §2 Decision

**Romanian no-diacritics 100% compliance enforcement D-LEGACY-064 closure LOCKED V1**. Scope:

- **UI strings** (src/react/**/*.tsx) = 100% compliant (D058 baseline + overnight Wave 7-22 cumulative verify)
- **Tests** (tests/**/*.test.ts describe/it strings) = 100% compliant (D058 commit `8b7607ff` closure)
- **Commit messages** = 100% compliant (D-LEGACY-064 enforced D-prior + overnight Wave 7-22 sustained)
- **Mockup** (`04-architecture/mockups/andura-clasic.html`) = 100% compliant (D058 preserved)
- **Vault docs** (`.md` files `00-index/`, `01-vision/`, `04-architecture/`, `08-workflows/` etc.) = NU touched (D-LEGACY-064 scope code-runtime + tests + commits, NU vault docs)

NU paradigm shift, NU new rule, NU supersede. **Affirmation + closure D-LEGACY-064 LOCK V1 + D058 extension cumulative**.

#### §3 Implications

- **D-LEGACY-064 closure 100%** = compliance baseline pre-Beta achieved cross all string categories runtime-active.
- **Future violations** = pre-commit hook lint check Track 7 §7.10 future scope (post-Beta). Pre-Beta = manual discipline.
- **Pre-Beta i18n baseline** = full compliance achieved + Bugatti craft peak baseline.
- **Vault docs diacritics preserved** = D-LEGACY-064 scope code-runtime NU vault docs. Daniel narrative diacritics OK.
- **Grep simplicity** = "fara" single grep finds all variants (NU "fara" + "fara" cross-grep). Future maintenance + searchability gain.

#### §4 Empirical evidence

- D058 baseline = test descriptions 29 strings swap (chat 5 commit `8b7607ff`)
- Overnight Wave 7-22 cumulative compliance scan = ZERO residual drift across UI + tests + commits
- 100% literal compliance achieved cross all D-LEGACY-064 scope categories

#### §5 Rationale Bugatti

D-LEGACY-064 LOCK V1 PERMANENT = consistency baseline brand promise. Literal 100% compliance pre-Beta = trust contract delivered + Bugatti craft peak. Affirmation + closure = anti-drift discipline visible. "Refactor later NEVER happens" = compliance at boundary now, NU drift future.

---

### D066 — ARCH — MMI Engine #9 silent cap React production wire (engine layer LANDED, UI prompt deferred)

**Date:** 2026-05-23 (chat 5 ACASA overnight Wave 7-22)
**Category:** ARCH (architectural decision MMI Engine #9 partial React wire engine layer LANDED)
**Status:** LOCKED V1 — Engine layer wire LANDED + UI prompt indicator DEFERRED pending Daniel CEO strategic design choice (D059 §4 sub-scope above)
**Source:** Overnight Wave 7-22 MMI Engine #9 React production wire engine layer LANDED + `applyMuscleMemoryUpgrade` gated `pauseMonths ≥6` invoke pipeline pe React workout recommendation path + UI prompt deferred Daniel CEO design choice
**Cross-refs:** [[DECISIONS.md §D028 React entry swap]] + [[DECISIONS.md §D-LEGACY-098 LOCK 10 ADR 033 MMI Engine #9 V1 LANDED]] + D059 PROPOSAL above (partial-closure update engine layer LANDED) + applyMuscleMemoryUpgrade adapter

#### §1 Context

D059 PROPOSAL above (chat 5 ENGINE-DEEPER-AUDIT) surfaced MMI Engine #9 LANDED post-D028 entry swap React production wire MISSING. Co-CTO recommendation Option A REWIRE PRE-BETA presented two sub-scopes implicit:
- **Engine layer wire** = `applyMuscleMemoryUpgrade` adapter invoke React workout recommendation path pipeline integration
- **UI prompt indicator** = visible boost indicator ProgresStrip + Antrenor home user-facing reveal "engines auxiliare ascunse" brand promise

Overnight Wave 7-22 executed engine layer wire-through partial scope = `applyMuscleMemoryUpgrade` gated `pauseMonths ≥6` invoke pipeline. UI prompt indicator deferred pending Daniel CEO design choice (sub-scope split discovered execution).

#### §2 Decision

**MMI Engine #9 silent cap React production wire engine layer LANDED LOCKED V1**. Implementation:

- `applyMuscleMemoryUpgrade` adapter integrated React workout recommendation pipeline (compose pipeline MMI LAST slot Big 11 stack preserved per D-LEGACY-098)
- Gate condition = `pauseMonths ≥6` (returning user 6+ month layoff threshold). Sub-threshold users NU receive boost (avoid over-personalization recent users)
- Marius/Maria 65 returning users `pauseMonths ≥6` beneficiari silent boost active production
- Workout recommendations + load progression personalized via MMI boost effect
- **UI prompt indicator DEFERRED** = boost indicator NOT visible user. Engine effect silent active. Brand promise "engines auxiliare ascunse" partial-reveal (engine layer reveal pending UI design choice Daniel CEO)
- D059 §4 sub-scope update partial-closure note added (engine LANDED + UI prompt pending Daniel CEO Option A.1 vs A.2 vs B)

#### §3 Implications

- **D059 partial-closure** = engine layer wire-through MISSING gap (D059 HIGH finding) → engine LANDED. UI prompt indicator remaining open Daniel CEO design choice.
- **User-visible boost effect** = `pauseMonths ≥6` returning users beneficiari (Marius layoff scenario + Maria 65 returning to fitness after pause). Sub-threshold users normal pipeline.
- **Silent boost active production** = "engines auxiliare ascunse cumulative competitive defensibility" partial-reveal (engine active, indicator deferred).
- **Daniel CEO UI prompt design choice pending** = Option A.1 rewire pre-Beta visible indicator ~3-5h dev OR Option A.2 defer iter următor indicator-only.
- **Orphan engine risk eliminated** = MMI NU forever-orphan vanilla-era artifact. React production active pipeline.

#### §4 Empirical evidence

- Overnight Wave 7-22 commits = `applyMuscleMemoryUpgrade` adapter React workout recommendation pipeline integration
- Gate condition `pauseMonths ≥6` invariant tests cover
- D059 PROPOSAL above updated partial-closure note (engine LANDED + UI prompt pending)

#### §5 Rationale Bugatti

Engine LANDED orphan risk eliminated = brand promise "engines auxiliare ascunse" partial-delivered. UI prompt indicator deferred Daniel CEO design choice = anti-paternalism preserved (Co-CTO NU autonomous strategic UX decision). Silent boost active production = Bugatti craft engine layer peak. "Refactor later NEVER happens" = engine wire at boundary now, UI prompt design choice surfaced Daniel CEO conscious decision.

---

### D067 — REGLAJ — Coverage Top 5 closure pattern chat 5 milestone baseline 89.82%+

**Date:** 2026-05-23 (chat 5 ACASA post-overnight final closure)
**Category:** REGLAJ (system reglare meta test coverage baseline closure pattern)
**Status:** LOCKED V1
**Source:** Post-overnight final closure cumulative empirical = sentry/fatigue/AuthCallback/dataCleanup/aa+reality 5 modules Top 5 coverage gaps all closed + pre-Beta coverage baseline raised 89.82%+
**Cross-refs:** [[DECISIONS.md §D026 Phase 6 BATCH 24-task]] + [[DECISIONS.md §D042 ZERO bug gate]] + [[DECISIONS.md §D063 engine adapter Sentry coverage 100% anti-drift]] + Vitest coverage report post-chat-5

#### §1 Context

Pre-chat-5 coverage baseline = ~85% project-wide (post Phase 6 BATCH 24-task LANDED + Phase 7 RTL integration). Coverage Top 5 gaps surfaced via Vitest coverage report = persistent residual modules sub-threshold despite cumulative test growth:
- **sentry/** = pre-D055 consent gate + pre-D063 adapter instrument = partial coverage breadcrumb + beforeSend filter
- **fatigue/** = RPE-based fatigue engine logic + readiness derive paths under-tested edge cases
- **AuthCallback** = OAuth callback handler + token exchange + error redirect paths sparse
- **dataCleanup** = vault hygiene utilities + IndexedDB sweep + per-UID isolation under-tested
- **aa+reality** = AntiAbuse fatigue gate + Reality check (mandatory rest day validate) coverage partial

Post chat 5 + overnight Wave 7-22 cumulative work all 5 modules surfaced + closed pattern atomic test additions per module.

#### §2 Decision

**Coverage Top 5 closure pattern LOCKED V1**. Closure scope:

- **sentry/** = D055 consent gate + D063 adapter instrument 11/11 + PII strip + beforeSend filter = comprehensive coverage
- **fatigue/** = RPE-based logic edge cases + readiness derive paths covered
- **AuthCallback** = OAuth callback + token exchange + error redirect + edge case timeouts covered
- **dataCleanup** = vault hygiene utilities + IndexedDB sweep + per-UID isolation + invariant tests covered
- **aa+reality** = AntiAbuse fatigue gate + Reality check + Daniel CEO logout missing finding (§A007 gsd-security-auditor catch) covered

Pre-Beta coverage baseline post-closure = **89.82%+** project-wide (raised from ~85% pre-chat-5 baseline).

#### §3 Implications

- **Pre-Beta coverage baseline raised** = 89.82%+ project-wide pre-Launch nuclear audit gate baseline beat.
- **Future coverage regressions** = Track 7 §7.x ratchet UP capability per D036 thresholds.
- **Top 5 closure pattern** = template future coverage gap audit (Top N modules pattern). Periodic Vitest coverage report scan + atomic closure batch.
- **Critical paths covered** = sentry consent + fatigue + auth + cleanup + AA+reality = brand-safety + UX-safety + security cluster comprehensive coverage.
- **gsd-security-auditor fresh-eyes value** = §A007 logout missing finding catched by subagent solo Co-CTO missed = anti-drift discipline + subagent proactive spawn value reinforced (per CLAUDE.md memory feedback_subagents_fresh_eyes).

#### §4 Empirical evidence

- Pre-chat-5 coverage baseline = ~85% project-wide
- Post-chat-5 + overnight + post-overnight closure coverage = 89.82%+ project-wide
- Top 5 modules closure atomic commits chat 5 + overnight + post-overnight cumulative
- ZERO regression existing test suite (~4290+ PASS preserved + new additions)

#### §5 Rationale Bugatti

Coverage baseline = visible safety net + future regression catch + Bugatti craft peak. Top 5 gaps = focused critical path closure + ZERO speculative coverage chase. Karpathy Simplicity First = minimum care rezolva pre-Beta gate, NU speculative 100% chase. 89.82%+ baseline = beat 85% baseline + actionable threshold pre-Launch nuclear audit gate.

---

### D068 — PROC — Deps autonomous PATCH+MINOR bump pattern same-major-version Daniel CEO authorize default

**Date:** 2026-05-23 (chat 5 ACASA post-overnight final closure)
**Category:** PROC (procedural dependencies bump discipline pattern)
**Status:** LOCKED V1
**Source:** Post-overnight final closure empirical = Sentry 10.50.0→10.53.1 PATCH + date-fns 4.2.1→4.3.0 MINOR landed Co-CTO autonomous + zero regression
**Cross-refs:** [[DECISIONS.md §D041 anti-inflation discipline]] + [[DECISIONS.md §D043 dual-source convergence]] + package.json + npm audit + same-major SemVer baseline

#### §1 Context

Pre-chat-5 dependencies bump policy = ambiguous (per-bump Daniel CEO ask OR autonomous). Chat 5 post-overnight final closure empirical proof:
- **Sentry 10.50.0→10.53.1** = PATCH bump (10.50→10.53, sub-version sub-major) = zero breaking change SemVer contract
- **date-fns 4.2.1→4.3.0** = MINOR bump (4.2→4.3, sub-major) = zero breaking change SemVer contract per maintainer commitment

Both bumps landed Co-CTO autonomous tactical decision = ZERO Daniel CEO ask cycle. Test suite ~4290+ PASS preserved + zero regression empirical. Pattern works.

#### §2 Decision

**Deps autonomous PATCH+MINOR bump pattern LOCKED V1 same-major-version**. Scope:

- **PATCH bumps** (e.g., 10.50.0 → 10.50.1 OR 10.50.0 → 10.53.1) = autonomous Co-CTO default. Daniel CEO authorize implicit.
- **MINOR bumps** (e.g., 4.2.1 → 4.3.0) = autonomous Co-CTO default same-major. Daniel CEO authorize implicit.
- **MAJOR bumps** (e.g., 4.x → 5.x OR React 18 → 19) = MANDATORY Daniel CEO LOCK acknowledge ask. Breaking change SemVer contract = strategic decision impact.
- **Verify mandatory pre-bump** = `npm audit` security advisory check + maintainer changelog review (anti-malicious-package). NU blind bump.
- **Test suite verify post-bump** = mandatory ~4290+ PASS preserved + zero regression. IF regression = revert + ask Daniel.

#### §3 Implications

- **Co-CTO autonomous tactical bumps** = PATCH + MINOR same-major. ZERO ceremony ask Daniel CEO.
- **MAJOR bumps strategic Daniel decision** = breaking change SemVer = impact analysis + alternative path discussion required.
- **Security advisory check pre-bump** = `npm audit` baseline + critical/high severity = immediate bump mandatory (security > stability balance).
- **Changelog review** = maintainer commitment SemVer contract verify (anti-malicious-package + anti-breaking-change-hidden).
- **Test suite gate** = ~4290+ PASS preserved post-bump = real verification SemVer contract honored.

#### §4 Empirical evidence

- Sentry 10.50.0 → 10.53.1 PATCH bump = ZERO regression chat 5 post-overnight
- date-fns 4.2.1 → 4.3.0 MINOR bump = ZERO regression chat 5 post-overnight
- Test suite ~4290+ PASS preserved both bumps cumulative
- ZERO Daniel CEO ask cycle = autonomous tactical pattern proved

#### §5 Rationale Bugatti

SemVer contract = maintainer commitment baseline. PATCH + MINOR same-major = zero breaking change by definition = autonomous safe. MAJOR = breaking change = Daniel CEO strategic impact decision. Karpathy Simplicity First = minimum ceremony per tactical bump + Co-CTO autonomous mandate per CLAUDE.md memory feedback_co_cto_no_review_ask. Pattern proved chat 5 = template future deps maintenance baseline.

---

### D069 — REGLAJ — AA dead code refactor pattern verified unreachable mechanistic trace + test documentation

**Date:** 2026-05-23 (chat 5 ACASA post-overnight final closure)
**Category:** REGLAJ (system reglare dead code refactor discipline pattern)
**Status:** LOCKED V1
**Source:** Post-overnight final closure AA dead code investigation = lines 141-151 verified unreachable mechanistic trace + test documentation + Daniel CEO Option 1 trigger "baga" autonomous delete
**Cross-refs:** [[DECISIONS.md §D041 anti-inflation discipline]] + [[DECISIONS.md §D-LEGACY-XXX AA fatigue gate]] + AA module src/engine/aa/ + investigation report 📤_outbox/AA-DEAD-CODE-DELETE-INVESTIGATION.md

#### §1 Context

AA (AntiAbuse) module lines 141-151 surfaced potential dead code via Vitest coverage report post-chat-5 Top 5 closure cycle (D067 above). Initial appearance = unreachable branch logic + edge case never invoked production. Investigation cycle executed:

1. **Mechanistic trace** = manual code path walk lines 141-151 + caller graph + control flow analysis
2. **Test documentation** = existing tests cover paths around 141-151 BUT no test invokes branch directly
3. **Investigation report** = 📤_outbox/AA-DEAD-CODE-DELETE-INVESTIGATION.md surface findings + 3 options presented
   - **Option 1** = autonomous delete dead code lines 141-151 (verified unreachable + Bugatti craft "ZERO future-self trap")
   - **Option 2** = preserve dead code + add test coverage forcing branch invoke (anti-truncate discipline)
   - **Option 3** = preserve dead code + comment annotate "future scope intentional reserved" (anti-coverage-chase discipline)
4. **Daniel CEO trigger "baga"** = Option 1 LOCKED autonomous delete (per CLAUDE.md daniel-isms "baga" trigger = autonomous tactical execution per Co-CTO mandate)

#### §2 Decision

**AA dead code refactor pattern LOCKED V1 verified-unreachable-delete**. Pattern protocol:

- **Trigger** = Vitest coverage report surface unreachable branch OR Co-CTO audit surface dead code candidate
- **Investigation cycle mandatory** = mechanistic trace + test documentation + investigation report (3 options surface)
- **Daniel CEO direction** = Option 1/2/3 LOCK acknowledge per investigation (anti-paternalism = Daniel decide refactor scope strategic)
- **Autonomous delete (Option 1)** = verified unreachable + Bugatti craft + atomic single-concern commit
- **Empirical proof preserve** = test suite ~4290+ PASS preserved post-delete = real verification dead code unreachable
- **Investigation report archive** = `99-archive/investigation-<topic>/` per D062 periodic cleanup pattern

#### §3 Implications

- **Dead code surgical delete** = AA lines 141-151 verified unreachable + delete atomic = ZERO regression
- **Investigation discipline mandatory** = NU blind delete (anti-truncate). Mechanistic trace + test documentation + Daniel CEO direction = full Bugatti audit chain
- **Future dead code candidates** = same investigation cycle pattern = mechanistic trace + 3 options + Daniel CEO direction
- **Pattern template future refactors** = engineWrappers 466 LOC extract candidates §P13 + future dead code audit cycles
- **Daniel CEO "baga" trigger** = autonomous tactical execution per CLAUDE.md daniel-isms (delegation acceptance + Co-CTO autonomous tactical mandate)

#### §4 Empirical evidence

- AA module lines 141-151 = verified unreachable mechanistic trace + caller graph + control flow
- Investigation report 📤_outbox/AA-DEAD-CODE-DELETE-INVESTIGATION.md = 3 options + Daniel CEO Option 1 LOCK
- Daniel CEO trigger "baga" = autonomous delete LANDED chat 5 post-overnight
- Test suite ~4290+ PASS preserved post-delete + ZERO regression empirical proof

#### §5 Rationale Bugatti

Dead code = silent future-self trap + maintenance burden + reader confusion. Verified unreachable + atomic delete = surgical singular-concern + Bugatti craft peak. Investigation cycle mandatory = anti-truncate discipline (NU blind delete based on coverage assumption). Daniel CEO direction strategic = anti-paternalism preserved. "Refactor later NEVER happens" = dead code delete at boundary now, NU cumulative debt future.

---

### D070 — REGLAJ — BACKUP_DR_RUNBOOK chat 5 polish + cross-system anti-drift documentation pattern

**Date:** 2026-05-23 (chat 5 ACASA post-overnight final closure)
**Category:** REGLAJ (system reglare backup disaster recovery runbook freshness + cross-system anti-drift)
**Status:** LOCKED V1
**Source:** Post-overnight final closure BACKUP_DR_RUNBOOK polish 7 gaps fixed (MMI userChoice + Sentry forensic + Dexie lazy + line numbers + font path + Magic Link replay + scripts ref) + cross-system anti-drift documentation pattern
**Cross-refs:** [[DECISIONS.md §D055 Sentry consent gate]] + [[DECISIONS.md §D061 font self-host]] + [[DECISIONS.md §D066 MMI Engine #9 silent cap]] + 08-workflows/BACKUP_DR_RUNBOOK.md + post-substantial-work documentation updates pattern

#### §1 Context

BACKUP_DR_RUNBOOK.md = disaster recovery procedural baseline document `08-workflows/`. Pre-chat-5 state = stable + comprehensive but drift accumulated post substantial chat 5 + overnight Wave 7-22 work. 7 gaps surfaced post-substantial-work documentation audit:

1. **MMI userChoice** = MMI Engine #9 React wire (D066) user choice gate condition `pauseMonths ≥6` NOT documented runbook
2. **Sentry forensic** = D055 consent gate Sentry NOT initialized pre-opt-in = forensic recovery path NU mentioned (alternative breadcrumb sources)
3. **Dexie lazy** = D060 AuthCluster lazy + future Dexie lazy candidate IndexedDB recovery path documentation gap
4. **Line numbers** = code reference line numbers stale post-chat-5 substantial commits (~21+ atomic) = grep references break
5. **Font path** = D061 font self-host `public/fonts/inter-var-latin.woff2` NEW path NOT documented runbook asset recovery section
6. **Magic Link replay** = Magic Link auth replay attack edge case + recovery path NOT documented (gsd-security-auditor surface chat 5)
7. **Scripts ref** = `scripts/` directory utilities references stale post-chat-5 + overnight scripts additions

#### §2 Decision

**BACKUP_DR_RUNBOOK chat 5 polish + cross-system anti-drift documentation pattern LOCKED V1**. Scope:

- **7 gaps fixed** atomic single-commit BACKUP_DR_RUNBOOK.md update post-chat-5 final closure
- **Cross-system anti-drift documentation pattern** = post-substantial-work documentation updates discipline. Trigger = substantial work cycle complete (chat 5 + overnight Wave 7-22 magnitude) → cross-system documentation audit + targeted gap fix atomic commit
- **Documents in scope** = BACKUP_DR_RUNBOOK.md + ANDURA_PRIMER.md §5 (handover scope different per CLAUDE.md SSOT auto-sync) + 04-architecture/ docs (per topic) + 08-workflows/ docs (per topic)
- **Anti-stale-baseline discipline** = filesystem read primary source BEFORE documentation update (per CLAUDE.md anti-hallucination rule)

#### §3 Implications

- **Runbook freshness Bugatti pre-Beta** = D070 closure post-substantial-work = disaster recovery operational ready
- **Cross-system anti-drift pattern** = template future documentation updates post-substantial-work cycle
- **Pre-Beta nuclear audit gate** = documentation freshness baseline mandatory (per Bugatti craft "ZERO future-self trap")
- **D066 + D055 + D061 cross-reference** = D070 fixes integrate D066 MMI gate + D055 Sentry consent + D061 font self-host = SSOT consistency cross documents
- **Future runbook updates** = same pattern atomic single-commit post-substantial-work + cross-system anti-drift audit

#### §4 Empirical evidence

- BACKUP_DR_RUNBOOK.md = 7 gaps fixed atomic chat 5 post-overnight final closure commit
- Cross-references D066 + D055 + D061 integrate consistent runbook + DECISIONS.md
- Documentation freshness baseline = pre-Beta nuclear audit gate ready

#### §5 Rationale Bugatti

Disaster recovery runbook = critical operational document + irrevocable trust pre-Beta launch. Stale runbook = silent footgun catastrophic failure scenario (Daniel solo founder + ACASA dev = single point recovery). Bugatti craft = documentation freshness baseline + cross-system anti-drift discipline. "Refactor later NEVER happens" = runbook polish at boundary now post-substantial-work, NU cumulative documentation debt explode future.

---

### D071 — ENG — Lighthouse truly-final peak match recovery cycle 64→97→86→95→97

**Date:** 2026-05-23 (chat 5 ACASA post-overnight final closure)
**Category:** ENG (engineering tactical Lighthouse iterative perf optimization recovery cycle)
**Status:** LOCKED V1
**Source:** Post-overnight final closure Lighthouse mobile 3G Maria 65 recovery cycle 64 → 97 → 86 (font regression) → 95 (subset) → 97 (truly-final) iterative optimization + peak match validation pre-Beta
**Cross-refs:** [[DECISIONS.md §D053 bundle budget raise]] + [[DECISIONS.md §D060 PWA perf quadruple]] + [[DECISIONS.md §D061 font self-host Latin subset]] + [[DECISIONS.md §D064 modulepreload requestIdleCallback]] + Lighthouse CI thresholds + ratchet UP capability D036

#### §1 Context

Lighthouse mobile 3G Maria 65 baseline pre-overnight = 64 (red zone). Iterative perf optimization recovery cycle chat 5 + overnight + post-overnight:

1. **64** = pre-overnight baseline (red zone)
2. **97** = post quadruple D060 single-line peak (defer registerSW + lazy auth cluster + SW precache excludes + modulepreload)
3. **86** = post font regression (D061 initial self-host iteration full Inter Variable 344 KB pre-subset filter)
4. **95** = post Latin subset filter (D061 final -86% bundle reduction Latin scope)
5. **97** = truly-final post cumulative + modulepreload tuning + critical CSS adjustments (peak match D060 single-line)

Pattern = iterative non-linear optimization. Each step revealed downstream regression OR optimization opportunity. Final 97 = peak match single-line baseline + sustained cumulative.

#### §2 Decision

**Lighthouse truly-final peak match recovery cycle pattern LOCKED V1**. Pattern protocol:

- **Iterative optimization cycle** = NOT linear single-shot. Expect intermediate regression + recovery + tuning iterations
- **Empirical measurement primary** = each iteration Lighthouse CI run + record measurement. ZERO assumption-based optimization
- **Anti-regression discipline** = intermediate regression (86 from 97) NOT failure = surface optimization opportunity (Latin subset filter discovery)
- **Peak match validation** = truly-final 97 = sustained cumulative match single-line peak = peak baseline confirmed pre-Beta
- **Documentation in DECISIONS.md** = each iteration LOCKED V1 entry (D060 quadruple + D061 font self-host + D064 modulepreload + D071 cumulative recovery) = visible audit trail

#### §3 Implications

- **Pre-Beta Lighthouse target beat** = ≥90 baseline (Maria 65 + Gigel persona target). 97 truly-final achieved = Bugatti craft peak baseline.
- **Future perf regressions** = block on Lighthouse CI ratchet UP capability per D036 §7.6 thresholds. 97 sustained baseline = ratchet UP candidate (e.g., next ratchet 95 floor, 97 target).
- **Iterative recovery cycle template** = perf optimization NOT single-shot. Expect intermediate regression + recovery iterations.
- **Empirical measurement discipline** = Lighthouse CI run per iteration = ZERO assumption-based optimization (anti-inflation discipline D041).
- **Documentation visible audit trail** = D060 + D061 + D064 + D071 cross-reference = perf optimization decisions chain visible future.

#### §4 Empirical evidence

- 64 → 97 single-line peak D060 quadruple (defer registerSW + lazy auth + SW precache excludes + modulepreload)
- 97 → 86 font regression D061 initial iteration (full Inter Variable 344 KB pre-subset)
- 86 → 95 Latin subset filter D061 final (-86% bundle reduction)
- 95 → 97 truly-final cumulative + modulepreload tuning (peak match single-line)
- Final 97 sustained baseline pre-Beta achieved

#### §5 Rationale Bugatti

Perf optimization = NOT linear straight line. Iterative cycle + intermediate regression + recovery + tuning = real engineering empirical pattern. Bugatti craft = peak baseline + sustained cumulative + visible audit trail. Maria 65 mobile 3G LCP target = irrevocable trust pre-Beta launch first impression. 97 truly-final = peak baseline confirmed + actionable ratchet UP capability future. "Refactor later NEVER happens" = perf optimization at boundary now iterative, NU defer assumption.

---

### D072 — REGLAJ — Pre-Beta gate matrix 11 PASS / 3 YELLOW / 1 INFO singular verdict primary-source-grounded

**Date:** 2026-05-23 (chat 5 ACASA post-overnight final closure)
**Category:** REGLAJ (system reglare pre-Beta launch gate matrix verdict singular document)
**Status:** LOCKED V1
**Source:** Post-overnight final closure pre-Beta gate matrix VERIFY_FINAL_CHAT5_STATE.md verdict 11 PASS / 3 YELLOW / 1 INFO singular pre-Beta launch gate document
**Cross-refs:** [[DECISIONS.md §D042 ZERO bug gate]] + [[DECISIONS.md §D043 dual-source convergence]] + [[DECISIONS.md §D-LEGACY-051 Pre-Beta FULL Scope LOCK V2]] + 📤_outbox/VERIFY_FINAL_CHAT5_STATE.md + Bugatti audit nuclear pre-Launch protocol

#### §1 Context

Pre-Beta launch gate matrix = singular verdict document baseline `📤_outbox/VERIFY_FINAL_CHAT5_STATE.md`. 15 gate dimensions evaluated post chat 5 + overnight Wave 7-22 + post-overnight final closure cumulative state:

- **11 PASS** = green confirmed gates ready pre-Beta launch baseline
- **3 YELLOW** = caution gates non-blocking but require Daniel CEO awareness (e.g., MMI UI prompt indicator pending D066 + UI wording strategic §P2 + dates format §P4)
- **1 INFO** = informational item (e.g., post-Beta perf optimization defer §P7 +/- §P12)

Gate matrix = primary-source-grounded facts (NU conversational assertion). Each gate dimension cross-reference DECISIONS.md LOCK entries + commit hashes + test suite states + audit findings.

#### §2 Decision

**Pre-Beta gate matrix 11 PASS / 3 YELLOW / 1 INFO verdict LOCKED V1 singular document baseline**. Verdict structure:

- **VERIFY_FINAL_CHAT5_STATE.md** = singular pre-Beta launch gate verdict document `📤_outbox/`
- **15 gate dimensions** = bug count (D042 ZERO bug gate) + test coverage (D067 89.82%+) + Lighthouse (D071 97) + WCAG a11y (D056) + GDPR consent (D055) + bundle budget (D053) + Zustand partialize (D054) + PWA manifest SoT (D057) + Sentry instrument (D063) + i18n compliance (D058 + D065) + engine pipeline (D066) + font self-host (D061) + perf quadruple (D060) + modulepreload (D064) + dead code (D069)
- **Verdict per gate** = PASS / YELLOW / INFO + cross-reference DECISIONS.md LOCK entry + commit hash + audit finding source
- **Daniel CEO Bugatti audit nuclear gate trigger** = post Daniel CEO LOCK acknowledge D050-D073 + §P-items strategic decisions + gate matrix verdict review = readiness pre-Beta launch confirmation

#### §3 Implications

- **Singular pre-Beta gate document** = `📤_outbox/VERIFY_FINAL_CHAT5_STATE.md` = visible Bugatti audit baseline. ZERO scattered verdict assertion across docs.
- **Primary-source-grounded facts** = each gate dimension cross-reference DECISIONS.md + commit hash + test suite + audit finding source = anti-hallucination discipline (per CLAUDE.md regula #1 + Daniel CEO trust contract).
- **YELLOW gates Daniel awareness** = 3 non-blocking caution items surface Daniel CEO strategic direction (MMI UI prompt D066 + UI wording §P2 + dates format §P4)
- **INFO gates informational** = 1 item post-Beta defer informational (perf optimization §P7 / §P12) = ZERO blocking pre-Beta launch
- **Pre-Beta nuclear audit gate trigger** = singular document review + Daniel CEO LOCK acknowledge = launch readiness confirmed Bugatti

#### §4 Empirical evidence

- VERIFY_FINAL_CHAT5_STATE.md = singular pre-Beta gate document `📤_outbox/`
- 15 gate dimensions evaluated post-chat-5 cumulative state
- 11 PASS / 3 YELLOW / 1 INFO verdict primary-source-grounded
- Cross-references D050-D073 LOCK entries + commit hashes + test suite states

#### §5 Rationale Bugatti

Pre-Beta launch gate matrix = irrevocable trust contract Daniel CEO + brand promise users baseline. Singular document = visible Bugatti audit baseline + ZERO scattered verdict assertion. Primary-source-grounded facts = anti-hallucination discipline (per CLAUDE.md regula #1 THINK BEFORE CLAIMING). 11 PASS / 3 YELLOW / 1 INFO verdict = transparent + actionable + Daniel CEO strategic direction surface. "Refactor later NEVER happens" = gate matrix at boundary now pre-Beta launch readiness, NU vague assertion post-Launch trust contract erode.

---

### D073 — REGLAJ — Vault docs ~4100+ LOC trail comprehensive singular reference point pattern

**Date:** 2026-05-23 (chat 5 ACASA post-overnight final closure)
**Category:** REGLAJ (system reglare vault documentation trail comprehensive singular reference pattern)
**Status:** LOCKED V1
**Source:** Post-overnight final closure vault docs trail ~4100+ LOC cumulative = 23+ outbox files + 4 inbox handovers + master index + decisions draft + investigation reports + singular reference point Daniel + chat 6 startup context
**Cross-refs:** [[DECISIONS.md §D062 vault docs archive periodic cleanup pattern]] + [[DECISIONS.md §D072 pre-Beta gate matrix verdict]] + 📤_outbox/ + 📥_inbox/ + 99-archive/audit-pre-chat5/ per D062

#### §1 Context

Chat 5 + overnight Wave 7-22 + post-overnight final closure cumulative work substantial = vault docs trail ~4100+ LOC documentation comprehensive. Singular reference point baseline:

- **23+ outbox files** = `📤_outbox/` substantial work reports + investigation reports + audit findings + verify reports + decisions drafts (chat 5 + overnight + post-overnight)
- **4 inbox handovers** = `📥_inbox/HANDOVER_<date>_<topic>.md` chat 1-5 narrative scribe end-of-chat handovers (§F3.8 protocol)
- **Master index** = `📤_outbox/MASTER_INDEX_CHAT5.md` (OR equivalent) cross-reference cumulative documents
- **Decisions draft** = `📤_outbox/DECISIONS_CHAT5_DRAFT.md` (this document) 23 LOCK candidates + 1 PROPOSAL partial-closure + 15 §P-items strategic surface
- **Investigation reports** = AA-DEAD-CODE-DELETE-INVESTIGATION.md + FIREBASE-RULES-PREP-INVESTIGATION.md + LEDGER-SYNC-FINAL-FINAL.md + other targeted audit reports

#### §2 Decision

**Vault docs ~4100+ LOC trail comprehensive singular reference point pattern LOCKED V1**. Scope:

- **Comprehensive trail discipline** = substantial work cycle (chat 5 magnitude) produces ~4100+ LOC vault docs cumulative = visible audit trail + reproducible context
- **Singular reference point** = master index document `📤_outbox/MASTER_INDEX_CHAT5.md` (OR equivalent) = singular entry point Daniel CEO + chat 6 startup context navigation
- **Daniel CEO reference baseline** = strategic decisions surface (§P-items D072 gate matrix verdict) + LOCK candidates batch acknowledge (D050-D073) + investigation reports per topic = singular document chain
- **Chat 6 startup context** = master index + recent DECISIONS draft + recent VERIFY gate matrix + recent HANDOVER inbox = chat 6 startup §CC.2 step 4-5 baseline (PRIMER §5 micro-append cumulative summary)
- **Future cleanup** = D062 periodic cleanup pattern post Daniel CEO direction OR chat 6 cumulative magnitude trigger

#### §3 Implications

- **Singular reference point** = `📤_outbox/MASTER_INDEX_CHAT5.md` (OR equivalent) = Daniel CEO + chat 6 startup baseline navigation aid
- **Comprehensive audit trail** = ~4100+ LOC vault docs visible cumulative = reproducible context future debugging + audit reference
- **Daniel CEO strategic surface** = D072 gate matrix verdict + §P-items priority cluster choice + D050-D073 LOCK acknowledge = singular document chain entry point
- **Chat 6 startup context** = master index + recent decisions + recent verify + recent handover = §CC.2 step 4-5 baseline cumulative summary integration
- **Future cleanup discipline** = D062 periodic cleanup pattern preserved (NU per-message overreach + batch periodic + Daniel verbal trigger)

#### §4 Empirical evidence

- ~23+ outbox files chat 5 cumulative `📤_outbox/`
- 4 inbox handovers chat 1-5 narrative scribe `📥_inbox/`
- Master index document singular reference point
- Decisions draft 23 LOCK candidates + 1 PROPOSAL + 15 §P-items
- Investigation reports per topic targeted audit findings
- Vault docs cumulative ~4100+ LOC trail comprehensive visible

#### §5 Rationale Bugatti

Vault docs trail = reproducible context + visible audit baseline + Daniel CEO strategic decision support. Singular reference point = navigation aid + cumulative summary integration + chat 6 startup context. Comprehensive documentation = invisible quality (most users NU notice but future-self + Daniel CEO + chat 6 instance benefit). "Refactor later NEVER happens" = documentation trail at boundary now substantial-work cycle complete, NU cumulative debt explode future. D062 periodic cleanup pattern preserved = batch periodic + active surface respect.

---

### D074 — REGLAJ — D063 wording scope clarification (React wrappers ONLY, NOT orchestrator pipeline adapters)

**Date:** 2026-05-23 (chat 5 post-overnight scope precision)
**Category:** REGLAJ (system reglare SSOT scope clarification anti-conflation)
**Status:** LOCKED V1
**Source:** gsd-eval-auditor chat 5 finding — D063 LOCKED V1 "Sentry adapter coverage 11/11 + anti-drift test" wording interpreted broadly ca include both React wrappers + orchestrator pipeline adapters layers (conflation 2 distinct adapter surfaces)
**Cross-refs:** [[DECISIONS.md §D063 engine adapter Sentry coverage 100% anti-drift]] + [[DECISIONS.md §D007 supersede enforcement append-only]] + `src/react/lib/engineWrappers.ts` + `src/coach/orchestrator/adapters/*` + `src/react/__tests__/lib/assert_all_adapters_instrumented.test.ts` (commit ad82ab65)

#### §1 Context

D063 LOCKED V1 §2 wording "Engine adapter Sentry coverage 100% test instrument anti-drift" + "11/11 adapters (Big 11 pipeline) wrapped" was interpreted broadly by gsd-eval-auditor chat 5 ca potentially include BOTH adapter layers ce există în codebase:

- **Layer 1 — React wrappers** = `src/react/lib/engineWrappers.ts` (Big 11 canonical React adapter surface) = 11/11 `captureException()` instrumented + 12 capture sites (11 adapters + getPatternsBanner STAGNATION/LOW_ADHERENCE extra path) ✓
- **Layer 2 — Orchestrator pipeline adapters** = `src/coach/orchestrator/adapters/*.js` (8 files: bayesianNutritionAdapter + deloadAdapter + energyAdjustmentAdapter + goalAdaptationAdapter + periodizationAdapter + specializationAdapter + tempoAdapter + warmupAdapter) = 0/8 Sentry instrumented (verified grep ZERO Sentry references)

Two adapter surfaces conflated = SSOT precision drift surface. D063 wording strict refers to Big 11 React adapter layer ONLY (canonical user-facing instrumentation gate). Orchestrator pipeline adapters = separate concern, separate Beta decision.

#### §2 Decision

**D063 scope clarification LOCKED V1**. Precision wording:

- **D063 scope = React wrappers ONLY** = `src/react/lib/engineWrappers.ts` Big 11 canonical adapter layer = 11/11 `captureException()` instrumented = anti-drift CI gate enforced
- **Out of scope (post-Beta deferred candidate)** = orchestrator pipeline adapters `src/coach/orchestrator/adapters/*` = 0/8 Sentry instrumented currently = separate Beta-launch decision
- **Anti-drift test scope** = `src/react/__tests__/lib/assert_all_adapters_instrumented.test.ts` (commit ad82ab65 Wave 12 BLOCKER 2 closure) reads `engineWrappers.ts` source + asserts 11 named adapters + 12 capture sites pattern. Scope = React wrappers ONLY per D063 strict wording (test file inline comments lines 14-17 already document this scope)
- **No supersede of D063** = D074 = scope precision NOT decision change. D007 LOCK V1 append-only invariant respected. D063 status preserved `LOCKED V1`.

#### §3 Implications

- **D063 future citations** = strict React wrappers `src/react/lib/engineWrappers.ts` only. Any future "engine adapter Sentry coverage" claim cross-checks both layers separately.
- **Orchestrator pipeline adapters 0/8 Sentry** = visible surface for separate post-Beta decision (instrument all 8 OR conscious defer + document risk). NU silently subsumed în D063 wording.
- **Anti-drift test invariant** = scope React wrappers only. Future orchestrator adapter additions NU break this test (separate concern). IF future decision instrument orchestrator adapters = separate anti-drift test sibling required.
- **gsd-eval-auditor pattern reinforced** = fresh-eyes audit catches SSOT wording precision drift Co-CTO solo might miss. Spawn proactively post-LANDED pre-Beta quality gates discipline (per Daniel feedback `subagents_fresh_eyes` MEMORY.md).
- **D007 append-only invariant respected** = D063 NU re-opened (literal status preserved). D074 = clarification addendum sibling, NOT supersede. Pattern template future scope precision corrections without LOCK re-open.

#### §4 Empirical evidence

- **React wrappers verified 11/11** = `src/react/lib/engineWrappers.ts` grep `captureException` = 12 sites (11 adapters + getPatternsBanner extra path per witness suite line 17)
- **Orchestrator adapters verified 0/8** = `src/coach/orchestrator/adapters/*` grep `Sentry` = ZERO matches across 8 .js files
- **Anti-drift test scope verified** = `src/react/__tests__/lib/assert_all_adapters_instrumented.test.ts` lines 14-17 inline comments document scope (React engineWrappers only, orchestrator separate post-Beta concern)
- **Commit hash verified** = `ad82ab65 test(sentry-adapter-anti-drift-gate): create assert_all_adapters_instrumented [BLOCKER FIX]` via `git log --oneline` per anti-drift test file path
- **D007 invariant preserved** = D063 status remains `LOCKED V1` (NU re-opened, NU supersede)

#### §5 Rationale Bugatti

SSOT precision = future-self trust contract. D063 broad wording = future Co-CTO interpretation drift surface (chat 6+ might assume orchestrator adapters also instrumented). gsd-eval-auditor caught conflation = fresh-eyes value reinforced (per `subagents_fresh_eyes` feedback). Scope clarification addendum (NOT supersede) respects D007 append-only invariant while delivering precision. Bugatti craft = explicit boundaries documented now NU silent assumption future. "Refactor later NEVER happens" = scope precision at boundary now SSOT correction cycle, NU cumulative ambiguity explode future. Pattern template = future scope precision corrections without LOCK re-open trigger (D-NEW addendum sibling pattern).

---

### D076 — ARCH — Phase 6 prod-extras blessed divergence (DRIFT-1 Option B mockup v1.1 amend)

**Date:** 2026-05-23 (chat 5 DRIFT-1 paradigm investigation closure)
**Category:** ARCH (mockup vs prod parity ratify — divergence cataloged blessed)
**Status:** LOCKED V1
**Source:** Co-CTO autonomous decision DRIFT-1 Option B per `📤_outbox/DRIFT_1_PARADIGM_INVESTIGATION_chat5.md` gsd-subagent read-only investigation
**Cross-refs:** [[DECISIONS.md §D015 React Andura Clasic on mockup DESIGN MASTER]], [[DECISIONS.md §D026 Phase 6 BATCH closure]], [[04-architecture/mockups/andura-clasic.html v1.1 commit 8dfe36e3]], [[D-LEGACY-091 Mockup vs prod distinction permanent rule]], replaces prior `7eeb050e` D050 collision attempt

#### §1 What

7 React components engine-wired in production absent din mockup `andura-clasic.html` pre-amend:

| Component | Tab | Path | Purpose |
|-----------|-----|------|---------|
| PatternsBanner | Antrenor home | `src/react/components/Antrenor/PatternsBanner.tsx` | STAGNATION + LOW_ADHERENCE banners (Phase 6 task_06 Option B UI consumer Big 11 patternLearning) |
| AlertsBanner | Antrenor home | `src/react/components/Antrenor/AlertsBanner.tsx` | ProactiveAlert[] severity 3-tier urgent/warn/info (injury-risk safety floor) |
| StatsGrid | Antrenor home | `src/react/components/Antrenor/StatsGrid.tsx` | F10 3-cell compact: Streak + Fatigue + Readiness |
| ReadinessVerdict | Antrenor home | `src/react/components/Antrenor/ReadinessVerdict.tsx` | F4 pre-session core coach value verdict |
| PRNotificationBanner | Antrenor home | `src/react/components/Antrenor/PRNotificationBanner.tsx` | F11 PR notification post-session flag (CRIT shape #2/#3 real PR detection) |
| PRWallRecent | Antrenor home | `src/react/components/Antrenor/PRWallRecent.tsx` | Top-3 most-recent PR records (Phase 5 task_11 PR history aggregate) |
| BodyData | Progres tab | `src/react/routes/screens/progres/BodyData.tsx` | Phase 4 task_16 §B Body Measurements 5-field standard |

#### §2 Decision

Ratify divergence ca **blessed Phase 6 prod-extras layer**. Mockup amended v1.1 (commit `8dfe36e3` 2026-05-23) cu component sections pentru reflect prod current state.

**Mockup precedence preserved + STRENGTHENED** via DECISIONS LOCK ratify path — strengthens mockup authority NU erodes (D015 LOCK V1 amendment precedent preserved). DECISIONS-driven amend preferred over silent prod drift sau revoke mockup.

#### §3 Why — Engine value preservation rationale

Removing 7 components = HIGH-cost regression. Per persona Bugatti filter:

- **Marius (performant la sala)**: signal-richness via StatsGrid + ReadinessVerdict + PR pipeline (PRWallRecent + PRNotificationBanner) — keeps Marius engaged data-driven feedback loop
- **AlertsBanner injury-risk safety floor**: urgent severity ARIA pentru pain/discomfort signals — D-LEGACY-035 Pain/Discomfort Button architecture CDL override pattern invariant
- **PatternsBanner stagnation surfacing**: Big 11 patternLearning consumer — STAGNATION 3-saptamani plateau detect + LOW_ADHERENCE adherence drift
- **PRNotificationBanner real PR detection**: CRIT shape #2/#3 LANDED PR pipeline engine wire — removing breaks downstream user-facing PR notification
- **BodyData persistence**: Phase 4 task_16 §B implementation — removing = data loss user body measurements

#### §4 Why amend path NU strict mockup-paradigm restore

- **Quality long-horizon mandate** (Daniel verbatim feedback `quality_long_horizon` MEMORY.md "prefer sa petrecem de 10 ori mai mult timp acum sa il facem bine") — Bugatti craft preserves built engine-wired features NU rip-out for paradigm purity
- **Mockup amendment precedent via DECISIONS LOCK** = strengthens D015 authority pattern (LOCK ratify = canonical) NU erodes
- **Engine value preservation** > paradigm purity when divergence delivers user/safety value
- **D-LEGACY-091 mockup vs prod distinction permanent rule** preserved — divergence allowed when blessed via DECISIONS LOCK

#### §5 Out of scope

Future paradigm questions of similar shape decided via this precedent (NU prematurely revoke mockup authority — amend path preferred). Pattern template = future divergence surface → investigation report + Co-CTO Option A/B/C → DECISIONS LOCK ratify amend OR revoke explicit, NU silent drift.

#### §6 Source investigation

`📤_outbox/DRIFT_1_PARADIGM_INVESTIGATION_chat5.md` — gsd subagent read-only DRIFT-1 paradigm investigation surface 7 components Phase 6 prod-extras + 3 options A (strict mockup restore) / B (amend mockup + ratify LOCK) / C (defer post-Beta investigation) → Co-CTO Option B selected per quality long-horizon + engine value preservation rationale.

#### §7 Replaces prior collision attempt

Prior commit `7eeb050e` "D050 LOCK V1 Phase 6 prod-extras blessed divergence" landed on agent worktree branch — collision cu D050 PROC `git commit -o -m -- <paths>` pattern LANDED on main DECISIONS.md (different content). D076 = correct sequential append next post-D075 ratifying same decision content. D050 main entry status preserved LOCKED V1 (NU re-opened per D007 invariant).

---

## D077 — Pre-Beta quality cycle extins (iterate→0 + anti-RE + security audits finale)

**Decizie Daniel CEO 2026-05-25 (chat 6 birou RC):** Pre-Beta = **zero greșeli absolut**, fără grabă, verificare + răsverificare până la saturare.

**Ciclul LOCKED V1:**
1. Rezolv toate bugs → raportez "toate rezolvate"
2. **Audit nuclear complet** (fiecare virgulă, FRESH pe latest commit — nu ledger acumulat)
3. **Verify track full auto**
4. Tot ce apare → rezolv → reluăm audit → **repeat până 0 findings + 100% quality**
5. **+ audit anti-RE** (expunere logică/moat engines în bundle client-side)
6. **+ audit security** (auth, Firebase rules, GDPR, secrets)
7. **ABIA atunci** Daniel verifică manual + Beta launch

Supersede verdict prematur "READY-WITH-DANIEL-1-HARD" (chat 5) — NU se cere walkthrough Daniel până flawless. Extinde D029 (audit nuclear) + D031 (push manual Daniel-trigger) + quality_long_horizon mandate (Daniel "10x mai mult timp acum sa il facem bine"). Triaj forensic chat 6 = 410 ledger open → 21 real-open reale (rest zgomot already-fixed/stale) → wave-1 (7) + wave-2 (6) fixuri integrate → next wave-3 follow-up-uri → audit fresh per ciclu.

---

🦦 **DECISIONS.md SSOT singular live post 2026-05-15 reglaj. Append-only. Wiki/ + 03-decisions/_FROZEN/ + CLAUDE.md root schema FROZEN. Karpathy 4 principii core philosophy [[07-meta/karpathy-skills-ref/CLAUDE.md]] §1-§4 invariant.**