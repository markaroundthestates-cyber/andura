---
title: Andura — Decisions Single Source of Truth
type: ssot-decisions
status: live
last_updated: 2026-05-19
schema_version: 1
latest_entry: D029
total_entries: 29
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

🦫 **DECISIONS.md SSOT singular live post 2026-05-15 reglaj. Append-only. Wiki/ + 03-decisions/_FROZEN/ + CLAUDE.md root schema FROZEN. Karpathy 4 principii core philosophy [[07-meta/karpathy-skills-ref/CLAUDE.md]] §1-§4 invariant.**
