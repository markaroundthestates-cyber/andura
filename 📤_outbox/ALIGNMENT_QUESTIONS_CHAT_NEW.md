# ALIGNMENT QUESTIONS — Chat Strategic NEW (post Handover Ingest §36.99-§36.107 + §37-§40 — 2026-05-04)

**Owner:** CC Opus (generate per VAULT_RULES §HANDOVER_PROTOCOL step 9 + memory rule #22).
**Pass criteria:** ≥10/12 PASS (≥83%) → PROCEED chat strategic NEW (Faza 3 + Faza 4 Vault Hygiene execution / Auth Flow §36.80 / ADR 026 + 7 engines spec gen / D2 / D3 / D1 per Daniel decision).
**Source:** Vault SSOT post-merge `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.99-§36.107 + §37-§40 + DIFF_FLAGS P1-FLAG-NEW.

---

## Q1: ADR 026 candidate scope + paritate target + aliniere ADR 023?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.99 ADR 026 candidate.

**Răspuns verbatim:** **"Andura V1 Beta = offline pure coaching pe input structurat. Decision tree exhaustiv 1500-2000 ramuri pre-mapped de Claude (chat strategic) implementate de CC Opus în engine modules. Paritate target ~90-95% cu Claude pe input structurat tipic Maria/Gigica/Marius. ZERO LLM runtime pentru core coaching paths. ADR 023 LLM scope strict (Pain text + Equipment text) PRESERVED unchanged. Aplicabilitate: pre-Beta blocker per §36.57 Prebeta Scope Rule."** Status: candidate LOCKED V1, file `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` PENDING Faza 3. Paritate detail: ~90-95% pe input pur structurat (vârstă/kg/BF%/PRs/equipment) + ~60-70% pe combinații rare multidimensionale (edge cases Jeff oricum NU gestionează) + ~40-60% pe language ambiguous text (NU în scope offline — fallback ADR 023 strict). 5-10% degradare grațioasă acceptabilă. NU contradicție cu ADR 023 — hybrid clean: STRUCTURAT → decision tree offline, AMBIGUOUS free-text Pain/Equipment → LLM intent classification scope strict, coaching reasoning offline pure deterministic.

---

## Q2: 7 Engines Prescriptive NEW lista exhaustivă + cross-refs ADR pending?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.100 7 Engines NEW.

**Răspuns verbatim:** 7 engines prescriptive NEW LOCKED V1 roadmap pre-Beta (14 reactive existing + 7 NEW = **21 total**): **(1) Periodization Engine** (Block / undulating / linear per goal × experience × frequency × age — NEW ADR pending); **(2) Goal Adaptation Engine** (Cut / bulk / maintenance / recomp differential logic — ADR 024 PENDING file create); **(3) Bayesian Nutrition Engine** (Kcal / macro inference per phase × goal × age × BF% × activity — ADR 022 PENDING file create); **(4) Deload Protocol Engine** (When composite fatigue triggers / how — NEW ADR pending); **(5) Energy Adjustment Engine** (Sleep × stress × pre-session readiness → volume/intensity adjustment, extends §36.82 — NEW ADR pending); **(6) Tempo/Form Cues Engine** (Text coaching cues 3-1-1, paused reps, ROM, mind-muscle per exercise category — NEW ADR pending); **(7) Specialization Engine** (Temporary lagging body part focus — Jeff signature — auto-detect weakness + propose specialization block — NEW ADR pending). 14 reactive engines existing preserved unchanged: dp / aa / ruleEngine / alternativeEngine / patternLearning / adherence / calibration / weaknessDetector / stagnationDetector / predictionEngine / plateauInterventions / proactiveEngine / whyEngine / sessionBuilder. Effort: ~150-250h CC Opus per engine × 7 = ~1050-1750h CC autonomous spread 6-12 luni roadmap.

---

## Q3: 5 voices Cognitive CONFIRMED + voice 6-th GOAL REJECTED rationale?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.101 (slip clarification, NU decizie nouă).

**Răspuns verbatim:** 5 voices arhitectura cognitive v1 LOCKED: **HISTORICAL** (temporal past via Event Anchor R22) + **REALTIME** (temporal present since last sleep cycle) + **PROJECTION** (temporal future, 2 instanțe tactical + strategic) + **ARBITRATOR** (meta-voice consensus, consume 3 temporal verdicts → final via 5-level Precedence + 27 reguli) + **ACTION** (execution voice, singurul mutation rights, build session + persist Event Sourcing). Slip Claude inițial "3 voices" = confuzie temporale (3 produc VoiceVerdict) vs arhitecturale (5 total). Voice 6-th GOAL REJECTED §26.2: goal = SETTING parametric pe ACTION layer NU voice nou. Rationale validă pentru "voice nou rejected" (overengineering detection mismatch real-time silent). Pentru §36.99 offline tree: 5 voices suficient. Engines noi vorbesc PRIN voices via Dimension Registry ADR 018 — Periodization Engine contribuie verdict la HISTORICAL + REALTIME + PROJECTION.

---

## Q4: Goal lifecycle change first-class supported (slip clarification 98% mis-cite)?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.102.

**Răspuns verbatim:** Statistica "98% NU schimbă goal" mis-cited ca rationale general. Corect: strict pentru "voice 6-th GOAL nou cu detection mismatch silent real-time" (§26.2 rejected) — NU pentru "useri NU schimbă goal lifecycle". Realitatea Gigel: Onboarding SLĂBIRE → 6-12 luni → MAINTAIN → 12-24 luni → TONIFIERE/DEFINIRE sau FORȚĂ. **Goal change lifecycle = pattern majoritar la useri serioși long-term, NU edge case 2%.** Arhitectura SUPORTĂ deja: §36.35 Goal Shift Event Handler LOCKED V1 (Modificatori Template + Streak Reset + 2-session calibration window) + §26.5 Re-prompt periodic 4-6 săpt + Conservare PR records + CDL logs intact post-shift + 5 templates V1 ready (Forță & Dezvoltare / Tonifiere & Definire / Slăbire / Longevitate / Sănătate Generală). Distincție tehnică: GOAL = setting strategic user (5 template choice) / PHASE = automated CUT/BULK/MAINTAIN sub-state / MODE = Estetică ↔ Forță sub-modificator.

---

## Q5: Knowledge cadence quarterly/bi-annual/annual + mecanism Feature Flags?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.103 Knowledge cadence LOCKED V1.

**Răspuns verbatim:** **"Knowledge layer Andura = content store updatable periodic, NU capability blocker arhitectural. Pattern: engines = logic stable (rare changes), knowledge = data periodic refresh. Update cadence LOCKED V1: quarterly (meta-analyses noi + tweaks volume/frequency landmarks) / bi-annual (exercise library extension) / annual (periodization template revisions per literature consensus shift). Mecanism delivery: Claude chat urmărește field research + generează patch specs cu rationale + cross-refs literature → CC Opus implementează patches incremental (~5-15h/quarter) → Feature Flags rollout gradual (10%/50%/100%) safe deployment → CDL audit trail post-deployment metrics check."** Avantaj competitiv: vs Jeff (program 2024 static în 2027) Andura updates quarterly automat fără să cumpere program nou. Vs LLM frontier (knowledge cutoff fix training date) Andura quarterly fresh + structurat verificabil.

---

## Q6: Pivot "More Engine Less LLM Runtime" reconfirmed aliniere ADR 023 unchanged?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.105 (CONFIRMED, NU decizie nouă).

**Răspuns verbatim:** Pivot direction reconfirmed: **Engine layer expansion 14 → 21 engines** (7 prescriptive NEW per §36.100) + **LLM runtime reduction ZERO LLM core coaching paths** (offline tree per §36.99) + **LLM scope strict preserved Pain text + Equipment text per ADR 023 unchanged** + Knowledge layer extensibil content store updatable quarterly per §36.103. Aliniat: Bugatti paradigm + ADR 018 Engine Extensibility foundation + ADR 023 LLM scope strict (NU contradicție, NU expansion) + Cognitive Q4 ZERO LLM runtime original intent honor pentru core paths + §36.94 ADR 025 candidate "Andura Gândește pentru User" graceful degradation + SUFLET §1.1 ~75% replicabil V1 engine deterministic.

---

## Q7: D2 NEW Injury/Contraindication Mapping OPENED FOR DISCUSSION + D2.1-D2.7 sub-decisions?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.106 D2 NEW.

**Răspuns verbatim:** Daniel articulation verbatim: **"Sa existe in onboarding o chestie de accidentari — gen daca omul are hernie sa nu il pui la deadlifts. Sau in exercitii langa butoanele de 'nu am aparat'. Sau undeva. Ne decidem in chat nou fresh."** Status 🟡 OPENED FOR DISCUSSION (NU LOCKED). Scope candidate: Onboarding screen NEW checkbox condiții medicale + inline buton in-session adjacent "Nu am aparat" + granular contraindication mapping (NU SAFETY_TRIPWIRE_GLOBAL all-or-nothing) + auto-substitution alternativeEngine. **D2.1-D2.7 pending strategic chat NEW:** D2.1 Onboarding screen separat sau integrat profil typing T1+? / D2.2 Granularity (taxonomie 15-30 condiții vs free-text + LLM ADR 023 Tier 3 vs hybrid)? / D2.3 UX placement in-session (inline lângă "Nu am aparat" sau separate "Discomfort/Risk")? / D2.4 Liability boundary EU AI Act wording? / D2.5 User override "Vreau totuși deadlift" (Liability Flag silent backend vs hard block)? / D2.6 Re-prompt periodic 6-12 luni similar §26.5 Goal Re-prompt? / D2.7 Pregnancy specific handling (granular trimester vs Passive Mode total)?

---

## Q8: D3 NEW Don't Like + Home + Calistenice + Sport-Oriented OPENED FOR DISCUSSION + 4 sub-buckets?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.107 D3 NEW.

**Răspuns verbatim:** Daniel articulation verbatim: **"Optiune buton nu vresu/nu imi place, antrenamente de acasa, calestenice, sport orientated trainings?"** Status 🟡 OPENED FOR DISCUSSION (NU LOCKED). 4 sub-buckets distinct scope vs D2 medical: **D3.1 Buton "Nu vreau"** = preferință stylistic pură (NU medical NU logistic NU temporary). **D3.2 Antrenamente Acasă** = Template variant equipment minim subset (Maria 65 mobility + Gigica 35 postpartum + Marius 25 backup). **D3.3 Calistenice** = Discipline distinct bodyweight (pull-ups → muscle-ups → planche → front lever → handstand etc.) cu skill progressions. **D3.4 Sport-Oriented** = Programming specific per sport (football / tennis / climbing / running / MMA / boxing / volleyball / basketball etc.) + accessory + periodization off/pre/in-season.

---

## Q9: D3.1 + D3.2 Claude pre-recommend PRE-BETA mandatory rationale?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.107 D3.1 + D3.2.

**Răspuns verbatim:** **D3.1 Buton "Nu vreau" PRE-BETA mandatory:** Aliniat SUFLET F5 push-back proporțional cu risc — preferință stylistic = accept user, NU push (User Agency > Paternalism per R17). Low-effort UX extension existing alternative buttons (~1-2h CC). High-value retention (user nu primește repeat exercises pe care le urăște). Aliniat ADR 025 graceful degradation candidate. Pending: D3.1.1 Hard skip vs Soft skip vs Hybrid + D3.1.2 Engine push-back 1× per dislike + D3.1.3 Substitution priority + D3.1.4 UX placement. **D3.2 Home Workouts PRE-BETA mandatory:** Maria 65 use case MASSIVE (mobility issues + intimidating gym + transportation barriers + age cultural RO friction → home unblock 30-40% Maria segment). Gigica 35 use case MASSIVE (postpartum + copil mic + time + privacy → home unblock 25-35% Gigica segment). Marius 25 backup (vacation / business travel / weather / gym closed). Existing arhitectura partial ready: §36.36 Schema Extension Exercise Library + alternativeEngine.js. Effort: ~30-80h CC (equipment filter + template variants + ~30-50 exerciții bodyweight library extension).

---

## Q10: D3.3 + D3.4 Claude pre-recommend POST-BETA + alternative pre-Beta?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.107 D3.3 + D3.4.

**Răspuns verbatim:** **D3.3 Calistenice POST-BETA v1.5** (NU pre-Beta): Niche audience (~15-20% Marius advanced + ZERO Maria + ZERO Gigica) + scope creep massive (skill progression trees + isometric holds + tempo work + leverage progressions + injury prevention shoulder/elbow) + ~150-300h CC v1.5 + conflict §36.83 Beta-launch ASAP timing flexible (+6-9 luni adițional NEVER ship). **Pre-Beta alternative:** include moves calistenice STANDARD în library V1 (~10-15 moves: pull-ups + chin-ups + dips + push-ups variations + BW squats + lunges + pistol squat progression + handstand basics + L-sit) cu equipment "Pull-up bar" filter, NU discipline distinct separat. **D3.4 Sport-Oriented POST-BETA v2.0+** (definite NU pre-Beta): Niche-of-niche (~5-10% Marius cross-sport + ZERO Maria + ZERO Gigica) + scope multiplication 10x (10+ sports × periodization × accessory × injury prevention drastic different per sport) + ~500-1000h CC v2.0+ + liability concern regulatory (sport coach = federation registrations + insurance higher) + EU AI Act medical device boundary risk. **Pre-Beta alternative:** întrebare onboarding "Practici sport competitiv?" YES/NO + sport name free-text (preparation v2 user base, ZERO programming impact pre-Beta).

---

## Q11: Cumulative LOCKED count post acest ingest (87 → 90)?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §37 Status Cumulative.

**Răspuns verbatim:** Cumulative LOCKED count: **87 → 90** (+3 substantive: §36.99 ADR 026 candidate + §36.100 7 engines roadmap + §36.103 Knowledge cadence). §36.101 + §36.102 + §36.105 = clarification slip-uri Claude (NU decizii noi, +0). §36.104 = informational (+0). §36.106 = D2 NEW opened for discussion (NU LOCKED, +0). §36.107 = D3 NEW opened for discussion (NU LOCKED, +0). Status V1 cumulative: 8/8 templates LOCKED + F-NEW + MMI + Storage Full UX + 4 CRITICAL pre-Beta blockers + 12 HIGH cleanup + Top 6 ideation + **90 decizii LOCKED cumulative** + Beta-launch ASAP timing flexible §36.83 + Suflet Andura + 8 ADR drafts ALL LOCKED V1 + ADR 023 partial spec + Phase B 51 strings + Cluster 10-batch foundation tests **1203/1203 PASS** unchanged + Andura V1 prod LIVE `andura.app` ✅ + §36.99-§36.107 Andura Offline Coaching Decision Tree Exhaustive Roadmap + 7 Engines Prescriptive NEW + Knowledge Cadence + D2 + D3 NEW opened.

---

## Q12: Next Actions Priority Order + Faza 3+4 Vault Hygiene + Auth Flow §36.80 preserved + DIFF_FLAGS P1-FLAG-NEW?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §39 + DIFF_FLAGS.md P1-FLAG-NEW.

**Răspuns verbatim:** **Priority 0 ABSOLUT:** Faza 3 + Faza 4 Vault Hygiene Sprint chat NEW dedicat — 8 recomandări A-H + ADR 022/024/025 stubs + DECISION_LOG UTF-8 + INDEX_MASTER refresh + HANDOVER_GLOBAL split + VAULT_HYGIENE_PASS rule codification (~2.5-3.5h CC autonomous total). **Priority 1 ABSOLUT preserved:** Auth Flow §36.80 BUG 2 Firebase 401 chat strategic + prompt CC Opus dedicat (~1-2h Daniel + ~30-45min CC autonomous factor 7-9x). **Priority 2 NEW:** ADR 026 + 7 Engines Prescriptive spec generation chat strategic dedicat NEW + D2 NEW Injury/Contraindication Mapping + D3 NEW Don't Like + Home + Calistenice + Sport-Oriented Mapping + D1 Save the week silent. **Priority 3 long-term:** ADR 022 + ADR 024 file creation Faza 3 stubs + Knowledge cadence first quarterly patch post-Beta + Beta Recruitment 50 testeri + audit legal + Soft Launch. **DIFF_FLAGS update:** **P1-FLAG-NEW** raised 2026-05-04 = Codespace `npm install` drift (3 test FILES fail import: db.test.js / tieredRead.test.js / tieringEngine.test.js — `fake-indexeddb/auto` + `dexie` packages declared în package.json dar NOT installed în Codespace). Pre-existing on origin/main pre-handover ingest, NOT regression. Defer fix dedicated chat post Vault Hygiene Faza 3+4 + Auth Flow §36.80. Vault-docs-only invariant pe §36.99-§36.107 ingest preserved (zero src/tests/scripts touched).

---

🦫 **Pass criteria ≥10/12 PASS (≥83%) → PROCEED chat strategic NEW. Cumulative 90 LOCKED. Vault Hygiene Sprint Priority 0 Faza 3+4 PENDING. Auth Flow §36.80 Priority 1 ABSOLUT preserved separat. ADR 026 candidate offline coaching tree pre-Beta blocker. 7 engines prescriptive NEW LOCKED roadmap. Knowledge cadence LOCKED V1. D2 NEW Injury/Contraindication + D3 NEW Don't Like + Home + Calistenice + Sport-Oriented OPENED FOR DISCUSSION. P1-FLAG-NEW Codespace npm install drift flagged (NOT regression).**

**Andura needs to be the best. ✊**
