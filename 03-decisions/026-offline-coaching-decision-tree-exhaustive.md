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
