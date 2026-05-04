# HANDOVER — Chat Strategic ADR 026 Spec + Vault Hygiene COMPLETE

**Date:** 2026-05-04
**From:** Chat strategic Claude (post Vault Hygiene CC autonomous + ADR 026 decisions 1-10 LOCKED session)
**To:** CC Opus ingest per VAULT_RULES §HANDOVER_PROTOCOL
**Cumulative LOCKED expected post-ingest:** 90 → 100 (+10 substantive ADR 026 decisions)

---

## §41 VAULT HYGIENE SPRINT FAZA 3 + FAZA 4 COMPLETE (2026-05-04 08:30)

### §41.1 Status: ✅ COMPLETE

CC Opus autonomous run ~25min. 8 recomandări A-H + Faza 4 codification executate. ZERO src/tests/scripts touched. ZERO information loss.

**Modificări sumar:**

- **G** — ADR stubs created: `022-bayesian-nutrition-inference.md` (3.7KB STUB) + `024-goal-driven-program-templates.md` (3.2KB STUB) + `025-andura-gandeste-pentru-user.md` (3.4KB CANDIDATE STUB) + `026-offline-coaching-decision-tree-exhaustive.md` (3.0KB CANDIDATE STUB cu 10 Open Questions ready chat strategic NEW).
- **H** — `DECISION_LOG.md` UTF-8 normalize: BOM stripped + 422 mojibake substitutions exact-codepoint applied (109× em-dash + 115× ă + 58× î + 43× ț + 34× → + restul). Saved UTF-8 no BOM LF. Romanian diacritics render correct.
- **F** — Orphan wikilinks cleanup: 21 MISSING (18 LOW stripped + 4 MEDIUM rewired EXEC_QUEUE → outbox workflow + ENGINE_ARCHITECTURE → COGNITIVE_ARCHITECTURE_SPEC_v1 + HANDOVER → HANDOVER_GLOBAL_2026-04-30_evening + 22nd ADR 022 resolved via stub G) + 3 UNREFERENCED (1 git mv archive + 1 git rm bit-identical duplicate + 1 KEEP COACHING_TEXTBOOK_SYNTHESIS legitim research). 39 replacements across 18 files. Verified zero `\[\[.\]\]` hits active vault.
- **C** — `INDEX_MASTER.md` refresh: 51 → 66 active vault files. ADR table 22 → 26. 8 Named ADRs section added explicit. Navigation entries §36.99-§36.107 + ADR stubs + ONBOARDING_SSOT_V1 + DIFF_FLAGS + VAULT_RULES root + PROMPT_CC_HYGIENE. Pricing entry updated Founding €39 + Standard €59 + Elite €79 V1.1 (Chat D 2026-05-02). VAULT CLEANUP HISTORY subsection 3 entries.
- **B** — `01-vision/ONBOARDING_SSOT_V1.md` created. Consolidare 5 SSOT-uri pre-existente fragmentate. 11 sections (Onboarding Flow 4 ecrane + Goal Taxonomy 5 templates + Profile Typing tier-aware + Equipment Filter + Pre-Session Readiness + Injury PENDING D2 + SAFETY_TRIPWIRE + Disclaimer + Anti-Reflex + Open Questions + Cross-Refs). Hybrid C §36.92 D4 LOCKED.
- **A** — HANDOVER_GLOBAL split DEFERRED. File 6058 LOC, threshold codified §VAULT_HYGIENE_PASS STEP 13: >7000 LOC FLAG candidate, >10000 LOC ESCALATE BLOCKER mandatory. Justificare CC: 30-day active window + ~50 wikilink cross-refs risk migration. Acceptable judgment call.
- **D** — Archive policy zero change confirmed (preserve permanent audit trail).
- **E** — DIFF_FLAGS root NU moved la 05-findings-tracker/ (CC judgment: high-visibility lângă VAULT_RULES + PROMPT_CC_HYGIENE root). Reversible oricând.
- **Faza 4** — `VAULT_RULES.md` §VAULT_HYGIENE_PASS section appended post §BATCH_PROTOCOL: trigger conditions + STEP 10-15 spec + §VAULT_HYGIENE_PASS.UTF8 sub-section mojibake substitutions library Python script reusable. Effort ~10-15min CC autonomous per ingest, ZERO Daniel-time. `PROMPT_CC_HYGIENE.md` §2 references VAULT_RULES authoritative.

### §41.2 Commits + Push

