---
title: Andura — Decisions Single Source of Truth
type: ssot-decisions
status: live
last_updated: 2026-05-15
schema_version: 1
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
D-LEGACY-085 | 2026-05-15 | PROC | §AR.30 candidate Pre-action vault primary-source verification MANDATORY (1× threshold scribe-mode marked) | DRAFT | 99-archive/wiki-pre-2026-05-15/concepts/anti-recurrence-rules.md
D-LEGACY-086 | 2026-05-15 | PROC | §AR.31 candidate CEO scope strict UI wording autonomous compose = SLIP DEFAULT (1× threshold scribe-mode marked) | DRAFT | 99-archive/wiki-pre-2026-05-15/concepts/anti-recurrence-rules.md

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

🦫 **DECISIONS.md SSOT singular live post 2026-05-15 reglaj. Append-only. Wiki/ + 03-decisions/_FROZEN/ + CLAUDE.md root schema FROZEN. Karpathy 4 principii core philosophy [[07-meta/karpathy-skills-ref/CLAUDE.md]] §1-§4 invariant.**
