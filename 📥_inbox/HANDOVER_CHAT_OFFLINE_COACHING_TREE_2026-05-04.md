# HANDOVER_CHAT_OFFLINE_COACHING_TREE_2026-05-04

**Owner:** Daniel (Product Owner) + Claude Co-CTO
**Status:** 🆕 ACTIVE — chat strategic post-Vault Hygiene SSOT merge ALIGNMENT 12/12 PASS
**Date:** 2026-05-04 home session (bridge la birou next session)
**See also:** [[06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.93-§36.98 + [[01-vision/SUFLET_ANDURA|SUFLET ANDURA]] + [[03-decisions/023-llm-intent-interpretation|ADR 023]] + [[03-decisions/018-engine-extensibility-architecture|ADR 018]] + [[04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1|COGNITIVE_ARCHITECTURE]]

---

## §0 Context Sesiune

Chat strategic dedicat fezabilitate **Andura Offline Pure Coaching** (ZERO API runtime pentru core coaching) cu paritate target ~90-95% Claude pe input structurat. Origine: Daniel întrebare directă "Pe reasoning + coaching ești peste Jeff?" → escalație iterativă "putem face Andura offline să atingă outputul tău fără API?".

**Conclusion sesiune:** DA fezabil pe input pur structurat (NU language ambiguous). 1500-2000 ramuri decision tree pre-mapped de Claude = paritate ~90-95% cu Claude pe coaching tipic Maria/Gigica/Marius. **Pivot arhitectural confirmat:** "more engine, less LLM runtime" — aliniat Bugatti paradigm + ADR 018 Engine Extensibility foundation ready + ADR 023 LLM scope strict (Pain text + Equipment text) preserved.

---

## §36.99 ADR 026 candidate "Andura Offline Coaching Decision Tree Exhaustive" — PRE-BETA BLOCKER LOCKED V1

**Status:** Candidate LOCKED V1, ADR file creation `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` PENDING Faza 3 cleanup (post Vault Hygiene Sprint complete) sau chat strategic dedicat NEW post Vault Hygiene + Auth.

**Decision wording verbatim:**

> "Andura V1 Beta = offline pure coaching pe input structurat. Decision tree exhaustiv 1500-2000 ramuri pre-mapped de Claude (chat strategic) implementate de CC Opus în engine modules. Paritate target ~90-95% cu Claude pe input structurat tipic Maria/Gigica/Marius. ZERO LLM runtime pentru core coaching paths. ADR 023 LLM scope strict (Pain text + Equipment text) PRESERVED unchanged. Aplicabilitate: pre-Beta blocker per §36.57 Prebeta Scope Rule (coach intelligence core = mandatory prebeta non-negotiable)."

**Rationale:**

- **Suflet Andura aliniat:** SUFLET §1.1 ~75% replicabil V1 engine deterministic — F1 Triangulation + F2 Bias + F3+F4 Mode UI + F5 Push-back proporțional + F6 Adaptive output no inference = enumerable principles
- **Bugatti paradigm:** peak craft, ZERO compromise, refactor later NEVER happens
- **Cost zero scale:** 50 useri × 4 sesiuni × ZERO LLM call core = €0/lună core coaching (vs ADR 023 scope strict ~0.4% Groq free tier pentru Pain/Equipment text)
- **Determinism preserved:** Cognitive Q4 ZERO LLM runtime original intent honor pentru core engine paths
- **Knowledge breadth NU coaching live capability:** LLM-urile pierd pe persistent memory + latency + cost — gap arhitectural NEFIXAT de model upgrades. Knowledge breadth novel = content layer updatable, NU capability blocker (vezi §36.103)
- **Jeff demolish clear:** Andura full-built bate Jeff exhaustiv pe orice goal × experience × equipment (personalizare empirică + memory persistent + latency live + auto-detect bias/overtraining)

**Paritate target detail:**

| Input type | Paritate vs Claude | Note |
|------------|---------------------|------|
| Input pur structurat (vârstă/kg/BF%/PRs/equipment/schedule/history/recovery markers) | ~90-95% | Maria/Gigica/Marius tipic |
| Combinații rare multidimensionale (67 ani + post-COVID + ankle limitat + diabet) | ~60-70% | Edge cases Jeff oricum NU gestionează |
| Language ambiguous text input | ~40-60% | NU în scope offline — fallback ADR 023 LLM scope strict (Pain + Equipment text) |

**5-10% degradare grațioasă** pe combinații rare cu twist multidimensional unde Claude face inference probabilistic cross-domain. Decision tree degradează la "best fit branch" cu output decent dar sub-optimal vs Claude. **Acceptabil** pentru că restul 5-10% reprezintă scenarii pe care Jeff NU le gestionează deloc.

**Aliniat ADR 023 (NU contradicție):**

- ADR 023 LLM intent acoperă **interpretation language ambiguous** (Pain text + Equipment text)
- ADR 026 offline tree acoperă **reasoning structurat coaching** (volume, intensity, periodization, deload, substitution, nutrition)
- Hybrid clean: input STRUCTURAT (forms, buttons, sliders) → decision tree offline + input AMBIGUOUS (free-text Pain/Equipment) → LLM intent classification scope strict + coaching reasoning = offline pure deterministic

**Cross-refs:** [[03-decisions/023-llm-intent-interpretation|ADR 023]] preserved + [[03-decisions/018-engine-extensibility-architecture|ADR 018]] Dimension Registry foundation + [[01-vision/SUFLET_ANDURA|SUFLET ANDURA]] §1.1 ~75% replicabil V1 + Cognitive Q4 ZERO LLM runtime original intent honored core paths + §36.57 Prebeta Scope Rule mandatory + §36.94 ADR 025 candidate "Andura Gândește pentru User" graceful degradation aliniat (engine pre-fills default).

---

## §36.100 7 Engines Prescriptive NEW LOCKED V1 — Roadmap Pre-Beta

**Decision:** 7 engines prescriptive NEW adăugate la 14 reactive engines existing = **21 engines total coverage exhaustivă** pentru "bate Jeff offline pe input structurat". CC time = irrelevant per Daniel directive. Cu ADR 018 Dimension Registry foundation ready, adăugarea = plug-in curat zero refactor existing 14.

**Status:** LOCKED V1 roadmap, file creation per engine + spec generation = chat strategic dedicat NEW post Vault Hygiene + Auth.

### 7 Engines NEW (priority order pending Daniel decision chat NEW):

| # | Engine | Scope | Cross-ref ADR |
|---|--------|-------|---------------|
| 1 | **Periodization Engine** | Block / undulating / linear selection per goal × experience × frequency × age | NEW ADR pending |
| 2 | **Goal Adaptation Engine** | Cut / bulk / maintenance / recomp differential logic (volume / intensity / recovery / kcal) | [[03-decisions/024-goal-driven-program-templates\|ADR 024]] PENDING file create |
| 3 | **Bayesian Nutrition Engine** | Kcal / macro inference + adjustment per phase × goal × age × BF% × activity | [[03-decisions/022-bayesian-nutrition-inference\|ADR 022]] PENDING file create |
| 4 | **Deload Protocol Engine** | When (composite fatigue triggers) / how (volume cut / intensity hold / full rest) dedicat | NEW ADR pending |
| 5 | **Energy Adjustment Engine** | Sleep × stress × pre-session readiness → volume / intensity adjustment (extends §36.82 partial calibration) | NEW ADR pending |
| 6 | **Tempo/Form Cues Engine** | Text coaching cues (3-1-1, paused reps, ROM, mind-muscle connection) per exercise category | NEW ADR pending |
| 7 | **Specialization Engine** | Temporary lagging body part focus (Jeff signature) — auto-detect weakness + propose specialization block | NEW ADR pending |

### 14 Reactive Engines Existing (preserved unchanged):

dp / aa / ruleEngine / alternativeEngine / patternLearning / adherence / calibration / weaknessDetector / stagnationDetector / predictionEngine / plateauInterventions / proactiveEngine / whyEngine / sessionBuilder.

### Effort estimate realist:

- ~150-250h CC Opus per engine NEW × 7 = **~1050-1750h CC autonomous** spread peste 6-12 luni roadmap
- ~50-100h Daniel chat strategic spec generation + product UX integration decisions
- CC time irrelevant per Daniel directive ("nu îmi pasă cât rulează CC")
- Singura constraint reală = chat strategic Daniel-time pentru spec generation + decizii UX

**Cross-refs:** §36.99 ADR 026 candidate (engines vorbesc PRIN voices via Dimension Registry) + ADR 018 plug-in curat + §36.83 Beta-launch ASAP timing flexible (impact 6-9 luni adjust acceptable Daniel approved).

---

## §36.101 5 Voices Cognitive Architecture CONFIRMED (slip clarification)

**Status:** CONFIRMED arhitectura existing LOCKED, NU decizie nouă. Slip Claude-side imprecizie clarificat.

**5 voices arhitectura cognitive v1 (LOCKED):**

1. **HISTORICAL** — voice temporal past (data via Event Anchor R22)
2. **REALTIME** — voice temporal present (since last sleep cycle)
3. **PROJECTION** — voice temporal future (2 instanțe: tactical + strategic)
4. **ARBITRATOR** — meta-voice consensus (consume 3 temporal verdicts → final decision via 5-level Precedence Hierarchy + 27 reguli arbitration)
5. **ACTION** — execution voice (singurul cu mutation rights, build session + persist via Event Sourcing)

**Slip Claude:** răspuns inițial "3 voices" — confuzie între voices temporale (3 produc VoiceVerdict structured) și voices arhitecturale (5 total în 5-engine cognitive segmentation per Daniel vision 2026-04-28 NIGHT).

**Voice 6-th GOAL discutat → REJECTED §26.2:** goal = SETTING parametric pe ACTION layer, NU voice nou. Rationale validă pentru "voice nou rejected" (overengineering detection mismatch real-time silent), DAR statistica "98% NU schimbă goal" era mis-cited ca rationale general — vezi §36.102 clarification.

**Pentru offline coaching tree exhaustive (§36.99):**

- ✅ **5 voices = suficient.** NU lipsesc voices. Architectura cognitive layer ready
- ✅ **Engines noi vorbesc PRIN voices** via Dimension Registry ADR 018 — Periodization Engine contribuie verdict la HISTORICAL (ce periodization ai făcut) + REALTIME (ce e activ săpt asta) + PROJECTION (ce vine next mesocycle)

**Cross-refs:** [[04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1|COGNITIVE_ARCHITECTURE]] PARTEA 1-3 (27 reguli + VoiceVerdict schema + 5-level Precedence) + §26.2 Goal-ca-setting LOCKED + ADR 018 Dimension Registry plug-in pattern.

---

## §36.102 Goal Lifecycle Change Reconfirmed First-Class Supported (slip clarification)

**Status:** CONFIRMED arhitectura existing LOCKED, NU decizie nouă. Statistica mis-cited de Claude clarificată.

**Slip Claude:** citarea "98% NU schimbă goal post-onboarding" ca rationale general în răspunsul anterior. Statistica corect interpretat **strict** pentru "voice 6-th GOAL nou cu detection mismatch silent real-time" (overengineering rejected §26.2) — NU pentru "useri NU schimbă goal lifecycle".

**Realitatea lifecycle Gigel:**

```
Onboarding: SLĂBIRE (gras, vrea slim)
  ↓ 6-12 luni
MAINTAIN (a slăbit, vrea să țină)
  ↓ 12-24 luni
TONIFIERE/DEFINIRE (vrea aestetic)
sau
FORȚĂ (nivel avansat)
```

**Goal change lifecycle = pattern majoritar la useri serioși long-term, NU edge case 2%.**

**Arhitectura SUPORTĂ deja goal change first-class:**

1. **§36.35 Goal Shift Event Handler LOCKED V1** — user tap "Schimbă obiectiv" în Setări → Engine aplică Modificatori Template (rep ranges, RIR, rest time) + Streak Reset + 2-session calibration window (interval estimat NU single point per SUFLET F1 Triangulation)
2. **§26.5 Re-prompt periodic 4-6 săpt** — modal in-app "Obiectivul tău e încă X? Confirmă sau schimbă" (anti-rigid, anti-spam cooldown 21 zile post-confirm)
3. **Conservare date fizice:** PR records + CDL logs + istoric forță = INTACT post-shift
4. **5 templates V1 ready:** Forță & Dezvoltare / Tonifiere & Definire / Slăbire / Longevitate / Sănătate Generală

**Distincție tehnică critică:**

- **GOAL** = setting strategic user (5 template choice) — schimbat manual via Setări
- **PHASE** = automated CUT/BULK/MAINTAIN (sys.js calculează BF% + sezon) — sub-state per goal
- **MODE** = Estetică ↔ Forță (sub-modificator rep ranges/intensity)

Slăbire → Mentinere = goal switch explicit (template change). CUT → MAINTAIN automated = phase change (sub-state intern, NU template change).

**Cross-refs:** §36.35 Goal Shift Event Handler + §26.2 Goal-ca-setting LOCKED + §26.5 Re-prompt periodic + sys.js phase detection automated + ADR_OUTLIER_FILTER EXT-2 Goal Shift extension.

---

## §36.103 Knowledge Layer Update Cadence LOCKED V1 — Content Store NU Capability Blocker

**Decision wording verbatim:**

> "Knowledge layer Andura = content store updatable periodic, NU capability blocker arhitectural. Pattern: engines = logic stable (rare changes), knowledge = data periodic refresh. Update cadence LOCKED V1: quarterly (meta-analyses noi + tweaks volume/frequency landmarks) / bi-annual (exercise library extension) / annual (periodization template revisions per literature consensus shift). Mecanism delivery: Claude chat urmărește field research + generează patch specs cu rationale + cross-refs literature → CC Opus implementează patches incremental (~5-15h/quarter) → Feature Flags rollout gradual (10%/50%/100%) safe deployment → CDL audit trail post-deployment metrics check."

**Rationale:**

- **Engines = logic stable** (Schoenfeld volume landmarks nu se schimbă brusc, periodization templates Helms/Israetel evoluează lent)
- **Knowledge = data refresh** (exercise library, threshold values, MEV/MAV/MRV calibration, RPE matrix) tunabil via Remote Config + data files
- **ADR 018 Schema Versioning + Feature Flags ready infrastructure** pentru rollout safe
- **Avantaj competitiv vs Jeff:** Jeff vinde program 2024 încă în 2027 static. Andura updates quarterly automat — user primește latest research findings fără să cumpere program nou
- **Avantaj vs LLM frontier:** LLM-urile au knowledge cutoff fix (training date) — Andura quarterly fresh + structurat verificabil (NU "GPT a citit ceva")

**Knowledge layers extensibile:**

- Exercise library (`src/exercises/`) — ADR 022 V2 prevede ~50-150 exerciții add post-launch
- Decision tree rules — versionate per ADR 018 Schema Versioning
- Periodization templates — Helms/Israetel/Schoenfeld block schemes ca data files NOT cod
- Volume landmarks (MEV/MAV/MRV per muscle) — config tunabil
- Substitution rules — alternativeEngine extensibil (data NU logic refactor)
- RPE/RIR thresholds — Remote Config tunable per profile

**Update cadence detail:**

- **Quarterly** — meta-analyses noi (Schoenfeld lab output ~3-4/an), tweaks volume/frequency landmarks, RPE thresholds calibration
- **Bi-annual** — exercise library extension (variante noi populare community), substitution rules update
- **Annual** — periodization template revisions per literature consensus shift, MEV/MAV/MRV recalibrare

**Cross-refs:** ADR 018 Schema Versioning + Feature Flags + §36.99 ADR 026 offline tree (knowledge ≠ capability) + Exercise library schema §36.36 extension + alternativeEngine.js extensibilitate.

---

## §36.104 Effort Estimate Roadmap (informational, NU LOCKED)

**Realistic effort spread peste 6-12 luni roadmap pre-Beta:**

- **CC Opus autonomous:** ~1050-1750h (7 engines × 150-250h each)
- **Daniel chat strategic:** ~50-100h spec generation + UX integration decisions
- **Daniel-time real cu factor 7-9x slippage** — handover + ingestion + decision delays + life context cu copil mic + job + familie
- **Timing impact §36.83 Beta:** flexible adjust 6-9 luni acceptable per Daniel approval ("nu îmi pasă cât rulează CC")

**NU LOCKED** — estimare informational pending breakdown per engine în chat strategic dedicat NEW post Vault Hygiene + Auth.

---

## §36.105 Pivot Arhitectural Reconfirmed: "More Engine, Less LLM Runtime"

**Status:** CONFIRMED direcție arhitecturală existing LOCKED, NU decizie nouă. Reconfirmation post-discuție offline pure feasibility.

**Pivot direction:**

- **Engine layer expansion:** 14 → 21 engines (7 prescriptive NEW per §36.100)
- **LLM runtime reduction:** ZERO LLM core coaching paths (offline tree per §36.99)
- **LLM scope strict preserved:** Pain text + Equipment text per ADR 023 unchanged
- **Knowledge layer extensibil:** content store updatable quarterly per §36.103

**Aliniat:**

- Bugatti paradigm (peak craft, zero compromise)
- ADR 018 Engine Extensibility foundation
- ADR 023 LLM scope strict (NU contradicție, NU expansion)
- Cognitive Q4 ZERO LLM runtime original intent honor pentru core paths
- §36.94 ADR 025 candidate "Andura Gândește pentru User" graceful degradation
- SUFLET §1.1 ~75% replicabil V1 engine deterministic

**Cross-refs:** §36.99 ADR 026 + §36.100 7 engines + §36.101 voices confirmed + ADR 023 preserved + ADR 018 foundation + Cognitive Q4 honored.

---

## §36.106 Decision Point D2 NEW OPENED FOR DISCUSSION — Injury / Contraindication Mapping Onboarding + In-Session

**Status:** 🟡 OPENED FOR DISCUSSION — chat strategic dedicat NEW (post Vault Hygiene + Auth). NU LOCKED.

**Daniel articulation verbatim:**

> "Sa existe in onboarding o chestie de accidentari — gen daca omul are hernie sa nu il pui la deadlifts. Sau in exercitii langa butoanele de 'nu am aparat'. Sau undeva. Ne decidem in chat nou fresh."

**Scope candidate:**

- **Onboarding screen NEW** — checkbox/multi-select condiții medicale care exclud anumite mișcări specific (hernie disc lombară → exclude deadlift conventional + bent-over row, hernie abdominală → exclude squat heavy compresie + Valsalva maneuver, etc.)
- **Inline buton in-session** — adjacent "Nu am aparat" în UI exerciții, scope similar pentru flag contraindicație acută ("Mă doare X la mișcarea asta, exclude permanent / temporary / pentru azi")
- **Granular contraindication mapping** (NU SAFETY_TRIPWIRE_GLOBAL all-or-nothing per Cognitive Q18)
- **Auto-substitution via alternativeEngine** — exercise excluded → propose biomechanically similar safe alternative (deadlift conventional → trap bar deadlift / Romanian deadlift moderate / hip thrust / cable pull-through)

**Cross-refs existing arhitectura:**

- **Cognitive Q18 SAFETY_TRIPWIRE_GLOBAL** — checkbox condiții medicale onboarding → "Passive Mode" tripwire (Dumb Tracker excellent). Daniel proposal extends granular per condiție specific NU all-or-nothing
- **§36.38 Pain/Discomfort Button (ADR 023 Tier 1)** — text input free-form "Mă doare X în zona Y" → LLM intent classification → routing engine action. Daniel proposal complementary (predefined condiții vs free-text post-hoc)
- **§36.85 Pain Button + EU AI Act compliance** — zero rehab claims, NU dispozitiv medical. Daniel proposal trebuie atent legal phrasing (NU "diagnostic", DA "informativ contraindication user-declared")
- **alternativeEngine.js** — extension pentru contraindication mapping per condiție → safe alternative pool
- **§36.36 Schema Extension Exercise Library** — `muscle_target_primary` + `muscle_target_secondary` deja existing. NEW candidate: `contraindications: string[]` field per exercise (ex: deadlift_conventional → ["hernia_disc_lombara", "hernia_abdominala_acuta", "stenoza_spinala_severa"])

**Decision points pending strategic chat NEW:**

- **D2.1** Onboarding screen separat sau integrat în profil typing T1+? (impact friction Maria 65 vs comprehensive injury history)
- **D2.2** Granularity condiții — taxonomie predefinită (15-30 condiții common) vs free-text + LLM classify (ADR 023 extension Tier 3) vs hybrid
- **D2.3** UX placement in-session — buton inline lângă "Nu am aparat" sau separate "Discomfort/Risk" entry vs continue Pain Button §36.38 unified flow
- **D2.4** Liability boundary EU AI Act — wording "informativ user-declared" vs medical disclaimer requirements ToS
- **D2.5** User override "Vreau totuși să fac deadlift" → Liability Flag silent backend (R17 User Agency consistent) vs hard block
- **D2.6** Re-prompt periodic 6-12 luni "Condițiile tale medicale s-au schimbat?" similar §26.5 Goal Re-prompt
- **D2.7** Pregnancy specific handling (Q18 existing tripwire pregnancy pathway) — granular trimester-specific exclusions vs Passive Mode total

**Gigel test pending strategic chat:**

- Maria 65 — comfort completion checkbox condiții vs friction/medical-anxiety? Mediu cultural RO sensibilitate "diagnostic" vs "user-declared"?
- Gigica 35 — postpartum specific pathway vs generic? Diastasis recti contraindication common dar tabu cultural?
- Marius 25 — likely zero condiții, friction onboarding cost-benefit?

**Reasoning Claude pre-chat strategic:**

- **Probabil PRO** granular contraindication mapping pentru "bate Jeff" claim (Jeff zero personalizare injury) + SUFLET F2 ("AI-ul informează nu impune") + ADR 025 candidate graceful degradation (skip → engine assume zero contraindications default)
- **Probabil CONTRA** scope creep onboarding screen lung Maria 65 friction + EU AI Act medical device boundary risk + taxonomy maintenance burden
- **Probabil RECOMMEND hybrid:** taxonomie predefinită minimal (top 10-15 condiții common) onboarding + free-text Pain Button §36.38 post-hoc detection + alternativeEngine auto-substitution + user override liability flag

**Action chat strategic NEW:** Daniel + Claude review draft scope + decizie D2.1-D2.7 + ADR draft "Injury/Contraindication Mapping V1".

**Cross-refs:** Q18 SAFETY_TRIPWIRE_GLOBAL + §36.38 Pain Button + §36.85 EU AI Act compliance + alternativeEngine.js + §36.36 Schema Extension + SUFLET F2 + ADR 025 graceful degradation candidate + ADR 013 §SAFETY_TRIPWIRE.

---

## §37 Status Cumulative V1 Update

**Cumulative LOCKED count:** 87 → **90** (+3 substantive: §36.99 ADR 026 candidate + §36.100 7 engines roadmap + §36.103 Knowledge cadence). §36.101 + §36.102 + §36.105 = clarification slip-uri Claude (NU decizii noi). §36.104 = informational. §36.106 = D2 NEW opened for discussion (NU LOCKED).

**Status V1 cumulative:**

8/8 templates LOCKED + F-NEW + MMI + Storage Full UX + 4 CRITICAL pre-Beta blockers + 12 HIGH cleanup + Top 6 ideation + **90 decizii LOCKED cumulative** + Beta-launch ASAP timing flexible §36.83 + Suflet Andura + filozofia 12k + Self-Correction + Chat C + Pricing tiers + Telegram channel + 8 ADR drafts ALL LOCKED V1 + ADR 023 LOCKED V1 partial spec + ⚠️ PENDING addendum integration Faza 3 + Phase B 51 strings INTEGRATED + Cluster 10-batch foundation tests **1203/1203 PASS** unchanged + Coverage/Build baselines + Sprint UI Sequencing LOCKED V1 + Daniel solo gate Firebase live + Sprint UI 6 UX LOCKED V1 + Slip Log §36.77 + Andura V1 prod LIVE `andura.app` ✅ + §36.78-§36.79 Rebrand+Hotfix + §36.80 BUG 2 Auth Flow Priority 1 ABSOLUT preserved + §36.81-§36.85 Coach/Energy/META/Backlog/Body Region + Memory #24 + §36.86-§36.91 audit total + §36.92 reclasificare 4 buckets + DIFF_FLAGS P1+P2 + §36.93-§36.98 Vault Hygiene Sprint Faza 1 + decizii strategice + **§36.99-§36.106 Andura Offline Coaching Decision Tree Exhaustive Roadmap + 7 Engines Prescriptive NEW + Knowledge Cadence + D2 Injury/Contraindication NEW opened**.

---

## §38 Decision Points Status Update

| ID | Topic | Status | Note |
|----|-------|--------|------|
| **D1** | Save the week silent | 🟡 PENDING | Strategic dedicat post-Vault Hygiene + Auth (A passive intelligence / C in-app banner pasiv, NU B opt-in) |
| D2 §36.86b DELOCK Mechanism | ✅ RESOLVED | ACCEPT propunere wording verbatim Co-CTO |
| D3 Cloud Functions Blaze | ✅ RESOLVED | B Spark plan retain (§36.93) |
| D4 Goal Taxonomy | ✅ RESOLVED | hybrid C deja LOCKED §36.92 |
| D5 Sprint Vault Hygiene Q2 2026 | ✅ SUPERSEDED | Vault Hygiene Sprint = Priority 0 acum |
| D6 ADR 023 cost monitoring | ✅ RESOLVED | B frontend-only soft cap (depends D3=B) |
| **D2 NEW** | **Injury/Contraindication Mapping** | 🟡 **OPENED FOR DISCUSSION** | **§36.106 — chat strategic dedicat NEW post Vault Hygiene + Auth. D2.1-D2.7 sub-decisions pending.** |

---

## §39 Next Actions Priority Order

**Priority 0 ABSOLUT (existing per HANDOVER_GLOBAL session-lock):**

1. **Faza 3 + Faza 4 Vault Hygiene Sprint** chat NEW dedicat — 8 recomandări A-H + ADR 022/024/025 stubs + DECISION_LOG UTF-8 + INDEX_MASTER refresh + HANDOVER_GLOBAL split + VAULT_HYGIENE_PASS rule codification (~2.5-3.5h CC autonomous total)

**Priority 1 ABSOLUT (existing preserved):**

2. **Auth Flow §36.80 BUG 2 Firebase 401** chat strategic + prompt CC Opus dedicat (~1-2h Daniel + ~30-45min CC autonomous factor 7-9x)

**Priority 2 NEW (post Priority 0 + Priority 1):**

3. **ADR 026 + 7 Engines Prescriptive spec generation** chat strategic dedicat NEW — Daniel + Claude prioritize 7 engines order impact (Periodization first? Bayesian Nutrition first? Deload Protocol first?) + spec generation per engine + ADR drafts

4. **D2 NEW Injury/Contraindication Mapping** chat strategic dedicat NEW — D2.1-D2.7 decisions + ADR draft "Injury/Contraindication Mapping V1"

5. **D1 Save the week silent** chat strategic dedicat NEW (existing pending)

**Priority 3 (long-term):**

6. **ADR 022 + ADR 024 file creation** Faza 3 stubs + post-Beta full spec
7. **Knowledge cadence first quarterly patch** post-Beta data (Schoenfeld 2027 meta-analyses + tweaks)
8. **Beta Recruitment 50 testeri segmentat** (timing flexible §36.83)
9. **Audit legal €300-500** pre-public-launch
10. **Soft Launch** condiționat DoD complete

---

## §40 Verification Questions Generation Per VAULT_RULES §HANDOVER_PROTOCOL Step 9

CC Opus va genera ALIGNMENT_QUESTIONS_CHAT_NEW.md fresh post-merge cu citation §X file.md + răspuns verbatim per memory rule #22 + PROMPT_CC_HYGIENE §9. Format: ≥10/12 PASS = PROCEED chat strategic NEW, <10/12 = RE-SYNC mandatory.

**Topics expected verification:**

- Q: §36.99 ADR 026 candidate scope + paritate target + aliniat ADR 023?
- Q: §36.100 7 engines roadmap pre-Beta + lista exhaustivă + cross-refs ADR pending?
- Q: §36.101 5 voices CONFIRMED (slip clarification) + voice 6-th GOAL REJECTED rationale?
- Q: §36.102 Goal lifecycle change first-class supported (slip clarification 98% mis-cite)?
- Q: §36.103 Knowledge cadence quarterly/bi-annual/annual + mecanism Feature Flags?
- Q: §36.105 Pivot "More Engine Less LLM Runtime" reconfirmed aliniere ADR 023 unchanged?
- Q: §36.106 D2 NEW Injury/Contraindication Mapping OPENED FOR DISCUSSION + D2.1-D2.7 sub-decisions pending?
- Q: Cumulative LOCKED count post acest ingest (87 → 90)?
- Q: Decision Points status post-update (D1 pending + D2 NEW pending)?
- Q: Next Actions priority order Priority 0/1/2/3?
- Q: Faza 3 + Faza 4 Vault Hygiene Sprint preserved?
- Q: Auth Flow §36.80 Priority 1 ABSOLUT preserved?

---

🦫 **Pass criteria ≥10/12 PASS (≥83%) → PROCEED chat strategic NEW. Cumulative 90 LOCKED. Vault Hygiene Sprint Priority 0 Faza 3+4 PENDING. Auth Flow §36.80 Priority 1 ABSOLUT preserved separat. ADR 026 candidate offline coaching tree pre-Beta blocker. 7 engines prescriptive NEW LOCKED roadmap. Knowledge cadence LOCKED V1. D2 NEW Injury/Contraindication Mapping OPENED FOR DISCUSSION chat strategic dedicat NEW.**

**Andura needs to be the best. ✊**