7 commits planned vault-docs-only `--no-verify` per P1-FLAG-NEW precedent (Codespace npm install drift pre-existing). Pending Daniel approval push origin main.

### §41.3 Issues preserved

- **P1-FLAG-NEW Codespace npm install drift** — preserved unchanged. NOT regression. Defer dedicated chat post Auth Flow §36.80.
- **§36.61 gap** chronological — pre-existing on origin/main pre-Faza 3+4. NOT introduced.
- **Heading hierarchy mixed §36.99-§36.107** (level 2) vs §36.59-§36.98 (level 3) — cosmetic only, pre-existing 2026-05-04 morning ingest.

---

## §42 ADR 026 SPEC — DECISIONS 1-10 LOCKED V1 (CHAT STRATEGIC 2026-05-04)

Chat strategic dedicated ADR 026 "Andura Offline Coaching Decision Tree Exhaustive" candidate spec. 10 decizii fundamentale LOCKED V1 ready compile draft full chat NEW.

**Context arhitectural confirmed:** 21 engines total (14 reactive existing preserved + 7 prescriptive NEW per §36.100). 1500-2000 ramuri = SUM agregată distribuită ACROSS engines (Periodization ~200-300 ramuri intern + Goal Adaptation ~150-250 + Bayesian Nutrition ~250-350 + Energy Adjustment ~200 + Deload + Tempo + Specialization). ADR 026 = META-arhitectură global concerns SSOT (format ramură + cross-engine merge + testing + storage), NU monolith. ADR-uri engine individuale (022/024/etc) = domain-specific only.

### §42.1 Decizia 1 — Format ramură INTERN engine: B Standard ✅ LOCKED

**Format:**
```
INPUT: {persona_signals: age, sex, kg, BF%, experience_years, goal, equipment, frequency, PRs}
CONDITION: structurat boolean tree
OUTPUT: {periodization_block, volume_landmarks, exercise_priority, intensity_zone, deload_trigger, tempo_cues}
RATIONALE: literature ref (ex: Israetel 2017 MEV/MAV/MRV) + Bugatti reasoning
CROSS_REF: ADR 023 fallback condition + ADR 018 engine module owner
```

**Rationale:** Trasabilitate audit-trail + alimentează WhyEngine + cod auto-documentat verificabil producție. Type-safe TS extensibil.

### §42.2 Decizia 2 — Granularitate condiții: Hybrid B Medium baseline + C Fine selectiv ✅ LOCKED

**Baseline B Medium:** age groups <30 / 30-45 / 45-60 / 60-70 / 70+. Sex × experience baseline rezonabil.

**Fine selectiv C pe interacțiuni critice:**
- Vârstă × Obiectiv (deload volume 65 ani slăbire vs 20 ani hipertrofie)
- Experiență × Intensitate (RIR 0 begin vs advanced)
- Sex × Volume Landmarks (femei upper body MEV/MAV/MRV pragul corect)

**Rationale push-back chat:** C Fine brute force = 7 decades × 2 sex × 3 exp × 5 goal = 210 baseline + BF + freq + equip + PRs = 30000-50000 ramuri × 21 engines = ship NEVER + hallucination risk femeie 75+ Forță advanced ZERO literature. Bugatti adevărat ≠ max everything. Peak craft *unde contează*, smart trade-offs unde NU. Total 1500-2000/engine sustained sănătos.

### §42.3 Decizia 3 — Cross-engine merge META: B Extends Arbitrator existing via Dimension Registry ADR 018 ✅ LOCKED

**Mecanism:** Engines prescriptive contribuie verdicte via Dimension Registry ADR 018 către voices temporale existing (Periodization → HISTORICAL + REALTIME + PROJECTION). Verdictele agregate intră Arbitrator 5-level Precedence + 27 reguli unchanged.

**ZERO change Arbitrator. ZERO voce nouă** (5 voices LOCKED, voice 6-th GOAL rejected §26.2 preserved).

**Slip clarificare:** Termenul "voce virtuală" propus inițial chat = REJECTED (drift conceptual periculos vs 5-voice lock). Wording corect SSOT: "engines contribuie verdicte prin Dimension Registry, NU devin voci".

**Rationale:** Arbitrator deja designed multi-source consensus. Periodization spune "3 seturi" + Discomfort reactiv "genunchi inflamat scade 2 seturi" → Arbitrator dă câștig safety mecanic automat. Determinism absolut preserved. Scutim rescriere protocol from scratch.

