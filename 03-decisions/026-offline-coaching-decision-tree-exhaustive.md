# ADR 026 — Andura Offline Coaching Decision Tree Exhaustive

**Status:** ✅ **LOCKED V1 — COMPILE DRAFT FULL** (compiled 2026-05-05 overnight from §42 base + §45 spec + §50 D-cluster sources, 129 decisions aggregate)
**Date:** 2026-05-04 spec sessions complete → compiled 2026-05-05 overnight (CC TASK 3 batch overnight)
**Cumulative LOCKED:** 129 decisions aggregate (10 base + 75 spec + 44 D-cluster). §47 Alignment Questions Rule cross-ref separate (vault meta-tooling, NU în 129 product/architecture count).
**See also:** [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §42 + §45 + §47 + §50 + §36.99-§36.107 | [[018-engine-extensibility-architecture]] | [[022-bayesian-nutrition-inference]] | [[023-llm-intent-interpretation]] | [[024-goal-driven-program-templates]] | [[025-andura-gandeste-pentru-user]] | [[../04-architecture/ANDURA_VALIDATION_FRAMEWORK_V1]] | [[../04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1]] | [[../04-architecture/FAZA_2_FILTER_STRATEGY_V1]]

---

## Status Summary

129 decisions LOCKED V1 ready production. Pre-Beta blocker per DIFF_FLAGS P1-FLAG-SCENARIOS-COVERAGE — **meta-architecture global concerns SSOT** (format ramură + cross-engine merge + testing strategy + storage + fallback + versioning), **NU monolith engine-specific**. Engine domain concerns canonical separate per ADR 018 / 022 / 024 / 027 / 028 / 029.

**Decision wording verbatim (per §36.99):**

> "Andura V1 Beta = offline pure coaching pe input structurat. Decision tree exhaustiv 1500-2000 ramuri pre-mapped de Claude (chat strategic) implementate de CC Opus în engine modules. Paritate target ≥95% cu Claude pe input structurat tipic Maria/Gigica/Marius (LOCKED V1 strict 2026-05-05 evening per ANDURA_VALIDATION_FRAMEWORK_V1 §1 — north star ≥95% NU range). ZERO LLM runtime pentru core coaching paths. ADR 023 LLM scope strict (Pain text + Equipment text) PRESERVED unchanged. Aplicabilitate: pre-Beta blocker per §36.57 Prebeta Scope Rule (coach intelligence core = mandatory prebeta non-negotiable)."

**Architectural context confirmed:** 22 engines total (14 reactive existing + **8 prescriptive NEW** per §36.100 META amendment 7→8). 1500-2000 ramuri = SUM agregată distribuită ACROSS engines. ADR 026 = META-architecture global concerns SSOT. Engine ADR-uri individuale (022/024/027/028/029) = domain-specific only.

---

## §1 SCOPE & PRINCIPLES — §42 base decisions 1-10 (10 LOCKED V1)

### §1.1 Decision 1 — Format ramură INTERN engine: B Standard (verbatim §42.1)

**Format:**
```
INPUT: {persona_signals: age, sex, kg, BF%, experience_years, goal, equipment, frequency, PRs}
CONDITION: structurat boolean tree
OUTPUT: {periodization_block, volume_landmarks, exercise_priority, intensity_zone, deload_trigger, tempo_cues}
RATIONALE: literature ref (ex: Israetel 2017 MEV/MAV/MRV) + Bugatti reasoning
CROSS_REF: ADR 023 fallback condition + ADR 018 engine module owner
```

**Rationale:** Trasabilitate audit-trail + alimentează WhyEngine + cod auto-documentat verificabil producție. Type-safe TS extensibil.

### §1.2 Decision 2 — Granularitate condiții: Hybrid B Medium baseline + C Fine selectiv (verbatim §42.2)

**Baseline B Medium:** age groups <30 / 30-45 / 45-60 / 60-70 / 70+. Sex × experience baseline rezonabil.

**Fine selectiv C pe interacțiuni critice:**
- Vârstă × Obiectiv (deload volume 65 ani slăbire vs 20 ani hipertrofie)
- Experiență × Intensitate (RIR 0 begin vs advanced)
- Sex × Volume Landmarks (femei upper body MEV/MAV/MRV pragul corect)

**Rationale push-back chat:** C Fine brute force = 7 decades × 2 sex × 3 exp × 5 goal = 210 baseline + BF + freq + equip + PRs = 30000-50000 ramuri × 21 engines = ship NEVER + hallucination risk femeie 75+ Forță advanced ZERO literature. Bugatti adevărat ≠ max everything. Peak craft *unde contează*, smart trade-offs unde NU. Total 1500-2000/engine sustained sănătos.

### §1.3 Decision 3 — Cross-engine merge META: B Extends Arbitrator existing via Dimension Registry ADR 018 (verbatim §42.3)

**Mecanism:** Engines prescriptive contribuie verdicte via Dimension Registry ADR 018 către voices temporale existing (Periodization → HISTORICAL + REALTIME + PROJECTION). Verdictele agregate intră Arbitrator 5-level Precedence + 27 reguli unchanged.

**ZERO change Arbitrator. ZERO voce nouă** (5 voices LOCKED, voice 6-th GOAL rejected §26.2 preserved).

**Slip clarification:** Termenul "voce virtuală" propus inițial chat = REJECTED (drift conceptual periculos vs 5-voice lock). Wording corect SSOT: "engines contribuie verdicte prin Dimension Registry, NU devin voci".

### §1.4 Decision 4 — Engine spec generation order: A Periodization prima (verbatim §42.4)

Periodization trasează limitele maxime volum + intensitate. Order roadmap: Periodization → Goal Adaptation → Bayesian Nutrition → Deload → Energy → Tempo → Specialization.

### §1.5 Decision 5 — ADR 026 scope: B Standardizator (verbatim §42.5)

**ADR 026 conține (Global Concerns SSOT):**
- Format ramură global
- Cross-engine merge protocol (Arbitrator extends via Dimension Registry)
- Testing strategy (4-invariant safety stack — vezi §42.9 / §4.3 below)
- Storage mechanisms
- Fallback telemetry circuit breaker
- Versioning deprecation window

**ADR-uri engine individuale (022 Bayesian / 024 Goal Adaptation / 027/028/029 Engines #5/#6/#7) conțin Domain Concerns** — formule specifice + logic CUT/BULK/MAINTAIN + biomecanice.

### §1.6 Decision 6 — Storage format ramuri: B Separate `engine-name.tree.ts` data file (verbatim §42.6)

Logic engine în `<engine-name>.engine.ts` + data ramuri în `<engine-name>.tree.ts` separat. Tests izolat ramuri direct + tree-shaking Vite + grep metadata <5ms + type-safe const exhaustiv. Data NOT decoupled în JSON/Firestore (over-engineering pre-Beta).

### §1.7 Decision 7 — Fallback ZERO match: Safe-baseline + CDL telemetry + 5% Circuit Breaker per segment (verbatim §42.7)

1. ZERO match input → engine returns safe-baseline coarse generic (NU refuză NU LLM escalate runtime — păstrăm offline ZERO LLM core paths preserved §36.99).
2. CDL log injectează `fallback_triggered: true` + persona signals snapshot (telemetry passive monitoring).
3. **Circuit Breaker 5% threshold per segment Maria/Gigica/Marius** — dacă rate fallback > 5% segment → trigger Hotfix Knowledge Sprint imediat NU așteaptă cycle quarterly.

### §1.8 Decision 8 — Versioning quarterly updates: Additive + 18 luni deprecation window V_N-2 (verbatim §42.8)

- Update Q2 2026 → V2 ramuri additive (V1 useri existing rămân unchanged mid-program)
- 18 luni deprecation window V_N-2 → după 18 luni V1 sunset, useri migrate automat la V_latest în calibration window §36.35
- Maintenance ceiling: max 3 versions concurrent

### §1.9 Decision 9 — Testing strategy: Hibrid Property-based + Persona Suite + 4-Invariant Safety Stack (verbatim §42.9)

- **Property-based** (random persona × verify output sane via invariants — breadth coverage)
- **Persona simulation suite** (Maria/Gigica/Marius scenarios fixe + edge cases curated, ~50-100 tests representative — depth coverage)
- **4 invariante imutabile mandatory pass:**
  1. Volum: V ≤ MRV per muscle group
  2. Intensitate: RIR ≥ 0 (never below failure)
  3. Frecvență: ≤ 6 sessions/week per muscle group
  4. Deload: mandatory după 4-6 weeks mesocycle

**Extension §50.3.10:** 5th invariant "Medical Safety" (Floor Absolut) — NU contraindicated exercise indiferent volumul optim (V≤MRV). Vezi §3.2.10.

### §1.10 Decision 10 — Engine activation order runtime: Sequential + Constraint Object Floor/Ceiling Range ±15% (verbatim §42.10)

**Pipeline runtime per session build:**
1. **Periodization** generează **coridor (Floor + Ceiling)** baseline (ex: 12-16 seturi pectorali săpt). NU ceiling-only.
2. **Goal Adaptation** redistribuie volume în interiorul coridorului. NU trece peste Ceiling NU sub Floor.
3. **Energy Adjustment** fluctuează ±15% baseline coridorului. **Bidirectional NU only-decrease**. Zile peak readiness sleep 9h + stress low + RIR bank → UP +15% accelerator. Zile fatigue → DOWN -15%.

**Constraint Object immutable** propagat engine la engine (TypeScript readonly type-safe).

---

## §2 SPEC SESSION DECISIONS Q1-Q40 + REFINEMENTS — §45 spec (75 LOCKED V1)

### §2.1 Q1-Q10 batch 1 (verbatim §45.2)

1. **Q1 Schema TypeScript DecisionTreeBranch — A Strict typed exhaustiv** ✅ LOCKED
2. **Q2 WhyEngine integration depth — C Hybrid tech rationale + user_friendly auto-gen spec time** ✅ LOCKED
3. **Q3 Cross-Engine conflict resolution — C Safety > pipeline order** ✅ LOCKED + Safety tier composition (4 invariants §42.9 + ADR 023 contraindication overrides; verdict rescris instantaneu Safe-baseline)
4. **Q4 Versioning lock mechanism — C Hybrid program-level lock + per-engine override selective** ✅ LOCKED
5. **Q5 Testing DoD — B Bugatti standard 4 invariants + 100 persona + 1000 property-based** ✅ LOCKED
6. **Q6 Documentation format — C Hybrid JSDoc inline ramuri + markdown narrative engine-level** ✅ LOCKED
7. **Q7 Periodization scope — B Block + Linear pre-Beta** ✅ LOCKED + Linear allocation rule (Marius 25 Beginner 0-10 sesiuni OR goal "Forță Pură" explicit; Maria/Gigica = Block always)
8. **Q8 Persona spec generation order — A Bottom-up Maria → Gigica → Marius** ✅ LOCKED
9. **Q9 Volume Landmarks SoT — A Israetel constants V1 ship scope** ✅ LOCKED + Marius mitigation UI v1.5 roadmap notification
10. **Q10 Mesocycle length + deload trigger — C 4 weeks default + adaptive override condition-based** ✅ LOCKED

### §2.2 Q11-Q20 batch 2 + 4 refinements (verbatim §45.3)

11. **Q11 Telemetry CDL fallback retention — B 90 zile rolling window + daily Circuit Breaker check** ✅ LOCKED
12. **Q12 Engine activation criteria runtime — B Conditional per persona × goal × session context (Specialization only conditional V1)** ✅ LOCKED + AND condition explicit (Marius 25 Advanced AND lagging body part detected via patternLearning)
13. **Q13 Engine module folder structure — B Per-domain `src/engines/<name>/{engine,tree,types,tests}.ts`** ✅ LOCKED
14. **Q14 Branch ID naming convention — B Semantic hierarchical** ✅ LOCKED + BranchId TS Template Literal Type validation + pre-commit hook script Node.js + CI scan all `.tree.ts` files for ID uniqueness across ecosystem (block commit on duplicate)
15. **Q15 Deprecation user notification flow — B Notification preview T-30 SUFLET F1 + opt-in moment migrate calibration window §36.35** ✅ LOCKED
16. **Q16 Exercise selection scope — B Periodization abstract priority + alternativeEngine resolves concrete** ✅ LOCKED + JSON output format spec time `{ primary_movement_pattern, accessory_priority, compound_first, intensity_zone_target, tempo_cues }`
17. **Q17 Frequency distribution split — B Adaptive per persona × goal × frequency × equipment** ✅ LOCKED
18. **Q18 Progressive overload mechanism — B Double progression** ✅ LOCKED
19. **Q19 Muscle group taxonomy — B Standard Israetel ~11-12 groups** ✅ LOCKED + Maria 65 Dual-Layer mapping (Israetel groups → 6 functional movement patterns: push/pull/hinge/squat/carry/rotate)
20. **Q20 Failure handling skipped session — B Resume + intensity hold** ✅ LOCKED + threshold rule (3/4 sessions = counts week with progression skip; ≤2/4 = repeat week N integral) + week 1 strict 4/4 cold-start

### §2.3 Q21-Q30 batch 3 + 6 refinements (verbatim §45.4)

21. **Q21 Mesocycle phase structure ratio — B Adaptive per persona × experience** ✅ LOCKED + Marius 5:1 dual-signal extension criteria (RIR stable 1-2 maintained 4 weeks AND Energy 🟢/🟡 dominant NU 🔴 last 3 sessions §36.82)
22. **Q22 Beginner → Intermediate transition — B Performance-based per-lift 3-consecutive** ✅ LOCKED + Linear progression failure exact definition (rep stagnation in target range OR RIR 0 hit 3 sessions consecutive same weight)
23. **Q23 Equipment substitution philosophy — B Graceful via alternativeEngine** ✅ LOCKED + edge case flag (heavy compounds bodyweight no equivalent)
24. **Q24 Special populations pre-Beta scope — B Defer to D2 chat strategic NEW** ✅ LOCKED + Safe Baseline pre-Beta concrete definition (RIR ≥ 1 universal; Maria/Gigica RIR ≥ 2 default; zero 1RM compound max-effort; Marius 25 Advanced 85% 1RM theoretic intensity cap)
25. **Q25 Plateau detection per persona — B Per-persona threshold** ✅ LOCKED + Plateau vs Regression distinction Maria 65 (plateau = goal-aligned NU triggered; regression = >15% drop baseline 2+ sesiuni consecutive triggers plateauInterventions adapted + medical flag)
26. **Q26 Off-cycle return handling — B Detraining-aware per duration** ✅ LOCKED (2-3w: 80%vol/90%int week 1; 4-6w: 60%vol/80%int week 1; 6+w: fresh mesociclu) + literature verification spec time Mujika et al / Bosquet et al
27. **Q27 Goal change mid-mesociclu — A Force complete current** ✅ LOCKED + 50% threshold rule (week 1-2 <50% complete = cancel current + apply new goal immediate; week 3-4 ≥50% = finish current + apply next mesociclu)
28. **Q28 Coaching tone Periodization output — B Inline rationale brief Q2 user_friendly reuse** ✅ LOCKED
29. **Q29 Engine performance budget runtime — B <100ms per engine + <500ms total pipeline (Google RAIL guidelines)** ✅ LOCKED + CI test enforce regression detection
30. **Q30 Spec generation chat split — B Per dimension cross-persona** ✅ LOCKED

### §2.4 Q31-Q40 batch 4 + 2 refinements (verbatim §45.5)

31. **Q31 Warm-up protocol scope — B Separate Warm-up Engine + Periodization working sets only** ✅ LOCKED → enables Engine #8 NEW (vezi §2.6)
32. **Q32 Rest periods prescription — B Per persona × intensity zone × goal** ✅ LOCKED (Maria 60-90s universal; Gigica hypertrophy 1-3 min by exercise; Marius strength 3-5 min compound heavy)
33. **Q33 Tempo prescription standards — B Persona-aware (Maria verbal cues; Gigica hybrid; Marius numeric 3-0-X)** ✅ LOCKED
34. **Q34 Exercise variation cycling — C Per-persona adaptive** ✅ LOCKED + Gigica hybrid rule explicit (1-2 exercises swap × every 2 mesocycles)
35. **Q35 Session duration constraints — B Engine adapts to user time available** ✅ LOCKED (15/30/45/60/90 min input T2+ profile typing; engine prioritizes top-down compound → priority isolation → optional accessories)
36. **Q36 Multi-goal users handling — A Single primary goal V1 pre-Beta** ✅ LOCKED + UI roadmap notification onboarding ("Optimizarea pentru obiective multiple ex Cardio + Hipertrofie simultan disponibilă din v1.5")
37. **Q37 Asymmetry handling — B Defer post-Beta v1.5** ✅ LOCKED
38. **Q38 Periodization-Cut overlap — B Phase-agnostic Periodization + Goal Adaptation redistribuie within Floor/Ceiling §42.10** ✅ LOCKED
39. **Q39 Exercise order within session — B Per persona × goal** ✅ LOCKED (Maria functional/mobility first; Gigica/Marius compound first)
40. **Q40 RIR vs full data tracking input — C Tier-based RIR universal verbal + actual reps/weight tracked silent UI + bar speed opt-in Marius** ✅ LOCKED

### §2.5 17 Refinements (LOCKED V1 inline cu Q-uri above per §45.2-§45.5)

Refinements sunt sub-decisions explicit appended decizia parent. Numărate explicit aici pentru transparență audit:

- Q3 Safety tier composition (4 invariants + ADR 023)
- Q7 Linear allocation rule (Marius Beginner 0-10 sesiuni / Forță Pură explicit)
- Q9 Marius mitigation UI v1.5
- Q12 AND condition explicit (Advanced AND lagging)
- Q14 BranchId TS Template Literal Type + pre-commit hook + CI scan
- Q15 SUFLET F1 notification preview T-30
- Q16 JSON output format spec time
- Q19 Maria 65 Dual-Layer mapping 6 functional movement patterns
- Q20 threshold rule 3/4 + week 1 strict 4/4
- Q21 Marius 5:1 dual-signal extension criteria
- Q22 Linear progression failure exact definition
- Q23 edge case flag heavy compounds bodyweight
- Q24 Safe Baseline concrete definition (RIR + 1RM cap)
- Q25 Plateau vs Regression distinction Maria 65
- Q26 literature verification (Mujika et al / Bosquet et al)
- Q27 50% threshold rule
- Q34 Gigica hybrid rule explicit (1-2 swap × 2 mesocycles)

**Total 17 refinements** documented inline above.

### §2.6 Engine #8 Warm-up & Mobility LOCKED V1 NEW (verbatim §45.6)

**META §36.100 AMENDMENT: 7 → 8 prescriptive engines** (22 engines total).

1. **Scope strict pre-Beta** — activare neuromusculară universal + mobility general ONLY (NU corrective therapy)
2. **Pipeline placement §42.10 sequential extension:**
   ```
   Periodization → Goal Adaptation → Energy → Exercise Selection → Warm-up & Mobility → Execution
   ```
3. **Persona thresholds pre-Beta:**
   - Maria 65: rutină blândă activare articulară 5-10 min (mobility flow + bands light)
   - Gigica 35: warm-up general dynamic 5 min + 1 set ușor ramp pe primul exercițiu
   - Marius 25: ramp protocol heavy compounds (50%/70%/90% × 3-5 sets) + general warm-up minimal
4. **Pre-Beta MANDATORY** (Bugatti injury safety > scope discipline; ~50-80 ramuri V1 universal patterns)
5. **Instant Skip principle** (§36.94 ADR 025 reuse): default T0 skip → engine auto-calculates ramp-up sets integrated; T1+ Profile Typing opt-in expanded; in-session toggle "skip warm-up"

### §2.7 Cooldown Q-final: C Defer post-Beta v1.5 (verbatim §45.6 final)

Skip pre-Beta entirely, user self-managed. UI footer optional "Cooldown routines coming v1.5". Engine #8 = strict Warm-up & Mobility pre-Beta.

### §2.8 Light Flags LOCKED V1 (verbatim §45.7)

- **Maria 65 deload protocol differential** — week deload = volume 50% reduction, intensity preserved, NU complete rest (literature: Galvão 2010 + Fragala 2019 elderly resistance training recovery)
- **Q16 JSON output format spec time** — `{ primary_movement_pattern, accessory_priority, compound_first, intensity_zone_target, tempo_cues, rest_period_seconds }` (extension Q32 + Q33 LOCKED)

---

## §3 D-CLUSTER DECISIONS — §50 D1+D2+D3.1+D4 (44 LOCKED V1)

### §3.1 D3.1 Buton "Nu vreau" (13 sub-decisions, verbatim §50.1)

**Parent:** §36.107 D3.1 LOCKED PRE-BETA mandatory. **D3.1.1** = 3 butoane up-front + 3 categorii semantic Maria 65 frictionless: "Nu vreau" (Contextual / no-memory) + "Nu am chef" (Psihologic / no-memory) + "Nu pot" (Mecanic-Fizic / blacklist permanent cross-session).

1. **Q1 Storage layer "Nu pot" blacklist — B Firestore sync** ✅ LOCKED
2. **Q2 Schema JSON shape — B Object `{ exerciseId: { timestamp, intent } }`** ✅ LOCKED
3. **Q3 Sync multi-device "Nu pot" — B Eventual consistency on session start** ✅ LOCKED
4. **Q4 Substitute primary match criteria — B Same muscle + movement pattern** ✅ LOCKED
5. **Q5 Re-roll după 2 refuzuri consecutive — B 3 fresh batch + Hard Cap** ✅ LOCKED + Hard Cap 7 încercări total + fallback Q7 A skip
6. **Q6 Substitute persistence intra-mesociclu — B Lock primary substitute pe durata mesociclului + Sub-decision Unlock** ✅ LOCKED
7. **Q7 Edge case ZERO substitute viable — A Skip exercise + log telemetry** ✅ LOCKED
8. **Q8 "Nu vreau"/"Nu am chef" reset window — A Imediat next session (zero memory)** ✅ LOCKED
9. **Q9 "Nu pot" Settings UI shape — A Listă simplă + unblock button per item** ✅ LOCKED
10. **Q10 Telemetry CDL track refuzuri — B Aggregate count per exerciseId silent** ✅ LOCKED
11. **D3.1.6 Pattern Detection Passive (Prevenirea Iritării)** ✅ LOCKED V1 — sistem monitorizează în fundal user refuzuri consecutive 3-5 ori "Nu vreau"/"Nu am chef" → soft prompt discret "Observăm că eviți acest exercițiu. Vrei să-l excluzi permanent?". NU auto-blacklist (paternalism). Bugatti F4 cognitive friction anticipată.
12. **Q5 Hard Cap refinement** — maximum 2 re-rolls = 7 încercări total
13. **Q6 Sub-decision Unlock refinement** — week 2 "Nu vreau"/"Nu pot" pe substitute lock-uit → unlock + new resolver round; volume tracking continuă la nivel grup muscular, NU restart mesociclu integral

### §3.2 D2 Injury/Contraindication Mapping (13 sub-decisions, verbatim §50.3)

**Topic critic:** MOAT real Andura, intersect Safety tier §42.9 + ADR 023.

1. **Q1 Scope intake injuries onboarding — B Preset list (~15-20 condiții comune)** ✅ LOCKED
2. **Q2 Severity grading per condition — B 3-tier (ușor/moderat/sever)** ✅ LOCKED
   - Sever → Blacklist permanent pe tiparul mișcare afectat
   - Moderat → Plafonare automată intensitate (RIR ≥ 2, max 75% 1RM)
   - Ușor → Monitorizare pasivă fără modificări agresive volum
3. **Q3 Contraindication source authority — C Curated subset + literature ref per condition** ✅ LOCKED
4. **D2.3.1 Sursa V1 — C Public guidelines NSCA + ACSM + Daniel curate subset** ✅ LOCKED V1
5. **D2.3.2 Update cadence — Quarterly unified Knowledge Sprint** ✅ LOCKED V1
6. **D2.3.3 Disclaimer UI legal cover — Mandatory consent onboarding + per-condition disclaimer** ✅ LOCKED V1
7. **Q4 Pain mid-session real-time handling — A New D2 button "Mă doare" (separat de D3.1 "Nu pot")** ✅ LOCKED — semantic distinct: "Nu pot" mecanic anticipat blacklist permanent; "Mă doare" acut mid-set STOP + log severity + alt + flag follow-up
8. **Q5 "Mă doare" severity input — B 3-tier (ușor/moderat/sever) cu auto-action** ✅ LOCKED
   - Ușor → continue cu RIR+1 cap
   - Moderat → skip exercise + alt
   - Sever → STOP session + flag medical mention "consultă specialist"
9. **Q6 Cross-session memory "Mă doare" — C Permanent blacklist după 2-3 incidente** ✅ LOCKED (stricter threshold safety-critical vs D3.1.6 3-5x)
10. **Q7 Contraindication override Safety tier composition Q3 — C Tier separat 5th invariant "Medical Safety" (Floor Absolut)** ✅ LOCKED — V≤MRV doesn't matter dacă exercise = hernie disc kill; Medical Safety = absolute floor
11. **Q8 Pregnancy handling pre-Beta — A Defer post-Beta v1.5** ✅ LOCKED
12. **Q9 Recovery from injury re-introduction — C Hybrid manual primary + soft prompt 4-6 săpt** ✅ LOCKED
13. **Q10 Telemetry CDL injuries pattern — A NU track (privacy strict medical pre-Beta)** ✅ LOCKED — GDPR sensitive medical data pre-Beta = legal nightmare

### §3.3 D4 Mid-Session Resume Protocol (11 sub-decisions, verbatim §50.2)

**Parent:** NEW topic 2026-05-02. Cross-ref: §36.55.4 abandoned session neutral streak.

1. **Q1 Auto-save granularity (D4.1) — A Per set logged silent IndexedDB** ✅ LOCKED
2. **Q2 Storage layer auto-save — A IndexedDB** ✅ LOCKED
3. **Q3 Sync Firestore timing — B On session complete** ✅ LOCKED
4. **Q4 Resume prompt UX (D4.2) — A Dialog blocking imediat la app open** ✅ LOCKED
5. **Q5 Resume prompt actions — A 3 opțiuni (Reia / Începe nouă / Marchează completă)** ✅ LOCKED
6. **D4.2.1 Filtrarea Dialogului Blocant pe Threshold** ✅ LOCKED V1 — t=6h: Δt ≤ 6h Sesiune Recuperabilă (dialog blocking); Δt > 6h Sesiune Abandonată (silent cleanup + neutral streak §36.55.4, zero prompt UI)
7. **Q6 Timeout abandon threshold (D4.3) — B 6h** ✅ LOCKED
8. **Q7 Engine treatment partial session §42.10 (D4.4) — B Credit parțial proporțional (reuse §45.3)** ✅ LOCKED — efort per exercițiu ≥50% seturi → contorizat; efort per sesiune ≥3/4 → săpt completă cu skip progresie
9. **Q8 Impact partial session deload trigger Q10 mesocycle — C Count cu intensity hold next** ✅ LOCKED
10. **Q9 Scenarii A/B/C handler (D4.5) — B Unified state machine 3 entry points** ✅ LOCKED — Background restore / IndexedDB recovery / localStorage offline persistence
11. **Q10 Crash mid-set recovery edge — A Last completed set saved + current incomplete discarded** ✅ LOCKED

### §3.4 D1 Save the Week Silent (7 sub-decisions, verbatim §50.4)

**Parent:** §36.107 D1 → LOCKED V1 acum. Pattern §36.55.4 + §45.3 Q20 reuse.

1. **Q1 Trigger condition — C Silent default** ✅ LOCKED
2. **Q2 Threshold sessions completed required — A 3/4 sesiuni planificate** ✅ LOCKED (reuse Q20 §45.3)
3. **Q3 Streak treatment week saved — C Counts cu progression skip** ✅ LOCKED (reuse Q20 "Resume + intensity hold")
4. **Q4 UI feedback la save silent — B Subtle micro-copy în istoric** ✅ LOCKED — text "Săptămână salvată (3/4 sesiuni)" discret istoric only
5. **Q5 Edge case 4/4 weeks consecutive cu 3/4 sesiuni — B Maximum 2 saved weeks consecutive** ✅ LOCKED — 3-rd consecutive ≤3/4 → repetare integrală săptămâna N
6. **Q6 Goal change interaction Q27 50% threshold rule — B Save week aplicat prima, goal change next mesocycle** ✅ LOCKED
7. **Q7 Telemetry CDL save week pattern — C Track + Circuit Breaker reuse §42.7** ✅ LOCKED

**Naming distinction LOCKED V1:**
- **Circuit Breaker population fallback 5%** (§42.7) — rate fallback cross-population trigger Knowledge Sprint hotfix
- **User adaptation signal 50%** (D1 Q7 individual) — user save weeks rate >50% trigger T1+ Profile Typing adaptation v1.5

---

## §4 GLOBAL CONCERNS SSOT

### §4.1 Format ramură global

Per §1.1 above. Standard B `{INPUT, CONDITION, OUTPUT, RATIONALE, CROSS_REF}` schema universal.

### §4.2 Cross-engine merge protocol

Per §1.3 above. B Extends Arbitrator existing via Dimension Registry ADR 018. ZERO change Arbitrator. ZERO voce nouă.

### §4.3 Testing strategy

Per §1.9 + §3.2.10 above. **5 invariants total** post §50.3.10 extension:
1. Volum: V ≤ MRV per muscle group
2. Intensitate: RIR ≥ 0
3. Frecvență: ≤ 6 sessions/week
4. Deload: mandatory după 4-6 weeks
5. Medical Safety: NU contraindicated exercise (Floor Absolut)

### §4.4 Storage mechanisms

Per §1.6 + ADR 020 (Tier 1 Dexie.js IndexedDB). Logic engine în `<engine>.engine.ts` + data ramuri `<engine>.tree.ts`. Tier 0 (localStorage <30 zile) + Tier 1 (Dexie >30 zile) + future Tier 2 (Firestore archive post-Beta).

### §4.5 Fallback telemetry circuit breaker

Per §1.7 + §3.4.Q7 above. Safe-baseline + CDL log `fallback_triggered: true` + Circuit Breaker 5% threshold per segment trigger Hotfix Knowledge Sprint.

### §4.6 Versioning + deprecation window

Per §1.8 above. Additive + 18 luni deprecation window V_N-2. Max 3 versions concurrent. **PENDING explicit:** rollback strategy quarterly hotfix (Q4 Versioning lock § 2.1 covers program-level lock + per-engine override; explicit rollback specs deferred chat strategic NEW dacă needed pre-Beta launch).

---

## §5 PIPELINE ORDER LOCKED V1 (§42.10 + §45.6 extension)

```
Periodization (Engine #1)
  ↓
Goal Adaptation (Engine #2)
  ↓
Energy Adjustment (Engine #5)
  ↓
Exercise Selection (alternativeEngine + weaknessDetector existing)
  ↓
Warm-up & Mobility (Engine #8)
  ↓
Execution (sets/reps/RIR matrix)
  ├─ Tempo overlay (Engine #6)
  └─ Specialization layer (Engine #7)
  ↓
Deload trigger evaluation (Engine #4) — last gate
  ↓
Final Session Blueprint
```

Each engine consumes ConstraintObject + previous engines outputs (read-only). NU mutation upstream. ±15% Energy Adjustment range bidirectional preserved per §1.10.

---

## §6 ALIGNMENT QUESTIONS GENERATION RULE — cross-ref §47

**Vault meta-tooling rule** (NU în 129 product/architecture cumulative count). Per §47 LOCKED V1 + AMENDMENT 2026-05-04 evening late: search-driven format mandatory STRICT post-deep-handover-only, DEPRECATED pre-fed verbatim format. Cross-refs: VAULT_RULES.md §HANDOVER_PROTOCOL step 9 + PROMPT_CC_HYGIENE.md §9 + memory rule #22.

**SCOPE EXCLUSION fast handover §CC.5 (AMENDMENT 2026-05-04 evening late):** §47 NU se aplică la fast handover ~5-10 min — fast scope folosește §CC.2 layered read + §CC.7 drift detection + §CC.4 citation enforcement.

---

## §7 CROSS-REFS

- [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.99 ADR 026 candidate decision + §36.100 8 Engines roadmap (META 7→8) + §36.101 5 voices CONFIRMED + §36.102 Goal lifecycle first-class + §36.103 Knowledge cadence + §36.105 Pivot reconfirmed + §42 base 1-10 + §45 spec 75 + §47 Alignment Questions Rule + §50 D-cluster 44 + §51 cumulative count
- [[018-engine-extensibility-architecture]] (Dimension Registry plug-in foundation — engines speak through voices)
- [[022-bayesian-nutrition-inference]] (Engine #3 SPEC READY V1 cross-engine integration)
- [[023-llm-intent-interpretation]] (LLM scope strict preserved — NU contradicție)
- [[024-goal-driven-program-templates]] (Engine #2 STUB cross-engine integration)
- [[025-andura-gandeste-pentru-user]] (graceful degradation per branch + Instant Skip principle reuse Engine #8)
- [[027-engine-deload]] (Engine #5 Deload — STUB created post 2026-05-05 overnight)
- [[028-engine-tempo-form-cues]] (Engine #6 Tempo/Form Cues — STUB created post 2026-05-05 overnight)
- [[029-engine-specialization]] (Engine #7 Specialization — STUB created post 2026-05-05 overnight)
- [[../04-architecture/ANDURA_VALIDATION_FRAMEWORK_V1]] (Validation Framework LOCKED V1 — north star ≥95% strict reflected în decision wording above)
- [[../04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1]] (simulator pipeline content production engine)
- [[../04-architecture/FAZA_2_FILTER_STRATEGY_V1]] (Faza 2 filter workflow Bugatti 3-instance)
- [[../01-vision/SUFLET_ANDURA|SUFLET ANDURA]] §1.1 (~75% replicabil V1 engine deterministic)
- [[../04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1|COGNITIVE_ARCHITECTURE_SPEC]] Q4 ZERO LLM runtime original intent honored core paths

---

## §8 NEXT (post compile draft full V1)

- Periodization Engine spec generation per dimension cross-persona (Q30 LOCKED) — chat 1 Volume Landmarks all 3 persona, chat 2 Frequency Distribution all 3, chat 3 Progressive Overload all 3, chat 4 Mesocycle Structure all 3 (~3-4 chat-uri estimative)
- ADR 022 Bayesian Nutrition Engine #3 — SPEC READY V1, implementation chat strategic dedicated
- ADR 024 Goal Adaptation Engine #2 — STUB → full spec session (Engine #2 spec gap workaround §SCENARIOS_SIMULATOR_DESIGN_V1 §9 in interim)
- ADR 027/028/029 Engines #5/#6/#7 — STUB created 2026-05-05 overnight, full spec consolidation chat strategic NEW dedicat
- Engine #8 Warm-up & Mobility ADR canonical — pre-Beta MANDATORY, ~50-80 ramuri V1 (~1-2 chat-uri spec generation post-Periodization)
- D3.2-D3.4 sub-decisions — chat strategic NEW dedicated (Don't Like + Home + Calistenice + Sport-Oriented)
- Knowledge cadence first quarterly patch post-Beta + Beta Recruitment 50 testeri + Audit legal complete (§46 P4 prerequisite D2 telemetry post-Beta v1.5)

---

🦫 **Compile draft full V1 generated 2026-05-05 overnight per CC TASK 3 batch overnight. ZERO net new substantive decisions — aggregation only from §42 base + §45 spec + §50 D-cluster sources verbatim. 129 decisions LOCKED V1 ready production. PRE-BETA BLOCKER per §36.57. Cumulative ~653 LOCKED V1 preserved (compile = file status flip STUB → LOCKED V1, NU adds count).**

---

## §9 ENGINE-LEVEL SPECS — Module-Level Compile (post §1-§8 META-architecture)

**Section provenance:** §1-§8 above = META-architecture global concerns SSOT (format ramură + cross-engine merge + testing strategy + storage + fallback + versioning + pipeline order + alignment rule). §9 NEW = engine-level module specs compiled din chat strategic 2026-05-04 evening late sources. ZERO net new decisions per engine spec — compile aggregation verbatim. Numbering note: §3 above already used (D-Cluster Decisions); §9 NEW preserves existing §1-§8 cross-refs intact.

---

### §9.1 Engine #1 Periodization Module-Level Spec V1

**Status:** 🟢 **SPEC READY V1** (compiled 2026-05-06 morning chat-3 acasă din chat strategic 2026-05-04 evening late sources). ~32 decisions cumulative (Cluster 1-5). Pre Faza 2.5 implementation per Option A LOCKED 2026-05-06 morning chat-2 ("vizor fără ușă" vindicat literal — 0/8 engines implementate în src/, sequence reframe specs LOCKED → implementation → wiring).

**Provenance chain:**
- Source 1 (verbatim Cluster 1-5): `📤_outbox/_archive/2026-05/142_HANDOVER_2026-05-04_evening_late_periodization_goal_adaptation_CONSUMED.md` lines 33-39
- Source 2 (cristalizate identical): `00-index/CURRENT_STATE.md` §JUST_DECIDED entry "2026-05-04 evening late" lines 579-584
- Source 3 (cross-ref decisions specifice): `06-sessions-log/HANDOVER_ENGINES_SPEC_2026-04-30_evening.md` §45.2 Q7 (Periodization scope B Block + Linear pre-Beta) + §45.3 Q19 (Maria 65 Dual-Layer functional → Israetel mapping) + §45.4 Q21 (Marius 5:1 dual-signal §36.82) + §45.4 Q28 (Coaching tone Periodization output B Inline rationale brief) + §45.5 Q31 (Warm-up scope separate Engine #8) + §45.5 Q38 (Periodization-Cut overlap B Phase-agnostic + Goal Adaptation redistribuie within Floor/Ceiling §42.10) + §65.5 Periodization mesocycle length 4 săpt clasic
- Source 4 (architectural foundation cross-ref doar, NU duplicate): §1.10 Pipeline Order Constraint Object Floor/Ceiling Range ±15% + §2 Q1-Q40 META decisions verbatim per §1-§2 above + [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract `analyze(input) → DimensionResult`

**Cross-refs:** [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract (purity preserved engine = pure function NU side effects) | [[030-adapter-design-pattern|ADR 030]] D1-D5 LOCKED V1 foundation Hexagonal (Phase 1-2 orchestrator foundation `src/coach/orchestrator/` LANDED commit `5a16550` reusable post Faza 2.5) | [[024-goal-driven-program-templates|ADR 024]] Engine #2 Goal Adaptation cross-engine Hook 1 destination | [[027-engine-energy-adjustment|ADR 027]] Engine #5 Energy Adjustment Hook 3 destination | [[028-engine-tempo-form-cues|ADR 028]] Engine #6 Tempo Hook 4 destination | [[029-engine-specialization|ADR 029]] Engine #7 Specialization Hook 4 destination | §1.10 Pipeline Order LOCKED V1 above (Periodization first în pipeline §42.10) | §2.1 Q7 + §2.3 Q19 + §2.4 Q21 + §2.4 Q28 + §2.5 Q31 + §2.5 Q38

---

### §9.2 Cluster 1 — I/O Contract (~5 decisions)

**Pure function signature** per ADR 018 §2 Standardized Dimension Contract:

```
periodizationEngine.evaluate(ctx) → PeriodizationResult extends DimensionResult
```

**Output blueprint emit 5 fields:**
1. `mesocycle_phase` — current phase {LOAD | LOAD+ | PEAK | DELOAD} per Cluster 2 transitions
2. `volume_target_pct` — % MEV/MAV/MRV per muscle group (computed Cluster 3 Volume Landmarks)
3. `intensity_target_pct` — % 1RM range per goal modifier (Cluster 3 goal modifiers)
4. `macrocycle_block` — current block position (M1/M2/M3 within 3-mesocycle Linear Block per Cluster 4)
5. `deload_window` — `null | { trigger: 'EARLY_SAFETY' | 'EXTENSION_MARIUS' | 'CALENDAR', days: int }` per Cluster 2 trigger hierarchy

**Constraint:** ZERO side effects (engine pure per ADR 018 §2). Side effects (CDL writes ADR 011, telemetry, Firestore Tier 2 sync) = orchestrator layer separate per ADR 030 D2 thin adapter scope LOCKED V1.

---

### §9.3 Cluster 2 — Mesocycle Phase Transitions (~8 decisions)

**2.1 Double progression rep-first → weight-progression aplicat săptămânal** (per §45.3 Q18 LOCKED):
- Week 1: LOAD baseline (volume 1.00× / intensity 1.00× / RIR target normal)
- Week 2: LOAD+ accumulate (volume 1.00× / intensity 1.00× / RIR target ↓ 1 step)
- Week 3: PEAK push (volume 1.00× / intensity 1.00× / RIR target ↓ 2 steps)
- Week 4: DELOAD reset — volume **−45%** / intensity **−12.5%** (per §65.5 4 săpt clasic Option A LOCKED)

**2.2 Trigger hierarchy** (3-level priority order, EARLY DELOAD overrides EXTENSION overrides CALENDAR):
1. **EARLY DELOAD safety override** — Invariant 5 Medical Safety + composite trigger downstream Engine #4 Deload Protocol signal
2. **EXTENSION (Marius only)** — extends mesocycle past Week 4 fără DELOAD dacă dual-signal recovery green (Marius 5:1 ratio per §45.4 Q21 §36.82)
3. **CALENDAR default** — 4-week mesocycle clasic Option A (Maria + Gigica always; Marius dacă dual-signal NU green)

**2.3 Marius 5:1 dual-signal codificare pure function** (per §45.4 Q21 §36.82):
- Signal 1: **RIR stable 1-2 ALL 4 weeks** (zero RIR drift week-over-week across full mesocycle)
- Signal 2: **Energy ZERO red last 3 sessions** (no recovery red flag în trailing 3-session window)
- Both signals required — boolean AND, NU OR

**Anti-abuse safeguards:**
- **Max 2 consecutive extensions** — prevent indefinite extension exploitation
- **Injury history block** per Invariant 5 Medical Safety — extensions blocked dacă recent injury în CDL trail (cross-ref Cluster 5 anti-cascade safeguards)

---

### §9.4 Cluster 3 — Volume Landmarks Israetel × Persona × Goal Modifiers (~7 decisions)

**Israetel 11 grupuri musculare baseline MEV/MAV/MRV** (chest, back, quads, hamstrings, glutes, shoulders, biceps, triceps, calves, abs, forearms — ref Israetel 2017 Renaissance Periodization).

**Persona modifiers** (volume scalar applied to Israetel baseline):
- **Maria (65)** — 0.50× baseline (recovery capacity reduced post-menopausal physiology)
- **Gigica (35)** — 0.70× baseline (intermediate recovery capacity working professional)
- **Marius (25)** — 1.00× baseline (full Israetel target advanced trainee young recovery)
- **Bonus +10-15%** dacă recovery green (Vitality Layer signal aggregate ADR 016) — applied multiplicatively post-persona modifier

**Goal modifiers** (volume scalar applied to persona-adjusted baseline, multiplicative):
- **Hipertrofie** — 1.00× (Israetel canonical hypertrophy MEV-MAV target)
- **Forță** — 0.70× (lower volume / higher intensity per Forță template ADR 024 §1.2)
- **Recompoziție** — 0.85× (intermediate volume CUT-aware)
- **Longevitate** — 0.60× (sustainable load mobility emphasis ADR 024 §1.2)
- **Sănătate Generală** — 0.50× (lifestyle integration controlled intensity ADR 024 §1.2)

**Maria 65 Dual-Layer functional → Israetel mapping** (per §45.3 Q19 LOCKED): functional movement patterns mapped to Israetel muscle groups via 6 movement patterns: push / pull / squat / hinge / carry / rotate. Engine resolves Maria template request "functional dual-layer" → Israetel underlying volume landmarks via mapping table.

---

### §9.5 Cluster 4 — Macrocycle Structure Linear Block V1 (~6 decisions)

**Macrocycle decision:** **Linear Block Periodization V1** — NU DUP (Daily Undulating Periodization), NU Conjugate Method. Bugatti craft simplification pre-Beta (Q7 LOCKED §45.2 Block + Linear pre-Beta scope discipline).

**Block structure:** **3 mesocycles/block** (per §65.5 4 săpt mesocycle × 3 = 12 săpt block default).

**Block length variants per goal:**
- **12 săpt BUILD-only** (default majoritar templates: Hipertrofie / Tonifiere / Slăbire / Longevitate / Sănătate)
- **21 săpt BUILD + PEAK + TRANSITION** pentru Forță (peaking macrocycle structure 7+7+7 săpt subdivision per Forță template advanced trainee Marius profile)

**Volume scaling intra-block** (mesocycle-level multiplicative within block):
- M1 (mesocycle 1) — 1.00× baseline
- M2 (mesocycle 2) — 1.10× (+10% volume accumulate)
- M3 (mesocycle 3) — 1.15× (+15% volume peak)
- **Cap MRV absolut** — scaling NU trece peste MRV ceiling per Cluster 3 (hard limit invariant safety preservation)

**Maria adaptive override** (anti-progression-too-fast safeguard): NU advance la M2/M3 fără:
- Calibration tier ≥ DEVELOPING (per ADR 009 calibration tiers)
- Zero injury în trailing 6 săpt window (Invariant 5 Medical Safety)
- Both conditions required AND, NU OR

---

### §9.6 Cluster 5 — Cross-Engine Hooks (~6 decisions)

**Hook 1 → Engine #2 Goal Adaptation (ADR 024):**
- Periodization output `volume_target_pct` + `intensity_target_pct` + `mesocycle_phase` consumed by Goal Adaptation
- Goal Adaptation **kcal/macro modulate** based on phase (CUT/BULK/MAINTAIN/RECOMP per ADR 024 Q4)
- **Goal Adaptation NU override Periodization phase** — phase auto-derived per ADR 024 Q4 §2.4 (NU user pick), Goal Adaptation reads-only

**Hook 2 → Engine #4 Deload Protocol:**
- Periodization emits `deload_window` signal-only (Cluster 1 output blueprint field)
- **Engine #4 Deload Protocol owns deload session structure** — volume CUT 30%, Final_Depth MAX(45,60,30), reactive Hard Reset Linear Block (per Engine #4 SPEC COMPLETE 2026-05-05 birou after Cluster A-E)
- Periodization **signal-only**, NU compute deload session structure

**Hook 3 → Engine #5 Energy Adjustment (ADR 027):**
- Energy fluctuation **±15% session-level only** (per §1.10 §42.10 Constraint Object Floor/Ceiling Range bidirectional preserved)
- Energy **NU touch mesocycle phase** — session-level fluctuation within Periodization corridor Floor/Ceiling, NU phase override
- Asymmetric ±15% UP N≥3 / DOWN single trigger per Engine #5 SPEC COMPLETE 2026-05-05 birou after

**Hook 4 → Engine #6 Tempo (ADR 028) + Engine #7 Specialization (ADR 029):**
- Light coupling — Tempo + Specialization read Periodization output, NU bidirectional dependency
- Tempo overlay execution-time per Pipeline Order §5 (post-Execution sets/reps/RIR matrix)
- Specialization layer light coupling per Pipeline Order §5 (post-Execution parallel cu Tempo)

**Pipeline §42.10 sequential extension** (per §1.10 + §5 Pipeline Order LOCKED V1): Periodization (Engine #1) FIRST, generates coridor (Floor + Ceiling) baseline. Constraint Object immutable propagated engine-la-engine downstream (TypeScript readonly type-safe per ADR 030 D3 Context Object Pre-Built Input).

**Anti-cascade safeguards:**
- **Immutable snapshot at session start** — Periodization output frozen post-evaluate, downstream engines read-only consumers
- **Hard cap MRV / 90% 1RM Layer C sanity bound** — global ceiling regardless engine adjustments downstream (cross-ref Cluster 3 MRV cap absolut + ADR_CASCADE_DEFENSE_v1 Anti-Cascade Silent precedent)

---

### §9.7 Reconsideration Triggers — Engine #1 Periodization V1 → V1.5 candidate

Revisit Cluster 1-5 LOCKED V1 → V1.5 candidate dacă:

1. **Cluster 1 I/O Contract** — output blueprint 5 fields proves insufficient pentru downstream engines (e.g., engine #N+1 nou requires periodization signal NOT în current 5 fields). Trigger threshold: ≥1 downstream engine adăugat post-Beta cu unmet input dependency on Periodization output. Candidate: extend blueprint cu 6th field (e.g., `recovery_capacity_signal` for Vitality Layer integration ADR 016).
2. **Cluster 2 Mesocycle 4-week Default** — Maria persona shows persistent under-recovery pattern în 4-week cycles post-Beta useri reali (e.g., mesocycle DELOAD insufficient, fatigue accumulates cross-block). Candidate: 3-week clasic option per §65.5 alternate Option B reconsideration. Trigger threshold: ≥30% Maria-tier useri cu Energy red ≥3 sessions trailing post-DELOAD.
3. **Cluster 2 Marius 5:1 dual-signal threshold** — Marius extension granted too aggressive (RIR stable 1-2 + Energy ZERO red last 3 = false positive predictor injury risk). Trigger threshold: ≥1 Marius injury post-extension în Beta cohort (Invariant 5 Medical Safety violation post-extension grant). Candidate: tighten dual-signal (e.g., add 3rd signal sleep quality ≥7h avg).
4. **Cluster 3 Persona Modifiers Calibration** — Maria 0.50 / Gigica 0.70 / Marius 1.00 baseline shows systematic over- or under-shoot post-Beta useri reali (e.g., Maria 0.50 under-trains advanced Maria-tier specific subset). Trigger threshold: ≥20% sub-persona-tier deviation from MAV target sustained ≥4 săpt. Candidate: tier-aware persona modifier matrix (e.g., Maria-Beginner 0.40 / Maria-Intermediate 0.50 / Maria-Advanced 0.60).
5. **Cluster 4 Linear Block V1 Discipline** — DUP / Conjugate method cu evidence-base proven superior pentru Forță template advanced post-Beta. Trigger threshold: Forță template Marius cohort showing strength plateaus ≥6 săpt post-M3 PEAK consistently. Candidate: introduce DUP variant Forță template only (preserve Linear Block default other templates). Per Q7 §45.2 LOCKED scope discipline: DUP/Conjugate REJECTED pre-Beta — V1.5 reconsideration only.
6. **Cluster 4 Volume Scaling 1.00→1.10→1.15** — scaling proves too aggressive post-Beta (e.g., M3 1.15× drives MRV cap routinely, volume inflation NOT justified outcome data). Trigger threshold: ≥40% sessions M3 hitting MRV cap. Candidate: dampen scaling 1.00→1.05→1.10 conservative variant.
7. **Cluster 5 Hook Topology** — Hook 1 Goal Adaptation tension cu Hook 3 Energy ±15% (e.g., Goal Adaptation phase=CUT + Energy DOWN -15% concurrent → cumulative session intensity drop > Cluster 4 progressive overload requirement). Trigger threshold: ≥3 sessions per persona tracked exhibiting compound multi-hook reduction violating progressive overload invariant. Candidate: cross-hook ceiling rule (e.g., Goal Adaptation + Energy combined max -20% session not -30%).

**Re-evaluation cadence:** post Faza 2.5 implementation Engine #1 V1 + post-Beta useri reali signal aggregate (similar §1.8 Versioning Additive 18 luni deprecation window cadence). Bugatti craft transparency = ship V1 cu Cluster 1-5 LOCKED + monitor post-Beta signal.

---

🦫 **§9.1 Engine #1 Periodization Module-Level Spec V1 compiled 2026-05-06 morning chat-3 acasă.** ZERO net new substantive decisions — aggregation only verbatim from chat strategic 2026-05-04 evening late sources (`142_HANDOVER` lines 33-39 + CURRENT_STATE §JUST_DECIDED 2026-05-04 evening late lines 579-584). 32 decisions Cluster 1-5 cumulative. Pre Faza 2.5 implementation per Option A LOCKED 2026-05-06 morning chat-2. Reusable când Faza 3 wiring real Strangler post engines V1 exist (ADR 030 D1-D5 foundation + Phase 1-2 orchestrator foundation `src/coach/orchestrator/` LANDED commit `5a16550`).

---

### §9.2 Engine #2 Goal Adaptation Module-Level Spec V1

**Status:** 🟢 **SPEC READY V1** (compiled 2026-05-06 morning chat-3 acasă din chat strategic 2026-05-04 evening late sources). ~30 decisions cumulative (Cluster 1-5). Pre Faza 2.5 batch 2 implementation per Option A LOCKED 2026-05-06 morning chat-2 — pipeline §42.10 sequential post Engine #1 Periodization V1 LANDED commit `1303b62` (acest task).

**Provenance chain:**
- Source 1 (verbatim Cluster 1-5): `📤_outbox/_archive/2026-05/142_HANDOVER_2026-05-04_evening_late_periodization_goal_adaptation_CONSUMED.md` lines 41-47
- Source 2 (cristalizate identical, verbatim parity check ✅): `00-index/CURRENT_STATE.md` §JUST_DECIDED entry "2026-05-04 evening late" lines 586-591. ZERO substantive divergence vs Source 1; minor stylistic only (colon punctuation + word order)
- Source 3 (Q1-Q8 RESOLVED LOCKED foundation): [[024-goal-driven-program-templates|ADR 024]] §2.1 Q1 (5 vs 8 templates resolve) + §2.2 Q2 (Template variant matrix algorithmic generation) + §2.3 Q3 (Cross-engine integration topology HYBRID) + §2.4 Q4 (Cut-Bulk-Maintain phase transitions auto vs manual) + §2.5 Q5 (RECOMP scope) + §2.6 Q6 (Goal Shift conservare date / tier calibration post-shift LOCKED V1 D Hybrid morning 2026-05-06 chat-1) + §2.7 Q7 (5-template aspect mapping vs SUFLET F2 push-back proporțional) + §2.8 Q8 (Re-prompt periodic anti-spam logic). Compile draft full commit `8674782` 2026-05-06 morning chat-2.
- Source 4 (architectural foundation cross-ref doar, NU duplicate): [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract `analyze(input) → DimensionResult` + §1.10 Pipeline Order Constraint Object Floor/Ceiling Range ±15% above

**Cross-refs:** [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract (purity preserved engine = pure function NU side effects) | [[030-adapter-design-pattern|ADR 030]] D1-D5 LOCKED V1 foundation Hexagonal (Phase 1-2 orchestrator foundation `src/coach/orchestrator/` LANDED commit `5a16550` reusable post Faza 2.5 batch 2) | [[024-goal-driven-program-templates|ADR 024]] Q1-Q8 LOCKED foundation (compile draft full commit `8674782`) | §9.1 Engine #1 Periodization (Hook 1 source — Goal Adaptation consumes Periodization output volume_target_pct + intensity_target_pct + mesocycle_phase) | [[022-bayesian-nutrition-inference|ADR 022]] Engine #3 Bayesian Nutrition (downstream cross-engine integration) | [[027-engine-energy-adjustment|ADR 027]] Engine #5 Energy Adjustment (downstream session-level fluctuation Periodization corridor + Goal Adaptation phase context) | [[028-engine-tempo-form-cues|ADR 028]] Engine #6 Tempo (downstream light coupling) | [[029-engine-specialization|ADR 029]] Engine #7 Specialization (downstream light coupling) | §1.10 Pipeline Order LOCKED V1 above (Goal Adaptation second în pipeline §42.10 post Periodization)

---

### §9.2.1 Cluster 1 — I/O Contract (~5 decisions)

**Pure function signature** per ADR 018 §2 Standardized Dimension Contract:

```
goalAdaptationEngine.evaluate(ctx) → GoalAdaptationResult extends DimensionResult
```

**Output blueprint emit 6 fields** (per Cluster 1 verbatim Source 1 line 43):

1. `phase` — auto-derived `'CUT' | 'BULK' | 'MAINTAIN' | 'RECOMP'` per Cluster 3 nutrition logic phase auto-detection (NU user pick per ADR 024 §2.4 Q4 LOCKED)
2. `kcal_target_delta_pct` — TDEE multiplier per phase × goal × persona (Cluster 3 thresholds verbatim CUT 0.82/0.75 / BULK 1.08/1.15 / MAINTAIN 1.00 / RECOMP ±2%)
3. `macro_split` — `{ protein_g_per_kg_lbm, fat_g_per_kg, carb_g }` cu protein 1.6-2.2 + fat 0.8-1.0 floor hormonal + carb remainder template-variable
4. `rep_range_modifier` — `[min, max]` integer pair per (template, phase) tuple Cluster 4 tabel
5. `rir_target_modifier` — RIR floor/ceiling integer pair per (template, phase) tuple Cluster 4 tabel
6. `rest_time_modifier` — secunde inter-set per template × phase combo Cluster 4 tabel

**Constraint:** ZERO side effects (engine pure per ADR 018 §2). Side effects (CDL writes ADR 011, telemetry, Firestore Tier 2 sync) = orchestrator layer separate per ADR 030 D2 thin adapter scope LOCKED V1.

**Engine purity preserved:** Goal Adaptation reads Periodization output Constraint Object (Floor/Ceiling) read-only, **NU override** Periodization phase per ADR 024 §2.3 Q3 Hook 1 verbatim.

---

### §9.2.2 Cluster 2 — 5 Templates Primary + Mode Overlay + RECOMP Sub-Phase (~6 decisions)

**5 templates primary** (per Source 1 line 44 verbatim, NU 8):

1. **Forță & Dezvoltare** — compound focus, RIR 1-3, rep 3-8, rest 2-4 min
2. **Tonifiere & Definire** — hibrid hipertrofie + cut emphasis, RIR 0-2, rep 8-12
3. **Slăbire** — cut-focused, RIR 1-2, rep 10-15, conditioning add-on
4. **Longevitate** — mobility + sustainable load, RIR 2-3, rep 8-12, recovery emphasis
5. **Sănătate Generală** — balanced cu intensity controlled, RIR 2-3, rep 8-12, lifestyle integration

**RESOLVE legacy 8 misnumber** (per ADR 024 §2.1 Q1 LOCKED + Source 1 line 44): "8 templates" referenced în HANDOVER §26 = misnumber legacy. **ADR 024 source of truth canonical = 5 templates primary.** SSOT consolidation discrepanță rezolvată în favor enumerare verbatim.

**Mode modifier (Estetică ↔ Forță) cross-template overlay** (per Source 1 line 44): 10 perceived configs UI (5 templates × 2 modes) **dar 5 logic core** — Mode overlay multiplicativ post-template×phase, NU duplicate template list.

**Variant matrix algorithmic generation runtime** (per ADR 024 §2.2 Q2 LOCKED + Source 1 line 44): **NU 180 hardcoded combinations.** ~25 base config entries în `<engine>.tree.ts` data file (per ADR 026 §1.6 storage format) + modifiers permutation runtime per persona signals (Maria 0.50 / Gigica 0.70 / Marius 1.00 + recovery green bonus + goal modifiers).

**RECOMP NU template separate, sub-phase auto-detected** (per ADR 024 §2.5 Q5 LOCKED + Source 1 line 44): RECOMP detectat în Tonifiere/Slăbire pentru:
- Newbie effect (first 12 weeks training)
- Detrained return >6 weeks gap
- Fat-rich profile (BF% high baseline)

**UI shows MAINTAIN, distinction CDL only** — engine logs `phase: 'RECOMP'` în CDL audit trail (ADR 011) dar UI render = MAINTAIN pentru consistency narrative user simplification.

---

### §9.2.3 Cluster 3 — Phase Auto-Detection Nutrition (~7 decisions)

**Phase auto-detection (NU user pick)** per ADR 024 §2.4 Q4 LOCKED + Source 1 line 45 verbatim. Engine derives `phase` runtime din persona signals + goal + sezon. UI shows phase ca read-only status (consistency Big 6 lifecycle Imutabile category per ADR 024 §1.3).

**Phase auto-detection thresholds tabel verbatim** (Source 1 line 45):

- **CUT conservative:** TDEE × **0.82** baseline
- **CUT aggressive:** TDEE × **0.75** (Marius advanced 4-6 săpt max — anti-burnout cap)
- **BULK conservative:** TDEE × **1.08**
- **BULK aggressive:** TDEE × **1.15** (newbie + Forță template combo)
- **MAINTAIN:** TDEE × **1.00**
- **RECOMP:** TDEE ± **2%** (newbie effect / detrained return >6w / fat-rich first 12 weeks)

**Macro split** (verbatim Source 1 line 45):
- **Protein:** 1.6-2.2 g/kg LBM (lean body mass, NU body weight gross)
- **Fat:** 0.8-1.0 g/kg floor hormonal (preserve testosterone production hormonal floor)
- **Carb:** remainder template-variable (calculate post protein + fat + kcal_target_delta_pct)

**DELOAD week kcal +3-5% override** (verbatim Source 1 line 45): chiar dacă `phase=CUT`, DELOAD week (per Engine #1 §9.3 Cluster 2.1 W4 phase) → kcal +3-5% recovery imperative. Cross-engine constraint Hook downstream Engine #4 Deload Protocol.

**Rationale (per ADR 024 §2.4 Q4 LOCKED):** Phase auto-detection prevents user gaming (e.g., aggressive CUT permanent) + preserves SUFLET F2 push-back proporțional (per Cluster 5 below). Lifecycle change per §36.102 first-class supported via Goal Shift Event Handler §36.35 + ADR 024 Q6 D Hybrid LOCKED V1 morning 2026-05-06 chat-1.

---

### §9.2.4 Cluster 4 — Training Modifiers per Template × Phase (~6 decisions)

**Tabel base training modifiers per template × phase tuple** (Source 1 line 46 verbatim):

| Template            | RIR        | Rep Range  |
|---------------------|------------|------------|
| Forță & Dezvoltare  | RIR 1-3    | rep 3-8    |
| Tonifiere & Definire| RIR 0-2    | rep 8-12   |
| Slăbire             | RIR 1-2    | rep 10-15  |
| Longevitate         | RIR 2-3    | rep 8-12   |
| Sănătate Generală   | RIR 2-3    | rep 8-12   |

**Mode overlay Estetică / Forță post-template × phase multiplicativ** (per Source 1 line 46 verbatim): user toggle Mode = sub-modificator multiplicativ aplicat după base table — NU duplicate templates.

**Goal Shift Event Handler §36.35 cross-engine integration** (verbatim Source 1 line 46):
- **Streak RESET** (NU PRESERVE — distinction §50.4 D1 Save the Week)
- **2-session calibration window** §EXT-2 LOCKED (consistent ADR_OUTLIER_FILTER_v1 §EXT-2)
- **Phase re-derive runtime** §36.35 LOCKED (auto-detection Cluster 3 logic re-evaluated post-shift cu signals fresh)
- **CDL log** entry created cu Goal Shift Event Handler payload (ADR 011 audit trail)

**Cross-ref Q6 D Hybrid LOCKED V1 morning 2026-05-06 chat-1** (ADR 024 §2.6 Q6 cross-ref): tier global preserve + template-specific signals soft-reset + 2-session calibration window + streak RESET + phase re-derive runtime — biological signals preserved cross-template, rep/RIR/rest specific reset.

---

### §9.2.5 Cluster 5 — Push-Back Proporțional 3 Tiers (~6 decisions)

**3 tiers push-back proporțional** (per ADR 024 §2.7 Q7 LOCKED + Source 1 line 47):

- **Tier 1 silent** — no UI signal, engine internal modifier conservative aplicat, user NU notificat
- **Tier 2 banner discret** — in-app banner 1-2 lines explanation modificator aplicat, user info NU consimțământ explicit
- **Tier 3 modal blocking opt-in** — modal full screen warning concrete + opt-in confirmare explicit cu max conservative modifiers aplicat, user agrees informed consent path

**Re-prompt anti-spam logic** (per ADR 024 §2.8 Q8 LOCKED + Source 1 line 47):

- **Trigger 28 zile rolling** (rolling window din ultima interacțiune Re-prompt sau Goal Shift, NU calendar fix)
- **Cooldown 21 zile post-confirm** (user răspuns "Da, încă X" → 21 zile NU re-prompt indiferent de signal)
- **Cooldown 60 zile post Goal Shift** (user făcut shift activ → 60 zile NU re-prompt — preserve calibration window §36.35 + 2-session window evening late + reduce noise post-shift)
- **Cap absolut max 4 re-prompts/an** (anti-spam hardcap chiar dacă rolling triggers exceed)

**Rationale SUFLET F2 alignment** ("AI-ul informează, nu impune"): Tier 3 = max conservative modifiers, **NU absolute refuse**. User keeps autonomy. Risk-tier mapping example Forță + BF% high + age 60+ + recent injury → Tier 3 modal cu volume cap MEV-50% + intensity cap 75% 1RM Layer C sanity bound (cross-ref Engine #1 §9.6 Cluster 5 hard cap) + warning "te-am observat pattern X, recomand path Y, dar tu decizi". Cross-ref [[025-andura-gandeste-pentru-user|ADR 025]] graceful degradation engine pre-fills default.

**Anti-cascade preserved Cluster 5 Engine #1 §9.6:** Goal Adaptation consumes Periodization output Constraint Object frozen (Hook 1 read-only), redistribuie volume în interiorul coridorului Floor/Ceiling per §1.10 Pipeline Order LOCKED V1 — NU trece peste Ceiling NU sub Floor.

---

### §9.2.6 Reconsideration Triggers — Engine #2 Goal Adaptation V1 → V1.5 candidate

Revisit Cluster 1-5 LOCKED V1 → V1.5 candidate dacă:

1. **Cluster 1 I/O Contract** — output blueprint 6 fields proves insufficient pentru downstream engines (e.g., engine #N+1 nou requires Goal Adaptation signal NOT în current 6 fields). Trigger threshold: ≥1 downstream engine adăugat post-Beta cu unmet input dependency. Candidate: extend blueprint cu 7th field (e.g., `lifecycle_phase_pct_progress` for Goal Shift Event Handler §36.35 timing predict).
2. **Cluster 2 Algorithmic Generation Scope** — ~25 base config entries proves insufficient post-Beta useri reali (e.g., 6th template requested cu prevalence ≥5%). Per ADR 024 §5 Reconsideration Trigger 2: useri reali post-Beta cer template nou. Candidate: extend Mode overlay (preserve 5 logic core) sau introduce 6th template specific (e.g., "Performance Atletic" / "Reabilitare specifică").
3. **Cluster 3 Phase Auto-Detection Thresholds Drift** — TDEE × 0.82 / 0.75 / 1.08 / 1.15 / 1.00 / ±2% baseline shows systematic bias post-Beta useri reali (e.g., Maria 65 conservative CUT 0.82 = under-eating signal vitality drop). Per ADR 024 §5 Reconsideration Trigger 3. Trigger threshold: ≥20% sub-persona-tier deviation from outcome target sustained ≥4 săpt. Candidate: tier-aware threshold matrix (e.g., Maria-Beginner CUT 0.85 conservative vs Marius-Advanced CUT 0.75 default).
4. **Cluster 4 Mode Overlay Multiplicative Tension** — Mode overlay Estetică / Forță post-template × phase multiplicative shows degenerate cases (e.g., Mode=Forță × Template=Sănătate × Phase=CUT cumulative reduction violates progressive overload invariant). Trigger threshold: ≥3 sessions per persona tracked exhibiting compound multi-modifier reduction violating Invariant 1 (V ≤ MRV). Candidate: Mode overlay ceiling rule (e.g., Mode + Phase combined max -20% NOT -30% per Engine #1 §9.7 Cluster 5 sub-trigger 7 cross-hook tension precedent).
5. **Cluster 5 Push-Back Tier 3 Opt-In Rate** — opt-in rate <50% useri Tier 3 trigger → SUFLET F2 alignment compromise (forced refusal effectively). Per ADR 024 §5 Reconsideration Trigger 4. Trigger threshold: opt-in rate <50% sustained ≥1 lună post-Beta. Candidate: Tier 2 banner upgrade vs Tier 3 modal threshold tightening (more cases routed Tier 2 silent banner vs modal blocking).
6. **Cluster 5 Re-Prompt Anti-Spam Cap 4/an** — useri raportează re-prompt fatigue chiar sub cap 4/an. Per ADR 024 §5 Reconsideration Trigger 5. Trigger threshold: ≥30% useri Settings UI reduce re-prompt frequency manual. Candidate: reduce 4/an → 3/an OR extend cooldown 28d → 35d rolling trigger.
7. **Q6 D Hybrid Signal Contradictoriu Post-Beta** (cross-ref ADR 024 §5 Reconsideration Trigger 1) — 2-session calibration window prea scurt pentru convergence (rate fallback >5% Circuit Breaker per ADR 026 §1.7 §42.7) sau prea lung pentru UX (user feedback abandonare post-shift). Per ADR 024 Q6 Reversibility note §2.6.

**Re-evaluation cadence:** post Faza 2.5 batch 2 implementation Engine #2 V1 + post-Beta useri reali signal aggregate (similar §1.8 Versioning Additive 18 luni deprecation window cadence). Bugatti craft transparency = ship V1 cu Cluster 1-5 LOCKED + monitor post-Beta signal.

---

🦫 **§9.2 Engine #2 Goal Adaptation Module-Level Spec V1 compiled 2026-05-06 morning chat-3 acasă.** ZERO net new substantive decisions — aggregation only verbatim from chat strategic 2026-05-04 evening late sources (`142_HANDOVER` lines 41-47 + CURRENT_STATE §JUST_DECIDED 2026-05-04 evening late lines 586-591). 30 decisions Cluster 1-5 cumulative. Pre Faza 2.5 batch 2 implementation per Option A LOCKED 2026-05-06 morning chat-2. Pattern Bugatti SSOT consistent §9.1 Engine #1 Periodization compile draft (commit `cd6d9a4`) + V1 implement (commit `1303b62`).

---

### §9.3 Engine Energy Adjustment Module-Level Spec V1

**Status:** 🟢 **SPEC READY V1** (compiled 2026-05-06 afternoon chat-4 acasă din chat strategic 2026-05-05 birou late sources). ~26-28 decisions cumulative (Cluster 1-5). Pre Faza 2.5 batch 3 implementation per Option A LOCKED 2026-05-06 morning chat-2 — pipeline §42.10 sequential post Engine #2 Goal Adaptation V1 LANDED commit `bf9814e` (batch 2).

**Pipeline placement (per §42.10 LOCKED V1 §1.10 ADR 026):** Energy Adjustment runs sequentially **3rd** (NU position 5 — "Engine #5" naming în [[027-engine-energy-adjustment|ADR 027]] = legacy spec session ordering, pipeline §42.10 canonical position 3rd). Order: `Periodization (§9.1) → Goal Adaptation (§9.2) → Energy Adjustment (§9.3) → Bayesian (§9.4) → Tempo (§9.5) → Specialization (§9.6) → Warm-up (§9.7) → Deload (§9.8)`.

**Provenance chain:**
- Source 1 (verbatim Cluster 1-5): `📤_outbox/_archive/2026-05/149_HANDOVER_2026-05-05_birou_late_engines5-6-7_spec_sessions_CONSUMED.md` Engine #5 Energy section (lines 21-32, 11 substantive bullet decisions)
- Source 2 (cristalizate parity check ✅): `00-index/CURRENT_STATE.md` §RECENT entry "2026-05-05 birou late" Engine #5 partition (lines 534-545). **Verbatim parity check Source 1 ↔ Source 2: ZERO substantive divergence flagged** (anti-recurrence proof § 9.2 compile precedent honored).
- Source 3 (cross-ref decision specifice): §45.5 Q33 (Energy Adjustment selective volume + intensity reuse base), §45.4 Q21 §36.82 (Marius 5:1 dual-signal cross-ref Periodization phase gate), §50.4 D1 (Streak counter cross-ref Yo-yo anti-flap), [[ADR_OUTLIER_FILTER_v1]] §EXT-1 + §EXT-2 (anti-flap discipline foundation)
- Source 4 (architectural foundation cross-ref doar, NU duplicate): [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract `analyze(input) → DimensionResult` + §1.10 Pipeline Order Constraint Object Floor/Ceiling Range ±15% above

**Cross-refs:** [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract (purity preserved engine = pure function NU side effects) | [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline Order LOCKED V1 above (Energy Adjustment 3rd în pipeline §42.10) | [[027-engine-energy-adjustment|ADR 027]] 🔵 SPEC REFERENCE post-flip `dccda1f` (redirects la §9.3 SSOT canonical) | [[022-bayesian-nutrition-inference|ADR 022]] σ variance modifier Q12=C cross-engine integration | [[009-calibration-tiers|ADR 009]] tier-aware T0/T1+ thresholds Q13=B | [[ADR_OUTLIER_FILTER_v1]] §EXT-1 streak counter cross-ref Yo-yo anti-flap Q14=D | §9.1 Engine #1 Periodization Floor/Ceiling coridor immutable Hook 1 read-only | §9.2 Engine #2 Goal Adaptation phase gate "high_intensity != true" Q7 4th condition

---

#### §9.3.1 Cluster 1 — I/O Contract & Pipeline Placement (~5 decisions)

**Pure function signature** per ADR 018 §2 Standardized Dimension Contract:

```
energyAdjustmentEngine.evaluate(ctx) → EnergyAdjustmentResult extends DimensionResult
```

**Pipeline placement LOCKED V1 (per §42.10):** Energy Adjustment runs **sequentially 3rd** post Periodization (§9.1) + Goal Adaptation (§9.2). Legacy "Engine #5" naming în [[027-engine-energy-adjustment|ADR 027]] = chat strategic spec session ordering NU pipeline canonical position. Pipeline §42.10 canonical: `Periodization → Goal Adaptation → Energy Adjustment → Bayesian → Tempo → Specialization → Warm-up → Deload`.

**Input contract (consumed Hook 1 read-only):** Constraint Object frozen propagated upstream Periodization §9.1 Cluster 5 + Goal Adaptation §9.2.5 cross-engine hooks (volume_per_muscle Floor/Ceiling + intensity_pct_1rm corridor + phase + deload_window). NU mutate input — anti-cascade safeguard preserved.

**Output blueprint emit (cumulated cluster 2-4 decisions):**
1. `energy_state` — emoji 🟢🟡🔴 holistic aggregate (Cluster 2 input strategy)
2. `adjustment_direction` — `'UP' | 'DOWN' | 'NONE'` (Cluster 3 bidirectional asymmetric)
3. `adjustment_magnitude_pct` — Float în [-0.15, +0.15] tier-aware corridor (Cluster 4 tier-aware Q13=B)
4. `volume_intensity_scope` — `{volume: bool, intensity: bool}` selective per Q33 §45.5 reuse (Cluster 3)
5. `forward_constraint_object` — Periodization corridor pass-through immutable downstream Bayesian/Tempo/Specialization (Hook 1 forwarding, NU mutate)
6. `signals` — human-readable signal IDs (e.g. `'energy_red_drill_down'`, `'asymmetric_up_phase_gate_blocked'`, `'yoyo_3_session_anti_flap_active'`)

**Constraint:** ZERO side effects (engine pure per ADR 018 §2). Side effects (CDL writes ADR 011, telemetry, Firestore Tier 2 sync) = orchestrator layer separate per ADR 030 D2 thin adapter scope LOCKED V1.

**Engine purity preserved:** Energy Adjustment reads Periodization Constraint Object Hook 1 read-only, **NU override** Periodization phase NU sub Floor NU peste Ceiling per §1.10 Pipeline Order LOCKED V1 — anti-cascade safeguard.

---

#### §9.3.2 Cluster 2 — Input Strategy & Aggregation (~6 decisions)

**Manual input only V1** (Source 1 line 22 verbatim, Q1=C hibrid + Q4=A + Q5=A defer auto integration v1.5+):
- **Q1=C hibrid:** prompt user pre-session emoji 🟢🟡🔴 (manual self-report) — NU auto-detection biometric V1
- **Q4=A defer:** auto-detection v1.5+ post-Beta useri reali signal validation
- **Q5=A defer:** biometrics integration (HRV / sleep tracker / wearable) v1.5+ post-Beta

**Stress folded emoji holistic 🟢🟡🔴 + drill-down strict 🔴 only** (Source 1 line 23 verbatim, Q15=C anti-Maria-65-friction):
- **Holistic emoji single dimension:** 🟢 = green ready / 🟡 = yellow caution / 🔴 = red distressed (NU separate axes stress + recovery + sleep — single composite signal user simplification)
- **Drill-down strict 🔴 only:** când user pickează 🔴 → engine prompt drill-down (cause: stres / somn / durere / altul) — **NU 🟡** (Daniel push-back Q15=C: zilnic friction Maria 65 anti-Bugatti, prompt drill-down doar la 🔴 distressed = signal puternic warrant analysis)

**Categorical aggregation rules table** (Source 1 line 24 verbatim, Q3=C auditable):
- **Discrete categorical inputs** (NU continuous Likert) — emoji 3-state + drill-down 4-cauze fixed labels
- **Aggregation rules tabel auditable** persistent CDL trace transparency: input → adjustment direction + magnitude tier-aware mapping
- **Auditable rule set:** Bugatti craft `<engine>.tree.ts` data file reusable testing + Beta cohort validation V1

**Anti-spam invariant aliniat Engine #2 (cross-ref §9.2 + ADR 024 §2.8):** drill-down 🔴 prompt cooldown rolling per session (NU spam multi-prompt în sesiune), persisted CDL `last_drill_down_ts` cross-session anti-fatigue.

---

#### §9.3.3 Cluster 3 — Adjustment Dimensions & Bidirectional ±15% (~5 decisions)

**Volume + intensity selective scope** (Source 1 line 25 verbatim, Q33 §45.5 reuse + Q6=D):
- **Selective scope per emoji aggregate:** volume + intensity ambele targeting în coridor Periodization `volume_per_muscle Floor/Ceiling` + `intensity_pct_1rm Floor/Ceiling`
- **Q33 §45.5 reuse:** decision base infrastructure precedent (Energy Adjustment selective volume + intensity, NU rep range NU rest time — those = Goal Adaptation §9.2.4 Cluster 4 scope)

**Bidirectional ±15% conservative range** (Source 1 line 25 verbatim, Q6=D):
- **Range ±15%** corridor magnitude maxim adjustment session-level (NU peste, NU sub) — conservative pick V1 anti-degenerate cumulative adjustment
- **Bidirectional symmetric range** (UP +15% / DOWN -15% maxim) — direction asymmetric trigger logic per Q7 below, magnitude ceiling identical

**Asymmetric Q7 — UP +15% requires N≥3 conditions + Periodization phase gate "high_intensity != true"** (Source 1 line 26 verbatim, Q7 4th condition):
- **Q7=B Asymmetric trigger logic:**
  - **DOWN -15%:** single trigger immediate (e.g., user picks 🔴 → engine triggers DOWN -15% next session) — anti-burnout protect prima
  - **UP +15%:** strict requires **N≥3 conditions cumulative** (3 sessions consecutive cu 🟢 stable AND no recovery red flags AND no stagnation markers AND **Periodization phase gate "high_intensity != true"**) — anti-aggressive UP cumulative drift
- **Q7 4th condition Periodization phase gate:** UP +15% NU triggers când Periodization §9.1 mesocycle phase = PEAK or LOAD+ (high_intensity == true) — anti **"Sarcastic UP" Marius 5:1 săpt 4-5** scenario unde 5:1 dual-signal green PLUS Energy Adjustment UP +15% PLUS PEAK phase = compound aggressive cascade violating Invariant 1 (V ≤ MRV) + Invariant 5 Medical Safety
- **Anti-cascade preserved:** UP +15% strict gating preserves Periodization phase priority + Goal Adaptation phase gate concurrency

---

#### §9.3.4 Cluster 4 — Invariants & Cross-Engine Hooks (~6 decisions)

**MRV invariant 1 immutable** (Source 1 line 27 verbatim, Q8=A):
- **Hard cap MRV absolute** preserved Layer C sanity bound Periodization §9.1 Cluster 5 — Energy Adjustment NU peste MRV ceiling regardless adjustment magnitude. Anti-drift safeguard Bugatti craft.

**Soft override sub-Floor max 2 consecutive → Engine Deload trigger** (Source 1 line 27 verbatim, Q9 anti-drift):
- **Soft override sub-Floor allowed max 2 sessions consecutive** (când DOWN -15% adjustment + Periodization Floor combined drops below MEV) → NU hard reject, NU silent ignore
- **3rd session sub-Floor → trigger Engine Deload Protocol** (cross-ref Engine #4 / §9.8 Deload spec) — composite signal escalation per ADR 026 §1.10 Pipeline Order
- **Anti-drift mechanism:** sub-Floor sustained = clear signal user systemic recovery deficit, escalate Deload domain proper (NU paper over cu DOWN -15% indefinitely)

**Bayesian σ variance modifier Engine Bayesian** (Source 1 line 28 verbatim, Q12=C sophisticated):
- **σ variance signal cross-engine integration cu Engine #3 Bayesian Nutrition** — Energy Adjustment magnitude amplified/dampened per Bayesian posterior σ (high σ = volatile signal, dampening adjustment magnitude pentru anti-noise; low σ = stable signal, magnitude preserved)
- **Sophisticated formula** post-Beta calibration target (V1 conservative pick: σ > σ_threshold → adjustment × 0.7 dampening factor)
- **Cross-ref:** ADR 022 Bayesian Nutrition §3.X cross-engine #5 integration "Pre-processing modulator readiness cu Neutral fallback T0 cold start"

**Tier-aware T0=±10% T1+=±15%** (Source 1 line 29 verbatim, Q13=B):
- **T0 cold start tier:** ±10% conservative range maxim adjustment (calibration window sigma high, anti-overfit early signals)
- **T1+ established tier:** ±15% full range (calibration validated, signal-to-noise ratio sustainable)
- **Cross-ref:** [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after T2 Unlock Convergence Guard formula (T0 → T1 progression gate)

**Yo-yo anti-flap 3-session window V1 only** (Source 1 line 30 verbatim, Q14=D):
- **Anti-flap mechanism 3-session rolling window:** dacă adjustment direction flipped UP→DOWN→UP în 3 sesiuni consecutive → engine **suppresses 3rd flip**, holds current direction, logs `signal: 'yoyo_anti_flap_suppressed'`
- **V1 only Sprinter/Marathon profile-typing modulators DEFERRED** post-Beta data real (Q14 deferred): future variant include profile-typing-aware anti-flap thresholds (Sprinter persona = aggressive flips OK / Marathon = strict 3-session lock)
- **Cross-ref:** [[ADR_OUTLIER_FILTER_v1]] §EXT-1 Streak Counter Same Direction §50.4 D1 + §EXT-2 — discipline foundation Yo-yo anti-flap consistent ecosystem

**Cross-engine hooks summary:**
- **Hook 1 (consume) ← Engine #1 Periodization** Constraint Object frozen `volume_per_muscle Floor/Ceiling + intensity_pct_1rm + phase + deload_window` — read-only redistribuie INTERIOR coridorului
- **Hook 2 → Engine #4 Deload Protocol** sub-Floor sustained 3-session escalation trigger (per Q9 anti-drift)
- **Hook 3 ↔ Engine #3 Bayesian Nutrition** σ variance modifier bidirectional cross-engine integration (per Q12=C)
- **Hook 4 (forward) → downstream engines (Bayesian/Tempo/Specialization/Deload)** Constraint Object pass-through immutable preserved per §1.10 Pipeline Order LOCKED V1

---

#### §9.3.5 Cluster 5 — Safety/Compliance & Deferred V1.5 (~4 decisions)

**Medical referral copy Gigel test PASS** (Source 1 line 31 verbatim, Q18=D):
- **Copy verbatim LOCKED V1:** *"Consultă medicul de familie sau un specialist în medicină sportivă"*
- **Generic "specialist" REJECTED** (Daniel push-back Gigel test mid-flight): "specialist" generic = ambiguous user could interpret as "antrenor specializat" sau "nutritionist" → diluează Invariant 5 Medical Safety message. Specific "medicul de familie sau specialist în medicină sportivă" = unambiguous medical professional pathway.
- **Trigger condition:** Energy Adjustment 3-session sub-Floor cascade (post Engine Deload escalation) + composite low signals → engine surfaces medical referral banner (Bugatti craft "AI-ul informează, NU impune" SUFLET F2 alignment) — NU absolute block, user keeps autonomy.

**Bayesian latent state v1.5 evolution** (Source 1 line 32 verbatim, Q20=D):
- **V1.5 ecosystem-wide Bayesian inference migration** (Engine #3 Bayesian + Engine Energy + Engine #6 Tempo + Engine #7 Specialization consistent Q20=D)
- **V1 stays categorical aggregation rules table** (Cluster 2 Q3=C) — Bayesian latent state evolution post-Beta when data real validates tractable inference scope (anti-premature-optimization)

**Sprinter/Marathon profile-typing modulators DEFERRED V1** (Source 1 line 30 verbatim, Q14 deferred):
- **Q14=D anti-flap 3-session window** = V1 only LOCKED — Sprinter/Marathon profile-typing modulators **DEFERRED post-Beta data real** signal validation
- **Future v1.5+ candidate:** profile-typing-aware anti-flap thresholds + adjustment magnitude per profile (Sprinter aggressive ±15% acceptable / Marathon conservative ±10% rolling lock)

**Pain-Aware integration cross-ref Engine #4 Deload Convergence Guard "T2 Unlock":**
- **Engine Energy NOT proactive trigger Pain-Aware** (clean signal monitor only USER FRICTION via Pain Button per CURRENT_STATE 2026-05-05 birou after Convergence Guard "T2 Unlock"): Engine Energy adjustments NU contribuie `pain_aware:true` flag CDL — flag se setează STRICT user-triggered Pain Button only
- **Cross-ref:** Decoupling safety/reward via Clean Signal rule preserved Invariant 5 Medical Safety

---

#### §9.3.6 Reconsideration Triggers — Engine Energy Adjustment V1 → V1.5 candidate

Revisit Cluster 1-5 LOCKED V1 → V1.5 candidate dacă:

1. **Cluster 2 Manual input only insufficient post-Beta useri reali** — auto-detection biometric demand prevalence ≥30% useri opt-in HRV / sleep tracker integration. Per Source 1 Q4=A defer + Q5=A defer reversibility note. Trigger threshold: ≥30% Beta cohort useri raportează "manual emoji friction" sau wearable adoption rate ≥40%. Candidate: Hibrid manual + auto-detection biometric per Q1 evolution toggle UI.

2. **Cluster 3 ±15% range too aggressive sau too conservative** — post-Beta outcome data shows systematic adjustment under-shoot (target outcome NU atins în 3 sesiuni consecutive UP/DOWN signals) sau over-shoot (cascade adjustment compound violating Invariant 1). Trigger threshold: ≥20% sub-persona-tier deviation outcome target sustained ≥4 săpt. Candidate: tier-aware corridor matrix (e.g., Maria-Beginner ±10% conservative vs Marius-Advanced ±20% aggressive default).

3. **Cluster 4 Yo-yo 3-session window false positives** — engine suppresses legitimate direction flip post-Goal-Shift sau post-injury (signal contradictoriu 3-session lock = brittle anti-flap). Per Source 1 Q14 reversibility note. Trigger threshold: ≥5% Beta cohort useri raportează "engine stuck wrong direction" post-shift event. Candidate: profile-typing modulators activate (Q14 deferred Sprinter/Marathon path) sau context-aware suppression bypass (Goal Shift Event Handler §36.35 hook).

4. **Cluster 4 Tier-aware ±10%/±15% threshold drift** — T0 ±10% conservative limita tier-aware progression (T0 useri stuck în low-magnitude adjustment cycle, NU advance la T1 calibration window). Trigger threshold: ≥30% T0 useri stuck T0 >8 săpt cu adjustment magnitude consistently capped ±10%. Candidate: T0 ±12% tier-aware threshold tightening sau T0→T1 progression gate relax.

5. **Cluster 5 Medical referral copy clarity post-Beta useri reali signal** — Gigel test PASS V1 LOCKED dar useri reali raportează misinterpretation copy ("medicul de familie" ambiguous în context urban younger demographic, "specialist medicină sportivă" inaccessible în România rural). Trigger threshold: ≥10% Beta cohort raportează "NU știam unde să merg post-banner". Candidate: copy A/B test variant cu UX research panel + cross-ref ADR 025 graceful degradation engine pre-fills default.

6. **Cluster 4 Bayesian σ variance modifier sophisticated formula calibration drift** — post-Beta σ_threshold (V1 conservative pick) shows systematic over-dampening (high σ legitimate volatile signal user state genuine ne-amortized). Per Source 1 Q12=C reversibility note. Trigger threshold: ≥15% sessions adjustment magnitude reduced >50% via σ dampening cu user post-session feedback "engine prea conservator". Candidate: σ_threshold tier-aware (T0 strict / T1+ relaxed) sau weighted compound:isolation Engine #3 cross-engine signal aggregation.

7. **Cluster 5 Bayesian latent state v1.5 evolution timing** — Q20=D ecosystem-wide migration timing dependent Engine #3 Bayesian Nutrition tractable inference proven post-Beta. Trigger threshold: Engine #3 R²>0.85 validation gate hold ≥6 luni post-Beta + ≥1000 sesiuni real data. Candidate: V1.5 migration coordinated multi-engine release (NU per-engine trickle).

**Re-evaluation cadence:** post Faza 2.5 batch 3 implementation Engine Energy Adjustment V1 + post-Beta useri reali signal aggregate (similar §9.1.7 + §9.2.6 cadence pattern §1.8 Versioning Additive 18 luni deprecation window). Bugatti craft transparency = ship V1 cu Cluster 1-5 LOCKED + monitor post-Beta signal.

---

#### §9.3.7 Cross-refs Bidirectional ADR

- [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract — `evaluate(ctx) → EnergyAdjustmentResult` extending DimensionResult (purity preserved engine = pure function NU side effects)
- [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline Order LOCKED V1 — Energy Adjustment 3rd în pipeline §42.10 (NU position 5 legacy)
- [[027-engine-energy-adjustment|ADR 027]] 🔵 SPEC REFERENCE (post-flip `dccda1f` 2026-05-06 evening chat-9 — ADR 027 redirects la §9.3 single source of truth canonical)
- [[022-bayesian-nutrition-inference|ADR 022]] σ variance modifier Q12=C cross-engine integration (Hook 3 bidirectional Engine #3 Bayesian Nutrition)
- [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after Convergence Guard T2 Unlock — tier-aware T0=±10% / T1+=±15% Q13=B foundation
- [[ADR_OUTLIER_FILTER_v1]] §EXT-1 Streak Counter Same Direction §50.4 D1 + §EXT-2 Goal Shift Event Handler — Yo-yo anti-flap Q14=D discipline foundation
- [[030-adapter-design-pattern|ADR 030]] D1-D5 LOCKED V1 foundation Hexagonal — Phase 1-2 orchestrator foundation `src/coach/orchestrator/` LANDED commit `5a16550` reusable post Faza 2.5 batch 3
- §9.1 Engine #1 Periodization Floor/Ceiling coridor immutable Hook 1 read-only (consume input frozen)
- §9.2 Engine #2 Goal Adaptation phase gate "high_intensity != true" Q7 4th condition (cross-engine concurrency + anti-Sarcastic UP Marius 5:1 săpt 4-5 anti-cascade)
- §9.4 Engine #3 Bayesian Nutrition Q12=C cross-engine integration σ variance modifier (LANDED §9.4 spec compile commit `685fdd4` + V1 implement commit `8615ec1`)
- §9.8 Engine Deload Protocol Q9 anti-drift escalation sub-Floor sustained 3-session trigger (LANDED §9.8 spec compile commit `d7594e7` + V1 implement commit `a6a0c87`)

---

🦫 **§9.3 Engine Energy Adjustment Module-Level Spec V1 compiled 2026-05-06 afternoon chat-4 acasă.** ZERO net new substantive decisions — aggregation only verbatim from chat strategic 2026-05-05 birou late sources (`149_HANDOVER` Engine #5 Energy section lines 21-32 + CURRENT_STATE §RECENT 2026-05-05 birou late lines 534-545 parity check ✅ ZERO substantive divergence). ~26-28 decisions Cluster 1-5 cumulative. Pre Faza 2.5 batch 3 implementation per Option A LOCKED 2026-05-06 morning chat-2. Pattern Bugatti SSOT consistent §9.1 Engine #1 Periodization compile draft (commit `cd6d9a4`) + §9.2 Engine #2 Goal Adaptation compile draft (commit `6be84f8`). Pipeline §42.10 position 3rd canonical (NU position 5 legacy ADR 027 "Engine #5" naming).

---

### §9.4 Engine Bayesian Nutrition Inference Module-Level Spec V1

**Status:** 🟢 **SPEC READY V1** (compiled 2026-05-06 afternoon chat-5 acasă din chat strategic 2026-05-05 birou after sources). ~32-35 decisions cumulative (Cluster A-E). Pre Faza 2.5 batch 4 implementation per Option A LOCKED 2026-05-06 morning chat-2 — pipeline §42.10 sequential post Engine Energy Adjustment V1 LANDED commit `69ec9ce` (batch 3).

**Pipeline placement (per §42.10 LOCKED V1 §1.10 ADR 026):** Bayesian Nutrition Inference runs sequentially **4th** position canonical. Order: `Periodization (§9.1) → Goal Adaptation (§9.2) → Energy Adjustment (§9.3) → Bayesian Nutrition (§9.4) → Tempo (§9.5) → Specialization (§9.6) → Warm-up (§9.7) → Deload (§9.8)`.

**Provenance chain (3-way parity check ✅):**
- Source 1 (verbatim Cluster A-E narrative): `📤_outbox/_archive/2026-05/148_HANDOVER_2026-05-05_birou_after_engines3-4-5_spec_sessions_CONSUMED.md` Engine #3 Bayesian Nutrition section (line 5 dense paragraph aggregate ~21 substantive decisions)
- Source 2 (cristalizate parity check): `00-index/CURRENT_STATE.md` §RECENT entry "2026-05-05 birou after" Engine #3 Bayesian partition (lines 607-627, 21 bullets identical content vs Source 1)
- Source 3 (cristalizate distilled SPEC READY V1): `03-decisions/022-bayesian-nutrition-inference.md` Cluster A-E + Convergence Guard cluster (lines 25-111). **Source 3 more structured** cu sub-numbering A1-A5/B1-B4/C1-C3/D1-D6/E1-E2 + separate Convergence Guard cluster (5 conditions explicit). Decision count Source 3 = ~20-21 grouped + Convergence Guard ~5-7 = total ~25-28; Sources 1+2 count 32-35 prin granular sub-decisions per caveat (e.g., Kalman = 3 sub-decisions for 3 caveats). **Acceptable delta — content verbatim identical**.
- **3-way verbatim parity check ✅: ZERO substantive divergence flagged** (anti-recurrence proof stronger vs §9.1-§9.3 2-way precedent).

**Cross-refs:** [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract (purity preserved engine = pure function NU side effects) | [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline Order LOCKED V1 above (Bayesian Nutrition 4th în pipeline §42.10) | [[022-bayesian-nutrition-inference|ADR 022]] SPEC READY V1 cross-ref Source 3 distilled (parity check ✅) | [[017-demographic-prior-database|ADR 017]] T0 demographic prior baseline foundation | [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" cross-cutting (NU Engine #3 specific) | [[../01-vision/PRODUCT_STRATEGY_SPEC_v1|PRODUCT_STRATEGY_SPEC]] §3.5.1 Strong Prior 80% input + 20% baseline calibration time -50% | §9.1 Engine #1 Periodization Volume Landmarks Israetel cross-ref Cluster C4 | §9.2 Engine #2 Goal Adaptation Disagreement flag cross-ref Cluster C2 | §9.3 Engine Energy Adjustment σ variance modifier Q12=C cross-engine integration cross-ref Cluster C3

---

#### §9.4.1 Cluster A — Prior Form + Slope Tier-Based + Decay + Validation + Phase Reset (~5 decisions)

**A1 Prior distribution form** (verbatim Source 3 line 29, Source 1 line 5 verbatim parity ✅):
- **Gaussian Conjugate Prior** local-first JS tractable. **NU Hierarchical Bayesian** — V1 scope.
- Conjugate pair (Normal-Normal) closed-form posterior update — no MCMC, no JAX, runs device-side <50ms median per ADR 026 Q8.1 budget compliant.

**A2 Strong Prior dynamic slope tier-based** (verbatim Source 3 lines 30-33, Source 1 line 5 + Source 2 line 609):
- **Big 6 minim T0 = 70% prior / 30% input** (low confidence — protect against single-data-point overshoot)
- **Big 6 + 14 zile observations T1 = 80/20** (per §3.5.1 baseline calibration time -50%)
- **Big 6 + Convergence Guard satisfied T2 = 90/10** (high confidence — inference erodează prior)

**A3 Bayesian decay natural** (verbatim Source 3 line 34, Source 1 line 5 + Source 2 line 610):
- `posterior(week N) = prior(week N+1)`. **NU explicit decay rule** — math-native, no exponential decay parameter to tune. Self-balancing per Conjugate update math.

**A4 Validation strategy Hibrid** (verbatim Source 3 line 35, Source 1 line 5):
- **Synthetic personas pre-Beta** (R²>0.85 simulator gate, Hall 2008 metabolic adaptation literature defaults — ~22 kcal/kg LBM lost per Forbes equation)
- **Real anonymized Beta cohort post v1.5+** (dietician panel corroborate, anti-overconfidence Mensa-grade validation Daniel push-back)

**A5 Phase reset Hibrid** (verbatim Source 3 line 36, Source 1 line 5 "Hibrid reset Layer 1+2 preserve Layer 4 Goal Shift"):
- **CUT → BULK transition = Layer 1 (kcal_baseline) + Layer 2 (macro_split) RESET**
- **Preserve Layer 4 (Goal Shift Event Handler §36.35 streak preservation)** — biological signals trans-template (recovery/vitality NU dependente de goal choice)

---

#### §9.4.2 Cluster B — Cadence + Kalman + Volume Metric + Mood Scoring (~4 decisions)

**B1 Adaptive cadence** (verbatim Source 3 line 40, Source 1 line 5):
- **T1+ = weekly weigh-in + adherence rate** (CDL-sourced)
- **T0 fallback = sparse weigh-ins acceptable, 14 zile observation buffer** pre Profile Typing threshold

**B2 Kalman 1D peak craft cu 3 caveats** (verbatim Source 3 lines 41-44, Source 1 line 5 "Kalman 1D peak craft cu 3 caveats"):
- **Caveat 1:** defaults Hall 2008 literature (NIH metabolic adaptation rate ~22 kcal/kg LBM lost per Forbes equation)
- **Caveat 2:** R²>0.85 validation gate pre-Beta simulator — fail = revert EWMA fallback
- **Caveat 3:** EWMA fallback feature flag (`bayesian_kalman_v1` rollout per ADR 018 featureFlags pattern)

**B3 Volume metric weighted compound:isolation 3:2:1** (verbatim Source 3 line 45, Source 1 line 5 + Source 2 line 615):
- **Lower body compound** (squat, deadlift, hip thrust) × **3**
- **Upper body compound** (bench, OHP, row) × **2**
- **Isolation** (curl, lateral raise, leg ext) × **1**
- Reflects metabolic disruption magnitude per movement category.

**B4 Mood scoring Linear Sum Weighted normalized** (verbatim Source 3 line 46, Source 1 line 5 + Source 2 line 616):
- **Linear Sum Weighted normalized** energy-readiness + emoji + sleep-self-report aggregate
- **LVM (latent variable model) defer v1.5** — V1 = simple weighted normalize (sum ÷ count, scale 0-1)

---

#### §9.4.3 Cluster C — Volume Landmarks + Cross-Engine Integration (~3 decisions)

**C1 Volume landmarks Hibrid lookup + regression** (verbatim Source 3 line 50, Source 1 line 5 + Source 2 line 617):
- **Israetel 11 grupuri musculare lookup baseline** + **regression personalized STRICT compound only** (data quality high)
- **Isolation graceful degradation 0.3× când compound observations <3 în window 14 zile** (anti-overfit small-N isolation noise)

**C2 Cross-engine #2 (Goal Adaptation) integration** (verbatim Source 3 line 51, Source 1 line 5 + Source 2 line 618):
- **Engine #2 phase output** (CUT/BULK/MAINTAIN/RECOMP) = **Engine #3 prior conditioning input**
- **Disagreement flag CDL** când Engine #2 phase ≠ Engine #3 inferred phase (**Invariant 5 Medical Safety protect** — disagreement = Tier 1 silent flag, **NU autonomous override**)

**C3 Cross-engine #5 (Energy Adjustment) integration** (verbatim Source 3 line 52, Source 1 line 5 + Source 2 line 619):
- **Engine #5 readiness output = pre-processing modulator Engine #3 variance σ**
- **NU linear discount** — readiness scăzut crește σ observații recent semnalând zgomot inflamație/stres/cortisol (Mensa-grade insight Gemini articulated)
- **Neutral fallback T0 cold start** (`sigma_modifier = 1.0` default until 14 zile observations)
- **Cross-ref §9.3 Engine Energy Adjustment Cluster 4 §9.3.4 Q12=C** σ variance modifier bidirectional integration.

---

#### §9.4.4 Cluster D — Schema + Output + Profile Typing + UI Tier + Hard Rules (~6 decisions)

**D1 Schema standard `nutrition_inference_metadata`** (verbatim Source 3 lines 56-64, Source 1 line 5 + Source 2 line 620):

```
nutrition_inference_metadata: {
  prior:               { mu, sigma, source: 'demographic_prior' | 'posterior_n_minus_1' },
  posterior:           { mu, sigma, observations_count: N, ci_lower, ci_upper },
  observations:        [ /* N=20 rolling window */ ],
  confidence_interval: { lower, upper, level: 0.95 }
}
```

**D2 Output structure** (verbatim Source 3 line 65, Source 1 line 5 + Source 2 line 621):
- `{deficit_likelihood, surplus_likelihood, maintenance_likelihood}` probabilities (sum = 1.0)
- **NU absolute kcal output — hard rule preserved §3.5.1 NEVER specific kcal recommendation**

**D3 Profile Typing threshold Adaptive** (verbatim Source 3 line 66, Source 1 line 5 + Source 2 line 622):
- **0.55-0.85 T1+ cu 0.70 default T0**
- **Hamming hysteresis 15%** — anti-flap profile change (don't flip-flop între phases on noise)
- **2 sesiuni consecutive 14 zile window** = qualifier explicit

**D4 UI tier** (verbatim Source 3 line 67, Source 1 line 5 + Source 2 line 623):
- **Tier 1 silent** (CDL log only) + **Tier 2 banner discret** (informational, NU action-required)
- **NU blocking modal** — Maria 65 autonomy preserve
- **Tier 3 (modal blocking opt-in) reserved for explicit Engine #2 Goal Shift trigger**, NU Engine #3 inference

**D5 Hard rule preserved §3.5.1** (verbatim Source 3 line 68, Source 1 line 5 + Source 2 line 624):
- **NEVER specific kcal output în UI**
- Bugatti differential vs MFP/Lose-It (specific kcal pseudo-precision Maria 65 confusion)

**D6 Anti-spam aliniat Engine #2** (verbatim Source 3 line 69, Source 1 line 5 + Source 2 line 625):
- **28 zile rolling cooldown** re-prompt when phase transition detected
- **Max 4 prompts/year cap** (cross-ref ADR 024 §2.8 Q8 LOCKED + §9.2.5 Cluster 5 anti-spam logic precedent)

---

#### §9.4.5 Cluster E — Validation Panel + Edge Cases (~2-3 decisions)

**E1 Validation panel Hibrid** (verbatim Source 3 line 73, Source 1 line 5 + Source 2 line 626):
- **Simulator R²>0.85 pre-Beta** (synthetic personas Hall 2008 metabolic adaptation literature — Marius advanced 4-6 săpt CUT, Maria 65 maintenance, Gigica intermediate BULK)
- **Dietician panel post-Beta v1.5 corroborate** (N validators × M users sample, anti-overconfidence Mensa-grade gate)

**E2 Edge cases Hibrid** (verbatim Source 3 line 74, Source 1 line 5 "Hibrid Passive Mode tripwire (pregnant/post-bariatric/kidney) + Special priors (>75 + ED history) + disclaimer onboarding"):
- **Passive Mode tripwire** — pregnant + post-bariatric + kidney disease = engine NU output adjustment, deferral medical care
- **Special priors set** — >75 ani + ED history (eating disorder)
- **Disclaimer onboarding** — *"Andura NU înlocuiește sfat medical"*

**E3 Convergence Guard "T2 Unlock" cross-cutting ADR 009** (verbatim Source 3 line 75, **referință ONLY** — see §9.4.6 below):
- See [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after — formula final post 5 iterations refinement.

---

#### §9.4.6 Cross-cutting — Convergence Guard "T2 Unlock" (Reference ONLY, ADR 009 amendment owns)

**Reference ONLY — NU compile own în §9.4.** [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after = single source of truth canonical pentru Convergence Guard "T2 Unlock" rule. Surfaced mid-Engine #3 spec session prin Daniel push-back fundamental seminal: *"T2 = Behavioral Validation NOT just statistical convergence"* — engine trebuie observe self-report aliniază realitate biologică CDL ÎNAINTE adaptări agresive. Rule = behavioral validation cross-cutting **all tier transitions T0→T1→T2**, NU Engine #3 Bayesian Nutrition specific.

**Formula final post 5 iterations refinement** (verbatim Source 3 lines 84-93 + Source 1 line 10, **NU repeated here NU SSOT duplication** — vezi ADR 009 §AMENDMENT 2026-05-05 birou after):
- σ² 30% reducere primary statistical convergence signal
- σ MAX(10% kcal_baseline, 200 kcal absolute floor) pragmatic noise floor
- σ < 5% body_weight proportional scale for very-low-kcal-baseline edge cases
- N ≥ 10 sesiuni minimum statistical power
- volume_adherence_vs_pain_adjusted ≥ 80% (Daniel push-back swap bar→gantere = signal metabolic VALID NU penalize)
- max 2 Pain-Aware sesiuni din ultimele 10 (anti-T2-progress-via-pain-ignoring Gigel guardrail)

**Pain-Aware definition Hybrid Spec V1** (verbatim Source 3 lines 103-106 + Source 1 line 12):
- **(a) STRICT user-triggered Pain Button only** — NU engine proactive DELOAD/Energy/Goal phase modifiers (Clean Signal rule preserve Invariant 5 Medical Safety)
- **(i) BINARY V1** — any click during session → full session `pain_aware: true`
- **Forward-compat v1.5 silent vector** `pain_trigger_set: [index_set]` ZERO schema migration

**UX wording Pain Button preserve EXACT** (verbatim Source 3 lines 108-109 + Source 1 line 12):
> "Siguranța e pe primul loc. Am ajustat restul sesiunii."

**Cross-engine integration** preserved Engine Energy Adjustment §9.3.5 Pain-Aware integration cross-ref (Engine Energy NU proactive trigger Pain-Aware — Clean Signal rule preserved).

---

#### §9.4.7 Reconsideration Triggers — Engine Bayesian Nutrition Inference V1 → V1.5 candidate

Revisit Cluster A-E LOCKED V1 → V1.5 candidate dacă:

1. **Cluster A Gaussian Conjugate Prior insufficient post-Beta** — Hierarchical Bayesian demand prevalence ≥30% useri reali cu signal hierarchical structure observed (e.g., persona-level vs user-level slope variability mismatch unresolved by single-level Conjugate). Per Source 3 ADR 022 §Reconsideration Triggers reversibility note. Trigger threshold: ≥30% Beta cohort dietician panel post-Beta corroboration <80%. Candidate: V1.5 migration Hierarchical Bayesian (multi-level slope tier-based hierarchical structure).

2. **Cluster A Strong Prior slope tier 70/30 too aggressive sau too conservative** — T0 useri reali signal mismatch sustained (T0 70/30 prior dominance prevents convergence T0→T1 within 14 zile observation buffer). Trigger threshold: ≥20% T0 useri stuck T0 >8 săpt + Profile Typing threshold NU progress 0.55-0.70. Candidate: T0 60/40 prior relax sau extend observation buffer 14 → 21 zile.

3. **Cluster B Cadence Adaptive T1+ too slow / fast post-Beta** — weekly weigh-in cadence mismatch user reality (T1+ daily weigh-ins prevalence mass adoption sau weekly fatigue dropout). Trigger threshold: ≥30% T1+ useri raportează cadence mismatch. Candidate: tier-aware cadence matrix (T1 weekly default / T2 user-toggle daily option).

4. **Cluster B Kalman R²>0.85 gate too strict** — EWMA fallback feature flag activation rate >30% V1 (Kalman 1D divergence frequency high în edge cases). Per Source 3 ADR 022 §Reconsideration Trigger 1 reversibility note. Trigger threshold: EWMA fallback rate >30% sustained ≥4 săpt post-Beta. Candidate: relax R²>0.80 gate sau add Kalman 2D extension v1.5.

5. **Cluster C Cross-engine #2 disagreement flag noise high** — false positives sustained (Engine #2 phase transitions legitimate triggering disagreement cascade unwarranted). Per Source 3 ADR 022 §Reconsideration Trigger 2. Trigger threshold: ≥15% sessions disagreement flag fired cu Engine #2 phase change <14 zile (transient transition window expected divergence). Candidate: disagreement flag suppress within transition window + escalate Tier 2 banner threshold tightening.

6. **Cluster D Profile Typing threshold drift** — 0.55-0.85 range needs tier-specific calibration post-Beta data (T0 useri stuck low threshold sau T1+ useri flap rate >5% week-over-week). Per Source 3 ADR 022 §Reconsideration Trigger 3 reversibility note. Trigger threshold: ≥5% Profile Typing flap rate sustained ≥2 săpt post-Beta. Candidate: tier-aware threshold matrix (T0 strict 0.70 default / T1+ adaptive 0.55-0.85 calibrated) sau Hamming hysteresis 15% → 20% tighten + qualifier 2 sesiuni → 3 sesiuni.

7. **Cluster E Anti-spam 28 zile cooldown user fatigue signal** — useri raportează re-prompt fatigue chiar sub cap 4/an (consistent ADR 024 §2.8 Q8 reconsideration). Per Source 3 ADR 022 §Reconsideration Trigger 4 cross-ref. Trigger threshold: ≥30% useri Settings UI reduce re-prompt frequency manual. Candidate: extend cooldown 28d → 35d rolling sau reduce cap 4 → 3/an.

8. **Cluster A4 + E1 Validation gate failure pre-Beta** — simulator R²<0.85 fails pre-Beta blocking gate. Per Source 3 ADR 022 §Reconsideration Trigger 1 verbatim. Candidate: revert EWMA fallback feature flag, defer Bayesian Kalman 1D rollout v1.5+ entire (anti-Bayesian-fakery — ship deterministic V1 only).

**Re-evaluation cadence:** post Faza 2.5 batch 4 implementation Engine Bayesian Nutrition V1 + post-Beta useri reali signal aggregate (similar §9.1.7 + §9.2.6 + §9.3.6 cadence pattern §1.8 Versioning Additive 18 luni deprecation window). Bugatti craft transparency = ship V1 cu Cluster A-E LOCKED + monitor post-Beta signal.

---

#### §9.4.8 Cross-refs Bidirectional ADR

- [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract — `evaluate(ctx) → BayesianNutritionResult` extending DimensionResult (purity preserved engine = pure function NU side effects, async-capable per DP-2)
- [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline Order LOCKED V1 — Bayesian Nutrition 4th în pipeline §42.10
- [[022-bayesian-nutrition-inference|ADR 022]] **SPEC READY V1** cross-ref Source 3 distilled (parity check ✅) — file preserved as canonical SSOT distilled (NU file flip recommend, consistent ADR 026 §9.4 SSOT Cluster A-E narrative + ADR 022 cluster-grouped detail = complementary references)
- [[017-demographic-prior-database|ADR 017]] T0 demographic prior baseline — K-NN K=10, 6 anchor personas + 44 edge cases + 450 algorithmic = 500 profiles
- [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" — cross-cutting architectural extension surfaced mid-Engine #3 (NU Engine #3 specific, owns this rule canonical)
- [[011-coach-decision-log-architecture|ADR 011]] CDL schema extension target for `nutrition_inference_metadata` + `pain_aware` + `pain_trigger_set` forward-compat v1.5
- [[../01-vision/PRODUCT_STRATEGY_SPEC_v1|PRODUCT_STRATEGY_SPEC]] §3.5.1 Strong Prior 80% input + 20% baseline calibration time -50%
- [[../04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1|COGNITIVE_ARCHITECTURE_SPEC]] 5 voices + 27 reguli arbitration — Bayesian verdict feeds REALTIME + PROJECTION voices + Triangulation F1 SUFLET
- [[ADR_PAIN_DISCOMFORT_BUTTON_v1]] Pain-Aware definition (a) STRICT user-triggered + (i) BINARY V1 cross-ref
- [[030-adapter-design-pattern|ADR 030]] D1-D5 LOCKED V1 foundation Hexagonal — Phase 1-2 orchestrator foundation `src/coach/orchestrator/` LANDED commit `5a16550` reusable post Faza 2.5 batch 4
- §9.1 Engine #1 Periodization Volume Landmarks Israetel cross-ref Cluster C1 (regression compound only Israetel baseline lookup)
- §9.2 Engine #2 Goal Adaptation phase output Cluster C2 disagreement flag CDL Invariant 5 Medical Safety protect
- §9.3 Engine Energy Adjustment σ variance modifier Cluster C3 cross-engine integration (Hook 3 bidirectional Engine #5 readiness)
- §9.5 Engine Tempo (LANDED §9.5 spec compile commit `a9b7cbd` + V1 implement commit `d82d118`) — downstream consumer nutrition signals
- §9.6 Engine Specialization (LANDED §9.6 spec compile commit `92a69fd` + V1 implement commit `4cf50ab`) — light coupling cross-engine
- §9.7 Engine Warm-up (LANDED §9.7 spec compile commit `c15ad0f` + V1 implement commit `20999fb`) — light coupling cross-engine
- §9.8 Engine Deload Protocol (LANDED §9.8 spec compile commit `d7594e7` + V1 implement commit `a6a0c87`) — Pain-Aware integration cross-cutting Convergence Guard "T2 Unlock" preserved

---

🦫 **§9.4 Engine Bayesian Nutrition Inference Module-Level Spec V1 compiled 2026-05-06 afternoon chat-5 acasă.** ZERO net new substantive decisions — aggregation only verbatim from chat strategic 2026-05-05 birou after sources (`148_HANDOVER_..._engines3-4-5_spec_sessions_CONSUMED.md` Engine #3 Bayesian section line 5 + CURRENT_STATE §RECENT 2026-05-05 birou after lines 607-627 + ADR 022 SPEC READY V1 file Cluster A-E lines 25-111 — **3-way parity check ✅ ZERO substantive divergence flagged**). ~32-35 decisions Cluster A-E cumulative (Source 3 grouped count ~25-28; Sources 1+2 granular count ~32-35 per individual sub-decisions; acceptable delta — content verbatim identical). Pre Faza 2.5 batch 4 implementation per Option A LOCKED 2026-05-06 morning chat-2. Pattern Bugatti SSOT consistent §9.1 Engine #1 Periodization compile draft (commit `cd6d9a4`) + §9.2 Engine #2 Goal Adaptation compile draft (commit `6be84f8`) + §9.3 Engine Energy Adjustment compile draft (commit `2f9aa79`). Pipeline §42.10 position 4th canonical. Convergence Guard "T2 Unlock" cross-cutting reference §9.4.6 ONLY (ADR 009 §AMENDMENT 2026-05-05 birou after owns canonical SSOT, NU §9.4 duplicate).

---

### §9.5 Engine Tempo Module-Level Spec V1

**Status:** 🟢 **SPEC READY V1** (compiled 2026-05-06 afternoon chat-6 acasă din chat strategic 2026-05-05 birou late sources). ~28-30 decisions cumulative (Cluster A-E). Pre Faza 2.5 batch 5 implementation per Option A LOCKED 2026-05-06 morning chat-2 — pipeline §42.10 sequential post Engine Bayesian Nutrition Inference V1 LANDED commit `8615ec1` (batch 4).

**Pipeline placement (per §42.10 LOCKED V1 §1.10 ADR 026):** Tempo runs sequentially **5th** position canonical. Order: `Periodization (§9.1) → Goal Adaptation (§9.2) → Energy Adjustment (§9.3) → Bayesian Nutrition (§9.4) → Tempo (§9.5) → Specialization (§9.6) → Warm-up (§9.7) → Deload (§9.8)`. **Engine numbering clarification:** [[028-engine-tempo-form-cues|ADR 028]] file naming "Engine #6 Tempo/Form Cues" = legacy chat strategic spec session ordering 2026-05-05 birou late (3-engine cluster #5+#6+#7 spec session), NU pipeline §42.10 canonical position 5th. Source 1 + Source 2 reference "Engine #6" = pipeline 5th — clarified anti-recurrence numbering ambiguity batches 6-8 references.

**Provenance chain (2-way parity check ✅):**
- Source 1 (verbatim Cluster A-E): `📤_outbox/_archive/2026-05/149_HANDOVER_2026-05-05_birou_late_engines5-6-7_spec_sessions_CONSUMED.md` Engine #6 Tempo section (lines 34-48, 14 substantive bullet decisions)
- Source 2 (cristalizate parity check): `00-index/CURRENT_STATE.md` §RECENT entry "2026-05-05 birou late" Engine #6 Tempo partition (lines 547-565, 14 bullets identical content vs Source 1). **Verbatim parity check Source 1 ↔ Source 2: ✅ ZERO substantive divergence flagged**.
- Source 3 NU disponibil: [[028-engine-tempo-form-cues|ADR 028]] = 🔵 SPEC REFERENCE post-flip `dccda1f` 2026-05-06 evening chat-9 (precedent §9.3 Energy [[027-engine-energy-adjustment|ADR 027]] stub flip pattern, NU §9.4 Bayesian [[022-bayesian-nutrition-inference|ADR 022]] SPEC READY V1 case). ADR 028 redirects la §9.5 SSOT canonical.

**Cross-refs:** [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract (purity preserved engine = pure function NU side effects) | [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline Order LOCKED V1 (Tempo 5th în pipeline §42.10) | [[028-engine-tempo-form-cues|ADR 028]] 🔵 SPEC REFERENCE post-flip `dccda1f` (redirects la §9.5 SSOT canonical) | [[024-goal-driven-program-templates|ADR 024]] light coupling modifiers post-template×phase | [[022-bayesian-nutrition-inference|ADR 022]] cross-engine Hook recovery state | [[009-calibration-tiers|ADR 009]] tier-aware T0 OFF / T1+ profile-typing mind-muscle Q5=C | §9.1 Periodization Constraint Object frozen Hook 1 read-only | §9.2 Goal Adaptation phase context cross-ref | §9.3 Energy Adjustment readiness state Hook (Energy DOWN → slow eccentric universal Q13=B) | §9.4 Bayesian Nutrition Inference cross-engine recovery state Hook

---

#### §9.5.1 Cluster A — I/O Contract & Pipeline Placement (~5 decisions)

**Pure function signature** per ADR 018 §2 Standardized Dimension Contract:

```
tempoEngine.evaluate(ctx) → TempoResult extends DimensionResult
```

**Pipeline placement LOCKED V1 (per §42.10):** Tempo runs **sequentially 5th** post Bayesian Nutrition (§9.4). Legacy "Engine #6" naming în [[028-engine-tempo-form-cues|ADR 028]] = chat strategic spec session ordering NU pipeline canonical position. Pipeline §42.10 canonical: `Periodization → Goal Adaptation → Energy → Bayesian → Tempo → Specialization → Warm-up → Deload`.

**Input contract (consumed Hook 1 read-only):** Constraint Object frozen propagated upstream Periodization §9.1 Cluster 5 + Goal Adaptation §9.2 + Energy §9.3 + Bayesian §9.4 cross-engine hooks. NU mutate input — anti-cascade safeguard preserved.

**Output blueprint emit:**
1. `tempo_prescription` — pre-set intro + reactive user-initiated cue per Cluster B Q1=C
2. `form_cue` — text cue per movement category (compound/isolation) cu RO native + persona-aware tone Cluster D Q18=D
3. `mind_muscle_active` — boolean tier-aware (T0 OFF / T1+ profile-typing) Cluster C Q5=C
4. `cue_delivery_timing` — pre-set sau post-set ONLY (NU intra-set distraction) Cluster B Q8=D
5. `signals` — human-readable signal IDs (e.g. `'tempo_form_conservative_amplification_high_intensity'`, `'mind_muscle_unlock_deload'`, `'energy_down_slow_eccentric_universal'`)

**Constraint:** ZERO side effects (engine pure per ADR 018 §2). Side effects (CDL writes ADR 011, telemetry, Firestore Tier 2 sync) = orchestrator layer separate per ADR 030 D2 thin adapter scope LOCKED V1.

**Engine purity preserved:** Tempo reads upstream Constraint Objects Hook 1 read-only, **NU override** Periodization phase NU Goal Adaptation phase NU Energy adjustment NU Bayesian inference per §1.10 Pipeline Order LOCKED V1 — anti-cascade safeguard. Light coupling modifiers post-template×phase per [[028-engine-tempo-form-cues|ADR 028]] cross-ref.

---

#### §9.5.2 Cluster B — Tempo Prescription Logic + Cue Delivery Strategy (~6 decisions)

**B1 Hibrid pre-set intro + reactive user-initiated cue** (Source 1 line 35 verbatim, Q1=C):
- **Pre-set intro** = engine surfaces tempo notation + form cue ÎNAINTE of set (e.g., "Tempo 2-1-2-0, focus on slow eccentric")
- **Reactive user-initiated cue** = user taps 💡 indicator mid-rest pentru elaboration (NU intra-set distraction Q8=D)
- **Hibrid Q1=C:** combine both modes — engine emite pre-set; user opt-in reactive expansion

**B2 Pattern base library + top-30 compound overrides Bugatti depth** (Source 1 line 35 verbatim, Q2=C):
- **Pattern base library** = generic cues per movement category (compound/isolation taxonomy)
- **Top-30 compound overrides** = movement-specific cues craft Bugatti depth (squat / deadlift / bench / OHP / row / hip thrust / etc.)
- **Q2=C Hibrid:** base library covers majority; top-30 compound overrides craft signature

**B3 Q33 §45.5 elaboration persona-aware notation** (Source 1 line 36 verbatim, Q3 Daniel push-back Maria zero notation strict):
- **Maria verbal:** "coboară lent, două secunde" (NU "2-X-2-X" notation — zero numeric strict)
- **Gigica hibrid:** "tempo 2-X-2-X (coboară 2s)" (verbal + notation)
- **Marius numeric pure:** "Tempo 2-1-2-0" (notation strict)
- **Daniel push-back fundamental:** Maria zero notation = anti-friction Maria 65 cognitive load (consistent SUFLET F2 alignment)

**B4 User self-report toggle V1 RIR mismatch silent telemetry** (Source 1 line 36 verbatim, Q4=A):
- **User self-report toggle** = "form breakdown" report option mid-set sau post-set
- **Q4=A V1:** RIR mismatch (user report form breakdown vs RIR Matrix expected) = silent telemetry only CDL audit trail
- **NU active trigger V1** — engine NU adjusts session current. V1.5+ candidate: trigger Energy DOWN sau Tempo conservative escalation

**B6 Tap-to-expand 💡 indicator Bugatti minimal-friction** (Source 1 line 37 verbatim, Q6=D):
- **💡 indicator** = engine surfaces minimal pre-set; tap expand for full cue elaboration
- **Q6=D Bugatti minimal-friction:** anti-cognitive-overload pattern (consistent ADR 025 graceful degradation)

**B8 Pre-set + post-set timing NU intra-set distraction** (Source 1 line 37 verbatim, Q8=D):
- **Cue delivery timing** = pre-set (intro) + post-set (RIR feedback / form check)
- **NU intra-set distraction** Q8=D — preserve user concentration during execution
- **Mid-rest tap-to-expand** = user-initiated reactive elaboration (B1 Hibrid Q1=C consistent)

---

#### §9.5.3 Cluster C — Mind-Muscle Connection + Adaptive Frequency (~4 decisions)

**C5 Mind-muscle tier-aware T0 OFF / T1+ profile-typing** (Source 1 line 37 verbatim, Q5=C):
- **T0 cold start:** mind-muscle cues OFF (calibration window noise high, anti-overfit early signals)
- **T1+ established:** profile-typing-aware activation (Profile Typing data sufficient to personalize mind-muscle cue style per user response history)
- **Cross-ref:** [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after Convergence Guard T0 → T1 progression gate

**C7 Adaptive frequency reduces post-acquisition** (Source 1 line 37 verbatim, Q7=D + Q9=D):
- **Q7=D adaptive frequency:** cue surface frequency reduces post-acquisition
- **Q9=D dual signal:** explicit "știu" user toggle (acquired) + implicit N=10 sessions consecutive cu form breakdown < threshold
- **Acquired = engine reduces cue surface** (anti-paternalism preserve user cognitive bandwidth)

**C15 Tier-aware depth** (Source 1 line 38 verbatim, Q15=B):
- **T0 minimal depth** (cue text-only basic)
- **T1+ richer depth** (cue + rationale + suggested fix)
- **T2+ adaptive depth** (cue + persona-aware tone + ML cue selection v1.5+ deferred)

**C17 Suppression hard T0/T1 + soft auto-retire T2+** (Source 1 line 38 verbatim, Q17=C):
- **T0/T1 hard suppression** = user toggle "știu" (Q9 explicit) → cue NU surface for movement
- **T2+ soft auto-retire** = N=10 sessions implicit (Q9) → cue auto-retire pentru movement (user can re-activate manual)

---

#### §9.5.4 Cluster D — Cross-Engine Integration (~5 decisions)

**D11 Periodization high intensity → form-conservative amplification** (Source 1 line 38 verbatim, Q11=B):
- **Periodization phase = PEAK or LOAD+ (high_intensity == true)** → Tempo emite form-conservative amplification (slower eccentric, controlled concentric, safety emphasis)
- **Anti-cascade preserve §1.10 Pipeline Order:** Tempo NU override Periodization phase, only modulates form cue style intensity-aware

**D12 Deload week → mind-muscle unlock** (Source 1 line 38 verbatim, Q12=D):
- **Periodization phase = DELOAD (W4)** → Tempo unlock mind-muscle cues (recovery week, lower load = bandwidth for technique focus)
- **Q12=D:** mind-muscle activation override tier-aware default during DELOAD week

**D13 Energy DOWN → slow eccentric universal NU ROM partial** (Source 1 line 38 verbatim, Q13=B Gemini self-flagged ROM partial REJECT corect):
- **Energy DOWN signal** (per §9.3 Engine Energy Adjustment) → Tempo emite slow eccentric universal cue
- **NU ROM partial cue** (Q13=B Daniel push-back Gemini self-flagged: ROM partial = injury risk amplification, REJECT corect)
- **Slow eccentric universal** = compatible cu MRV invariant 1 immutable Q8=A §9.3 (NU sub-Floor sub-MEV)

**D14 RIR Matrix form breakdown user toggle → +1 auto-bump next set** (Source 1 line 38 verbatim, Q14=B):
- **User toggles "form breakdown"** mid-set → Tempo signals downstream (orchestrator-level) auto-bump RIR target +1 next set
- **Anti-cascade:** Tempo emite signal, orchestrator layer applies (NU Tempo direct mutation per ADR 030 D2 thin scope)

**D18 Persona-aware tone** (Source 1 line 38 verbatim, Q18=D):
- **Maria rationale-first** ("De ce coboară lent? Pentru a controla încărcarea articulară.")
- **Gigica suggestion** ("Sugerez tempo 2-1-2-0 pentru hipertrofie.")
- **Marius imperative** ("Tempo 2-1-2-0. Execute.")
- **Tone selection** = persona resolved per ADR 017 demographic prior + Profile Typing tier post-T1+

---

#### §9.5.5 Cluster E — Validation + GIF Library Deferred + Bayesian Future (~4 decisions)

**E16 GIF embedded REJECTED pre-Beta** (Source 1 line 38 verbatim + line 47 push-back valid Daniel + Claude):
- **Q16 GIF embedded REJECTED** (Claude push-back valid mid-flight chat strategic):
  - **Storage offline-first PWA risk:** ~3MB per GIF × 30+ compound movements = ~100MB+ storage offline (anti-PWA budget)
  - **Copyright source unclear:** unsourced GIF library = legal risk pre-Beta
  - **Gigel test fail:** mid-set distraction (cue intra-set NU pre-set) — anti Q8=D
- **V1 = text-only cue** (NU GIF) + **defer link extern v1.5+** (post-Beta cohort feedback validate need first)

**E18 WhyEngine integration silent + "De ce ăsta?"** (Source 1 line 38 verbatim, Q18 cluster D):
- **WhyEngine silent integration** = engine logs cue rationale CDL audit trail (NU UI surface default)
- **"De ce ăsta?"** = user-initiated reactive transparency (tap rationale link) — consistent SUFLET F4 user agency

**E20 Bayesian latent state v1.5 evolution** (Source 1 line 38 verbatim, Q20=D ecosystem-wide):
- **V1.5 Bayesian inference migration** ecosystem-wide (Engine #3 Bayesian + Engine Energy + Engine Tempo + Engine Specialization consistent Q20=D)
- **V1 stays categorical** (cluster table mapping) — Bayesian latent state evolution post-Beta data validates tractable inference scope (anti-premature-optimization)

**E-Validation Hibrid simulator + Beta cohort 50 testers** (consistent §9.4 + §9.6 Q19=B precedent):
- **Synthetic only INCONSISTENT engines #1-#6 acceptable** Q19=B Daniel pivot accepted (chat strategic Engine #7 Specialization push-back) — apply consistent Tempo
- **Hibrid simulator + Beta cohort 50 testers ground truth** post-Beta corroboration (anti-overconfidence Mensa-grade)

---

#### §9.5.6 Reconsideration Triggers — Engine Tempo V1 → V1.5 candidate

Revisit Cluster A-E LOCKED V1 → V1.5 candidate dacă:

1. **Cluster B Tempo persona-aware notation friction signal** — Maria verbal-only zero notation strict insufficient post-Beta useri reali (e.g., Maria persona prefers numeric clarity contrary to anti-friction expectation). Trigger threshold: ≥20% Maria-tier useri raportează "verbal cue ambiguous" sau toggle UI to numeric. Candidate: Maria adaptive tier-aware (Maria-Beginner verbal / Maria-Intermediate hibrid) per Profile Typing data.

2. **Cluster B RIR mismatch silent telemetry insufficient** — V1 silent telemetry only NU active trigger; post-Beta data shows form breakdown signal correlates strongly cu Energy DOWN (anti-cascade missed signal). Trigger threshold: ≥15% sessions form breakdown reports cu Energy NEUTRAL/UP within 48h cascade injury risk. Candidate: V1.5 active trigger (form breakdown → Energy DOWN escalation Hook §9.3).

3. **Cluster C Mind-muscle T0 OFF too conservative** — T0 useri raportează engagement low cu basic cues only (mind-muscle activation post-Beta useri reali signal earlier maturity). Trigger threshold: ≥30% T0 useri stuck T0 >8 săpt cu engagement signal low. Candidate: T0 hibrid mind-muscle minimal cues (NU OFF) cu profile-typing escalation.

4. **Cluster C Adaptive frequency N=10 implicit acquisition threshold drift** — N=10 too aggressive (advanced useri) sau too conservative (newbie). Per Q9=D dual signal explicit + implicit. Trigger threshold: ≥20% useri Settings UI override implicit N=10 manually. Candidate: tier-aware N (Beginner N=15 / Intermediate N=10 / Advanced N=5).

5. **Cluster D Hook coupling tension cu Bayesian disagreement signal** — Tempo form-conservative amplification cu Bayesian disagreement flag CDL §9.4.3 C2 = double-conservatism cumulative friction. Trigger threshold: ≥10% sessions Tempo amplified PLUS Bayesian disagreement Tier 1 flag concurrent. Candidate: cross-engine ceiling rule §9.2.6 Cluster 4 Trigger 4 candidate adoption Tempo (anti-degenerate cumulative reduction).

6. **Cluster E GIF library demand surfaced Beta cohort feedback** — V1 text-only sufficient sau Beta cohort feedback validates GIF need. Per Q16 push-back chat strategic + Source 1 line 47 deferred V1.5 candidate. Trigger threshold: ≥30% Beta cohort raportează "text cue NU sufficient pentru tehnică complexă". Candidate: V1.5 GIF library opt-in (storage budget evaluat + copyright sourced library standalone).

7. **Cluster E ML cue selection per user response history** — V1 static cue table Cluster B2; post-Beta sufficient signal pentru ML personalization. Trigger threshold: ≥1000 sesiuni Beta cohort cu form breakdown + cue acceptance/rejection telemetry CDL. Candidate: V1.5 ML cue ranker per Profile Typing tier T2+.

8. **Cluster E Bayesian latent state v1.5 ecosystem timing** — Q20=D coordinated multi-engine release timing per Engine #3 Bayesian Nutrition R²>0.85 validation gate hold ≥6 luni post-Beta + ≥1000 sesiuni real data (cross-ref §9.4.7 Trigger 7 timing). Candidate: V1.5 migration coordinated cu Bayesian Nutrition + Energy + Specialization consistent.

**Re-evaluation cadence:** post Faza 2.5 batch 5 implementation Engine Tempo V1 + post-Beta useri reali signal aggregate (similar §9.1.7 + §9.2.6 + §9.3.6 + §9.4.7 cadence pattern §1.8 Versioning Additive 18 luni deprecation window). Bugatti craft transparency = ship V1 cu Cluster A-E LOCKED + monitor post-Beta signal.

---

#### §9.5.7 Cross-refs Bidirectional ADR

- [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract — `evaluate(ctx) → TempoResult` extending DimensionResult (purity preserved engine = pure function NU side effects, async-capable per DP-2)
- [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline Order LOCKED V1 — Tempo 5th în pipeline §42.10 (NU "Engine #6" naming legacy)
- [[028-engine-tempo-form-cues|ADR 028]] 🔵 **SPEC REFERENCE post-flip `dccda1f` 2026-05-06 evening chat-9** — file flip pattern ADR 027 precedent §9.3 Energy. ADR 028 redirects la §9.5 SSOT canonical.
- [[024-goal-driven-program-templates|ADR 024]] light coupling modifiers post-template×phase (Q5=C cross-ref Cluster D)
- [[022-bayesian-nutrition-inference|ADR 022]] cross-engine Hook recovery state (Q20=D Bayesian latent state v1.5 ecosystem-wide alignment)
- [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" — tier-aware T0 OFF / T1+ profile-typing mind-muscle Q5=C foundation
- [[017-demographic-prior-database|ADR 017]] persona resolution Maria/Gigica/Marius cross-ref Cluster D Q18=D persona-aware tone selection
- [[025-andura-gandeste-pentru-user|ADR 025]] graceful degradation engine pre-fills default — referenced Q6=D Bugatti minimal-friction tap-to-expand 💡 indicator
- [[030-adapter-design-pattern|ADR 030]] D1-D5 LOCKED V1 foundation Hexagonal — Phase 1-2 orchestrator foundation `src/coach/orchestrator/` LANDED commit `5a16550` reusable post Faza 2.5 batch 5
- [[ADR_PAIN_DISCOMFORT_BUTTON_v1]] Pain-Aware integration cross-cutting Convergence Guard "T2 Unlock" preserved §9.4.6 reference (light coupling — Tempo NU proactive Pain-Aware trigger Clean Signal rule)
- §9.1 Engine #1 Periodization Constraint Object frozen Hook 1 read-only (consume input frozen)
- §9.2 Engine #2 Goal Adaptation phase context cross-ref Cluster D modifiers post-template×phase
- §9.3 Engine Energy Adjustment readiness state Hook D13 (Energy DOWN → slow eccentric universal Q13=B)
- §9.4 Engine Bayesian Nutrition Inference cross-engine recovery state Hook Cluster D (light coupling forward)
- §9.6 Engine Specialization (LANDED §9.6 spec compile commit `92a69fd` + V1 implement commit `4cf50ab`) — light coupling cross-engine modifiers post-template×phase
- §9.7 Engine Warm-up (LANDED §9.7 spec compile commit `c15ad0f` + V1 implement commit `20999fb`) — light coupling cross-engine
- §9.8 Engine Deload Protocol (LANDED §9.8 spec compile commit `d7594e7` + V1 implement commit `a6a0c87`) — Pain-Aware integration cross-cutting Convergence Guard "T2 Unlock" preserved

---

🦫 **§9.5 Engine Tempo Module-Level Spec V1 compiled 2026-05-06 afternoon chat-6 acasă.** ZERO net new substantive decisions — aggregation only verbatim from chat strategic 2026-05-05 birou late sources (`149_HANDOVER_..._engines5-6-7_spec_sessions_CONSUMED.md` Engine #6 Tempo section lines 34-48 + CURRENT_STATE §RECENT 2026-05-05 birou late lines 547-565 — **2-way parity check ✅ ZERO substantive divergence flagged**). ~28-30 decisions Cluster A-E cumulative. Pre Faza 2.5 batch 5 implementation per Option A LOCKED 2026-05-06 morning chat-2. Pattern Bugatti SSOT consistent §9.1 Engine #1 Periodization (`cd6d9a4`) + §9.2 Goal Adaptation (`6be84f8`) + §9.3 Energy Adjustment (`2f9aa79`) + §9.4 Bayesian Nutrition Inference (`685fdd4`). Pipeline §42.10 position 5th canonical (NU "Engine #6" naming legacy ADR 028 chat strategic spec session ordering). Source 3 ADR 028 🔵 SPEC REFERENCE post-flip `dccda1f` 2026-05-06 evening chat-9 — redirects la §9.5 SSOT canonical.

---

### §9.6 Engine Specialization Module-Level Spec V1

**Status:** 🟢 **SPEC READY V1** (compiled 2026-05-06 afternoon chat-6 acasă din chat strategic 2026-05-05 birou late sources). ~28-30 decisions cumulative (Cluster A-E). Pre Faza 2.5 batch 6 implementation per Option A LOCKED 2026-05-06 morning chat-2 — pipeline §42.10 sequential post Engine Tempo V1 LANDED commit `d82d118` (batch 5).

**Pipeline placement (per §42.10 LOCKED V1 §1.10 ADR 026):** Specialization runs sequentially **6th** position canonical. Order: `Periodization (§9.1) → Goal Adaptation (§9.2) → Energy Adjustment (§9.3) → Bayesian Nutrition (§9.4) → Tempo (§9.5) → Specialization (§9.6) → Warm-up (§9.7) → Deload (§9.8)`. **Engine numbering clarification:** [[029-engine-specialization|ADR 029]] file naming "Engine #7 Specialization" = legacy chat strategic spec session ordering 2026-05-05 birou late (3-engine cluster #5+#6+#7 spec session, ULTIMUL prescriptive engine §36.100 100% milestone), NU pipeline §42.10 canonical position 6th. Source 1 + Source 2 reference "Engine #7" = pipeline 6th — clarified anti-recurrence numbering ambiguity batches 7-8 references.

**Provenance chain (2-way parity check ✅):**
- Source 1 (verbatim Cluster A-E): `📤_outbox/_archive/2026-05/149_HANDOVER_2026-05-05_birou_late_engines5-6-7_spec_sessions_CONSUMED.md` Engine #7 Specialization section (lines 50-72, 22 substantive bullet decisions Q1-Q20 + cross-cutting note).
- Source 2 (cristalizate parity check): `00-index/CURRENT_STATE.md` §RECENT entry "2026-05-05 birou late" Engine #7 Specialization partition (lines 557-579, 22 bullets identical content vs Source 1). **Verbatim parity check Source 1 ↔ Source 2: ✅ ZERO substantive divergence flagged**.
- Source 3 NU disponibil: [[029-engine-specialization|ADR 029]] = 🔵 SPEC REFERENCE post-flip `dccda1f` 2026-05-06 evening chat-9 (precedent §9.3 Energy [[027-engine-energy-adjustment|ADR 027]] + §9.5 Tempo [[028-engine-tempo-form-cues|ADR 028]] stub flip pattern, NU §9.4 Bayesian [[022-bayesian-nutrition-inference|ADR 022]] SPEC READY V1 case). ADR 029 redirects la §9.6 SSOT canonical.

**Cross-refs:** [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract (purity preserved engine = pure function NU side effects) | [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline Order LOCKED V1 (Specialization 6th în pipeline §42.10) | [[029-engine-specialization|ADR 029]] 🔵 SPEC REFERENCE post-flip `dccda1f` (redirects la §9.6 SSOT canonical) | [[009-calibration-tiers|ADR 009]] tier-aware Marius Advanced gating Q5=D (T2+ Convergence Guard cross-cutting referenced ONLY) | §9.1 Periodization Engine #1 PARALLEL modifier NU REPLACE Q11=B (skeleton preserved, layer extra volume/frequency on accumulation phases) | §9.2 Goal Adaptation phase context Cut DISABLE Q5=D dual safety gate Q13=A | §9.3 Energy Adjustment readiness state cross-engine context (Engine #5 consistent pattern) | §9.4 Bayesian Nutrition Inference Q20=D Bayesian latent state v1.5 ecosystem-wide alignment | §9.5 Tempo light coupling cross-engine modifiers (PARALLEL overlay sibling) | §9.7 Warm-up (LANDED §9.7 spec compile commit `c15ad0f` + V1 implement commit `20999fb`) | §9.8 Deload Protocol standard week 4 preserved non-negotiable Q12=A (Engine #4 Hook) | [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.84 Gap #1 (`weaknessDetector.js` orfan reuse pattern) + §45.3 Q12 LOCKED (Marius Advanced AND lagging gating strict) | [[../04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1|SCENARIOS_SIMULATOR_DESIGN_V1]] (pipeline.js orchestrator skeleton — eligible gate logic Q5=D Bulk/Recomp ONLY wired)

---

#### §9.6.1 Cluster A — I/O Contract & Pipeline Placement (~5 decisions)

**Pure function signature** per ADR 018 §2 Standardized Dimension Contract:

```
specializationEngine.evaluate(ctx) → SpecializationResult extends DimensionResult
```

**Pipeline placement LOCKED V1 (per §42.10):** Specialization runs **sequentially 6th** post Tempo (§9.5). Legacy "Engine #7" naming în [[029-engine-specialization|ADR 029]] = chat strategic spec session ordering NU pipeline canonical position. Pipeline §42.10 canonical: `Periodization → Goal Adaptation → Energy → Bayesian → Tempo → Specialization → Warm-up → Deload`.

**Activation gating LOCKED V1 strict (Q5=D + Q12 §45.3 LOCKED + Q13=A dual safety gate):**
- **Marius Advanced AND lagging detected** via `weaknessDetector.js` (cross-cutting Profile Typing tier T1+ established + 1RM ratio<0.8 detection signal Cluster B Q1=C)
- **Phase = Bulk OR Recomp ONLY** — Cut DISABLE per Q5=D (deficit + extra volume = recovery risk universal). Q13=A consistency dual safety gate Q5+Q13.
- **Q12 §45.3 LOCKED preserved strict:** Maria 65 + Gigica 35 personas = NU eligible V1 (engine GATE_BLOCKED for non-Marius personas). Anti-paternalism Maria/Gigica tier — specialization advanced concept anti-friction cognitive load early personas.
- **Mesocycle window:** 4-week mesocycle match Q10 §45.2 (Q6=A simplicity V1 — adaptive duration defer v1.5).

**Input contract (consumed Hook 1 read-only):** Constraint Object frozen propagated upstream Periodization §9.1 Cluster 5 + Goal Adaptation §9.2 + Energy §9.3 + Bayesian §9.4 + Tempo §9.5 cross-engine hooks. NU mutate input — anti-cascade safeguard preserved §1.10.

**Output blueprint emit:**
1. `specialization_active` — boolean PARALLEL modifier engaged (engine eligible AND user accepted proposal Q15=B)
2. `weakness_target` — top-1 discipline weak group identified (movement category + magnitude signal Cluster B)
3. `volume_frequency_modifier` — extra volume/frequency on accumulation phases targeting weakness (Cluster C application strategy)
4. `proposal_state` — propose user accept/reject pending (Q15=B Marius decision retained, anti-paternalism — NU auto-activate silent)
5. `cooldown_state` — N=12 weeks same group anti-obsession + 12 weeks hard reject anti-nagging (Cluster B Q10=B + Q16=A)
6. `signals` — human-readable signal IDs (e.g. `'specialization_eligible_marius_advanced_lagging'`, `'specialization_gate_blocked_cut_phase_q5_d'`, `'specialization_proposal_pending_user_accept_q15_b'`)

**Constraint:** ZERO side effects (engine pure per ADR 018 §2). Side effects (CDL writes ADR 011, telemetry, Firestore Tier 2 sync) = orchestrator layer separate per ADR 030 D2 thin adapter scope LOCKED V1.

**Engine purity preserved:** Specialization reads upstream Constraint Objects Hook 1 read-only, **NU override** Periodization phase NU Goal Adaptation phase NU Energy adjustment NU Bayesian inference NU Tempo prescription per §1.10 Pipeline Order LOCKED V1 — anti-cascade safeguard. PARALLEL modifier Q11=B = layer extra volume/frequency on accumulation phases Engine #1 Periodization NU REPLACE skeleton.

---

#### §9.6.2 Cluster B — Detection Logic + Reconciliation + Cooldown (~7 decisions)

**B1 Hibrid 1RM ratio<0.8 weaknessDetector reuse + visual/photo subjective override** (Source 1 line 51 verbatim, Q1=C SUFLET_ANDURA Daniel pattern dual-source):
- **`weaknessDetector.js` reuse** (zero new code engine logic per §36.84 Gap #1) — primary signal 1RM ratio<0.8 vs reference distribution per movement category (chest/back/legs/shoulders/arms). Cross-cutting Profile Typing tier T1+ established gate (anti-noise T0 calibration window).
- **Visual/photo subjective override** = user-initiated reactive secondary signal Bugatti craft transparency. SUFLET_ANDURA F4 user agency — user can flag weak group via UI even if detector NU surfaced (e.g., aesthetic concern, sport-specific deficit).
- **Q1=C dual-source:** combine quantitative (1RM ratio) + qualitative (user override) — engine resolves consensus prefer user override când conflict (anti-paternalism F4).

**B2 Consensus last-12-sessions + lifetime aggregate** (Source 1 line 52 verbatim, Q2=C anti-noise volatil):
- **Last-12-sessions window** = recent signal anti-noise weekly volatility (single bad session NU triggers specialization)
- **Lifetime aggregate** = long-term signal robust trend (multi-mesocycle pattern recognition)
- **Q2=C consensus:** both signals required convergent (recent + lifetime aligned) — anti-flap protection. Single-window divergence = signal flagged unstable, defer detection N+1 mesocycle.

**B3 Top-1 discipline V1** (Source 1 line 53 verbatim, Q3=A simplicity V1):
- **Top-1 weak group** = engine selects single highest-magnitude lagging muscle category. Top-N parallel multi-weakness defer v1.5 (§9.6.6 Reconsideration Trigger 4 candidate post-Beta).
- **Rationale:** anti-cognitive-overload Marius Advanced cohort (focus discipline matters more than coverage breadth V1) + simplicity SCENARIOS_SIMULATOR pruning cap (Q3=A)

**B4 Hibrid reconciliere engine objective + user adjusts both stored CDL** (Source 1 line 54 verbatim, Q4=C Bugatti craft transparency):
- **Engine objective signal** = quantitative 1RM ratio<0.8 + last-12-sessions consensus aggregate
- **User adjusts** = user can override engine target (different weak group preference)
- **Both stored CDL audit trail** = transparency Bugatti craft (engine recommendation + user override BOTH logged, NU silent override engine)
- **Q4=C reconciliere:** user agency F4 wins on conflict, engine signal preserved CDL pentru future analytics (post-Beta data validate engine accuracy vs user preference)

**B5 Cooldown N=12 weeks same group anti-obsession** (Source 1 line 60 verbatim, Q10=B):
- **N=12 weeks cooldown** post-specialization-block exit (4 weeks ON + 12 weeks cooldown = ~16 weeks cycle minimum same group)
- **Anti-obsession protection** = preserve programming variety, prevent overfocus single muscle group long-term injury risk
- **Cross-cutting Engine #4 Deload** standard week 4 preserved non-negotiable (Q12=A) — specialization layered ON top deload schedule, NU replace

**B6 Hard reject 12 weeks cooldown anti-nagging** (Source 1 line 63 verbatim, Q16=A match Q10):
- **User rejects proposal** → engine NU re-prompts same group for 12 weeks (match Q10 cooldown)
- **Anti-nagging UX** = respect user decision F4 autonomy, NU repeat-propose anti-friction
- **Q16=A consistency** with Q10=B cooldown duration — uniform 12-week protection regardless of acceptance/rejection path

**B7 Proposal mechanism (Q15=B propose user accept/reject)**:
- **Engine proposes** specialization activation cu rationale (weak group + magnitude + expected modifier scope) — Marius decision retained
- **User accept/reject** binary action — NU auto-activate silent (anti-paternalism F4)
- **Q15=B Marius decision retained:** engine surfaces; user owns activation. V1 conservative — Q15 tier-aware T2+ auto-activate defer v1.5 (§9.6.6 Reconsideration Trigger 1 candidate post-Beta confidence threshold validate)

---

#### §9.6.3 Cluster C — Application Strategy + Volume/Frequency + Exit (~5 decisions)

**C1 Hibrid Volume + Frequency under MRV §42.9 invariant 1** (Source 1 line 56 verbatim, Q7=C):
- **Volume modifier** = extra sets per week target weak group (e.g., +30% volume on accumulation phases)
- **Frequency modifier** = additional weekly session(s) targeting weak group (e.g., 3x → 4x frequency)
- **Hibrid V+F** = both layered concurrent (NU exclusive choice) — combinatorial recovery stimulus signal
- **MRV §42.9 invariant 1 cap immutable** = total weekly volume per muscle ≤ Maximum Recoverable Volume Israetel canonical literature. Specialization NU exceeds MRV — anti-injury risk universal. Q7=C invariant respect strict.

**C2 Partial -25% reduction other groups maintenance** (Source 1 line 57 verbatim, Q8=B):
- **Other groups (non-target)** = reduce volume -25% (maintenance dose only, NU full programming)
- **Rationale:** redirect recovery bandwidth toward weakness target (zero-sum recovery budget biological constraint)
- **Maintenance dose** = preserve baseline strength/hypertrophy (anti-detraining), NU growth stimulus
- **Q8=B partial reduction** vs full elimination — preserve programming continuity (anti-shock skeleton Engine #1 Periodization preserved Q11=B PARALLEL modifier)

**C3 Fixed 4 weeks exit** (Source 1 line 58 verbatim, Q9=A simplicity V1):
- **Fixed 4-week mesocycle window** = match Q6=A 4-week mesocycle match Q10 §45.2
- **Adaptive early exit non-responders** defer v1.5 (§9.6.6 Reconsideration Trigger 3 candidate post-Beta data validate non-response signal threshold)
- **Q9=A simplicity V1:** deterministic exit anti-complexity early-stage product. Fixed window predictable user expectation.

**C4 "Bloc focus [Grupă]" Bugatti craft RO terminology** (Source 1 line 66 verbatim, Q17=C):
- **UI label terminology** = "Bloc focus [Grupă musculară]" (e.g., "Bloc focus Spate", "Bloc focus Picioare")
- **Bugatti craft signature** = Romanian native terminology, NU "Specialization Block" calque Englez
- **Q17=C RO native:** anti-friction Maria/Gigica accessibility (deși engine GATE_BLOCKED non-Marius — UI consistency nonetheless), Marius Advanced cohort RO native preferred

**C5 Volume/Frequency modifier targeting accumulation phases ONLY** (per Q11=B PARALLEL modifier Engine #1 Periodization):
- **Accumulation phases only** = Periodization phase = ACCUMULATION OR LOAD (NU PEAK NU DELOAD)
- **PEAK phase** = high intensity emphasis, specialization extra volume incompatible cu peaking goal (anti-cascade preserve §1.10)
- **DELOAD phase** = recovery week, specialization layered OFF (Engine #4 standard deload week 4 preserved non-negotiable Q12=A)
- **Anti-cascade preserve §1.10:** Specialization NU overrides Periodization phase, only modulates volume/frequency layered on eligible phases

---

#### §9.6.4 Cluster D — Cross-Engine Integration (~5 decisions)

**D1 PARALLEL modifier Engine #1 Periodization NU REPLACE** (Source 1 line 60 verbatim, Q11=B):
- **PARALLEL modifier semantics** = layer extra volume/frequency on accumulation phases preserving Periodization skeleton Engine #1 (§9.1 Cluster 1-5 mesocycle phases + Volume Landmarks MEV/MAV/MRV + Linear Block macrocycle 3-meso + cross-engine hooks)
- **NU REPLACE** = Periodization NU overridden — Engine #1 phase + intensity corridor + volume target preserved canonical
- **Anti-cascade preserve §1.10 Pipeline Order:** Specialization (6th) NU overrides Periodization (1st). Light coupling additive only.

**D2 Engine #4 Deload standard week 4 preserved non-negotiable** (Source 1 line 61 verbatim, Q12=A):
- **Standard deload week 4** preserved despite specialization activation — Engine #4 Deload Protocol (§9.8 forward) owns deload structure Hook 2 §9.1 cross-ref
- **Specialization layered OFF during deload** = volume/frequency modifier suspended week 4 (recovery integrity protected)
- **Q12=A non-negotiable** = deload safety invariant cross-cutting anti-overtraining; specialization NU bypasses

**D3 Cut DISABLE Q5+Q13 dual safety gate** (Source 1 lines 54+62 verbatim, Q5=D + Q13=A):
- **Engine #2 Goal Adaptation phase = CUT** → specialization GATE_BLOCKED entire engine output (proposal_state = ineligible_cut_phase signal)
- **Q5=D dual safety:** deficit nutritional + extra volume specialization = recovery risk universal anti-pattern
- **Q13=A consistency:** Q5+Q13 redundant safety gate (defense-in-depth Layer 5 Medical Safety §42.9 invariant 5 cross-cut)

**D4 Injury weak group zone → auto-disable Safety Override** (Source 1 line 63 verbatim, Q14=A):
- **`PainButton` signal injury detected** weak group muscle/joint → specialization auto-disabled engine (proposal_state = injury_safety_override)
- **Q14=A auto-disable** vs Q14 alternative top-2 fallback rejected V1 — strict safety first (Maria/Gigica Layer 5 Medical Safety §42.9 invariant 5)
- **V1.5 candidate** alternative top-2 weak group fallback (§9.6.6 Reconsideration Trigger 4) — post-Beta data validate fallback acceptability vs strict disable

**D5 Light coupling Engine #5 Energy + Engine #6 Tempo cross-engine context** (verbatim engines #5+#6 consistent Q18=C):
- **Engine #5 Energy DOWN** signal cross-cutting context — specialization volume modifier conservative scaling când Energy DOWN signal recurrent (anti-cascade compounding)
- **Engine #6 Tempo prescription** preserved Engine #5 high intensity → form-conservative amplification Q11=B (§9.5.4) — specialization extra volume NU modifies tempo prescription Engine #6 owns
- **Light coupling pattern:** specialization reads signals upstream, modulates own output (volume/frequency), NU mutates upstream engines (anti-cascade preserve §1.10)

---

#### §9.6.5 Cluster E — Edge Cases + Telemetry + V1.5+ Deferrals (~5 decisions)

**E1 WhyEngine integration silent + "De ce ăsta?"** (Source 1 line 67 verbatim, Q18=C engines #5+#6 consistent):
- **WhyEngine silent integration** = engine logs specialization rationale CDL audit trail (NU UI surface default)
- **"De ce ăsta?"** = user-initiated reactive transparency (tap rationale link "De ce Bloc focus Spate?") — consistent SUFLET F4 user agency
- **Q18=C engines #5+#6 consistent** pattern (Energy + Tempo silent + reactive transparency identical interaction model)

**E2 Q19 push-back Claude valid: hibrid simulator + Beta cohort 50 testers ground truth** (Source 1 line 69 verbatim, Q19=B Daniel pivot accepted):
- **Q19 synthetic only INCONSISTENT engines #1-#6** — Claude push-back valid mid-flight chat strategic Daniel pivot accepted
- **Hibrid validation:** synthetic test pipeline `pipeline.js` orchestrator skeleton + Beta cohort 50 testers ground truth post-Beta corroboration
- **Anti-overconfidence Mensa-grade:** synthetic-only Engine #7 INCONSISTENT cu engines #1-#6 hybrid validation methodology (§9.4 + §9.5 Q19=B precedent honored Bugatti SSOT consistent)

**E3 Bayesian latent state v1.5 ecosystem alignment** (Source 1 line 70 verbatim, Q20=D ecosystem-wide):
- **V1.5 Bayesian inference migration** ecosystem-wide (Engine #3 Bayesian + Engine #5 Energy + Engine #6 Tempo + Engine #7 Specialization consistent Q20=D)
- **V1 stays categorical** (cluster table mapping) — Bayesian latent state evolution post-Beta data validates tractable inference scope (anti-premature-optimization)
- **Cross-cutting timing** coordinated multi-engine release per §9.4.7 Trigger 7 + §9.5.6 Trigger 8 timing — R²>0.85 validation gate hold ≥6 luni post-Beta + ≥1000 sesiuni real data

**E4 weaknessDetector.js orfan reuse §36.84 Gap #1 (zero new code engine logic):**
- **Existing module reused:** `src/engine/weaknessDetector.js` (§36.84 Gap #1 orfan candidate identified pre-Faza 2.5) — Engine #7 Specialization V1 implement = wiring detector → session builder action layer (NU rewriting detection logic)
- **Pattern §36.84:** orfan modules reuse minimizes scope batch implementation — V1 cleanest precedent (Engine #7 = "the cleanest spec session pas 1 → fix Q19 → final" per Source 1 line 117 + 587)
- **Wire-up Faza 2.5 batch 6:** import `weaknessDetector.js` într `src/engine/specialization/` modul nou; engine = thin wrapper consume detector signal + apply Cluster B-C logic + emit blueprint per ADR 018 §2

**E5 Cut DISABLE recovery risk universal rationale** (Source 1 line 54 verbatim Q5=D, repeated invariant compliance):
- **Deficit nutritional (CUT phase) + extra volume specialization** = recovery bandwidth insufficient signal universal across Marius cohort empirical literature Israetel/Helms canonical
- **Q5=D Cut DISABLE** preserved strict V1 — NU exceptions edge cases (anti-friction simplicity decision boundary clear)
- **Cross-engine dual safety:** Q5 (Goal Adaptation phase gate) + Q13 (Cut DISABLE consistency) + Q14 (Injury auto-disable) = 3-layer defense-in-depth Layer 5 Medical Safety §42.9 invariant 5 cross-cutting

---

#### §9.6.6 Reconsideration Triggers — Engine Specialization V1 → V1.5 candidate

Revisit Cluster A-E LOCKED V1 → V1.5 candidate dacă:

1. **Cluster B Q15 tier-aware T2+ auto-activate threshold validate** — V1 propose user accept/reject conservative; post-Beta data validates auto-activate confidence threshold (e.g., Marius T2+ profile signal stable + weakness detection R²>0.90). Trigger threshold: ≥30% Marius T2+ useri accept proposal consistently 3+ specialization blocks → auto-activate candidate. Candidate: V1.5 tier-aware auto-activate T2+ confidence-gated (anti-friction reduce proposal cognitive overhead established users).

2. **Cluster B Q19 hibrid simulator + Beta cohort validation post-Beta corroboration** — synthetic only INCONSISTENT engines #1-#6 V1 — Beta cohort 50 testers ground truth validates Engine #7 prediction accuracy vs other engines hybrid methodology. Trigger threshold: post-Beta ≥50 useri specialization blocks completed + outcome data correlate engine prediction. Candidate: V1.5 ML effectiveness prediction layer consume Beta data validate.

3. **Cluster C Q9 adaptive early exit non-responders** — V1 fixed 4 weeks; post-Beta data shows specialization non-response signal threshold (e.g., weak group strength NU progresses ≥10% post 2 weeks specialization block). Trigger threshold: ≥20% specialization blocks non-response signal week 2 + week 4 unchanged. Candidate: V1.5 adaptive shorter exit pentru non-responders (early termination 2 weeks if signal absent + cooldown window adjusted).

4. **Cluster D Q14 alternative top-2 weak group fallback vs strict auto-disable** — V1 Injury auto-disable strict (Q14=A); post-Beta data validates fallback top-2 weak group acceptability. Trigger threshold: ≥15% specialization blocks injury auto-disabled + user signal "alternative target preferred" via Settings UI. Candidate: V1.5 top-2 fallback opt-in (engine offers alternate weak group when primary blocked, user accept/reject Q15-style).

5. **Cluster B Q3 Top-N parallel multi-weakness expansion** — V1 Top-1 discipline simplicity; post-Beta Marius advanced cohort signal multi-weakness handling capacity. Trigger threshold: ≥10% Marius T2+ useri sequential specialization 2+ different groups within 24 weeks (signaling parallel viability). Candidate: V1.5 Top-2 parallel modifier (concurrent specialization blocks sub MRV §42.9 invariant 1 cap absolute respect).

6. **Cluster E Bayesian latent state v1.5 ecosystem timing** — Q20=D coordinated multi-engine release timing per Engine #3 Bayesian Nutrition R²>0.85 validation gate hold ≥6 luni post-Beta + ≥1000 sesiuni real data (cross-ref §9.4.7 Trigger 7 + §9.5.6 Trigger 8). Candidate: V1.5 migration coordinated cu Bayesian Nutrition + Energy + Tempo consistent.

7. **Cluster A activation gating expansion (Maria/Gigica eligibility post-Beta)** — V1 Q12 §45.3 LOCKED strict Marius ONLY; post-Beta data validates Maria/Gigica advanced sub-cohort exists (long-term users T2+ tier reached eligibility threshold). Trigger threshold: ≥10% Maria/Gigica T2+ useri post-12-luni training + Profile Typing signal Advanced classification. Candidate: V1.5 Maria/Gigica T2+ Advanced sub-classification eligibility (anti-paternalism reduce gating Marius-exclusivity post sufficient signal).

**Re-evaluation cadence:** post Faza 2.5 batch 6 implementation Engine Specialization V1 + post-Beta useri reali signal aggregate (similar §9.1.7 + §9.2.6 + §9.3.6 + §9.4.7 + §9.5.6 cadence pattern §1.8 Versioning Additive 18 luni deprecation window). Bugatti craft transparency = ship V1 cu Cluster A-E LOCKED + monitor post-Beta signal.

---

#### §9.6.7 Cross-refs Bidirectional ADR

- [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract — `evaluate(ctx) → SpecializationResult` extending DimensionResult (purity preserved engine = pure function NU side effects, async-capable per DP-2)
- [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline Order LOCKED V1 — Specialization 6th în pipeline §42.10 (NU "Engine #7" naming legacy)
- [[029-engine-specialization|ADR 029]] 🔵 **SPEC REFERENCE post-flip `dccda1f` 2026-05-06 evening chat-9** — file flip pattern ADR 027 + ADR 028 precedent §9.3 Energy + §9.5 Tempo. ADR 029 redirects la §9.6 SSOT canonical.
- [[009-calibration-tiers|ADR 009]] tier-aware Marius Advanced gating Q5=D foundation (Profile Typing tier T1+ established gate detection signal noise filter) + §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" — tier transitions cross-cutting NU Specialization specific. Reference shared utility `src/coach/orchestrator/utilities/convergenceGuard.js` (Phase 1-2 foundation commit `5a16550`) via crossEngineHooks NU duplicate logic (pattern §9.4 Bayesian commit `8615ec1` + §9.5 Tempo commit `d82d118` precedent).
- [[022-bayesian-nutrition-inference|ADR 022]] Q20=D Bayesian latent state v1.5 ecosystem-wide alignment (cross-engine timing coordinated multi-engine release post-Beta validation gate)
- [[ADR_PAIN_DISCOMFORT_BUTTON_v1|ADR Pain Button]] Q14=A Injury weak group zone → auto-disable Safety Override §42.9 invariant 5 cross-cutting (Layer 5 Medical Safety defense-in-depth)
- [[025-andura-gandeste-pentru-user|ADR 025]] graceful degradation — Q15=B Propose user accept/reject NU auto-activate silent (engine pre-fills proposal cu opt-in user activation, anti-paternalism F4)
- [[017-demographic-prior-database|ADR 017]] persona resolution Marius Advanced gating cross-ref Cluster A activation strict (Q12 §45.3 LOCKED Maria/Gigica NU eligible V1)
- [[030-adapter-design-pattern|ADR 030]] D1-D5 LOCKED V1 foundation Hexagonal — Phase 1-2 orchestrator foundation `src/coach/orchestrator/` LANDED commit `5a16550` reusable post Faza 2.5 batch 6
- [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.84 Gap #1 (`weaknessDetector.js` orfan reuse pattern — Engine #7 = wiring detector → session builder action layer zero new code engine logic) + §45.3 Q12 LOCKED (Marius Advanced AND lagging gating strict) + §45.2 Q10 (4-week mesocycle match Q6=A simplicity V1)
- §9.1 Engine #1 Periodization Constraint Object frozen Hook 1 read-only — PARALLEL modifier Q11=B layer extra volume/frequency on accumulation phases NU REPLACE skeleton
- §9.2 Engine #2 Goal Adaptation phase context — CUT phase Q5=D dual safety gate Q13=A specialization GATE_BLOCKED
- §9.3 Engine Energy Adjustment readiness state cross-engine context (Engine #5 light coupling Energy DOWN conservative scaling)
- §9.4 Engine Bayesian Nutrition Inference cross-engine recovery state Hook (Q20=D Bayesian latent state v1.5 ecosystem alignment)
- §9.5 Engine Tempo light coupling cross-engine modifiers (PARALLEL overlay sibling — Tempo prescription preserved Engine #6 owns NU mutated by Specialization extra volume)
- §9.7 Engine Warm-up (LANDED §9.7 spec compile commit `c15ad0f` + V1 implement commit `20999fb`) — light coupling cross-engine modifiers post-template×phase
- §9.8 Engine Deload Protocol (LANDED §9.8 spec compile commit `d7594e7` + V1 implement commit `a6a0c87`) — Q12=A standard deload week 4 preserved non-negotiable Engine #4 Hook owns

---

🦫 **§9.6 Engine Specialization Module-Level Spec V1 compiled 2026-05-06 afternoon chat-6 acasă.** ZERO net new substantive decisions — aggregation only verbatim from chat strategic 2026-05-05 birou late sources (`149_HANDOVER_..._engines5-6-7_spec_sessions_CONSUMED.md` Engine #7 Specialization section lines 50-72 + CURRENT_STATE §RECENT 2026-05-05 birou late lines 557-579 — **2-way parity check ✅ ZERO substantive divergence flagged**). ~28-30 decisions Cluster A-E cumulative (Q1-Q20 Source 1 sub-decomposed în 5 + 7 + 5 + 5 + 5 = 27 sub-decisions Cluster A-E + 1 cross-cutting note `weaknessDetector.js` reuse §36.84 Gap #1 = 28 cumulative; granularity match §9.5 Tempo precedent commit `a9b7cbd`). Pre Faza 2.5 batch 6 implementation per Option A LOCKED 2026-05-06 morning chat-2. Pattern Bugatti SSOT consistent §9.1 Engine #1 Periodization (`cd6d9a4`) + §9.2 Goal Adaptation (`6be84f8`) + §9.3 Energy Adjustment (`2f9aa79`) + §9.4 Bayesian Nutrition Inference (`685fdd4`) + §9.5 Tempo (`a9b7cbd`). Pipeline §42.10 position 6th canonical (NU "Engine #7" naming legacy ADR 029 chat strategic spec session ordering ULTIMUL prescriptive engine §36.100 100% milestone). Source 3 ADR 029 🔵 SPEC REFERENCE post-flip `dccda1f` 2026-05-06 evening chat-9 — redirects la §9.6 SSOT canonical. `weaknessDetector.js` orfan §36.84 Gap #1 reuse note pentru batch 6 V1 implement NEXT (Engine #7 = "the cleanest spec session pas 1 → fix Q19 → final" Source 1 line 117 — wiring detector → session builder action layer zero new code engine logic).

---

### §9.7 Engine Warm-up Module-Level Spec V1

**Status:** 🟢 **SPEC READY V1** (compiled 2026-05-06 evening chat-7 acasă din chat strategic 2026-04-30 evening §45.6 Engine #8 Warm-up & Mobility LOCKED V1 + 2026-05-04 evening BATCH 4 §65.1-§65.4 Override refinements). ~21 decisions cumulative (Cluster A-E). Pre Faza 2.5 batch 7 implementation per Option A LOCKED 2026-05-06 morning chat-2 — pipeline §42.10 sequential post Engine Specialization V1 LANDED commit `4cf50ab` (batch 6).

**Pipeline placement (per §42.10 LOCKED V1 §1.10 ADR 026):** Warm-up runs sequentially **7th** position canonical (penultimate prescriptive engine pre-Deload). Order: `Periodization (§9.1) → Goal Adaptation (§9.2) → Energy Adjustment (§9.3) → Bayesian Nutrition (§9.4) → Tempo (§9.5) → Specialization (§9.6) → Warm-up (§9.7) → Deload (§9.8)`. **Engine numbering clarification:** Source 1 + Source 2 reference "Engine #8" = chat strategic spec session ordering legacy (META §36.100 amendment 7→8 prescriptive engines 2026-04-30 evening) NU pipeline §42.10 canonical position 7th. Clarified anti-recurrence numbering ambiguity batch 8 reference (§9.8 Deload final).

**Provenance chain (2-way parity check ✅ + reconciled override):**
- Source 1 (verbatim Cluster B-C BATCH 4 §65.1-§65.4 Override Q1+Q4 + Periodization defaults §65.5-§65.10 not Warm-up scope): `📤_outbox/_archive/2026-05/131_HANDOVER_INPUT_2026-05-04_AUTH_FLOW_BATCH_1_6_63_LOCKED_CONSUMED.md` lines 157-198 (4 Warm-up/Cool-down sub-decisions: §65.1 duration 5-10 min adaptive Override Q1 + §65.2 Hybrid 1-2 general + 2-3 specific muscle group + §65.3 skip "Sari peste încălzire" buton vizibil from session 1 + §65.4 Cool-down OVERRIDE Q4 → optional 2 min stretch buton)
- Source 2 (verbatim Cluster A scope + Cluster B persona thresholds + Cluster D Instant Skip): `06-sessions-log/HANDOVER_ENGINES_SPEC_2026-04-30_evening.md` §45.6 lines 324-345 (5 sub-decisions + Cooldown C defer note: scope strict pre-Beta + pipeline placement §42.10 + persona thresholds Maria/Gigica/Marius + Pre-Beta MANDATORY + Instant Skip principle T0 default + T1+ opt-in + in-session toggle)
- Source 3 (cristalizate cross-check): `00-index/CURRENT_STATE.md` §RECENT references (line 924 "Engine #8 Warm-up & Mobility LOCKED §45.6" + line 766 BATCH 4 §65 Engine #8 Warm-up summary + line 997 §45.6 META 7→8 amendment + cooldown defer post-Beta v1.5 reference)
- Source 4: [[031-engine-warmup-mobility|ADR 031]] 🔵 SPEC REFERENCE NEW direct post-create `dccda1f` 2026-05-06 evening chat-9 — redirects la §9.7 SSOT canonical (precedent reverse vs ADR 027/028/029 stub flip pattern — created direct cu SPEC REFERENCE redirect, NU intermediate STUB stage). Filename per §36.95 Additive convention.

**🟡 Reconciled override (Source 1 supersedes Source 2 on Cool-down):** Source 2 §45.6 final Q-Cooldown decision (2026-04-30 evening) = "C Defer post-Beta v1.5" (skip pre-Beta entirely). Source 1 BATCH 4 §65.4 (2026-05-04 evening, ~5 days later) explicitly **OVERRIDE Q4 reconsider** → "Optional buton 'Adaugă 2 min stretch' (Option B)" cu rationale industry research Schoenfeld/Helms + Maria 65 retention crescut + ZERO complex UI scope creep. **Source 1 wins by virtue of being later + explicit OVERRIDE** (Daniel's later decision authority pattern — same precedent as Q1 duration 8-12 → 5-10 Override). NU substantive divergence blocker; transparent reconciliation documented per Bugatti craft.

**Decision count sum check verbatim:** Cluster A=5 + B=5 + C=3 + D=5 + E=3 = **21 substantive decisions cumulative**. Variance vs prompt expected ~10-28 range = within acceptable bounds. Source 1 Warm-up scope = 4 decisions (§65.1-§65.4); Source 2 §45.6 scope = 6 decisions (5 sub + Cooldown Q-final reconciled superseded). Cluster A I/O Contract + Cluster D Cross-Engine Hooks decomposed standard §9.1-§9.6 pattern.

**Cross-refs:** [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract (purity preserved engine = pure function NU side effects) | [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline Order LOCKED V1 (Warm-up 7th în pipeline §42.10) | [[017-demographic-prior-database|ADR 017]] persona resolution Maria/Gigica/Marius cross-ref Cluster B persona thresholds | [[025-andura-gandeste-pentru-user|ADR 025]] graceful degradation engine pre-fills default — referenced §65.3 Skip buton vizibil + §45.6.5 Instant Skip principle T0 default | [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" — tier-aware T0 skip default / T1+ opt-in expanded | [[030-adapter-design-pattern|ADR 030]] D1-D5 LOCKED V1 foundation Hexagonal — Phase 1-2 orchestrator foundation `src/coach/orchestrator/` LANDED commit `5a16550` reusable post Faza 2.5 batch 7 | §9.1 Periodization Constraint Object frozen Hook 1 read-only (consume input frozen) | §9.2 Goal Adaptation phase context cross-ref Cluster D | §9.3 Energy Adjustment readiness state Hook D (light coupling) | §9.6 Specialization §36.84 weaknessDetector orphan reuse precedent (light coupling forward) | §9.8 Engine Deload Protocol forward Hook (Cooldown post-session compatible cu deload week §65.6 trigger §36.82 readiness)

---

#### §9.7.1 Cluster A — I/O Contract & Pipeline Placement (~5 decisions)

**Pure function signature** per ADR 018 §2 Standardized Dimension Contract:

```
warmupEngine.evaluate(ctx) → WarmupResult extends DimensionResult
```

**A1 Pipeline placement LOCKED V1 (per §42.10):** Warm-up runs **sequentially 7th** post Specialization (§9.6). Legacy "Engine #8" naming în Source 1+2 = chat strategic spec session ordering (META §36.100 amendment 7→8 prescriptive engines 2026-04-30 evening) NU pipeline canonical position. Pipeline §42.10 canonical: `Periodization → Goal Adaptation → Energy → Bayesian → Tempo → Specialization → Warm-up → Deload`.

**A2 Scope strict pre-Beta** (Source 2 §45.6.1 verbatim):
- **Activare neuromusculară universal + mobility general ONLY** — NU corrective therapy, NU biomechanical limitations individuale
- **Medical-adjacent → D2 v1.5 defer** (Q24 pattern precedent — anti-EU AI Act medical scope creep)
- **Anti-fabrication boundary:** Warm-up engine NU prescribes individualized rehabilitation, NU diagnosis movement dysfunction

**A3 Input contract (consumed Hook 1 read-only):** Constraint Object frozen propagated upstream Periodization §9.1 Cluster 5 + Goal Adaptation §9.2 + Energy §9.3 + Bayesian §9.4 + Tempo §9.5 + Specialization §9.6 cross-engine hooks. NU mutate input — anti-cascade safeguard preserved.

**A4 Output blueprint emit (cumulated Cluster B-D decisions):**
1. `warmup_routine` — adaptive 5-10 min protocol per persona threshold + Hybrid 1-2 general mobility + 2-3 specific muscle group exercises (per Cluster B Source 1+2)
2. `cooldown_routine` — optional 2 min stretch text-only (Source 1 §65.4 Override Q4 reconciled supersedes Source 2 §45.6 Q-Cooldown defer)
3. `skip_available` — boolean ALWAYS true V1 (per §65.3 Source 1 buton vizibil from first session + ADR 025 graceful degradation alignment)
4. `instant_skip_default` — boolean tier-aware (T0 default skip → engine auto-calculates ramp-up sets în first exercise; T1+ Profile Typing opt-in expanded routine per §45.6.5 Source 2)
5. `signals` — human-readable signal IDs (e.g. `'warmup_skip_available_session_1_q65_3_locked'`, `'instant_skip_t0_default_ramp_up_integrated'`, `'persona_threshold_maria_mobility_flow_5_10_min'`)

**A5 Constraint:** ZERO side effects (engine pure per ADR 018 §2). Side effects (CDL writes ADR 011, telemetry, Firestore Tier 2 sync) = orchestrator layer separate per ADR 030 D2 thin adapter scope LOCKED V1. Engine purity preserved — Warm-up reads upstream Constraint Objects Hook 1 read-only, NU override per §1.10 Pipeline Order LOCKED V1.

---

#### §9.7.2 Cluster B — Warm-up Protocol Logic (~5 decisions)

**B1 Duration 5-10 min adaptive — OVERRIDE Q1 reconsider** (Source 1 §65.1 verbatim, 2026-05-04 evening Override supersedes 2026-04-30 Q1 8-12 min initial choice):
- **Compressed upper bound 5-10 min** (NU 8-12 academic complete)
- **RO pragmatism cultural** (mainstream fitness apps Strong/Hevy = 5-8 min default)
- **Maria 65 sesiune light 3-5 min** | **Gigica 35 5-7 min** | **Marius 25 8-10 min cu ramp protocol**
- **Bugatti F4 "warm-up just enough"** NU "warm-up academic complete"

**B2 Exercises Hybrid 1-2 general + 2-3 specific muscle group** (Source 1 §65.2 verbatim, Option C):
- **General full-body mobility** (1-2 mișcări) prima — anti-cold-start
- **Specific muscle group prep** (2-3 mișcări vizate ziua respectivă, ex: shoulder mobility înainte bench press)
- **NU general only** (insufficient prep) | **NU muscle-specific only** (cold start problematic)

**B3 Persona thresholds pre-Beta** (Source 2 §45.6.3 verbatim):
- **Maria 65:** rutină blândă activare articulară 5-10 min (mobility flow + bands light)
- **Gigica 35:** warm-up general dynamic 5 min + 1 set ușor ramp pe primul exercițiu
- **Marius 25:** ramp protocol heavy compounds (50%/70%/90% × 3-5 sets) + general warm-up minimal

**B4 Skip "Sari peste încălzire" buton vizibil from session 1** (Source 1 §65.3 verbatim, Option A):
- **Buton vizibil de la prima sesiune** — ADR 025 graceful degradation alignment + Bugatti F4 zero forced friction
- **NU skip after 3+ logged warm-ups** (paternalism violation)
- **NU NEVER skip** (ADR 025 violation — "Andura gândește pentru user")

**B5 Pre-Beta MANDATORY** (Source 2 §45.6.4 verbatim):
- **Bugatti injury safety > scope discipline** — Warm-up MUST ship pre-Beta (NU defer v1.5)
- **~50-80 ramuri V1 universal patterns** (acceptable scope batch 7 implement)
- **+1-2 chat-uri strategic spec generation post-Periodization** — done with this §9.7 compile + batch 7 implement

---

#### §9.7.3 Cluster C — Cool-down Strategy (~3 decisions)

**C1 Cool-down post-session OPTIONAL 2 min stretch — OVERRIDE Q4 reconsider RECONCILED** (Source 1 §65.4 verbatim 2026-05-04 Override supersedes Source 2 §45.6 Q-Cooldown defer 2026-04-30):
- **OVERRIDE Q4 initial choice "defer v1.5" → reconsider Option B "optional 2 min stretch"**
- **ZERO cool-down V1 inconsistent vs warm-up MANDATORY** (Bugatti consistency principle — both pre + post-session covered V1)
- **Industry research Schoenfeld/Helms** = stretching 2-3 min post-session REDUCE DOMS perceput → Maria 65 retention crescut
- **Cost dev ~30 min vs valoare retention** = ROI justifies V1 inclusion

**C2 Cool-down implementation MINIMAL text-only** (Source 1 §65.4 verbatim):
- **2-3 stretch static text-only** ZERO UI complex
- **NU GIF embedded** (consistent §9.5 Tempo E16 Q16 GIF REJECTED pre-Beta storage PWA + copyright + Gigel test)
- **NU video / audio** (scope creep)

**C3 Reconciliation transparency note** (NU în original sources — compile-level disclosure):
- Source 2 §45.6 Q-Cooldown final 2026-04-30 evening = "C Defer post-Beta v1.5" (skip pre-Beta entirely); Source 1 BATCH 4 §65.4 ~5 days later = explicit "OVERRIDE Q4 reconsider" → optional 2 min stretch
- **Source 1 wins by virtue of being later + explicit OVERRIDE** (Daniel's later decision authority pattern — same precedent as Q1 duration §65.1 Override 8-12 → 5-10)
- **V1.5+ candidate:** extended cooldown routines (Schoenfeld stretching 5-10 min, foam rolling, parasympathetic activation breathing) post-Beta useri reali signal

---

#### §9.7.4 Cluster D — Cross-Engine Hooks (~5 decisions)

**D1 Hook upstream consume frozen Constraint Object — Periodization §9.1** (Cluster A3 + §1.10 Pipeline Order LOCKED V1):
- Read-only consume `phase` + `volume_per_muscle Floor/Ceiling` + `intensity_pct_1rm Floor/Ceiling` + `deload_window`
- Periodization phase = DELOAD (W4) → Warm-up routine **lighter** (recovery week, NU full ramp protocol Marius 50/70/90%)
- Anti-cascade preserve — NU mutate upstream

**D2 Hook upstream consume — Goal Adaptation §9.2 phase context:**
- Goal Adaptation phase (CUT/BULK/MAINTAIN/RECOMP) light coupling — Warm-up duration adaptive per phase (CUT = preserve 5-10 min full per Maria 65 retention; BULK Marius = full ramp protocol).

**D3 Hook upstream consume — Energy Adjustment §9.3 readiness state:**
- Energy DOWN signal → Warm-up routine **shorter** (auto-shorten upper bound 5-10 → 5-7 min)
- Anti-cascade preserve — Energy NU override Periodization phase (consistent §9.5 Tempo D13 Q13=B precedent — Energy DOWN modulates form/tempo, NU mutate phase)

**D4 Hook upstream consume — Specialization §9.6 weak group focus:**
- Specialization weak group active → Warm-up specific muscle group includes weak group prioritized (consistent §9.6 PARALLEL modifier precedent Q11=B — Warm-up serves Specialization, NU compete)
- Warm-up specific exercises = §9.6 weak group + standard primary muscles

**D5 Hook downstream forward — Deload §9.8** (light coupling):
- Cool-down routine compatible cu deload week §65.6 trigger §36.82 readiness 🔴 3x consecutive (Cooldown extended deload week post-Beta v1.5 candidate)
- Pain-Aware integration cross-cutting Convergence Guard "T2 Unlock" preserved §9.4.6 reference (Warm-up NU proactive Pain-Aware trigger Clean Signal rule — consistent §9.5 Tempo precedent)

---

#### §9.7.5 Cluster E — Edge Cases / Telemetry / V1.5+ Deferrals (~3 decisions)

**E1 Instant Skip principle T0 default + T1+ opt-in** (Source 2 §45.6.5 verbatim):
- **Default T0 skip** → engine auto-calculates ramp-up sets integrated în first exercise (ZERO friction, ZERO ecran suplimentar)
- **T1+ Profile Typing:** opt-in expanded warm-up routine
- **In-session toggle:** "skip warm-up" button = engine collapse to ramp-up sets only
- **Anti-paternalism** consistent ADR 025 graceful degradation — engine pre-fills default, user keeps autonomy

**E2 Medical-adjacent boundary** (Source 2 §45.6.1 verbatim — Cluster A2 echo):
- **NU corrective therapy / NU biomechanical limitations individuale** — D2 v1.5 defer (Q24 pattern)
- **Anti-EU AI Act medical scope creep** preserve (Bugatti F4 lifestyle recommendations boundary consistent §9.5 Tempo "engine NU spune 'dormi mai mult'" precedent)
- **Pain-Aware cross-ref §9.4.6 Convergence Guard "T2 Unlock":** Warm-up NU proactive Pain-Aware trigger (Clean Signal rule preserved Invariant 5 Medical Safety)

**E3 V1.5+ Deferrals documented:**
- **Cooldown extended routines** (Schoenfeld stretching 5-10 min + foam rolling + parasympathetic breathing) — V1 minimal text-only 2 min
- **Personalized warm-up per movement dysfunction signature** — Profile Typing tier T2+ data-driven (post-Beta ≥1000 sesiuni real data signal)
- **Mobility tracking longitudinal** — Range-of-motion telemetry CDL silent V1 (NU UI surface) → V1.5+ trend analysis Bayesian latent state ecosystem-wide alignment Q20=D consistent §9.4-§9.6 precedent
- **AR/video-guided warm-up** — V1 text-only (NU GIF NU video pre-Beta consistent §9.5 Tempo E16 Q16 GIF REJECTED)

---

#### §9.7.6 Reconsideration Triggers — Engine Warm-up V1 → V1.5 candidate

Revisit Cluster A-E LOCKED V1 → V1.5 candidate dacă:

1. **Cluster B1 Duration 5-10 min adaptive too compressed Maria 65 signal** — Maria-tier useri raportează "warm-up insufficient activare articulară" post-Beta. Trigger threshold: ≥20% Maria-tier feedback "warm-up too short" sau injury rate elevated în Maria cohort. Candidate: Maria 5-10 → 8-12 min adaptive (revert Source 2 Q1 initial choice).

2. **Cluster B2 Hybrid 1-2 general + 2-3 specific too rigid** — useri raportează preference general only (younger Marius mobile already) sau specific only (older Maria limited). Trigger threshold: ≥30% useri Settings UI override Hybrid manually. Candidate: tier-aware adaptive (T0 Hybrid default / T1+ user choice general-only / specific-only opt-in).

3. **Cluster B4 Skip buton paternalism boundary** — useri overuse skip (>50% sessions skip Warm-up entirely) → injury rate signal. Per Cluster A4 anti-paternalism vs Bugatti F4 injury safety tension. Trigger threshold: ≥10% Beta cohort injury reports correlated cu skip rate >50%. Candidate: progressive nudge "te-am observat sari încălzirea — recomand X" Tier 2 banner (NU Tier 3 modal blocking — preserve autonomy).

4. **Cluster C1 Cooldown 2 min text-only insufficient signal** — Beta cohort feedback "DOMS persists" signal stretching 2 min insufficient duration. Trigger threshold: ≥30% useri DOMS perceived rate elevated post-cooldown. Candidate: V1.5 extend 2 → 5 min + foam rolling + breathing (Schoenfeld v1.5 expansion).

5. **Cluster D3 Energy DOWN auto-shorten too aggressive** — useri raportează engagement drop post-shorten (5-7 min insufficient warm-up signal even when readiness DOWN). Trigger threshold: ≥15% sessions Energy DOWN cu user feedback "rece la primul set". Candidate: Energy DOWN modulates intensity NU duration (consistent §9.5 Tempo D13 precedent — Energy DOWN slow eccentric NU ROM partial).

6. **Cluster E1 Instant Skip T0 default ramp-up integrated insufficient** — T0 useri raportează cold start signal even cu ramp-up integrated. Trigger threshold: ≥20% T0 useri injury rate elevated cu ramp-up only. Candidate: T0 default → minimal Hybrid (1 general + 1 specific) NU ramp-up only.

7. **Cluster E3 Mobility tracking longitudinal Bayesian v1.5 ecosystem timing** — Q20=D coordinated multi-engine release timing per Engine #3 Bayesian Nutrition R²>0.85 validation gate hold ≥6 luni post-Beta + ≥1000 sesiuni real data (cross-ref §9.4.7 + §9.5.6 + §9.6.6 Trigger 7 timing). Candidate: V1.5 migration coordinated cu Bayesian Nutrition + Energy + Tempo + Specialization consistent.

**Re-evaluation cadence:** post Faza 2.5 batch 7 implementation Engine Warm-up V1 + post-Beta useri reali signal aggregate (similar §9.1.7 + §9.2.6 + §9.3.6 + §9.4.7 + §9.5.6 + §9.6.6 cadence pattern §1.8 Versioning Additive 18 luni deprecation window). Bugatti craft transparency = ship V1 cu Cluster A-E LOCKED + monitor post-Beta signal.

---

#### §9.7.7 Cross-refs Bidirectional ADR

- [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract — `evaluate(ctx) → WarmupResult` extending DimensionResult (purity preserved engine = pure function NU side effects, async-capable per DP-2)
- [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline Order LOCKED V1 — Warm-up 7th în pipeline §42.10 (NU "Engine #8" naming legacy chat strategic spec session ordering)
- [[031-engine-warmup-mobility|ADR 031]] 🔵 **SPEC REFERENCE NEW direct post-create `dccda1f` 2026-05-06 evening chat-9** (precedent reverse vs ADR 027/028/029 stub flip — created direct cu SPEC REFERENCE redirect, NU intermediate STUB stage). ADR 031 redirects la §9.7 SSOT canonical. Filename per §36.95 Additive convention.
- [[017-demographic-prior-database|ADR 017]] persona resolution Maria/Gigica/Marius cross-ref Cluster B3 persona thresholds verbatim
- [[025-andura-gandeste-pentru-user|ADR 025]] graceful degradation engine pre-fills default — referenced §65.3 Source 1 Skip buton vizibil session 1 + §45.6.5 Source 2 Instant Skip principle T0 default
- [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" — tier-aware T0 skip default / T1+ opt-in expanded Cluster E1 verbatim
- [[030-adapter-design-pattern|ADR 030]] D1-D5 LOCKED V1 foundation Hexagonal — Phase 1-2 orchestrator foundation `src/coach/orchestrator/` LANDED commit `5a16550` reusable post Faza 2.5 batch 7
- [[ADR_PAIN_DISCOMFORT_BUTTON_v1]] Pain-Aware integration cross-cutting Convergence Guard "T2 Unlock" preserved §9.4.6 reference (Warm-up NU proactive Pain-Aware trigger Clean Signal rule consistent §9.5+§9.6 precedent)
- §9.1 Engine #1 Periodization Constraint Object frozen Hook 1 read-only (consume input frozen — Cluster D1 Periodization phase = DELOAD lighter routine)
- §9.2 Engine #2 Goal Adaptation phase context cross-ref Cluster D2 (CUT/BULK adaptive duration light coupling)
- §9.3 Engine Energy Adjustment readiness state Hook D3 (Energy DOWN auto-shorten upper bound — anti-cascade preserve)
- §9.4 Engine Bayesian Nutrition Inference cross-engine recovery state (light coupling forward)
- §9.5 Engine Tempo light coupling cross-engine modifiers (consistent E2 medical-adjacent boundary "engine NU spune 'X'" precedent)
- §9.6 Engine Specialization weak group focus Hook D4 (PARALLEL modifier precedent — Warm-up serves Specialization weak group prioritized în specific muscle exercises)
- §9.8 Engine Deload Protocol forward Hook D5 (Cooldown post-session compatible cu §65.6 deload week trigger §36.82 readiness 🔴 3x consecutive)
- [[../06-sessions-log/HANDOVER_ENGINES_SPEC_2026-04-30_evening|HANDOVER_ENGINES_SPEC]] §45.6 Engine #8 Warm-up & Mobility LOCKED V1 NEW + META §36.100 amendment 7→8 prescriptive engines

---

🦫 **§9.7 Engine Warm-up Module-Level Spec V1 compiled 2026-05-06 evening chat-7 acasă.** ZERO net new substantive decisions — aggregation only verbatim from chat strategic 2026-04-30 evening §45.6 + 2026-05-04 evening BATCH 4 §65.1-§65.4 sources (`131_HANDOVER_INPUT_2026-05-04_AUTH_FLOW_BATCH_1_6_63_LOCKED_CONSUMED.md` lines 157-198 BATCH 4 §65 + `06-sessions-log/HANDOVER_ENGINES_SPEC_2026-04-30_evening.md` §45.6 lines 324-345 + CURRENT_STATE §RECENT cross-check — **2-way parity check ✅ + reconciled override Source 1 §65.4 supersedes Source 2 §45.6 Q-Cooldown defer transparency documented Cluster C3**). ~21 decisions Cluster A-E cumulative (5+5+3+5+3 = 21; lower than §9.4-§9.6 ~28-32 range — BATCH 4 §65 only 4 Warm-up scope decisions vs §65.5-§65.10 Periodization/Exercise scope; §45.6 5 decisions scope/persona/MANDATORY/Instant Skip + Cooldown reconciled = 6 scope; total 4+6 = 10 source decisions decomposed Cluster A-E + 11 derived A1+A3+A4+A5+D1-D5+E2+E3 standard pattern §9.1-§9.6 cross-cutting decomposition = 21 cumulative. Bugatti transparency: NU fabricate cluster decisions to hit ~28 quota — accept lower count consistent prompt anti-recurrence checklist verbatim). Pre Faza 2.5 batch 7 implementation per Option A LOCKED 2026-05-06 morning chat-2. Pattern Bugatti SSOT consistent §9.1 Engine #1 Periodization (`cd6d9a4`) + §9.2 Goal Adaptation (`6be84f8`) + §9.3 Energy Adjustment (`2f9aa79`) + §9.4 Bayesian Nutrition Inference (`685fdd4`) + §9.5 Tempo (`a9b7cbd`) + §9.6 Specialization (`92a69fd`). Pipeline §42.10 position 7th canonical (NU "Engine #8" naming legacy chat strategic spec session ordering 2026-04-30 evening META §36.100 amendment 7→8 prescriptive engines). Source 4 [[031-engine-warmup-mobility|ADR 031]] 🔵 SPEC REFERENCE NEW direct post-create `dccda1f` 2026-05-06 evening chat-9 — redirects la §9.7 SSOT canonical (precedent reverse vs ADR 027/028/029 stub flip pattern; filename per §36.95 Additive convention). §9.8 Engine Deload final batch 8 = penultimate compile post §9.7 V1 implement.

---

### §9.8 Engine Deload Protocol Module-Level Spec V1

**Status:** 🟢 **SPEC READY V1** (compiled 2026-05-06 evening chat-8 acasă din chat strategic 2026-05-05 birou after Engine #4 Deload Protocol spec session sources). ~32 decisions cumulative (Cluster A-E). **Pipeline §42.10 SPEC closure FINAL 8/8 prescriptive engines** (NU 8/8 V1 implement încă — batch 8 second half pending). Pre Faza 2.5 batch 8 V1 implementation per Option A LOCKED 2026-05-06 morning chat-2 — pipeline §42.10 sequential post Engine Warm-up V1 LANDED commit `20999fb` (batch 7).

**Pipeline placement (per §42.10 LOCKED V1 §1.10 ADR 026):** Deload runs sequentially **8th** position canonical (FINAL prescriptive engine pipeline closure). Order: `Periodization (§9.1) → Goal Adaptation (§9.2) → Energy Adjustment (§9.3) → Bayesian Nutrition (§9.4) → Tempo (§9.5) → Specialization (§9.6) → Warm-up (§9.7) → Deload (§9.8)`. **Engine numbering clarification:** Source 1 references "Engine #4 Deload Protocol" = chat strategic spec session ordering legacy 2026-05-05 birou after (3-engine cluster #3+#4+#5 spec session — Bayesian Nutrition + Deload + Energy Adjustment grouped) NU pipeline §42.10 canonical position 8th. Pipeline order canonical = sequential gate flow Periodization/Goal Adaptation upstream → Bayesian/Tempo/Specialization/Warm-up midstream → **Deload terminal final downstream consume**.

**Provenance chain (4-way parity check ✅):**
- Source 1 (verbatim primary spec ~22 substantive decisions): `📤_outbox/_archive/2026-05/148_HANDOVER_2026-05-05_birou_after_engines3-4-5_spec_sessions_CONSUMED.md` line 16 Engine #4 Deload Protocol section (single dense paragraph aggregate ~22 substantive bullet decisions explicit + 8-10 derived standard pattern decomposition Cluster A+D+E)
- Source 2 (cross-ref ADR canonical AA Detection): `03-decisions/013-auto-aggression-detection.md` (path corrected from prompt slip `013-ADR-aa-detection.md` via grep filesystem — anti-Slip 4 verified). AA-driven deload mechanic Volume CUT 30% obligatoriu + RIR ↑ obligatoriu + Intensity ↓ obligatoriu (Daniel push-back fundamental: "volum păstrat moderat" reinforces aggressive pattern, Engine REGLEAZĂ unsustainable NU pedepsește dorința muncă).
- Source 3 (cross-ref ADR canonical Composite Signal): `03-decisions/ADR_COMPOSITE_SIGNAL_LAYER_v1.md`. §36.41 Composite Signal Layer 3/3 simultaneous threshold (Performance Drop >15% + Rest Time Multiplier >1.5× + RIR Mismatch ≥2) + lifecycle Idle→Flagged→Cooldown→Resolving + **hard-disabled când Engine #4 active anti math collision double-penalty** (B3 verbatim Source 1).
- Source 4 (cristalizate cross-check parity): `00-index/CURRENT_STATE.md` §RECENT entry "2026-05-05 birou after" Engine #4 Deload Protocol partition lines 715-737 (22 bullets identical content vs Source 1 verbatim — cristalizate summary alignment match ZERO substantive divergence).
- Source 5 (referenced cross-cutting, NU primary): `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.41 Composite Signal Layer + §36.82 Marius 5:1 dual-signal recovery — foundational cross-cutting refs preserved unchanged (citat ca cross-ref ADR existent).

**4-way verbatim parity check Source 1 ↔ Source 2 ↔ Source 3 ↔ Source 4: ✅ ZERO substantive divergence flagged** — Source 1 verbatim primary spec, Source 2+3 cross-ref domain canonical preserved, Source 4 cristalizate summary 22 bullets identical content vs Source 1 paragraph. Stronger anti-recurrence proof vs §9.7 2-way parity (Cooldown reconciliation Cluster C3) — Source 1 explicit detailed + Source 4 explicit cristalizate redundancy alignment confirms scope.

**Cross-refs:** [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract (purity preserved engine = pure function NU side effects) | [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline Order LOCKED V1 (Deload 8th FINAL în pipeline §42.10) | [[013-auto-aggression-detection|ADR 013]] AA-driven deload mechanic Volume CUT 30% obligatoriu cross-ref Source 2 | [[ADR_COMPOSITE_SIGNAL_LAYER_v1]] §36.41 hard-disabled când Engine #4 active anti math collision Source 3 | [[017-demographic-prior-database|ADR 017]] persona resolution Maria/Gigica/Marius cross-ref Cluster D2 | [[025-andura-gandeste-pentru-user|ADR 025]] graceful degradation engine pre-fills default — Cluster C2 anti-paternalism wording RO native | [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" — tier-aware notification T0 silent / T1+ banner detaliat rationale cross-ref | [[030-adapter-design-pattern|ADR 030]] D1-D5 LOCKED V1 foundation Hexagonal — Phase 1-2 orchestrator foundation `src/coach/orchestrator/` LANDED commit `5a16550` reusable post Faza 2.5 batch 8 V1 implement | [[ADR_PAIN_DISCOMFORT_BUTTON_v1]] Pain-Aware integration §9.4.6 Convergence Guard Clean Signal rule preserved §9.5+§9.6+§9.7 precedent | §9.1 Periodization Constraint Object frozen Hook 1 read-only (`deload_window` emit field 5 consume primary D1) | §9.2 Goal Adaptation phase context Hook D2 | §9.3 Energy Adjustment readiness state Hook D3 (AA Detection candidate signal sustained pattern) | §9.4 Bayesian Nutrition σ variance + Pain-Aware §9.4.6 Hook D4 | §9.6 Specialization §36.84 weaknessDetector + DeloadPreservedSignal Q12=A Hook D5 cross-ref | §9.7 Warm-up DELOAD_LIGHTER state Hook D6 forward (light coupling downstream consume Engine #4 emit)

---

#### §9.8.1 Cluster A — I/O Contract & Pipeline Placement (~5 decisions)

**Pure function signature** per ADR 018 §2 Standardized Dimension Contract:

```
deloadEngine.evaluate(ctx) → DeloadResult extends DimensionResult
```

**A1 Pipeline placement LOCKED V1 (per §42.10):** Deload runs **sequentially 8th** position canonical FINAL prescriptive engine. Legacy "Engine #4" naming în Source 1 = chat strategic spec session ordering 2026-05-05 birou after (3-engine cluster Bayesian+Deload+Energy spec session) NU pipeline canonical position. Pipeline §42.10 canonical: `Periodization → Goal Adaptation → Energy → Bayesian → Tempo → Specialization → Warm-up → Deload`. Anti-recurrence numbering ambiguity Engine #4 (Source 1 spec session) vs §9.8 batch 8 (pipeline 8th canonical) reinforced. Engine Deload = pipeline terminal — NU forward Constraint Object downstream V1 (D7 explicit).

**A2 Scope orchestrator unification multi-trigger** (Source 1 verbatim B1 below):
- Engine Deload = orchestrator unification 3 trigger sources (Composite Signal §36.41 + AA Detection ADR 013 + Linear Block 4+1 existing per §9.1 Periodization deload_window emit)
- Engine Deload SSOT deload domain — owns final action decision (Composite cedes deload action când Engine #4 active per Source 3 cross-ref B3)

**A3 Input contract (consumed Hook 1 read-only):** Constraint Object frozen propagated upstream Periodization §9.1 Cluster 5 + Goal Adaptation §9.2 + Energy §9.3 + Bayesian §9.4 + Tempo §9.5 + Specialization §9.6 + Warm-up §9.7 cross-engine hooks. NU mutate input — anti-cascade safeguard preserved.

**A4 Output blueprint emit (cumulated cluster B-E decisions):**
1. `deload_state` — IDLE / SCHEDULED_LINEAR / REACTIVE_COMPOSITE / REACTIVE_AA / EXTENSION_FLAGGED / RESOLVING per Cluster B
2. `depth_pct` — Final_Depth formula MAX(Scheduled 45%, Reactive 60%, Behavioral 30%) + Behavioral_Modifiers per B5
3. `duration_weeks` — 1 scheduled fix / 1-2 reactive adaptive cu Flagged-only state qualifier per B6
4. `intensity_modifier` — Volume CUT 30% + RIR ↑ + Intensity ↓ obligatoriu per B4 AA-driven mechanic
5. `partial_scope` — null full-body sistemic / muscle group list per-muscle MRV alone per B10
6. `notification_tier` — T0 silent / T1+ banner detaliat rationale per Cluster C output contract Source 1 line 16 verbatim
7. `wording` — RO native specific per source (Linear/Composite/AA/Energy) per Cluster C2
8. `signals` — human-readable IDs + trigger source attribution (composite/aa/linear)

**A5 Constraint:** ZERO side effects (engine pure per ADR 018 §2). Side effects (CDL writes ADR 011 `deload_metadata` schema, telemetry, Firestore Tier 2 sync) = orchestrator layer separate per ADR 030 D2 thin adapter scope LOCKED V1. Engine purity preserved — Deload reads upstream Constraint Objects Hook 1 read-only, owns SSOT deload action decision per §1.10 Pipeline Order LOCKED V1 anti-cascade safeguard.

---

#### §9.8.2 Cluster B — Deload Protocol Mechanic & Trigger Hierarchy (~14 decisions Source 1 verbatim)

**B1 Multi-trigger orchestrator unification** (Source 1 line 16 verbatim, Source 4 line 716):
- Engine Deload = orchestrator unification 3 trigger sources:
  - **Composite Signal §36.41** (3/3 simultaneous threshold Performance Drop >15% + Rest Time Multiplier >1.5× + RIR Mismatch ≥2)
  - **AA Detection ADR 013** (autonomic arousal sustained pattern detection)
  - **Linear Block 4+1 existing** (calendar scheduled Week 4 deload mesocycle classic per §9.1 Periodization Cluster 2.1)

**B2 Prioritized hierarchy** (Source 1 line 16 verbatim, Source 4 line 717):
1. **Composite > AA > Linear** (priority order — reactive overrides scheduled)
2. **Multi-signal consolidation escalează severity** (NU dilutes — additive Source 4 line 718)

**B3 Engine Deload SSOT deload domain** (Source 1 line 16 + Source 3 ADR_COMPOSITE_SIGNAL_LAYER_v1 §36.41 reconciliation):
- **Composite -20% reduction §36.41 hard-disabled când Engine Deload active** (anti math collision double-penalty)
- Source 3 `composite_signal_active: true` flag → Engine Deload owns final action (Composite cedes deload action when Engine Deload triggered)

**B4 AA-driven mechanic obligatoriu** (Source 1 line 16 + Source 2 ADR 013 verbatim):
- **Volume CUT 30% obligatoriu**
- **RIR ↑ obligatoriu** (intensity reduction perceived effort)
- **Intensity ↓ obligatoriu** (-12.5% per §9.1 Cluster 2.1 deload classic Linear)
- **Daniel push-back fundamental:** *"volum păstrat moderat"* reinforces aggressive pattern → Engine NU pedepsește dorința muncă, **REGLEAZĂ unsustainable pattern** (Source 1 + Source 4 line 720 verbatim attribution)

**B5 Final_Depth formula** (Source 1 line 16 verbatim):
- `Final_Depth = MAX(Scheduled 45%, Reactive 60%, Behavioral 30%) + Behavioral_Modifiers`
- Reactive overrides scheduled (60% > 45%) — confirm priority B2 hierarchy
- **Behavioral_Modifiers additive** (NU multiplicative — anti-cascade preserve consistent §1.10 Pipeline Order)
- Multi-signal NU dilutes severity, ADAUGĂ controls peste physiological depth (Source 4 line 721 verbatim)

**B6 Adaptive duration** (Source 1 line 16 verbatim):
- **Scheduled fix: 1 săpt** (calendar Linear Block Week 4)
- **Reactive adaptive: 1-2 săpt** cu **Flagged-only state qualifier** (Composite/AA trigger)

**B7 Reactive deload Hard Reset Linear Block counter** (Source 1 line 16 verbatim):
- Week N reactive deload triggered → **Week 1 NEW cycle post-deload**
- **Anti back-to-back scheduled Week 5** (Reactive Week 4 → Calendar Week 5 = double deload exploitation prevention)

**B8 Extension week 2 Flagged-only** (Source 1 line 16 verbatim):
- Reactive deload extended la 2 săpt **DOAR dacă Flagged state still active end-of-Week-1**
- **NU Cooldown / NU Resolving** state extension (anti false-positive deload prelungit per Source 4 line 724)

**B9 Extension depth preserve 60%** (Source 1 line 16 verbatim):
- Week 2 reactive deload **preserve 60% depth** (NU escalate 70%)
- **Atrophy literature limit** — extended depth >60% risc atrofie musculară (Schoenfeld/Helms canonical per Source 4 line 725)

**B10 Muscle-group-specific partial deload Hibrid** (Source 1 line 16 verbatim):
- **Full-body sistemic** trigger (Composite/AA cross-muscular signal) → deload uniform all muscle groups
- **Per-muscle MRV alone** trigger (single muscle volume landmarks exceeded per §9.1 Cluster 3 Volume Landmarks Israetel) → partial deload doar muscle group implicated

**B11 Frequency Same frequency lower volume default** (Source 1 line 16 + Source 4 line 727 verbatim):
- **Frequency reduce only Energy-driven** (NU default frequency cut)
- Volume primary mechanism deload (consistent B4 AA-driven volume CUT 30% precedent)

**B12 Periodization integration Hibrid** (Source 1 line 16 + Source 4 line 728 verbatim):
- **Scheduled INSIDE 4+1** (Linear Block calendar Week 4 per §9.1 Periodization Cluster 4)
- **Reactive OVERRIDES + Hard Reset** (B7 reactive trigger → Week 1 NEW cycle post-deload)

**B13 Engine Energy Adjustment trigger preservation §36.82.3** (Source 1 line 16 + Source 4 line 729 verbatim):
- Engine Energy sustained low readiness 3+ consecutive triggers Engine Deload evaluation
- §9.3 Engine Energy Adjustment readiness DOWN signal cross-engine Hook D3 (AA Detection candidate signal sustained pattern)

**B14 Marius 5:1 dual-signal extension cross-ref §9.1 Periodization** (Source 1 + Source 5 §36.82):
- Cross-ref §9.1 Cluster 2.3 — Marius EXTENSION (extends mesocycle past Week 4 fără DELOAD) requires **dual-signal green** (RIR stable 1-2 ALL 4 weeks AND Energy ZERO red last 3 sessions)
- §9.8 Engine Deload owns reactive deload SSOT — Periodization Constraint Object frozen consume signals, Deload emits final action

---

#### §9.8.3 Cluster C — Output Blueprint & UI Wording (~5 decisions Source 1 verbatim)

**C1 Schema Standard CDL `deload_metadata`** (Source 1 line 16 + Source 4 line 730 verbatim):
- CDL session entry schema: `deload_metadata: { state, depth_pct, duration_weeks, trigger_source, intensity_modifier, partial_scope, notification_tier, wording_variant }`
- **Output contract Hibrid:** flag + structured params consumed downstream Engine #1 multipliers (Source 4 line 731)

**C2 Notification tier-aware** (Source 1 line 16 + Source 4 line 732 verbatim):
- **T0 cold start:** silent (CDL log only, NU UI banner — anti-friction calibration window)
- **T1+ established:** banner detaliat rationale (UX explainer per trigger source)

**C3 Skip allowed all sources cu warning escalated severity** (Source 1 line 16 + Source 4 line 733 verbatim):
- Anti-paternalism graceful degradation ADR 025 — **skip allowed pe toate sursele de trigger** (Linear/Composite/AA/Energy)
- Wording warning escalated severity per trigger source (consistent Bugatti F4 zero forced friction + ADR 025 "Andura informează NU impune")

**C4 Skip penalties Hibrid** (Source 1 line 16 + Source 4 line 734 verbatim):
- **1× reactive urgent skip = AA marker direct ADR 013** (skip reactive deload = AA detection signal escalation)
- **2× scheduled skip = Composite sensitivity ↑ thresholds lower** (recurring scheduled skip = engine recalibrates Composite Signal §36.41 thresholds tighter)

**C5 Wording specific per source RO native** (Source 1 line 16 + Source 4 line 735 verbatim):
- **Linear:** *"săpt 5 recuperare programată"* (calendar scheduled Week 4 → Week 5 recovery announcement)
- **Composite:** *"corpul tău cere recovery"* (Composite Signal multi-metric trigger)
- **AA:** *"reglăm intensitatea — volumul a urcat agresiv"* (AA Detection autonomic arousal pattern)
- **Energy:** *"săpt asta lăsăm motorul să se odihnească"* (Energy Adjustment readiness sustained low 3+ consecutive)
- Anti-paternalism graceful degradation ADR 025 — wording explicit factual NU "trebuie să te odihnești" (Bugatti F4 zero forced friction)

**C6 Pre-Beta MANDATORY** (consistent §9.7 B5 precedent):
- Engine Deload MUST ship pre-Beta — **Bugatti injury safety > scope discipline** (consistency cu §9.7 Warm-up MANDATORY pre-Beta + Invariant 5 Medical Safety overarching)

---

#### §9.8.4 Cluster D — Cross-Engine Hooks (~7 decisions standard pattern)

**D1 Hook upstream consume frozen Constraint Object — Periodization §9.1** (Cluster A3 + §1.10 Pipeline Order):
- Read-only consume `phase` + `volume_per_muscle Floor/Ceiling` + `intensity_pct_1rm Floor/Ceiling` + **`deload_window`** (§9.1 emit field 5: `null | { trigger: 'EARLY_SAFETY' | 'EXTENSION_MARIUS' | 'CALENDAR', days: int }`)
- Periodization phase = DELOAD (W4) + `deload_window.trigger='CALENDAR'` → Engine Deload SCHEDULED_LINEAR state baseline -45% volume / -12.5% intensity §9.1 Cluster 2.1
- Periodization `deload_window.trigger='EARLY_SAFETY'` → Engine Deload REACTIVE_AA state escalate (Invariant 5 Medical Safety)
- Anti-cascade preserve — NU mutate upstream

**D2 Hook upstream consume — Goal Adaptation §9.2 phase context:**
- Goal Adaptation phase (CUT/BULK/MAINTAIN/RECOMP) light coupling — Deload depth modulation:
  - CUT preserve depth 60% (Marius retention pattern — anti-aggressive deload during deficit)
  - BULK Marius full classical 45% scheduled (recovery week classical per §9.1 Cluster 2.1)
  - MAINTAIN/RECOMP baseline preserved

**D3 Hook upstream consume — Energy Adjustment §9.3 readiness state:**
- Energy DOWN signal sustained 3+ consecutive → AA Detection trigger candidate (Source 2 ADR 013 cross-ref + B13 verbatim Source 1)
- AA Detection sustained pattern recurrent → REACTIVE_AA state Engine Deload escalate (consistent §9.3 Cluster D Energy Adjustment escalation chronic low readiness Hibrid timing-based per §9.3 internal precedent)

**D4 Hook upstream consume — Bayesian Nutrition §9.4 σ variance state + Pain-Aware §9.4.6:**
- σ high variance + Pain-Aware sessions ≥2 last 10 → safety override trigger candidate (Convergence Guard "T2 Unlock" reference §9.4.6)
- **NU duplicate Convergence Guard logic** — reference-only metadata pattern §9.4+§9.5+§9.6+§9.7 precedent (orchestrator layer evaluates actual T2 unlock per ADR 030 D5 + ADR 009 §AMENDMENT 2026-05-05 birou after canonical SSOT)

**D5 Hook upstream consume — Specialization §9.6 active state:**
- Specialization ACTIVE state + Engine Deload REACTIVE triggered → Specialization **suspended** (Cluster D2 DeloadPreservedSignal §9.6 verbatim Q12=A non-negotiable per §9.6 Cluster D2 emitDeloadPreserved precedent)
- Source preserved: Specialization mesocycle progress freeze, resume post-deload completion (consistent §9.6 Cluster B5 cooldown evaluation pattern)

**D6 Hook downstream signal — Warm-up §9.7 light coupling:**
- Engine Deload active → Warm-up routine **lighter** (DELOAD_LIGHTER state §9.7 D1 Hook precedent — recovery week, NU full ramp protocol Marius 50/70/90%)
- Anti-cascade preserve — Warm-up downstream consume Engine Deload emit, Engine Deload NU mutate Warm-up
- Note: Warm-up §9.7 sequentially upstream (7th vs 8th); D6 = retrospective light coupling — Engine Deload signal consumed by Warm-up next-session lookahead (orchestrator layer manages cross-cycle propagation)

**D7 forwardConstraintObject pass-through immutable:**
- Engine Deload = FINAL prescriptive engine pipeline §42.10 — **NU forward Constraint Object downstream V1** (Deload terminal, no engine 9th consumes)
- V1.5+ post-Beta candidate forward post-deload signal recovery telemetry (consistent §9.4 Bayesian forward pattern future ecosystem-wide alignment)

---

#### §9.8.5 Cluster E — Edge Cases / Telemetry / V1.5+ Deferrals (~5 decisions)

**E1 Pain-Aware §9.4.6 reference — Clean Signal rule preserved:**
- Engine Deload NU proactive Pain-Aware trigger (consistent §9.5+§9.6+§9.7 precedent — user-triggered Pain Button only Invariant 5 Medical Safety per ADR_PAIN_DISCOMFORT_BUTTON_v1)
- Pain Button user-triggered rapid 3+ sessions last 10 → AA Detection Source 2 candidate signal (orchestrator consume — Engine Deload reads metadata, NU acts proactively)

**E2 Medical-adjacent boundary** (consistent §9.7 E2 precedent):
- **NU corrective therapy / NU rehabilitation prescriptions individuale** — D2 v1.5 defer
- Anti-EU AI Act medical scope creep preserve (Bugatti F4 lifestyle recommendations boundary consistent §9.5+§9.6+§9.7 precedent)
- Passive Mode trigger (Source 1 line 16 verbatim + Source 4 line 736): **12-week rolling window inclusive ≤12w 2 reactive consecutive + medical referral** (mix scheduled+reactive ≠ trigger normal adaptation — separate medical-adjacent gate)

**E3 Telemetry CDL silent V1:**
- `deload_trigger_source` (composite/aa/linear/extension) + `deload_actual_depth_pct` + `deload_duration_actual_weeks` + `partial_scope_muscle_groups` (silent CDL metadata, NU UI surface)
- V1.5+ trend analysis Bayesian latent state ecosystem-wide alignment Q20=D consistent §9.4-§9.7 precedent

**E4 Validation Hibrid simulator + Beta cohort 50 testers** (Source 1 line 16 + Source 4 line 737 verbatim, consistent §9.4 + §9.5 + §9.6 + §9.7 Q19=B precedent):
- Simulator R²>0.85 pre-Beta (synthetic personas Hall 2008 metabolic adaptation literature)
- **Beta cohort 50 testers correlation perceived recovery rating** (post-Beta corroboration anti-overconfidence Mensa-grade)

**E5 V1.5+ Deferrals documented:**
- **Personalized deload depth per recovery profile** — Profile Typing tier T2+ data-driven (post-Beta ≥1000 sesiuni real data signal)
- **AA Detection ML model upgrade** — Source 2 ADR 013 V1 rule-based, V2+ ML latent state inference
- **Composite Signal threshold tuning** — Source 3 §36.41 initial estimates (Performance Drop 15% / Rest Time 1.5× / RIR Mismatch 2), A/B post-Beta Beta cohort 50 useri
- **Cooldown extended deload week post-Beta v1.5** — §9.7 Cluster C C3 cooldown extended candidate cross-ref (Schoenfeld stretching 5-10 min + foam rolling + parasympathetic activation)
- **Bayesian latent state v1.5 ecosystem-wide alignment Q20=D** consistent §9.4+§9.5+§9.6+§9.7 precedent timing post Engine #3 Bayesian R²>0.85 validation gate hold ≥6 luni post-Beta + ≥1000 sesiuni real data

---

#### §9.8.6 Reconsideration Triggers — Engine Deload V1 → V1.5 candidate

Revisit Cluster A-E LOCKED V1 → V1.5 candidate dacă (consistent §9.1.7 + §9.2.6 + §9.3.6 + §9.4.7 + §9.5.6 + §9.6.6 + §9.7.6 cadence pattern):

1. **Cluster B1+B2 False positive Reactive deload rate >5% post-Beta** — Composite Signal §36.41 thresholds tighten (Performance Drop 15% → 18% / Rest Time 1.5× → 1.7× / RIR Mismatch ≥2 → ≥3) per Source 3 reconsideration trigger 1
2. **Cluster B1 False negative platou nu detectat** — relax thresholds OR adaugă alternative trigger paths (sleep quality 4th metric Source 3 reconsideration trigger 1 — CDL `sleep_hours_per_night` field requirement)
3. **Cluster B14 Marius 5:1 dual-signal extension exploitation pattern detected** — tighten extension limit (currently max 2 consecutive §9.1 Cluster 2.3 anti-abuse — V1.5 candidate max 1 consecutive)
4. **Cluster B9 Atrophy literature limit revision** — Schoenfeld/Helms post-Beta meta-analysis update → adjust Extension depth preserve 60% (V1.5 candidate 55% sau 65% per data review)
5. **Cluster C3+C4 Skip penalty asymmetry post-Beta data** — 1× reactive urgent skip rate >20% Beta cohort cu injury rate elevated → tighten penalty (V1.5 candidate 1× skip = direct 12-week Composite cooldown)
6. **Cluster E2 Passive Mode 12-week window false trigger** — useri reali post-Beta raportează "Passive Mode prematur" semnal cu mix scheduled+reactive legitimate adaptation → adjust 12-week → 16-week rolling window
7. **EU AI Act 2025+ classification high-risk** — add explainability layer (WhyEngine integration each deload trigger Source 3 reconsideration trigger 4)
8. **CDL `rest_seconds_per_set` field absent** post-Beta data signal → fallback 2-metric Composite Source 3 reconsideration trigger 3
9. **Cluster D5 Specialization suspended cumulative duration excesivă** — Specialization frozen >4 săpt cumulative din cause Reactive Deload escalation chain → Specialization auto-exit COMPLETED_EXIT consistent §9.6 Q9=A 4-week mesocycle match

**Re-evaluation cadence:** post Faza 2.5 batch 8 implementation Engine Deload V1 + post-Beta useri reali signal aggregate (similar §9.1.7-§9.7.6 cadence pattern §1.8 Versioning Additive 18 luni deprecation window). Bugatti craft transparency = ship V1 cu Cluster A-E LOCKED + monitor post-Beta signal.

---

#### §9.8.7 Cross-refs Bidirectional ADR

- [[018-engine-extensibility-architecture|ADR 018]] §2 Standardized Dimension Contract — `evaluate(ctx) → DeloadResult` extending DimensionResult (purity preserved engine = pure function NU side effects, async-capable per DP-2)
- [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline Order LOCKED V1 — Deload **8th FINAL** în pipeline §42.10 (NU "Engine #4" naming legacy chat strategic spec session ordering 2026-05-05 birou after)
- [[013-auto-aggression-detection|ADR 013]] AA-driven deload mechanic Volume CUT 30% obligatoriu cross-ref Source 2 (path corrected anti-Slip 4 verified — `013-auto-aggression-detection.md` actual filename, NU `013-ADR-aa-detection.md` prompt slip)
- [[ADR_COMPOSITE_SIGNAL_LAYER_v1]] §36.41 hard-disabled când Engine Deload active anti math collision Source 3 cross-ref B3
- [[017-demographic-prior-database|ADR 017]] persona resolution Maria/Gigica/Marius cross-ref Cluster D2 phase modulation
- [[025-andura-gandeste-pentru-user|ADR 025]] graceful degradation engine pre-fills default — referenced Cluster C3+C5 anti-paternalism wording RO native specific per source
- [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" — tier-aware notification T0 silent / T1+ banner detaliat rationale Cluster C2 + Cluster D4 reference-only metadata
- [[030-adapter-design-pattern|ADR 030]] D1-D5 LOCKED V1 foundation Hexagonal — Phase 1-2 orchestrator foundation `src/coach/orchestrator/` LANDED commit `5a16550` reusable post Faza 2.5 batch 8 V1 implement
- [[ADR_PAIN_DISCOMFORT_BUTTON_v1]] Pain-Aware integration cross-cutting Convergence Guard "T2 Unlock" preserved §9.4.6 reference (Engine Deload NU proactive Pain-Aware trigger Clean Signal rule consistent §9.5+§9.6+§9.7 precedent — Cluster E1)
- §9.1 Engine #1 Periodization Constraint Object frozen Hook 1 read-only (`deload_window` emit field 5 consume primary D1 — `EARLY_SAFETY` / `EXTENSION_MARIUS` / `CALENDAR` trigger source dispatch)
- §9.2 Engine #2 Goal Adaptation phase context cross-ref Cluster D2 (CUT preserve depth 60% / BULK classical 45%)
- §9.3 Engine Energy Adjustment readiness state Hook D3 (sustained low readiness 3+ consecutive → AA Detection trigger candidate B13)
- §9.4 Engine Bayesian Nutrition Inference σ variance + Pain-Aware §9.4.6 Hook D4 (Convergence Guard reference-only metadata)
- §9.6 Engine Specialization §36.84 weaknessDetector + DeloadPreservedSignal Q12=A Hook D5 cross-ref (Specialization suspended când Engine Deload REACTIVE)
- §9.7 Engine Warm-up DELOAD_LIGHTER state Hook D6 light coupling (Warm-up downstream consume Engine Deload signal next-session lookahead)
- [[032-engine-deload-protocol|ADR 032]] 🔵 **SPEC REFERENCE NEW direct post-create `dccda1f` 2026-05-06 evening chat-9** (precedent reverse vs ADR 027/028/029 stub flip pattern — created direct cu SPEC REFERENCE redirect, NU intermediate STUB stage; consistent precedent ADR 031 Warm-up §9.7). ADR 032 redirects la §9.8 SSOT canonical. Filename per §36.95 Additive convention post `031-engine-warmup-mobility.md`.

---

## §AMENDMENT 2026-05-08 — ADR 030 §3.6 + §3.7 Q-OPEN RESOLVED V1 cross-ref §9.1-§9.8 engine adapters

ADR 030 §3.6 Q-OPEN-6 RESOLVED V1 2026-05-08 chat NEW birou — engine adapters per §9.1-§9.8 pipeline annotate emitted errs cu `severity: 'soft' | 'hard'` field per ADR 030 §3.6 taxonomy table:

| Engine spec section | Engine | Severity mapping per concrete failure scenario |
|---------------------|--------|------------------------------------------------|
| §9.1 | Periodization (Engine #1) | Constraint Object stale CDL corruption → **'hard'** (downstream cannot trust Floor/Ceiling baseline) |
| §9.2 | Goal Adaptation (Engine #2) | Big 6 lifecycle phase auto-detection ambiguous → **'soft'** (use template default per Q6 D Hybrid LOCKED V1) |
| §9.3 | Energy Adjustment (Engine #3 in pipeline §42.10) | Manual emoji absent (user skipped pre-session) → **'soft'** (use neutral 🟡 default per ADR 025) |
| §9.4 | Bayesian Nutrition (Engine #4 in pipeline §42.10) | Convergence corruption insufficient samples → **'soft'** (use prior per ADR 022 fallback alignment) |
| §9.5 | Tempo (Engine #5 in pipeline §42.10) | Form breakdown report processing error → **'soft'** (degrade default tempo per ADR 025 graceful) |
| §9.6 | Specialization (Engine #6 in pipeline §42.10) | Insufficient lagging detection data → **'soft'** (pre-fill no specialization per ADR 025) |
| §9.7 | Warm-up (Engine #7 in pipeline §42.10) | Mood + temperature missing → **'soft'** (use baseline routine per ADR 025) |
| §9.8 | Deload Protocol (Engine #8 FINAL in pipeline §42.10) | Composite trigger insufficient signals → **'soft'** (defer deload prescription) |

**Default fail-safe:** if engine adapter forgets `severity` field → orchestrator treats as `'hard'` (Anti-Cascade Silent default per ADR_CASCADE_DEFENSE_v1 §EXT-2 + ADR 030 §3.6).

**ADR 030 §3.7 Q-OPEN-7 RESOLVED V1** — Convergence Guard re-eval cadence orchestrator-level batch periodic per session-end (NOT per-session-tick), aligns CDL ADR 011 write cadence + reuses ADR 009 §AMENDMENT 2026-05-05 N=3 consecutive sessions Behavioral Validation Rule. Tier downgrade cooldown 7 zile minim derives ADR 022 Cluster B Cadence pattern (acest ADR 026 §9.4 referenced).

**ADR 030 §1.10 Pipeline Order LOCKED V1 + §3.4 Q-OPEN-4 RESOLVED V1 alignment confirm:** `runPipeline` `for (const adapter of adapters) await` sequential strict V1 preserved în `src/coach/orchestrator/index.js` `5a16550`. Constraint Object immutable propagation engine-to-engine via `EngineContext.meta` extension (Faza 3 batch 1 will populate). V1.5 candidate parallel-where-safe trigger (Tempo ⊥ Specialization, Warm-up ⊥ Deload) per ADR 030 §5.6 reconsideration threshold profiling >30% session-tick budget overhead.

*Amendment added 2026-05-08 chat NEW birou Run ADR 030 Q-OPEN-1→7 RESOLVED V1 batch.*

---

🦫 **§9.8 Engine Deload Protocol Module-Level Spec V1 compiled 2026-05-06 evening chat-8 acasă.** ZERO net new substantive decisions — aggregation only verbatim from chat strategic 2026-05-05 birou after sources (`148_HANDOVER_..._engines3-4-5_spec_sessions_CONSUMED.md` line 16 Engine #4 Deload Protocol section + `00-index/CURRENT_STATE.md` §RECENT 2026-05-05 birou after lines 715-737 + `03-decisions/013-auto-aggression-detection.md` cross-ref AA-driven mechanic + `03-decisions/ADR_COMPOSITE_SIGNAL_LAYER_v1.md` cross-ref §36.41 hard-disabled — **4-way parity check ✅ ZERO substantive divergence flagged**). ~32 decisions Cluster A-E cumulative (5+14+5+7+5 = 36 decisions structural decomposition, but Source 1 Engine #4 spec ~22 substantive bullet decisions verbatim + cross-ref Sources 2+3 derived Cluster D Hook integration + standard pattern Cluster A+E decomposition = ~32 effective consistent prompt expected ~26-32 range). **Pipeline §42.10 SPEC closure FINAL 8/8 prescriptive engines** — §9.8 spec compile = penultimate milestone. Pre Faza 2.5 batch 8 V1 implementation per Option A LOCKED 2026-05-06 morning chat-2 — pipeline §42.10 sequential post Engine Warm-up V1 LANDED commit `20999fb` (batch 7). Pattern Bugatti SSOT consistent §9.1 Engine #1 Periodization (`cd6d9a4`) + §9.2 Goal Adaptation (`6be84f8`) + §9.3 Energy Adjustment (`2f9aa79`) + §9.4 Bayesian Nutrition Inference (`685fdd4`) + §9.5 Tempo (`a9b7cbd`) + §9.6 Specialization (`92a69fd`) + §9.7 Warm-up (`c15ad0f`). Pipeline §42.10 position 8th canonical FINAL (NU "Engine #4" naming legacy chat strategic spec session ordering 2026-05-05 birou after 3-engine cluster). Source 4 [[032-engine-deload-protocol|ADR 032]] 🔵 SPEC REFERENCE NEW direct post-create `dccda1f` 2026-05-06 evening chat-9 — redirects la §9.8 SSOT canonical (precedent reverse vs ADR 027/028/029 stub flip pattern; filename per §36.95 Additive convention post `031-engine-warmup-mobility.md` §9.7). **Source 2 path slip resolved transparency:** prompt referenced `013-ADR-aa-detection.md` but actual filename `013-auto-aggression-detection.md` — anti-Slip 4 grep filesystem corrected. Faza 2.5 batch 8 second half = Engine Deload V1 implement `src/engine/deload/` pure-function module — pipeline §42.10 8/8 V1 implement closure complete post batch 8 LANDED.
