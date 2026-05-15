# HANDOVER GLOBAL — Scenarios Coverage (split from 2026-04-30 evening master, 2026-05-05 overnight)

**Provenance:** Section split from `HANDOVER_GLOBAL_2026-04-30_evening.md` per §62.2 thematic split strategy LOCKED V1. Original 7673 LOC > 7000 §VAULT_HYGIENE_PASS STEP 13 FLAG threshold. Split executed 2026-05-05 overnight (CC TASK 5 finalize).
**Theme:** Scenarios Decision Coverage PRE-BETA BLOCKER + cumulative count + DIFF_FLAGS updates post Batch 1-6. Sections: §69 PRE-BETA BLOCKER FLAG + §70-§73.
**See also:** [[HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL master INDEX]] (post-split) + [[../04-architecture/ANDURA_VALIDATION_FRAMEWORK_V1]] LOCKED V1 + [[../04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1]] + [[../04-architecture/FAZA_2_FILTER_STRATEGY_V1]] + DIFF_FLAGS P1-FLAG-SCENARIOS-COVERAGE.

---

## §69 SCENARIOS DECISION COVERAGE — PRE-BETA BLOCKER FLAG (NEW)

### §69.1 Status scenarios 1500-2000 coverage decisions ⚠️ PRE-BETA BLOCKER

**Per §42.9 LOCKED V1 testing strategy:** Hibrid Property-based + Persona Suite Maria/Gigica/Marius + 4-Invariant Safety Stack mandatory pass. Persona simulation suite ~50-100 tests representative + edge cases curated.

**Coverage actual post chat-uri Auth + ADR 026 spec + Auth Flow §36.80 + Batch 1-6:**
- §42.1-§42.10 base 10 decisions LOCKED
- §45.2-§45.5 ADR 026 spec 75 decisions LOCKED
- §50.1-§50.4 D-cluster 41 decisions LOCKED
- §56.1-§56.19 Auth Flow §36.80 35 sub-decisions LOCKED
- §62-§68 Batch 1-6 + Closure 63 sub-decisions LOCKED
- **Total cumulative: 306 LOCKED V1**

**Gap pre-Beta:** ~1200-1700 scenarios decisions remaining (estimative AUDIT_5000Q + Persona Suite curated + edge cases enumerate). Acoperire actuală ~15-25% scope total scenarios.

**Decision Daniel + Claude:** TREBUIE TRECUT PRIN TOT SCENARIOS COVERAGE pre-Beta launch. Order:
1. Priority 1 ABSOLUT: CC Opus Auth Flow §36.80 implementation (post Daniel manual prep)
2. **Priority 2 NEW: Scenarios coverage chat-uri strategice dedicate** — ~5-15 chat-uri estimative pentru complete enumeration + decisions LOCKED. Cross-ref §42.9 testing strategy validation real.
3. Priority 3: ADR 026 compile draft full 126 decisions
4. Priority 4: Periodization Engine spec generation per dimension cross-persona

**Pre-Beta blocker:** Scenarios coverage incomplete = Beta launch IMPOSIBIL fără toate edge cases LOCKED + Persona Suite tests representative + 4-Invariant Safety Stack validated.

Cross-ref §42.9 + AUDIT_5000Q + ONBOARDING_SSOT_V1 §10 Open Questions + Beta launch decalare §62.7 Quality > Speed default justifies.

---

## §70 Cumulative LOCKED Count Update (post Batch 1-6 + Closure)

**Pre-session:** 243 LOCKED V1 (post §56-§61 Auth Flow §36.80 ingest)
**Post-session:** **306 LOCKED V1** (+63 substantive net post-overlap)