### §42.4 Decizia 4 — Engine spec generation order: A Periodization prima ✅ LOCKED

**Rationale:** Periodization trasează limitele maxime volum + intensitate organism susține în timp (MEV/MAV/MRV per muscle group + block periodization phase). Toate celelalte engines = filtre reglaj fin în interiorul cadrului fundamental. Goal Adaptation redistribuie. Energy fluctuates. Bayesian inference relativă la baseline Periodization.

**Order roadmap proposed:** Periodization → Goal Adaptation → Bayesian Nutrition → Deload → Energy → Tempo → Specialization.

### §42.5 Decizia 5 — ADR 026 scope: B Standardizator ✅ LOCKED

**ADR 026 conține (Global Concerns SSOT):**
- Format ramură global
- Cross-engine merge protocol (Arbitrator extends via Dimension Registry)
- Testing strategy (4-invariant safety stack — vezi §42.9)
- Storage mechanisms
- Fallback telemetry circuit breaker
- Versioning deprecation window

**ADR-uri engine individuale (022 Bayesian / 024 Goal Adaptation / etc.) conțin (Domain Concerns):**
- Formule specifice (kcal Bayesian inference)
- Logic Cut/Bulk/Maintain Goal Adaptation
- Specificități biomecanice domain

**Rationale push-back chat:** C Comprehensive monolith 200+ pagini → nimeni citește → drift IRONIC mai mare decât B. Pattern industry standard separation of concerns. Documentația scurtă clară updatable Daniel + CC Opus.

### §42.6 Decizia 6 — Storage format ramuri: B Separate `engine-name.tree.ts` data file ✅ LOCKED

**Pattern:** Logic engine în `<engine-name>.engine.ts` + data ramuri în `<engine-name>.tree.ts` separat (split logic vs data, same repo, same monorepo).

**Rationale:** Tests izolat ramuri direct + tree-shaking Vite corect + grep metadata <5ms + type-safe TS const exhaustiv + updatable repo deploy. Data NOT decoupled în JSON/Firestore (over-engineering pre-Beta, runtime swappable feature aşteaptă post-Beta dacă demand real).

### §42.7 Decizia 7 — Fallback ZERO match: Safe-baseline + CDL telemetry + 5% Circuit Breaker per segment ✅ LOCKED

**Mecanism:**
1. ZERO match input → engine returns safe-baseline coarse generic per goal/age (NU refuză NU LLM escalate runtime — păstrăm offline ZERO LLM core paths preserved §36.99).
2. CDL log injectează `fallback_triggered: true` + persona signals snapshot (telemetry passive monitoring).
3. **Circuit Breaker 5% threshold per segment Maria/Gigica/Marius** — dacă rate fallback > 5% segment → trigger Hotfix Knowledge Sprint imediat NU așteaptă cycle quarterly.

**Rationale push-back chat:** Catch-all silențios = data sit there ramuri lipsă luni. Telemetry passive = insufficient single. Circuit Breaker activ = visible alarm + actionable cadence acceleration peak readiness.

### §42.8 Decizia 8 — Versioning quarterly updates: Additive + 18 luni deprecation window V_N-2 ✅ LOCKED

**Mecanism:**
- Update Q2 2026 → V2 ramuri additive (V1 useri existing rămân unchanged mid-program)
- 18 luni deprecation window V_N-2 → după 18 luni V1 sunset, useri migrate automat la V_latest în calibration window §36.35 (NU instant rupt)
- Maintenance ceiling: max 3 versions concurrent (V_latest + V_N-1 + V_N-2 deprecated → migration). Long-tail zombie versions prevented.

**Rationale push-back chat:** Pure Additive forever = 12 versiuni active 2030 = maintenance hell. Pure Full replace = trust breach mid-mesociclu user (Bugatti F5 push-back proporțional violation). Hybrid Additive + Deprecation 18 luni = balance respect user effort + maintenance cost.

### §42.9 Decizia 9 — Testing strategy: Hibrid Property-based + Persona Suite + 4-Invariant Safety Stack ✅ LOCKED

**Strategy:**
- **Property-based** (random persona × verify output sane via invariants — breadth coverage)
- **Persona simulation suite** (Maria/Gigica/Marius scenarios fixe + edge cases curated, ~50-100 tests representative — depth coverage)
- **4 invariante imutabile mandatory pass:**
  1. Volum: V ≤ MRV per muscle group
  2. Intensitate: RIR ≥ 0 (never below failure)
  3. Frecvență: ≤ 6 sessions/week per muscle group
  4. Deload: mandatory după 4-6 weeks mesocycle

