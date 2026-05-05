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