**Breakdown decomposition:**
- Batch 1 (Architecture & Process): 10 sub + 1 META review division of labor
- Batch 2 (Onboarding & Conversion): 10 sub
- Batch 3 (Auth Edge Cases & Privacy): 10 sub
- Batch 4 (Engine #8 + Periodization): 10 sub
- Batch 5 (RPE/RIR + Beta Mechanics): 10 sub
- Batch 6 (Safety, Compliance, Distribution): 10 sub
- Closure (UX Refinements): 3 sub

Total raw = 64. Overlap absorbed (META review pattern subsumed în workflow general) = **63 net**.

---

## §71 Next Actions Priority Order (post Batch 1-6 + Closure)

### Priority 0 — Push origin main vault changes (Daniel approval pending post-CC ingest)

CC ingest commits push origin main `--no-verify` per P1-FLAG-NEW precedent. Vault-docs-only invariant preserved.

### Priority 1 ABSOLUT — Auth Flow §36.80 CC Opus Implementation Phased (per §62.3)

**Model: Opus** (rationale: scope cross-file integrare ~10 fișiere phased order: firebase.js → auth.js → pages/auth.js → rest. Phased = blast radius minimal per phase + intermediate validation gates).

**Estimate:** ~30-45 min CC autonomous factor 7-9x clusters mari (refined post Batch 1-6 spec extensions).

**Daniel manual prep prerequisites pre-CC (acasă):**
1. Firebase Auth Console setup (~15 min) — authorized domains andura.app + Email Template Magic Link RO + Google OAuth Client ID + Action URL https://andura.app/auth-callback + **Magic Link expiration 24h custom config (per §63.5)**
2. `suport@andura.app` MX records Namecheap forward Daniel personal Gmail (~15 min) — per §62.1 Option A
3. Privacy Policy + ToS V1 Beta validate sprint cu review Claude + Gemini (~30-60 min) — initial drafts created vault `01-vision/`, Daniel final approve minim spot-check per §62.X META

### Priority 2 NEW — Scenarios Coverage 1500-2000 Decisions (chat-uri strategice dedicate)

Per §69.1 PRE-BETA BLOCKER. Estimate ~5-15 chat-uri strategice dedicate scenarios enumeration + decisions LOCKED + Persona Suite Maria/Gigica/Marius edge cases curated. Cross-ref §42.9 testing strategy validation real.

### Priority 3 — ADR 026 compile draft full 126 decisions (chat strategic NEW)

Compile structure: §42 base 10 + §45 spec 75 + §50.1 D3.1 13 + §50.2 D4 11 + §50.3 D2 13 + §50.4 D1 7 + naming distinction = 126 sub-decisions. Replace candidate stub `03-decisions/026-offline-coaching-decision-tree-exhaustive.md`.

### Priority 4 — Periodization Engine spec generation per dimension cross-persona

Chat 1 Volume Landmarks all 3 persona + chat 2 Frequency Distribution + chat 3 Progressive Overload + chat 4 Mesocycle Structure (~3-4 chat-uri estimative). Per Q30 LOCKED.

### Priority 5 — HANDOVER_GLOBAL split execution (per §62.2)

Thematic split (auth/engine/onboarding fișiere separate) + ~50+ wikilinks sweep + rewire. Backup tag `pre-handover-split-2026-05-04-evening` mandatory pre-execution. Chat strategic dedicat post-CC Auth Flow.

### Priority 6 long-term

D3.2-D3.4 + Engine #8 sub-decisions remaining. ADR 022 + 024 + 025 full spec generation post Periodization. Knowledge cadence first quarterly patch post-Beta. Beta Recruitment 50 testeri. Audit legal complete (§46 P4 prerequisite). Soft Launch (target flexible Quality>Speed default per §62.7).

---

## §72 DIFF_FLAGS Update (post Batch 1-6 + Closure)

- **iOS REJECTED LOCKED PERMANENT (NEW):** memory persistent rule + cross-ref §56.10 + §67.10 PWA + TWA Android only. Pre-Beta + post-Beta v1.0/v1.5 = ZERO iOS distribution. v2/v3 demand-driven only.
- **HANDOVER_GLOBAL split FLAG TRIGGERED preserved:** plan thematic split (per §62.2) post-CC Auth Flow chat strategic dedicat.
- **Scenarios Coverage PRE-BETA BLOCKER NEW (per §69.1):** Priority 2 chat-uri strategice ~5-15 dedicate. Beta launch IMPOSIBIL fără.
- **Beta launch decalare oficial Quality > Speed default (NEW per §62.7):** Override §56.9.2 "1 ian 2027 optimistic" preserved. Target flexible NU forced deadline.
- **Privacy Policy + ToS review division of labor (NEW per §62.X META):** Claude + Gemini review cross + Daniel final approve spot-check minim. Pattern reusable text-heavy/legal artifacts general workflow.

---

## §73 Cross-references Comprehensive (post Batch 1-6 + Closure)

**ADR_MULTI_TENANT_AUTH_v1.md amendments inline appended (per §3.1 update-in-place):**
- §AMENDMENT 2026-05-04 evening BATCH 1-6 sub-amendments .1-.10:
  - .1 Magic Link expiration 24h (override 1h) — §63.5
  - .2 Email body wording educativ verbatim — §64.5
  - .3 Auth screen soft-hint UI sub email field — §64.5
  - .4 Session timeout NEVER always-logged-in confirm — §64.7
  - .5 Telemetry ZERO toggle aggregate-only — §64.8
  - .6 SW update prompt non-disruptive — §64.9
  - .7 iOS REJECTED LOCKED PERMANENT — §67.10
  - .8 Email change Magic Link new address only — §64.1
  - .9 Account deletion 2-step type "ȘTERGE" + click — §64.2
  - .10 GDPR Article 20 portability defer v1.5 manual — §64.3

**ADR 014 Onboarding Profile Typing tier-aware preserved:** §63.9 skip + synthetic Demographic Prior consume alignment.

**ADR 017 Demographic Prior Database K-NN K=10 preserved:** §63.9 + §68.1 transparency wording consume.

**ADR 025 candidate "Andura Gândește pentru User" preserved:** §63.9 + §65.3 + §66.3 + §68.1 alignment graceful degradation universal.

**PRODUCT_STRATEGY_SPEC_v1 amendments inline appended:**
- §5.4 Pregnancy Settings ONLY confirm — §67.1
- §5.5 Eating disorder defer v1.5+ confirm — §67.4
- §5.8 Heart condition Settings + red disclaimer scroll-to-bottom B-clarified — §67.3
- §6.1 Push notifications ZERO V1 override (defer v2) — §67.7
- §6.5 Achievement badges scope cut V1 (NU revoke pillar) — §67.9

**ONBOARDING_SSOT_V1 amendments inline appended:**
- §3 T0 question order obiectiv-first — §63.1
- §8 Disclaimer medical Ecran 4 Obiectiv mandatory — §67.5

**HANDOVER_GLOBAL §X cross-refs preserved (zero info loss):** §36.75 + §36.78-§36.80 + §36.82-§36.83 + §36.93-§36.94 + §36.99 + §36.100 + §36.107 + §42.1-§42.10 + §45.2-§45.7 + §50.1-§50.4 + §56.1-§56.19 + §57-§61.

**DECISION_LOG entry NEW appended:** "2026-05-04 evening — Batch 1-6 + Closure 63 sub-decisions LOCKED V1 (cumulative 306)" cu breakdown decomposition + chat resolution iterations push-back validated.

**INDEX_MASTER.md updates appended:** cumulative 306 LOCKED V1 + Engine #8 spec sub-decisions + Periodization spec partial + Beta mechanics LOCKED + iOS REJECTED PERMANENT entry + Scenarios Coverage PRE-BETA BLOCKER FLAG entry.

---

🦫 **Pass criteria ≥10/12 PASS (≥83%) → PROCEED CC Opus Auth Flow §36.80 implementation phased Priority 1 ABSOLUT (post Daniel manual prep prerequisites complete). Cumulative 306 LOCKED V1 post §62-§73 ingest (+63 substantive net Batch 1-6 + Closure). Scenarios Coverage PRE-BETA BLOCKER NEW Priority 2 ~5-15 chat-uri strategice dedicate. iOS REJECTED LOCKED PERMANENT (NEW). Beta launch decalare oficial Quality > Speed default. Review Division of Labor LOCKED V1 (Claude + Gemini text-heavy/legal review cross). HANDOVER_GLOBAL split FLAG TRIGGERED preserved — thematic split planned post-CC Auth Flow chat strategic dedicat.**

**Andura needs to be the best. ✊**