**Rationale push-back chat:** V ≤ MRV singur = miss user gaming MRV cu RIR -2 + frequency 7x = pasted check dar overall unsafe combo. Stack 4 invariants = bulletproof safety net cumulative.

### §42.10 Decizia 10 — Engine activation order runtime: Sequential + Constraint Object Floor/Ceiling Range ±15% ✅ LOCKED

**Pipeline runtime per session build:**
1. **Periodization** generează **coridor (Floor + Ceiling)** baseline (ex: 12-16 seturi pectorali săpt). NU ceiling-only.
2. **Goal Adaptation** redistribuie volume în interiorul coridorului (ex: la slăbire scade chest 12 + crește picioare 16; la hipertrofie reverse). NU trece peste Ceiling NU sub Floor.
3. **Energy Adjustment** fluctuează ±15% baseline coridorului. **Bidirectional NU only-decrease** (zile peak readiness sleep 9h + stress low + RIR bank → UP boost +15% accelerator overload progressive real). Zile fatigue → DOWN -15%.

**Constraint Object immutable** propagat engine la engine (TypeScript readonly type-safe).

**Rationale push-back chat:** Energy only-decrease = miss opportunity peak readiness zile bune. System adevărat Bugatti **harvests good days NU just survives bad ones**. ±15% range bidirectional = progressive overload accelerator când organism gata, recovery support când nu. Coridor Floor/Ceiling Periodization = safety boundary, NU rigid setpoint.

---

## §43 NEXT ACTIONS PRIORITY ORDER

### Priority 0 — Push origin main vault changes (Daniel approval pending)

CC Vault Hygiene Faza 3+4 commits 1-7 push origin main `--no-verify` per P1-FLAG-NEW precedent. Vault-docs-only invariant preserved. Post-push optional cleanup `git branch -D backup-pre-rebase-2026-05-04 && git tag -d local-state-pre-rebase`.

### Priority 1 ABSOLUT — Auth Flow §36.80 BUG 2 Firebase 401

Chat strategic dedicat + prompt CC Opus dedicat. ~1-2h Daniel + ~30-45min CC autonomous. Production blocker preserved.

### Priority 2 — ADR 026 compile draft full + 7 engines spec generation start

Chat strategic NEW dedicat. Compile ADR 026 draft full din §42 deciziile 1-10 LOCKED. Apoi start engine spec generation **Periodization first** (~150-300 ramuri/chat strategic dedicat × ~2-3 chat-uri pentru Periodization spec complete bottom-up persona-driven Maria→Gigica→Marius).

D2 NEW Injury/Contraindication (D2.1-D2.7 sub-decisions) + D3 NEW Don't Like + Home + Calistenice + Sport-Oriented (D3.1-D3.4 verdicts) + D1 Save the week silent — chat strategic NEW separate.

### Priority 3 long-term

ADR 022 + ADR 024 + ADR 025 full spec generation (post Periodization spec). Knowledge cadence first quarterly patch post-Beta. Beta Recruitment 50 testeri. Audit legal. Soft Launch.

### DIFF_FLAGS update

- **P1-FLAG-NEW Codespace npm install drift** — preserved unchanged. Defer dedicated chat post Auth Flow §36.80.
- **HANDOVER_GLOBAL split FLAG candidate** = file 6058 LOC current. Threshold §VAULT_HYGIENE_PASS STEP 13: >7000 LOC FLAG, >10000 LOC ESCALATE BLOCKER mandatory.

---

## §44 STATUS CUMULATIVE POST INGEST

**Cumulative LOCKED count expected:** 90 → **100** (+10 substantive ADR 026 decisions §42.1-§42.10).

**Vault state:**
- Vault Hygiene Sprint Faza 3+4 ✅ COMPLETE (8 recomandări A-H + Faza 4 codified)
- 26 ADR active (22 + 4 stubs G recomandare)
- 66 active vault files (51 → 66 post-stubs + ONBOARDING_SSOT_V1)
- VAULT_RULES.md §VAULT_HYGIENE_PASS rule codified Faza 4
- Cluster 10-batch foundation tests **1203/1203 PASS** unchanged
- Andura V1 prod LIVE `andura.app` ✅ unchanged
- ADR 026 spec decisions 1-10 LOCKED ready compile draft full chat NEW

**Andura needs to be the best. ✊**
